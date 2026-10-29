import {PARTS_3MF} from './three-mf-parts.mjs';
// ADR-0001 F2a: DEFLATE level and output cap of every 3MF path.
const LEVEL_3MF=2,LIMIT_3MF=50*1024*1024;
export async function initRustMesh({binary,url,streaming}={}){
 let instance;
 // WS8: streaming compile straight from the response (same bytes, same module); errors keep the same message.
 if(!binary&&streaming&&WebAssembly.instantiateStreaming){const r=await fetch(url);if(!r.ok)throw Error('The bundled Rust engine could not load.');({instance}=await WebAssembly.instantiateStreaming(r,{}));}
 else{const bytes=binary||await (async()=>{const r=await fetch(url);if(!r.ok)throw Error('The bundled Rust engine could not load.');return r.arrayBuffer();})();({instance}=await WebAssembly.instantiate(bytes,{}));}
 const core=instance.exports;
 if(core.engine_version()!==7)throw Error('Unsupported Rust geometry engine.');
 function withBuffers(fn){const allocations=[];
  const allocate=bytes=>{if(!bytes)return 0;const ptr=core.mesh_alloc(bytes);if(!ptr)throw Error('The model exceeds available geometry memory.');allocations.push([ptr,bytes]);return ptr;};
  const input=data=>{const ptr=allocate(data.byteLength);if(data.byteLength)new Uint8Array(core.memory.buffer,ptr,data.byteLength).set(new Uint8Array(data.buffer,data.byteOffset,data.byteLength));return ptr;};
  try{return fn(allocate,input);}finally{for(const [ptr,bytes] of allocations)core.mesh_free(ptr,bytes);}
 }
 function validate(vertices,triangles){if(vertices.length%3||triangles.length%3)throw Error('Invalid geometry buffers.');}
 return {version:7,
  // stl-import-weld: for the lazy importSTL chunk (web/worker-stl.mjs).
  core,withBuffers,
  // ADR-0001 F2a: wasm linear memory size (it never shrinks), for the leak bench.
  memoryBytes:()=>core.memory.buffer.byteLength,
  // F1e (ADR-0002): minimum distance with a bounded working set. Each mesh is streamed through one CHUNK-triangle slot
 // (unindexed f32 triangles + an in-place AABB tree); chunk pairs are visited nearest-box-first and skipped once their box
 // distance reaches the running best. Scratch is two slots (~7.6 MB at CHUNK 65,536), allocated once per query and freed
 // after it, so the allocator reuses it for later prepare/export work. Squared distances throughout; sqrt at the end.
 meshMinDistance(a,b){if(!core.measure_build)throw Error('Unsupported Rust geometry engine.');const A=meshChunks(a),B=meshChunks(b);
  return withBuffers(allocate=>{const cap=Math.min(MEASURE_CHUNK,Math.max(A.max,B.max)),nodeBytes=core.measure_node_bytes(cap),slot=()=>({tris:allocate(cap*36),nodes:allocate(nodeBytes),chunk:-1,count:0}),sa=slot(),sb=slot();
   const load=(s,mesh,c)=>{if(s.chunk===c)return;const n=c.end-c.start,out=new Float32Array(core.memory.buffer,s.tris,n*9),v=mesh.vertices,t=mesh.triangles;
    for(let i=0,k=c.start*3;i<n*3;i++,k++){const o=t[k]*3;out[i*3]=v[o];out[i*3+1]=v[o+1];out[i*3+2]=v[o+2];}
    s.count=core.measure_build(s.tris,n,s.nodes,nodeBytes);if(!s.count)throw Error('Invalid geometry buffers.');s.chunk=c;s.n=n;};
   let best=Infinity;
   const order=A.chunks.map(ca=>({ca,near:B.chunks.map(cb=>({cb,d:boxDistance(ca,cb)})).sort((x,y)=>x.d-y.d)})).sort((x,y)=>x.near[0].d-y.near[0].d);
   for(const {ca,near} of order){if(near[0].d>=best)continue;for(const {cb,d} of near){if(d>=best)break;load(sa,a,ca);load(sb,b,cb);
    const r=core.measure_slots(sa.tris,sa.n,sa.nodes,sa.count,sb.tris,sb.n,sb.nodes,sb.count,best);if(!(r>=0))throw Error('Invalid geometry buffers.');best=r;if(best===0)return 0;}}
   // A closed mesh wholly inside the other solid has zero solid-to-solid distance.
   if(inside(a.vertices,b)||inside(b.vertices,a))return 0;return Math.sqrt(best);
  });},
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
  // android-large-mesh-memory (ADR-0001): Rust sizes the vertex arrays exactly and hands them over (result =
  // [positions, normals, count, positions capacity, normals capacity]); they are copied out and freed with free_floats.
  prepareIndexed(vertices,triangles,flat=new Uint8Array(),groups=new Uint32Array()){
   validate(vertices,triangles);if(!triangles.length)return {positions:new Float32Array(),normals:new Float32Array(),index:new Uint32Array()};
   return withBuffers((allocate,input)=>{const n=triangles.length,vp=input(vertices),tp=input(triangles),fp=input(flat),gp=input(groups),ip=allocate(n*4),rp=allocate(20);
    const code=core.prepare_indexed(vp,vertices.length,tp,n,fp,flat.length,gp,groups.length,ip,rp),[pp,np,count,pc,nc]=new Uint32Array(core.memory.buffer,rp,5);
    try{if(code)throw Error('The model contains invalid mesh geometry.');
     return {positions:new Float32Array(core.memory.buffer,pp,count*3).slice(),normals:new Float32Array(core.memory.buffer,np,count*3).slice(),index:new Uint32Array(core.memory.buffer,ip,n).slice()};}
    finally{core.free_floats(pp,pc);core.free_floats(np,nc);}
   });
  },
  overhangStats(vertices,triangles,threshold=Math.SQRT1_2,ground=true){
   validate(vertices,triangles);if(!core.overhang_stats)throw Error("mesh-core.wasm needs rebuild");
   return withBuffers((allocate,input)=>{const vp=input(vertices),tp=input(triangles),op=allocate(16);
    if(core.overhang_stats(vp,vertices.length,tp,triangles.length,threshold,ground?1:0,op))throw Error("Invalid geometry buffers.");
    const out=new Float64Array(core.memory.buffer,op,2);return {area:out[0],count:out[1]};
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

// F1e helpers (ADR-0002). Indices are checked here, so the Rust side never does index arithmetic.
export const MEASURE_CHUNK=65536;
function meshChunks({vertices:v,triangles:t}){if(!v?.length||!t?.length||v.length%3||t.length%3)throw Error('Invalid geometry buffers.');const nv=v.length/3,n=t.length/3,chunks=[];
 for(let i=0;i<v.length;i++)if(!Number.isFinite(v[i]))throw Error('Invalid geometry buffers.');
 for(let s=0;s<n;s+=MEASURE_CHUNK){const end=Math.min(n,s+MEASURE_CHUNK),lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
  for(let k=s*3;k<end*3;k++){const x=t[k];if(!(x<nv))throw Error('Invalid geometry buffers.');const o=x*3;for(let j=0;j<3;j++){const c=v[o+j];if(c<lo[j])lo[j]=c;if(c>hi[j])hi[j]=c;}}
  chunks.push({start:s,end,lo,hi});}
 return {chunks,max:Math.min(n,MEASURE_CHUNK)};}
function boxDistance(a,b){let d=0;for(let k=0;k<3;k++){const g=Math.max(a.lo[k]-b.hi[k],b.lo[k]-a.hi[k],0);d+=g*g;}return d;}
// Ray parity from the first vertex of `points` against every triangle of mesh m (same ray and rule as before).
function inside(points,{vertices:v,triangles:t}){const p=[points[0],points[1],points[2]],d=[1,0.3713906763541037,0.5291502622129182],hits=[];
 for(let k=0;k<t.length;k+=3){const a=t[k]*3,b=t[k+1]*3,c=t[k+2]*3,e=[v[b]-v[a],v[b+1]-v[a+1],v[b+2]-v[a+2]],f=[v[c]-v[a],v[c+1]-v[a+1],v[c+2]-v[a+2]];
  const h=[d[1]*f[2]-d[2]*f[1],d[2]*f[0]-d[0]*f[2],d[0]*f[1]-d[1]*f[0]],det=e[0]*h[0]+e[1]*h[1]+e[2]*h[2];if(Math.abs(det)<1e-20)continue;
  const s=[p[0]-v[a],p[1]-v[a+1],p[2]-v[a+2]],u=(s[0]*h[0]+s[1]*h[1]+s[2]*h[2])/det,q=[s[1]*e[2]-s[2]*e[1],s[2]*e[0]-s[0]*e[2],s[0]*e[1]-s[1]*e[0]];
  const w=(d[0]*q[0]+d[1]*q[1]+d[2]*q[2])/det,r=(f[0]*q[0]+f[1]*q[1]+f[2]*q[2])/det;if(u>=0&&w>=0&&u+w<=1)hits.push(r);}
 hits.sort((x,y)=>x-y);const kept=hits.filter((r,i)=>!i||Math.abs(r-hits[i-1])>=1e-10);
 return kept.filter(r=>r>0).length%2===1&&kept.filter(r=>r<0).length%2===1;}
