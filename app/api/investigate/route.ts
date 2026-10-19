import {investigate} from '../../../lib/investigate';
export async function POST(request:Request){
 if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Cross-origin request rejected'},{status:403});
 let body:any;try{const raw=await request.text();if(raw.length>1024)throw Error('Request too large');body=JSON.parse(raw)}catch{return Response.json({error:'Invalid investigation request'},{status:400})}
 const encoder=new TextEncoder();let closed=false;
 const stream=new ReadableStream({async start(controller){const send=(data:unknown)=>{if(!closed)controller.enqueue(encoder.encode(JSON.stringify(data)+'\n'))};try{send({type:'log',at:new Date().toISOString(),message:'Investigation accepted'});const result=await investigate(body.address,body.network,message=>send({type:'log',at:new Date().toISOString(),message}));send({type:'result',result})}catch(e:any){send({type:'error',message:e.message||'Analysis dependency unavailable'})}finally{if(!closed)controller.close()}},cancel(){closed=true}});
 return new Response(stream,{headers:{'Content-Type':'application/x-ndjson','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
