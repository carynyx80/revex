import {inspectAccount,walletPositions,simulate,CLUSTERS} from './rpc.mjs';
export function createWebApi({reply,readBody}){return async(req,res,path)=>{
 if(req.method==='GET'&&path==='/history'){reply(res,{analyses:[],storage:false,chain:'Solana',networks:Object.keys(CLUSTERS)});return true}
 if(req.method!=='POST'||!['/analysis','/positions','/call','/interface'].includes(path))return false;
 const input=await readBody(req);if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Send a JSON object');
 if(path==='/analysis'||path==='/interface')reply(res,await inspectAccount(input.network,input.address));
 if(path==='/positions')reply(res,await walletPositions(input.network,input.wallet));
 if(path==='/call')reply(res,await simulate(input.network,input.transaction));return true;
}}
