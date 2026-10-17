// ADR-0001 F2a speed gate: STL vs 3MF encode on the 524k-triangle sphere, same scope (the rust-mesh.mjs writeSTL /
// write3MF wrappers end to end: copy in, encode, copy out), median of 5 after one warm-up, plus a stage breakdown
// when given a wasm built with `--features profile` (PROFILE_WASM=path). Usage:
//   node tests/perf/export-3mf-profile.mjs [--json]
import fs from 'node:fs';import os from 'node:os';
import {initKernel} from '../../web/kernel.mjs';const {initRustMesh}=await import(process.env.RUST_MESH||'../../web/rust-mesh.mjs');
const N=5;
// Wall time is the gate; process CPU time (user+system) is reported too because a shared, loaded box inflates wall time.
const cpuNow=()=>{const u=process.cpuUsage();return (u.user+u.system)/1000;};
const median=fn=>{fn();const r=[],c=[];let out;for(let i=0;i<N;i++){const a=performance.now(),b=cpuNow();out=fn();r.push(performance.now()-a);c.push(cpuNow()-b);}r.sort((x,y)=>x-y);c.sort((x,y)=>x-y);return {ms:r[N>>1],cpu:c[N>>1],min:r[0],max:r[N-1],out};};
const K=await initKernel();const s=K.Manifold.sphere(25,1024);const mesh=s.getMesh();s.delete();
const v=Float32Array.from(mesh.vertProperties),t=Uint32Array.from(mesh.triVerts);
const binary=fs.readFileSync(process.env.SHIPPED_WASM||'app/assets/mesh-core.wasm');const rust=await initRustMesh({binary});
const load0=os.loadavg()[0];
const stl=median(()=>rust.writeSTL(v,t,true)),mf=median(()=>rust.write3MF(v,t,true));
const result={triangles:t.length/3,vertices:v.length/3,stlMs:stl.ms,mfMs:mf.ms,stlCpu:stl.cpu,mfCpu:mf.cpu,ratio:mf.ms/stl.ms,stlBytes:stl.out.byteLength,mfBytes:mf.out.byteLength,
 stlRange:[stl.min,stl.max],mfRange:[mf.min,mf.max],load:[load0,os.loadavg()[0]],cpus:os.cpus().length,stages:null};
if(process.env.PROFILE_WASM){
 const {instance}=await WebAssembly.instantiate(fs.readFileSync(process.env.PROFILE_WASM),{});const c=instance.exports;
 const vp=c.mesh_alloc(v.byteLength),tp=c.mesh_alloc(t.byteLength);
 const st={},cpu={};const m=(k,fn)=>{const r=median(fn);st[k]=r.ms;cpu[k]=r.cpu;return r;};
 m('copyIn',()=>{new Uint8Array(c.memory.buffer,vp,v.byteLength).set(new Uint8Array(v.buffer));new Uint8Array(c.memory.buffer,tp,t.byteLength).set(new Uint8Array(t.buffer));});
 m('minZ',()=>c.prof_xml(vp,v.length,tp,t.length,0));
 m('vertexText',()=>c.prof_xml(vp,v.length,tp,t.length,1));
 m('triangleText',()=>c.prof_xml(vp,v.length,tp,t.length,2));
 const xml=m('wholeXml',()=>c.prof_xml(vp,v.length,tp,t.length,3));result.xmlBytes=xml.out;
 m('crc',()=>c.prof_crc());
 for(const l of [1,2,6])m('deflateL'+l,()=>c.prof_deflate_stream(l));
 m('copyOut',()=>new Uint8Array(c.memory.buffer,0,mf.out.byteLength).slice().buffer);
 result.stages=st;result.stagesCpu=cpu;
}
result.load.push(os.loadavg()[0]);
if(process.argv.includes('--json'))console.log(JSON.stringify(result));
else{const f=x=>x.toFixed(1);console.log(`STL ${f(result.stlMs)} ms (CPU ${f(result.stlCpu)}) · 3MF ${f(result.mfMs)} ms (CPU ${f(result.mfCpu)}) · ratio ${result.ratio.toFixed(2)}× wall, ${(result.mfCpu/result.stlCpu).toFixed(2)}× CPU (gate ≤ 1.30×) · ${result.mfBytes} B · load ${result.load.map(x=>x.toFixed(1)).join('/')} on ${result.cpus} CPUs`);
 if(result.stages){console.log(`  model XML ${result.xmlBytes} B; stage: wall ms (CPU ms)`);for(const [k,x] of Object.entries(result.stages))console.log(`  ${k.padEnd(13)} ${f(x)} (${f(result.stagesCpu[k])})`);}}
