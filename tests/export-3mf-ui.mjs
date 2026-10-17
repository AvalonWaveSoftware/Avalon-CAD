// ADR-0001 F2a: the Export sheet's STL / 3MF choice in the browser, phone (412x915 touch, Android stub) and desktop
// (1440x900). STL stays the default and synchronous with no chunk loaded; choosing 3MF loads the 3MF texts chunk through
// import(), keeps the quality and Z = 0 settings, and saves a valid .3mf (model/3mf) of the same mesh as the STL; the
// choice is remembered only once a 3MF is exported, and switching back to STL gives the same STL bytes.
import assert from 'node:assert/strict';import * as H from '../tools/readme-shots/harness.mjs';import {read3MF,meshRules,sameAsSTL} from './three-mf-reader.mjs';
const env=await H.start();const out=[];
try{for(const desktop of [false,true]){const page=await H.open(env,{desktop});
 const chunks=()=>page.evaluate(()=>performance.getEntriesByType('resource').map(r=>r.name).filter(n=>/\/chunk-[^/]*\.js/.test(n)).map(n=>n.split('/').pop()));
 const state=()=>page.evaluate(()=>({title:document.querySelector('#sheetTitle')?.textContent,format:document.querySelector('#exportFormat')?.value,quality:document.querySelector('#quality')?.value,ground:document.querySelector('#ground')?.checked,button:document.querySelector('#downloadSTL')?.textContent,stored:localStorage.getItem('tristancad.exportFormat')}));
 const save=async()=>{await page.evaluate(()=>{window.savedFile=null;document.querySelector('#downloadSTL').click();});await page.waitForFunction(()=>window.savedFile?.done,null,{timeout:120000});
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
 const model=read3MF(bytes(mf));sameAsSTL(bytes(stl),model,'UI 3MF vs STL');meshRules(model.vertices,model.triangles,'UI 3MF');
 await page.click('#closeSheet');await page.click('#exportBtn');await page.waitForFunction(()=>document.querySelector('#sheetTitle')?.textContent==='Export a printable 3MF');
 assert.equal((await state()).format,'3mf','remembered');
 await page.selectOption('#exportFormat','stl');await page.waitForFunction(()=>document.querySelector('#sheetTitle').textContent==='Export a printable STL');
 assert.equal((await state()).stored,'3mf','switching alone stores nothing');await page.selectOption('#quality','maximum');
 const again=await save();assert.ok(bytes(again).equals(bytes(stl)),'STL bytes unchanged after a 3MF export');assert.equal((await state()).stored,'stl');
 out.push(`${desktop?'desktop':'phone'}: STL default (no chunk), ${loaded[0]} on 3MF, ${model.triangles.length/3} triangles, ${bytes(mf).length} B 3MF vs ${bytes(stl).length} B STL`);await page.context().close();}}
finally{await env.close();}
console.log('PASS: export sheet STL/3MF: '+out.join('; '));
