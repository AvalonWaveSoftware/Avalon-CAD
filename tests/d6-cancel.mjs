// D6 (Waydroid QA 2026-10-26): a long exact check (near-coincident dense spheres) froze the UI with no feedback.
// Real app and built worker.js (pinned Chromium, Android mode). Overlapping Ø400 spheres at 0.005 mm, offset 0.5 mm, make
// every check take several seconds. Mirror YZ (in place) on a small box starts a check:
//  A. after 2 s the job bar shows the elapsed time and Cancel; Cancel restarts the worker at once, applies nothing (no
//     history entry, box unchanged), shows the canceled toast, logs '[avalon] check canceled after N s'; the new worker
//     then answers a check.
//  B. with the hard timeout lowered to 4 s for the test (window.__avalonJobTimeoutMs), the same check ends in the
//     timeout toast, applies nothing and logs '[avalon] check timeout after N s'.
// D6_SHOTS=<dir> also saves the approval screenshots (bar, canceled toast, timeout toast).
//   node tests/d6-cancel.mjs   (after npm run build:web)
import assert from 'node:assert/strict';import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.AVALON_PLAYWRIGHT);
const assets=path.resolve('app/assets'),MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'};
const server=http.createServer((q,r)=>{const f=path.resolve(assets,new URL(q.url,'http://x').pathname.slice(1)||'index.html');if(!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(r);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const shots=process.env.D6_SHOTS,N=Number(process.env.D6_SPHERES||6);
const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:412,height:860}});
await page.addInitScript(()=>{window.Android={beginFile(){},appendFile(){},finishFile(){}};});
await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');
await page.waitForFunction(()=>window.__cad?.model!==undefined&&window.__cad.model!==null,null,{timeout:120000}).catch(()=>{});
await page.mouse.click(200,300);
const ev=(f,a)=>page.evaluate(f,a);
const shot=async name=>{if(shots){fs.mkdirSync(shots,{recursive:true});await page.screenshot({path:path.join(shots,name)});}};
await ev(async N=>{const C=window.__cad,sleep=ms=>new Promise(r=>setTimeout(r,ms));const L=C.project.activeLayer;
 const o=(id,type,params,pos,tol)=>({id,name:type,type,params,position:pos,rotation:[0,0,0],mode:'solid',enabled:true,layerId:L,...(tol?{resolution:{mode:'tolerance',tolerance:tol}}:{})});
 const q=structuredClone(C.project);q.objects=[o('box','box',{w:20,d:10,h:10},[300,0,5])];for(let i=0;i<N;i++)q.objects.push(o('s'+i,'sphere',{diameter:400},[i*.5,0,200],.005));
 C.load(q);for(let i=0;i<600&&C.model?.volume<1e7;i++)await sleep(200);await sleep(1500);},N);
// Mirror YZ in place on the selected box: starts an exact check of the whole project.
const mirror=()=>ev(()=>{const C=window.__cad,$=id=>document.getElementById(id);if(C.touch.getState().mode!=='mirror')$('mirrorMode').click();
 if($('mirrorCopy').getAttribute('aria-pressed')==='true')$('mirrorCopy').click();window.__h=C.historyLength;window.__t=performance.now();$('toast').hidden=true;document.querySelector('[data-mirror="YZ"]').click();});
const state=()=>ev(()=>{const C=window.__cad,$=id=>document.getElementById(id),b=$('jobWatch');return {bar:b&&getComputedStyle(b).display!=='none'&&b.offsetHeight>0?b.textContent:null,toast:$('toast').hidden?'':$('toast').textContent,error:$('toast').classList.contains('error'),history:C.historyLength-window.__h,box:JSON.stringify(C.project.objects.find(o=>o.id==='box')),s:(performance.now()-window.__t)/1000,log:C.debugLog.filter(l=>/canceled|timeout/.test(l)).map(l=>l.slice(25))};});
const box0=(await state()).box;
const until=async(f,ms)=>{const t=Date.now();for(;;){const s=await state();if(f(s))return s;if(Date.now()-t>ms)return s;await new Promise(r=>setTimeout(r,100));}};
// A. Cancel
await mirror();const a1=await until(s=>s.bar||s.history,15000);
assert.ok(a1.bar&&!a1.history,'a check still running after 2 s shows the job bar (elapsed time + Cancel): '+JSON.stringify(a1));
assert.ok(a1.s>=1.9,'the bar appears after 2 s, not at once: '+a1.s);
await shot('d6-bar.png');
await page.click('#jobCancel');const t0=Date.now();const a2=await until(s=>s.toast,3000);const cancelMs=Date.now()-t0;
await shot('d6-canceled.png');
assert.ok(!a2.error&&/Canceled/.test(a2.toast),'Cancel shows the canceled toast in the neutral style (not the red error style): '+JSON.stringify(a2));
assert.ok(cancelMs<1500&&!a2.bar,'Cancel ends the job at once and hides the bar: '+cancelMs+' ms');
assert.ok(a2.log.some(l=>/check canceled after \d+ s; worker restarted/.test(l)),'the cancel is logged: '+a2.log);
await new Promise(r=>setTimeout(r,2000));const a3=await state();
assert.equal(a3.history,0,'nothing applied (no history entry)');assert.equal(a3.box,box0,'the box is unchanged');
const fresh=await ev(async()=>{const C=window.__cad,q=structuredClone(C.project);q.objects=q.objects.filter(o=>o.id==='box');const t=performance.now();const r=await C.request('check',{project:q,tolerance:.15});return {v:r.volume,ms:performance.now()-t};});
assert.ok(Math.abs(fresh.v-2000)<1,'the restarted worker answers a check: '+JSON.stringify(fresh));
// B. Hard timeout (lowered for the test)
await ev(()=>{window.__avalonJobTimeoutMs=4000;});await new Promise(r=>setTimeout(r,3000));
await mirror();const b1=await until(s=>s.toast||s.history,20000);
await shot('d6-timeout.png');
assert.ok(b1.error&&/Stopped after/.test(b1.toast)&&!b1.history,'the timeout ends the job with its toast and applies nothing: '+JSON.stringify(b1));
assert.ok(b1.s>=3.9&&b1.s<6,'it ends at the (lowered) limit: '+b1.s);
assert.ok(b1.log.some(l=>/check timeout after \d+ s; worker restarted/.test(l)),'the timeout is logged: '+b1.log);
await new Promise(r=>setTimeout(r,2000));const b2=await state();assert.equal(b2.history,0);assert.equal(b2.box,box0);
await browser.close();server.close();
console.log(`d6-cancel: ${N} near-coincident Ø400 spheres; bar after ${a1.s.toFixed(1)} s ("${a1.bar}"), Cancel in ${cancelMs} ms, restarted worker check ${fresh.ms|0} ms; timeout (4 s for the test) at ${b1.s.toFixed(1)} s; nothing applied`);
