export async function initRustMesh({binary,url,streaming}={}){
 let instance;
 // WS8: streaming compile straight from the response (same bytes, same module); errors keep the same message.
 if(!binary&&streaming&&WebAssembly.instantiateStreaming){const r=await fetch(url);if(!r.ok)throw Error('The bundled Rust engine could not load.');({instance}=await WebAssembly.instantiateStreaming(r,{}));}
 else{const bytes=binary||await (async()=>{const r=await fetch(url);if(!r.ok)throw Error('The bundled Rust engine could not load.');return r.arrayBuffer();})();({instance}=await WebAssembly.instantiate(bytes,{}));}
 const core=instance.exports;
 if(core.engine_version()!==3)throw Error('Unsupported Rust geometry engine.');
 function withBuffers(fn){const allocations=[];
  const allocate=bytes=>{if(!bytes)return 0;const ptr=core.mesh_alloc(bytes);if(!ptr)throw Error('The model exceeds available geometry memory.');allocations.push([ptr,bytes]);return ptr;};
  const input=data=>{const ptr=allocate(data.byteLength);if(data.byteLength)new Uint8Array(core.memory.buffer,ptr,data.byteLength).set(new Uint8Array(data.buffer,data.byteOffset,data.byteLength));return ptr;};
  try{return fn(allocate,input);}finally{for(const [ptr,bytes] of allocations)core.mesh_free(ptr,bytes);}
 }
 function validate(vertices,triangles){if(vertices.length%3||triangles.length%3)throw Error('Invalid geometry buffers.');}
 return {version:3,
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
  writeSTL(vertices,triangles,ground=true){
   validate(vertices,triangles);if(!triangles.length)throw Error('The model has no solid material to export.');
   const size=84+triangles.length/3*50;if(size>50*1024*1024)throw Error('This STL exceeds the 50 MB file transfer limit.');
   return withBuffers((allocate,input)=>{const vp=input(vertices),tp=input(triangles),op=allocate(size);
    if(core.encode_stl(vp,vertices.length,tp,triangles.length,ground?1:0,op,size))throw Error('The model contains invalid STL geometry.');
    return new Uint8Array(core.memory.buffer,op,size).slice().buffer;
   });
  },
 };
}
