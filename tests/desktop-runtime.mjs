import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{_electron:electron}=require(process.env.AVALON_PLAYWRIGHT||'playwright');
const {chromium}=require(process.env.AVALON_PLAYWRIGHT||'playwright'),http=await import('node:http');
const {exportPayload,readModel,writeModel}=require('../desktop/files.cjs');
const testRoot=await fs.mkdtemp('/tmp/avalon-desktop-browser-'),root=path.join(testRoot,'files');await fs.mkdir(root,{recursive:true});
const assetRoot=path.resolve('build/desktop-stage/web'),server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://local'),file=path.resolve(assetRoot,url.pathname.slice(1)||'index.html');if(!file.startsWith(assetRoot+path.sep)){res.writeHead(403);res.end();return;}const data=await fs.readFile(file),mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.py':'text/plain','.wasm':'application/wasm'}[path.extname(file)]||'application/octet-stream';res.setHeader('Content-Type',mime);res.end(data);}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--single-process','--in-process-gpu','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:1280,height:860}});await context.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():route.abort());const page=await context.newPage();
await page.exposeFunction('__saveDesktop',async(data,name)=>{const payload=exportPayload({name,bytes:new Uint8Array(data)});await writeModel(path.join(root,name),payload.bytes);return {canceled:false,name};});
await page.exposeFunction('__openDesktop',async()=>{const file=await readModel(path.join(root,'phone.tcad'));return {canceled:false,name:file.name,bytes:Array.from(file.bytes)};});
await page.addInitScript(()=>{window.desktopActions=[];window.AvalonDesktop={platform:'mac',saveFile:(bytes,name)=>window.__saveDesktop(Array.from(bytes),name),openFile:async()=>{const r=await window.__openDesktop();return {...r,bytes:new Uint8Array(r.bytes)};},onAction:fn=>window.desktopActions.push(fn),onFile:()=>{},onNotice:()=>{}};});
const action=name=>page.evaluate(name=>window.desktopActions.forEach(fn=>fn(name)),name);

