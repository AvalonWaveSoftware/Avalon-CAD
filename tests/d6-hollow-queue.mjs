// D6 root cause (Waydroid QA 2026-10-27 03:11-03:16 UTC, s-45..s-53): QA hollowed a Ø400 sphere at Smooth 0.005; the
// Edit sheet's 5 s hollow limit (ADR-0003) refused it, but the dropped job kept running in the worker: OCCT meshing that
// hollow takes 3.5 s at 0.05 and over 300 s at 0.02 on the box (hours at 0.005). The next job, the Add sheet's place/check
// for the duplicated sphere, queued behind it: sheet locked 10+ min, ~588% CPU, no log line. Real app, built worker.js,
// pinned Chromium, Android mode, real UI: Edit → Hollow → Apply (refused after 5 s), then Duplicate → X 0.5 → Apply & add.
// Deterministic metric: the duplicate is added within 60 s (fixed: a few seconds; 23ab0a4: never, the worker is busy for
// hours; d6-cancel-3.0 rev1: only by its 120 s job limit), with exactly one worker restart logged.
//   node tests/d6-hollow-queue.mjs   (after npm run build:web)
import assert from 'node:assert/strict';import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.AVALON_PLAYWRIGHT);
const assets=path.resolve('app/assets'),MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'};
const server=http.createServer((q,r)=>{const f=path.resolve(assets,new URL(q.url,'http://x').pathname.slice(1)||'index.html');if(!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(r);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--js-flags=--wasm-max-mem-pages=5760']});
const page=await browser.newPage({viewport:{width:1024,height:548}});
await page.addInitScript(()=>{window.Android={beginFile(){},appendFile(){},finishFile(){}};});
await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');
await page.waitForFunction(()=>window.__cad?.model!==undefined&&window.__cad.model!==null,null,{timeout:120000}).catch(()=>{});
await page.evaluate(async()=>{const C=window.__cad,sleep=ms=>new Promise(r=>setTimeout(r,ms));const q=structuredClone(C.project);
 q.objects=[{id:'s1',name:'Sphere',type:'sphere',params:{diameter:400},position:[0,0,200],rotation:[0,0,0],mode:'solid',enabled:true,layerId:q.activeLayer,resolution:{mode:'tolerance',tolerance:.005}}];
 C.load(q);for(let i=0;i<600&&!(C.model?.volume>1e7);i++)await sleep(200);await sleep(1000);});
const t0=Date.now();
await page.click('#editBtn');await page.waitForSelector('#hollowOn');await page.check('#hollowOn');await page.click('#applyObject');
await page.waitForFunction(()=>/hollow/i.test(document.querySelector('#sheetContent .modalerror')?.textContent||''),null,{timeout:30000});
const refusedS=(Date.now()-t0)/1000;
await page.click('#duplicateObject');await page.waitForSelector('#pos0');await page.fill('#pos0','0.5');
const t1=Date.now();await page.click('#applyObject');
const added=await page.waitForFunction(()=>window.__cad.project.objects.length===2,null,{timeout:60000}).then(()=>true,()=>false);const addS=(Date.now()-t1)/1000;
const log=await page.evaluate(()=>window.__cad.debugLog.filter(l=>/restarted|wasm trap/.test(l)).map(l=>l.slice(25,200)));
const objs=await page.evaluate(()=>window.__cad.project.objects.map(o=>[o.position[0],!!o.shell]));
await browser.close();server.close();
assert.ok(added,`the duplicated sphere is added within 60 s after the refused hollow (${addS.toFixed(1)} s; restarts: ${JSON.stringify(log)})`);
assert.deepEqual(objs,[[0,false],[0.5,false]],'the refused hollow left the sphere unchanged; the copy sits at X 0.5');
assert.equal(log.filter(l=>/hollow check dropped after 5 s; worker restarted/.test(l)).length,1,'one worker restart for the dropped hollow job: '+JSON.stringify(log));
console.log(`d6-hollow-queue: hollow refused after ${refusedS.toFixed(1)} s, worker restarted once; duplicate at X 0.5 added in ${addS.toFixed(1)} s`);
