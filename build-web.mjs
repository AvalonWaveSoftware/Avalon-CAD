import {build} from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
const {BUNDLE_SPLIT}=await import('./web/perf-flags.mjs');
// WS9: with BUNDLE_SPLIT=false the UI's kernel-ui.mjs imports resolve to kernel.mjs again (the legacy single bundle).
const legacyKernel={name:'legacy-kernel',setup(b){b.onResolve({filter:/\/kernel-ui\.mjs$/},a=>BUNDLE_SPLIT||a.importer.endsWith(path.sep+'kernel.mjs')?undefined:{path:path.resolve('web/kernel.mjs')});}};
// ADR-0001 W0 (§2.3, ruling 3/4): code splitting. main.js stays the entry; every dynamic import() becomes a lazy chunk
// app/assets/chunk-<name>-<hash>.js (flat, next to main.js, so every package's asset copy carries it). Old chunks are
// removed first so a package never ships a stale one. Chunks are content-hashed, so they need no ?v= token.
fs.mkdirSync('app/assets',{recursive:true});for(const f of fs.readdirSync('app/assets'))if(/^chunk-.*\.js$/.test(f))fs.rmSync('app/assets/'+f);
const ui=await build({entryPoints:{main:'web/main.mjs'},outdir:'app/assets',splitting:true,entryNames:'[name]',chunkNames:'chunk-[name]-[hash]',bundle:true,format:'esm',platform:'browser',target:'chrome100',minify:true,metafile:true,plugins:[legacyKernel],external:['node:*','module','fs','path','crypto']});
// WS9 size guard (ADR: fail if main.js grows by more than 1 %). The reference is tools/main-js-size.json; after an
// intended change, update it in the same commit. Only the split bundle is guarded.
if(BUNDLE_SPLIT){const bytes=Object.values(ui.metafile.outputs).find(o=>o.entryPoint==='web/main.mjs').bytes,ref=JSON.parse(fs.readFileSync('tools/main-js-size.json','utf8'))['main.js'];
 const ui_inputs=Object.keys(Object.values(ui.metafile.outputs).find(o=>o.entryPoint==='web/main.mjs').inputs);
 const engine=ui_inputs.filter(f=>/replicad|cad-solid|web\/kernel\.mjs$|manifold-3d|pyodide/.test(f));
 if(engine.length)throw Error('main.js must not bundle engine modules: '+engine.join(', '));
 if(bytes>ref*1.01)throw Error(`main.js is ${bytes} B, more than 1 % over the ${ref} B reference (tools/main-js-size.json)`);
 // ADR-0001 Q15 / ruling 3: hard cap 740 KiB for main.js; each lazy chunk <= 8 KB gzip (§8).
 if(bytes>757760)throw Error(`main.js is ${bytes} B, over the 757,760 B (740 KiB) cap`);
 const {gzipSync}=await import('node:zlib');
 for(const [f,o] of Object.entries(ui.metafile.outputs))if(/chunk-[^/]*\.js$/.test(f)){const gz=gzipSync(fs.readFileSync(f),{level:9}).length;if(gz>8192)throw Error(`${f} is ${gz} B gzip, over the 8 KB lazy-chunk budget`);if(Object.keys(o.inputs).some(i=>/replicad|cad-solid|web\/kernel\.mjs$|manifold-3d|pyodide/.test(i)))throw Error(f+' must not bundle engine modules');}}
// ADR occt-sidecar-desktop-web: two worker bundles with OCCT_SIDECAR fixed at build time (see web/perf-flags.mjs).
// worker.js (false) is what the Android WebView starts, identical to 2.7.1; worker-sidecar.js (true) is what desktop and
// web start, and its nested 'occt' sidecar loads worker-sidecar.js again.
const fixedSidecar=(on,force=false)=>({name:'fixed-sidecar',setup(b){b.onLoad({filter:/[\\/]web[\\/](perf-flags|worker)\.mjs$/},a=>{let src=fs.readFileSync(a.path,'utf8');
 if(a.path.endsWith('perf-flags.mjs')){const line='export const OCCT_SIDECAR=!globalThis.Android;';if(force)src=src.replace(/export const OCCT_SIDECAR=[^;]+;/,'export const OCCT_SIDECAR=true;');else if(src.includes(line))src=src.replace(line,'export const OCCT_SIDECAR='+on+';');/* a fixed true/false (flag variants) stays as written */}
 else if(on){const ref="new URL('worker.js'";if(!src.includes(ref))throw Error('worker.mjs: sidecar URL not found');src=src.replace(ref,"new URL('worker-sidecar.js'");}
 return {contents:src,loader:'js'};});}});
for(const [on,out] of [[false,'app/assets/worker.js'],[true,'app/assets/worker-sidecar.js']])
 await build({entryPoints:['web/worker.mjs'],outfile:out,bundle:true,format:'esm',platform:'browser',target:'chrome100',minify:true,plugins:[fixedSidecar(on)],define:{__AVALON_SIDECAR_BUNDLE__:String(on)},external:['node:*','module','fs','path','crypto']});
