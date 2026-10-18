import {PARTS_3MF} from './three-mf-parts.mjs';
// ADR-0001 F2a: DEFLATE level and output cap of every 3MF path.
const LEVEL_3MF=2,LIMIT_3MF=50*1024*1024;
export async function initRustMesh({binary,url,streaming}={}){
 let instance;
 // WS8: streaming compile straight from the response (same bytes, same module); errors keep the same message.
 if(!binary&&streaming&&WebAssembly.instantiateStreaming){const r=await fetch(url);if(!r.ok)throw Error('The bundled Rust engine could not load.');({instance}=await WebAssembly.instantiateStreaming(r,{}));}
 else{const bytes=binary||await (async()=>{const r=await fetch(url);if(!r.ok)throw Error('The bundled Rust engine could not load.');return r.arrayBuffer();})();({instance}=await WebAssembly.instantiate(bytes,{}));}
 const core=instance.exports;
 if(core.engine_version()!==4)throw Error('Unsupported Rust geometry engine.');
 function withBuffers(fn){const allocations=[];
  const allocate=bytes=>{if(!bytes)return 0;const ptr=core.mesh_alloc(bytes);if(!ptr)throw Error('The model exceeds available geometry memory.');allocations.push([ptr,bytes]);return ptr;};
  const input=data=>{const ptr=allocate(data.byteLength);if(data.byteLength)new Uint8Array(core.memory.buffer,ptr,data.byteLength).set(new Uint8Array(data.buffer,data.byteOffset,data.byteLength));return ptr;};
  try{return fn(allocate,input);}finally{for(const [ptr,bytes] of allocations)core.mesh_free(ptr,bytes);}
 }
 function validate(vertices,triangles){if(vertices.length%3||triangles.length%3)throw Error('Invalid geometry buffers.');}
 return {version:4,
  // ADR-0001 F2a: wasm linear memory size (it never shrinks), for the leak bench.
  memoryBytes:()=>core.memory.buffer.byteLength,
  threadMesh(type,params,tolerance=.15){
   const p=params,inputParams=new Float64Array([type==='threadtube'?1:0,p.diameter,p.pitch,p.h,p.outer||0,p.clearance,p.hand==='left'?-1:1,p.phase%p.pitch,tolerance]);
   return withBuffers((allocate,input)=>{const pp=input(inputParams),ip=allocate(24);let code=core.thread_mesh(pp,ip,0,0,0,0);
    if(code)throw Error(code===3?'Thread mesh is too large. Shorten the part, increase pitch or use a coarser curve resolution.':'Invalid thread dimensions or fit clearance.');
    const meta=new Uint32Array(core.memory.buffer,ip,6).slice(),vp=allocate(meta[0]*4),tp=allocate(meta[1]*4);
    code=core.thread_mesh(pp,ip,vp,meta[0],tp,meta[1]);if(code)throw Error('The threaded solid could not be built.');
    return {vertices:new Float32Array(core.memory.buffer,vp,meta[0]).slice(),triangles:new Uint32Array(core.memory.buffer,tp,meta[1]).slice(),groups:meta};
   });
  },
  prepare(vertices,triangles,flat=new Uint8Array(),groups=new Uint32Array()){
   validate(vertices,triangles);if(!triangles.length)return {positions:new Float32Array(),normals:new Float32Array()};
   return withBuffers((allocate,input)=>{const vp=input(vertices),tp=input(triangles),fp=input(flat),gp=input(groups),bytes=triangles.length*12,pp=allocate(bytes),np=allocate(bytes);
    if(core.prepare_mesh(vp,vertices.length,tp,triangles.length,fp,flat.length,gp,groups.length,pp,np))throw Error('The model contains invalid mesh geometry.');
    return {positions:new Float32Array(core.memory.buffer,pp,triangles.length*3).slice(),normals:new Float32Array(core.memory.buffer,np,triangles.length*3).slice()};
   });
  },
  // WS10: indexed display mesh. Expanding index over positions/normals gives prepare() exactly.
  prepareIndexed(vertices,triangles,flat=new Uint8Array(),groups=new Uint32Array()){
   validate(vertices,triangles);if(!triangles.length)return {positions:new Float32Array(),normals:new Float32Array(),index:new Uint32Array()};
   return withBuffers((allocate,input)=>{const n=triangles.length,vp=input(vertices),tp=input(triangles),fp=input(flat),gp=input(groups),pp=allocate(n*12),np=allocate(n*12),ip=allocate(n*4),cp=allocate(4);
    if(core.prepare_indexed(vp,vertices.length,tp,n,fp,flat.length,gp,groups.length,pp,np,ip,cp))throw Error('The model contains invalid mesh geometry.');
    const count=new Uint32Array(core.memory.buffer,cp,1)[0];
    return {positions:new Float32Array(core.memory.buffer,pp,count*3).slice(),normals:new Float32Array(core.memory.buffer,np,count*3).slice(),index:new Uint32Array(core.memory.buffer,ip,n).slice()};
   });
  },
  writeSTL(vertices,triangles,ground=true){
   validate(vertices,triangles);if(!triangles.length)throw Error('The model has no solid material to export.');
   const size=84+triangles.length/3*50;if(size>50*1024*1024)throw Error('This STL exceeds the 50 MB file transfer limit.');
   return withBuffers((allocate,input)=>{const vp=input(vertices),tp=input(triangles),op=allocate(size);
    if(core.encode_stl(vp,vertices.length,tp,triangles.length,ground?1:0,op,size))throw Error('The model contains invalid STL geometry.');
    return new Uint8Array(core.memory.buffer,op,size).slice().buffer;
   });
  },
  // ADR-0001 F2a: 3MF package of the same mesh and grounding as writeSTL (Rust encode_3mf at DEFLATE level 2: within the ADR §8 time and size budgets, see tests/export-3mf.mjs).
  // ADR-0001 F2a option A: the same package in PARTS3MF independently deflated parts (see three_mf.rs), so a worker pool
  // can encode them in parallel with identical bytes. prepare3MF validates (same errors as write3MF) and returns the
  // grounding offset; encode3MFPart encodes part k from its own records only; package3MF joins the parts.
  prepare3MF(vertices,triangles,ground=true){
   validate(vertices,triangles);if(!triangles.length)throw Error('The model has no solid material to export.');
   return withBuffers((allocate,input)=>{const vp=input(vertices),tp=input(triangles),zp=allocate(8);
    if(core.prepare_3mf(vp,vertices.length,tp,triangles.length,ground?1:0,zp))throw Error('The model contains invalid 3MF geometry.');
    return new Float64Array(core.memory.buffer,zp,1)[0];
   });
  },
  encode3MFPart(vertices,triangles,minZ,k,parts=PARTS_3MF){
   return withBuffers((allocate,input)=>{const vp=input(vertices),tp=input(triangles),rp=allocate(16);
    if(core.encode_3mf_part(vp,vertices.length,tp,triangles.length,minZ,k,parts,LEVEL_3MF,rp))throw Error('The model contains invalid 3MF geometry.');
    const [ptr,size,crc,text]=new Uint32Array(core.memory.buffer,rp,4);
    try{return {bytes:new Uint8Array(core.memory.buffer,ptr,size).slice().buffer,crc,size:text};}finally{core.free_bytes(ptr,size);}
   });
  },
  package3MF(parts){
   if(parts.length!==1&&parts.length!==PARTS_3MF)throw Error('The model contains invalid 3MF geometry.');
   // Rust writes only the zip frame (about 1 KB); the parts are spliced in here, outside wasm memory.
   const total=parts.reduce((n,p)=>n+p.bytes.byteLength,0),meta=new Uint32Array(2*parts.length);parts.forEach((p,i)=>{meta[2*i]=p.crc;meta[2*i+1]=p.size;});
   const [frame,split]=withBuffers((allocate,input)=>{const mp=input(meta),rp=allocate(12);
    const code=core.package_3mf(total,mp,parts.length,LEVEL_3MF,LIMIT_3MF,rp),[ptr,size,split]=new Uint32Array(core.memory.buffer,rp,3);
    if(code===4)throw Error('This 3MF exceeds the 50 MB file transfer limit.');if(code)throw Error('The model contains invalid 3MF geometry.');
    try{return [new Uint8Array(core.memory.buffer,ptr,size).slice(),split];}finally{core.free_bytes(ptr,size);}
   });
   const out=new Uint8Array(frame.length+total);out.set(frame.subarray(0,split));let at=split;
   for(const p of parts){out.set(new Uint8Array(p.bytes),at);at+=p.bytes.byteLength;}out.set(frame.subarray(split),at);
   return out.buffer;
  },
  write3MF(vertices,triangles,ground=true){
   validate(vertices,triangles);if(!triangles.length)throw Error('The model has no solid material to export.');
   return withBuffers((allocate,input)=>{const vp=input(vertices),tp=input(triangles),rp=allocate(8);
    const code=core.encode_3mf(vp,vertices.length,tp,triangles.length,ground?1:0,LEVEL_3MF,LIMIT_3MF,rp),[ptr,size]=new Uint32Array(core.memory.buffer,rp,2);
    if(code===4)throw Error('This 3MF exceeds the 50 MB file transfer limit.');if(code)throw Error('The model contains invalid 3MF geometry.');
    try{return new Uint8Array(core.memory.buffer,ptr,size).slice().buffer;}finally{core.free_bytes(ptr,size);}
   });
  },
 };
}
