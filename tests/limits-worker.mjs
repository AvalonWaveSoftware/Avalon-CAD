// limits-3.0 rev6 (Waydroid QA D1): the geometry worker's memory on a 523k-triangle import (place, check, preview as Apply & add
// runs them), on the real local engine. Three guarantees:
//  1. Cache keys of a big mesh are small and still tell meshes apart (a 19 MB JSON key per cache layer was the biggest JS-heap user).
//  2. WebAssembly memory: with a simulated phone that refuses WebAssembly.Memory.grow() past 300 MB in total, the three jobs run
//     (before: Manifold's heap reached 368 MB on this sample; a refused grow made malloc return 0 and the job trapped with "RuntimeError:
//     memory access out of bounds" / "table index is out of bounds", the QA trap).
//  3. JS heap: the worker side keeps under 70 MB over its starting heap after the three jobs, measured after a forced GC (the
//     page's own copy of the arrays is not counted).
//   node --expose-gc tests/limits-worker.mjs
import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';import fs from 'node:fs';import v8 from 'node:v8';
const CAP=300*1048576,mems=new Set();let refused=0;const grow=WebAssembly.Memory.prototype.grow;
WebAssembly.Memory.prototype.grow=function(n){mems.add(this);const total=[...mems].reduce((t,m)=>t+m.buffer.byteLength,0);if(total+n*65536>CAP){refused++;throw new RangeError('WebAssembly.Memory.grow(): simulated device limit');}return grow.call(this,n);};
const R=fileURLToPath(new URL('..',import.meta.url)).replace(/\/$/,'');const imp=m=>import(R+'/web/'+m);
const {initKernel}=await imp('kernel.mjs'),{initLocalEngine}=await imp('local-engine.mjs'),{object,blank}=await imp('templates.mjs'),{hashedKey}=await imp('mesh-key.mjs'),{revisionKey}=await imp('kernel.mjs'),{cloneLean,validateProject}=await imp('kernel-ui.mjs');
// The Waydroid QA sample: an N x M UV sphere (radius 50, resting on z=0) with shared top-pole vertices and, because sin(pi) is not
// exactly 0, a south pole of M distinct points about 1e-14 apart. 512 x 512 is 523,264 triangles (QA's large523k.stl, byte for byte
// after the 80-byte header).
function qaSTL(N,M,R=50){const p=(i,j)=>{const th=Math.PI*i/N,ph=2*Math.PI*j/M;return [R*Math.sin(th)*Math.cos(ph),R*Math.sin(th)*Math.sin(ph),R+R*Math.cos(th)].map(Math.fround);},t=[];
 for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=p(i,j),b=p(i+1,j),c=p(i+1,j+1),e=p(i,j+1);if(i>0)t.push([a,b,e]);if(i<N-1)t.push([b,c,e]);}
 const b=Buffer.alloc(84+50*t.length);b.write('QA',0);b.writeUInt32LE(t.length,80);t.forEach((tr,k)=>tr.forEach((v,j)=>v.forEach((c,i)=>b.writeFloatLE(c,84+k*50+12+j*12+i*4))));return b;}
const K=await initKernel(),E=await initLocalEngine(K,{rust:{binary:fs.readFileSync(R+'/app/assets/mesh-core.wasm')}});
// importSTL as the worker runs it (weld in Rust), then the arrays the page builds from the result
const stl=qaSTL(512,512),buf=stl.buffer.slice(stl.byteOffset,stl.byteOffset+stl.byteLength),imported=await E.process({id:1,type:'importSTL',buffer:buf});assert.ok(!imported.error,'importSTL: '+imported.error);
const plain=t=>{const a=new Array(t.length);for(let i=0;i<a.length;i++)a[i]=t[i];return a;};
const mesh={vertices:plain(imported.vertices),triangles:plain(imported.triangles)},tris=mesh.triangles.length/3;assert.equal(tris,523264,'fixture size '+tris);
const o={...object('mesh',{mesh},[0,0,0],'big'),layerId:'layer-1'};
// 1. keys
{const k=hashedKey([o.type,o.params]);assert.ok(k.length<400,'a 523k-triangle mesh key is '+k.length+' characters');assert.equal(revisionKey([o.type,o.params]),k,'revisionKey is the same key');
 const m2={vertices:mesh.vertices.slice(),triangles:mesh.triangles};m2.vertices[1234567]+=1e-3;assert.notEqual(hashedKey([o.type,{mesh:m2}]),k,'one changed coordinate changes the key');
 assert.equal(hashedKey([o.type,{mesh:{vertices:mesh.vertices.slice(),triangles:mesh.triangles}}]),k,'an equal copy has the same key');
 const small={a:[1,2,3],b:'x'};assert.equal(hashedKey(small),JSON.stringify(small),'small values keep their exact JSON key');
 // cloneLean shares the mesh arrays and copies everything else; with no mesh it is structuredClone
 const c=cloneLean(o);assert.ok(c.params.mesh.vertices===o.params.mesh.vertices&&c!==o&&c.position!==o.position,'cloneLean shares only the mesh arrays');const b=object('box',{w:1,d:2,h:3},[0,0,0],'b');assert.deepEqual(cloneLean(b),structuredClone(b));}
// 2./3. the three jobs
const post=m=>structuredClone(m),p=structuredClone(blank());p.objects.push(o);
const heap=()=>{global.gc();return v8.getHeapStatistics().used_heap_size/1048576;};
// what the page keeps (the project's arrays, about 25 MB) is not the worker's: measure the worker side as the growth over this baseline
const base=heap();
const place=await E.process(post({id:2,type:'place',object:o,position:[0,0,0],floor:false}));assert.ok(!place.error,'place: '+place.error);
const check=await E.process(post({id:3,type:'check',project:p,tolerance:.15}));assert.ok(!check.error,'check: '+check.error);
const prev=await E.process(post({id:4,type:'preview',project:p,tolerance:.15}));assert.ok(!prev.error,'preview: '+prev.error);
assert.equal(refused,0,'no WebAssembly.Memory.grow was refused below 300 MB (a refused grow is the QA trap)');
assert.ok(Math.abs(check.volume-523580.7)<1&&prev.triangles.length/3>tris*.99,'results are those of the full mesh: volume '+check.volume+', preview triangles '+prev.triangles.length/3);
const wasmMB=Math.round([...mems].reduce((t,m)=>t+m.buffer.byteLength,0)/1048576),heapMB=Math.round(heap()-base);
assert.ok(wasmMB<=300,'wasm '+wasmMB+' MB');assert.ok(heapMB<=70,'worker JS heap '+heapMB+' MB over the baseline after the three jobs');
console.log(`PASS: limits-worker: ${tris} triangles, place/check/preview under a 300 MB wasm cap (${wasmMB} MB, 0 refused grows), worker JS heap +${heapMB} MB after GC, mesh cache key ${hashedKey([o.type,o.params]).length} characters`);
process.exit(0);
