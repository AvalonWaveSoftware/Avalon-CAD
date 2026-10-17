// WS3 (ADR v2) bench: GL program links/compiles, buffer churn, main-thread long tasks per edit, and JS heap after 100
// edits, in headless Chromium (SwiftShader) with PERSISTENT_GL off and on. Run from the repo root:
//   AVALON_PLAYWRIGHT=... AVALON_CHROMIUM=... node tests/perf/gl-bench.mjs [--check]
// The "off" build is a temporary copy of app/assets whose main.js is bundled from web/ with PERSISTENT_GL=false
// (tests/perf/.ws3-off, removed afterwards). One browser at a time.
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {createRequire} from 'node:module';import {build} from 'esbuild';
const R=process.cwd(),require=createRequire(import.meta.url),{chromium}=require(process.env.AVALON_PLAYWRIGHT||'playwright');
const OFF=path.join(R,'tests/perf/.ws3-off');
async function offAssets(){fs.rmSync(OFF,{recursive:true,force:true});fs.cpSync(path.join(R,'web'),path.join(OFF,'web'),{recursive:true});fs.cpSync(path.join(R,'app/assets'),path.join(OFF,'assets'),{recursive:true});
 const f=path.join(OFF,'web/perf-flags.mjs');fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace('PERSISTENT_GL=true','PERSISTENT_GL=false'));
 await build({entryPoints:[path.join(OFF,'web/main.mjs')],outfile:path.join(OFF,'assets/main.js'),bundle:true,format:'esm',platform:'browser',target:'chrome100',minify:true,nodePaths:[path.join(R,'node_modules')],external:['node:*','module','fs','path','crypto']});return path.join(OFF,'assets');}
const TYPES={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.wasm':'application/wasm','.json':'application/json'};
async function measure(root){
 const server=http.createServer((q,s)=>{const name=new URL(q.url,'http://x').pathname.slice(1)||'index.html',file=path.resolve(root,name);if(!file.startsWith(root)||!fs.existsSync(file)){s.writeHead(404);s.end();return;}s.writeHead(200,{'content-type':TYPES[path.extname(file)]||'application/octet-stream','cross-origin-opener-policy':'same-origin','cross-origin-embedder-policy':'require-corp'});fs.createReadStream(file).pipe(s);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--js-flags=--expose-gc']});
 try{const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.addInitScript(()=>{window.__c={link:0,compile:0,createBuf:0,delBuf:0};const P=WebGL2RenderingContext.prototype;for(const [f,k] of [['linkProgram','link'],['compileShader','compile'],['createBuffer','createBuf'],['deleteBuffer','delBuf']]){const o=P[f];P[f]=function(...a){window.__c[k]++;return o.apply(this,a);};}
   window.__lt=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lt.push(e.duration))).observe({type:'longtask'});});
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);await page.waitForFunction(()=>window.__cad?.model,null,{timeout:120000});
  const load=n=>page.evaluate(n=>{const p=window.__cad.templates.blank();const types=['box','cylinder','sphere','tube','cone'],D={box:{w:30,d:30,h:15},cylinder:{diameter:20,h:20},sphere:{diameter:25},tube:{diameter:25,inner:18,h:20},cone:{diameter:25,top:8,h:25}};
   for(let i=0;i<n;i++){const t=types[i%5],q={...D[t]};q.h=(q.h||10)+i*.1;if(t==='sphere')q.diameter+=i*.1;p.objects.push({id:'o'+i,name:t+i,type:t,params:q,position:[(i%10)*35,Math.floor(i/10)*35,0],rotation:[0,0,0],mode:'solid',enabled:true,layerId:p.activeLayer});}
   window.__cad.load(p);window.__cad.touch.setMode('move');},n);
  // one edit (mainTaskMs: CDP TaskDuration over the edit, i.e. all main-thread task time incl. the 60 ms settle): move object 0 by 1 mm, wait for the model and two frames; counters and long tasks are for that edit only
  const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');const taskSec=async()=>(await cdp.send('Performance.getMetrics')).metrics.find(m=>m.name==='TaskDuration').value;
  const edit=async()=>{const t0=await taskSec(),r=await editOnly();r.mainTaskMs=Math.round((await taskSec()-t0)*1000);return r;};
  const editOnly=()=>page.evaluate(async()=>{for(const k in window.__c)window.__c[k]=0;window.__lt.length=0;const p=structuredClone(window.__cad.project);p.objects[0].position[0]+=1;const before=window.__cad.model;window.__cad.load(p);window.__cad.touch.setMode('move');
   await new Promise(r=>{const c=()=>window.__cad.model!==before?r():setTimeout(c,1);c();});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));await new Promise(r=>setTimeout(r,60));return {...window.__c,longTaskMs:Math.round(Math.max(0,...window.__lt))};});
  const out={};
  for(const n of [10,100]){await load(n);await page.waitForFunction(n=>window.__cad.model?.parts?.length===n,n,{timeout:120000});await page.waitForTimeout(300);await edit();await edit();
   const runs=[];for(let i=0;i<5;i++)runs.push(await edit());const med=k=>runs.map(r=>r[k]).sort((a,b)=>a-b)[2];
   out['n'+n]={links:med('link'),compiles:med('compile'),buffersCreated:med('createBuf'),buffersDeleted:med('delBuf'),longTaskMs:med('longTaskMs'),mainTaskMs:med('mainTaskMs'),runs};}
  await load(10);await page.waitForFunction(()=>window.__cad.model?.parts?.length===10,null,{timeout:120000});await edit();
  const heap=()=>page.evaluate(()=>{window.gc();window.gc();return performance.memory.usedJSHeapSize;});const h0=await heap();let links=0;
  for(let i=0;i<100;i++)links+=(await edit()).link;const h1=await heap();out.heap100={beforeMB:+(h0/1048576).toFixed(1),afterMB:+(h1/1048576).toFixed(1),growthMB:+((h1-h0)/1048576).toFixed(2),linksOver100Edits:links};
  return out;}finally{await browser.close();server.close();}}
const result={};try{result.off=await measure(await offAssets());result.on=await measure(path.join(R,'app/assets'));}finally{fs.rmSync(OFF,{recursive:true,force:true});}
const fail=[];if(result.on.n10.links||result.on.n100.links||result.on.heap100.linksOver100Edits)fail.push('links');if(result.on.n10.buffersCreated>4)fail.push('buffer churn');if(result.on.heap100.growthMB>2)fail.push('heap');
console.log(JSON.stringify({...result,fail,pass:!fail.length},(k,v)=>k==='runs'?undefined:v,1));if(process.argv.includes('--check')&&fail.length)process.exit(1);