try {
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(origin+'/index.html');
 await page.waitForFunction(()=>window.__cad?.model?.engine?.local,{},{timeout:60000});
 assert.equal(page.url(),origin+'/index.html');assert.equal(await page.evaluate(()=>window.AvalonDesktop.platform),'mac');
 assert.deepEqual(await page.evaluate(()=>window.__cad.model.engine),{python:'3.13.2',rust:4,local:true});
 assert.equal(await page.evaluate(()=>typeof window.require),'undefined');assert.equal(await page.evaluate(()=>typeof window.process),'undefined');
 // Unified desktop layout: the staged desktop web runs the shared layout (plain <body>, the one shared style.css, no desktop-only stylesheet).
 assert.equal(await page.locator('body').getAttribute('class'),null);
 assert.deepEqual(await page.evaluate(()=>[...document.styleSheets].map(s=>s.href&&new URL(s.href).pathname)),['/style.css']);
 assert.equal(await page.evaluate(()=>[...document.querySelectorAll('link[rel=stylesheet],style')].some(e=>/desktop/i.test(e.getAttribute('href')||e.id||e.textContent.slice(0,200)))),false);
 assert.notEqual(await page.evaluate(async()=>(await fetch('/desktop.css').then(r=>r.status,()=>'blocked'))),200);
 await page.locator('#addBtn').click();await page.locator('[data-shape="box"]').click();for(const axis of [0,1,2])assert.equal(await page.locator('#pos'+axis).inputValue(),'0');await page.locator('#p_w').fill('40');await page.locator('#p_d').fill('30');await page.locator('#p_h').fill('10');await page.locator('#applyObject').click();await page.waitForFunction(()=>window.__cad.model.volume===12000);
 assert.equal(await page.locator('#buildPlane').isChecked(),true);await page.waitForFunction(()=>document.querySelector('#sheet').hidden);
 await action('backup');
 for(let i=0;i<100;i++){if(await fs.stat(path.join(root,'My_model.tcad')).catch(()=>false))break;await new Promise(r=>setTimeout(r,50));}
 const backup=JSON.parse(await fs.readFile(path.join(root,'My_model.tcad'),'utf8'));assert.equal(backup.objects.length,1);assert.equal(backup.buildPlaneEnabled,true);assert.equal(backup.objects[0].positionReference,'base');
 await page.locator('#exportBtn').click();await page.locator('#ground').uncheck();await page.locator('#downloadSTL').click();
 for(let i=0;i<100;i++){if(await fs.stat(path.join(root,'My_model.stl')).catch(()=>false))break;await new Promise(r=>setTimeout(r,50));}
 const stl=await fs.readFile(path.join(root,'My_model.stl'));assert.equal(stl.readUInt32LE(80),12);assert.equal(stl.length,684);for(let i=84;i<stl.length;i+=50)for(let j=0;j<3;j++)assert.ok(stl.readFloatLE(i+20+j*12)>=0);await page.locator('#closeSheet').click();
 await page.screenshot({path:'build/desktop-window.png'});
 await action('save');await page.waitForFunction(()=>Object.keys(JSON.parse(localStorage.getItem('tristancad.projects')||'{}')).length===1);
 // Command+Z from a text field must leave model history alone.
 await page.locator('#editBtn').click();await page.locator('#objectName').fill('Edited title');const unchanged=await page.evaluate(()=>JSON.stringify(window.__cad.project));await action('undo');assert.equal(await page.evaluate(()=>JSON.stringify(window.__cad.project)),unchanged);await page.keyboard.press('Escape');
 await page.locator('#addBtn').click();await page.locator('[data-shape="threadrod"]').click();assert.equal(await page.locator('#threadUnits').inputValue(),'imperial');assert.equal(await page.locator('#threadPitch').inputValue(),'20');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>window.__cad.project.objects.length),1);
 // Shift-drag over a selected shape pans instead of editing it.
 await page.evaluate(()=>window.__cad.touch.setMode('move'));await page.locator('[data-axis="X"]').click();const xy=await page.evaluate(()=>window.__cad.touch.pointScreen([0,0,5]));const beforeMove=await page.evaluate(()=>JSON.stringify(window.__cad.project.objects[0]));await page.keyboard.down('Shift');await page.mouse.move(xy[0],xy[1]);await page.mouse.down();await page.mouse.move(xy[0]+40,xy[1]+20,{steps:5});await page.mouse.up();await page.keyboard.up('Shift');assert.equal(await page.evaluate(()=>JSON.stringify(window.__cad.project.objects[0])),beforeMove);assert.equal(await page.evaluate(()=>window.__cad.touch.isDragging()),false);
 await page.locator('#deselectBtn').click();
 // Click slop: a Shift/Ctrl-click that jitters 3 px selects and leaves the camera alone; a real drag past the slop still pans.
 const settle=()=>page.waitForFunction(()=>{const p=JSON.stringify(window.__cad.touch.pointScreen([0,0,5]).map(v=>Math.round(v*10)));const same=window.__slopProbe===p;window.__slopProbe=p;return same;},null,{polling:150});
 const jitterClick=async(key,dx)=>{await settle();const at=await page.evaluate(()=>window.__cad.touch.pointScreen([0,0,5]));await page.keyboard.down(key);await page.mouse.move(at[0],at[1]);await page.mouse.down();await page.mouse.move(at[0]+dx,at[1]+dx/2,{steps:3});await page.mouse.up();await page.keyboard.up(key);await settle();return page.evaluate(()=>window.__cad.touch.pointScreen([0,0,5]));};
 // Selecting resizes the view slightly (action bar), so compare against an unmodified, motionless click from the same start.
 const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 const reset=()=>page.evaluate(()=>{window.__cad.touch.deselect();window.__cad.touch.setMode('select');});await reset();const baseline=await jitterClick('Alt',0);
 for(const key of ['Shift','Control']){await reset();assert.ok(dist(await jitterClick(key,3),baseline)<0.5,key+'-click jitter must not pan');assert.equal(await page.evaluate(()=>window.__cad.selected),await page.evaluate(()=>window.__cad.project.objects[0].id),key+'-click jitter selects');}
 await reset();const before=await page.evaluate(()=>window.__cad.touch.pointScreen([0,0,5]));assert.ok(dist(await jitterClick('Shift',30),before)>2,'Shift-drag past the slop pans');assert.equal(await page.evaluate(()=>window.__cad.selected),null,'a pan is not a click');
 // Ctrl/Shift-click toggles multi-selection membership identically in Move and Stretch (the only shape is selected, so it toggles off).
 for(const m of ['move','stretch'])for(const key of ['Control','Shift']){await page.evaluate(()=>{const t=window.__cad.touch;t.deselect();t.setMode('select');});await jitterClick(key,0);assert.ok(await page.evaluate(()=>window.__cad.selected!==null),'selected before '+m);await page.evaluate(m=>window.__cad.touch.setMode(m),m);await jitterClick(key,0);assert.deepEqual(await page.evaluate(()=>[window.__cad.selected,window.__cad.touch.getState().mode,window.__cad.touch.getState().multi.length]),[null,'select',0],key+'-click toggles in '+m);}
 await page.locator('#deselectBtn').click();
 const denied=await page.evaluate(async()=>{try{await fetch('https://example.com');return false;}catch{return true;}});assert.equal(denied,true);
 // .tcad transport from the phone goes through the real context bridge and IPC.
 const phone={...backup,name:'Imported phone model'};await fs.writeFile(path.join(root,'phone.tcad'),JSON.stringify(phone));await action('open');await page.locator('#replaceCurrent').click();await page.waitForFunction(()=>window.__cad.project.name==='Imported phone model'&&window.__cad.model.volume===12000);
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('tristancad.autosave')||'{}').name==='Imported phone model');await page.reload();await page.waitForFunction(()=>window.__cad?.project?.name==='Imported phone model'&&window.__cad.model?.volume===12000,{},{timeout:60000});
 assert.deepEqual(errors,[]);console.log('PASS: desktop Chromium UI with a test file bridge, bundled Python/Rust, mouse/keyboard controls, origin/floor/Imperial defaults, native file-handler save/open transport and model-only STL, project persistence and rejected Internet fetch. Desktop shell handlers tested separately; physical Mac execution remains untested.');
} finally {await browser.close();await new Promise(r=>server.close(r));}
