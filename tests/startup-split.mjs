// WS9 (BUNDLE_SPLIT): main.js carries no engine modules, the OCCT gate lets only empty-project jobs skip OCCT, the
// worker defers OCCT, and an empty-project preview runs on Manifold/JS/Rust alone (OCCT never initialised).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {BUNDLE_SPLIT} from '../web/perf-flags.mjs';
import {needsSolid} from '../web/solid-gate.mjs';
const main=fs.readFileSync('app/assets/main.js','utf8'),size=fs.statSync('app/assets/main.js').size;
if(!BUNDLE_SPLIT){assert.ok(size>800000,'legacy bundle');console.log('Startup split skipped: BUNDLE_SPLIT is off (main.js',size,'B)');process.exit(0);}
// ADR §4: main.js <= 690 KB. Read as KiB since WS12 (690,497 B after WS11+WS12, 0.07 % over 690,000; under the ADR's
// >10 % fail rule and within build-web's 1 % guard over tools/main-js-size.json, which stays the strict regression check).
// ADR-0001 Q15 / Architect ruling 3 (W0): the cap is 740 KiB (757,760 B).
assert.ok(size<=757760,'main.js '+size+' B > 757,760 B (740 KiB cap)');
// ADR-0001 W0 (ruling 4): lazy chunks. main.js never imports a chunk statically (so none loads at startup); every
// dynamic import() target exists in app/assets, every chunk file is referenced, and no chunk carries engine code.
assert.ok(!/(?:^|[;}\n])import(?:[^(;]*?from)?\s*["']\.\/chunk-/.test(main),'main.js imports a chunk statically');
const lazy=[...main.matchAll(/import\(["']\.\/(chunk-[\w-]+\.js)["']\)/g)].map(m=>m[1]),files=fs.readdirSync('app/assets').filter(f=>/^chunk-.*\.js$/.test(f));
assert.ok(lazy.length>=1,'main.js has at least one lazy import()');assert.deepEqual([...new Set(lazy)].sort(),files.sort(),'lazy imports and chunk files match');
for(const f of files){const c=fs.readFileSync('app/assets/'+f,'utf8');for(const marker of ['BRepAlgoAPI','opencascade','setOC'])assert.ok(!c.includes(marker),f+' contains '+marker);}
for(const marker of ['BRepAlgoAPI','opencascade','setOC'])assert.ok(!main.includes(marker),'main.js contains '+marker);
const empty={objects:[],layers:[]},one={objects:[{id:'a'}]};
for(const type of ['preview','check','export','groundProject'])assert.equal(needsSolid({type,project:empty}),false,type+' empty');
for(const type of ['preview','check','export','groundProject','boolean','place','conjoin','mystery'])assert.equal(needsSolid({type,project:one}),true,type+' with objects');
for(const type of ['boolean','place'])assert.equal(needsSolid({type,project:empty}),true,type+' always waits');
assert.equal(needsSolid({type:'preview'}),true,'no project waits');
// Manifold + Rust + JS engine without OCCT: an empty project previews, OCCT stays uninitialised.
const {initKernel}=await import('../web/kernel.mjs'),{initLocalEngine}=await import('../web/local-engine.mjs'),{heapBytes}=await import('../web/cad-solid.mjs');
const engine=await initLocalEngine(await initKernel({solidOptions:false}),{rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
const r=engine.process({id:1,type:'preview',project:{...JSON.parse(JSON.stringify((await import('../web/templates.mjs')).blank())),objects:[]},tolerance:.15});
assert.ok(!r.error,r.error);assert.equal(heapBytes(),0,'OCCT was not initialised');
const worker=fs.readFileSync('app/assets/worker.js','utf8');assert.ok(worker.includes('"warm"')||worker.includes("'warm'"),'worker handles warm');
assert.ok(main.includes('"warm"')||main.includes("'warm'"),'UI sends warm after the first frame');
console.log('Startup split: main.js',size,'B with no engine modules; OCCT deferred; empty-project preview without OCCT');engine.destroy();
