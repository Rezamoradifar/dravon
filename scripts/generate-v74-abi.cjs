const fs=require('fs'),path=require('path');
const solc=require('solc');
const root=process.cwd()+'/contracts/source/v7.4';
const sources={};function walk(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,f.name);if(f.isDirectory())walk(full);else if(f.name.endsWith('.sol'))sources[path.relative(root,full)]={content:fs.readFileSync(full,'utf8')};}}walk(root);
const result=JSON.parse(solc.compile(JSON.stringify({language:'Solidity',sources,settings:{optimizer:{enabled:true,runs:500},viaIR:true,evmVersion:'london',outputSelection:{'*':{'*':['abi']}}}})));
for(const e of result.errors??[])console.log(e.formattedMessage);if((result.errors??[]).some(e=>e.severity==='error'))process.exit(1);
const ts=require(process.cwd()+'/node_modules/typescript');const vm=require('vm');
for(const [file,source,name] of [['factoryAbi','SmartContract','SmartContract'],['roundWindowAbi','Window','SmartContractWindow'],['weeklyWindowAbi','WeeklyWindow','WeeklyWindow']]){
 const context={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(`contracts/${file}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
 const old=context.exports[file];const abi=result.contracts[`contracts/${source}.sol`][name].abi;
 const names=new Set(old.filter(e=>e.name).map(e=>e.name));
 for(const entry of old){if(entry.type==='function'&&!abi.some(e=>e.name===entry.name))console.log('REMOVED',file,entry.name)}
 const subset=abi.filter(e=>e.type==='error'||e.type==='event'||(e.type==='function'&&names.has(e.name)));
 if (file === 'roundWindowAbi') {
  for (const e of result.contracts['contracts/SmartContract.sol'].SmartContract.abi.filter(e => e.type === 'error')) {
   if (!subset.some(x => x.type === 'error' && x.name === e.name)) subset.push(e);
  }
 }
 fs.writeFileSync(`contracts/${file}.ts`,`// Generated from the supplied v7.4 Solidity sources with solc ${solc.version()}.\n// Read fragments used by this dapp, plus all events/errors.\nexport const ${file} = ${JSON.stringify(subset,null,2)} as const;\n`);
 console.log(file,subset.length,'fragments verified against source');
}
