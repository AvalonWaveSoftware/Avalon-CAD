import {readSTLTyped,weldExact} from '../web/worker-stl.mjs';
// Architect 2026-10-18 10:25: fresh imports weld; existing saves never do.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {readSTL,validateProject} from '../web/kernel-ui.mjs';
import {initKernel,writeSTL,buildModel} from '../web/kernel.mjs';
import {initRustMesh} from '../web/rust-mesh.mjs';
import {initLocalEngine} from '../web/local-engine.mjs';
import {blank,object,plate,tray,defaults,advancedDefaults} from '../web/templates.mjs';
import {forWrite,migrateProject} from '../web/migrate.mjs';
import {weldExactReference} from './stl-weld-reference.mjs';
import {sphereSTL,tetraSTL} from './stl-weld-fixtures.mjs';
const bytes=fs.readFileSync('app/assets/mesh-core.wasm'),module=await WebAssembly.compile(bytes);
const referenceOnly=process.argv.includes('--reference');
if(!referenceOnly)assert.ok(WebAssembly.Module.exports(module).some(x=>x.name==='weld_exact'),'mesh-core.wasm needs rebuild: run ./build-rust.sh with the pinned toolchain');
assert.ok(bytes.length<=120000);
const originalWasm=execFileSync('git',['show','6e08e75:app/assets/mesh-core.wasm']);
const originalExports=WebAssembly.Module.exports(await WebAssembly.compile(originalWasm));
for(const entry of originalExports)assert.ok(WebAssembly.Module.exports(module).some(x=>x.name===entry.name&&x.kind===entry.kind),'Existing wasm export '+entry.name);
// Reference mode uses a test-only wrapper accepting the shipped ABI; production remains strict.
const shipped=(await WebAssembly.instantiate(bytes,{})).instance.exports.engine_version();
const referenceRust=referenceOnly?(await import('data:text/javascript,'+encodeURIComponent(fs.readFileSync('web/rust-mesh.mjs','utf8').replace("from './three-mf-parts.mjs'",'from '+JSON.stringify(new URL('../web/three-mf-parts.mjs',import.meta.url).href)).replace('engine_version()!==7','engine_version()!=='+shipped)))).initRustMesh:initRustMesh;
const rust=await referenceRust({binary:bytes});
if(referenceOnly)rust.weldExact=(v,t)=>{const w=weldExactReference(v,t);return {vertices:Float32Array.from(w.vertices),triangles:Uint32Array.from(w.triangles)};};
const base=fileURLToPath(new URL('./.stl-weld-base/',import.meta.url));fs.rmSync(base,{force:true,recursive:true});fs.mkdirSync(base,{recursive:true});fs.cpSync('web',base+'web',{recursive:true});
for(const name of ['kernel-ui.mjs','local-engine.mjs','rust-mesh.mjs'])fs.writeFileSync(base+'web/'+name,execFileSync('git',['show','6e08e75:web/'+name]));
try{
 const oldUI=await import(base+'web/kernel-ui.mjs'),oldKernel=await import(base+'web/kernel.mjs'),oldEngine=await import(base+'web/local-engine.mjs');
 const K=await initKernel(),K0=await oldKernel.initKernel(),baselineBytes=originalWasm;
 const baselineRust=await (await import(base+'web/rust-mesh.mjs')).initRustMesh({binary:baselineBytes});
 const engine=await initLocalEngine(K,{rust:{ready:Promise.resolve(rust)}}),baseline=await oldEngine.initLocalEngine(K0,{rust:{binary:baselineBytes}});
 const project=mesh=>({...blank(),objects:[{...object('mesh',{mesh}),id:'fixture',name:'tetra'}]});
 function cornerBytes(m){const a=Float32Array.from(m.vertices),out=new Uint32Array(m.triangles.length*3),bits=new Uint32Array(a.buffer);for(let i=0;i<m.triangles.length;i++)out.set(bits.subarray(m.triangles[i]*3,m.triangles[i]*3+3),i*3);return Buffer.from(out.buffer);}
 const fixtures=[['imported-stl / tetra.stl',tetraSTL()]];
 for(const name of execFileSync('git',['ls-files','-z','tests'],{encoding:'utf8'}).split('\0').filter(n=>/\.stl$/i.test(n))){const b=fs.readFileSync(name);fixtures.push([name,Uint8Array.from(b).buffer]);}
 // Existing generated STL import cases: templates and all default primitives.
 for(const [name,p] of [['plate',plate()],['tray',tray()],...Object.entries({...defaults,...advancedDefaults}).filter(([n])=>n!=='glyph').map(([n,p])=>[n,{...blank(),objects:[object(n,structuredClone(p))]}])]){
  const saved=JSON.stringify(forWrite(p));
  for(const ground of [false,true]){const a=baseline.process({id:20,type:'export',project:p,ground,tolerance:.15}),b=engine.process({id:20,type:'export',project:p,ground,tolerance:.15});assert.ok(!a.error,a.error);assert.ok(!b.error,b.error);assert.deepEqual(Buffer.from(a.buffer),Buffer.from(b.buffer),name+' non-import STL');}
  assert.equal(JSON.stringify(forWrite(p)),saved,name+' non-import save');
  const m=oldKernel.buildModel(K0,p,.15);fixtures.push([name,oldKernel.writeSTL(m.vertices,m.triangles)]);
 }
 console.log('PASS 19 non-import models: both STL ground settings and unchanged saves');
 for(const [name,buffer] of fixtures){
  const original=oldUI.readSTL(buffer),parsed=readSTLTyped(buffer),actual=referenceOnly?weldExact(rust,parsed.vertices,parsed.triangles):await engine.process({id:10,type:'importSTL',buffer}),expected=weldExactReference(original.vertices,original.triangles);
  assert.deepEqual(actual.vertices,Float32Array.from(expected.vertices),name);assert.deepEqual(actual.triangles,Uint32Array.from(expected.triangles),name);assert.deepEqual(cornerBytes(original),cornerBytes(actual),name);
  const welded={vertices:Array.from(actual.vertices),triangles:Array.from(actual.triangles)};
  assert.deepEqual(baselineRust.prepareIndexed(Float32Array.from(original.vertices),Uint32Array.from(original.triangles)),rust.prepareIndexed(actual.vertices,actual.triangles),name+' display');
  for(const ground of [false,true]){
   assert.deepEqual(Buffer.from(oldKernel.writeSTL(original.vertices,original.triangles,ground)),Buffer.from(writeSTL(welded.vertices,welded.triangles,ground)),name+' direct');
   const a=baseline.process({id:1,type:'export',project:project(original),ground,tolerance:.15}),b=engine.process({id:1,type:'export',project:project(welded),ground,tolerance:.15});assert.ok(!a.error,a.error);assert.ok(!b.error,b.error);assert.deepEqual(Buffer.from(a.buffer),Buffer.from(b.buffer),name+' worker/Manifold');
  }
  const before=JSON.stringify(forWrite(project(original)),null,2),opened=validateProject(migrateProject(JSON.parse(before)));assert.equal(JSON.stringify(forWrite(opened),null,2),before,name+' existing save');
  assert.deepEqual(JSON.parse(JSON.stringify(forWrite(project(welded)))).objects[0].params.mesh,JSON.parse(JSON.stringify(expected)),name+' fresh welded save');
  console.log('PASS fixture',name,original.vertices.length/3,'->',welded.vertices.length/3);
 }
 const buffer=sphereSTL(),p=readSTLTyped(buffer),t=performance.now(),w=weldExact(rust,p.vertices,p.triangles);console.log(referenceOnly?'JS reference 524288 weld ms':'Rust 524288 weld ms',performance.now()-t);assert.equal(w.vertices.length,262146*3);assert.deepEqual(cornerBytes(p),cornerBytes(w));
 if(!referenceOnly){
 const result=await engine.process({id:2,type:'importSTL',buffer});assert.equal(result.vertices.length,262146*3);validateProject(project({vertices:Array.from(result.vertices),triangles:Array.from(result.triangles)}));
 const signed=weldExact(rust,new Float32Array([0,0,0,-0,0,0,0,0,0]),new Uint32Array([0,1,2]));assert.equal(signed.vertices.length,6);assert.ok(Object.is(signed.vertices[3],-0));
 assert.throws(()=>weldExact(rust,new Float32Array([NaN,0,0]),new Uint32Array([0,0,0])),/Invalid imported mesh/);
 const over=new Float32Array(3000006);for(let i=0;i<over.length/3;i++)over[i*3]=i;
 const overBuffer=writeSTL(over,Uint32Array.from({length:1000002},(_,i)=>i),false);
 await assert.rejects(async()=>engine.process({id:4,type:'importSTL',buffer:overBuffer}),/Invalid imported mesh/);
 const tooMany=new ArrayBuffer(84+1000001*50);new DataView(tooMany).setUint32(80,1000001,true);assert.throws(()=>readSTLTyped(tooMany),/STL exceeds 1 million triangles/);
 assert.throws(()=>readSTLTyped(new TextEncoder().encode("solid empty\nendsolid").buffer),/Invalid STL file/);
 const times=[];for(let i=0;i<5;i++){const start=performance.now();await engine.process({id:3,type:'importSTL',buffer});times.push(performance.now()-start);}const oldTimes=[];for(let i=0;i<5;i++){const start=performance.now();oldUI.readSTL(buffer);oldTimes.push(performance.now()-start);}const median=a=>[...a].sort((a,b)=>a-b)[2];console.log('parse+weld median ms',median(times),'baseline',median(oldTimes),{times,oldTimes});assert.ok(median(times)<=2*median(oldTimes),'524k import <= 2x baseline parse');
 }
 engine.destroy();baseline.destroy();
}finally{fs.rmSync(base,{force:true,recursive:true});}
console.log(referenceOnly?'PASS test-only reference identity (Rust pending)':'PASS Rust STL weld acceptance');
