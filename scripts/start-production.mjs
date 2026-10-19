import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import path from 'node:path';
try{process.loadEnvFile('.dev.vars')}catch{}
if(!existsSync('dist-web/index.html'))throw Error('Run npm run build:web first.');
const children=[];let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;for(const child of children)child.kill('SIGTERM');process.exitCode=code;setTimeout(()=>process.exit(code),1500).unref()}
function run(command,args,env={}){const child=spawn(command,args,{stdio:'inherit',env:{...process.env,...env}});children.push(child);child.once('error',e=>{console.error(e.message);stop(1)});child.once('exit',code=>{if(!stopping)stop(code||1)});return child}
async function wait(url,seconds){for(let i=0;i<seconds*2;i++){if(stopping)throw Error('A required service stopped');try{if((await fetch(url,{headers:process.env.ENGINE_TOKEN?{Authorization:'Bearer '+process.env.ENGINE_TOKEN}:{},signal:AbortSignal.timeout(1000)})).ok)return}catch{}await new Promise(r=>setTimeout(r,500))}throw Error('Service did not become ready: '+url)}
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>stop());
try{
 const dataRoot=process.env.REVEX_DATA_DIR||'.revex';mkdirSync(dataRoot,{recursive:true});const key=path.join(dataRoot,'local-ai-key');if(!existsSync(key))writeFileSync(key,randomBytes(32).toString('hex'),{mode:0o600});
 if(!process.env.AI_API_KEY&&!process.env.LOCAL_AI_URL&&existsSync('work/engines/model.gguf')){const binary=path.resolve(process.env.LLAMA_BIN||'work/engines/llama/llama-b11742/llama-server');if(!existsSync(binary))throw Error('Local AI runtime missing; run npm run setup:engines');run(binary,['-m','work/engines/model.gguf','--host','127.0.0.1','--port','8082','-c','8192','-t',process.env.AI_THREADS||'4','--device','none','--fit','off','--no-kv-offload','--parallel','1','--jinja','--reasoning','off','--no-webui','--cors-origins','http://127.0.0.1:8788','--api-key-file',key]);await wait('http://127.0.0.1:8082/health',90)}
 run(process.execPath,['engine/server.mjs'],{ENGINE_HOST:'127.0.0.1'});await wait('http://127.0.0.1:'+(process.env.ENGINE_PORT||8788)+'/status',20);
 run(process.execPath,['engine/web-server.mjs'],{INTERNAL_ENGINE_URL:'http://127.0.0.1:'+(process.env.ENGINE_PORT||8788),WEB_HOST:process.env.WEB_HOST||'0.0.0.0'});await wait('http://127.0.0.1:'+(process.env.WEB_PORT||process.env.PORT||8080)+'/healthz',20);console.log('REVEX is ready for visitors on port '+(process.env.WEB_PORT||8080));
}catch(e){console.error(e.message);stop(1)}
