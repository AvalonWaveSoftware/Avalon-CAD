// WS14 (OCCT_SIDECAR): the geometry worker's side of the OCCT sidecar.
// solidRemote() installs itself as cad-solid's backend: solidMesh / objectTopology answer from caches here (meshes by
// geometry key + tolerance + display, LRU 64 MB, callers get copies as before; topology by geometry key, LRU 32 MB;
// errors are cached and re-thrown as the same value), and a miss is recorded for the sidecar.
// runJob() runs a job; when anything missed, its result is discarded, the misses are fetched from the sidecar and the
// job runs again, until nothing misses. Only a preview whose miss includes a fillet mesh may hand its first, stand-in
// run to onInterim (display-only data; see main.mjs). Jobs are pure functions of their input and these caches, so
// discarding a run has no other effect (engine-cache never caches a stand-in solid).
import {setSolidRemote,topologyBytes} from './cad-solid.mjs';
const MESH_BYTES=64*1048576,TOPOLOGY_BYTES=32*1048576;
const copyMesh=m=>({...m,vertices:m.vertices.slice(),triangles:m.triangles.slice(),...(m.displayGroups?{displayGroups:m.displayGroups.map(g=>({...g}))}:{})});
// Errors cross the worker boundary as data and are re-thrown as the value the in-process call would have thrown.
export const packError=e=>e instanceof Error?{isError:true,name:e.name,message:e.message}:{isError:false,value:typeof e==='number'||typeof e==='string'?e:String(e)};
export const unpackError=x=>{if(!x.isError)return x.value;const e=new Error(x.message);if(x.name&&x.name!==e.name)e.name=x.name;return e;};
export function solidRemote(){
 const meshes=new Map(),topologies=new Map();let meshBytes=0,topologyTotal=0,misses=[],keys=new Set(),events=0;
 const touch=(map,key)=>{const v=map.get(key);if(v){map.delete(key);map.set(key,v);}return v;};
 const miss=req=>{events++;const id=req.kind+'|'+req.key;if(!keys.has(id)){keys.add(id);misses.push(req);}};
 const trim=(map,total,cap)=>{for(const [k,v] of map){if(total<=cap||map.size<=1)break;map.delete(k);total-=v.bytes;}return total;};
 const remote={
  solidMesh(o,tolerance,display,key){const e=touch(meshes,key);if(e){if(e.error)throw unpackError(e.error);return copyMesh(e.m);}miss({kind:'mesh',key,o:structuredClone(o),tolerance,display});return null;},
  topology(o,key){const e=touch(topologies,key);if(e){if(e.error)throw unpackError(e.error);return e.t;}miss({kind:'topology',key,o:structuredClone(o)});return null;},
  events:()=>events,
  take(){const m=misses;misses=[];keys=new Set();return m;},
  has:req=>(req.kind==='mesh'?meshes:topologies).has(req.key),
  install(req,answer){
   if(req.kind==='mesh'){if(meshes.has(req.key))return;const bytes=answer.error?256:answer.m.vertices.byteLength+answer.m.triangles.byteLength+64*(answer.m.displayGroups?.length||0)+256;meshes.set(req.key,{...answer,bytes});meshBytes=trim(meshes,meshBytes+bytes,MESH_BYTES);}
   else{if(topologies.has(req.key))return;const bytes=answer.error||!answer.t?256:topologyBytes(answer.t);topologies.set(req.key,{...answer,bytes});topologyTotal=trim(topologies,topologyTotal+bytes,TOPOLOGY_BYTES);}},
  stats:()=>({meshEntries:meshes.size,meshBytes,topologyEntries:topologies.size,topologyBytes:topologyTotal}),
 };
 setSolidRemote(remote);return remote;
}
// fetch(requests) resolves to one answer per request, in order: {m} | {t} | {error}.
// abort: a promise that settles when a newer preview supersedes this one; the job then returns {canceled} at once
// (requests already sent keep running and are reused by the next job).
export async function runJob(engine,data,remote,{fetch,onInterim,abort}={}){
 for(let round=0;;round++){
  remote.take();const result=engine.process(data),wanted=remote.take();
  if(!wanted.length)return result;
  if(round>=16)throw Error('The modeling engine could not start. Close and reopen the app.');
  if(round===0&&onInterim&&data.type==='preview'&&!result.error&&wanted.some(r=>r.kind==='mesh'))onInterim(result);
  const CANCEL={},answers=await (abort?Promise.race([fetch(wanted),abort.then(()=>CANCEL)]):fetch(wanted));
  if(answers===CANCEL)return {id:data.id,canceled:true};
  // The sidecar could not load OCCT: fail the job as the in-process engine does when its OCCT init fails.
  const down=answers.find(a=>a.init);if(down)throw unpackError(down.error);
  wanted.forEach((r,i)=>remote.install(r,answers[i]));
 }
}
