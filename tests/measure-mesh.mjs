import assert from 'node:assert/strict';import fs from 'node:fs';
import {initRustMesh} from '../web/rust-mesh.mjs';
const binary=fs.readFileSync('app/assets/mesh-core.wasm'),wasm=await WebAssembly.compile(binary);
assert.ok(['measure_build','measure_slots','measure_node_bytes'].every(n=>WebAssembly.Module.exports(wasm).some(e=>e.name===n)),'BLOCKED: rebuild mesh-core.wasm (./build-rust.sh, Rust 1.90.0); the ADR-0002 measure exports are missing');
const R=await initRustMesh({binary});
const mesh=v=>({vertices:new Float32Array(v),triangles:new Uint32Array([0,1,2])}),a=mesh([0,0,0,2,0,0,0,2,0]);let checks=0;
for(const [b,w] of [[mesh([0,0,3,2,0,3,0,2,3]),3],[mesh([.5,.5,-1,.5,.5,1,2,2,0]),0],[mesh([3,0,0,4,0,0,3,1,0]),1],[mesh([0,0,0,0,0,0,0,0,0]),0]]){assert.ok(Math.abs(R.meshMinDistance(a,b)-w)<1e-3);assert.ok(Math.abs(R.meshMinDistance(b,a)-w)<1e-3);checks+=2;}
assert.throws(()=>R.meshMinDistance(a,{vertices:a.vertices,triangles:new Uint32Array([0,1,99])}));checks++;
// 500k coplanar triangles per mesh, a separated pair. Includes tree construction and ABI copies.
const size=500000,v=new Float32Array(size*9),t=new Uint32Array(size*3);for(let i=0;i<size;i++){const x=i%1000,y=Math.floor(i/1000);v.set([x,y,0,x+.8,y,0,x,y+.8,0],i*9);t.set([i*3,i*3+1,i*3+2],i*3);}const bv=v.slice();for(let i=2;i<bv.length;i+=3)bv[i]=3;
// ADR-0002: record mesh-core memory before/after; growth from the measure must stay ≤16 MB (scratch is ~7.0 MiB).
const memBefore=R.memoryBytes(),A={vertices:v,triangles:t},B={vertices:bv,triangles:t};assert.equal(R.meshMinDistance(A,B),3);const memAfter=R.memoryBytes(),growth=memAfter-memBefore;
assert.ok(growth<=16*1048576,`mesh-core grew ${(growth/1048576).toFixed(2)} MB during the 2×500k measure (gate ≤16 MB)`);
const times=[];for(let i=0;i<5;i++){const s0=performance.now();assert.equal(R.meshMinDistance(A,B),3);times.push(performance.now()-s0);}times.sort((x,y)=>x-y);const elapsed=times[2];
assert.ok(elapsed<=150,`mesh minimum distance median ${elapsed.toFixed(2)} ms exceeds 150 ms`);assert.equal(R.memoryBytes(),memAfter,'repeat measures reuse the freed scratch (no further growth)');
console.log(`PASS mesh measurement: ${checks+3} assertions; 2×500k median ${elapsed.toFixed(2)} ms of 5 (gate ≤150 ms); mesh-core ${(memBefore/1048576).toFixed(2)} → ${(memAfter/1048576).toFixed(2)} MB, growth ${(growth/1048576).toFixed(2)} MB (gate ≤16 MB)`);
