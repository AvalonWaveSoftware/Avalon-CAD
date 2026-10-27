import assert from 'node:assert/strict';
import fs from 'node:fs';
import {initKernel} from '../web/kernel.mjs';
import {initLocalEngine} from '../web/local-engine.mjs';
import {overhangStats} from './overhang-reference.mjs';
// Test-only adapter for the old binary: validates dispatch/cache/export isolation;
// strict overhang.mjs separately requires the actual new Rust export.
const binary=fs.readFileSync('app/assets/mesh-core.wasm');
const {instance}=await WebAssembly.instantiate(binary,{});
const source=fs.readFileSync('web/rust-mesh.mjs','utf8').replace("from './three-mf-parts.mjs'",'from '+JSON.stringify(new URL('../web/three-mf-parts.mjs',import.meta.url).href)).replace('engine_version()!==5','engine_version()!=='+instance.exports.engine_version());
const init=(await import('data:text/javascript,'+encodeURIComponent(source))).initRustMesh;
const rust=await init({binary});let calls=0;rust.overhangStats=(v,t)=>{calls++;return overhangStats(v,t);};
const runtime=await initLocalEngine(await initKernel(),{rust:{ready:Promise.resolve(rust)}});
try{
 // QA T shape (post 10×10×20 under a 40×40×5 plate): 1500 mm² once build-plate faces are left out.
 const ob=(id,params,position)=>({id,name:id,type:'box',params,position,rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1'});
 const project={format:'tristancad',version:2,name:'T',objects:[ob('post',{w:10,d:10,h:20},[0,0,10]),ob('plate',{w:40,d:40,h:5},[0,0,22.5])],layers:[{id:'layer-1',name:'Layer 1'}],activeLayer:'layer-1'},before=JSON.stringify(project),job={project,tolerance:.15,ground:true};
 const a=runtime.process({id:1,type:'export',...job});
 const stats=runtime.process({id:2,type:'overhangStats',...job});assert.ok(Math.abs(stats.area-1500)<1e-6,'T '+stats.area);assert.equal(calls,1);assert.equal(stats.id,2);
 const b=runtime.process({id:3,type:'export',...job});assert.deepEqual(new Uint8Array(a.buffer),new Uint8Array(b.buffer));assert.equal(calls,1);assert.equal(JSON.stringify(project),before);
 rust.overhangStats=()=>{throw Error('mesh-core.wasm needs rebuild');};assert.match(runtime.process({id:4,type:'overhangStats',...job}).error,/mesh-core.wasm needs rebuild/);
 const c=runtime.process({id:5,type:'export',...job});assert.deepEqual(new Uint8Array(a.buffer),new Uint8Array(c.buffer));
 console.log('PASS: stats dispatch through export assembly/cache, unchanged project and byte-identical STL before/after stats and stats failure (test-only oracle).');
}finally{runtime.destroy();}
