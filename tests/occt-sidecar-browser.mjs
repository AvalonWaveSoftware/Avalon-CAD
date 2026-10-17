// WS14 (OCCT_SIDECAR) in the real app (pinned Chromium, SwiftShader), against an OCCT_SIDECAR=false build:
//  - a first-time fillet shows an interim display (part without its fillet) and then the final model;
//  - a move of another object while a new fillet is computing reaches the screen as interim display data (functional
//    check <= 250 ms under SwiftShader; the timing budget is gated in tests/perf/ws14-bench.mjs);
//  - after settling: preview mesh, autosave bytes and a Maximum-quality STL export are byte-identical to the off build,
//    and the busy text / model are only set by final results.
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {createRequire} from 'node:module';import {createHash} from 'node:crypto';
import {buildVariant,removeVariant,ROOT} from './perf/variant-build.mjs';
const off=await buildVariant('sidecar-off',s=>s.replace('OCCT_SIDECAR=!globalThis.Android;','OCCT_SIDECAR=false;'));
const {chromium}=createRequire(import.meta.url)(process.env.AVALON_PLAYWRIGHT||'playwright');
const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'};
const servers=[];const serve=async assets=>{const server=http.createServer((q,r)=>{const f=path.resolve(assets,new URL(q.url,'http://x').pathname.slice(1)||'index.html');if(!f.startsWith(assets+path.sep)||!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(r);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));servers.push(server);return 'http://127.0.0.1:'+server.address().port;};
const fb=r=>({id:'fb',name:'fb',type:'cylinder',params:{diameter:80,h:30},position:[-30,0,15],rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1',fillets:[{edges:[0,2],radius:r}],resolution:{mode:'tolerance',tolerance:.005}});
const bx=x=>({id:'b',name:'b',type:'box',params:{w:20,d:20,h:10},position:[x,0,5],rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1'});
const P=(r,x)=>({format:'tristancad',version:2,name:'Sidecar check',objects:[fb(r),bx(x)],layers:[{id:'layer-1',name:'Layer 1'}],activeLayer:'layer-1',buildPlaneEnabled:true});
const hash=a=>createHash('sha256').update(Buffer.from(a)).digest('hex');
async function run(origin,android=false){const ctx=await browser.newContext({viewport:{width:412,height:915},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});await ctx.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
 try{const page=await ctx.newPage();page.setDefaultTimeout(180000);
  await page.addInitScript(android=>{window.__files=[];window.__interims=[];window.__androidStub={beginFile(name,mime){window.__files.push({name,mime,chunks:[]})},appendFile(x){window.__files.at(-1).chunks.push(x)},finishFile(){window.__files.at(-1).done=true;}};
   // The 'Android' bridge is the APK's build marker (OCCT_SIDECAR off). Desktop/web runs install it only for the STL
   // capture after startup; the Android run has it from the first script, as the WebView does.
   if(android)window.Android=window.__androidStub;window.__workers=[];
   const W=window.Worker;window.Worker=class extends W{constructor(...a){super(...a);window.__workers.push(String(a[0]).replace(/^.*\//,''));this.addEventListener('message',e=>{(window.__msgs??=[]).push({t:performance.now(),id:e.data?.id,interim:!!e.data?.interim,canceled:!!e.data?.canceled});if(e.data?.interim)window.__interims.push({t:performance.now(),busy:document.getElementById('busy').textContent,model:window.__cad?.model});});}};},android);
  await page.goto(origin+'/index.html');await page.waitForFunction(()=>window.__cad?.model?.engine?.local===true);
  const settle=n=>page.waitForFunction(n=>window.__cad.model?.parts?.length===n&&!/Building/.test(document.getElementById('busy').textContent),n,{timeout:180000});
  // 1. first-time fillet
  await page.evaluate(p=>window.__cad.load(p),P(3,40));await settle(2);
  const first=await page.evaluate(()=>({n:window.__interims.length,busy:window.__interims.map(i=>i.busy),modelUnchanged:window.__interims.every(i=>i.model!==window.__cad.model)}));
  if(process.env.DEBUG)console.log(JSON.stringify(first));
  // 2. a new fillet radius, then (at its interim, or 150 ms later in the off build) a move of the box while it computes
  const move=await page.evaluate(async([a,b])=>{const n=window.__interims.length;window.__cad.load(a);
   await new Promise(r=>{const t=performance.now();const c=()=>window.__interims.length>n||performance.now()-t>150?r():setTimeout(c,1);c();});
   const t0=performance.now(),k=window.__msgs.length;window.__cad.load(b);
   await new Promise(r=>{const c=()=>window.__msgs.slice(k).some(x=>!x.canceled)?r():setTimeout(c,1);c();});
   const e=window.__msgs.slice(k).find(x=>!x.canceled);return {ms:e.t-t0,interim:e.interim};},[P(3.5,40),P(3.5,46)]);
  await page.waitForFunction(()=>window.__cad.model?.parts?.find(p=>p.id==='b')?.bounds.min[0]>35.5&&!/Building/.test(document.getElementById('busy').textContent),null,{timeout:180000});
  if(process.env.DEBUG)console.log(JSON.stringify(move),JSON.stringify(await page.evaluate(()=>window.__msgs.map(x=>({...x,t:Math.round(x.t)})))));
  const model=await page.evaluate(()=>({v:Array.from(new Uint8Array(window.__cad.model.vertices.buffer,window.__cad.model.vertices.byteOffset,window.__cad.model.vertices.byteLength)),d:Array.from(new Uint8Array(window.__cad.model.displayPositions.buffer)),status:document.getElementById('busy').textContent}));
  await page.waitForTimeout(1500);const autosave=await page.evaluate(()=>localStorage.getItem('tristancad.autosave'));
  await page.evaluate(()=>{window.Android=window.__androidStub;window.__cad.exportMenu();});await page.locator('#quality').selectOption('maximum');await page.locator('#downloadSTL').click();await page.waitForFunction(()=>window.__files[0]?.done,null,{timeout:180000});
  const stl=await page.evaluate(()=>window.__files[0].chunks);
  return {first,move,model:{v:hash(model.v),d:hash(model.d),status:model.status},autosave,stl:Buffer.concat(stl.map(c=>Buffer.from(c,'base64'))),interims:await page.evaluate(()=>window.__interims.length),workers:await page.evaluate(()=>window.__workers)};}
 finally{await ctx.close();}}
let on,offR,droid;try{const o=await serve(path.join(ROOT,'app/assets'));on=await run(o);droid=await run(o,true);offR=await run(await serve(path.join(off,'app/assets')));}finally{for(const s of servers)s.close();await browser.close();removeVariant(off);}
assert.ok(!offR.move.interim);assert.equal(offR.interims,0,'off build sends no interim data');
assert.ok(on.move.interim&&on.move.ms<=250,'the move reaches the screen as an interim display while the fillet computes ('+JSON.stringify(on.move)+')');assert.ok(on.first.n>=1,'first-time fillet shows an interim display');assert.ok(on.first.busy.every(b=>/Building/.test(b)),'busy text stays while interim');assert.ok(on.first.modelUnchanged,'interim never becomes the model');
assert.equal(on.model.v,offR.model.v,'final preview vertices');assert.equal(on.model.d,offR.model.d,'final display');assert.equal(on.model.status,offR.model.status,'final status');
assert.equal(on.autosave,offR.autosave,'autosave bytes');assert.ok(on.stl.equals(offR.stl),'STL bytes');
// ADR occt-sidecar-desktop-web: desktop/web start worker-sidecar.js (and its 'occt' sidecar); the same build with the
// Android bridge present from the start runs the 2.7.1 path: worker.js only, no interim data, same bytes as the off build.
assert.equal(on.workers[0].split('?')[0],'worker-sidecar.js','desktop/web starts the sidecar worker bundle');
assert.deepEqual(droid.workers.map(w=>w.split('?')[0]),['worker.js'],'Android build starts only worker.js');assert.equal(droid.interims,0,'Android build sends no interim data');assert.ok(!droid.move.interim);
assert.equal(droid.model.v,offR.model.v);assert.equal(droid.model.d,offR.model.d);assert.equal(droid.autosave,offR.autosave);assert.ok(droid.stl.equals(offR.stl),'Android STL bytes');
console.log(`OCCT sidecar (browser; Android-flagged run: worker.js only, 0 interims, bytes = off build): ${on.interims} interim displays; move during a new fillet on screen in ${on.move.ms.toFixed(1)} ms (${on.move.interim?'interim':'final'}; off build ${offR.move.ms.toFixed(1)} ms, final); final preview, display, status, autosave (${on.autosave.length} B) and Maximum STL (${on.stl.length} B) byte-identical to OCCT_SIDECAR=false`);
