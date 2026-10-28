// Test-only oracle: verifies routing/ownership even before the Rust binary is rebuilt.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MessageChannel,Worker} from 'node:worker_threads';
import {initKernel} from '../web/kernel.mjs';
import {initLocalEngine} from '../web/local-engine.mjs';
import {initRustMesh} from '../web/rust-mesh.mjs';
import {needsSolid} from '../web/solid-gate.mjs';
import {zip,model,reference} from './import-3mf-reference.mjs';
import {weldExactReference} from './stl-weld-reference.mjs';
const bytes=()=>{const b=zip(model([0,0,0,1,0,0,0,1,0],[0,1,2]));return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);};
let decodes=0;
const runtime=await initLocalEngine(await initKernel(),{rust:{ready:Promise.resolve({version:7,weldExact(v,t){decodes++;const w=weldExactReference(v,t);return {vertices:Float32Array.from(w.vertices),triangles:Uint32Array.from(w.triangles)};}})}});
const {port1,port2}=new MessageChannel();
try{
 const buffer=bytes(),received=new Promise(resolve=>port2.once('message',resolve));port1.postMessage({id:42,type:'import3MF',buffer},[buffer]);assert.equal(buffer.byteLength,0);
 const job=await received;assert.equal(needsSolid(job),false);const out=await runtime.process(job);assert.equal(out.id,42);assert.equal(out.vertices.length,9);assert.equal(out.triangles.length,3);assert.equal(decodes,1);
 await assert.rejects(()=>runtime.process({type:'import3MF',buffer:new ArrayBuffer(50*1024*1024+1)}),/50 MB/);assert.equal(decodes,1);
 await assert.rejects(()=>runtime.process({type:'import3MF',buffer:new ArrayBuffer(2)}),/3MF/);
 const returned=new Promise(resolve=>port1.once('message',resolve));port2.postMessage(out,[out.vertices.buffer,out.triangles.buffer]);assert.equal(out.vertices.byteLength,0);assert.equal((await returned).vertices.length,9);
 assert.equal(needsSolid({type:'importSTL'}),false);assert.equal(needsSolid({type:'encode3mf'}),false);assert.equal(needsSolid({type:'unknown'}),true);
}finally{port1.close();port2.close();runtime.destroy();}
console.log('PASS lazy 3MF dispatch, cap, transferred input/output, no solid gate, single Rust weld.');
if(process.argv.includes('--bundles')){
 const failures=[];for(const bundle of ['worker.js','worker-sidecar.js','worker-android.js']){
  const worker=new Worker(new URL('./android-occt-thread.mjs',import.meta.url),{workerData:{bundle}});
  try{const buffer=bytes();const reply=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error(bundle+' import timeout')),20000);worker.on('error',reject);worker.on('message',data=>{if(data.type?.startsWith('occt')){clearTimeout(timer);reject(Error(bundle+' started OCCT'));}if(data.id===42){clearTimeout(timer);resolve(data);}});});worker.postMessage({id:42,type:'import3MF',buffer},[buffer]);assert.equal(buffer.byteLength,0);const out=await reply;assert.ok(!out.error,out.error);assert.equal(out.vertices.length,9);assert.equal(out.triangles.length,3);console.log('PASS '+bundle+' 3MF import without OCCT');}catch(e){failures.push(bundle+': '+e.message);console.error(failures.at(-1));}finally{await worker.terminate();}
 }
 assert.deepEqual(failures,[]);
}
