import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import handler from '../api/gateway.js';
test('Vercel routing exposes honest status and rejects unavailable native jobs',async()=>{
 const server=http.createServer(handler);await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{
  let response=await fetch(base+'/api/gateway?route=revex');let data=await response.json();assert.equal(data.storage,false);assert.deepEqual(data.analyses,[]);
  response=await fetch(base+'/api/gateway?route=engine&path=/status');data=await response.json();assert.equal(data.engine,false);assert.equal(data.ai,null);
  response=await fetch(base+'/api/gateway?route=engine&path=/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(response.status,503);
  response=await fetch(base+'/api/gateway?route=investigate',{method:'POST',headers:{'Content-Type':'application/json',origin:'https://untrusted.example'},body:'{}'});assert.equal(response.status,403);
  response=await fetch(base+'/api/gateway?route=unknown');assert.equal(response.status,404);
 }finally{await new Promise(r=>server.close(r))}
});
