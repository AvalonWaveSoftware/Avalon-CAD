import {initKernel} from './kernel.mjs';
import {initLocalEngine} from './local-engine.mjs';
import {TOPOLOGY_SERVICE} from './perf-flags.mjs';
import {shipTopologies} from './topology-pack.mjs';
const runtime=initKernel({locateFile:()=>new URL('manifold.wasm',self.location.href).href,solidOptions:{locateFile:()=>new URL('cad-kernel.wasm',self.location.href).href}}).then(K=>initLocalEngine(K,{baseURL:self.location.href,rust:{url:new URL('mesh-core.wasm',self.location.href).href}}));
let queue=[],running=false;
self.onmessage=({data})=>{
 if(data.type==='preview'){for(const old of queue.filter(x=>x.type==='preview'))self.postMessage({id:old.id,canceled:true});queue=queue.filter(x=>x.type!=='preview');}
 queue.push(data);drain();
};
async function drain(){if(running)return;running=true;
 try{while(queue.length){const data=queue.shift();try{
  const engine=await runtime,result=engine.process(data);result.engine=engine.info;
  const transfers=[];if(result.buffer)transfers.push(result.buffer);
  for(const key of ['vertices','triangles','flatTriangles','smoothingGroups','displayPositions','displayNormals'])if(ArrayBuffer.isView(result[key]))transfers.push(result[key].buffer);
  for(const p of result.parts||[]){for(const key of ['vertices','triangles','flatTriangles','smoothingGroups'])if(p[key])transfers.push(p[key].buffer);if(!TOPOLOGY_SERVICE&&p.topology)transfers.push(p.topology.vertices.buffer,p.topology.triangles.buffer);}
  if(TOPOLOGY_SERVICE)transfers.push(...shipTopologies(result));
  self.postMessage(result,transfers);
 }catch(e){self.postMessage({id:data.id,error:'Local geometry processing could not start: '+(e.message||String(e))});}}}
 finally{running=false;}
}
