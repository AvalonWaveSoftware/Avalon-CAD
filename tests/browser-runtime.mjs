import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';

// Optional integration check: npm install --no-save playwright, then supply
// AVALON_CHROMIUM with a local browser executable. No runtime downloads occur.
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.AVALON_PLAYWRIGHT||'playwright');
const root=path.resolve('app/assets'),requests=[],blocked=[],errors=[];
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
 const file=path.resolve(root,name);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}
 const ext=path.extname(file),mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.py':'text/plain','.wasm':'application/wasm'}[ext]||'application/octet-stream';
 res.setHeader('Content-Type',mime);res.setHeader('Cache-Control','no-store');fs.createReadStream(file).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--single-process','--in-process-gpu','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:{width:412,height:915},deviceScaleFactor:1,hasTouch:true,isMobile:true,serviceWorkers:'block'});
 await context.route('**/*',route=>{
  const url=route.request().url();requests.push(url);
  if(url.startsWith(origin+'/'))return route.continue();
  blocked.push(url);return route.abort();
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.Android={beginFile(name,mime){window.savedFile={name,mime,chunks:[]}},appendFile(x){window.savedFile.chunks.push(x)},finishFile(){window.savedFile.done=true}};});
 await page.goto(origin+'/index.html');
 await page.waitForFunction(()=>window.__cad?.model?.engine?.local===true,{},{timeout:60000});
 assert.deepEqual(await page.evaluate(()=>window.__cad.model.engine),{python:'3.13.2',rust:7,local:true});
 for(const cancel of ['closeSheet','cancelObject','back']){
  await page.locator('#addBtn').click();assert.equal(await page.locator('#sheetTitle').textContent(),'Primitive Objects');await page.locator('[data-shape="sphere"]').click();await page.locator('#p_diameter').fill('37');assert.equal(await page.evaluate(()=>window.__cad.project.objects.length),0);
  if(cancel==='back')assert.equal(await page.evaluate(()=>window.handleBack()),true);else await page.locator('#'+cancel).click();assert.equal(await page.evaluate(()=>window.__cad.project.objects.length),0);assert.equal(await page.locator('#undo').isDisabled(),true);
 }
 await page.locator('#addBtn').click();await page.locator('[data-shape="box"]').click();
 await page.locator('#p_w').fill('40');await page.locator('#p_d').fill('30');await page.locator('#p_h').fill('10');await page.locator('#pos2').fill('0');await page.locator('#applyObject').click();
 await page.waitForFunction(()=>window.__cad.model?.volume===12000);
 if(await page.locator('#closeSheet').isVisible())await page.locator('#closeSheet').click();
 // Origin drafts and the floor switch through real WebGL and the bundled worker.
 assert.equal(await page.locator('#buildPlane').isChecked(),true);assert.deepEqual(await page.evaluate(()=>window.__cad.project.objects[0].placement),[0,0,0]);
 await page.locator('#addBtn').click();await page.locator('[data-shape="sphere"]').click();for(const axis of [0,1,2])assert.equal(await page.locator('#pos'+axis).inputValue(),'0');await page.locator('#cancelObject').click();
 await page.locator('#editBtn').click();await page.locator('#pos2').fill('-8');await page.locator('#applyObject').click();await page.waitForFunction(()=>document.querySelector('#sheet').hidden&&window.__cad.model.bounds.min[2]===0);
 await page.locator('#buildPlane').uncheck();await page.locator('#editBtn').click();await page.locator('#pos2').fill('-8');await page.locator('#applyObject').click();await page.waitForFunction(()=>document.querySelector('#sheet').hidden&&window.__cad.model.bounds.min[2]===-8);
 await page.locator('#buildPlane').check();await page.waitForFunction(()=>window.__cad.project.buildPlaneEnabled&&window.__cad.model.bounds.min[2]===0&&!document.querySelector('#buildPlane').disabled);
 await page.locator('#exportBtn').click();await page.locator('#ground').uncheck();await page.locator('#downloadSTL').click();await page.waitForFunction(()=>window.savedFile?.done);const planeFile=await page.evaluate(()=>window.savedFile),planeBytes=Buffer.concat(planeFile.chunks.map(s=>Buffer.from(s,'base64')));assert.equal(planeBytes.readUInt32LE(80),12);let planeMin=Infinity;for(let i=84;i<planeBytes.length;i+=50)for(let j=0;j<3;j++)planeMin=Math.min(planeMin,planeBytes.readFloatLE(i+20+j*12));assert.equal(planeMin,0);await page.locator('#closeSheet').click();await page.evaluate(()=>window.savedFile=null);
 await page.screenshot({path:'build/build-plane-mobile.png'});
 console.log('PASS: actual mobile origin drafts, bottom-center negative-Z clamping, unrestricted Off, assembly grounding On, and plane-free twelve-triangle STL without export grounding.');
 await page.waitForFunction(()=>!window.__cad.touch.isCommitting());await page.evaluate(()=>{const tool=window.__cad.touch;tool.setMode('select');const at=tool.pointScreen([0,0,10]),canvas=document.querySelector('#scene');for(const type of ['pointerdown','pointerup'])canvas.dispatchEvent(new PointerEvent(type,{clientX:at[0],clientY:at[1],pointerId:1,pointerType:'touch',bubbles:true}));});
 assert.equal(await page.evaluate(()=>window.__cad.touch.getState().selection),'face');
 await page.evaluate(()=>{const tool=window.__cad.touch;tool.setMode('round');const at=tool.pointScreen([0,-15,10]),canvas=document.querySelector('#scene');for(let i=0;i<3;i++)for(const type of ['pointerdown','pointerup'])canvas.dispatchEvent(new PointerEvent(type,{clientX:at[0],clientY:at[1],pointerId:1,pointerType:'touch',bubbles:true}));});
 assert.equal(await page.evaluate(()=>window.__cad.touch.getState().edges.length),12);
 await page.evaluate(()=>window.__cad.touch.radiusMenu());await page.locator('#exactRadius').fill('1');await page.locator('#applyRadius').click();
 await page.waitForFunction(()=>document.querySelector('#sheet').hidden&&window.__cad.project.objects[0].fillets?.[0]?.radius===1);
 await page.waitForFunction(()=>window.__cad.model.volume<12000&&window.__cad.model.volume>11000);
 const display=await page.evaluate(()=>({positions:window.__cad.display.geometry.index?.count??window.__cad.display.geometry.attributes.position.count,vertices:window.__cad.display.geometry.attributes.position.count,normals:window.__cad.display.geometry.attributes.normal.count,engine:window.__cad.model.engine}));
 assert.ok(display.positions>36);assert.equal(display.normals,display.vertices);
 await page.locator('#exportBtn').click();await page.locator('#quality').selectOption('maximum');await page.locator('#downloadSTL').click();
 await page.waitForFunction(()=>window.savedFile?.done,{},{timeout:60000});
 const file=await page.evaluate(()=>window.savedFile);const bytes=Buffer.concat(file.chunks.map(s=>Buffer.from(s,'base64')));
 assert.equal(file.mime,'model/stl');assert.equal(bytes.length,84+bytes.readUInt32LE(80)*50);assert.ok(bytes.readUInt32LE(80)>12);
 await page.locator('#closeSheet').click();
 await page.evaluate(()=>window.__cad.load(window.__cad.templates.blank()));await page.waitForFunction(()=>window.__cad.model.volume===0);
 await page.locator('#addBtn').click();await page.locator('[data-shape="threadrod"]').click();assert.equal(await page.evaluate(()=>window.__cad.project.objects.length),0);
 assert.equal(await page.locator('#threadUnits').inputValue(),'imperial');assert.equal(await page.locator('#threadPitch').inputValue(),'20');await page.locator('#threadPreset').selectOption('4');await page.locator('#threadLength').fill('2');await page.locator('#applyObject').click();
 await page.waitForFunction(()=>document.querySelector('#sheet').hidden&&window.__cad.project.objects[0].params.h===50.8);
 assert.equal(await page.evaluate(()=>window.__cad.project.objects[0].params.pitch),1.27);
 await page.waitForFunction(()=>window.__cad.model.parts[0]?.bounds.max[2]-window.__cad.model.parts[0]?.bounds.min[2]>50.79);
 const moving=await page.evaluate(()=>{const tool=window.__cad.touch;tool.setMode('move');document.querySelector('[data-axis="X"]').click();const o=window.__cad.project.objects[0],at=tool.pointScreen(o.position),canvas=document.querySelector('#scene');for(const [type,x] of [['pointerdown',at[0]],['pointermove',at[0]+32]])canvas.dispatchEvent(new PointerEvent(type,{clientX:x,clientY:at[1],pointerId:1,pointerType:'touch',bubbles:true}));let meshes=[];window.__cad.scene.traverse(x=>{if(x.isMesh&&x.visible)meshes.push(x)});return {at,count:meshes.length,transparent:meshes.some(x=>x.material.transparent),dragging:tool.isDragging()};});
 assert.equal(moving.dragging,true);assert.equal(moving.count,1);assert.equal(moving.transparent,false);
 await page.evaluate(at=>document.querySelector('#scene').dispatchEvent(new PointerEvent('pointerup',{clientX:at[0]+32,clientY:at[1],pointerId:1,pointerType:'touch',bubbles:true})),moving.at);await page.waitForFunction(()=>!window.__cad.touch.isCommitting());
 await page.locator('#deselectBtn').click();assert.equal(await page.evaluate(()=>window.__cad.touch.getState().wholeHighlighted),false);assert.equal(await page.locator('#selectionLabel').textContent(),'No object selected');
 await page.locator('#addBtn').click();await page.locator('[data-shape="threadtube"]').click();assert.equal(await page.evaluate(()=>window.__cad.project.objects.length),1);
 await page.locator('#threadUnits').selectOption('imperial');await page.locator('#threadDiameter').fill('1/4');await page.locator('#threadPitch').fill('20');await page.locator('#threadLength').fill('1');await page.locator('#threadOuter').fill('1/2');await page.locator('#pos0').fill('25');await page.locator('#applyObject').click();
 await page.waitForFunction(()=>document.querySelector('#sheet').hidden&&window.__cad.project.objects[1].params.h===25.4);
 await page.waitForFunction(()=>window.__cad.model.parts[1]?.topology.faceCount===4);
 await page.evaluate(()=>window.__cad.touch.selectFace(window.__cad.project.objects[1].id,3));await page.locator('#stretchSize').click();await page.locator('#exactSize').fill('1.5');await page.locator('#applySize').click();
 await page.waitForFunction(()=>document.querySelector('#sheet').hidden&&window.__cad.project.objects[1].params.h>38.09);assert.equal(await page.evaluate(()=>window.__cad.project.objects[1].params.pitch),1.27);
 await page.locator('#deselectBtn').click();const clean=await page.evaluate(()=>{let count=0;window.__cad.scene.traverse(x=>{if(x.isMesh&&x.visible)count++});return count;});assert.equal(clean,1);
 await page.locator('#exportBtn').click();await page.locator('#quality').selectOption('maximum');await page.evaluate(()=>window.savedFile=null);await page.locator('#downloadSTL').click();await page.waitForFunction(()=>window.savedFile?.done);const threads=await page.evaluate(()=>window.savedFile),stl=Buffer.concat(threads.chunks.map(x=>Buffer.from(x,'base64')));assert.equal(stl.length,84+stl.readUInt32LE(80)*50);assert.ok(stl.readUInt32LE(80)>2000);await page.locator('#closeSheet').click();
 console.log('PASS: actual browser thread parameter panels, imperial presets/fractions, fixed-pitch tube stretching, clean opaque movement, clear selections and high-quality threaded STL.');
 // Layer groups must protect overlapping reference material in the real UI/worker.
 await page.locator('#layersBtn').click();await page.locator('#newLayer').click();
 assert.equal(await page.locator('[data-layer]').count(),2);await page.locator('#layerName').fill('Details');await page.locator('#renameLayer').click();assert.equal(await page.locator('#layersBtn').textContent(),'Details ▾');await page.locator('#closeSheet').click();
 await page.locator('#addBtn').click();await page.locator('[data-shape="box"]').click();
 const newLayer=await page.evaluate(()=>window.__cad.project.activeLayer);assert.equal(await page.locator('#objectLayer').inputValue(),newLayer);await page.locator('#applyObject').click();await page.waitForFunction(()=>document.querySelector('#sheet').hidden);await page.locator('#deselectBtn').click();
 await page.evaluate(()=>{const box=(id,w,d,h,position=[0,0,0],layerId='layer-1')=>({id,name:id,type:'box',params:{w,d,h},position,rotation:[0,0,0],mode:'solid',enabled:true,layerId});window.__cad.load({format:'tristancad',version:1,name:'Layer test',layers:[{id:'layer-1',name:'Layer 1'},{id:'layer-2',name:'Layer 2'}],activeLayer:'layer-1',objects:[box('cutter',40,4,20),box('left',10,10,10,[-10,0,0]),box('right',10,10,10,[10,0,0]),box('protected',40,4,10,[0,0,0],'layer-2')]});});
 await page.waitForFunction(()=>window.__cad.model.volume===4400&&window.__cad.model.parts.length===4);
 const protectedBefore=await page.evaluate(()=>JSON.stringify(window.__cad.project.objects[3]));await page.locator('[data-view="front"]').click();
 // Ctrl-tap the middle of each box's front face (y=-5). At this phone viewport a 10 mm box is small enough that a plain tap
 // lands within the 16 px edge radius and intentionally enters Round (touch-tools.mjs tapped()); additive taps never pick edges.
 // Wait for Select mode and the first member before the second Ctrl-tap.
 const tapAt=(point,ctrlKey)=>page.evaluate(([point,ctrlKey])=>{const tool=window.__cad.touch,at=tool.pointScreen(point),canvas=document.querySelector('#scene');for(const type of ['pointerdown','pointerup'])canvas.dispatchEvent(new PointerEvent(type,{clientX:at[0],clientY:at[1],pointerId:1,pointerType:'mouse',ctrlKey,bubbles:true}));},[point,ctrlKey]);
 // Wait for the view change to settle (projected point stable across frames), then start from an empty selection.
 await page.waitForFunction(()=>{const p=JSON.stringify(window.__cad.touch.pointScreen([10,-5,5]).map(v=>Math.round(v)));const same=window.__viewProbe===p;window.__viewProbe=p;return same;},null,{polling:150});
 await page.waitForFunction(()=>!window.__cad.touch.isCommitting());await page.evaluate(()=>window.__cad.touch.deselect());await page.waitForFunction(()=>window.__cad.touch.getState().mode==='select'&&window.__cad.selected===null);
 await tapAt([-10,-5,5],true);await page.waitForFunction(()=>window.__cad.touch.getState().mode==='select'&&window.__cad.selected==='left');await tapAt([10,-5,5],true);await page.waitForFunction(()=>window.__cad.touch.getState().multi.length===2);
 assert.deepEqual(await page.evaluate(()=>window.__cad.touch.getState().multi),['left','right']);assert.equal(await page.locator('#mergeBtn').isVisible(),true);await page.locator('#mergeBtn').click();await page.locator('#confirmMerge').click();await page.waitForFunction(()=>document.querySelector('#mergeError')?.textContent.includes('separated'));await page.locator('#closeSheet').click();
 assert.equal(await page.evaluate(()=>JSON.stringify(window.__cad.project.objects.find(o=>o.id==='protected'))),protectedBefore);
 await page.locator('#layersBtn').click();await page.locator('[data-layer="layer-2"]').click();await page.locator('#closeSheet').click();
 await page.waitForFunction(()=>!window.__cad.touch.isCommitting());await page.evaluate(()=>{const tool=window.__cad.touch;tool.setMode('select');const at=tool.pointScreen([0,0,5]),canvas=document.querySelector('#scene');for(const type of ['pointerdown','pointerup'])canvas.dispatchEvent(new PointerEvent(type,{clientX:at[0],clientY:at[1],pointerId:1,pointerType:'touch',bubbles:true}));});assert.deepEqual(await page.evaluate(()=>window.__cad.touch.getState().multi),[]);assert.equal(await page.locator('#mergeBtn').isVisible(),false);await page.locator('#deselectBtn').click();
 console.log('PASS: mobile WebGL layer controls, active-layer creation and ray selection, additive multi-select and Merge button, protected overlapping reference layer.');
 // New planar primitives and reusable prefab drafts through the real WebGL worker.
 await page.evaluate(()=>{window.__cad.touch.deselect();window.__cad.load(window.__cad.templates.blank());});await page.waitForFunction(()=>window.__cad.model.volume===0);
 for(const [type,w,d,h,x] of [['wedge',30,24,12,0],['pyramid',20,20,15,50]]){
  await page.locator('#addBtn').click();await page.locator('[data-shape="'+type+'"]').click();await page.locator('#p_w').fill(String(w));await page.locator('#p_d').fill(String(d));await page.locator('#p_h').fill(String(h));await page.locator('#pos0').fill(String(x));await page.locator('#pos2').fill(String(h/2));await page.locator('#applyObject').click();await page.waitForFunction(()=>document.querySelector('#sheet').hidden);
 }
 await page.waitForFunction(()=>window.__cad.model.volume===6320&&window.__cad.model.parts.length===2);assert.deepEqual(await page.evaluate(()=>window.__cad.model.parts.map(p=>p.topology.faceCount)),[5,5]);
 const primitiveSnapshot=await page.evaluate(()=>JSON.stringify(window.__cad.project));await page.locator('#addBtn').click();await page.locator('#prefabsBtn').click();await page.locator('#createPrefab').click();await page.locator('#prefabName').fill('Workshop assembly');await page.locator('#prefabSource').selectOption('project');await page.locator('#savePrefab').click();await page.waitForFunction(()=>document.querySelector('#sheetTitle').textContent==='Prefabs'&&document.querySelectorAll('[data-prefab-insert]').length===1);
 assert.equal(await page.evaluate(()=>JSON.stringify(window.__cad.project)),primitiveSnapshot);await page.locator('[data-prefab-export]').click();const prefabFile=await page.evaluate(()=>window.savedFile);assert.ok(prefabFile.name.endsWith('.avprefab'));assert.equal(JSON.parse(Buffer.concat(prefabFile.chunks.map(x=>Buffer.from(x,'base64')))).object.params.children.length,2);
 await page.locator('[data-prefab-insert]').click();assert.equal(await page.evaluate(()=>window.__cad.project.objects.length),2);await page.locator('#cancelObject').click();await page.locator('#addBtn').click();await page.locator('#prefabsBtn').click();await page.locator('[data-prefab-insert]').click();await page.locator('#pos0').fill('100');await page.locator('#pos1').fill('0');await page.locator('#pos2').fill('7.5');await page.locator('#applyObject').click();await page.waitForFunction(()=>document.querySelector('#sheet').hidden&&window.__cad.model.volume===12640&&window.__cad.model.parts.length===3);
 await page.locator('#undo').click();await page.waitForFunction(()=>window.__cad.model.volume===6320&&window.__cad.project.objects.length===2);await page.locator('#redo').click();await page.waitForFunction(()=>window.__cad.model.volume===12640&&window.__cad.project.objects.length===3);
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('tristancad.autosave')).objects.length===3);await page.reload();await page.waitForFunction(()=>window.__cad?.model?.volume===12640&&window.__cad.model.engine.local===true,{},{timeout:60000});await page.locator('#addBtn').click();await page.locator('#prefabsBtn').click();assert.equal(await page.locator('[data-prefab-insert]').count(),1);await page.locator('#closeSheet').click();
 await page.locator('#exportBtn').click();await page.locator('#quality').selectOption('maximum');await page.evaluate(()=>window.savedFile=null);await page.locator('#downloadSTL').click();await page.waitForFunction(()=>window.savedFile?.done);const prefabSTL=await page.evaluate(()=>window.savedFile),prefabBytes=Buffer.concat(prefabSTL.chunks.map(x=>Buffer.from(x,'base64')));assert.equal(prefabBytes.length,84+prefabBytes.readUInt32LE(80)*50);assert.ok(prefabBytes.readUInt32LE(80)>=28);await page.locator('#closeSheet').click();
 console.log('PASS: real mobile draft cancellation, five-face inclined plane/pyramid geometry, reusable prefab saving and export, Apply-only independent insertion, Undo/Redo, collection/project persistence across reload, and Maximum-quality assembly STL.');
 // Off-center sketch points keep their relative outline but add at bottom-center 0.
 await page.locator('#addBtn').click();await page.locator('#sketchBtn').click();for(const [x,y] of [[10,20],[35,20],[35,30],[10,30]]){await page.locator('#pointX').fill(String(x));await page.locator('#pointY').fill(String(y));await page.locator('#pointAdd').click();}await page.locator('#sketchHeight').fill('12');await page.locator('#extrude').click();await page.waitForFunction(()=>document.querySelector('#sheet').hidden&&window.__cad.model.parts.length===4&&window.__cad.project.objects[3].type==='polygon');const sketchBounds=await page.evaluate(()=>window.__cad.model.parts[3].bounds);assert.equal(sketchBounds.min[2],0);assert.equal((sketchBounds.min[0]+sketchBounds.max[0])/2,0);assert.equal((sketchBounds.min[1]+sketchBounds.max[1])/2,0);assert.deepEqual(await page.evaluate(()=>window.__cad.project.objects[3].placement),[0,0,0]);await page.locator('#undo').click();await page.waitForFunction(()=>window.__cad.project.objects.length===3&&window.__cad.model.parts.length===3);
 console.log('PASS: an off-center custom sketch adds at bottom-center 0,0,0 through real canvas/UI and Python placement, and Undo removes it in one step.');
 // A curved overlap must not make the neighboring flat face appear dented.
 await page.evaluate(()=>{window.__cad.touch.deselect();const o=(id,type,params,position)=>({id,name:id,type,params,position,rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1'});const sphere=o('overlap-sphere','sphere',{diameter:20},[0,0,-5]);sphere.resolution={mode:'tolerance',tolerance:.005};window.__cad.load({...window.__cad.templates.blank(),objects:[o('overlap-box','box',{w:30,d:30,h:8},[0,0,0]),sphere]});});
 await page.waitForFunction(()=>window.__cad.model.parts.length===2&&window.__cad.model.parts[0].id==='overlap-box');
 const flatTop=()=>{const m=window.__cad.model,g=window.__cad.display.geometry,a=g.attributes.normal.array,x=g.index?.array,n=x?Float32Array.from({length:x.length*3},(_,i)=>a[x[(i/3)|0]*3+i%3]):a;let triangles=0,bent=0;for(let f=0;f<m.triangles.length/3;f++)if([0,1,2].every(j=>Math.abs(m.vertices[m.triangles[f*3+j]*3+2]-4)<1e-5)){triangles++;for(let j=0;j<3;j++)if(Math.abs(n[f*9+j*3+2]-1)>1e-6)bent++;}return {triangles,bent,volume:m.volume,groups:new Set(m.smoothingGroups).size};};
 const overlapBefore=await page.evaluate(flatTop);assert.ok(overlapBefore.triangles>0);assert.equal(overlapBefore.bent,0);assert.ok(overlapBefore.groups>=2);
 await page.evaluate(()=>{window.__cad.touch.setMulti(['overlap-box','overlap-sphere']);window.__cad.touch.mergeMenu();});await page.locator('#confirmMerge').click();await page.waitForFunction(()=>document.querySelector('#sheet').hidden&&window.__cad.project.objects.length===1&&window.__cad.model.parts.length===1);await page.locator('#deselectBtn').click();const overlapAfter=await page.evaluate(flatTop);assert.equal(overlapAfter.bent,0);assert.ok(Math.abs(overlapAfter.volume-overlapBefore.volume)<1e-6);assert.equal(await page.evaluate(()=>window.__cad.project.objects[0].params.children.find(o=>o.type==='sphere').params.diameter),20);
 console.log('PASS: actual WebGL flat-face normals stay flat where a smooth sphere overlaps a box, both before and after Merge; source smoothing groups, volume and primitive dimensions are preserved.');
 await page.evaluate(()=>{window.__cad.load(window.__cad.templates.plate());});
 await page.waitForFunction(()=>window.__cad.project.name==='Mounting plate'&&window.__cad.model.volume>0);
 await page.waitForFunction(()=>window.__cad.model.parts.length===window.__cad.project.objects.filter(o=>o.enabled).length);
 assert.equal(blocked.length,0,'App attempted an external request');assert.equal(errors.length,0,errors.join('\n'));
 // WS7: with JS_ENGINE the worker must not fetch any Python asset.
 const {JS_ENGINE}=await import('../web/perf-flags.mjs');if(JS_ENGINE)assert.ok(!requests.some(u=>new URL(u).pathname.includes('/python/')),'JS engine fetched Python assets');
 for(const name of [...(JS_ENGINE?[]:['pyodide.mjs','pyodide.asm.js','pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json','model_jobs.py']),'mesh-core.wasm','cad-kernel.wasm','manifold.wasm'])assert.ok(requests.some(u=>new URL(u).pathname.endsWith('/'+name)),'Missing local runtime request: '+name);
 console.log('PASS: actual mobile-sized WebGL browser, restrictive app CSP, module Worker, bundled Python/Rust startup, face picking, triple-tap all edges, real fillet, Rust STL and mounting-plate project. All app requests stayed local with external requests blocked.');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
