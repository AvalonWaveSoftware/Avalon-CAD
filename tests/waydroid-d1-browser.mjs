// Waydroid QA 2026-10-25 D1, real app and built worker.js (pinned Chromium, Android mode: window.Android stub, OCCT in
// the geometry worker). The QA session (Smooth shape, 0.005 mm: tube hollow → open top, torus 30/8 hollow 2 at X40,
// group, rotate drag + Undo, Mirror YZ in place, YZ Copy, Add Box at X−45 + Apply) needs ~400 MB of Manifold heap; with
// wasm memories capped at 5000 pages (312 MB, a stand-in for the WebView limit) Manifold's allocations fail silently
// and a later Manifold delete traps ('table index is out of bounds' / 'null function'), as on the device. Before the fix
// the worker kept the broken Manifold instance and every later job failed until a restart. Now each trap is logged
// (op stack, last jobs) and the job is re-run once on fresh Manifold/Rust/OCCT instances, so every step succeeds.
//   node tests/waydroid-d1-browser.mjs   (after npm run build:web)
import assert from 'node:assert/strict';import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.AVALON_PLAYWRIGHT);
const assets=path.resolve('app/assets'),MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'};
const server=http.createServer((q,r)=>{const f=path.resolve(assets,new URL(q.url,'http://x').pathname.slice(1)||'index.html');if(!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(r);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--js-flags=--wasm-max-mem-pages='+(process.env.D1_PAGES||5000)]});
const page=await browser.newPage({viewport:{width:412,height:860}});const logs=[];
page.on('console',m=>{logs.push(m.text());});page.on('crash',()=>console.log('PAGE CRASH'));page.on('pageerror',e=>logs.push('pageerror '+e.message));page.on('worker',w=>w.on('console',m=>logs.push('[worker] '+m.text())));
await page.addInitScript(t=>{window.Android={beginFile(){},appendFile(){},finishFile(){}};window.__TRAPJOB=t;},true); // mem-preview: preview-smoothness hollows no longer exhaust the 5000-page heap; the filleted Ø400 export (exact, tol 0.01) does
await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');
await page.waitForFunction(()=>window.__cad?.model!==undefined&&window.__cad.model!==null,null,{timeout:120000}).catch(()=>{});
await page.mouse.click(200,300);
const out=await page.evaluate(async()=>{const C=window.__cad,res=[];const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const settle=async()=>{await sleep(300);for(let i=0;i<200;i++){const s=document.getElementById('status')?.textContent||'';if(!/Building|Updating|…/.test(s))break;await sleep(100);}res.push((C.model?.volume||0).toFixed(1));await sleep(200);};
 const ch=async f=>{C.change(f);await settle();};const uid=()=>Math.random().toString(36).slice(2);
 const obj=(type,params,pos)=>({id:uid(),name:type,type,params,position:pos,rotation:[0,0,0],mode:'solid',enabled:true,layerId:C.project.activeLayer,...(['tube','torus'].includes(type)?{resolution:{mode:'tolerance',tolerance:.005}}:{})});
 const req=async(t,d)=>{try{const r=await C.request(t,d);res.push(t+':ok');return r;}catch(e){res.push(t+':ERR '+e.message);}};
 const tube=obj('tube',{diameter:25,inner:18,h:20},[0,0,10]);await ch(p=>{p.version=3;p.objects.push(tube);});
 await ch(p=>{p.objects[0].shell={thickness:1.5};});
 const topo=C.picks;await ch(p=>{p.objects[0].shell={thickness:1.5,open:[Number(window.__TOP??1)]};});
 const torus=obj('torus',{diameter:30,tube:8},[40,0,4]);await ch(p=>p.objects.push(torus));await ch(p=>{p.objects[1].shell={thickness:2};});
 await ch(p=>{p.groups=[{id:'g1',name:'Group 1'}];for(const o of p.objects)o.groupId='g1';});
 for(let a=1;a<=15;a++){C.change(p=>{p.objects[0].rotation=[0,0,a];});await sleep(16);}await settle();C.commands.undo?.run?C.commands.undo.run():document.getElementById('undo').click();await settle();
 const mirror=o=>{const out=structuredClone(o);out.rotation=[o.rotation[0],-o.rotation[1],-o.rotation[2]];if(o.mirrored)delete out.mirrored;else out.mirrored=true;return out;};
 {const q=structuredClone(C.project);q.objects[0]=mirror(q.objects[0]);await req('check',{project:q,tolerance:.15});await ch(p=>{p.objects[0]=mirror(p.objects[0]);});}
 {const q=structuredClone(C.project);const c={...mirror(q.objects[0]),id:uid()};q.objects.push(c);await req('check',{project:q,tolerance:.15});await ch(p=>p.objects.push(c));}
 if(window.__TRAPJOB){const big=obj('cylinder',{diameter:400,h:200},[0,0,100]);big.fillets=[{edges:[0,2],radius:40}];const q=structuredClone(C.project);q.objects=[big];await req('export',{project:q,tolerance:.01,ground:true});}
 const box=obj('box',{w:30,d:30,h:15},[-45,0,7.5]);const q=structuredClone(C.project);q.objects.push(box);await req('check',{project:q,tolerance:.15});await ch(p=>p.objects.push(box));
 // mem-preview: the deferred smooth hollows finish after the status settles; wait for a stable model, then compare it
 // with the exact check of the same project (preview smoothness: within 0.1%).
 let v=-1;for(let i=0;i<120&&C.model?.volume!==v;i++){v=C.model?.volume;await sleep(1500);}const exact=await C.request('check',{project:structuredClone(C.project),tolerance:.15});res.push('final:'+v+':'+exact.volume);
 res.push(...(C.debugLog||[]).map(l=>l.slice(0,3000)));return res;});
const traps=out.filter(l=>l.includes('[avalon] wasm trap')),steps=out.filter(l=>!/^\d{4}-/.test(l));
assert.ok(steps.every(l=>!/ERR/.test(l)),'every step succeeds after the worker recovers: '+steps.join(' | '));
const [,fv,ev]=steps.at(-1).split(':').map(Number);steps.pop();
assert.ok(Math.abs(fv-ev)/ev<1e-3,`Add Box applied, all hollows built: preview volume ${fv} vs exact ${ev}`);
assert.ok(traps.length>0,'the capped heap must trap at least once (scenario check; raise D1_PAGES only with a ruling)');
assert.ok(traps.every(l=>/"recent":\[/.test(l)&&/"ops":\[/.test(l)),'each trap logs its op stack and last jobs');
assert.ok(out.some(l=>/hollow engine=occt type=torus ms=\d+ base=\d+ offset=\d+ check=\d+ mesh=\d+/.test(l)),'hollow engine debug line');
console.log(`waydroid-d1-browser: ${steps.length} steps ok with Manifold capped at ${process.env.D1_PAGES||5000} pages; ${traps.length} trap(s) logged and recovered`);
await browser.close();server.close();
