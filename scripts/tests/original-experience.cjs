const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
function load(file, overrides = {}, context = {}) {
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  require('node:vm').runInNewContext(source, { exports: module.exports, module, require: (name) => overrides[name] ?? require(name), Date, URLSearchParams, AbortSignal, ...context }, { filename: file });
  return module.exports;
}
const { parseNativeAmount, registrationStatus } = load('lib/payment-validation.ts');
for (const input of ['', '0', '-1', '1e3', 'NaN', 'Infinity', '0.1234567890123456789', '1..2']) assert.equal(parseNativeAmount(input), undefined, input);
assert.equal(parseNativeAmount('0.000000000000000001'), 1n);
assert.equal(parseNativeAmount('1.25'), 1250000000000000000n);
assert.equal(registrationStatus(false), false);
assert.equal(registrationStatus(true), true);
for (const value of [undefined, null, 0, 'false', {}]) assert.equal(registrationStatus(value), undefined);
const { countSubtreeMembers } = load('lib/binary-tree.ts');
const zero = require('viem').zeroAddress;
assert.equal(countSubtreeMembers(['root', 'left', zero, 'leaf'], 0), 3);
assert.equal(countSubtreeMembers(['root'], -1), 0);
const { mergeActivity } = load('lib/activity-history.ts');
const pending = { hash: '0xABC', chainId: 56, timestamp: 2, status: 'pending' };
const confirmed = { ...pending, hash: '0xabc', status: 'confirmed', timestamp: 1 };
assert.equal(mergeActivity([pending], [confirmed])[0].status, 'confirmed');
assert.equal(mergeActivity([{ ...pending, chainId: undefined }], [confirmed]).length, 1);
assert.equal(mergeActivity([pending, { ...pending, chainId: 1 }], [confirmed]).length, 2);
assert.equal(mergeActivity(Array.from({ length: 20 }, (_, i) => ({ ...pending, hash: String(i), timestamp: i })), []).length, 10);
(async () => {
  const successes = [], activity = [], writes = [];
  let chainId = 56, receiptStatus = "reverted", release;
  let deferred = false;
  const client = { waitForTransactionReceipt: async () => {
    if (deferred) await new Promise((resolve) => { release = resolve; });
    return { status: receiptStatus };
  } };
  const mockReact = { useRef: (value) => ({ current: value }), useState: (value) => [value, () => {}], useEffect: () => {} };
  const mockWagmi = {
    useAccount: () => ({ address: '0x1111111111111111111111111111111111111111' }),
    useChainId: () => chainId, useChains: () => [{ id: 56 }], usePublicClient: () => client,
    useWriteContract: () => ({ writeContractAsync: async (args) => { writes.push(args); return '0xabc'; }, reset: () => {} }),
    useWaitForTransactionReceipt: () => ({ isSuccess: true, data: { status: receiptStatus } }),
    useReadContract: () => ({ data: 0n, refetch: async () => {} }),
  };
  const overrides = {
    react: mockReact, wagmi: mockWagmi,
    sonner: { toast: { loading: () => 1, success: (...args) => successes.push(args), error: () => {} } },
    '@/lib/wagmi': { PRIMARY_CHAIN_ID: 56 },
    '@/contracts/roundWindowAbi': { roundWindowAbi: [] },
    '@/contracts/pancakeRouterAbi': { erc20FullAbi: [] },
    '@/lib/payment-validation': { parseNativeAmount },
    '@/lib/errors': { parseContractError: String },
    '@/lib/format': { explorerTxLink: () => undefined },
    '@/lib/confetti': { fireConfetti: () => {} },
    '@/lib/haptics': { vibrate: () => {} },
    '@/lib/voice': { speakWelcome: () => {} },
    '@/lib/notifications': { pushNotification: () => {} },
    '@/hooks/useActivityLog': { logActivity: (entry) => activity.push(entry), updateActivityStatus: (hash, status) => activity.push({ hash, status }) },
    '@/hooks/useNativePrice': { useNativePrice: () => ({ price: 600 }) },
    '@/hooks/useLatestRoundWindow': { useLatestRoundWindow: () => ({ address: '0x2222222222222222222222222222222222222222', isConfirmed: true, isError: false }) },
  };
  const { useContractWrite } = load('hooks/useContractWrite.ts', overrides);
  const reverted = useContractWrite('begin');
  assert.equal(reverted.isConfirmed, false, 'a mined revert is not a successful transaction');
  assert.equal(await reverted.execute([50]), null);
  assert.equal(successes.length, 0);
  assert.equal(activity.at(-1).status, 'failed');
  receiptStatus = 'success'; deferred = true;
  const operation = useContractWrite('chargeAccount');
  const first = operation.execute([100]);
  await Promise.resolve();
  assert.equal(await operation.execute([100]), null, 'duplicate submit blocked');
  release(); await first;
  assert.equal(writes.length, 2, 'only one write per operation');
  assert.equal(activity.at(-1).status, 'confirmed');
  chainId = 1;
  await assert.rejects(useContractWrite('begin').execute([50]), /project network/);
  assert.equal(writes.length, 2, 'wrong network does not write');
  chainId = 56; deferred = false; receiptStatus = 'reverted';
  const { useTokenPayment } = load('hooks/useTokenPayment.ts', overrides);
  const successCount = successes.length;
  await assert.rejects(useTokenPayment(55, '0x3333333333333333333333333333333333333333', '0x2222222222222222222222222222222222222222').approve(), /reverted/);
  assert.equal(writes.at(-1).args[1], 55000000000000000000n, 'approval is limited to required payment');
  assert.equal(successes.length, successCount, 'reverted approval never reports success');
  let calls = 0, fail = false, invalid = false;
  const feed = Object.fromEntries(['bitcoin', 'ethereum', 'binancecoin', 'solana', 'ripple', 'dogecoin'].map((id) => [id, { usd: 12, usd_24h_change: null, last_updated_at: Date.now() / 1000 }]));
  let now = Date.now();
  class Clock extends Date { static now() { return now; } }
  const route = load('app/api/market/route.ts', { '@/lib/market-feed': load('lib/market-feed.ts'), 'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } } }, {
    Date: Clock,
    fetch: async () => { calls++; await Promise.resolve(); if (fail) throw new Error('offline'); return { ok: true, json: async () => invalid ? {} : feed }; },
  });
  const responses = await Promise.all([route.GET(), route.GET(), route.GET()]);
  assert.equal(calls, 1, 'concurrent requests deduplicate');
  assert.equal(responses[0].body.quotes.length, 6);
  assert.equal(responses[0].body.quotes[0].change, null);
  assert.equal(responses[0].body.stale, false);
  now += 31000; fail = true;
  assert.equal((await route.GET()).body.stale, true, 'cached prices explicitly stale after outage');
  const empty = load('app/api/market/route.ts', { '@/lib/market-feed': load('lib/market-feed.ts'), 'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } } }, { fetch: async () => ({ ok: true, json: async () => ({}) }) });
  assert.equal((await empty.GET()).status, 503, 'invalid data never becomes a price');
  console.log('Passed: payment input, unknown registration, tree bounds, chain-aware history, market cache/outage/validation, reverted receipts, duplicate submit, wrong network, bounded approval.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
