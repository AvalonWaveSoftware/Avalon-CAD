// stl-import-weld (3.0): the importSTL job, loaded by the worker only on the first STL import (a separate
// chunk-wstl.js asset next to worker.js, counted once in the worker budget). Binary or ASCII STL into typed buffers,
// then the exact Rust weld (mesh-core weld_exact), with the same limits and errors as readSTL.
export function readSTLTyped(buffer){
 const view=new DataView(buffer),max=()=>{throw Error('STL exceeds 1 million triangles.');};let v,n;
 if(buffer.byteLength>=84&&84+view.getUint32(80,true)*50===buffer.byteLength){const count=view.getUint32(80,true);if(count>1000000)max();n=count*3;v=new Float32Array(n*3);
  for(let t=0;t<count;t++)for(let j=0;j<9;j++)v[t*9+j]=view.getFloat32(84+t*50+12+j*4,true);}
 else{const text=new TextDecoder().decode(buffer),rx=/vertex\s+([-+\deE.]+)\s+([-+\deE.]+)\s+([-+\deE.]+)/g,a=[];let m;
  while((m=rx.exec(text))){a.push(+m[1],+m[2],+m[3]);if(a.length>9000000)max();}n=a.length/3;v=new Float32Array(a);}
 if(!n||n%3||v.some(x=>!Number.isFinite(x)))throw Error('Invalid STL file.');
 const triangles=new Uint32Array(n);for(let i=0;i<n;i++)triangles[i]=i;return {vertices:v,triangles};
}
// rust = initRustMesh() (its core + withBuffers). A rust object with its own weldExact (test doubles) is used as is.
export function weldExact(rust,vertices,triangles){
 if(rust.weldExact)return rust.weldExact(vertices,triangles);
 if(vertices.length%3||triangles.length%3)throw Error('Invalid geometry buffers.');
 const {core,withBuffers}=rust;return withBuffers((allocate,input)=>{const vp=input(vertices),tp=input(triangles),cp=allocate(4);
  if(core.weld_exact(vp,vertices.length,tp,triangles.length,cp))throw Error('Invalid imported mesh.');
  const count=new Uint32Array(core.memory.buffer,cp,1)[0];
  return {vertices:new Float32Array(core.memory.buffer,vp,count).slice(),triangles:new Uint32Array(core.memory.buffer,tp,triangles.length).slice()};});
}
export function importSTL(rust,data){
 const m=readSTLTyped(data.buffer),w=weldExact(rust,m.vertices,m.triangles);
 if(w.vertices.length>3000000||w.triangles.length>3000000)throw Error('Invalid imported mesh.');
 return {id:data.id,...w};
}
