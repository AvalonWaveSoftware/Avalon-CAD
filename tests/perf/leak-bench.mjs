// OCCT (and, section 4, mesh-core 3MF export) wasm-heap growth bench (ADR v2 WS0 port of v2/leak-bench.mjs; WS1 acceptance). Run from the repo root:
//   node tests/perf/leak-bench.mjs [--check]   (--check exits 1 when a WS1 budget is exceeded)
// The heap is the reserved OCCT wasm memory; it never shrinks, so growth after warm-up is what leaks cost.
import fs from 'node:fs';const R=process.cwd()+'/';
const {initKernel}=await import(R+'web/kernel.mjs');const {loadPyodide}=await import(R+'node_modules/pyodide/pyodide.mjs');
const {initLocalEngine}=await import(R+'web/local-engine.mjs');const {blank,object,defaults}=await import(R+'web/templates.mjs');const CS=await import(R+'web/cad-solid.mjs');
const {OCCT_SCOPE,OCCT_CACHE_ENTRIES}=await import(R+'web/perf-flags.mjs');
const K=await initKernel({solidOptions:false});await CS.initSolid();const MB=()=>CS.heapBytes()/1048576;
const E=await initLocalEngine(K,{loadPyodide,pythonURL:R+'node_modules/pyodide/',pythonSource:fs.readFileSync('engine/python/model_jobs.py','utf8'),rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
const types=['box','cylinder','sphere','tube','cone'];let id=0;const out={OCCT_SCOPE,OCCT_CACHE_ENTRIES,heapAfterInitMB:+MB().toFixed(1)};
const proj=n=>{const p=blank();for(let i=0;i<n;i++){const t=types[i%5];const q={...defaults[t]};q.h=(q.h||10)+i*.1;if(t==='sphere')q.diameter+=i*.1;const o=object(t,q,[(i%10)*35,Math.floor(i/10)*35,0]);o.layerId=p.activeLayer;p.objects.push(o);}return p;};
const run=d=>{const r=E.process({id:++id,...d});if(r.error)throw Error(r.error);return r;};
// 1. 300 cold topology builds + cache disposal (warm-up: 20 builds first).
const cold=i=>{CS.objectTopology(object('sphere',{diameter:20+i*.01}));CS.disposeSolidCache();};
for(let i=0;i<20;i++)cold(1000+i);let a=MB();for(let i=0;i<300;i++)cold(i);out.coldTopology300GrowthMB=+(MB()-a).toFixed(1);
// 2. 200 one-object moves at 30 distinct objects (the 20-entry cache thrashes, so every preview rebuilds topology).
CS.disposeSolidCache();const p=proj(30);run({type:'preview',project:p,tolerance:.15});for(let i=0;i<10;i++){p.objects[i%30].position[0]+=1;run({type:'preview',project:p,tolerance:.15});}
const MOVES=+(process.env.LEAK_MOVES||200),trace=[];a=MB();for(let i=0;i<MOVES;i++){p.objects[i%30].position[0]+=1;run({type:'preview',project:p,tolerance:.15});if(i%50===49)trace.push(+MB().toFixed(0));}out.movesHeapTraceMB=trace;out.moves200At30GrowthMB=+(MB()-a).toFixed(1);if(MOVES!==200)out.moves=MOVES;out.heapEndMB=+MB().toFixed(1);
// 3. ADR new-primitives §8.7: 300 cold torus topology builds (BRepPrimAPI_MakeTorus is deleted at once; WS1 found the
// primitive builders can leak inside OCCT). Runs after the existing patterns so their numbers are unchanged.
const coldTorus=i=>{CS.objectTopology(object('torus',{diameter:30+i*.01,tube:8}));CS.disposeSolidCache();};
for(let i=0;i<20;i++)coldTorus(1000+i);a=MB();for(let i=0;i<300;i++)coldTorus(i);out.coldTorus300GrowthMB=+(MB()-a).toFixed(1);
// 4. ADR-0001 F2a: 10 repeated 3MF exports of the 524k-triangle sphere on a fresh mesh-core instance. The model text
// (~38 MB) must stream through the deflater, never be held: wasm memory (which never shrinks) must not grow after
// export 1, and export 1's growth (inputs + package + one text chunk + compressor) must stay far below the text size.
{const {initRustMesh}=await import(R+'web/rust-mesh.mjs');const {unzip}=await import(R+'tests/three-mf-reader.mjs');
 const s=K.Manifold.sphere(25,1024);const m=s.getMesh();s.delete();const v=Float32Array.from(m.vertProperties),t=Uint32Array.from(m.triVerts);
 const rust=await initRustMesh({binary:fs.readFileSync('app/assets/mesh-core.wasm')});const mem=[rust.memoryBytes()];let pkg;
 for(let i=0;i<10;i++){pkg=rust.write3MF(v,t,true);mem.push(rust.memoryBytes());}
 globalThis.__sphere={v,t,pkg,rust};const text=unzip(pkg).find(e=>e.name==='3D/3dmodel.model').size;
 Object.assign(out,{sphere3mfMemoryMB:mem.map(x=>+(x/1048576).toFixed(2)),sphere3mfTextMB:+(text/1048576).toFixed(1),sphere3mfPackageMB:+(pkg.byteLength/1048576).toFixed(1),
  sphere3mfInputMB:+((v.byteLength+t.byteLength)/1048576).toFixed(1),sphere3mfGrowthAfter1MB:+((mem[10]-mem[1])/1048576).toFixed(2),sphere3mfFirstGrowthOfText:+((mem[1]-mem[0])/text).toFixed(3),sphere3mfFirstGrowthBeyondInputsOfText:+((mem[1]-mem[0]-v.byteLength-t.byteLength)/text).toFixed(3)});}
// 5. ADR-0001 F2a option A: the same 10 exports through a 4-worker 3MF pool (app/assets/export-pool.js on Node workers).
// Every pool worker's wasm memory must be flat from export 1 to export 10, and no worker may grow by more than 0.3x
// the model text on export 1 (each holds one part's records, one chunk, its deflater, and worker 0 the package).
{const {createPool}=await import(R+'web/export-3mf-pool.mjs');const {nodeWorker}=await import(R+'tests/node-web-worker.mjs');const {unzip}=await import(R+'tests/three-mf-reader.mjs');
 const {v,t,pkg,rust}=globalThis.__sphere,minZ=rust.prepare3MF(v,t,true),text=unzip(pkg).find(e=>e.name==='3D/3dmodel.model').size;
 const pool=createPool({size:4,script:'file://'+R+'app/assets/export-pool.js',binary:fs.readFileSync('app/assets/mesh-core.wasm'),makeWorker:nodeWorker});
 if(!await pool.ready)throw Error('pool did not start: '+pool.error);const mem=[await pool.memory()];let same=true;
 for(let i=0;i<10;i++){const b=await pool.encode({vertices:v,triangles:t,minZ});same&&=Buffer.from(b).equals(Buffer.from(pkg));mem.push(await pool.memory());}
 pool.dispose();const w=mem[0].map((_,j)=>mem.map(m=>m[j]));
 Object.assign(out,{sphere3mfPoolWorkerMemoryMB:w.map(x=>[x[0],x[1],x[10]].map(y=>+(y/1048576).toFixed(2))),sphere3mfPoolSameBytes:same,
  sphere3mfPoolGrowthAfter1MB:+Math.max(...w.map(x=>(x[10]-x[1])/1048576)).toFixed(2),sphere3mfPoolWorkerFirstGrowthOfText:+Math.max(...w.map(x=>(x[1]-x[0])/text)).toFixed(3)});
 if(!same)out.sphere3mfPoolBytesDiffer=1;}
const budgets={coldTopology300GrowthMB:5,moves200At30GrowthMB:10,coldTorus300GrowthMB:5,sphere3mfGrowthAfter1MB:0,sphere3mfFirstGrowthBeyondInputsOfText:0.3,sphere3mfPoolGrowthAfter1MB:0,sphere3mfPoolWorkerFirstGrowthOfText:0.3,sphere3mfPoolBytesDiffer:0};out.budgets=budgets;
const fail=Object.entries(budgets).filter(([k,v])=>out[k]>v);out.pass=!fail.length;console.log(JSON.stringify(out));
if(process.argv.includes('--check')&&fail.length)process.exit(1);
process.exit(0);
