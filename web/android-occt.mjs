import {OCCT_JOB_BUDGET_MS} from './perf-flags.mjs';
// Pending approval: Android safety stages (pending Master Chief).
export const OCCT_STOPPED="This was too heavy to finish on this device, so it was stopped. Your model wasn't changed.";
// Main owns the lifetime; only the first real OCCT miss starts a worker. The ports carry WS14 packets unchanged.
export function androidOcct(geometry,{WorkerClass=Worker,Channel=MessageChannel,budget=OCCT_JOB_BUDGET_MS,url=new URL('worker-android.js?v=3.0.0',import.meta.url)}={}){
 let worker=null,port=null,generation=0;const pending=new Map();
 function connect(){const c=new Channel();port=c.port2;geometry.postMessage({type:'occtPort',port:c.port1,generation:++generation},[c.port1]);}
 function fail(retry=false){const old=worker;worker=null;old?.terminate();port?.close();for(const timer of pending.values())clearTimeout(timer);pending.clear();geometry.postMessage({type:'occtFailed',generation,error:OCCT_STOPPED,retry});connect();}
 connect();
 return {message(data){if(data.generation!==generation)return false;
  if(data.type==='occtRecycle'){worker?.terminate();worker=null;port?.close();for(const t of pending.values())clearTimeout(t);pending.clear();connect();return true;}
  if(data.type==='occtFault'){fail(!!data.retry);return true;}
  if(data.type==='occtBegin'){
   if(!worker){try{worker=new WorkerClass(url,{type:'module',name:'occt'});const current=worker;const crash=()=>{if(worker===current)fail();};worker.onerror=crash;worker.onmessageerror=crash;worker.postMessage({type:'occtPort',port},[port]);port=null;}catch{fail();return true;}}
   const epoch=generation;pending.set(data.id,setTimeout(()=>{if(generation===epoch)fail();},Math.max(0,Math.min(data.deadline-Date.now(),budget))));return true;
  }
  if(data.type==='occtEnd'){clearTimeout(pending.get(data.id));pending.delete(data.id);return true;}return false;
 },close(){worker?.terminate();port?.close();for(const t of pending.values())clearTimeout(t);pending.clear();}};
}
