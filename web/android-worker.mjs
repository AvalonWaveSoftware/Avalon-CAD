// Android transport adapter for the unchanged, fixed-true WS14 bundle. Main supplies both ports and owns OCCT's
// lifetime. No nested browser Worker is constructed; WS14 requests, answers, deduplication and caches are unchanged.
import {OCCT_JOB_BUDGET_MS} from './perf-flags.mjs';
globalThis.__avalonAndroidWorker=self.name!=='occt';
let handler=null,port=null,generation=0,client=null,warmAsked=false,warmed=false;const queued=[];
const send=self.postMessage.bind(self);
function receive(event){const data=event.data;
 if(data.type==='occtPort'){
  port=data.port;generation=data.generation;
  if(self.name==='occt'){
   // OCCT init is paid only after main transfers the port on the first cache miss.
   self.postMessage=(data,transfers)=>port.postMessage(data,transfers);
   port.onmessage=event=>handler?handler(event):queued.push(event);
   import('./worker-sidecar.js');
  }else client?.attach();return;
 }
 if(data.type==='occtFailed'){
  if(data.generation===generation)client?.fail(data.error,data.retry);return;
 }
 // Warm-up never starts OCCT on Android. Only an actual miss constructs the port client below.
 if(data.type==='warmShapes'){warmAsked=true;return;}if(data.type==='warm')return;
 if(handler)handler(event);else queued.push(event);
}
Object.defineProperty(self,'onmessage',{configurable:true,get:()=>handler,set:fn=>{handler=fn;for(const event of queued.splice(0))handler(event);}});
// The event listener is independent of WS14's onmessage assignment.
self.addEventListener('message',receive);
globalThis.Worker=class PortSidecar{
 constructor(){client=this;this.pending=new Map();this.attach();}
 attach(){if(!port)return;this.port=port;this.port.onmessage=event=>{
  if(event.data.hollows)return send(event.data);
  const error=event.data.answer?.error;if(error&&(error.name==='RuntimeError'||/out of memory|memory access|allocation failed|unreachable/i.test(error.message||''))){send({trap:{error,ops:[...this.pending.values()].map(p=>p.data.request.o?.type||p.data.request.kind),recent:[...this.pending.values()].map(p=>({id:p.data.id,kind:p.data.request.kind}))}});send({type:'occtFault',generation,retry:[...this.pending.values()].every(p=>!p.retried)});return;}
  this.pending.delete(event.data.id);send({type:'occtEnd',id:event.data.id,generation});this.onmessage?.(event);if(warmAsked&&!warmed){warmed=true;this.port.postMessage({warm:true});}
 };for(const p of this.pending.values())this.dispatch(p);}
 postMessage(data){const p={data,deadline:Date.now()+OCCT_JOB_BUDGET_MS,retried:false};this.pending.set(data.id,p);this.dispatch(p);}
 dispatch(p){if(!this.port)return;send({type:'occtBegin',id:p.data.id,generation,deadline:p.deadline});this.port.postMessage(p.data);}
 fail(message,retry){if(retry){for(const p of this.pending.values())p.retried=true;this.port?.close();return;}for(const id of this.pending.keys())this.onmessage?.({data:{id,answer:{init:true,error:{isError:true,name:Error.name,message}}}});this.pending.clear();this.port?.close();}
 terminate(){this.port?.close();this.port=null;port=null;send({type:'occtRecycle',generation});}
};
if(self.name!=='occt')await import('./worker-sidecar.js');
