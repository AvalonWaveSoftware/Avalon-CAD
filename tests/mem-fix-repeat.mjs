// mem-fix-3.0 rev2 (Waydroid QA 2026-10-26 19:40, mem-fix-3.0 REJECT), real app and built worker.js (pinned Chromium,
// Android mode). QA's repeat sequence at Smooth shape (0.005 mm) with wasm memories capped at REPEAT_PAGES (default
// 5760 pages = 360 MB, the device ceiling seen: traps at heapMB 363, idle resets at 364/403 MB): tube hollow → open top,
// torus 30/8 at X40 hollow 2, group; torus selected: rotate + Undo, Mirror YZ in place, YZ Copy; rotate + Undo, YZ Copy
// (of the copy); tube selected: rotate + Undo, YZ Copy. Every Mirror must apply on its FIRST attempt: no wasm trap (so no
// re-run) and no error toast. Exact jobs log each coincident copy left out. On mem-fix-3.0 rev1 the second torus copy
// trapped and was refused, and the tube copy trapped before its re-run.
//   node tests/mem-fix-repeat.mjs   (after npm run build:web)
import assert from 'node:assert/strict';import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.AVALON_PLAYWRIGHT);
const assets=path.resolve('app/assets'),MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'};
const server=http.createServer((q,r)=>{const f=path.resolve(assets,new URL(q.url,'http://x').pathname.slice(1)||'index.html');if(!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(r);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const pages=Number(process.env.REPEAT_PAGES||5760);
const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--js-flags=--wasm-max-mem-pages='+pages]});
const page=await browser.newPage({viewport:{width:412,height:860}});
await page.addInitScript(()=>{window.Android={beginFile(){},appendFile(){},finishFile(){}};});
await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');
await page.waitForFunction(()=>window.__cad?.model!==undefined&&window.__cad.model!==null,null,{timeout:120000}).catch(()=>{});
await page.mouse.click(200,300);
const out=await page.evaluate(async()=>{const C=window.__cad,$=id=>document.getElementById(id),sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const settle=async()=>{await sleep(300);for(let i=0;i<600;i++){const s=$('status')?.textContent||'';if(!/Building|Updating|…/.test(s))break;await sleep(100);}await sleep(200);};
 const ch=async f=>{C.change(f);await settle();};const uid=()=>Math.random().toString(36).slice(2);
 const obj=(type,params,pos)=>({id:uid(),name:type,type,params,position:pos,rotation:[0,0,0],mode:'solid',enabled:true,layerId:C.project.activeLayer,resolution:{mode:'tolerance',tolerance:.005}});
 const tube=obj('tube',{diameter:25,inner:18,h:20},[0,0,10]),torus=obj('torus',{diameter:30,tube:8},[40,0,4]);
 await ch(p=>{p.version=3;p.objects.push(tube);});await ch(p=>{p.objects[0].shell={thickness:1.5};});await ch(p=>{p.objects[0].shell={thickness:1.5,open:[1]};});
 await ch(p=>p.objects.push(torus));await ch(p=>{p.objects[1].shell={thickness:2};});
 await ch(p=>{p.groups=[{id:'g1',name:'Group 1'}];for(const o of p.objects)o.groupId='g1';});
 const selectFirst=async id=>{const q=structuredClone(C.project);const i=q.objects.findIndex(o=>o.id===id);q.objects.unshift(...q.objects.splice(i,1));C.load(q);await settle();};
 const rotateUndo=async()=>{await ch(p=>{p.objects.find(o=>o.id===C.selected).rotation=[0,0,-90];});$('undo').click();await settle();};
 const steps=[];const mirror=async(name,copy)=>{if(C.touch.getState().mode!=='mirror')$('mirrorMode').click();await sleep(100);
  if(($('mirrorCopy').getAttribute('aria-pressed')==='true')!==copy)$('mirrorCopy').click();
  const n=C.project.objects.length,h=C.historyLength,traps=C.debugLog.filter(l=>l.includes('wasm trap')).length;$('toast').hidden=true;
  document.querySelector('[data-mirror="YZ"]').click();const t=performance.now();
  for(let i=0;i<3000;i++){await sleep(100);if(C.historyLength!==h||!$('toast').hidden&&$('toast').classList.contains('error'))break;}
  steps.push({name,objects:C.project.objects.length,was:n,applied:C.historyLength!==h,traps:C.debugLog.filter(l=>l.includes('wasm trap')).length-traps,toast:$('toast').hidden?'':$('toast').textContent,s:((performance.now()-t)/1000).toFixed(1)});await settle();};
 await selectFirst(torus.id);await rotateUndo();await mirror('torus YZ in place',false);await mirror('torus YZ copy',true);
 await rotateUndo();await mirror('torus YZ copy 2',true);
 await selectFirst(tube.id);await rotateUndo();await mirror('tube YZ copy',true);
 return {steps,log:C.debugLog.filter(l=>/wasm trap|coincident|manifold (reset|cache)/.test(l)).map(l=>l.slice(25,300))};});
await browser.close();server.close();
const bad=out.steps.filter(s=>!s.applied||s.traps||s.toast);
assert.deepEqual(bad,[],`every Mirror applies on its first attempt (no trap, no re-run, no toast) under ${pages} pages: `+JSON.stringify(out));
assert.deepEqual(out.steps.map(s=>s.objects-s.was),[0,1,1,1],'in place, then three copies added');
assert.ok(out.log.some(l=>/coincident copy left out \(check\): torus /.test(l)),'the coincident torus copy is logged: '+out.log.join(' | '));
console.log(`mem-fix-repeat: ${out.steps.map(s=>`${s.name} ${s.s} s`).join(', ')}; 0 traps under ${pages} pages; ${out.log.filter(l=>/coincident/.test(l)).length} coincident-copy line(s), ${out.log.filter(l=>/cache cleared/.test(l)).length} cache trim(s)`);
