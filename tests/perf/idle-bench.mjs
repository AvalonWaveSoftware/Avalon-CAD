// WS4 (ADR v2) bench: idle cost and missed-invalidate check in headless Chromium (SwiftShader), RENDER_ON_DEMAND off
// vs on. Run from the repo root: AVALON_PLAYWRIGHT=... AVALON_CHROMIUM=... node tests/perf/idle-bench.mjs [--check]
//  - idle: rAF callbacks, draw calls and main-thread task time (CDP TaskDuration) over 5 s, blank and 100 objects;
//  - frames: the first frame drawn after a Move-mode marker change (setMode) and after a long-press (multi-select
//    highlight): the first rendered frame that differs from before already shows every overlay, never a partial set;
//  - stale: after each scripted step (select, move mode, orbit drag, wheel, wireframe, build plane, edit, undo, view)
//    and 1.5 s of settling, the scene as last rendered (signature taken in scene.onBeforeRender) equals the scene now.
// The off build is a temporary copy (tests/perf/.ws4-off) bundled with RENDER_ON_DEMAND=false. One browser at a time.
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {createRequire} from 'node:module';import {build} from 'esbuild';
const R=process.cwd(),require=createRequire(import.meta.url),{chromium}=require(process.env.AVALON_PLAYWRIGHT||'playwright'),OFF=path.join(R,'tests/perf/.ws4-off');
async function offAssets(){fs.rmSync(OFF,{recursive:true,force:true});fs.cpSync(path.join(R,'web'),path.join(OFF,'web'),{recursive:true});fs.cpSync(path.join(R,'app/assets'),path.join(OFF,'assets'),{recursive:true});
 const f=path.join(OFF,'web/perf-flags.mjs');fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace('RENDER_ON_DEMAND=true','RENDER_ON_DEMAND=false'));
 await build({entryPoints:[path.join(OFF,'web/main.mjs')],outfile:path.join(OFF,'assets/main.js'),bundle:true,format:'esm',platform:'browser',target:'chrome100',minify:true,nodePaths:[path.join(R,'node_modules')],external:['node:*','module','fs','path','crypto']});return path.join(OFF,'assets');}
