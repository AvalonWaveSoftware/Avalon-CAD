// ADR-0001 F2a speed gate: STL vs 3MF encode on the 524k-triangle sphere, same scope (the rust-mesh.mjs writeSTL /
// write3MF wrappers end to end: copy in, encode, copy out), median of 5 after one warm-up, plus a stage breakdown
// when given a wasm built with `--features profile` (PROFILE_WASM=path). Usage:
//   node tests/perf/export-3mf-profile.mjs [--json]
import fs from 'node:fs';import os from 'node:os';
import {initKernel} from '../../web/kernel.mjs';import {initRustMesh} from '../../web/rust-mesh.mjs';
const N=5;
const median=fn=>{fn();const r=[];let out;for(let i=0;i<N;i++){const a=performance.now();out=fn();r.push(performance.now()-a);}r.sort((x,y)=>x-y);return {ms:r[N>>1],min:r[0],max:r[N-1],out};};
const K=await initKernel();const s=K.Manifold.sphere(25,1024);const mesh=s.getMesh();s.delete();
const v=Float32Array.from(mesh.vertProperties),t=Uint32Array.from(mesh.triVerts);
const binary=fs.readFileSync(process.env.SHIPPED_WASM||'app/assets/mesh-core.wasm');const rust=await initRustMesh({binary});
const load0=os.loadavg()[0];
const stl=median(()=>rust.writeSTL(v,t,true)),mf=median(()=>rust.write3MF(v,t,true));
const result={triangles:t.length/3,vertices:v.length/3,stlMs:stl.ms,mfMs:mf.ms,ratio:mf.ms/stl.ms,stlBytes:stl.out.byteLength,mfBytes:mf.out.byteLength,
 stlRange:[stl.min,stl.max],mfRange:[mf.min,mf.max],load:[load0,os.loadavg()[0]],cpus:os.cpus().length,stages:null};
if(process.env.PROFILE_WASM){
 const {instance}=await WebAssembly.instantiate(fs.readFileSync(process.env.PROFILE_WASM),{});const c=instance.exports;
 const vp=c.mesh_alloc(v.byteLength),tp=c.mesh_alloc(t.byteLength);
 const st={};
 st.copyIn=median(()=>{new Uint8Array(c.memory.buffer,vp,v.byteLength).set(new Uint8Array(v.buffer));new Uint8Array(c.memory.buffer,tp,t.byteLength).set(new Uint8Array(t.buffer));}).ms;
 st.minZ=median(()=>c.prof_xml(vp,v.length,tp,t.length,0)).ms;
 st.vertexText=median(()=>c.prof_xml(vp,v.length,tp,t.length,1)).ms;
 st.triangleText=median(()=>c.prof_xml(vp,v.length,tp,t.length,2)).ms;
 const xml=median(()=>c.prof_xml(vp,v.length,tp,t.length,3));st.wholeXml=xml.ms;st.xmlBytes=xml.out;
 st.crc=median(()=>c.prof_crc()).ms;
 for(const l of [1,2,6])st['deflateL'+l]=median(()=>c.prof_deflate_stream(l)).ms;
 st.copyOut=median(()=>new Uint8Array(c.memory.buffer,0,mf.out.byteLength).slice().buffer).ms;
 result.stages=st;
}
result.load.push(os.loadavg()[0]);
if(process.argv.includes('--json'))console.log(JSON.stringify(result));
else{const f=x=>x.toFixed(1);console.log(`STL ${f(result.stlMs)} ms · 3MF ${f(result.mfMs)} ms · ratio ${result.ratio.toFixed(2)}× (gate ≤ 1.30×) · load ${result.load.map(x=>x.toFixed(1)).join('/')} on ${result.cpus} CPUs`);
 if(result.stages)for(const [k,x] of Object.entries(result.stages))console.log(`  ${k.padEnd(13)} ${k==='xmlBytes'?x+' B':f(x)+' ms'}`);}
