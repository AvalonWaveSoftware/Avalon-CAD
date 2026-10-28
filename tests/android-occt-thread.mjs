import './import-3mf-platform.mjs';
// Browser worker adapter: run the actual shipping Android bundle, including its WS14 handler, under Node.
import {parentPort,workerData,Worker as NodeWorker} from 'node:worker_threads';
import fs from 'node:fs/promises';
globalThis.self=globalThis;self.name=workerData.name||'';self.location=workerData.assetURL?new URL(workerData.assetURL):new URL('../app/assets/'+(workerData.bundle||'worker-android.js'),import.meta.url);
globalThis.Worker=class{constructor(url,{name}){this.w=new NodeWorker(new URL('./android-occt-thread.mjs',import.meta.url),{workerData:{name,bundle:'worker-sidecar.js'}});this.w.on('message',data=>this.onmessage?.({data}));this.w.on('error',e=>this.onerror?.(e));}postMessage(d,p){this.w.postMessage(d,p);}terminate(){this.w.terminate();}};
self.postMessage=(data,ports)=>parentPort.postMessage(data,ports);
const nativeFetch=globalThis.fetch;globalThis.fetch=async(url,options)=>String(url).startsWith('file:')?new Response(await fs.readFile(new URL(url)),{headers:{'Content-Type':'application/wasm'}}):nativeFetch(url,options);
let listener;self.addEventListener=(type,fn)=>{if(type==='message')listener=fn;};
parentPort.on('message',data=>{
 if(data.type==='occtPort'&&self.name==='occt'&&workerData.fault){const port=data.port;port.onmessage=({data})=>{if(workerData.fault==='crash')throw Error('Forced OCCT crash');if(workerData.fault==='close')process.exit(0);if(workerData.fault.startsWith('oom'))port.postMessage({id:data.id,answer:{error:{isError:true,name:'RuntimeError',message:'memory access out of bounds'}}});};return;}
 (listener||self.onmessage)({data});
});
await import(self.location.href);
