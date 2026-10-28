// D6 rev4 (QA note on rev3): when Cancel restarts the worker, pending unwatched requests are not re-sent blindly.
// Superseded previews are dropped (resolved as canceled; one refresh() asks for the latest model), short idempotent
// requests (check/place/measure/boolean/glyphOutlines/groundProject) are re-sent, anything else (here an unwatched
// export) fails with the approved "Canceled. Nothing was changed.". Real app, built worker.js, headless Chromium.
// Fails on rev3 (the heavy preview and the export are re-sent, no refresh).
//   node tests/d6-restart-resend.mjs   (after npm run build:web)
import assert from 'node:assert/strict';import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.AVALON_PLAYWRIGHT);
const assets=path.resolve('app/assets'),MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'};
const server=http.createServer((q,r)=>{const f=path.resolve(assets,new URL(q.url,'http://x').pathname.slice(1)||'index.html');if(!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(r);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:412,height:860}});
await page.addInitScript(()=>{window.Android={beginFile(){},appendFile(){},finishFile(){}};window.__posts=[];const post=Worker.prototype.postMessage;Worker.prototype.postMessage=function(m,t){if(m?.type)window.__posts.push(m.type);return post.call(this,m,t);};});
await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');
await page.waitForFunction(()=>window.__cad?.model!==undefined&&window.__cad.model!==null,null,{timeout:120000}).catch(()=>{});
await page.evaluate(async()=>{const C=window.__cad,sleep=ms=>new Promise(r=>setTimeout(r,ms)),L=C.project.activeLayer;
 const q=structuredClone(C.project);q.objects=[];for(let i=0;i<6;i++)q.objects.push({id:'s'+i,name:'sphere',type:'sphere',params:{diameter:400},position:[i*.5,0,200],rotation:[0,0,0],mode:'solid',enabled:true,layerId:L,resolution:{mode:'tolerance',tolerance:.005}});
 C.load(q);for(let i=0;i<600&&!(C.model?.volume>1e7);i++)await sleep(200);await sleep(1500);
 const small=structuredClone(C.project);small.objects=[{id:'b',name:'box',type:'box',params:{w:10,d:10,h:10},position:[300,0,5],rotation:[0,0,0],mode:'solid',enabled:true,layerId:L}];
 const out=window.__out={},tag=(k,p)=>p.then(v=>out[k]=v&&v.canceled?'canceled-preview':(v?.volume??'ok'),e=>out[k]='ERR '+e.message);
 tag('watched',C.request('check',{project:structuredClone(C.project),tolerance:.15}));await sleep(50);
 tag('preview',C.request('preview',{project:structuredClone(C.project),tolerance:.15},undefined,undefined,false));
 tag('small',C.request('check',{project:small,tolerance:.15},undefined,undefined,false));
 tag('export',C.request('export',{project:small,format:'stl'},undefined,undefined,false));});
await page.waitForFunction(()=>{const b=document.getElementById('jobWatch');return b&&getComputedStyle(b).display!=='none';},null,{timeout:30000});
const mark=await page.evaluate(()=>window.__posts.length);await page.click('#jobCancel');
await page.waitForFunction(()=>['watched','preview','small','export'].every(k=>k in window.__out),null,{timeout:60000});
await page.waitForTimeout(500);
const r=await page.evaluate(m=>({out:window.__out,after:window.__posts.slice(m).filter(t=>/^(check|preview|export)$/.test(t))}),mark);
await browser.close();server.close();
assert.equal(r.out.watched,'ERR Canceled. Nothing was changed.','the canceled job fails with its text');
assert.equal(r.out.preview,'canceled-preview','the superseded preview is dropped, not re-sent');
assert.ok(Math.abs(r.out.small-1000)<1e-6,'the short check is re-sent and answers: '+r.out.small);
assert.equal(r.out.export,'ERR Canceled. Nothing was changed.','an unwatched long request is not re-sent; it fails as canceled');
assert.deepEqual(r.after.sort(),['check','preview'],'after the restart: the short check re-sent once plus one refresh() preview of the latest model: '+JSON.stringify(r.after));
console.log(`d6-restart-resend: after Cancel, posts to the new worker ${JSON.stringify(r.after)}; preview dropped, small check ${r.out.small} mm³, export failed as canceled`);