// ADR-0001 F2a option A: the 3MF pool worker, started by the page like worker.js (counts toward the worker budget).
await build({entryPoints:['web/export-pool-worker.mjs'],outfile:'app/assets/export-pool.js',bundle:true,format:'esm',platform:'browser',target:'chrome100',minify:true,external:['node:*','module','fs','path','crypto']});
// Android always uses the remote client, even in a fixed OCCT_SIDECAR=false flag experiment. Normally this is
// exactly worker-sidecar.js, so the adapter reuses those bytes rather than duplicating a 164 KB gzip bundle.
const androidCore=await build({entryPoints:['web/worker.mjs'],write:false,bundle:true,format:'esm',platform:'browser',target:'chrome100',minify:true,plugins:[fixedSidecar(true,true)],define:{__AVALON_SIDECAR_BUNDLE__:"true"},external:['node:*','module','fs','path','crypto']});
const extraCore=!Buffer.from(androidCore.outputFiles[0].contents).equals(fs.readFileSync('app/assets/worker-sidecar.js'));
fs.rmSync('app/assets/worker-android-core.js',{force:true});if(extraCore)fs.writeFileSync('app/assets/worker-android-core.js',androidCore.outputFiles[0].contents);
const androidTransport={name:'android-transport',setup(b){b.onLoad({filter:/[\\/]android-worker\.mjs$/},a=>({contents:fs.readFileSync(a.path,'utf8').replaceAll('./worker-sidecar.js',extraCore?'./worker-android-core.js':'./worker-sidecar.js'),loader:'js'}));}};
await build({entryPoints:['web/android-worker.mjs'],outfile:'app/assets/worker-android.js',bundle:true,format:'esm',platform:'browser',target:'chrome100',minify:true,plugins:[androidTransport],external:['./worker-sidecar.js','./worker-android-core.js','node:*','module','fs','path','crypto']});
for(const [src,dst] of [['THIRD_PARTY_NOTICES.txt','app/assets/THIRD_PARTY_NOTICES.txt'],['web/index.html','app/assets/index.html'],['web/style.css','app/assets/style.css']])fs.copyFileSync(src,dst);
// WS13: with WASM_OPT the OCCT and Manifold binaries ship after wasm-opt -Oz (binaryen pinned in devDependencies). The
// result is cached under build/wasm-opt by the input's SHA-256, binaryen version and flags, so only the first build
// pays for it (OCCT takes about 4 minutes). A failed or empty run throws instead of shipping the unoptimized file.
const {WASM_OPT}=await import('./web/perf-flags.mjs');
const WASM_OPT_FLAGS=['-Oz','--enable-bulk-memory','--enable-bulk-memory-opt','--enable-simd','--enable-exception-handling','--enable-nontrapping-float-to-int','--enable-sign-ext','--enable-mutable-globals'];
async function optimizedWasm(src){
 const {createHash}=await import('node:crypto'),{execFileSync}=await import('node:child_process');
 const version=JSON.parse(fs.readFileSync('node_modules/binaryen/package.json','utf8')).version;
 const key=createHash('sha256').update(fs.readFileSync(src)).update('\0binaryen '+version+'\0'+WASM_OPT_FLAGS.join(' ')).digest('hex').slice(0,32);
 const out=path.join('build','wasm-opt',path.basename(src,'.wasm')+'-'+key+'.wasm');
 if(!fs.existsSync(out)){fs.mkdirSync(path.dirname(out),{recursive:true});const tmp=out+'.tmp';console.log('wasm-opt '+src+' (binaryen '+version+')…');
  execFileSync(process.execPath,['--max-old-space-size=8000','node_modules/binaryen/bin/wasm-opt',...WASM_OPT_FLAGS,src,'-o',tmp],{stdio:'inherit'});
  if(!fs.existsSync(tmp)||fs.statSync(tmp).size<1024)throw Error('wasm-opt produced no output for '+src);fs.renameSync(tmp,out);}
 return out;}
for(const [src,dst] of [['node_modules/replicad-opencascadejs/dist/replicad_single.wasm','app/assets/cad-kernel.wasm'],['node_modules/manifold-3d/manifold.wasm','app/assets/manifold.wasm']])fs.copyFileSync(WASM_OPT?await optimizedWasm(src):src,dst);
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
// The bundled Roboto Bold outline data (web/glyphs.mjs) is OFL 1.1: its licence and notice must ship with it.
if(!fs.existsSync('app/assets/licenses/Roboto-OFL-1.1.txt')||!fs.readFileSync('app/assets/THIRD_PARTY_NOTICES.txt','utf8').includes('Roboto Bold outline data'))throw Error('The Roboto OFL licence or notice is missing from app/assets.');
// Stamp what this build was made from (tools/web-stamp.mjs; checked by desktop/build-rpm.sh --skip-web).
{const {execFileSync}=await import('node:child_process');execFileSync(process.execPath,['tools/web-stamp.mjs','write'],{stdio:'inherit'});}
