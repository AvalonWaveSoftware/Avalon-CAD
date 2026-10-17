import {build} from 'esbuild';
import fs from 'node:fs';
await build({entryPoints:['web/main.mjs'],outfile:'app/assets/main.js',bundle:true,format:'esm',platform:'browser',target:'chrome100',minify:true,external:['node:*','module','fs','path','crypto']});
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
