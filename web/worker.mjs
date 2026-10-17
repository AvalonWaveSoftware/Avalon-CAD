import {initKernel} from './kernel.mjs';
import {initLocalEngine} from './local-engine.mjs';
import {TOPOLOGY_SERVICE,PARALLEL_INIT,BUNDLE_SPLIT} from './perf-flags.mjs';
import {initSolid} from './cad-solid.mjs';
import {needsSolid} from './solid-gate.mjs';
import {initRustMesh} from './rust-mesh.mjs';
import {shipTopologies} from './topology-pack.mjs';
// WS8: with PARALLEL_INIT the Rust core, Manifold and OCCT start together, and every wasm carries the worker's ?v=
// token (worker.js?v=<version>) so the immutable responses are cached per release.
const asset=name=>new URL(name+(PARALLEL_INIT?self.location.search:''),self.location.href).href;
const rustReady=PARALLEL_INIT?initRustMesh({url:asset('mesh-core.wasm'),streaming:true}):null;
// WS9 (BUNDLE_SPLIT): OCCT is not in the startup path. It starts on the warm message from the UI (sent right after the
// first frame) or at the first job that may need it, whichever comes first; see needsSolid.
let solid=null;const startSolid=()=>solid??=initSolid({locateFile:()=>asset('cad-kernel.wasm')});
const runtime=initKernel({parallel:PARALLEL_INIT,locateFile:()=>asset('manifold.wasm'),solidOptions:BUNDLE_SPLIT?false:{locateFile:()=>asset('cad-kernel.wasm')}}).then(K=>initLocalEngine(K,{baseURL:self.location.href,rust:PARALLEL_INIT?{ready:rustReady}:{url:new URL('mesh-core.wasm',self.location.href).href}}));
rustReady?.catch(()=>{});
let queue=[],running=false;
self.onmessage=({data})=>{
 if(BUNDLE_SPLIT&&data?.type==='warm'){startSolid().catch(()=>{});return;}
 // A job that may need OCCT starts its compile at once, alongside the Manifold/Rust init it also waits for.
 if(BUNDLE_SPLIT&&needsSolid(data))startSolid().catch(()=>{});
 if(data.type==='preview'){for(const old of queue.filter(x=>x.type==='preview'))self.postMessage({id:old.id,canceled:true});queue=queue.filter(x=>x.type!=='preview');}
 queue.push(data);drain();
};
async function drain(){if(running)return;running=true;
 try{while(queue.length){const data=queue.shift();try{
  const engine=await runtime;if(BUNDLE_SPLIT&&needsSolid(data))await startSolid();const result=engine.process(data);result.engine=engine.info;
  const transfers=[];if(result.buffer)transfers.push(result.buffer);
  for(const key of ['vertices','triangles','flatTriangles','smoothingGroups','displayPositions','displayNormals','displayIndex'])if(ArrayBuffer.isView(result[key]))transfers.push(result[key].buffer);
  for(const p of result.parts||[]){for(const key of ['vertices','triangles','flatTriangles','smoothingGroups'])if(p[key])transfers.push(p[key].buffer);if(!TOPOLOGY_SERVICE&&p.topology)transfers.push(p.topology.vertices.buffer,p.topology.triangles.buffer);}
  if(TOPOLOGY_SERVICE)transfers.push(...shipTopologies(result));
  self.postMessage(result,transfers);
 }catch(e){self.postMessage({id:data.id,error:'Local geometry processing could not start: '+(e.message||String(e))});}}}
 finally{running=false;}
}
