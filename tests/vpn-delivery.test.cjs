const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = process.cwd();
function load(file, mocks) {
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, require: name => mocks[name] ?? require(name), process, Date });
  return exports;
}
const wallet = '0x' + 'a'.repeat(40);
let account, calls, fail, wait;
const store = {
  getAccount: async () => account,
  addDevice: async (_, device) => (account = { ...account, devices: [...account.devices, device] }),
};
const { deliverNextDevice } = load('lib/vpn/delivery.ts', {
  '@/lib/vpn/store': store,
  '@/lib/vpn/provision': { provisionDevice: async () => {
    calls++;
    if (wait) await wait;
    return fail ? { ok: false, error: 'offline' } : { ok: true, device: { id: 'device', config: 'subscription' } };
  } },
});
test('paid delivery recovery', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vpn-delivery-'));
  process.chdir(dir);
  const reset = () => {
    account = { paidDeviceCount: 1, devices: [], expiresAt: new Date(Date.now() + 86400000).toISOString(), backend: 'marzban', payments: ['original-payment'] };
    calls = 0; fail = false; wait = undefined;
  };
  try {
    await t.test('no purchase means no provisioning', async () => { reset(); account = undefined; assert.equal((await deliverNextDevice(wallet)).ok, false); assert.equal(calls, 0); });
    await t.test('retries without recording another payment; completed retry is a no-op', async () => {
      reset(); assert.equal((await deliverNextDevice(wallet)).ok, true);
      assert.equal((await deliverNextDevice(wallet)).ok, true);
      assert.equal(calls, 1); assert.deepEqual(account.payments, ['original-payment']); assert.equal(account.devices.length, 1);
    });
    await t.test('failed delivery releases lock and remains retryable', async () => {
      reset(); fail = true; assert.equal((await deliverNextDevice(wallet)).ok, false); assert.equal(account.devices.length, 0);
      fail = false; assert.equal((await deliverNextDevice(wallet)).ok, true);
    });
    await t.test('concurrent requests cannot provision the same slot twice', async () => {
      reset(); let release; wait = new Promise(r => { release = r; });
      const first = deliverNextDevice(wallet);
      while (!calls) await new Promise(r => setImmediate(r));
      assert.equal((await deliverNextDevice(wallet.toUpperCase().replace('0X', '0x'))).ok, false);
      release(); await first; assert.equal(calls, 1);
    });
    await t.test('expired subscription cannot create a fresh device', async () => {
      reset(); account.expiresAt = new Date(0).toISOString(); assert.equal((await deliverNextDevice(wallet)).ok, false); assert.equal(calls, 0);
    });
    await t.test('wallet authentication gates delivery', async () => {
      let deliveries = 0;
      const { POST } = load('app/api/vpn/my-account/route.ts', {
        'next/server': { NextResponse: { json: (body, opts) => ({ body, status: opts?.status ?? 200 }) } },
        viem: { isAddress: () => true },
        '@/lib/vpn/walletAuth': { verifyWalletSignature: async () => ({ ok: false, error: 'Invalid signature' }) },
        '@/lib/vpn/delivery': { deliverNextDevice: async () => { deliveries++; } },
        '@/lib/vpn/store': store,
      });
      const response = await POST({ json: async () => ({ address: wallet, timestamp: Date.now(), signature: 'bad', retryDelivery: true }) });
      assert.equal(response.status, 401); assert.equal(deliveries, 0);
    });
  } finally { process.chdir(root); fs.rmSync(dir, { recursive: true, force: true }); }
});
