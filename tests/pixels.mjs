// Perf ADR v2 WS0 / §4.1: 0-pixel-diff gate on the reference scenes (phone 412×915@2x touch + desktop 1440×900).
//   npm run test:pixels                         compare against tests/perf/baseline/ (exit 1 on any differing pixel or DOM/style change)
//   node tests/pixels.mjs --update regenerate the baseline from the current build (BASELINE_COMMIT/BASELINE_PROVISIONAL tag it)
// Baselines are artifacts (ADR §5.5), never committed: they live in AVALON_PIXEL_BASELINE
// (default /workspace/avalon-cad-artifacts/perf-baseline).
//   node tests/pixels.mjs [--out DIR] [scene-name-substring ...]
//   node tests/pixels.mjs --allow-box SELECTOR [...]   ADR-0001 F6 ruling 5 check (compare only, never with --update):
//        differing pixels are allowed only inside SELECTOR's box (e.g. '[data-mode=round]'), measured in the page at
//        capture time; any differing pixel outside it fails. Approved boxes cover pixels only: every DOM/style
//        difference against the baseline FAILS in this mode too (ADR-0001 ruling, blank-scene-flake follow-up).
//   --allow-overlay SELECTOR (with --allow-box): also allows SELECTOR's box, only in captures where that element is
//        present (e.g. '#edgeToolMenu', the Edge ▾ dropdown, only while it is open).
//   Approved DOM entries (ADR-0001 approved-dom-areas): the "dom" list of tests/perf/approved-areas.json approves exact
//        DOM changes (see tests/perf/approved-dom.mjs); every capture prints its matched/unmatched DOM-change counts and
//        lists unmatched changes; any unmatched change fails. With no entries the result is the same as before.
//        Box changes and added elements are accepted only as tests/perf/approved-dom.mjs describes (matched element, or
//        inside an approved pixel area); style changes and removed elements always fail. AVALON_PIXEL_SPLIT_REF: see below.
// Env: AVALON_PLAYWRIGHT (playwright module path), AVALON_CHROMIUM (browser executable), AVALON_ASSETS (served build),
//      PIXEL_JOBS (parallel browser contexts in the one shared browser, default 4), AVALON_PIXEL_BASELINE (baseline dir).
// Same setup as tools/readme-shots/harness.mjs (served app, open(), tap()); one shared browser, PIXEL_JOBS contexts; toasts and #busy are hidden as capture.mjs does.
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {createRequire} from 'node:module';
import {diffPixels,diffOutside,decodePNG,diffIn,regionDiff} from './perf/png.mjs';import {domSnapshot,compareDom,REPO,ASSETS,BASE} from './perf/dom-baseline.mjs';import {loadDomEntries,approvedStrings,checkCapture,fmtChange} from './perf/approved-dom.mjs';import {execSync} from 'node:child_process';

