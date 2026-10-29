// mem-preview (2a), Architect ruling 2026-10-25 23:02, real app and built worker.js (pinned Chromium, Android mode).
// The Waydroid QA session at Smooth shape takes Manifold's heap past 300 MB (the exact check of the scene); once the
// worker is idle for 1 s it replaces Manifold with a fresh instance and logs it. After the reset, check and STL export of
// the session's project are byte-identical to a fresh app opening the same project.
//   node tests/mem-idle-reset.mjs   (after npm run build:web)
import assert from 'node:assert/strict';import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.AVALON_PLAYWRIGHT);
const assets=path.resolve('app/assets'),MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'};
const server=http.createServer((q,r)=>{const f=path.resolve(assets,new URL(q.url,'http://x').pathname.slice(1)||'index.html');if(!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(r);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
const page=await browser.newPage({viewport:{width:412,height:860}});const logs=[];
page.on('console',m=>{logs.push(m.text());});page.on('crash',()=>console.log('PAGE CRASH'));page.on('pageerror',e=>logs.push('pageerror '+e.message));page.on('worker',w=>w.on('console',m=>logs.push('[worker] '+m.text())));
await page.addInitScript(t=>{window.Android={beginFile(){},appendFile(){},finishFile(){}};window.__TRAPJOB=t;},false);
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
 await sleep(2500);const hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].slice(0,8).map(x=>x.toString(16).padStart(2,'0')).join('');
 const ck=await C.request('check',{project:structuredClone(C.project),tolerance:.15}),ex=await C.request('export',{project:structuredClone(C.project),tolerance:.05,ground:true});
 window.__after={project:JSON.stringify(C.project),check:await hash(ck.vertices)+await hash(ck.triangles),export:await hash(ex.buffer)};
 res.push(...(C.debugLog||[]).map(l=>l.slice(0,3000)));return res;});
const after=await page.evaluate(()=>window.__after);
// A fresh app (cold Manifold) with the same project.
const fresh=await browser.newPage();await fresh.addInitScript(()=>{window.Android={beginFile(){},appendFile(){},finishFile(){}};});
await fresh.goto('http://127.0.0.1:'+server.address().port+'/index.html');await fresh.waitForFunction(()=>window.__cad?.model,null,{timeout:120000});
const cold=await fresh.evaluate(async p=>{const C=window.__cad;C.load(JSON.parse(p));const hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].slice(0,8).map(x=>x.toString(16).padStart(2,'0')).join('');
 const ck=await C.request('check',{project:structuredClone(C.project),tolerance:.15}),ex=await C.request('export',{project:structuredClone(C.project),tolerance:.05,ground:true});return {check:await hash(ck.vertices)+await hash(ck.triangles),export:await hash(ex.buffer)};},after.project);
const steps=out.filter(l=>!/^\d{4}-/.test(l)),resets=out.filter(l=>/\[avalon\] manifold reset: heap \d+ MB, idle/.test(l));
assert.ok(steps.every(l=>!/ERR/.test(l)),'every step succeeds: '+steps.join(' | '));
assert.ok(resets.length>=1,'an idle Manifold reset is logged once the heap passed 300 MB: '+out.filter(l=>/^\d{4}-/.test(l)).map(l=>l.slice(25,90)).join(' | '));
assert.deepEqual(after,{...after,...cold},'check and STL export after the idle reset are byte-identical to a fresh app');
console.log(`mem-idle-reset: ${resets.map(l=>l.slice(l.indexOf('heap'))).join(', ')}; check ${after.check} and export ${after.export} identical to a fresh app`);
await browser.close();server.close();
