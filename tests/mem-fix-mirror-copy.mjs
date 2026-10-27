// mem-fix-3.0 (Waydroid QA 2026-10-26 D3), real app and built worker.js (pinned Chromium, Android mode: window.Android
// stub, OCCT in the geometry worker). The QA scene at Smooth shape (0.005 mm): tube hollow → open top, torus 30/8 at X40
// hollow 2, group; then, with the torus selected, the touch Mirror bar: Copy off + YZ (in place), Copy on + YZ. The copy
// lands exactly on the torus. Before the fix the copy's 'check' job needed ~1.3 GB of Manifold heap (union of two
// coincident 254k-triangle meshes): it trapped ('memory access out of bounds'), the re-run on fresh instances trapped
// again and Copy added nothing (only a raw 'RuntimeError: …' toast, 50 s later on the device).
//  A: wasm memories capped at D3_PAGES (default 8000 pages = 500 MB, above the ~350 MB the device reached): Copy adds
//     the object, no error toast.
//  B: capped at D3_LOW_PAGES (default 3000 pages = 187 MB, below what the exact check of this scene needs even on fresh
//     instances): Mirror is not applied and the user sees the geometry-memory error toast, not a RuntimeError.
//   node tests/mem-fix-mirror-copy.mjs   (after npm run build:web)
import assert from 'node:assert/strict';import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.AVALON_PLAYWRIGHT);
const assets=path.resolve('app/assets'),MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'};
const server=http.createServer((q,r)=>{const f=path.resolve(assets,new URL(q.url,'http://x').pathname.slice(1)||'index.html');if(!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(r);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
async function session(pages,copy){
 const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--js-flags=--wasm-max-mem-pages='+pages]});
 const page=await browser.newPage({viewport:{width:412,height:860}});
 await page.addInitScript(()=>{window.Android={beginFile(){},appendFile(){},finishFile(){}};});
 await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');
 await page.waitForFunction(()=>window.__cad?.model!==undefined&&window.__cad.model!==null,null,{timeout:120000}).catch(()=>{});
 await page.mouse.click(200,300);
 const out=await page.evaluate(async copy=>{const C=window.__cad,$=id=>document.getElementById(id),sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const settle=async()=>{await sleep(300);for(let i=0;i<600;i++){const s=$('status')?.textContent||'';if(!/Building|Updating|…/.test(s))break;await sleep(100);}await sleep(200);};
  const ch=async f=>{C.change(f);await settle();};const uid=()=>Math.random().toString(36).slice(2);
  const obj=(type,params,pos)=>({id:uid(),name:type,type,params,position:pos,rotation:[0,0,0],mode:'solid',enabled:true,layerId:C.project.activeLayer,resolution:{mode:'tolerance',tolerance:.005}});
  const tube=obj('tube',{diameter:25,inner:18,h:20},[0,0,10]),torus=obj('torus',{diameter:30,tube:8},[40,0,4]);
  await ch(p=>{p.version=3;p.objects.push(tube);});await ch(p=>{p.objects[0].shell={thickness:1.5};});await ch(p=>{p.objects[0].shell={thickness:1.5,open:[1]};});
  await ch(p=>p.objects.push(torus));await ch(p=>{p.objects[1].shell={thickness:2};});
  await ch(p=>{p.groups=[{id:'g1',name:'Group 1'}];for(const o of p.objects)o.groupId='g1';});
  // Select the torus (load selects the first object of the active layer); the worker and its heap stay as they are.
  const q=structuredClone(C.project);q.objects.reverse();C.load(q);await settle();
  $('mirrorMode').click();await sleep(100);
  const mirror=async on=>{if(($('mirrorCopy').getAttribute('aria-pressed')==='true')!==on)$('mirrorCopy').click();const n=C.project.objects.length,h=C.historyLength;$('toast').hidden=true;
   document.querySelector('[data-mirror="YZ"]').click();const t=performance.now();
   for(let i=0;i<3000;i++){await sleep(100);if(C.historyLength!==h||!$('toast').hidden&&$('toast').classList.contains('error'))break;}
   return {objects:C.project.objects.length,was:n,mirrored:C.project.objects.map(o=>!!o.mirrored),toast:$('toast').hidden?'':$('toast').textContent,error:!$('toast').hidden&&$('toast').classList.contains('error'),s:((performance.now()-t)/1000).toFixed(1)};};
  const res={inPlace:await mirror(false)};if(copy&&!res.inPlace.error){await settle();res.copy=await mirror(true);}
  if(copy){// D5: the Edit sheet shows X rounded (mm 3 decimals; inches as before), an unchanged field keeps the stored value.
   const sel=()=>C.project.objects.find(o=>o.id===C.selected);await ch(()=>{sel().position[0]=40.0027847216093062;});const open=async()=>{$('editBtn').click();for(let i=0;i<50&&!$('pos0');i++)await sleep(100);return $('pos0').value;};
   res.posMM=await open();$('applyObject').click();await settle();res.posKept=sel().position[0];
   C.units.set('in');res.posIN=await open();$('closeSheet').click();C.units.set('mm');await sleep(200);}
  res.hollows=(C.debugLog||[]).filter(l=>l.includes('hollow engine=')).map(l=>l.slice(25));
  res.traps=(C.debugLog||[]).filter(l=>l.includes('wasm trap')).map(l=>l.slice(25,260));return res;},copy);
 await browser.close();return out;}
const a=await session(Number(process.env.D3_PAGES||8000),true);
assert.ok(a.inPlace.objects===2&&a.inPlace.mirrored[0]&&!a.inPlace.error,'A: Mirror YZ in place applies: '+JSON.stringify(a));
assert.ok(a.copy&&a.copy.objects===3&&!a.copy.error,'A: Mirror YZ with Copy adds the object under the capped heap: '+JSON.stringify(a));
// D4: every 'hollow engine=' line is one hollow built in that job; its phases are parts of its own ms (a stale repeat of
// an earlier hollow's phases, as on the device: 'ms=0 … offset=34 check=20 mesh=15', breaks this).
for(const l of a.hollows){const v=Object.fromEntries([...l.matchAll(/(\w+)=(\d+)/g)].map(m=>[m[1],+m[2]]));if(v.offset>=0)assert.ok(v.ms+2>=v.base+v.offset+v.check+v.mesh,'D4: phases within the hollow\'s own time: '+l);}
assert.equal(a.posMM,'40.003','D5: Edit sheet X in mm');assert.equal(a.posKept,40.0027847216093062,'D5: an unchanged X field keeps the stored value');assert.equal(a.posIN,'1.575','D5: Edit sheet X in inches');
const b=await session(Number(process.env.D3_LOW_PAGES||3000),false);
assert.ok(b.inPlace.error&&b.inPlace.objects===2&&!b.inPlace.mirrored[0],'B: the failed Mirror is not applied and shows an error toast: '+JSON.stringify(b));
assert.equal(b.inPlace.toast,'The model exceeds available geometry memory.','B: the user sees the geometry-memory error, not a raw RuntimeError');
assert.ok(b.traps.length>0,'B: the trap is logged');
console.log(`mem-fix-mirror-copy: A (${process.env.D3_PAGES||8000} pages) in place ${a.inPlace.s} s, Copy → 3 objects in ${a.copy.s} s, ${a.traps.length} trap(s), ${a.hollows.length} hollow line(s) checked, Edit X ${a.posMM} mm / ${a.posIN} in; B (${process.env.D3_LOW_PAGES||3000} pages) memory error toast in ${b.inPlace.s} s, ${b.traps.length} trap(s) logged`);
server.close();
