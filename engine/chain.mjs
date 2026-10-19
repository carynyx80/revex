import {isAddress} from 'viem';
export const NETWORKS=Object.freeze({mainnet:Object.freeze({id:4663,rpc:'https://rpc.mainnet.chain.robinhood.com'}),testnet:Object.freeze({id:46630,rpc:'https://rpc.testnet.chain.robinhood.com'})});
export function networkConfig(name){if(name!=='mainnet'&&name!=='testnet')throw Error('Robinhood Chain mainnet or testnet required');return NETWORKS[name]}
export function address(value){if(typeof value!=='string'||!isAddress(value,{strict:false}))throw Error('Invalid EVM address');return value.toLowerCase()}
export function bytes(value,max=16384){if(typeof value!=='string'||!/^0x(?:[a-fA-F0-9]{2})*$/.test(value)||value.length>max*2+2)throw Error('Invalid hexadecimal calldata');return value}
export async function jsonRpc(url,method,params=[],timeout=20000){const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(timeout)});if(!response.ok)throw Error(`RPC HTTP ${response.status}`);const data=await response.json();if(data.error)throw Error(data.error.message||'RPC error');if(data.result===undefined)throw Error('RPC result missing');return data.result}
export function chainRpc(network){const config=networkConfig(network);return {config,call:(method,params)=>jsonRpc(config.rpc,method,params)}}
export async function pinned(network){const rpc=chainRpc(network);if(Number(await rpc.call('eth_chainId',[]))!==rpc.config.id)throw Error('Upstream chain mismatch');const block=await rpc.call('eth_getBlockByNumber',['latest',false]);if(!block?.hash)throw Error('Could not pin an upstream block');return {...rpc,block}}
export function exactTransaction(input){return {from:address(input.from),to:address(input.to||input.address),data:bytes(input.data||'0x'),value:'0x0'}}
export function serialize(value){return JSON.stringify(value,(_,v)=>typeof v==='bigint'?v.toString():v)}
