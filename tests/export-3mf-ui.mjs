// ADR-0001 F2a: the Export sheet's STL / 3MF choice in the browser, phone (412x915 touch, Android stub) and desktop
// (1440x900). STL stays the default and synchronous with no chunk loaded; choosing 3MF loads the 3MF texts chunk through
// import(), keeps the quality and Z = 0 settings, and saves a valid .3mf (model/3mf) of the same mesh as the STL; the
// choice is remembered only once a 3MF is exported, and switching back to STL gives the same STL bytes.
// Option A: a small (1-part) 3MF takes the plain single path with no pool; an 8-part one is encoded by the worker pool, started from the page under the app's CSP like worker.js
// (export-pool.js, never nested), min(cores-1,4) workers (Android: 2 unless deviceMemory >= 4), warmed when the sheet shows 3MF for a big model, logged on one debug line, kept for
// the session, terminated when the project is replaced (New project), and recreated on the next 3MF export.
import assert from 'node:assert/strict';import * as H from '../tools/readme-shots/harness.mjs';import {read3MF,meshRules,sameAsSTL} from './three-mf-reader.mjs';
const {initKernel}=await import('../web/kernel.mjs');const BIG_MESH=await (async()=>{const K=await initKernel(),s=K.Manifold.sphere(25,384),m=s.getMesh();s.delete();return {vertices:Array.from(m.vertProperties),triangles:Array.from(m.triVerts)};})();
const env=await H.start();const out=[];
try{for(const desktop of [false,true]){const page=await H.open(env,{desktop});
 const workers=[],logs=[];page.on('worker',w=>{const rec={url:w.url().split('/').pop(),closed:false};workers.push(rec);w.on('close',()=>rec.closed=true);});
 page.on('console',m=>{if(m.text().startsWith('[Avalon 3MF] '))logs.push(JSON.parse(m.text().slice(13)));});
 const chunks=()=>page.evaluate(()=>performance.getEntriesByType('resource').map(r=>r.name).filter(n=>/\/chunk-[^/]*\.js/.test(n)).map(n=>n.split('/').pop()));
 const state=()=>page.evaluate(()=>({title:document.querySelector('#sheetTitle')?.textContent,format:document.querySelector('#exportFormat')?.value,quality:document.querySelector('#quality')?.value,ground:document.querySelector('#ground')?.checked,button:document.querySelector('#downloadSTL')?.textContent,stored:localStorage.getItem('tristancad.exportFormat')}));
 // Option B debug line: the Android stub has no MainActivity, so the test answers its SAF-write callback itself.
 // cold = first export of that format in this app session (this page); poolWarm = 3MF pool ready at the tap.
 const seen=new Set();
 const lines=[];page.on('console',m=>{if(m.text().startsWith('[Avalon export] '))lines.push(JSON.parse(m.text().slice(16)));});
 const save=async()=>{await page.evaluate(()=>{window.savedFile=null;window.__avalonExport=null;document.querySelector('#downloadSTL').click();});await page.waitForFunction(()=>window.savedFile?.done,null,{timeout:120000});
  await page.evaluate(()=>window.nativeSaved({stageMs:3,pickerMs:1,writeMs:7,bytes:1}));const line=await page.waitForFunction(()=>window.__avalonExport,null,{timeout:10000}).then(h=>h.jsonValue());
  assert.equal(line.save,'android-saf');assert.equal(line.pickerMs,1);assert.equal(line.writeMs,7);assert.ok(line.totalMs>=line.encodeMs&&Math.abs(line.totalMs-line.encodeMs-line.saveMs)<=1,JSON.stringify(line));
  assert.ok(['stl','3mf'].includes(line.fmt)&&line.bytes>0&&Number.isFinite(line.totalMs));assert.deepEqual(lines.at(-1),line);
  assert.equal(line.cold,!seen.has(line.fmt),'cold only on the first '+line.fmt+' export: '+JSON.stringify(line));seen.add(line.fmt);assert.equal(typeof line.poolWarm,'boolean');if(line.fmt==='stl'&&!seen.has('3mf'))assert.equal(line.poolWarm,false,'no pool before the 3MF sheet');
  return page.evaluate(()=>({name:window.savedFile.name,mime:window.savedFile.mime,b64:window.savedFile.chunks,metrics:document.querySelector('#exportMetrics').textContent}));};
 const bytes=f=>Buffer.concat(f.b64.map(x=>Buffer.from(x,'base64')));
 await page.evaluate(()=>window.__cad.load(window.__cad.templates.plate()));await page.waitForFunction(()=>window.__cad.model?.triangles?.length>0,null,{timeout:90000});await page.waitForTimeout(300);
 assert.deepEqual(await chunks(),[],'no lazy chunk at startup');
 await page.click('#exportBtn');let s=await state();
 assert.deepEqual([s.title,s.format,s.quality,s.ground,s.button,s.stored],['Export a printable STL','stl','ultra',true,'Build & save .STL',null],'STL by default, nothing stored');
 assert.deepEqual(await chunks(),[],'the STL sheet loads no chunk');
 await page.selectOption('#quality','maximum');
 const stl=await save();assert.ok(stl.name.endsWith('.stl'));assert.equal(stl.mime,'model/stl');assert.match(stl.metrics,/binary STL · millimeters/);
 assert.equal((await state()).stored,null,'an STL export stores nothing while STL is already the choice');
 await page.selectOption('#exportFormat','3mf');await page.waitForFunction(()=>document.querySelector('#sheetTitle').textContent==='Export a printable 3MF');s=await state();
 assert.deepEqual([s.format,s.quality,s.ground,s.button],['3mf','maximum',true,'Build & save .3MF'],'3MF keeps the quality and Z = 0 settings');
 const loaded=await chunks();assert.equal(loaded.length,1);assert.match(loaded[0],/^chunk-export-3mf-sheet-/);
 const mf=await save();assert.ok(mf.name.endsWith('.3mf'),mf.name);assert.equal(mf.mime,'model/3mf');assert.match(mf.metrics,/3MF · compressed · millimeters/);
 assert.equal((await state()).stored,'3mf');
 // Option B step 3: Android gets min(cores - 1, 4) with navigator.deviceMemory >= 4, else 2.
 const [cores,android,memory]=await page.evaluate(()=>[navigator.hardwareConcurrency,!!window.Android,navigator.deviceMemory]),size=Math.max(1,Math.min(cores-1,android&&!(memory>=4)?2:4)),pool=()=>workers.filter(w=>w.url.startsWith('export-pool.js?v='));
 const enc=await page.evaluate(()=>window.__avalon3MF);assert.deepEqual([enc.path,enc.workers],['single',0],'a 1-part (small) 3MF takes the plain single path: '+JSON.stringify(enc));
 assert.equal(pool().length,size,'option B step 2: the 3MF sheet warmed the pool (unused by the 1-part export)');assert.deepEqual(logs.at(-1),enc,'one debug line');
 const model=read3MF(bytes(mf));sameAsSTL(bytes(stl),model,'UI 3MF vs STL');meshRules(model.vertices,model.triangles,'UI 3MF');
 await page.click('#closeSheet');await page.click('#exportBtn');await page.waitForFunction(()=>document.querySelector('#sheetTitle')?.textContent==='Export a printable 3MF');
 assert.equal((await state()).format,'3mf','remembered');
 await page.selectOption('#exportFormat','stl');await page.waitForFunction(()=>document.querySelector('#sheetTitle').textContent==='Export a printable STL');
 assert.equal((await state()).stored,'3mf','switching alone stores nothing');await page.selectOption('#quality','maximum');
 const again=await save();assert.ok(bytes(again).equals(bytes(stl)),'STL bytes unchanged after a 3MF export');assert.equal((await state()).stored,'stl');
 // Architect ruling 3: an 8-part mesh (an imported mesh object: Manifold sphere r 25, 384 segments, 73,728 triangles) uses the pool: cold, then warm.
 const big={...await page.evaluate(()=>window.__cad.templates.blank()),name:'Big sphere',objects:[{id:'s',name:'Sphere',type:'mesh',params:{mesh:BIG_MESH},position:[0,0,0],rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1'}]};
 const loadBig=async()=>{await page.evaluate(p=>window.__cad.load(p),big);await page.waitForFunction(()=>window.__cad.model?.triangles?.length>0&&window.__cad.project.name==='Big sphere',null,{timeout:120000});};
 await page.click('#closeSheet');await loadBig();await page.click('#exportBtn');await page.waitForFunction(()=>/^Export a printable/.test(document.querySelector('#sheetTitle')?.textContent));
 await page.selectOption('#exportFormat','3mf');await page.waitForFunction(()=>document.querySelector('#sheetTitle').textContent==='Export a printable 3MF');
 // Option B step 2: switching the sheet to 3MF with a big model warms the pool (workers + wasm, no encode) before the tap.
 const warmed=Date.now();while(pool().length<size&&Date.now()-warmed<10000)await page.waitForTimeout(50);assert.equal(pool().length,size,'pool warmed when the sheet shows 3MF');assert.equal(await page.evaluate(()=>window.__avalon3MF.path),'single','warming encodes nothing');
 const bigMF=await save();const cold=await page.evaluate(()=>window.__avalon3MF);assert.deepEqual([cold.path,cold.workers,cold.cold,cold.started],['pool',size,false,'sheet'],'8-part 3MF by the sheet-warmed pool: '+JSON.stringify(cold));
 assert.equal(pool().length,size,'pool workers started from the page with the asset path');assert.ok(pool().every(w=>!w.closed));assert.ok(read3MF(bytes(bigMF)).triangles.length/3>=65536);
 const warm=await save();assert.deepEqual([lines.at(-1).cold,lines.at(-1).poolWarm],[false,true],'warm 8-part 3MF: not cold, pool warm at the tap');assert.ok(bytes(warm).equals(bytes(bigMF)),'warm pool: same 3MF bytes');assert.deepEqual(await page.evaluate(()=>[window.__avalon3MF.path,window.__avalon3MF.cold]),['pool',false]);assert.equal(pool().length,size,'pool kept');assert.equal((await page.evaluate(()=>window.__avalonExport)).started,'sheet');
 // Project close (New project → blank, through the replace guard): the pool is terminated.
 await page.click('#closeSheet');await page.click('#projectMenu');await page.click('[data-template="blank"]');await page.click('#replaceCurrent').catch(()=>{});
 await page.waitForFunction(()=>window.__cad.picks!==undefined);await page.waitForTimeout(500);assert.ok(pool().every(w=>w.closed),'pool terminated on project close: '+JSON.stringify(pool()));
 await loadBig();
 await page.click('#exportBtn');await page.waitForFunction(()=>document.querySelector('#sheetTitle')?.textContent==='Export a printable 3MF');
 const after=await save();assert.ok(bytes(after).equals(bytes(bigMF)),'new pool: same 3MF bytes');assert.deepEqual(await page.evaluate(()=>[window.__avalon3MF.path,window.__avalon3MF.cold,window.__avalon3MF.started]),['pool',false,'sheet'],'a new pool after close, warmed by the remembered 3MF sheet');assert.equal(pool().filter(w=>!w.closed).length,size);
 out.push(`${desktop?'desktop':'phone'}: STL default (no chunk), ${loaded[0]} on 3MF, ${model.triangles.length/3} triangles, ${bytes(mf).length} B 3MF vs ${bytes(stl).length} B STL, small 3MF on the single path (pool warmed, unused), 8-part sphere on a sheet-warmed pool of ${size} (first export ${cold.ms} ms), closed with the project`);await page.context().close();}}
finally{await env.close();}
console.log('PASS: export sheet STL/3MF: '+out.join('; '));
