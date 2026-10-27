import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import {performance} from 'node:perf_hooks';
import * as THREE from 'three';
import {material,injectOverhang} from '../web/render-resources.mjs';
import {formatOverhang} from '../web/overhang.mjs';
import {initRustMesh} from '../web/rust-mesh.mjs';
import {overhangStats} from './overhang-reference.mjs';
const mesh=g=>({v:g.attributes.position.array,t:new Uint32Array(g.index.array)});
const wedge={v:new Float32Array([0,0,0,3,0,1,3,0,3,0,4,0,3,4,1,3,4,3]),t:new Uint32Array([0,3,4,0,4,1,0,1,2,3,5,4,1,4,5,1,5,2,0,2,5,0,5,3])};
const box=mesh(new THREE.BoxGeometry(30,20,10)),sphere=mesh(new THREE.SphereGeometry(10,256,128));
const inner=mesh(new THREE.BoxGeometry(26,16,6)),cavity={v:new Float32Array([...box.v,...inner.v]),t:new Uint32Array([...box.t,...Array.from(inner.t,(n,i)=>inner.t[i-i%3+(i%3===0?0:3-i%3)]+box.v.length/3)])};
const near=(a,b)=>assert.ok(Math.abs(a-b)<=Math.abs(b)*.001,`${a} ≈ ${b}`);
near(overhangStats(wedge.v,wedge.t).area,4*Math.sqrt(10));assert.equal(overhangStats(wedge.v,wedge.t).count,2);
// QA addendum 2026-10-27: faces on the build plate (lowest z) are left out, so a box on the bed has no overhang.
assert.deepEqual(overhangStats(box.v,box.t),{area:0,count:0});
assert.deepEqual(overhangStats(cavity.v,cavity.t),{area:416,count:2});
assert.deepEqual(overhangStats(wedge.v,new Uint32Array([0,0,0])),{area:0,count:0});
assert.deepEqual(overhangStats(box.v,box.t,1),{area:0,count:0});
// Three's sphere is Y-up; the cap is tested about world Z, just like CAD.
assert.ok(Math.abs(overhangStats(sphere.v,sphere.t).area/(2*Math.PI*100*(1-Math.SQRT1_2))-1)<.01);
assert.equal(formatOverhang({area:1230}),'Overhang: 12.3 cm²');
const params={color:0x77c9c0,flatShading:false},off=material('lambert',THREE.MeshLambertMaterial,params);
assert.equal(off,material('lambert',THREE.MeshLambertMaterial,params,false));
assert.equal(off.onBeforeCompile,THREE.Material.prototype.onBeforeCompile);
const on=material('lambert',THREE.MeshLambertMaterial,params,true);assert.notEqual(on,off);assert.equal(on,material('lambert',THREE.MeshLambertMaterial,params,true));
const shader={vertexShader:THREE.ShaderLib.lambert.vertexShader,fragmentShader:THREE.ShaderLib.lambert.fragmentShader,uniforms:{}};
for(const [s,target] of [[shader.vertexShader,'#include <beginnormal_vertex>'],[shader.fragmentShader,'#include <color_fragment>']])assert.equal(s.split(target).length,2);
injectOverhang(shader);assert.ok(shader.vertexShader.includes('mat3(modelMatrix)'));assert.ok(shader.fragmentShader.includes('normalize(vOverhangNormal).z'));assert.equal(shader.uniforms.overhangThreshold.value,Math.SQRT1_2);
// The cofactor transform matches inverse-transpose for rotation, reflection and nonuniform scale.
for(const scale of [[1,1,1],[-1,1,1],[2,3,.5]]){
 const m=new THREE.Matrix4().makeRotationX(Math.PI/3).scale(new THREE.Vector3(...scale));
 const a=new THREE.Vector3().setFromMatrixColumn(m,0),b=new THREE.Vector3().setFromMatrixColumn(m,1),c=new THREE.Vector3().setFromMatrixColumn(m,2),normal=new THREE.Vector3(0,0,-1);
 const co=new THREE.Vector3().crossVectors(a,b).multiplyScalar(-1/a.dot(new THREE.Vector3().crossVectors(b,c))).normalize();
 assert.ok(co.distanceTo(normal.applyMatrix3(new THREE.Matrix3().getNormalMatrix(m)).normalize())<1e-12);
}
const million=new Uint32Array(3_000_000);for(let i=0;i<million.length;i++)million[i]=[0,3,4][i%3];
const times=[];overhangStats(wedge.v,million);for(let i=0;i<5;i++){const start=performance.now();overhangStats(wedge.v,million);times.push(performance.now()-start);}times.sort((a,b)=>a-b);
console.log(`JS reference only: 1M triangles median ${times[2].toFixed(2)} ms; samples ${times.map(x=>x.toFixed(2)).join(', ')}; load ${os.loadavg().join(', ')}`);
console.log('Overhang reference, formatter and shader checks passed.');
if(!process.argv.includes('--reference-only')){
 const binary=fs.readFileSync(new URL('../app/assets/mesh-core.wasm',import.meta.url));
 if(!WebAssembly.Module.exports(new WebAssembly.Module(binary)).some(e=>e.name==='overhang_stats'))throw Error('mesh-core.wasm needs rebuild');
 const rust=await initRustMesh({binary:fs.readFileSync(new URL('../app/assets/mesh-core.wasm',import.meta.url))});
 for(const {v,t} of [wedge,box,sphere,cavity]){const expected=overhangStats(v,t),actual=rust.overhangStats(v,t);near(actual.area,expected.area);assert.equal(actual.count,expected.count);}
 rust.overhangStats(wedge.v,million);const samples=[];for(let i=0;i<5;i++){const start=performance.now();rust.overhangStats(wedge.v,million);samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);const elapsed=samples[2];
 // QA hand-check (addendum 2026-10-27): T shape, post 10×10×20 under a 40×40×5 plate. Plate underside 1600 − 100 = 1500 mm²;
 // the post bottom rests on the build plate and is left out: 15.0 cm².
 {const {initKernel}=await import('../web/kernel.mjs'),{initLocalEngine}=await import('../web/local-engine.mjs');
  const ob=(id,params,position)=>({id,name:id,type:'box',params,position,rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1'});
  const T={format:'tristancad',version:2,name:'T',objects:[ob('post',{w:10,d:10,h:20},[0,0,10]),ob('plate',{w:40,d:40,h:5},[0,0,22.5])],layers:[{id:'layer-1',name:'Layer 1'}],activeLayer:'layer-1'};
  const engine=await initLocalEngine(await initKernel(),{rust:{binary}});
  // Plate on/raised (QA addendum): a grounded export puts the T on the plate (1500); without grounding the plate is
  // z = 0, so the T at z = 0 still reads 1500 and the T raised 5 mm reads 1600 (its post bottom is a real overhang).
  const raised=structuredClone(T);for(const o of raised.objects)o.position[2]+=5;
  try{const cases=[[T,false,1500],[raised,false,1600],[raised,true,1500]].map(([project,ground,want],i)=>{const r=engine.process({id:10+i,type:'overhangStats',project,tolerance:.15,ground});assert.ok(Math.abs(r.area-want)<1e-6,`T ground=${ground} ${r.area} mm², want ${want}`);return `${ground?'grounded':'not grounded'} ${i===0?'on plate':'raised 5'} ${r.area}`;});
  console.log('T plate on/raised:',cases.join('; '));}finally{}
  try{const t=engine.process({id:1,type:'overhangStats',project:T,tolerance:.15,ground:true});assert.ok(Math.abs(t.area-1500)<1e-6,'T shape '+t.area+' mm²');assert.equal(formatOverhang(t),'Overhang: 15.0 cm²');console.log('T shape hand-check:',t.area,'mm² →',formatOverhang(t));}finally{engine.destroy();}}
 assert.ok(elapsed<=15,`Rust stats ${elapsed} ms > 15 ms`);console.log(`Rust 1M triangles median: ${elapsed.toFixed(2)} ms; samples ${samples.join(', ')}`);
}
