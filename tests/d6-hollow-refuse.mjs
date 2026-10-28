// D6 rev3 (Master Chief 2026-10-27: "Refuse it up front from the estimated size"). QA's case, a Ø400 sphere at Smooth
// 0.005 (~100k triangles) with Hollow 2 mm, must be refused by the Edit sheet before any meshing starts: the hollow error
// appears in under 200 ms and no check/place job is posted to the worker. Normal hollows (torus and tube at their default
// smoothness) still apply. Real app, built worker.js, headless Chromium.
//   node tests/d6-hollow-refuse.mjs   (after npm run build:web)
import assert from 'node:assert/strict';import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.AVALON_PLAYWRIGHT);
const assets=path.resolve('app/assets'),MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'};
const server=http.createServer((q,r)=>{const f=path.resolve(assets,new URL(q.url,'http://x').pathname.slice(1)||'index.html');if(!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(r);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--js-flags=--wasm-max-mem-pages=5760']});
const page=await browser.newPage({viewport:{width:1024,height:548}});
await page.addInitScript(()=>{window.Android={beginFile(){},appendFile(){},finishFile(){}};});
await page.addInitScript(()=>{window.__jobs=[];const post=Worker.prototype.postMessage;Worker.prototype.postMessage=function(m,t){if(m&&/^(check|place|export)$/.test(m.type))window.__jobs.push(m.type);return post.call(this,m,t);};});
await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');
await page.waitForFunction(()=>window.__cad?.model!==undefined&&window.__cad.model!==null,null,{timeout:120000}).catch(()=>{});
const load=(o,min)=>page.evaluate(async([o,min])=>{const C=window.__cad,sleep=ms=>new Promise(r=>setTimeout(r,ms));const q=structuredClone(C.project);
 q.objects=[{id:'s1',name:o.type,rotation:[0,0,0],mode:'solid',enabled:true,layerId:q.activeLayer,...o}];C.load(q);for(let i=0;i<600&&!(C.model?.volume>min);i++)await sleep(200);await sleep(1000);},[o,min]);
await load({type:'sphere',params:{diameter:400},position:[0,0,200],resolution:{mode:'tolerance',tolerance:.005}},1e7);
await page.click('#editBtn');await page.waitForSelector('#hollowOn');await page.check('#hollowOn');
const r=await page.evaluate(async()=>{const n=window.__jobs.length,t0=performance.now();document.getElementById('applyObject').click();
 for(;;){const e=document.querySelector('#sheetContent .modalerror')?.textContent||'';if(e)return {ms:performance.now()-t0,text:e,jobs:window.__jobs.length-n};if(performance.now()-t0>30000)return {ms:-1};await new Promise(r=>setTimeout(r,0));}});
await page.waitForTimeout(1000);const after=await page.evaluate(()=>({jobs:window.__jobs.length,shell:window.__cad.project.objects[0].shell||null}));
assert.equal(r.text,"Can't hollow this shape at 2 mm. Try a smaller wall or remove rounds.",'the existing hollow error');
assert.ok(r.ms>=0&&r.ms<200,`refused in under 200 ms (${r.ms.toFixed(1)} ms)`);
assert.equal(r.jobs,0,'no job sent');assert.equal(after.shell,null,'sphere unchanged');
await page.click('#closeSheet');
const normal=[];
for(const [o,min] of [[{type:'torus',params:{diameter:30,tube:8},position:[0,0,4]},100],[{type:'tube',params:{diameter:25,inner:18,h:20},position:[0,0,10]},100]]){
 await load(o,min);const v0=await page.evaluate(()=>window.__cad.model.volume),t0=Date.now();
 await page.click('#editBtn');await page.waitForSelector('#hollowOn');await page.check('#hollowOn');await page.click('#applyObject');
 await page.waitForFunction(()=>!!window.__cad.project.objects[0].shell,null,{timeout:30000});
 for(let i=0;i<100&&await page.evaluate(v0=>window.__cad.model.volume===v0,v0);i++)await page.waitForTimeout(200);
 normal.push([o.type,Date.now()-t0,v0,await page.evaluate(()=>window.__cad.model.volume)]);}
await browser.close();server.close();
for(const [t,ms,v0,v] of normal)assert.ok(v<v0&&v>0,`${t} default hollow applied (${v0} -> ${v})`);
console.log(`d6-hollow-refuse: Ø400 sphere at 0.005 + Hollow 2 mm refused in ${r.ms.toFixed(1)} ms, ${r.jobs} jobs sent; `+normal.map(([t,ms,v0,v])=>`${t} hollow applied in ${ms} ms (${v0.toFixed(0)} -> ${v.toFixed(0)} mm³)`).join(', '));
