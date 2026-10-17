// OCCT wasm-heap growth bench (ADR v2 WS0 port of v2/leak-bench.mjs; WS1 acceptance). Run from the repo root:
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
const budgets={coldTopology300GrowthMB:5,moves200At30GrowthMB:10};out.budgets=budgets;
const fail=Object.entries(budgets).filter(([k,v])=>out[k]>v);out.pass=!fail.length;console.log(JSON.stringify(out));
if(process.argv.includes('--check')&&fail.length)process.exit(1);
