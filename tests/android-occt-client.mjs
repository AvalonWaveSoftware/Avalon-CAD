import {topologyClient} from '../web/topology-client.mjs';
import {Worker,MessageChannel} from 'node:worker_threads';
import {androidOcct} from '../web/android-occt.mjs';
export function androidClient({budget=20000,desktop=false,legacy=false,rejectErrors=true,assets=null}={}){
 let next=0,fault=null,started=0,short=false;const logs=[],pending=new Map(),topologies=topologyClient();
 class BrowserWorker{
  constructor(url,{name}={}){started++;this.w=new Worker(new URL('./android-occt-thread.mjs',import.meta.url),{workerData:{name,fault,assetURL:assets?new URL('worker-android.js',assets).href:null}});if(fault!=='oom-repeat')fault=null;this.w.on('message',data=>this.onmessage?.({data}));this.w.on('error',error=>this.onerror?.(error));this.w.on('exit',code=>{if(!this.stopped)this.onerror?.(Error('exit '+code));});}
  postMessage(d,p){this.w.postMessage(d,p);}terminate(){this.stopped=true;this.w.terminate();}
 }
 const geometry=new Worker(new URL('./android-occt-thread.mjs',import.meta.url),{workerData:{bundle:legacy?'worker.js':desktop?'worker-sidecar.js':'worker-android.js',assetURL:assets?new URL(legacy?'worker.js':desktop?'worker-sidecar.js':'worker-android.js',assets).href:null}});
 const guard=desktop?{message:()=>false,close(){}}:androidOcct(geometry,{WorkerClass:BrowserWorker,Channel:MessageChannel});
 geometry.on('message',data=>{if(data.log){logs.push(data.log);return;}if(data.trap&&data.id===undefined){logs.push('wasm trap '+JSON.stringify(data.trap));return;}if(data.type==='occtBegin'&&short){data.deadline=Date.now()+budget;short=false;}if(guard.message(data))return;if(data.interim){pending.get(data.id)?.onInterim?.(data);return;}topologies.incoming(data);const p=pending.get(data.id);if(!p)return;pending.delete(data.id);data.error&&rejectErrors?p.reject(Error(data.error)):p.resolve(data);});
 geometry.on('error',e=>{for(const p of pending.values())p.reject(e);});
 return {run:(job,{onInterim}={})=>new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject,onInterim});geometry.postMessage(topologies.outgoing({...job,id}));}),fault:x=>{fault=x;short=true;},started:()=>started,logs,warmShapes:()=>geometry.postMessage({type:'warmShapes'}),close(){guard.close();geometry.terminate();}};
}
