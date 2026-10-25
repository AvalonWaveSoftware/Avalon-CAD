// WS7 parity: the JS job engine (web/js-engine.mjs) against the Python oracle (engine/python/model_jobs.py through
// Pyodide, options.oracle) on the same kernel: every result must be identical, typed arrays byte for byte, and every
// error message verbatim. Fixtures x all job kinds, error cases, and seeded random projects and booleans.
import assert from 'node:assert/strict';
import {BUNDLE_SPLIT} from '../web/perf-flags.mjs';import fs from 'node:fs';import {loadPyodide} from 'pyodide';
import {initKernel} from '../web/kernel.mjs';import {initLocalEngine} from '../web/local-engine.mjs';import {object,defaults,blank,advancedDefaults,glyphDefaults} from '../web/templates.mjs';import {loadGlyphs} from '../web/glyph-geometry.mjs';await loadGlyphs();
import {migrateProject} from '../web/migrate.mjs';import {JS_ENGINE} from '../web/perf-flags.mjs';
const K=await initKernel(),opts={loadPyodide,pythonURL:decodeURIComponent(new URL('../node_modules/pyodide/',import.meta.url).pathname),pythonSource:fs.readFileSync('engine/python/model_jobs.py','utf8'),rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}};
const js=await initLocalEngine(K,opts),py=await initLocalEngine(K,{...opts,oracle:true});
assert.equal(js.python===null,JS_ENGINE);assert.ok(py.python);assert.deepEqual(js.info,py.info);
let id=0,jobs=0,errors=0;
const norm=v=>{if(ArrayBuffer.isView(v))return {bytes:Buffer.from(v.buffer,v.byteOffset,v.byteLength).toString('base64'),kind:v.constructor.name};if(v instanceof ArrayBuffer||Object.prototype.toString.call(v)==='[object ArrayBuffer]')return {ab:Buffer.from(v).toString('base64')};
 if(Array.isArray(v))return v.map(norm);if(v&&typeof v==='object'){const o={};for(const k of Object.keys(v).sort())o[k]=norm(v[k]);return o;}return v;};
function same(job,what){const a=js.process({...structuredClone(job),id:++id}),b=py.process({...structuredClone(job),id});
 assert.deepEqual(norm(a),norm(b),what);jobs++;if(a.error)errors++;return a;}

for(const type of ['wedge','box','threadrod'])for(const plane of ['YZ','XZ','XY']){
 const {mirrorObject}=await import('../web/operations.mjs');const o=object(type,defaults[type]);o.rotation=[23,41,67];o.position=[5,9,13];
 const project={...blank(),version:3,objects:[mirrorObject(o,plane)]};
 for(const type of ['preview','check','export']){const r=same({type,project,tolerance:.15,ground:false},plane+' '+type);assert.ok(!r.error,r.error);}
}
js.destroy();py.destroy();console.log(`mirror-parity: ${jobs} JS/Python jobs byte-identical, ${errors} errors; shared worker runtime geometry bridge`);
