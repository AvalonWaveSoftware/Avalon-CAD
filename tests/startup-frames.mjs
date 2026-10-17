// WS9 pixel gate on startup frames: BUNDLE_SPLIT on (app/assets) vs off (scratch build). For phone and desktop, with
// an empty project and with a saved project (autosave), capture (1) the first frame while the engine worker is held
// back (no engine answer yet) and (2) the settled frame after the first preview. Every pair must be 0 px apart.
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
import {buildVariant,removeVariant,ROOT} from './perf/variant-build.mjs';
import {diffPixels} from './perf/png.mjs';
const SEED=fs.readFileSync(path.join(ROOT,'tests/fixtures/simple-subtract.tcad'),'utf8');
const off=await buildVariant('frames-off',s=>s.replace('BUNDLE_SPLIT=true','BUNDLE_SPLIT=false'));
// Same capture setup as tests/pixels.mjs: the pinned Chromium (AVALON_CHROMIUM), SwiftShader, and #busy/#toast hidden.
import http from 'node:http';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.AVALON_PLAYWRIGHT||'playwright');
const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'};
const serve=async assets=>{const server=http.createServer((q,r)=>{const f=path.resolve(assets,new URL(q.url,'http://x').pathname.slice(1)||'index.html');if(!f.startsWith(assets+path.sep)||!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');r.setHeader('Cache-Control','no-store');fs.createReadStream(f).pipe(r);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));return {env:{origin:'http://127.0.0.1:'+server.address().port,browser,close:()=>server.close()}};};
const clean=page=>page.addStyleTag({content:'#busy{visibility:hidden!important}#toast{display:none!important}'});
const V={on:await serve(path.join(ROOT,'app/assets')),off:await serve(path.join(off,'app/assets'))};
// A capture counts once three consecutive screenshots 250 ms apart are identical (the scene is provably still).
async function stable(page){
 // as tests/pixels.mjs settle(): OrbitControls damping must have stopped (probe point still to 1e-6 px for 3 polls)
 await page.waitForFunction(()=>window.__cad?.touch?.pointScreen,null,{timeout:60000});await page.evaluate(()=>{window.__probe=null;window.__same=0;});
 await page.waitForFunction(()=>{const p=window.__cad.touch.pointScreen([10,-5,5]),q=window.__probe;window.__same=q&&Math.abs(p[0]-q[0])<1e-6&&Math.abs(p[1]-q[1])<1e-6?window.__same+1:0;window.__probe=p;return window.__same>=3;},null,{polling:100,timeout:60000});
 let last=await page.screenshot(),same=0;for(let i=0;i<60&&same<2;i++){await page.waitForTimeout(250);const next=await page.screenshot();same=next.equals(last)?same+1:0;last=next;}return last;}
async function frames({env},desktop,seed){
 const ctx=await env.browser.newContext(desktop?{viewport:{width:1440,height:900},deviceScaleFactor:1,serviceWorkers:'block'}:{viewport:{width:412,height:915},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
 let release;const held=new Promise(r=>release=r);
 await ctx.route('**/*',async r=>{const u=r.request().url();if(!u.startsWith(env.origin+'/'))return r.abort();if(/\/worker\.js/.test(u))await held;return r.continue();});
 const page=await ctx.newPage();page.setDefaultTimeout(180000);
 // As tests/pixels.mjs: app timers of >=1 s (render linger, toasts) are held so captures do not depend on wall-clock time.
 await page.addInitScript(()=>{const set=window.setTimeout.bind(window),clear=window.clearTimeout.bind(window),held=[];
  window.setTimeout=function(fn,ms,...a){if(typeof fn!=='function'||!(ms>=1000))return set(fn,ms,...a);const id=set(()=>held.push({id,run:()=>fn(...a)}),ms);return id;};
  window.clearTimeout=id=>{const i=held.findIndex(h=>h.id===id);if(i>=0)held.splice(i,1);clear(id);};});
 await page.addInitScript(s=>{if(s&&!sessionStorage.getItem('seeded')){localStorage.setItem('tristancad.autosave',s);sessionStorage.setItem('seeded','1');}},seed||null);
 const T0=Date.now(),L=m=>process.env.DEBUG&&console.log(m,Date.now()-T0);await page.goto(env.origin+'/index.html',{waitUntil:'domcontentloaded',timeout:30000});await clean(page);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.waitForTimeout(300);
 L('frame');const first=await stable(page);L('shot');release();
 await page.waitForFunction(()=>window.__cad?.model?.engine?.local===true,{},{timeout:90000});L('ready');await page.evaluate(()=>document.fonts.ready.then(()=>{}));
 const settled=await stable(page);L('settled');await ctx.close();return {first,settled};}
let pairs=0;const bad=[];
// Settled frames must match on the first try. The pre-engine first frame (worker held back) has one canvas pixel that
// is not reproducible between sessions even on the same build (a 1-LSB flip at 1162,241 desktop, seen with on-vs-on
// controls), so a first frame passes when some capture of each build is byte-identical (up to 3 sessions per build).
const label=(desktop,seed,k)=>(desktop?'desktop':'phone')+(seed?' saved project':' empty')+' '+k;
const other=()=>process.env.AVALON_FRAMES_CONTROL?V.on:V.off;let retried=0;
try{for(const desktop of [false,true])for(const seed of [null,SEED]){const A=[await frames(V.on,desktop,seed)],B=[await frames(other(),desktop,seed)];
  const what=k=>label(desktop,seed,k),dump=(k,a,b)=>{if(process.env.AVALON_FRAMES_DUMP){const f=process.env.AVALON_FRAMES_DUMP+'/'+what(k).replace(/ /g,'_');fs.writeFileSync(f+'-on.png',a);fs.writeFileSync(f+'-off.png',b);}};
  pairs++;const ds=diffPixels(A[0].settled,B[0].settled);if(ds.differing){bad.push(what('settled')+': '+ds.differing+' px');dump('settled',A[0].settled,B[0].settled);}
  const match=()=>A.some(a=>B.some(b=>a.first.equals(b.first)));
  while(!match()&&A.length<3){retried++;A.push(await frames(V.on,desktop,seed));B.push(await frames(other(),desktop,seed));}
  pairs++;if(!match()){const d=diffPixels(A[0].first,B[0].first);bad.push(what('first')+': '+d.differing+' px after '+A.length+' sessions per build');dump('first',A[0].first,B[0].first);}}}
finally{V.on.env.close();V.off.env.close();await browser.close();removeVariant(off);}
assert.deepEqual(bad,[],'startup frames differ: '+bad.join('; '));
console.log('Startup frames:',pairs,'cases identical with BUNDLE_SPLIT on and off (0 px)'+(retried?'; first-frame retries: '+retried:''));
