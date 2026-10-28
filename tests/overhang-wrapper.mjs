import assert from 'node:assert/strict';
import {initRustMesh} from '../web/rust-mesh.mjs';
// Exercise the real ownership wrapper with an instrumented ABI, never a shipped fallback.
const original=WebAssembly.instantiate,memory=new WebAssembly.Memory({initial:1});
let next=8,code=0,expectGround=1;const live=new Map();
const core={memory,engine_version:()=>6,mesh_alloc(n){const p=next;next+=Math.ceil(n/8)*8;live.set(p,n);return p;},mesh_free(p,n){assert.equal(live.get(p),n);live.delete(p);},overhang_stats(vp,nv,tp,nt,threshold,ground,out){assert.equal(ground,expectGround);assert.deepEqual([...new Float32Array(memory.buffer,vp,nv)],[0,0,0,0,2,0,3,0,0]);assert.deepEqual([...new Uint32Array(memory.buffer,tp,nt)],[0,1,2]);assert.equal(threshold,Math.SQRT1_2);new Float64Array(memory.buffer,out,2).set([3,1]);return code;}};
try{
 WebAssembly.instantiate=async()=>({instance:{exports:core}});
 const rust=await initRustMesh({binary:new Uint8Array()});
 const v=new Float32Array([0,0,0,0,2,0,3,0,0]),t=new Uint32Array([0,1,2]);
 assert.deepEqual(rust.overhangStats(v,t),{area:3,count:1});assert.equal(live.size,0);
 expectGround=0;assert.deepEqual(rust.overhangStats(v,t,Math.SQRT1_2,false),{area:3,count:1});assert.equal(live.size,0);expectGround=1;
 code=1;assert.throws(()=>rust.overhangStats(v,t),/Invalid geometry buffers/);assert.equal(live.size,0);
 delete core.overhang_stats;assert.throws(()=>rust.overhangStats(v,t),/mesh-core.wasm needs rebuild/);assert.equal(live.size,0);
 assert.deepEqual([...v],[0,0,0,0,2,0,3,0,0]);assert.deepEqual([...t],[0,1,2]);
}finally{WebAssembly.instantiate=original;}
console.log('PASS: overhang wrapper inputs, threshold, result and allocation cleanup on success/error/missing export.');
