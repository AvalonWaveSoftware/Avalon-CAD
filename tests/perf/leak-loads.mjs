// ADR-0001 android-large-mesh-memory: per-load memory over a long session (npm run test:leak-loads). Run from the repo
// root after build:web. Chromium with the app/assets bundle, the real Android import path (window.nativeImport*):
//  1. Android path (window.Android stub, OCCT in worker.js) and desktop path (no stub, OCCT sidecar worker): LOADS large
//     loads of one model (default the 524k sphere) with New → Blank between; renderer RSS and main JS heap after forced
//     GC (--expose-gc in page and workers, CDP HeapProfiler.collectGarbage, a critical memory-pressure signal so the allocators
//     hand back free pages) after each Blank. Gate: least-squares growth
//     per load after the first load <= 2 MB for both.
//  2. Spill: distinct variants of the model until Undo history passes 64 MB, then Undo back through every entry: each
//     restored project must be byte-identical (JSON sha256) to the one loaded; restore of one spilled entry <= 1 s.
// Measurement: no waitForSelector ElementHandles are kept (locators only). A kept handle pins the detached "Continue"
// button, its onclick closure and that import's parsed project (~18 MB per load), which looked like an app leak.
// Env: AVALON_CHROMIUM, LEAK_SAMPLE (.tcad), LEAK_LOADS (10), LEAK_PATHS (android,desktop,spill), LEAK_JSON (out file).
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import crypto from 'node:crypto';import {createRequire} from 'node:module';
const req=createRequire(process.env.NODE_PATH?path.join(process.env.NODE_PATH.split(':')[0],'/'):import.meta.url);
const {chromium}=req('playwright');
const ROOT=path.resolve('app/assets'),SAMPLE=process.env.LEAK_SAMPLE||'/workspace/avalon-cad-artifacts/export-3mf/samples/sphere-524k.tcad';
const N=+(process.env.LEAK_LOADS||10),PATHS=(process.env.LEAK_PATHS||'android,desktop,spill').split(','),CHECK=process.argv.includes('--check');
const TEXT=fs.readFileSync(SAMPLE,'utf8');const variants=new Map();
const variant=i=>{if(!variants.has(i)){let s=TEXT;if(i){const p=JSON.parse(TEXT);for(const o of p.objects)if(o.type==='mesh'){const m=o.params.mesh;m.vertices=m.vertices.map(v=>v+i*1e-4);const k=3*i;m.triangles=m.triangles.slice(k).concat(m.triangles.slice(0,k));}s=JSON.stringify(p);}variants.set(i,Buffer.from(s).toString('base64'));}return variants.get(i);};
const server=http.createServer((q,r)=>{const u=new URL(q.url,'http://x');const n=decodeURIComponent(u.pathname.slice(1));if(n==='__sample.b64'){r.end(variant(+(u.searchParams.get('v')||0)));return;}const f=path.resolve(ROOT,n||'index.html');if(!f.startsWith(ROOT+path.sep)||!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.setHeader('Content-Type',{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'}[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(r);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const slope=ys=>{const n=ys.length,xm=(n-1)/2,ym=ys.reduce((a,b)=>a+b,0)/n;let a=0,b=0;ys.forEach((y,i)=>{a+=(i-xm)*(y-ym);b+=(i-xm)**2;});return +(a/b).toFixed(2);};
async function session(android){
 const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--js-flags=--expose-gc','--renderer-process-limit=1']});
 const ctx=await browser.newContext({viewport:{width:1024,height:549},deviceScaleFactor:1,hasTouch:true,isMobile:true,serviceWorkers:'block'});
 if(android)await ctx.addInitScript(()=>{window.Android={log:()=>{},openFile(){},beginFile(){},appendFile(){},finishFile(){}};Object.defineProperty(navigator,'deviceMemory',{get:()=>8});});
 const page=await ctx.newPage(),errs=[],workers=[];page.on('pageerror',e=>errs.push(e.message));page.on('worker',w=>workers.push(w));
 await page.goto(origin+'/index.html');await page.waitForFunction(()=>window.__cad?.model?.engine,{},{timeout:240000});await page.waitForTimeout(2000);
 const cdp=await ctx.newCDPSession(page);await cdp.send('Performance.enable');
 const procs=()=>fs.readdirSync('/proc').filter(d=>/^\d+$/.test(d)).map(d=>{try{return {pid:d,cmd:fs.readFileSync('/proc/'+d+'/cmdline','utf8'),ppid:+fs.readFileSync('/proc/'+d+'/stat','utf8').split(') ')[1].split(' ')[1]};}catch{return null;}}).filter(Boolean);
 const bp=procs().find(p=>p.ppid===process.pid&&p.cmd.includes('--remote-debugging-pipe')&&!p.cmd.includes('--type=')&&p.cmd.includes('--js-flags=--expose-gc')&&!session.used?.has(p.pid));(session.used??=new Set()).add(bp.pid);
 const dir=bp.cmd.split('\0').find(a=>a.startsWith('--user-data-dir='));
 const rss=()=>procs().filter(p=>p.cmd.includes('--type=renderer')&&p.cmd.includes(dir)).reduce((t,p)=>{try{return t+ +/VmRSS:\s+(\d+)/.exec(fs.readFileSync('/proc/'+p.pid+'/status','utf8'))[1];}catch{return t;}},0)/1024;
 const gcAll=async()=>{for(let k=0;k<3;k++){await page.evaluate(()=>gc());for(const w of workers){try{await w.evaluate(()=>{if(typeof gc==='function')gc();});}catch{}}await cdp.send('HeapProfiler.collectGarbage').catch(()=>{});await cdp.send('Memory.simulatePressureNotification',{level:'critical'}).catch(()=>{});}await page.waitForTimeout(1500);};
 const sample=async()=>{await gcAll();const m=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));const r=[];for(let i=0;i<3;i++){r.push(rss());await page.waitForTimeout(300);}r.sort((a,b)=>a-b);return {rssMB:+r[1].toFixed(1),heapMB:+(m.JSHeapUsedSize/1048576).toFixed(1)};};
 const cont=async()=>{try{await page.locator('#replaceCurrent').click({timeout:3000});}catch{}};
 const load=async v=>{await page.evaluate(async v=>{const s=await (await fetch('/__sample.b64?v='+v)).text();window.nativeImportStart('model.tcad');for(let i=0;i<s.length;i+=32768)window.nativeImportChunk(s.slice(i,i+32768));window.nativeImportEnd();},v);await cont();
  for(let i=0;i<180;i++){await page.waitForTimeout(1000);const s=await page.evaluate(()=>({busy:document.querySelector('#busy')?.textContent,n:window.__cad.project.objects.length,tris:window.__cad.model?.triangles?.length||0}));if(s.n&&s.tris>3000&&!/Building|Preparing/.test(s.busy))return s.busy;if(/attention/.test(s.busy))throw Error('load failed: '+s.busy);}throw Error('load timed out');};
 const blank=async()=>{await page.click('#projectMenu');await page.locator('[data-template="blank"]').waitFor();await page.click('[data-template="blank"]');await cont();await page.waitForFunction(()=>!window.__cad.project.objects.length);await page.waitForTimeout(2000);};
 const digest=()=>page.evaluate(async()=>{const b=new TextEncoder().encode(JSON.stringify(window.__cad.project));return [...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');});
 return {browser,page,errs,sample,load,blank,digest};}
const out={sample:path.basename(SAMPLE),loads:N},fail=[];
for(const p of PATHS.filter(p=>p!=='spill')){const s=await session(p==='android');const rows=[];try{
  rows.push({at:'start',...await s.sample()});for(let i=1;i<=N;i++){const st=await s.load(0);rows.push({at:'load'+i,status:st,...await s.sample()});await s.blank();rows.push({at:'blank'+i,...await s.sample()});console.log(p,JSON.stringify(rows.at(-2)),JSON.stringify(rows.at(-1)));}
  const b=rows.filter(r=>r.at.startsWith('blank'));const r={rows,rssPerLoadMB:slope(b.map(x=>x.rssMB)),heapPerLoadMB:slope(b.map(x=>x.heapMB)),pageErrors:s.errs};out[p]=r;
  if(r.rssPerLoadMB>2)fail.push(p+' RSS '+r.rssPerLoadMB+' MB/load');if(r.heapPerLoadMB>2)fail.push(p+' heap '+r.heapPerLoadMB+' MB/load');}
 catch(e){fail.push(p+': '+e.message);out[p]={rows,error:e.message};}finally{await s.browser.close();}}
if(PATHS.includes('spill')){const s=await session(true);const r={loads:[],undo:[]};out.spill=r;try{
  const want=[];const V=+(process.env.LEAK_SPILL_LOADS||6);
  for(let v=1;v<=V;v++){await s.load(v);want.push(await s.digest());await s.blank();const st=await s.page.evaluate(async()=>{const h=window.__cad.historySpill;await new Promise(r=>setTimeout(r,500));return {bytes:h.residentBytes(),spills:h.stats.spills,failures:h.stats.failures};});r.loads.push({v,...st,...await s.sample()});console.log('spill',JSON.stringify(r.loads.at(-1)));}
  const got=[];let restores=[];
  for(;;){const n=await s.page.evaluate(()=>window.__cad.historyLength);if(!n)break;const before=await s.page.evaluate(()=>window.__cad.historySpill.stats.restores);
   await s.page.evaluate(()=>document.getElementById('undo').click());await s.page.waitForFunction(n=>window.__cad.historyLength===n-1,n,{timeout:30000});
   const st=await s.page.evaluate(()=>window.__cad.historySpill.stats);if(st.restores>before)restores.push(+st.restoreMs.toFixed(1));
   if(await s.page.evaluate(()=>window.__cad.project.objects.length))got.push(await s.digest());}
  r.restoreMs=restores;r.maxRestoreMs=Math.max(0,...restores);r.identical=want.every(h=>got.includes(h));r.restoredLoads=got.length;r.spills=r.loads.at(-1).spills;
  if(!r.spills)fail.push('spill: nothing was spilled');if(!r.identical)fail.push('spill: an Undo restore differs from the loaded project');if(!restores.length)fail.push('spill: no restore from storage measured');if(r.maxRestoreMs>1000)fail.push('spill: restore '+r.maxRestoreMs+' ms > 1000');r.pageErrors=s.errs;}
 catch(e){fail.push('spill: '+e.message);r.error=e.message;}finally{await s.browser.close();}}
out.fail=fail;out.pass=!fail.length;server.close();
const summary={...out};for(const p of ['android','desktop'])if(out[p])summary[p]={rssPerLoadMB:out[p].rssPerLoadMB,heapPerLoadMB:out[p].heapPerLoadMB,error:out[p].error};if(out.spill)summary.spill={...out.spill,loads:undefined};
if(process.env.LEAK_JSON)fs.writeFileSync(process.env.LEAK_JSON,JSON.stringify(out,null,1));
console.log(JSON.stringify(summary));if(CHECK&&fail.length)process.exit(1);
