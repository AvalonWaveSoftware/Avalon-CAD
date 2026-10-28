// D6 rev5 (QA stacking note): on Android the geometry worker is worker-android.js and androidOcct() binds the OCCT
// watchdog (occtPort, budget timers, the OCCT worker) to it. A restart (here: Cancel on a long watched check) must
// recreate worker-android.js, close the old OCCT worker and bind a fresh watchdog to the new worker, so the next
// OCCT job (box + roundover) still runs. Pending STL/3MF imports are not repeatable (their buffers were transferred):
// they fail with the approved "Canceled. Nothing was changed." (the import toast shows exactly that text) and are
// never re-sent. Real app, built assets, window.Android stub, headless Chromium.
//   node tests/d6-restart-android.mjs   (after npm run build:web)
import assert from 'node:assert/strict';import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.AVALON_PLAYWRIGHT);
const assets=path.resolve('app/assets'),MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'};
const server=http.createServer((q,r)=>{const f=path.resolve(assets,new URL(q.url,'http://x').pathname.slice(1)||'index.html');if(!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(r);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:412,height:860}});const workers=[];
page.on('worker',w=>{const e={url:w.url().replace(/.*\//,'').replace(/\?.*/,''),closed:false};workers.push(e);w.on('close',()=>e.closed=true);});
await page.addInitScript(()=>{window.Android={beginFile(){},appendFile(){},finishFile(){}};window.__posts=[];const post=Worker.prototype.postMessage;Worker.prototype.postMessage=function(m,t){if(m?.type)window.__posts.push(m.type);return post.call(this,m,t);};});
await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');
await page.waitForFunction(()=>window.__cad?.model,null,{timeout:120000});
const roundover=r=>page.evaluate(async r=>{const C=window.__cad,sleep=ms=>new Promise(s=>setTimeout(s,ms)),before=C.model,q=structuredClone(C.project);
 q.objects=[{id:'r'+r,name:'box',type:'box',params:{w:20,d:20,h:10},position:[0,0,5],rotation:[0,0,0],mode:'solid',enabled:true,layerId:q.activeLayer,fillets:[{edges:[0,1,2,3],radius:r}]}];C.load(q);
 for(let i=0;i<600&&(C.model===before||!(C.model?.triangles?.length>36));i++)await sleep(100);return {tris:C.model?.triangles?.length/3,volume:C.model?.volume};},r);
const first=await roundover(2);assert.ok(first.tris>12,'OCCT roundover before the restart: '+JSON.stringify(first));
const before=workers.map(w=>({...w}));assert.equal(before[0]?.url,'worker-android.js','Android geometry worker: '+JSON.stringify(before));
// The STL file for the real import path (#importFile → importData): 12 triangles of a 10 mm cube.
const v=[0,0,0,10,0,0,10,10,0,0,10,0,0,0,10,10,0,10,10,10,10,0,10,10],t=[0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7];
const stl=Buffer.alloc(84+50*12);stl.writeUInt32LE(12,80);for(let i=0;i<12;i++)for(let k=0;k<3;k++)for(let j=0;j<3;j++)stl.writeFloatLE(v[t[i*3+k]*3+j],84+i*50+12+k*12+j*4);
await page.evaluate(async()=>{const C=window.__cad,sleep=ms=>new Promise(r=>setTimeout(r,ms)),L=C.project.activeLayer;
 const q=structuredClone(C.project);q.objects=[];for(let i=0;i<6;i++)q.objects.push({id:'s'+i,name:'sphere',type:'sphere',params:{diameter:400},position:[i*.5,0,200],rotation:[0,0,0],mode:'solid',enabled:true,layerId:L,resolution:{mode:'tolerance',tolerance:.005}});
 C.load(q);for(let i=0;i<600&&!(C.model?.volume>1e7);i++)await sleep(200);await sleep(1500);
 const out=window.__out={},tag=(k,p)=>p.then(v=>out[k]=v?.vertices?'imported':'ok',e=>out[k]='ERR '+e.message);
 tag('watched',C.request('check',{project:structuredClone(C.project),tolerance:.15}));await sleep(50);
 const b=new Uint8Array([80,75,3,4]).buffer;tag('import3MF',C.request('import3MF',{buffer:b}));window.__transferred=b.byteLength===0;
 const toast=document.getElementById('toast');toast.hidden=true;toast.textContent='';});
await page.setInputFiles('#importFile',{name:'cube.stl',mimeType:'application/octet-stream',buffer:stl});
await page.waitForFunction(()=>window.__posts.filter(t=>t==='importSTL').length===1,null,{timeout:30000});
await page.waitForFunction(()=>{const b=document.getElementById('jobWatch');return b&&getComputedStyle(b).display!=='none';},null,{timeout:30000});
const mark=await page.evaluate(()=>window.__posts.length),wmark=workers.length;await page.click('#jobCancel');
await page.waitForFunction(()=>['watched','import3MF'].every(k=>k in window.__out),null,{timeout:60000});
// importData's toast comes after the job bar's own Cancel toast; both must read the approved text only.
await page.waitForTimeout(800);
const r=await page.evaluate(m=>({out:window.__out,transferred:window.__transferred,toast:document.getElementById('toast').textContent,after:window.__posts.slice(m)}),mark);
const restarted=workers.slice(wmark);
assert.equal(r.out.watched,'ERR Canceled. Nothing was changed.','the canceled job fails with its text');
assert.ok(r.transferred,'the 3MF buffer was transferred to the old worker');
assert.equal(r.out.import3MF,'ERR Canceled. Nothing was changed.','a pending 3MF import is not repeatable: it fails as canceled');
assert.equal(r.toast,'Canceled. Nothing was changed.','the pending STL import (real UI) shows exactly the approved text');
assert.ok(!r.after.includes('importSTL')&&!r.after.includes('import3MF'),'imports are never re-sent: '+JSON.stringify(r.after));
assert.equal(r.after.filter(t=>t==='occtPort').length,1,'one fresh OCCT watchdog port for the new worker: '+JSON.stringify(r.after));
assert.equal(restarted[0]?.url,'worker-android.js','the restart recreates worker-android.js: '+JSON.stringify(restarted));
// terminate() of a worker that is busy inside OCCT/wasm reports its close a little later; wait for it (bounded).
for(let i=0;i<150&&!workers.slice(0,wmark).every(w=>w.closed);i++)await new Promise(r=>setTimeout(r,100));
assert.ok(workers.slice(0,wmark).every(w=>w.closed),'the old geometry worker and its OCCT worker are closed: '+JSON.stringify(workers));
const next=await roundover(1);
const occt=workers.slice(wmark+1).filter(w=>w.url==='worker-android.js');
assert.ok(next.tris>12&&next.tris!==first.tris,'the next OCCT roundover works after the restart: '+JSON.stringify(next));
assert.ok(occt.length>=1&&occt.every(w=>!w.closed),'a fresh OCCT worker runs under the new watchdog: '+JSON.stringify(workers));
const toast=await page.evaluate(()=>{const t=document.getElementById('toast');return t.hidden?'':t.textContent;});
await browser.close();server.close();
assert.ok(!/could not start|too heavy/.test(toast),'no engine error after the restart: '+toast);
console.log(`d6-restart-android: Cancel recreated worker-android.js (+${restarted.length} worker(s), old ${wmark} closed), 1 new occtPort; 3MF and STL imports failed as canceled and were not re-sent; roundover after restart ${next.tris} triangles`);
