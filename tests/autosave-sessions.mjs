// WS11 gate: autosave bytes. 50 seeded scripted sessions (edits through the app's own change() path, Undo and Redo
// clicks, re-saving an unchanged project) run in the pinned Chromium on SHARED_HISTORY on (app/assets) and off
// (scratch build); after every step the localStorage autosave must be byte-identical between the two, and so must
// the Undo/Redo button states.
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {createRequire} from 'node:module';
import {buildVariant,removeVariant,ROOT} from './perf/variant-build.mjs';
const SESSIONS=+(process.env.AVALON_SESSIONS||50);
const off=await buildVariant('autosave-off',s=>s.replace('SHARED_HISTORY=true','SHARED_HISTORY=false'));
const {chromium}=createRequire(import.meta.url)(process.env.AVALON_PLAYWRIGHT||'playwright');
const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'};
const servers=[];const serve=async assets=>{const server=http.createServer((q,r)=>{const f=path.resolve(assets,new URL(q.url,'http://x').pathname.slice(1)||'index.html');if(!f.startsWith(assets+path.sep)||!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(r);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));servers.push(server);return 'http://127.0.0.1:'+server.address().port;};
async function run(origin){const ctx=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});await ctx.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
 const page=await ctx.newPage();page.setDefaultTimeout(120000);await page.goto(origin+'/index.html');await page.waitForFunction(()=>window.__cad?.model?.engine?.local===true);
 const trace=[];
 try{for(let session=0;session<SESSIONS;session++){
  const steps=await page.evaluate(async session=>{let seed=session+1;const rnd=()=>(seed=(seed*1103515245+12345)%2147483648)/2147483648,pick=a=>a[Math.floor(rnd()*a.length)];
   const round=async()=>{await new Promise(r=>setTimeout(r,420));await new Promise(r=>requestIdleCallback(()=>r(),{timeout:2000}));await new Promise(r=>requestIdleCallback(()=>r(),{timeout:2000}));};
   // settled = the model is built for this project and the autosave and Undo/Redo state held still for two rounds (the
   // model result can apply floor adjustments asynchronously, so a fixed delay races it in either variant)
   const state=()=>JSON.stringify([localStorage.getItem('tristancad.autosave'),document.getElementById('undo').disabled,document.getElementById('redo').disabled,window.__cad.historyLength,document.getElementById('busy').textContent]);
   const settle=async()=>{let last=null,still=0;for(let i=0;i<40&&still<2;i++){await round();const now=state();still=now===last?still+1:0;last=now;}};
   const T=window.__cad.templates,p=T.blank();p.buildPlaneEnabled=true;p.name='Session '+session;
   for(let i=0;i<1+session%3;i++)p.objects.push({id:'s'+i,name:'shape '+i,type:pick(['box','cylinder','sphere']),params:{w:10+i,d:10,h:5,diameter:8+i},position:[i*20,0,0],rotation:[0,0,0],mode:'solid',enabled:true,layerId:p.activeLayer});
   window.__cad.load(p);await settle();const out=[localStorage.getItem('tristancad.autosave')];
   for(let step=0;step<6;step++){const op=pick(['move','move','rename','toggle','add','undo','undo','redo','same']);const c=window.__cad;
    if(op==='undo')document.getElementById('undo').click();else if(op==='redo')document.getElementById('redo').click();
    else if(op==='same')c.change(()=>{});
    else c.change(q=>{const o=pick(q.objects);if(op==='move')o.position[0]+=pick([1,-2,0.5]);else if(op==='rename')o.name='renamed '+step;else if(op==='toggle')o.enabled=!o.enabled;else q.objects.push({id:'a'+step,name:'added',type:'box',params:{w:5,d:5,h:5},position:[0,30,0],rotation:[0,0,0],mode:'solid',enabled:true,layerId:q.activeLayer});});
    await settle();out.push(op+'|'+document.getElementById('undo').disabled+document.getElementById('redo').disabled+'|'+localStorage.getItem('tristancad.autosave'));}
   return out;},session);
  trace.push(...steps);}}finally{await ctx.close();}
 return trace;}
let a,b;try{a=await run(await serve(path.join(ROOT,'app/assets')));b=await run(await serve(path.join(off,'app/assets')));}
finally{for(const s of servers)s.close();await browser.close();removeVariant(off);}
assert.equal(a.length,b.length);let bad=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i]){bad++;if(bad<4)console.log('differs at',i,String(a[i]).slice(0,120),'|',String(b[i]).slice(0,120));}
assert.equal(bad,0,'autosave bytes differ');
console.log('Autosave sessions:',SESSIONS,'sessions,',a.length,'autosave snapshots byte-identical with SHARED_HISTORY on and off');
