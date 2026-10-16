// Shared jsdom harness: the real app bundle with the real local Python/Rust/Manifold runtime.
// Rendering is stubbed (tests/three-test.mjs). Every worker message is logged for no-rebuild checks.
import {shipTopologies} from '../web/topology-pack.mjs';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {build} from 'esbuild';
import {initKernel} from '../web/kernel.mjs';
import {loadPyodide} from 'pyodide';
import {initLocalEngine} from '../web/local-engine.mjs';
export async function harness(){
 const K=await initKernel({solidOptions:{wasmBinary:fs.readFileSync('node_modules/replicad-opencascadejs/dist/replicad_single.wasm')}});
 const runtime=await initLocalEngine(K,{loadPyodide,pythonURL:process.cwd()+'/node_modules/pyodide/',pythonSource:fs.readFileSync('engine/python/model_jobs.py','utf8'),rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
 await build({entryPoints:['web/main.mjs'],outfile:'build/test-panel-ui.js',bundle:true,format:'iife',platform:'browser',target:'chrome100',external:['manifold-3d','node:*'],define:{'import.meta.url':'"https://appassets.androidplatform.net/assets/main.js"'},plugins:[{name:'test-renderer',setup(b){b.onResolve({filter:/^three$/},args=>args.importer.endsWith('three-test.mjs')?null:{path:process.cwd()+'/tests/three-test.mjs'});}}]});
 const bundle=fs.readFileSync('build/test-panel-ui.js','utf8'),html=fs.readFileSync('web/index.html','utf8');
 async function boot(storage={},{fill=false,desktop=false}={}){
  const dom=new JSDOM(html,{url:'https://appassets.androidplatform.net/assets/index.html',pretendToBeVisual:true,runScripts:'outside-only'}),w=dom.window;
  for(const [k,v] of Object.entries(storage))w.localStorage.setItem(k,v);
  // fill: pack localStorage to its quota so any further write throws (QuotaExceededError).
  if(fill){let n=0;for(let size=1<<20;size>=1;size>>=1){const chunk='x'.repeat(size);for(;;){try{w.localStorage.setItem('filler-'+n,chunk);n++;}catch(e){break;}}}}
  const errors=[],posted=[],resizes={count:0},scrolled=[];w.addEventListener('error',e=>errors.push(e.error?.message||e.message));
  w.HTMLCanvasElement.prototype.setPointerCapture=function(){};w.HTMLCanvasElement.prototype.releasePointerCapture=function(){};w.HTMLCanvasElement.prototype.hasPointerCapture=function(){return false};
  w.HTMLCanvasElement.prototype.getBoundingClientRect=function(){return {left:0,top:0,right:412,bottom:600,width:412,height:600}};w.structuredClone=structuredClone;w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;
  w.ResizeObserver=class{constructor(fn){this.fn=fn}observe(){resizes.count++;this.fn()}};Object.defineProperty(w.HTMLCanvasElement.prototype,'clientWidth',{get:()=>412});Object.defineProperty(w.HTMLCanvasElement.prototype,'clientHeight',{get:()=>600});
  w.Element.prototype.scrollIntoView=function(){scrolled.push(this.dataset?.row);};
  w.Worker=class {postMessage(input){posted.push(input.type);const data=structuredClone(input);setTimeout(()=>{try{const result=runtime.process(data);result.engine=runtime.info;shipTopologies(result);this.onmessage({data:result});}catch(e){this.onmessage({data:{id:data.id,error:e.message}})}},0)}};
  w.Android={beginFile(name,mime){w.testSaved={name,mime,chunks:[]}},appendFile(x){w.testSaved.chunks.push(x)},finishFile(){w.testSaved.done=true}};
  // desktop: stub the Electron bridge the way tests/desktop-runtime.mjs does.
  if(desktop){w.desktopActions=[];w.AvalonDesktop={platform:'mac',saveFile:async(bytes,name)=>({canceled:false,name}),openFile:async()=>({canceled:true}),onAction:fn=>w.desktopActions.push(fn),onFile:()=>{},onNotice:()=>{}};}
  w.eval(bundle);
  const $=id=>w.document.getElementById(id),click=id=>$(id).click(),q=s=>w.document.querySelector(s),qa=s=>[...w.document.querySelectorAll(s)];
  const wait=async(fn,label='')=>{for(let i=0;i<400;i++){if(fn())return;await new Promise(r=>setTimeout(r,25));}throw Error('Wait timed out '+label+': '+JSON.stringify({volume:w.__cad.model?.volume,toast:$('toast').textContent,error:$('prefabError')?.textContent||$('mergeError')?.textContent}));};
  await wait(()=>w.__cad.model!==null,'boot');
  const count=type=>posted.filter(t=>t===type).length;
  return {w,dom,$,click,q,qa,wait,posted,count,errors,resizes,scrolled,tool:w.__cad.touch,close:()=>dom.window.close()};
 }
 return {K,runtime,boot};
}
