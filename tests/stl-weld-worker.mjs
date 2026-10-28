// Parse+weld dispatch without a rebuilt wasm: the oracle is injected only in this test.
import assert from 'node:assert/strict';
import {MessageChannel} from 'node:worker_threads';
import {initKernel} from '../web/kernel.mjs';
import {initLocalEngine} from '../web/local-engine.mjs';
import {needsSolid} from '../web/solid-gate.mjs';
import {tetraSTL} from './stl-weld-fixtures.mjs';
import {weldExactReference} from './stl-weld-reference.mjs';
const runtime=await initLocalEngine(await initKernel(),{rust:{ready:Promise.resolve({version:7,weldExact(v,t){const w=weldExactReference(v,t);return {vertices:Float32Array.from(w.vertices),triangles:Uint32Array.from(w.triangles)};}})}});
const buffer=tetraSTL(),{port1,port2}=new MessageChannel();
try{
 const received=new Promise(resolve=>port2.once('message',resolve));port1.postMessage({id:1,type:'importSTL',buffer},[buffer]);assert.equal(buffer.byteLength,0);
 const job=await received;assert.equal(needsSolid(job),false);const result=await runtime.process(job);assert.equal(result.vertices.length,12);assert.equal(result.triangles.length,12);assert.equal(result.id,1);
 assert.equal(needsSolid({type:'encode3mf'}),false);assert.equal(needsSolid({type:'unknown'}),true);
 console.log('PASS transferred STL dispatch, post-weld result, no solid gate; test-only oracle');
}finally{port1.close();port2.close();runtime.destroy();}

// With rebuilt wasm, exercise all three shipped transports and reject any OCCT startup request.
if(process.argv.includes('--bundles')){
 const {Worker}=await import('node:worker_threads');
 for(const bundle of ['worker.js','worker-sidecar.js','worker-android.js']){
  const worker=new Worker(new URL('./android-occt-thread.mjs',import.meta.url),{workerData:{bundle}});
  try{
   const input=tetraSTL();const reply=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error(bundle+' import timeout')),20000);worker.on('error',reject);worker.on('message',data=>{if(data.type?.startsWith('occt')){clearTimeout(timer);reject(Error(bundle+' started OCCT'));}if(data.id===42){clearTimeout(timer);resolve(data);}});});
   worker.postMessage({id:42,type:'importSTL',buffer:input},[input]);assert.equal(input.byteLength,0);
   const result=await reply;assert.ok(!result.error,result.error);assert.equal(result.vertices.length,12);assert.equal(result.triangles.length,12);console.log('PASS '+bundle+' transferred import, no OCCT');
  }finally{await worker.terminate();}
 }
}
