import {createWebApi} from '../engine/web-api.mjs';
import {readJsonBody,makeRateLimiter} from '../engine/http-security.mjs';
const limit=makeRateLimiter({limit:20}); // Per-instance protection; not a distributed quota.
function reply(res,data,status=200){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data))}
// Serverless mode deliberately has no filesystem database or cross-request private records.
const webApi=createWebApi({db:null,reply,readBody:async req=>{
 if(req.body!==undefined){
  if(!req.headers['content-type']?.startsWith('application/json'))throw Error('Send JSON content');
  const encoded=typeof req.body==='string'?req.body:JSON.stringify(req.body);
  if(Buffer.byteLength(encoded)>32768)throw Error('Request exceeds 32768 bytes');
  const value=typeof req.body==='string'?JSON.parse(req.body):req.body;
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Send a JSON object');
  return value;
 }
 return readJsonBody(req);
}});
export default async function handler(req,res){
 try{
  const url=new URL(req.url,'https://'+req.headers.host);
  const routed=url.searchParams.get('route');
  const pathname=routed?'/api/'+routed:url.pathname;
  if(!['GET','POST'].includes(req.method))return reply(res,{error:'Method not allowed'},405);
  if(req.headers.origin&&req.headers.origin!=='https://'+req.headers.host&&req.headers.origin!=='http://'+req.headers.host)return reply(res,{error:'Cross-origin request rejected'},403);
  if(pathname==='/api/engine'){
   const target=url.searchParams.get('path')||'/status';
   if(req.method==='GET'&&target==='/status')return reply(res,{engine:false,decompiler:false,fork:false,ai:null,indexer:false,queued:0,auditStatus:'No independent audit',deployment:'Vercel read-only mode',error:'Native engines require a separate persistent service. Run the full application locally for these features.'});
   if(req.method==='GET'&&target==='/jobs')return reply(res,[]);
   return reply(res,{error:'This Vercel deployment supports read-only contract analysis. Native AI, decompilation, indexed discovery, fork simulation and guarded recovery require the separate engine service.'},503);
  }
  if(req.method==='POST'){
   const allowance=limit(String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown'));
   if(!allowance.allowed){res.setHeader('Retry-After',allowance.retryAfter);return reply(res,{error:'Too many requests; retry in a minute.'},429)}
  }
  const target={'/api/revex':req.method==='GET'?'/history':'/call','/api/investigate':'/analysis','/api/interface':'/interface','/api/positions':'/positions'}[pathname];
  if(!target||!await webApi(req,res,target,'serverless'))return reply(res,{error:'Unknown API route'},404);
 }catch(error){if(!res.headersSent)reply(res,{error:error.message||'Request failed'},400);else res.end()}
}
