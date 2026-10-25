// Test helper: a browser-style module Worker on Node worker_threads (postMessage with transfer lists, onmessage,
// onerror, terminate), for exercising web/export-3mf-pool.mjs and web/export-pool-worker.mjs outside a browser.
import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';
if(!isMainThread&&workerData?.webWorkerShim){
 globalThis.self=globalThis;self.postMessage=(m,t)=>parentPort.postMessage(m,t);parentPort.on('message',d=>self.onmessage?.({data:d}));
 await import(workerData.script);
}
export const live=new Set();
/** makeWorker(scriptURL) for createPool: scriptURL is a file: URL (or path) of a worker module. */
export function nodeWorker(script){
 const w=new Worker(new URL(import.meta.url),{workerData:{webWorkerShim:true,script:String(script)}});
 const wrapper={onmessage:null,onerror:null,onmessageerror:null,terminated:false,
  postMessage:(m,t)=>w.postMessage(m,t),terminate:()=>{wrapper.terminated=true;live.delete(wrapper);w.terminate();}};
 w.on('message',d=>wrapper.onmessage?.({data:d}));w.on('error',e=>wrapper.onerror?.({message:e.message,preventDefault(){}}));
 live.add(wrapper);return wrapper;
}
