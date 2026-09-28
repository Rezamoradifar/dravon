const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, mocks = {}) {
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const context = { exports: {}, require: name => name in mocks ? mocks[name] : require(name) };
  vm.runInNewContext(js, context); return context.exports;
}
const rules = load('lib/contract-v74.ts');
const usd = n => BigInt(n) * 10n ** 18n;
assert.equal(rules.canPayOffInstallment(50, usd(44)), true);
assert.equal(rules.canPayOffInstallment(50, 1n), true); // partially repaid debt still qualifies
for (const [entrance, debt] of [[50,0n],[100,usd(44)],[10,usd(44)],[50,undefined]])
  assert.equal(rules.canPayOffInstallment(entrance,debt),false);
assert.equal(rules.canTopUp(10,50,usd(44)),false);
assert.equal(rules.canTopUp(100,50,usd(44)),true);
assert.equal(rules.canTopUp(100,100,usd(44),usd(1050),usd(1000),0n),false);
assert.equal(rules.canTopUp(100,100,0n,usd(999),usd(1000),1n),true);
assert.equal(rules.canTopUp(100,100,0n,usd(999),usd(1000),2n),false);
assert.equal(rules.canTopUp(100,100,0n,usd(1000),usd(1000),0n),false);
assert.equal(load('lib/packages.ts').tierCostUsd(50),55);
const zero = rules.historyRange(0,9,0n);
assert.equal(zero.oldest,0n);assert.equal(zero.newest,0n);
const partial = rules.historyRange(0,30,2n);
assert.equal(partial.oldest,2n);assert.equal(partial.newest,0n);
assert.equal(rules.clampRoundsAgo(100,2n),2n);
assert.equal(rules.clampRoundsAgo(-1,2n),0n);
const factory = load('contracts/factoryAbi.ts');
const windowAbi = load('contracts/roundWindowAbi.ts');
assert.equal(factory.factoryAbi.find(x=>x.name==='_userTopupsSinceFlash').outputs[0].type,'uint256');
assert(windowAbi.roundWindowAbi.some(x=>x.type==='event'&&x.name==='ToppedUp'));
assert(windowAbi.roundWindowAbi.some(x=>x.type==='function'&&x.name==='resetWalletAddress'));
// Exercise actual history hooks: factory bounds, not the window id, determine calldata.
let captured;
const address = '0x1111111111111111111111111111111111111111';
const historyMocks = {
  wagmi: { useReadContract: args => { captured=args; return {data:undefined}; } },
  '@/contracts/roundWindowAbi':windowAbi,
  '@/contracts/addresses':{CHAIN_ID:56},
  '@/hooks/useLatestRoundWindow':{useLatestRoundWindow:()=>({address})},
  '@/hooks/useRoundCounter':{useRoundCounter:()=>({data:2n})},
  '@/lib/contract-v74':rules,
};
load('hooks/useUserRoundInfo.ts',historyMocks).useUserRoundInfo(address,0,30);
assert.equal(captured.args[1],2n);assert.equal(captured.args[2],0n);
load('hooks/useMainBulkInfo.ts',historyMocks).useMainBulkInfo(40);
assert.equal(captured.args[0],2n);
// Exercise the actual write boundary with a mocked wallet/RPC: no real transactions.
let chain=56, latest=address, sent=0, simulated=0, invalidate=0, rejectSimulation=false;
const config={CHAIN_ID:56,CONTRACTS_CONFIGURED:true,FACTORY_ADDRESS:address};
const client={readContract:async()=>latest, simulateContract:async()=>{simulated++;if(rejectSimulation)throw Error('InvalidTopupTarget');},waitForTransactionReceipt:async()=>({status:'success'})};
const noop=()=>{};
const writeMocks={
  react:{useState:x=>[x,noop]}, sonner:{toast:{loading:noop,error:noop,success:noop}},
  wagmi:{useAccount:()=>({address}),useChainId:()=>chain,useChains:()=>[{id:56}],usePublicClient:()=>client,
    useWriteContract:()=>({writeContractAsync:async args=>{assert.equal(args.chainId,56);sent++;return '0x123';},reset:noop}),useWaitForTransactionReceipt:()=>({})},
  '@/contracts/addresses':config,'@/contracts/factoryAbi':factory,'@/contracts/roundWindowAbi':windowAbi,
  '@tanstack/react-query':{useQueryClient:()=>({invalidateQueries:async()=>{invalidate++;}})},
  '@/hooks/useLatestRoundWindow':{useLatestRoundWindow:()=>({address})},
  '@/lib/errors':{parseContractError:e=>e.message},'@/lib/format':{explorerTxLink:noop},
  '@/lib/confetti':{fireConfetti:noop},'@/lib/haptics':{vibrate:noop},'@/lib/voice':{speakWelcome:noop},
  '@/lib/notifications':{pushNotification:noop},'@/hooks/useActivityLog':{logActivity:noop,updateActivityStatus:noop},
};
const hook=load('hooks/useContractWrite.ts',writeMocks).useContractWrite;
(async()=>{
 config.CONTRACTS_CONFIGURED=false;await assert.rejects(hook('chargeAccount').execute([50]),/not configured/);
 config.CONTRACTS_CONFIGURED=true;chain=1;await assert.rejects(hook('chargeAccount').execute([50]),/Switch/);
 chain=56;latest='0x2222222222222222222222222222222222222222';
 await assert.rejects(hook('chargeAccount').execute([50]),/window changed/);
 assert.equal(sent,0);
 latest=address;rejectSimulation=true;await assert.rejects(hook('chargeAccount').execute([10]),/InvalidTopupTarget/);
 assert.equal(sent,0);
 rejectSimulation=false;await hook('chargeAccount').execute([50]);assert.equal(sent,1);assert.equal(simulated,2);assert(invalidate>=2);
 console.log('v7.4 eligibility, history bounds, ABI, chain, rollover and write simulation tests passed');
})().catch(error=>{console.error(error);process.exitCode=1;});
