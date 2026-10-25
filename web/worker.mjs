import {initKernel} from './kernel.mjs';
import {initLocalEngine} from './local-engine.mjs';
import {TOPOLOGY_SERVICE,PARALLEL_INIT,BUNDLE_SPLIT,OCCT_SIDECAR} from './perf-flags.mjs';
import {meshMeasurement,measureExact,initSolid,solidMeshFresh,objectTopology,warmShape} from './cad-solid.mjs';
import {solidRemote,runJob,packError} from './occt-remote.mjs';
import {needsSolid} from './solid-gate.mjs';
import {initRustMesh} from './rust-mesh.mjs';
import {shipTopologies} from './topology-pack.mjs';
import {prepareGlyphs,glyphOutlines,glyphsReady} from './glyph-geometry.mjs';
// WS8: with PARALLEL_INIT the Rust core, Manifold and OCCT start together, and every wasm carries the worker's ?v=
// token (worker.js?v=<version>) so the immutable responses are cached per release.
function geometryWorker(){
const asset=name=>new URL(name+(PARALLEL_INIT?self.location.search:''),self.location.href).href;
const rustReady=PARALLEL_INIT?initRustMesh({url:asset('mesh-core.wasm'),streaming:true}):null;
// WS9 (BUNDLE_SPLIT): OCCT is not in the startup path. It starts on the warm message from the UI (sent right after the
// first frame) or at the first job that may need it, whichever comes first; see needsSolid.
let solid=null;const startSolid=()=>solid??=initSolid({locateFile:()=>asset('cad-kernel.wasm')});
const runtime=initKernel({parallel:PARALLEL_INIT,locateFile:()=>asset('manifold.wasm'),solidOptions:BUNDLE_SPLIT||OCCT_SIDECAR?false:{locateFile:()=>asset('cad-kernel.wasm')}}).then(K=>initLocalEngine(K,{baseURL:self.location.href,rust:PARALLEL_INIT?{ready:rustReady}:{url:new URL('mesh-core.wasm',self.location.href).href}}));
rustReady?.catch(()=>{});
// WS14 (OCCT_SIDECAR): the sidecar is this script again, as a nested module worker named 'occt' (it owns the only OCCT
// heap). Requests are deduplicated while in flight; answers arrive in request order.
const remote=OCCT_SIDECAR?solidRemote():null;let sidecar=null,nextAsk=0;const waiting=new Map(),inflight=new Map();
function startSidecar(){if(sidecar)return sidecar;sidecar=new Worker(new URL('worker.js'+(PARALLEL_INIT?self.location.search:''),self.location.href),{type:'module',name:'occt'});
 sidecar.onmessage=({data})=>{const w=waiting.get(data.id);if(w){waiting.delete(data.id);w(data.answer);}};
 sidecar.onerror=e=>{for(const w of waiting.values())w({init:true,error:packError(Error(e.message||'The modeling engine could not start. Close and reopen the app.'))});waiting.clear();inflight.clear();sidecar.terminate();sidecar=null;};return sidecar;}
function askSidecar(requests){startSidecar();return Promise.all(requests.map(r=>{const k=r.kind+'|'+r.key;let p=inflight.get(k);
 if(!p){const id=++nextAsk;p=new Promise(res=>waiting.set(id,res)).finally(()=>inflight.delete(k));inflight.set(k,p);sidecar.postMessage({id,request:r});}return p;}));}
// Interim preview (display only; main.mjs never stores it as the model): copied, not transferred, so no cached
// buffer is detached.
function postInterim(id,r){const d={id,interim:true};for(const k of ['vertices','triangles','flatTriangles','smoothingGroups','displayPositions','displayNormals','displayIndex'])if(r[k])d[k]=r[k];self.postMessage(d);}
let queue=[],running=false,current=null;
// Amendment A2.5: idle warm-up of the torus and glyph topology paths. The UI asks once, after the first user
// interaction (never during startup, on every platform). The torus is warmed once OCCT is ready; the glyph once the
// outlines are loaded (the Letters sheet loads them), so glyphs.mjs stays lazy. Each warm-up runs only while no job
// is queued or running, and never in the sidecar build (its OCCT lives in the other worker).
const warmed={torus:false,glyph:false};let warmAsked=false;
function warmIdle(){if(!warmAsked||OCCT_SIDECAR||warmed.torus&&warmed.glyph)return;
 (BUNDLE_SPLIT?startSolid():runtime).then(()=>setTimeout(function step(){if(running||queue.length)return setTimeout(step,50);
  try{if(!warmed.torus){warmed.torus=true;warmShape({type:'torus',params:{diameter:3,tube:1}});return setTimeout(step,0);}
   if(!warmed.glyph&&glyphsReady()){warmed.glyph=true;warmShape({type:'glyph',params:{char:'B',size:2,depth:1,font:'roboto-bold@1'}});}}catch{}},0),()=>{});}
self.onmessage=({data})=>{
 if(data?.type==='warmShapes'){warmAsked=true;warmIdle();return;}
 // The Letters, numbers & symbols picker asks for the outlines once; this loads them (no engine or OCCT needed).
 if(data?.type==='glyphOutlines'){glyphOutlines().then(outlines=>{self.postMessage({id:data.id,outlines});warmIdle();},e=>self.postMessage({id:data.id,error:e.message||String(e)}));return;}
 if(OCCT_SIDECAR){if(data?.type==='warm'){startSidecar();return;}if(needsSolid(data))startSidecar();}
 else{if(BUNDLE_SPLIT&&data?.type==='warm'){startSolid().catch(()=>{});return;}
 // A job that may need OCCT starts its compile at once, alongside the Manifold/Rust init it also waits for.
 if(BUNDLE_SPLIT&&needsSolid(data))startSolid().catch(()=>{});}
 if(data.type==='preview'){for(const old of queue.filter(x=>x.type==='preview'))self.postMessage({id:old.id,canceled:true});queue=queue.filter(x=>x.type!=='preview');if(current?.type==='preview')current.abort?.();}
 queue.push(data);drain();
};
async function drain(){if(running)return;running=true;
 try{while(queue.length){const data=queue.shift();try{
  const engine=await runtime;let result;
  // Letters: the outlines load (dynamic import) with the first job that contains a glyph, never at startup.
  await prepareGlyphs(data.type==='measure'?[data.a?.object,data.b?.object]:data);
  // WS14: a preview waiting for the sidecar is dropped as soon as a newer preview arrives.
  // ADR-0001 F2a option A fallback: encode a mesh that '3mf-mesh' returned, here, with the same parts and bytes as the pool.
  if(data.type==='encode3mf')result={id:data.id,buffer:engine.rust.write3MF(data.vertices,data.triangles,data.ground!==false)};
  else if(OCCT_SIDECAR&&data.type==='measure'&&!(data.mode==='object'&&[data.a?.object,data.b?.object].some(meshMeasurement))){const [answer]=await askSidecar([{kind:'measure',key:JSON.stringify(data),data}]);result=answer.error?{id:data.id,error:answer.error.message}:{id:data.id,...answer.result};}
  else if(OCCT_SIDECAR){const abort=data.type==='preview'?new Promise(r=>current={type:'preview',abort:r}):null;try{result=await runJob(engine,data,remote,{fetch:askSidecar,onInterim:r=>postInterim(data.id,r),abort});}finally{current=null;}if(result.canceled){self.postMessage({id:data.id,canceled:true});continue;}}
  else{if(BUNDLE_SPLIT&&needsSolid(data))await startSolid();result=engine.process(data);}
  result.engine=engine.info;
  const transfers=[];if(result.buffer)transfers.push(result.buffer);if(result.mesh3mf)transfers.push(result.mesh3mf.vertices.buffer,result.mesh3mf.triangles.buffer);
  for(const key of ['vertices','triangles','flatTriangles','smoothingGroups','displayPositions','displayNormals','displayIndex'])if(ArrayBuffer.isView(result[key]))transfers.push(result[key].buffer);
  for(const p of result.parts||[]){for(const key of ['vertices','triangles','flatTriangles','smoothingGroups'])if(p[key])transfers.push(p[key].buffer);if(!TOPOLOGY_SERVICE&&p.topology)transfers.push(p.topology.vertices.buffer,p.topology.triangles.buffer);}
  if(TOPOLOGY_SERVICE)transfers.push(...shipTopologies(result));
  self.postMessage(result,transfers);
 }catch(e){self.postMessage({id:data.id,error:'Local geometry processing could not start: '+(e.message||String(e))});}}}
 finally{running=false;}
}
}
// WS14: the OCCT sidecar. Loads OCCT once and answers {mesh|topology} requests in arrival order with the same values
// (or the same error) the in-process calls give.
function occtSidecar(){
 const asset=name=>new URL(name+(PARALLEL_INIT?self.location.search:''),self.location.href).href;
 const ready=initSolid({locateFile:()=>asset('cad-kernel.wasm')});
 self.onmessage=async({data:{id,request:r}})=>{let answer;try{await ready;}catch(e){self.postMessage({id,answer:{error:packError(e),init:true}});return;}
  try{
   await prepareGlyphs(r.o||[r.data?.a?.object,r.data?.b?.object]);
   if(r.kind==='measure'){answer={result:measureExact(r.data)};self.postMessage({id,answer});return;}
   if(r.kind==='mesh'){const m=solidMeshFresh(r.o,r.tolerance,r.display);answer={m};self.postMessage({id,answer},[m.vertices.buffer,m.triangles.buffer]);return;}
   answer={t:objectTopology(r.o)};}catch(e){answer={error:packError(e)};}
  self.postMessage({id,answer});};
}
if(OCCT_SIDECAR&&self.name==='occt')occtSidecar();else geometryWorker();
