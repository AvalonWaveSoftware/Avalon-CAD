// WS10 pixel gate for moves with the indexed display: a filleted cylinder (both rims, tolerance 0.005; as the pixels.mjs
// fillet scenes) moved five times by 1 mm must render byte-identically to the same part loaded directly at the final
// position, with INDEXED_DISPLAY on and off (per-corner arrays, the pre-WS10 path); off moved vs off fresh is the
// control. Phone and desktop, wireframe off and on. Capture setup as tests/startup-frames.mjs. (This gate is what
// rejected reusing a moved part's normals: 1-10 px differed by one level.)
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {createRequire} from 'node:module';
import {buildVariant,removeVariant,ROOT} from './perf/variant-build.mjs';
import {diffPixels} from './perf/png.mjs';
const off=await buildVariant('reuse-off',s=>s.replace('INDEXED_DISPLAY=true','INDEXED_DISPLAY=false'));
const {chromium}=createRequire(import.meta.url)(process.env.AVALON_PLAYWRIGHT||'playwright');
const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'};
const servers=[];const serve=async assets=>{const server=http.createServer((q,r)=>{const f=path.resolve(assets,new URL(q.url,'http://x').pathname.slice(1)||'index.html');if(!f.startsWith(assets+path.sep)||!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');r.setHeader('Cache-Control','no-store');fs.createReadStream(f).pipe(r);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));servers.push(server);return 'http://127.0.0.1:'+server.address().port;};
const V={on:await serve(path.join(ROOT,'app/assets')),off:await serve(path.join(off,'app/assets'))};
async function stable(page){
 await page.evaluate(()=>{window.__probe=null;window.__same=0;});
 await page.waitForFunction(()=>{const p=window.__cad.touch.pointScreen([10,-5,5]),q=window.__probe;window.__same=q&&Math.abs(p[0]-q[0])<1e-6&&Math.abs(p[1]-q[1])<1e-6?window.__same+1:0;window.__probe=p;return window.__same>=3;},null,{polling:100,timeout:60000});
 let last=await page.screenshot(),same=0;for(let i=0;i<60&&same<2;i++){await page.waitForTimeout(250);const next=await page.screenshot();same=next.equals(last)?same+1:0;last=next;}return last;}
async function capture(origin,desktop,moves,wire){
 const ctx=await browser.newContext(desktop?{viewport:{width:1440,height:900},deviceScaleFactor:1,serviceWorkers:'block'}:{viewport:{width:412,height:915},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
 await ctx.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
 try{const page=await ctx.newPage();page.setDefaultTimeout(180000);
  await page.addInitScript(()=>{const set=window.setTimeout.bind(window),clear=window.clearTimeout.bind(window),held=[];
   window.setTimeout=function(fn,ms,...a){if(typeof fn!=='function'||!(ms>=1000))return set(fn,ms,...a);const id=set(()=>held.push({id,run:()=>fn(...a)}),ms);return id;};
   window.clearTimeout=id=>{const i=held.findIndex(h=>h.id===id);if(i>=0)held.splice(i,1);clear(id);};});
  await page.goto(origin+'/index.html');await page.addStyleTag({content:'#busy{visibility:hidden!important}#toast{display:none!important}'});
  await page.waitForFunction(()=>window.__cad?.model?.engine?.local===true&&window.__cad?.touch?.pointScreen,null,{timeout:90000});
  const step=x=>page.evaluate(async x=>{const p={format:'tristancad',version:2,name:'Fillet move',objects:[{id:'fillet',name:'fillet',type:'cylinder',params:{diameter:30,h:15},position:[x,0,7.5],rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1',fillets:[{edges:[0,2],radius:2}],resolution:{mode:'tolerance',tolerance:.005}}],layers:[{id:'layer-1',name:'Layer 1'}],activeLayer:'layer-1',buildPlaneEnabled:true};
   const before=window.__cad.model;window.__cad.load(p);await new Promise(r=>{const c=()=>window.__cad.model!==before&&window.__cad.model?.parts?.length===1?r():setTimeout(c,5);c();});},x);
  for(const x of moves)await step(x);
  // Fit the camera, then reload the same project (an exact cache hit: the same display) so the selection markers,
  // sized from the camera when drawn, are drawn for the fitted camera in every session.
  await page.evaluate(w=>{if(w)document.getElementById('wire').click();document.getElementById('fit').click();},wire);await stable(page);await step(moves[moves.length-1]);
  return await stable(page);}finally{await ctx.close();}}
const bad=[];let cases=0;
if(process.env.AVALON_REUSE_CONTROL){for(const desktop of [false,true]){const r=[];for(const v of ['on','on','off','off'])r.push(await capture(V[v],desktop,[5],false));
  console.log(desktop?'desktop':'phone','control on/on',diffPixels(r[0],r[1]).differing,'off/off',diffPixels(r[2],r[3]).differing,'on/off',diffPixels(r[0],r[2]).differing);}
 for(const s of servers)s.close();await browser.close();removeVariant(off);process.exit(0);}
try{for(const desktop of [false,true])for(const wire of [false,true]){const name=(desktop?'desktop':'phone')+(wire?' wireframe':'');
  const moved=await capture(V.on,desktop,[0,1,2,3,4,5],wire),fresh=await capture(V.on,desktop,[5],wire),legacy=await capture(V.off,desktop,[5],wire),legacyMoved=await capture(V.off,desktop,[0,1,2,3,4,5],wire);
  for(const [what,a,b] of [['moved vs fresh (on)',moved,fresh],['moved (on) vs off',moved,legacy],['fresh (on) vs off',fresh,legacy],['moved vs fresh (off, control)',legacyMoved,legacy]]){cases++;const d=diffPixels(a,b);if(d.differing){bad.push(name+' '+what+': '+d.differing+' px');if(process.env.AVALON_FRAMES_DUMP){fs.writeFileSync(path.join(process.env.AVALON_FRAMES_DUMP,name.replace(/ /g,'_')+'-'+what.replace(/\W+/g,'_')+'-a.png'),a);fs.writeFileSync(path.join(process.env.AVALON_FRAMES_DUMP,name.replace(/ /g,'_')+'-'+what.replace(/\W+/g,'_')+'-b.png'),b);}}}}}
finally{for(const s of servers)s.close();await browser.close();removeVariant(off);}
assert.deepEqual(bad,[],'display reuse frames differ: '+bad.join('; '));
console.log('Display move frames:',cases,'comparisons identical (moved filleted part vs loaded in place, INDEXED_DISPLAY on and off; 0 px)');
