// WS14 test helper: an engine whose OCCT lives in a worker-thread sidecar (tests/occt-sidecar-thread.mjs), driven by
// the same runJob/solidRemote code as the browser geometry worker. Requests are deduplicated while in flight.
import {Worker} from 'node:worker_threads';
import {solidRemote,runJob} from '../web/occt-remote.mjs';
export function sidecarClient(){
 const w=new Worker(new URL('./occt-sidecar-thread.mjs',import.meta.url));let next=0;const waiting=new Map(),inflight=new Map();const stats={requests:0,sidecarMs:0};
 w.on('message',({id,answer,ms})=>{stats.sidecarMs+=ms||0;const f=waiting.get(id);waiting.delete(id);f(answer);});
 const remote=solidRemote();
 const fetch=reqs=>Promise.all(reqs.map(r=>{const k=r.kind+'|'+r.key;let p=inflight.get(k);if(!p){const id=++next;stats.requests++;p=new Promise(res=>waiting.set(id,res)).finally(()=>inflight.delete(k));inflight.set(k,p);w.postMessage({id,request:r});}return p;}));
 return {remote,stats,fetch,run:(engine,data,opts={})=>runJob(engine,data,remote,{fetch,...opts}),close:()=>w.terminate()};
}
