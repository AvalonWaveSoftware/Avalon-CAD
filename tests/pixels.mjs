// Perf ADR v2 WS0 / §4.1: 0-pixel-diff gate on the reference scenes (phone 412×915@2x touch + desktop 1440×900).
//   npm run test:pixels                         compare against tests/perf/baseline/ (exit 1 on any differing pixel or DOM/style change)
//   node tests/pixels.mjs --update regenerate the baseline from the current build (BASELINE_COMMIT/BASELINE_PROVISIONAL tag it)
// Baselines are artifacts (ADR §5.5), never committed: they live in AVALON_PIXEL_BASELINE
// (default /workspace/avalon-cad-artifacts/perf-baseline).
//   node tests/pixels.mjs [--out DIR] [scene-name-substring ...]
// Env: AVALON_PLAYWRIGHT (playwright module path), AVALON_CHROMIUM (browser executable), AVALON_ASSETS (served build),
//      PIXEL_JOBS (parallel browser contexts in the one shared browser, default 4), AVALON_PIXEL_BASELINE (baseline dir).
// Same setup as tools/readme-shots/harness.mjs (served app, open(), tap()); one shared browser, PIXEL_JOBS contexts; toasts and #busy are hidden as capture.mjs does.
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {createRequire} from 'node:module';
import {diffPixels} from './perf/png.mjs';import {domSnapshot,compareDom,REPO,ASSETS,BASE} from './perf/dom-baseline.mjs';import {execSync} from 'node:child_process';

