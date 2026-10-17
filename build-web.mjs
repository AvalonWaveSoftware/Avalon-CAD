import {build} from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
const {BUNDLE_SPLIT}=await import('./web/perf-flags.mjs');
// WS9: with BUNDLE_SPLIT=false the UI's kernel-ui.mjs imports resolve to kernel.mjs again (the legacy single bundle).
const legacyKernel={name:'legacy-kernel',setup(b){b.onResolve({filter:/\/kernel-ui\.mjs$/},a=>BUNDLE_SPLIT||a.importer.endsWith(path.sep+'kernel.mjs')?undefined:{path:path.resolve('web/kernel.mjs')});}};
const ui=await build({entryPoints:['web/main.mjs'],outfile:'app/assets/main.js',bundle:true,format:'esm',platform:'browser',target:'chrome100',minify:true,metafile:true,plugins:[legacyKernel],external:['node:*','module','fs','path','crypto']});
// WS9 size guard (ADR: fail if main.js grows by more than 1 %). The reference is tools/main-js-size.json; after an
// intended change, update it in the same commit. Only the split bundle is guarded.
if(BUNDLE_SPLIT){const bytes=Object.values(ui.metafile.outputs).find(o=>o.entryPoint==='web/main.mjs').bytes,ref=JSON.parse(fs.readFileSync('tools/main-js-size.json','utf8'))['main.js'];
 const ui_inputs=Object.keys(Object.values(ui.metafile.outputs).find(o=>o.entryPoint==='web/main.mjs').inputs);
 const engine=ui_inputs.filter(f=>/replicad|cad-solid|web\/kernel\.mjs$|manifold-3d|pyodide/.test(f));
 if(engine.length)throw Error('main.js must not bundle engine modules: '+engine.join(', '));
 if(bytes>ref*1.01)throw Error(`main.js is ${bytes} B, more than 1 % over the ${ref} B reference (tools/main-js-size.json)`);}
await build({entryPoints:['web/worker.mjs'],outfile:'app/assets/worker.js',bundle:true,format:'esm',platform:'browser',target:'chrome100',minify:true,external:['node:*','module','fs','path','crypto']});
for(const [src,dst] of [['THIRD_PARTY_NOTICES.txt','app/assets/THIRD_PARTY_NOTICES.txt'],['web/index.html','app/assets/index.html'],['web/style.css','app/assets/style.css'],['node_modules/replicad-opencascadejs/dist/replicad_single.wasm','app/assets/cad-kernel.wasm'],['node_modules/manifold-3d/manifold.wasm','app/assets/manifold.wasm']])fs.copyFileSync(src,dst);
if(!fs.existsSync('app/assets/mesh-core.wasm'))throw Error('Run ./build-rust.sh before bundling the app.');
// WS7: with JS_ENGINE the worker never loads Pyodide, so app/assets/python is not shipped (-12.29 MB).
const {JS_ENGINE,PARALLEL_INIT}=await import('./web/perf-flags.mjs');
// WS8: the native shells (desktop/main.cjs, MainActivity) read the startup flag and the ?v= token from here.
fs.writeFileSync('app/assets/perf-flags.json',JSON.stringify({PARALLEL_INIT,version:JSON.parse(fs.readFileSync('package.json','utf8')).version})+'\n');
if(JS_ENGINE)fs.rmSync('app/assets/python',{recursive:true,force:true});
else{fs.mkdirSync('app/assets/python',{recursive:true});
for(const name of ['pyodide.mjs','pyodide.asm.js','pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json'])fs.copyFileSync('node_modules/pyodide/'+name,'app/assets/python/'+name);
fs.copyFileSync('engine/python/model_jobs.py','app/assets/python/model_jobs.py');}
// JS_ENGINE: Pyodide/CPython are not shipped, so the shipped notices and licenses drop them (the repo file keeps them
// for the JS_ENGINE=false build).
const PY_LICENSES=['Pyodide-MPL-2.0.txt','Python-3.13.2-License.txt'];
fs.rmSync('app/assets/licenses',{recursive:true,force:true});
if(fs.existsSync('licenses'))fs.cpSync('licenses','app/assets/licenses',{recursive:true,filter:f=>!(JS_ENGINE&&PY_LICENSES.some(n=>f.endsWith('/'+n)))});
if(JS_ENGINE){const t=fs.readFileSync('THIRD_PARTY_NOTICES.txt','utf8'),a=t.indexOf('Pyodide 0.29.3'),b=t.indexOf('Rust 1.90.0 standard library');
 if(a<0||b<a)throw Error('THIRD_PARTY_NOTICES.txt: Pyodide/CPython block not found');
 fs.writeFileSync('app/assets/THIRD_PARTY_NOTICES.txt',(t.slice(0,a)+t.slice(b)).replace('Local Python/Rust processing runtime (AvalonCad 2.0)','Local Rust processing runtime (AvalonCad 2.0)'));}