const TYPES={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.wasm':'application/wasm','.json':'application/json'};
async function measure(root,checkStale){
 const server=http.createServer((q,s)=>{const name=new URL(q.url,'http://x').pathname.slice(1)||'index.html',file=path.resolve(root,name);if(!file.startsWith(root)||!fs.existsSync(file)){s.writeHead(404);s.end();return;}s.writeHead(200,{'content-type':TYPES[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(s);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.addInitScript(()=>{window.__n={raf:0,draws:0};const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>raf(t=>{window.__n.raf++;cb(t);});
   const P=WebGL2RenderingContext.prototype;for(const f of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced']){const o=P[f];P[f]=function(...a){window.__n.draws++;return o.apply(this,a);};}});
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);await page.waitForFunction(()=>window.__cad?.model,null,{timeout:120000});
  const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');const taskSec=async()=>(await cdp.send('Performance.getMetrics')).metrics.find(m=>m.name==='TaskDuration').value;
  // QA: the idle window is timed from the model's arrival, not from the load call. Wait until the last preview has
  // arrived (model object unchanged for 1 s), then 9 s from that arrival (the load toast hides on its own 7 s timer and
  // every DOM change lingers 1 s), and check the model did not change during the window.
  const arrival=()=>page.evaluate(()=>new Promise(r=>{let m=window.__cad.model,at=performance.now();const f=()=>{if(window.__cad.model!==m){m=window.__cad.model;at=performance.now();}if(performance.now()-at>=1000)r(at);else setTimeout(f,50);};f();}));
  const idle=async()=>{const at=await arrival();await page.evaluate(at=>new Promise(r=>setTimeout(r,Math.max(0,at+9000-performance.now()))),at);await page.evaluate(()=>{window.__idleModel=window.__cad.model;});
await page.evaluate(()=>{window.__n.raf=0;window.__n.draws=0;});const t0=await taskSec();await page.waitForTimeout(5000);const t1=await taskSec();const n=await page.evaluate(()=>({...window.__n}));if(!await page.evaluate(()=>window.__idleModel===window.__cad.model))throw Error('the model changed during the idle window');return {rafCallbacks:n.raf,draws:n.draws,mainTaskMs:Math.round((t1-t0)*1000)};};
  const out={};await page.evaluate(()=>window.__cad.load(window.__cad.templates.blank()));out.idleBlank=await idle();
  const load=n=>page.evaluate(n=>{const p=window.__cad.templates.blank();const types=['box','cylinder','sphere','tube','cone'],D={box:{w:30,d:30,h:15},cylinder:{diameter:20,h:20},sphere:{diameter:25},tube:{diameter:25,inner:18,h:20},cone:{diameter:25,top:8,h:25}};
   for(let i=0;i<n;i++){const t=types[i%5],q={...D[t]};q.h=(q.h||10)+i*.1;if(t==='sphere')q.diameter+=i*.1;p.objects.push({id:'o'+i,name:t+i,type:t,params:q,position:[(i%10)*35,Math.floor(i/10)*35,0],rotation:[0,0,0],mode:'solid',enabled:true,layerId:p.activeLayer});}window.__cad.load(p);},n);
  await load(100);await page.waitForFunction(()=>window.__cad.model?.parts?.length===100,null,{timeout:120000});out.idle100=await idle();
  // first frame showing Move-mode markers after setMode, and after a long press on an object
  await load(10);await page.waitForFunction(()=>window.__cad.model?.parts?.length===10,null,{timeout:120000});await page.waitForTimeout(1500);
  const firstFrame=trigger=>page.evaluate(async trigger=>{const scene=window.__cad.scene,count=()=>{let n=0;scene.traverse(o=>{if(o.renderOrder>0&&o.visible)n++;});return n;},seen=[];const prev=scene.onBeforeRender;scene.onBeforeRender=()=>seen.push(count());
   window.__cad.touch.setMode('select');await new Promise(r=>setTimeout(r,300));const before=count();seen.length=0;
   if(trigger==='mode')window.__cad.touch.setMode('move');else await window.__longPress();
   const markersNow=count();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));scene.onBeforeRender=prev;const after=seen.filter(n=>n!==before);return {markersBefore:before,markersNow,firstFrameMarkers:after[0]??null};},trigger);
  await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  await page.exposeFunction('__touchAt',async(x,y)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await new Promise(r=>setTimeout(r,700));await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});});
  await page.evaluate(()=>{window.__longPress=async()=>{const o=window.__cad.project.objects[2],at=window.__cad.touch.pointScreen(o.position),r=document.querySelector('#scene').getBoundingClientRect();await window.__touchAt(at[0]+0*r.x,at[1]+0*r.y);};});
  out.markerModeFrame=await firstFrame('mode');out.markerLongPressFrame=await firstFrame('longpress');
  if(checkStale){
   await page.evaluate(()=>{const scene=window.__cad.scene;window.__sig=()=>{const parts=[];scene.traverse(o=>{parts.push(o.uuid,o.visible?1:0,o.geometry?o.geometry.uuid+Object.values(o.geometry.attributes).map(a=>a.version).join('.'):'',o.material?.uuid||'',Array.from(o.matrixWorld.elements).map(x=>x.toFixed(9)).join(','));});return parts.join('|');};
    window.__rendered=null;scene.onBeforeRender=(r,s,cam)=>{window.__cam=cam;scene.updateMatrixWorld();cam.updateMatrixWorld();window.__rendered=window.__sig();};
    const sig=window.__sig;window.__sig=()=>sig()+'#'+(window.__cam?Array.from(window.__cam.matrixWorld.elements).map(x=>x.toFixed(9)).join(','):'');});
   // the hook is installed on a settled scene; one wheel step makes sure a frame (and the camera) is captured first
   await page.mouse.move(720,450);await page.mouse.wheel(0,40);await page.waitForTimeout(1500);
   const steps={select:()=>page.evaluate(()=>window.__cad.touch.setMode('select')),move:()=>page.evaluate(()=>window.__cad.touch.setMode('move')),
    orbit:()=>page.evaluate(()=>{const c=document.querySelector('#scene'),r=c.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;const ev=(t,dx)=>c.dispatchEvent(new PointerEvent(t,{clientX:x+dx,clientY:y+dx/3,pointerId:7,pointerType:'mouse',button:0,buttons:t==='pointerup'?0:1,isPrimary:true,bubbles:true}));ev('pointerdown',0);for(let i=1;i<=8;i++)ev('pointermove',i*10);ev('pointerup',80);}),
    wheel:()=>page.mouse.move(720,450).then(()=>page.mouse.wheel(0,-240)),wire:()=>page.locator('#wire').click(),wireOff:()=>page.locator('#wire').click(),
    edit:()=>page.evaluate(()=>{const p=structuredClone(window.__cad.project);p.objects[1].position[0]+=3;window.__cad.load(p);}),buildPlane:()=>page.locator('#buildPlane').click(),undo:()=>page.locator('#undo').click(),fit:()=>page.locator('#fit').click()};
   out.stale={};for(const [name,run] of Object.entries(steps)){await run();await page.waitForTimeout(1500);out.stale[name]=await page.evaluate(()=>{window.__cad.scene.updateMatrixWorld();window.__cam?.updateMatrixWorld();const a=window.__rendered,b=window.__sig();if(a===b)return true;const x=a.split('|'),y=b.split('|');const i=x.findIndex((v,k)=>v!==y[k]);return 'differs at '+i+': '+(x[i]||'').slice(0,80)+' vs '+(y[i]||'').slice(0,80)+' len '+x.length+'/'+y.length;});}}
  return out;}finally{await browser.close();server.close();}}
const result={};try{result.off=await measure(await offAssets(),false);result.on=await measure(path.join(R,'app/assets'),true);}finally{fs.rmSync(OFF,{recursive:true,force:true});}
const on=result.on,fail=[];for(const k of ['idleBlank','idle100'])if(on[k].rafCallbacks||on[k].draws)fail.push(k);
for(const k of ['markerModeFrame','markerLongPressFrame'])if(on[k].firstFrameMarkers!==result.off[k].firstFrameMarkers||on[k].firstFrameMarkers!==on[k].markersNow)fail.push(k);
for(const [k,v] of Object.entries(on.stale||{}))if(v!==true)fail.push('stale:'+k);
console.log(JSON.stringify({...result,fail,pass:!fail.length},null,1));if(process.argv.includes('--check')&&fail.length)process.exit(1);
