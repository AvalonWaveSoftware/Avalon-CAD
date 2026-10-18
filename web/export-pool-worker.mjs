// ADR-0001 F2a option A: a 3MF pool worker (built to app/assets/export-pool.js). The page starts it the same way it
// starts worker.js (module worker, same asset path and ?v= token; never as a nested worker). It loads mesh-core.wasm
// once and then encodes 3MF parts, and joins them into the package, on request. Buffers travel as transferables.
import {initRustMesh} from './rust-mesh.mjs';
let rust=null;
const fail=(id,e)=>self.postMessage({op:'error',id,error:String(e?.message||e)});
self.onmessage=async({data})=>{
 const {op,id}=data;
 if(op==='init'){try{rust=await initRustMesh(data.binary?{binary:data.binary}:{url:data.wasm,streaming:true});self.postMessage({op:'ready',memory:rust.memoryBytes()});}catch(e){self.postMessage({op:'failed',error:String(e?.message||e)});}return;}
 try{
  if(op==='part'){const r=rust.encode3MFPart(data.vertices,data.triangles,data.minZ,data.k);self.postMessage({op:'part',id,k:data.k,...r,memory:rust.memoryBytes()},[r.bytes]);}
  else if(op==='package'){const buffer=rust.package3MF(data.parts);self.postMessage({op:'package',id,buffer,memory:rust.memoryBytes()},[buffer]);}
  else if(op==='memory')self.postMessage({op:'memory',id,memory:rust.memoryBytes()});
 }catch(e){fail(id,e);}
};