const require=createRequire(import.meta.url);const {chromium}=require(process.env.AVALON_PLAYWRIGHT||'playwright');
// open()/tap() mirror tools/readme-shots/harness.mjs exactly (inlined since before harness.mjs honoured
// AVALON_PLAYWRIGHT; kept so the pixel gate does not change).
const H={
 async open(env,{desktop=false}={}){
  const ctx=await env.browser.newContext(desktop?{viewport:{width:1440,height:900},deviceScaleFactor:1,serviceWorkers:'block'}:{viewport:{width:412,height:915},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
  await ctx.route('**/*',r=>r.request().url().startsWith(env.origin+'/')?r.continue():r.abort());
  // Under heavy load a screenshot or navigation can take >30 s; give every Playwright step 3 min instead of failing.
  const page=await ctx.newPage();page.setDefaultTimeout(180000);page.on('pageerror',e=>console.error('pageerror',e.message));
  // Deterministic UI timers: the app's long UI timers (live-measure hide 1.6 s, toasts 7 s, render linger 1 s) fire on
  // wall-clock time, so under load a capture could land before or after them. While __pixelHold is set, callbacks of
  // timers of ≥1 s are deferred until __pixelRelease(); the app's code and output are unchanged, only when they fire.
  await page.addInitScript(()=>{const set=window.setTimeout.bind(window),held=[];window.__pixelHold=true;
   const clear=window.clearTimeout.bind(window);
   window.setTimeout=function(fn,ms,...a){if(typeof fn!=='function'||!(ms>=1000))return set(fn,ms,...a);const id=set(()=>{if(window.__pixelHold)held.push({id,run:()=>fn(...a)});else fn(...a);},ms);return id;};
   window.clearTimeout=id=>{const i=held.findIndex(h=>h.id===id);if(i>=0)held.splice(i,1);clear(id);};
   window.__pixelRelease=()=>{window.__pixelHold=false;while(held.length)held.shift().run();};window.__pixelRehold=()=>{window.__pixelHold=true;};});
  await page.addInitScript(()=>{window.Android={beginFile(name,mime){window.savedFile={name,mime,chunks:[]}},appendFile(x){window.savedFile.chunks.push(x)},finishFile(){window.savedFile.done=true}};});
  await page.goto(env.origin+'/index.html',{timeout:180000});
  await page.waitForFunction(()=>window.__cad?.model?.engine?.local===true,{},{timeout:90000});
  return page;},
 tap:(page,mode,points,times=1)=>page.evaluate(([mode,points,times])=>{const t=window.__cad.touch;if(mode)t.setMode(mode);const c=document.querySelector('#scene');for(const p of points){const at=t.pointScreen(p);for(let i=0;i<times;i++)for(const type of ['pointerdown','pointerup'])c.dispatchEvent(new PointerEvent(type,{clientX:at[0],clientY:at[1],pointerId:1,pointerType:'touch',bubbles:true}));}},[mode,points,times]),
};
// Approved diff areas (committed, tests/perf/approved-areas.json): when the baseline in use is the one named there and no
// --allow-box is given, its button box / overlay / per-scene areas apply exactly as the flags would (compare-only; never
// with --update; AVALON_PIXEL_APPROVED=0 turns it off for a strict run). Per-scene areas are extra allowed boxes.
// They are for in-flight, unmerged changes only and approve PIXELS only: DOM/style differences always fail. Any other
// baseline (e.g. AVALON_PIXEL_BASELINE=.../perf-baseline-release-3.0-6892eb7) is compared strictly, with no areas.
// export-3mf: box may be null when only per-scene areas are approved (scene-scoped; every other scene stays strict).
const args=process.argv.slice(2),update=args.includes('--update'),outI=args.indexOf('--out'),boxI=args.indexOf('--allow-box'),ovI=args.indexOf('--allow-overlay');
const APPROVED=(()=>{const f=path.join(path.dirname(new URL(import.meta.url).pathname),'perf/approved-areas.json');if(update||boxI>=0||process.env.AVALON_PIXEL_APPROVED==='0'||!fs.existsSync(f))return null;
 const a=JSON.parse(fs.readFileSync(f,'utf8'));return path.basename(BASE)===a.baseline?a:null;})();
const ALLOW_BOX=boxI>=0?args[boxI+1]:APPROVED?.box??null,ALLOW_OVERLAY=ovI>=0?args[ovI+1]:APPROVED?.overlay??null,SCENE_AREAS=APPROVED?.scenes||{};
if(APPROVED)console.log(`approved areas (${APPROVED.baseline}): ${APPROVED.box||"no box"}${APPROVED.dom?.length?` + ${APPROVED.dom.length} dom entr${APPROVED.dom.length===1?"y":"ies"}`:""}${APPROVED.overlay?' + overlay '+APPROVED.overlay:''}; scenes: ${Object.keys(SCENE_AREAS).join(', ')||'none'}`);
if(ALLOW_BOX&&update)throw Error('--allow-box is a compare-only check; it never writes baselines');
// ADR-0001 approved-dom-areas: the "dom" entries of the same approved-areas.json (same baseline rule, same
// AVALON_PIXEL_APPROVED=0 switch) approve exact DOM changes; see tests/perf/approved-dom.mjs. Validated here, at load:
// an invalid selector/kind or an expected value missing from the strings tables stops the run before any capture.
const DOM_ENTRIES=loadDomEntries(APPROVED?.dom,approvedStrings(BASE));
// AVALON_PIXEL_SPLIT_REF=<dir>: captures (pixels.mjs --out) of the baseline's own build taken with the split snapshot. A
// baseline captured before the style/box split has none; the reference's split is used for a capture only when its html
// and combined styles equal the baseline's exactly (same state), so box changes can be told from style changes.
const SPLIT_REF=process.env.AVALON_PIXEL_SPLIT_REF?path.resolve(process.env.AVALON_PIXEL_SPLIT_REF):null;
if(APPROVED)console.log(`approved DOM entries (${APPROVED.baseline}): ${DOM_ENTRIES.length}`);
// Compares a capture's DOM with its baseline snapshot. Every DOM change is listed as matched (by an approved DOM
// entry) or unmatched; any unmatched change fails with the same messages as before (compareDom), and with no entries
// the pass/fail result is exactly the old one. Computed-style/box changes are never matched.
// Hidden entries (ADR-0001 hidden ruling): the region of a non-rendered container is its box (same path) in the BASELINE
// snapshot of the entry's regionFrom capture (its own split data, or the split reference's when that is the same state);
// the capture must show 0 differing px there against its baseline png. Either missing fails loudly.
function regionOf(rf,container){const f=path.join(DOM,rf+'.json');if(!fs.existsSync(f))return {error:`no DOM baseline for ${rf}`};
 const j=JSON.parse(fs.readFileSync(f,'utf8'));let split=j.split;
 if(!split&&SPLIT_REF){const sr=path.join(SPLIT_REF,rf+'.json');if(fs.existsSync(sr)){const x=JSON.parse(fs.readFileSync(sr,'utf8'));if(x.split&&x.html===j.html&&JSON.stringify(x.styles)===JSON.stringify(j.styles))split=x.split;}}
 if(!split)return {error:`the baseline snapshot of ${rf} has no style/box split data (set AVALON_PIXEL_SPLIT_REF)`};
 const b=split.box?.[container];if(!b)return {error:`no element ${container} in ${rf}`};if(!(b[2]>0&&b[3]>0))return {error:`${container} is not rendered in ${rf} either (${JSON.stringify(b)})`};
 return {rect:b};}
async function checkDom(page,name,id,bd,dom,r,px={}){if(!fs.existsSync(bd)){r.errors.push('no DOM baseline');return;}
 // ruling (a) on 4f9392c: region px inside another approved area of THIS capture (box, overlay, scene areas, as measured
 // for its pixel check) are covered; every other differing region px fails the hidden match.
 const pxIn=rect=>{if(!px.bp||!fs.existsSync(px.bp)||!px.png)return {error:'no baseline png'};const d=regionDiff({base:fs.readFileSync(px.bp),now:px.png,dpr:px.dpr||1,capture:id,areas:(px.areas||[]).map(box=>({capture:id,box}))},rect);return d==null?{error:'image size mismatch'}:d;};
 const sr=SPLIT_REF&&path.join(SPLIT_REF,id+'.json'),splitRef=sr&&fs.existsSync(sr)?JSON.parse(fs.readFileSync(sr,'utf8')):null;
 const areas=[ALLOW_BOX,ALLOW_OVERLAY,...(SCENE_AREAS[name]||[])].filter(Boolean);
 const c=await checkCapture(page,{name,id,base:JSON.parse(fs.readFileSync(bd,'utf8')),now:dom,entries:DOM_ENTRIES,areas,splitRef,compareDom,regionOf,pxIn});
 r.dom={matched:c.matched.length,unmatched:c.unmatched.length};r.errors.push(...c.errors);
 if(c.matched.length||c.unmatched.length){r.domMatched=c.matched;r.domUnmatched=c.unmatched.map(fmtChange);
  console.log(`  ${id} DOM changes: ${c.matched.length} matched, ${c.unmatched.length} unmatched${c.unmatched.length?':\n    '+r.domUnmatched.slice(0,20).join('\n    ')+(c.unmatched.length>20?`\n    …${c.unmatched.length-20} more (report.json)`:''):''}`);}}
const OUT=outI>=0?path.resolve(args[outI+1]):path.join(process.env.TMPDIR||'/tmp','avalon-pixel-run');const only=args.filter((a,i)=>!a.startsWith('--')&&i!==outI+1&&i!==boxI+1&&i!==ovI+1);
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
// QA flake fix: under load, labels (#dims/#liveMeasure text and positions), late font swaps and the last damping
// frames could still be in flight after settle(). Capture only once the scene is provably still: fonts loaded, no
// worker job running, camera stable, and then two consecutive captures (screenshot + DOM snapshot) taken ≥250 ms and
// several frames apart are identical. A frame that is still changing is retried, never compared; the app is untouched.
async function frames(page,n){await page.evaluate(n=>new Promise(r=>{const f=k=>k?requestAnimationFrame(()=>f(k-1)):r();f(n);}),n);}
// blank@desktop flake (ADR-0001 blank-scene-flake): Chromium can leave a root-layer tile holding a raster from an earlier
// paint-invalidation state. That raster differs from a fresh full raster of the same page by 1 LSB at one gradient pixel
// ((1162,241) in #viewport's radial-gradient, blue 50 instead of 51). Nothing invalidates it later, so two identical
// captures do not prove the frame is the page's settled raster. The WebGL canvas is transparent there in every frame.
// Before EVERY screenshot of the still-shot loop (the only capture path: every scene, step and viewport goes through
// stillShot, including its retries), the root layer is fully re-rasterized: the base background colour is overridden
// over CDP and then cleared, so each capture comes from a full raster of the final state. DOM and app are untouched,
// and no pixel is allowed.
async function fullRaster(page){const c=await page.context().newCDPSession(page);
 try{await c.send('Emulation.setDefaultBackgroundColorOverride',{color:{r:255,g:0,b:255,a:1}});await frames(page,2);
  await c.send('Emulation.setDefaultBackgroundColorOverride',{});await frames(page,2);}finally{await c.detach().catch(()=>{});}}
async function stillShot(page){
 await page.evaluate(()=>document.fonts.ready.then(()=>{}));await settle(page);
 let prev=null,prevDom=null;
 for(let i=0;i<40;i++){await frames(page,3);await page.waitForTimeout(250);await idle(page);await fullRaster(page);
  const png=await page.screenshot({animations:'disabled',caret:'hide'}),dom=JSON.stringify(await domSnapshot(page));
  if(prev&&png.equals(prev)&&dom===prevDom&&await page.evaluate(()=>document.fonts.status==='loaded'))return {png,dom:JSON.parse(dom),tries:i+1};
  prev=png;prevDom=dom;}
 throw Error('scene never settled (40 captures)');}
// Accepted exceptions (Sean's ruling, 2026-10-16, WS5 fast preview merge ENGINE_CACHE_MERGE='concat'): the merged
// preview mesh of disjoint solids is geometrically equal but in another triangle order, which moves 1-3 edge pixels
// in these two scenes. Allowed only while that merge is on; the DOM must still be identical; every other scene is 0 px.
const ACCEPTED_NOTE="Sean's ruling: WS5 fast preview merge, geometrically equal";
const {ENGINE_CACHE,ENGINE_CACHE_MERGE}=await import('../web/perf-flags.mjs');
const ACCEPTED_DIFFS=ENGINE_CACHE&&ENGINE_CACHE_MERGE==='concat'?{'distinct-30@phone':1,'distinct-100@phone':3}:{};
const ob=(id,type,params,position,extra={})=>({id,name:extra.name||id,type,params,position,rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1',...extra});
const proj=(name,objects,extra={})=>({format:'tristancad',version:2,name,objects,layers:[{id:'layer-1',name:'Layer 1'}],activeLayer:'layer-1',...extra});
const D={box:{w:30,d:30,h:15},cylinder:{diameter:20,h:20},sphere:{diameter:25},tube:{diameter:25,inner:18,h:20},cone:{diameter:25,top:8,h:25}};
const distinct=n=>{const types=['box','cylinder','sphere','tube','cone'],o=[];for(let i=0;i<n;i++){const t=types[i%5],q={...D[t]};q.h=(q.h||10)+i*.1;if(t==='sphere')q.diameter+=i*.1;o.push(ob('o'+i,t,q,[(i%10)*35,Math.floor(i/10)*35,0],{name:t+i}));}return proj(`${n} distinct`,o,{buildPlaneEnabled:true});};
const filletBox=q=>proj('Filleted box '+q,[ob('fb','cylinder',{diameter:30,h:15},[0,0,7.5],{fillets:[{edges:[0,2],radius:2}],resolution:{mode:'tolerance',tolerance:q}})]);
// An empty project (parts 0) has no model change to wait for, so record that this load's preview started and
// then wait for its settled 'Ready · millimeters' (empty-project-preview stage); otherwise the capture can land before
// the preview runs (blank@* status flake).
async function load(page,p,parts){if(parts===0)await page.evaluate(()=>{window.__previewSeen=false;const b=document.querySelector('#busy');const o=new MutationObserver(()=>{if(b.textContent.trim()==='Building solid…'){window.__previewSeen=true;o.disconnect();}});o.observe(b,{subtree:true,childList:true,characterData:true});});
 await page.evaluate(p=>window.__cad.load(p),typeof p==='string'?JSON.parse(p):p);
 if(parts===0){await page.waitForFunction(()=>window.__previewSeen&&document.querySelector('#busy').textContent.trim()==='Ready · millimeters',{},{timeout:180000});await idle(page);}
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
 'prefab-x3':async(p,s)=>{await prefabPlate(p);const n0=await p.evaluate(()=>window.__cad.project.objects.length);for(let i=0;i<3;i++){if(i){await p.locator('#addBtn').click();await p.locator('#prefabsBtn').click();}await p.waitForFunction(()=>document.querySelectorAll('[data-prefab-insert]').length===1);
   await p.locator('[data-prefab-insert]').first().click();await p.locator('#pos0').fill(String(80*(i+1)));await p.locator('#pos1').fill('0');await p.locator('#applyObject').click();
   await p.waitForFunction(n=>document.querySelector('#sheet').hidden&&window.__cad.project.objects.length>=n,n0+i+1,{timeout:120000});await idle(p);}
  await deselect(p);await fit(p);await s();},
 'fixture-two-layer':async(p,s)=>{await load(p,fixture('two-layer.tcad'));await s();},
 'fixture-prefab-subtract':async(p,s)=>{await load(p,fixture('prefab-subtract.tcad'));await s();},
 'fixture-simple-subtract':async(p,s)=>{await load(p,fixture('simple-subtract.tcad'));await s();},
 'fixture-subtract-in-add':async(p,s)=>{await load(p,fixture('subtract-in-add.tcad'));await s();},
 'imported-stl':async(p,s)=>{await load(p,proj('My model',[]),0);await p.locator('#importFile').setInputFiles({name:'tetra.stl',mimeType:'model/stl',buffer:stl()});await p.locator('#applyObject').click();
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
 // ADR new-primitives-polyhedra-text §5.12: the new sheets, the Text draft and a scene with every new shape.
 'sheet-advanced-shapes':async(p,s)=>{await loadTemplate(p,'plate');await p.locator('#addBtn').click();await p.locator('#advancedBtn').click();await s();},
 'sheet-letters':async(p,s)=>{await loadTemplate(p,'plate');await p.locator('#addBtn').click();await p.locator('#lettersBtn').click();await p.waitForFunction(()=>document.querySelectorAll('[data-glyph] svg').length===94,null,{timeout:120000});await s();},
 'edit-glyph':async(p,s)=>{await loadTemplate(p,'plate');await p.locator('#addBtn').click();await p.locator('#lettersBtn').click();await p.waitForFunction(()=>document.querySelectorAll('[data-glyph] svg').length===94,null,{timeout:120000});
  await p.locator('[data-glyph][aria-label="Letter g"]').click();await p.waitForFunction(()=>document.querySelector('#objectName')?.value==='Letter g');await s();},
 'new-shapes-scene':async(p,s)=>{const F='roboto-bold@1',NS=[['torus',{diameter:30,tube:8},4],['triprism',{w:30,d:40,h:26},13],['tetrahedron',{size:30},12.245],['octahedron',{size:25},10.205],['decahedron',{diameter:20,h:36},8.08],['dodecahedron',{size:11},12.25],['icosahedron',{size:16},12.09],['glyph',{char:'A',size:20,depth:5,font:F},2.5],['glyph',{char:'g',size:20,depth:5,font:F},2.5],['glyph',{char:'&',size:20,depth:5,font:F},2.5]];
  await load(p,proj('New shapes',NS.map(([t,q,z],i)=>ob('n'+i,t,q,[(i%5)*40,Math.floor(i/5)*-45,z],{name:t+i})),{buildPlaneEnabled:true}),NS.length);await s('solid');
  await p.locator('#wire').click();await s('wireframe');await p.locator('#wire').click();
  await deselect(p);await settle(p);await H.tap(p,'select',[[124,-4,13]]);await p.waitForFunction(()=>window.__cad.selected==='n3',null,{timeout:20000});await settle(p);await s('selection');},
 // §5.1 interactions: orbit by a fixed delta (then damping settles), move an object 5 mm through __cad.touch, undo, redo.
 'interactions':async(p,s)=>{await loadTemplate(p,'tray');
  await p.evaluate(()=>{const c=document.querySelector('#scene'),r=c.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;const ev=(t,dx)=>c.dispatchEvent(new PointerEvent(t,{clientX:x+dx,clientY:y,pointerId:7,pointerType:'mouse',button:0,buttons:t==='pointerup'?0:1,isPrimary:true,bubbles:true}));ev('pointerdown',0);for(let i=1;i<=8;i++)ev('pointermove',i*10);ev('pointerup',80);});
  await s('orbit');
  await H.tap(p,'select',[[0,0,28]]);await settle(p);
  const res=await p.evaluate(()=>{const t=window.__cad.touch;t.setMode('move');document.querySelector('[data-axis="X"]').click();const o=window.__cad.project.objects.find(o=>o.id===window.__cad.selected)||window.__cad.project.objects[0];
   const a=t.pointScreen(o.position),b=t.pointScreen([o.position[0]+5,o.position[1],o.position[2]]),c=document.querySelector('#scene');const ev=(type,at)=>c.dispatchEvent(new PointerEvent(type,{clientX:at[0],clientY:at[1],pointerId:1,pointerType:'touch',bubbles:true}));
   ev('pointerdown',a);for(let i=1;i<=10;i++)ev('pointermove',[a[0]+(b[0]-a[0])*i/10,a[1]+(b[1]-a[1])*i/10]);ev('pointerup',b);return o.id;});
  await p.waitForFunction(()=>!window.__cad.touch.isCommitting());await idle(p);await s('move-5mm');
  // The move's live measure hides on its own 1.6 s timer: shown in the move-5mm baseline, hidden in undo. Long timers
  // are held (see open()), so release them and wait for the hide before the undo capture.
  await p.locator('#undo').click();await idle(p);await p.evaluate(()=>window.__pixelRelease());await p.waitForFunction(()=>document.querySelector('#liveMeasure')?.hidden!==false,null,{timeout:5000});await p.evaluate(()=>window.__pixelRehold());await s('undo');
  await p.locator('#redo').click();await idle(p);await s('redo');},
};
// ADR unified-desktop-layout (Architect ruling 5): AVALON_PIXEL_MASK_BASE=<pre-change baseline> additionally checks
// every capture against that baseline with only the help line approved to change: every pixel outside the help line's
// box (+1 px antialiasing margin) must be identical, and the DOM/styles must be identical once the #desktopHelp element
// is removed. Phone captures have no visible help line, so they must be 0 px everywhere.
const MASK_BASE=process.env.AVALON_PIXEL_MASK_BASE?path.resolve(process.env.AVALON_PIXEL_MASK_BASE):null;
const stripHelp=dom=>({html:dom.html.replace(/<div id="desktopHelp"[^>]*>[^<]*<\/div>/,''),styles:Object.fromEntries(Object.entries(dom.styles).filter(([k])=>!k.includes('#desktopHelp')))});
function outsideBox(basePng,png,box,dpr){const A=decodePNG(basePng),B=decodePNG(png);if(A.width!==B.width||A.height!==B.height)return A.width*A.height;
 const [x0,y0,x1,y1]=box?[Math.floor((box.left-1)*dpr),Math.floor((box.top-1)*dpr),Math.ceil((box.right+1)*dpr),Math.ceil((box.bottom+1)*dpr)]:[0,0,0,0];let n=0;
 for(let y=0;y<A.height;y++)for(let x=0;x<A.width;x++){if(x>=x0&&x<x1&&y>=y0&&y<y1)continue;const i=(y*A.width+x)*4;if(A.data.readUInt32BE(i)!==B.data.readUInt32BE(i))n++;}return n;}
const viewports=[['phone',false],['desktop',true]];
const tasks=[];for(const [name] of Object.entries(scenes))for(const [vp] of viewports){const id=`${name}@${vp}`;if(!only.length||only.some(o=>id.includes(o)))tasks.push([name,vp]);}
fs.mkdirSync(OUT,{recursive:true});const PX=path.join(BASE,'pixels'),DOM=path.join(BASE,'dom');if(update){fs.mkdirSync(PX,{recursive:true});fs.mkdirSync(DOM,{recursive:true});}
const env=await start();const results=[];const t0=Date.now();
async function run([name,vp]){const desktop=vp==='desktop';let page;const caps=[];const ts=Date.now();
 try{page=await H.open(env,{desktop});await clean(page);const to=Date.now()-ts;if(process.env.PIXEL_TRACE)console.log(`  open ${name}@${vp} ${to}ms`);
  const tr=(l,t)=>process.env.PIXEL_TRACE&&console.log(`    ${name}@${vp} ${l} ${Date.now()-t}ms`);
  await scenes[name](page,async(step)=>{let t=Date.now();const id=`${name}${step?'.'+step:''}@${vp}`,{png,dom,tries}=await stillShot(page);tr('still shot ('+tries+' captures)',t);
   const dir=update?null:OUT;if(update){fs.writeFileSync(path.join(PX,id+'.png'),png);fs.writeFileSync(path.join(DOM,id+'.json'),JSON.stringify(dom));}else{fs.writeFileSync(path.join(dir,id+'.png'),png);fs.writeFileSync(path.join(dir,id+'.json'),JSON.stringify(dom));}
   // AVALON_PIXEL_RECTS=1 (with --out): also write <id>.rects.json, the boxes of the areas a re-baseline may change, for
   // the approved-area check (ADR-0001 W0 re-baseline). Capture only; nothing is compared here.
   if(process.env.AVALON_PIXEL_RECTS&&!update)fs.writeFileSync(path.join(OUT,id+'.rects.json'),JSON.stringify(await page.evaluate(()=>{const box=e=>{if(!e)return null;const r=e.getBoundingClientRect(),c=getComputedStyle(e);return r.width&&r.height&&c.visibility!=='hidden'&&c.display!=='none'?[r.left,r.top,r.right,r.bottom]:null;};
    const help5=[...document.querySelectorAll('#sheet:not([hidden]) .helpitem')].find(e=>/^5\. Export for printing/.test(e.textContent));
    return {dpr:devicePixelRatio,modebar:box(document.getElementById('touchModes')),dock:box(document.querySelector('.dock')),toolbar:box(document.querySelector('.toolbar')),help5:box(help5),pill:box(document.getElementById('desktopHelp')),formatField:box(document.getElementById('exportFormat')?.closest('.field'))};})));
   caps.push(id);if(!update){const bp=path.join(PX,id+'.png'),bd=path.join(DOM,id+'.json');const r={id,errors:[]};
    if((ALLOW_BOX||SCENE_AREAS[name]?.length)&&fs.existsSync(bp)){// An overlay's box includes its box-shadow, which is part of the overlay as drawn: offset ± (1.5·blur + spread)
     // (Skia draws a CSS blur radius b as a Gaussian with σ = b/2, out to 3σ).
     const boxOf=(sel,shadow=false)=>page.evaluate(([sel,shadow])=>{const e=sel&&document.querySelector(sel);if(!e)return null;const q=e.getBoundingClientRect(),k=devicePixelRatio;let [l,t,r,b]=[q.left,q.top,q.right,q.bottom];
      if(shadow)for(const m of getComputedStyle(e).boxShadow.matchAll(/(-?[\d.]+)px (-?[\d.]+)px ([\d.]+)px(?: (-?[\d.]+)px)?/g)){const [x,y,blur,spread=0]=m.slice(1).map(Number),ext=1.5*blur+spread;l=Math.min(l,q.left+x-ext);t=Math.min(t,q.top+y-ext);r=Math.max(r,q.right+x+ext);b=Math.max(b,q.bottom+y+ext);}
      return [Math.floor(l*k),Math.floor(t*k),Math.ceil(r*k),Math.ceil(b*k)];},[sel,shadow]);
     const box=await boxOf(ALLOW_BOX),overlay=await boxOf(ALLOW_OVERLAY,true),areaSel=SCENE_AREAS[name]||[],areas=[];
     for(const sel of areaSel){const a=await boxOf(sel);if(a)areas.push(a);else r.errors.push(`no element ${sel} (approved area of ${name})`);}
     const zones=[...(box?[box]:[]),...(overlay?[overlay]:[]),...areas],d=zones.length?diffOutside(fs.readFileSync(bp),png,zones):{differing:diffPixels(fs.readFileSync(bp),png).differing,outside:-1};r.differing=d.differing;
     if(ALLOW_BOX&&!box)r.errors.push(`no element ${ALLOW_BOX}`);else if(d.outside)r.errors.push(`${d.outside} differing pixels outside ${ALLOW_BOX||'approved areas'} box ${box}${overlay?' or overlay '+overlay:''} (outside diffs span ${d.outsideBox})${d.sizeMismatch?' (size mismatch)':''}`);
     // Approved areas are pixel boxes only: no DOM allowance inside them (ADR-0001 ruling); every DOM/style difference fails.
     await checkDom(page,name,id,bd,dom,r,{bp,png,dpr:desktop?1:2,areas:[box,overlay,...areas].filter(Boolean)});results.push(r);}
    else{if(!fs.existsSync(bp))r.errors.push('no baseline');else{const d=diffPixels(fs.readFileSync(bp),png);r.differing=d.differing;if(d.differing&&!d.sizeMismatch&&d.differing<=(ACCEPTED_DIFFS[id]||0)){r.accepted=d.differing;console.log(`accepted ${id}: ${d.differing} px (${ACCEPTED_NOTE})`);}else if(d.differing)r.errors.push(`${d.differing} differing pixels${d.sizeMismatch?' (size mismatch)':''}`);}
    await checkDom(page,name,id,bd,dom,r,{bp,png,dpr:desktop?1:2});
    if(MASK_BASE){const help=await page.evaluate(()=>{const e=document.getElementById('desktopHelp');if(!e||getComputedStyle(e).display==='none'||getComputedStyle(e).visibility==='hidden')return null;const b=e.getBoundingClientRect();return {left:b.left,top:b.top,right:b.right,bottom:b.bottom};});
     const mp=path.join(MASK_BASE,'pixels',id+'.png'),md=path.join(MASK_BASE,'dom',id+'.json');if(!fs.existsSync(mp))r.errors.push('no mask baseline');else{r.helpBox=help;r.outsideHelp=outsideBox(fs.readFileSync(mp),png,help,desktop?1:2);if(r.outsideHelp)r.errors.push(`${r.outsideHelp} px differ outside the help line vs ${path.basename(MASK_BASE)}`);if(!desktop&&help)r.errors.push('help line visible on phone');}
     if(fs.existsSync(md))r.errors.push(...compareDom(stripHelp(JSON.parse(fs.readFileSync(md,'utf8'))),stripHelp(dom)).map(e=>'vs '+path.basename(MASK_BASE)+' without #desktopHelp: '+e));}
    results.push(r);}}
   console.log(update?'baseline '+id:`checked ${id}: ${results.at(-1).differing??'n/a'} differing px${MASK_BASE?` (outside help line vs mask base: ${results.at(-1).outsideHelp??'n/a'})`:''}${results.at(-1).errors.length?' FAIL: '+results.at(-1).errors.join('; '):''}`);});
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
const accs=results.filter(r=>r.accepted&&!r.errors.length),acc=accs.length,total=results.reduce((n,r)=>n+(r.differing||0),0);
const dm=results.reduce((n,r)=>n+(r.dom?.matched||0),0),du=results.reduce((n,r)=>n+(r.dom?.unmatched||0),0);
console.log(`DOM changes: ${dm} matched by approved DOM entries, ${du} unmatched, in ${results.filter(r=>r.dom?.unmatched).length} capture(s) with unmatched changes`);
console.log(`test:pixels: ${results.length-bad.length-acc}/${results.length} captures at 0 px, ${acc} accepted exception(s)${acc?' ('+accs.map(r=>r.id+' '+r.accepted+' px').join(', ')+')':''}, ${bad.length} failed; ${total} differing px in total; DOM/styles ${results.some(r=>r.errors.some(e=>/^(outerHTML differs|computed style|…\d+ elements|vs )/.test(e)))?'DIFFER':'equal'} in ${secs}s`);process.exit(bad.length?1:0);
