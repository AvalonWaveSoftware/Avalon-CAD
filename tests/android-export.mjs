// WS12 gate (partial: no Android SDK or device on this box). In the pinned Chromium with a stand-in Android bridge
// that records every call: a Maximum-quality STL of a 12-edge filleted box must hand over
// byte-identical files, with the same notices in the same order, with BINARY_EXPORT on (app/assets) and off
// (scratch build); reports bridge calls and script time from beginFile to finishFile. Also checks the size rule.
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {createRequire} from 'node:module';
import {buildVariant,removeVariant,ROOT} from './perf/variant-build.mjs';
import {androidChunk,ANDROID_MAX,LEGACY_STEP,ANDROID_STEP} from '../web/android-export.mjs';
// MainActivity refuses a chunk once more than ANDROID_MAX bytes are staged; the legacy stream is kept exactly when it would refuse.
const refuses=(n,step)=>(Math.ceil(n/step)-1)*step>ANDROID_MAX;
for(const n of [0,1,3,24576,ANDROID_MAX-1,ANDROID_MAX,ANDROID_MAX+1,ANDROID_MAX+LEGACY_STEP,ANDROID_MAX+LEGACY_STEP+1,ANDROID_MAX+ANDROID_STEP+5])assert.equal(refuses(n,androidChunk(n)),refuses(n,LEGACY_STEP),'size rule '+n);
assert.equal(ANDROID_STEP%3,0,'chunks must be whole base64 groups');
// androidSend (node, test-only FileReader shim): same bytes as the 24 KB stream for edge sizes, and two hand-offs
// started together never interleave on the bridge.
{globalThis.FileReader??=class{readAsDataURL(b){b.arrayBuffer().then(x=>{this.result='data:application/octet-stream;base64,'+Buffer.from(x).toString('base64');this.onload();},e=>{this.error=e;this.onerror();});}};
 const {androidSend,androidAsync}=await import('../web/android-export.mjs');
 for(const n of [0,1,3*1024*1024])assert.equal(androidAsync(n),false,'small files keep the synchronous loop '+n);assert.equal(androidAsync(3*1024*1024+1),true);assert.equal(androidAsync(ANDROID_MAX+LEGACY_STEP+1),false,'refused sizes keep the 24 KB loop');
 const log=[],bridge={beginFile:(n,m)=>log.push(['b',n,m]),appendFile:d=>log.push(['a',d]),finishFile:()=>log.push(['f'])};
 const sizes=[0,1,2,3,4,LEGACY_STEP+1,ANDROID_STEP,ANDROID_STEP+5,2*ANDROID_STEP+1];
 const files=sizes.map((n,k)=>{const u=new Uint8Array(n);for(let i=0;i<n;i++)u[i]=(i*31+k*7)&255;return u;});
 const sends=files.map((u,k)=>androidSend(bridge,u,'f'+k+'.stl','model/stl'));assert.equal(androidAsync(1),true,'queued while a hand-off is in flight');await Promise.all(sends);assert.equal(androidAsync(1),false);
 let at=0;for(let k=0;k<files.length;k++){assert.deepEqual(log[at++],['b','f'+k+'.stl','model/stl']);const parts=[];while(log[at][0]==='a')parts.push(Buffer.from(log[at++][1],'base64'));assert.deepEqual(log[at++],['f']);
  assert.ok(Buffer.concat(parts).equals(Buffer.from(files[k])),'bytes '+sizes[k]);assert.equal(parts.length,Math.ceil(sizes[k]/ANDROID_STEP));}
 assert.equal(at,log.length);
 console.log('Android export: androidSend byte-identical for',sizes.length,'edge sizes; concurrent hand-offs serialised');}
const off=await buildVariant('android-off',s=>s.replace('BINARY_EXPORT=true','BINARY_EXPORT=false'));
const {chromium}=createRequire(import.meta.url)(process.env.AVALON_PLAYWRIGHT||'playwright');
const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'};
const servers=[];const serve=async assets=>{const server=http.createServer((q,r)=>{const f=path.resolve(assets,new URL(q.url,'http://x').pathname.slice(1)||'index.html');if(!f.startsWith(assets+path.sep)||!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(r);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));servers.push(server);return 'http://127.0.0.1:'+server.address().port;};
const PROJECT={format:'tristancad',version:2,name:'Export check',objects:[{id:'fb',name:'fb',type:'cylinder',params:{diameter:30,h:15},position:[0,0,7.5],rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1',fillets:[{edges:[0,2],radius:2}],resolution:{mode:'tolerance',tolerance:.005}},{id:'b',name:'b',type:'box',params:{w:20,d:20,h:10},position:[40,0,5],rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1'}],layers:[{id:'layer-1',name:'Layer 1'}],activeLayer:'layer-1',buildPlaneEnabled:true};
async function run(origin){const ctx=await browser.newContext({viewport:{width:412,height:915},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});await ctx.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
 try{const page=await ctx.newPage();page.setDefaultTimeout(180000);
  await page.addInitScript(()=>{window.__files=[];window.__toasts=[];window.Android={beginFile(name,mime){window.__files.push({name,mime,chunks:[],t0:performance.now()})},appendFile(x){window.__files.at(-1).chunks.push(x)},finishFile(){const f=window.__files.at(-1);f.done=true;f.ms=performance.now()-f.t0;}};
   new MutationObserver(()=>{const t=document.getElementById('toast');if(t&&t.textContent)window.__toasts.push(t.textContent);}).observe(document,{subtree:true,childList:true,characterData:true});});
  await page.goto(origin+'/index.html');await page.waitForFunction(()=>window.__cad?.model?.engine?.local===true);
  await page.evaluate(p=>window.__cad.load(p),PROJECT);await page.waitForFunction(()=>window.__cad.model?.parts?.length===2,null,{timeout:180000});
  await page.evaluate(()=>window.__cad.exportMenu());await page.locator('#quality').selectOption('maximum');await page.locator('#downloadSTL').click();await page.waitForFunction(()=>window.__files[0]?.done,null,{timeout:180000});
  await page.waitForTimeout(300);
  const files=await page.evaluate(()=>window.__files.map(f=>({name:f.name,mime:f.mime,chunks:f.chunks,ms:f.ms})));const toasts=await page.evaluate(()=>[...new Set(window.__toasts)]);
  return {files:files.map(f=>({name:f.name,mime:f.mime,calls:f.chunks.length,base64:f.chunks.reduce((n,c)=>n+c.length,0),ms:f.ms,bytes:Buffer.concat(f.chunks.map(c=>Buffer.from(c,'base64')))})),toasts};}
 finally{await ctx.close();}}
let a,b;try{a=await run(await serve(path.join(ROOT,'app/assets')));b=await run(await serve(path.join(off,'app/assets')));}finally{for(const s of servers)s.close();await browser.close();removeVariant(off);}
assert.equal(a.files.length,1);assert.equal(b.files.length,1);
const [x,y]=[a.files[0],b.files[0]];assert.equal(x.name,y.name);assert.equal(x.mime,y.mime);assert.ok(x.bytes.equals(y.bytes),'saved bytes differ');assert.deepEqual(a.toasts,b.toasts,'notices differ');
console.log(`Android export: ${x.name} ${x.bytes.length} B byte-identical, same notices (${JSON.stringify(a.toasts)}); bridge calls ${y.calls} -> ${x.calls}; script hand-off ${y.ms.toFixed(1)} -> ${x.ms.toFixed(1)} ms (desktop Chromium, not a device)`);
