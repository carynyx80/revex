import {randomUUID} from 'node:crypto';
import {inspectBytecode} from '../lib/analysis.ts';
import {disassemble,behaviorEvidence} from '../lib/disassemble.ts';
import {address,bytes,pinned,networkConfig} from './chain.mjs';
export function createWebApi({db,reply,readBody}){
 db?.exec('CREATE TABLE IF NOT EXISTS analyses(id TEXT PRIMARY KEY,owner TEXT NOT NULL,evidence TEXT NOT NULL,created_at TEXT NOT NULL);CREATE INDEX IF NOT EXISTS analyses_owner_created ON analyses(owner,created_at);');
 return async function webApi(req,res,pathname,owner){
  if(req.method==='GET'&&pathname==='/history'){const analyses=db?db.prepare('SELECT evidence FROM analyses WHERE owner=? ORDER BY created_at DESC LIMIT 100').all(owner).map(row=>JSON.parse(row.evidence)):[];reply(res,{analyses,storage:!!db,ai:!!process.env.AI_API_KEY,networks:{mainnet:{id:4663},testnet:{id:46630}}});return true}
  if(req.method!=='POST'||!['/analysis','/interface','/positions','/call'].includes(pathname))return false;
  const input=await readBody(req);
  if(pathname==='/analysis'){
   res.writeHead(200,{'Content-Type':'application/x-ndjson','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});const send=data=>{if(!res.destroyed)res.write(JSON.stringify(data)+'\n')};const log=message=>send({type:'log',at:new Date().toISOString(),message});
   try{const target=address(input.address);log('Checking Robinhood Chain identity');const source=await pinned(input.network);log('Pinned evidence collection to block '+Number(source.block.number));const bytecode=await source.call('eth_getCode',[target,source.block.number]);if(bytecode==='0x')throw Error('No deployed contract exists at this address on the selected network');bytes(bytecode,65536);const inspection=inspectBytecode(bytecode),instructions=disassemble(bytecode);log('Retrieved '+inspection.byteLength+' bytes and '+inspection.selectors.length+' candidate selectors');let slot=null;try{slot=await source.call('eth_getStorageAt',[target,'0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',source.block.number])}catch{log('Proxy storage read unavailable')}
   const result={id:randomUUID(),address:target,network:input.network,chainId:source.config.id,blockNumber:Number(source.block.number),blockHash:source.block.hash,bytecode,...inspection,instructions,behaviorEvidence:behaviorEvidence(instructions),proxy:{delegatecallPresent:inspection.delegatecall,eip1967Implementation:slot&&BigInt(slot)!==0n?'0x'+slot.slice(-40):null,storageReadAvailable:slot!==null},createdAt:new Date().toISOString(),warnings:['Selectors are bytecode constants; ABI types and behavior are not verified.','Disassembly may include compiler metadata and unreachable instructions. Use symbolic decompilation for additional inferred evidence.']};db?.prepare('INSERT INTO analyses(id,owner,evidence,created_at) VALUES(?,?,?,?)').run(result.id,owner,JSON.stringify(result),result.createdAt);log(db?'Investigation saved to your private session':'Analysis complete. Export this investigation to keep it; serverless history is not persisted.');send({type:'result',result})}catch(e){send({type:'error',message:e.message})}finally{res.end()}return true;
  }
  const source=await pinned(input.network);
  if(pathname==='/interface'){
   const target=address(input.address);
   if(input.action==='abi'){const host=input.network==='mainnet'?'https://robinhoodchain.blockscout.com':'https://explorer.testnet.chain.robinhood.com';const response=await fetch(host+'/api/v2/smart-contracts/'+target,{signal:AbortSignal.timeout(12000)});if(!response.ok||!response.headers.get('content-type')?.includes('json'))throw Error('The explorer cannot provide a verified ABI right now. Use symbolic decompilation or import an independently verified ABI.');const result=await response.json();if(!Array.isArray(result.abi))throw Error('No verified ABI is available for this contract');reply(res,{abi:result.abi,name:result.name,source:host});return true}
   if(input.action!=='read')throw Error('Unsupported interface operation');const data=bytes(input.data,8192);reply(res,{result:await source.call('eth_call',[{to:target,data},source.block.number]),block:Number(source.block.number)});return true;
  }
  if(pathname==='/positions'){
   const owner=address(input.wallet);if(!Array.isArray(input.tokens)||input.tokens.length>20)throw Error('Supply at most 20 token addresses');const tokens=await Promise.all(input.tokens.map(async value=>{const target=address(value);try{const result=await source.call('eth_call',[{to:target,data:'0x70a08231'+owner.slice(2).padStart(64,'0')},source.block.number]);if(!/^0x[0-9a-fA-F]{64}$/.test(result))throw Error('Not a standard uint256 balance response');return {address:target,rawBalance:BigInt(result).toString()}}catch(e){return {address:target,error:e.message}}}));reply(res,{wallet:owner,block:Number(source.block.number),nativeWei:BigInt(await source.call('eth_getBalance',[owner,source.block.number])).toString(),tokens,scope:'Explicit token reads at pinned state. Use indexed discovery to find additional token candidates.'});return true;
  }
  if(pathname==='/call'){
   if(input.action!=='simulate')throw Error('Unsupported read-only operation');const tx={from:address(input.from),to:address(input.address),data:bytes(input.data,8192),value:'0x0'};if(await source.call('eth_getCode',[tx.to,source.block.number])==='0x')throw Error('No deployed contract at target');const result=await source.call('eth_call',[tx,source.block.number]);const gas=await source.call('eth_estimateGas',[tx,source.block.number]);reply(res,{...tx,chainId:source.config.id,blockNumber:Number(source.block.number),returnData:result,gasEstimate:gas,simulatedAt:new Date().toISOString(),limitations:'Read-only eth_call. Run isolated fork simulation for traces and tracked asset changes.'});return true;
  }
  return false;
 }
}