const require=createRequire(import.meta.url);const {chromium}=require(process.env.AVALON_PLAYWRIGHT||'playwright');
// open()/tap() mirror tools/readme-shots/harness.mjs exactly; they are inlined because harness.mjs imports the bare
// 'playwright' specifier at load time, which ignores AVALON_PLAYWRIGHT.
const H={
 async open(env,{desktop=false}={}){
  const ctx=await env.browser.newContext(desktop?{viewport:{width:1440,height:900},deviceScaleFactor:1,serviceWorkers:'block'}:{viewport:{width:412,height:915},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
  await ctx.route('**/*',r=>r.request().url().startsWith(env.origin+'/')?r.continue():r.abort());
  const page=await ctx.newPage();page.on('pageerror',e=>console.error('pageerror',e.message));
  await page.addInitScript(()=>{window.Android={beginFile(name,mime){window.savedFile={name,mime,chunks:[]}},appendFile(x){window.savedFile.chunks.push(x)},finishFile(){window.savedFile.done=true}};});
  await page.goto(env.origin+'/index.html');
  await page.waitForFunction(()=>window.__cad?.model?.engine?.local===true,{},{timeout:90000});
  return page;},
 tap:(page,mode,points,times=1)=>page.evaluate(([mode,points,times])=>{const t=window.__cad.touch;if(mode)t.setMode(mode);const c=document.querySelector('#scene');for(const p of points){const at=t.pointScreen(p);for(let i=0;i<times;i++)for(const type of ['pointerdown','pointerup'])c.dispatchEvent(new PointerEvent(type,{clientX:at[0],clientY:at[1],pointerId:1,pointerType:'touch',bubbles:true}));}},[mode,points,times]),
};
const args=process.argv.slice(2),update=args.includes('--update'),outI=args.indexOf('--out');
const OUT=outI>=0?path.resolve(args[outI+1]):path.join(process.env.TMPDIR||'/tmp','avalon-pixel-run');const only=args.filter((a,i)=>!a.startsWith('--')&&i!==outI+1);
const JOBS=Number(process.env.PIXEL_JOBS||4);
// Same server as the harness (harness.start() launches its own bundled browser; we need AVALON_CHROMIUM, so we start our own).
async function start(){const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';const file=path.resolve(ASSETS,name);
  if(!file.startsWith(ASSETS+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',{'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.py':'text/plain','.wasm':'application/wasm'}[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');fs.createReadStream(file).pipe(res);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 return {origin:'http://127.0.0.1:'+server.address().port,browser,async close(){await browser.close();server.close();}};}
const clean=page=>page.addStyleTag({content:'#busy{visibility:hidden!important}#toast{display:none!important}'});
// harness.idle() waits for #busy to be empty, but the app always shows a status there (e.g. "Ready · millimeters"),
// so it ran into its 60 s timeout on every call. This waits for the actual work states to end instead.
const WORKING=['Loading solid engine…','Building solid…'];
async function idle(page){await page.waitForFunction(w=>{const b=document.querySelector('#busy');return !b||!w.includes(b.textContent.trim());},WORKING,{polling:50,timeout:120000});
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
// Wait for the worker, the busy status, and OrbitControls damping to settle (projected probe point stable for 3 polls).
async function settle(page){await idle(page);await page.waitForFunction(()=>!window.__cad.touch.isCommitting()&&!window.__cad.touch.isDragging());
 await page.evaluate(()=>{window.__probe=null;window.__same=0;});
 // OrbitControls damping decays geometrically and keeps moving the camera by ~1e-12 px for ~10 s; waiting for exact
// float equality cost 10–13 s per capture. Motion below 1e-6 px for 3 polls cannot move a rasterized pixel; the gate itself
// stays at 0 differing pixels (a capture taken too early would fail, not pass).
 await page.waitForFunction(()=>{const p=window.__cad.touch.pointScreen([10,-5,5]),q=window.__probe;window.__same=q&&Math.abs(p[0]-q[0])<1e-6&&Math.abs(p[1]-q[1])<1e-6?window.__same+1:0;window.__probe=p;return window.__same>=3;},null,{polling:100,timeout:60000});}
const ob=(id,type,params,position,extra={})=>({id,name:extra.name||id,type,params,position,rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1',...extra});
const proj=(name,objects,extra={})=>({format:'tristancad',version:2,name,objects,layers:[{id:'layer-1',name:'Layer 1'}],activeLayer:'layer-1',...extra});
const D={box:{w:30,d:30,h:15},cylinder:{diameter:20,h:20},sphere:{diameter:25},tube:{diameter:25,inner:18,h:20},cone:{diameter:25,top:8,h:25}};
const distinct=n=>{const types=['box','cylinder','sphere','tube','cone'],o=[];for(let i=0;i<n;i++){const t=types[i%5],q={...D[t]};q.h=(q.h||10)+i*.1;if(t==='sphere')q.diameter+=i*.1;o.push(ob('o'+i,t,q,[(i%10)*35,Math.floor(i/10)*35,0],{name:t+i}));}return proj(`${n} distinct`,o,{buildPlaneEnabled:true});};
const filletBox=q=>proj('Filleted box '+q,[ob('fb','box',{w:30,d:30,h:15},[0,0,7.5],{fillets:[{edges:[0,1,2,3],radius:2}],resolution:{mode:'tolerance',tolerance:q}})]);
async function load(page,p,parts){await page.evaluate(p=>window.__cad.load(p),typeof p==='string'?JSON.parse(p):p);
 await page.waitForFunction(n=>window.__cad.model&&(n===0||window.__cad.model.parts?.length>=n),parts??1,{timeout:180000});await deselect(page);await fit(page);}
const loadTemplate=async(page,t)=>{await page.evaluate(t=>window.__cad.load(window.__cad.templates[t]()),t);await page.waitForFunction(()=>window.__cad.model?.volume>0);await deselect(page);await fit(page);};
const fit=async page=>{await page.locator('#fit').click();await settle(page);};
const deselect=page=>page.evaluate(()=>{window.__cad.touch.setMode('select');window.__cad.touch.deselect();});
const fixture=f=>fs.readFileSync(path.join(REPO,'tests/fixtures',f),'utf8');
function stl(){const tris=[[[0,0,0],[0,20,0],[20,0,0]],[[0,0,0],[20,0,0],[0,0,20]],[[0,0,0],[0,0,20],[0,20,0]],[[20,0,0],[0,20,0],[0,0,20]]];const b=Buffer.alloc(84+50*tris.length);b.writeUInt32LE(tris.length,80);
 tris.forEach((t,i)=>{const o=84+i*50;t.flat().forEach((v,k)=>b.writeFloatLE(v,o+12+k*4));});return b;}
const prefabPlate=async page=>{await loadTemplate(page,'plate');await page.locator('#addBtn').click();await page.locator('#prefabsBtn').click();await page.locator('#createPrefab').click();
 await page.locator('#prefabName').fill('Plate prefab');await page.locator('#prefabSource').selectOption('project');await page.locator('#savePrefab').click();
 await page.waitForFunction(()=>document.querySelectorAll('[data-prefab-insert]').length===1);};
// Scene name -> async (page, shot). Every scene runs in both viewports.
const scenes={
 'blank':async(p,s)=>{await load(p,proj('My model',[]),0);await s();},
 'template-plate':async(p,s)=>{await loadTemplate(p,'plate');await s();},
 'template-tray':async(p,s)=>{await loadTemplate(p,'tray');await s();},
 'distinct-30':async(p,s)=>{await load(p,distinct(30),30);await s();},
 'distinct-100':async(p,s)=>{await load(p,distinct(100),100);await s();},
 'fillet-box-ultra':async(p,s)=>{await load(p,filletBox(.01));await s();},
 'fillet-box-maximum':async(p,s)=>{await load(p,filletBox(.005));await s();},
 'thread-rod-tube':async(p,s)=>{await load(p,proj('Threads',[ob('rod','threadrod',{diameter:6.35,pitch:1.27,h:38.1,clearance:0,phase:0,units:'imperial',hand:'right'},[-12,0,19.05]),ob('tube','threadtube',{diameter:6.35,pitch:1.27,h:25.4,outer:12.7,clearance:.1524,phase:0,units:'imperial',hand:'right'},[12,0,12.7])]),2);await s();},
 'prefab-x3':async(p,s)=>{await prefabPlate(p);for(let i=0;i<3;i++){await p.locator('[data-prefab-insert]').first().click();await p.waitForFunction(n=>window.__cad.project.objects.length>=n,5+i+1,{timeout:120000});await idle(p);
   if(i<2){await p.locator('#addBtn').click();await p.locator('#prefabsBtn').click();await p.waitForFunction(()=>document.querySelectorAll('[data-prefab-insert]').length===1);}}
  await deselect(p);await fit(p);await s();},
 'fixture-two-layer':async(p,s)=>{await load(p,fixture('two-layer.tcad'));await s();},
 'fixture-prefab-subtract':async(p,s)=>{await load(p,fixture('prefab-subtract.tcad'));await s();},
 'fixture-simple-subtract':async(p,s)=>{await load(p,fixture('simple-subtract.tcad'));await s();},
 'fixture-subtract-in-add':async(p,s)=>{await load(p,fixture('subtract-in-add.tcad'));await s();},
 'imported-stl':async(p,s)=>{await load(p,proj('My model',[]),0);await p.locator('#importFile').setInputFiles({name:'tetra.stl',mimeType:'model/stl',buffer:stl()});
  await p.waitForFunction(()=>window.__cad.model?.parts?.length===1,{},{timeout:120000});await deselect(p);await fit(p);await s();},
 'wireframe-on':async(p,s)=>{await loadTemplate(p,'plate');await p.locator('#wire').click();await s();},
 'selection-highlight':async(p,s)=>{await loadTemplate(p,'plate');await H.tap(p,'select',[[0,0,6]]);await s();},
 'objects-panel':async(p,s)=>{await loadTemplate(p,'plate');await p.locator('#objectsToggle').click();await s();},
 'merge-dialog':async(p,s)=>{await load(p,proj('Bracket',[ob('base','rounded',{w:60,d:30,h:8,r:4},[0,0,4],{name:'Base'}),ob('upright','rounded',{w:60,d:8,h:40,r:3},[0,11,20],{name:'Upright'}),ob('rib','wedge',{w:6,d:22,h:32},[0,-4,24],{name:'Rib'})]),3);
  await p.evaluate(()=>window.__cad.touch.mergeMenu(['base','upright','rib']));await s();},
 // §5.1 item 14: the sheets/menus captured by tools/readme-shots/capture.mjs.
 'sheet-roundover-edges':async(p,s)=>{await loadTemplate(p,'plate');await H.tap(p,'round',[[0,-20,6]],3);await s();},
 'sheet-radius-menu':async(p,s)=>{await loadTemplate(p,'plate');await H.tap(p,'round',[[0,-20,6]],3);await p.evaluate(()=>window.__cad.touch.radiusMenu());await s();},
 'sheet-layers':async(p,s)=>{await loadTemplate(p,'plate');await p.locator('#layersBtn').click();await s();},
 'sheet-prefabs':async(p,s)=>{await prefabPlate(p);await s();},
 'sheet-export':async(p,s)=>{await loadTemplate(p,'plate');await p.locator('#exportBtn').click();await p.locator('#quality').selectOption('maximum');await s();},
 'sheet-add-shape':async(p,s)=>{await loadTemplate(p,'plate');await p.locator('#addBtn').click();await s();},
 'sheet-edit-object':async(p,s)=>{await loadTemplate(p,'plate');await H.tap(p,'select',[[0,0,6]],2);await p.locator('#quickEdit').click();await s();},
 'build-plane-on':async(p,s)=>{await loadTemplate(p,'plate');if(!(await p.locator('#buildPlane').isChecked()))await p.locator('#buildPlane').check();await s();},
 // §5.1 interactions: orbit by a fixed delta (then damping settles), move an object 5 mm through __cad.touch, undo, redo.
 'interactions':async(p,s)=>{await loadTemplate(p,'tray');
  await p.evaluate(()=>{const c=document.querySelector('#scene'),r=c.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;const ev=(t,dx)=>c.dispatchEvent(new PointerEvent(t,{clientX:x+dx,clientY:y,pointerId:7,pointerType:'mouse',button:0,buttons:t==='pointerup'?0:1,isPrimary:true,bubbles:true}));ev('pointerdown',0);for(let i=1;i<=8;i++)ev('pointermove',i*10);ev('pointerup',80);});
  await s('orbit');
  await H.tap(p,'select',[[0,0,28]]);await settle(p);
  const res=await p.evaluate(()=>{const t=window.__cad.touch;t.setMode('move');document.querySelector('[data-axis="X"]').click();const o=window.__cad.project.objects.find(o=>o.id===window.__cad.selected)||window.__cad.project.objects[0];
   const a=t.pointScreen(o.position),b=t.pointScreen([o.position[0]+5,o.position[1],o.position[2]]),c=document.querySelector('#scene');const ev=(type,at)=>c.dispatchEvent(new PointerEvent(type,{clientX:at[0],clientY:at[1],pointerId:1,pointerType:'touch',bubbles:true}));
   ev('pointerdown',a);for(let i=1;i<=10;i++)ev('pointermove',[a[0]+(b[0]-a[0])*i/10,a[1]+(b[1]-a[1])*i/10]);ev('pointerup',b);return o.id;});
  await p.waitForFunction(()=>!window.__cad.touch.isCommitting());await idle(p);await s('move-5mm');
  await p.locator('#undo').click();await idle(p);await s('undo');
  await p.locator('#redo').click();await idle(p);await s('redo');},
};
const viewports=[['phone',false],['desktop',true]];
const tasks=[];for(const [name] of Object.entries(scenes))for(const [vp] of viewports){const id=`${name}@${vp}`;if(!only.length||only.some(o=>id.includes(o)))tasks.push([name,vp]);}
fs.mkdirSync(OUT,{recursive:true});const PX=path.join(BASE,'pixels'),DOM=path.join(BASE,'dom');if(update){fs.mkdirSync(PX,{recursive:true});fs.mkdirSync(DOM,{recursive:true});}
const env=await start();const results=[];const t0=Date.now();
async function run([name,vp]){const desktop=vp==='desktop';let page;const caps=[];const ts=Date.now();
 try{page=await H.open(env,{desktop});await clean(page);const to=Date.now()-ts;if(process.env.PIXEL_TRACE)console.log(`  open ${name}@${vp} ${to}ms`);
  const tr=(l,t)=>process.env.PIXEL_TRACE&&console.log(`    ${name}@${vp} ${l} ${Date.now()-t}ms`);
  await scenes[name](page,async(step)=>{let t=Date.now();await settle(page);tr('settle',t);t=Date.now();const id=`${name}${step?'.'+step:''}@${vp}`,png=await page.screenshot({animations:'disabled',caret:'hide'});tr('shot',t);t=Date.now();const dom=await domSnapshot(page);tr('dom',t);
   const dir=update?null:OUT;if(update){fs.writeFileSync(path.join(PX,id+'.png'),png);fs.writeFileSync(path.join(DOM,id+'.json'),JSON.stringify(dom));}else{fs.writeFileSync(path.join(dir,id+'.png'),png);fs.writeFileSync(path.join(dir,id+'.json'),JSON.stringify(dom));}
   caps.push(id);if(!update){const bp=path.join(PX,id+'.png'),bd=path.join(DOM,id+'.json');const r={id,errors:[]};
    if(!fs.existsSync(bp))r.errors.push('no baseline');else{const d=diffPixels(fs.readFileSync(bp),png);r.differing=d.differing;if(d.differing)r.errors.push(`${d.differing} differing pixels${d.sizeMismatch?' (size mismatch)':''}`);}
    if(fs.existsSync(bd))r.errors.push(...compareDom(JSON.parse(fs.readFileSync(bd,'utf8')),dom));else r.errors.push('no DOM baseline');results.push(r);}
   console.log((update?'baseline ':'checked ')+id);});
  if(!caps.length)throw Error('scene captured nothing');}
 catch(e){results.push({id:`${name}@${vp}`,errors:['scene failed: '+e.message.split('\n')[0]]});console.error('FAIL',name,vp,e.message.split('\n')[0]);}
 finally{if(process.env.PIXEL_TRACE)console.log(`  done ${name}@${vp} ${Date.now()-ts}ms`);await page?.context().close().catch(()=>{});}}
const queue=[...tasks];await Promise.all(Array.from({length:Math.min(JOBS,queue.length)},async()=>{while(queue.length)await run(queue.shift());}));
await env.close();
const secs=Math.round((Date.now()-t0)/1000);
if(update){const failed=results.filter(r=>r.errors.length);if(failed.length)console.error(JSON.stringify(failed,null,1));
 const ids=fs.readdirSync(PX).filter(f=>f.endsWith('.png')).map(f=>f.slice(0,-4)).sort();let head='';try{head=execSync('git rev-parse HEAD',{cwd:REPO}).toString().trim();}catch{}
 fs.writeFileSync(path.join(BASE,'manifest.json'),JSON.stringify({generatedFrom:process.env.BASELINE_COMMIT||head,provisional:process.env.BASELINE_PROVISIONAL!=='0',chromium:env.browser.version?.()||'',generatedAt:new Date().toISOString(),failedScenes:failed.map(r=>r.id),captures:ids},null,1)+'\n');
 console.log(`baseline: ${ids.length} captures in ${secs}s${failed.length?`, ${failed.length} scene(s) FAILED`:''}`);process.exit(failed.length?1:0);}
if(!only.length){const m=JSON.parse(fs.readFileSync(path.join(BASE,'manifest.json'),'utf8'));const seen=new Set(results.map(r=>r.id));for(const id of m.captures)if(!seen.has(id))results.push({id,errors:['baseline capture not produced']});}
const bad=results.filter(r=>r.errors.length);fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify({secs,results},null,1));
for(const r of bad)console.error('FAIL',r.id,'—',r.errors.join(' | '));
console.log(`test:pixels: ${results.length-bad.length}/${results.length} captures identical (0 differing pixels, DOM/styles equal) in ${secs}s`);process.exit(bad.length?1:0);
