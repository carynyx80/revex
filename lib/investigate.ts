import {NETWORKS,validateAddress,assertChain,rpc,inspectBytecode} from './analysis';
import {disassemble,behaviorEvidence} from './disassemble';
import {getDb} from '../db';
import {investigations} from '../db/schema';
export async function investigate(address:string,network:keyof typeof NETWORKS,log:(message:string)=>void=()=>{}){
 validateAddress(address);
 if(!NETWORKS[network])throw Error('Unsupported network');
 log('Checking Robinhood Chain identity');
 await assertChain(network);
 const block=await rpc(network,'eth_blockNumber',[]);
 log('Pinned evidence collection to block '+Number(block));
 const bytecode=await rpc(network,'eth_getCode',[address,block]);
 if(bytecode==='0x')throw Error('No deployed bytecode exists at this address on the selected network.');
 log('Retrieved '+((bytecode.length-2)/2)+' bytes of deployed code');
 const inspected=inspectBytecode(bytecode);
 const instructions=disassemble(bytecode);
 log('Disassembled '+instructions.length+' instructions; found '+inspected.selectors.length+' candidate selector constants');
 const slotId='0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
 let slot:string|null=null;
 try{slot=await rpc(network,'eth_getStorageAt',[address,slotId,block]);log('Read EIP-1967 implementation storage slot')}catch{log('Implementation slot read unavailable')}
 const result={id:crypto.randomUUID(),address,network,chainId:NETWORKS[network].id,blockNumber:Number(block),bytecode,...inspected,instructions,behaviorEvidence:behaviorEvidence(instructions),proxy:{delegatecallPresent:inspected.delegatecall,eip1967Implementation:slot&&/^0x0{24}[a-fA-F0-9]{40}$/.test(slot)&&BigInt(slot)!==BigInt(0)?'0x'+slot.slice(-40):null,storageReadAvailable:slot!==null},createdAt:new Date().toISOString(),warnings:['PUSH4 constants may include non-function values. Selector names are local candidate matches, not a verified ABI.','Disassembly may include compiler metadata and unreachable instructions. Opcode presence does not establish reachable behavior.','No full decompilation, protocol recovery validation, or indexed wallet discovery has been performed.']};
 try{await getDb().insert(investigations).values({id:result.id,address,network,evidence:JSON.stringify(result),createdAt:result.createdAt});log('Investigation committed to persistent storage')}catch{result.warnings.push('Database unavailable; this result has not been persisted.');log('Persistence unavailable; evidence remains available in this session')}
 return result;
}
