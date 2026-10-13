// Re-shoot README screenshots: cd readme-shots && node capture.mjs [shotName...]
// Requires: npm install --no-save playwright && npx playwright install chromium.
// Serves ../../app/assets by default (override with AVALON_ASSETS=/path/to/app/assets). Writes PNGs to ./images/ (override with SHOTS_OUT).
import {start,open,tap,idle} from './harness.mjs';
import fs from 'node:fs';
const OUT=(process.env.SHOTS_OUT||new URL('./images/',import.meta.url).pathname).replace(/\/?$/,'/');fs.mkdirSync(OUT,{recursive:true});
const only=process.argv.slice(2);
const env=await start();
const clean=page=>page.addStyleTag({content:'#busy{visibility:hidden!important}#toast{display:none!important}'});
// OrbitControls zoom: dispatch wheel events straight on the canvas (works in mobile emulation too).
const zoom=async(page,dy)=>{await page.evaluate(dy=>{const c=document.querySelector('#scene'),r=c.getBoundingClientRect();for(let i=0;i<Math.abs(dy)/100;i++)c.dispatchEvent(new WheelEvent('wheel',{deltaY:Math.sign(dy)*100,clientX:r.x+r.width/2,clientY:r.y+r.height/2,bubbles:true,cancelable:true}));},dy);await page.waitForTimeout(500);};
const shot=async(page,name)=>{await idle(page);await page.screenshot({path:OUT+name+'.png'});console.log('saved',name);};
const loadProject=async(page,fn)=>{await page.evaluate(`window.__cad.load((${fn})(window.__cad.templates))`);await page.waitForFunction(()=>window.__cad.model.volume>0&&window.__cad.model.parts.length>=1);await idle(page);};
const ob=(id,type,params,position,extra={})=>({id,name:extra.name||id,type,params,position,rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1',...extra});
const fit=async page=>{await page.locator('#fit').click();await page.waitForTimeout(700);};
const proj=(name,objects,layers=[{id:'layer-1',name:'Layer 1'}])=>({format:'tristancad',version:2,name,objects,layers,activeLayer:layers[0].id});
const heroPlate=t=>{const p=t.plate();p.objects.push({id:'boss',name:'1/4-20 threaded boss',type:'threadtube',params:{diameter:6.35,pitch:1.27,h:12.7,outer:14,clearance:.1524,phase:0,units:'imperial',hand:'right'},position:[0,0,12.35],rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1'});return p;};
async function roundPlate(page){
 await page.evaluate(()=>window.__cad.touch.deselect?.());
 await tap(page,'round',[[0,-20,6]],3);await page.waitForTimeout(300);
 await page.evaluate(()=>window.__cad.touch.radiusMenu());await page.locator('#exactRadius').fill('2');await page.locator('#applyRadius').click();
 await page.waitForFunction(()=>document.querySelector('#sheet').hidden&&window.__cad.project.objects.some(o=>o.fillets?.length),{},{timeout:90000});await idle(page);
}
const shots={
 async 'hero-mounting-plate'(){const page=await open(env);await clean(page);await loadProject(page,heroPlate);await roundPlate(page);
  await page.evaluate(()=>{window.__cad.touch.setMode('select');window.__cad.touch.deselect();});await fit(page);await zoom(page,-600);await shot(page,'hero-mounting-plate');await page.context().close();},
 async 'roundover-edge-selection'(){const page=await open(env);await clean(page);await loadProject(page,t=>t.plate());
  await page.evaluate(()=>window.__cad.touch.deselect());await fit(page);await zoom(page,-500);await tap(page,'round',[[0,-20,6]],3);await page.waitForTimeout(800);await shot(page,'roundover-edge-selection');await page.context().close();},
 async 'objects-panel'(){const page=await open(env);await clean(page);await loadProject(page,heroPlate);await roundPlate(page);
  await page.evaluate(()=>{window.__cad.touch.setMode('select');window.__cad.touch.deselect();});await fit(page);await zoom(page,-300);
  await page.locator('#objectsToggle').click();await page.waitForTimeout(400);await page.locator('[data-row="boss"] .rowmain').click();await page.waitForTimeout(600);await shot(page,'objects-panel');await page.context().close();},
 async 'multi-select-merge'(){const page=await open(env,{desktop:true});await clean(page);
  const O=(id,name,type,params,position,extra={})=>({id,name,type,params,position,rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1',...extra});
  await loadProject(page,`()=>(${JSON.stringify(proj('Bracket',[O('base','Base','rounded',{w:60,d:30,h:8,r:4},[0,0,4]),O('upright','Upright','rounded',{w:60,d:8,h:40,r:3},[0,11,20]),O('rib','Rib','wedge',{w:6,d:22,h:32},[0,-4,24]),O('slot','Cable hole','cylinder',{diameter:10,h:12},[0,11,26],{mode:'cut',rotation:[90,0,0]})]))})`);
  await page.evaluate(()=>window.__cad.touch.deselect());await fit(page);await zoom(page,-200);
  await page.locator('#objectsToggle').click();await page.waitForTimeout(300);
  for(const id of ['base','upright','rib'])await page.locator(`[data-row="${id}"] .rowmain`).click({modifiers:['Control']});
  await page.waitForTimeout(500);await shot(page,'multi-select-desktop');
  await page.locator('#objectsMerge').click();await page.waitForTimeout(400);if(await page.locator('#preserveCuts').count())await page.locator('#preserveCuts').check();await page.waitForTimeout(300);
  await shot(page,'merge-dialog-desktop');await page.context().close();},
 async 'threaded-parts'(){const page=await open(env);await clean(page);
  await page.locator('#addBtn').click();await page.locator('[data-shape="threadrod"]').click();await page.locator('#threadPreset').selectOption('4');await page.waitForTimeout(200);await page.locator('#threadLength').fill('1.5');await page.waitForTimeout(200);
  console.log('thread length field:',await page.locator('#threadLength').inputValue());await page.locator('#pos0').fill('-12').catch(()=>{});await page.locator('#applyObject').click();
  await page.waitForFunction(()=>document.querySelector('#sheet').hidden&&window.__cad.model.volume>0,{},{timeout:120000});
  await page.locator('#addBtn').click();await page.locator('[data-shape="threadtube"]').click();await page.locator('#threadUnits').selectOption('imperial');await page.locator('#threadDiameter').fill('1/4');await page.locator('#threadLength').fill('0.75');await page.locator('#pos0').fill('12').catch(()=>{});await page.locator('#applyObject').click();
  await page.waitForFunction(()=>document.querySelector('#sheet').hidden&&window.__cad.model.parts.length===2,{},{timeout:120000});
  console.log('heights:',JSON.stringify(await page.evaluate(()=>window.__cad.project.objects.map(o=>[o.type,o.params.h,o.position]))));
  await page.evaluate(()=>window.__cad.touch.deselect());await page.locator('text=FRONT').click().catch(()=>{});await page.waitForTimeout(500);await page.locator('text=3D').first().click().catch(()=>{});await fit(page);await zoom(page,-500);await shot(page,'threaded-parts');await page.context().close();},
 async 'layers-panel'(){const page=await open(env);await clean(page);await loadProject(page,heroPlate);
  await page.locator('#layersBtn').click();await page.waitForTimeout(400);
  const add=page.locator('button:has-text("Create a new layer")').first();if(await add.count()){await add.click();await page.waitForTimeout(500);}
  await shot(page,'layers-panel');await page.context().close();},
 async 'prefabs-panel'(){const page=await open(env);await clean(page);await loadProject(page,heroPlate);
  await page.locator('#addBtn').click();await page.locator('#prefabsBtn').click();await page.locator('#createPrefab').click();await page.locator('#prefabName').fill('Mounting plate w/ boss');await page.locator('#prefabSource').selectOption('project');await page.locator('#savePrefab').click();
  await page.waitForFunction(()=>document.querySelectorAll('[data-prefab-insert]').length===1);await page.waitForTimeout(400);await shot(page,'prefabs-panel');await page.context().close();},
 async 'stl-export-dialog'(){const page=await open(env);await clean(page);await loadProject(page,heroPlate);await page.evaluate(()=>window.__cad.touch.deselect());await fit(page);
  await page.locator('#exportBtn').click();await page.waitForTimeout(400);await page.locator('#quality').selectOption('maximum');await page.waitForTimeout(300);await shot(page,'stl-export-dialog');await page.context().close();},
 async 'build-plane-desktop'(){const page=await open(env,{desktop:true});await clean(page);
  await loadProject(page,()=>({format:'tristancad',version:2,name:'Build plane layout',objects:[{id:'a',name:'Rounded box',type:'rounded',params:{w:40,d:30,h:12,r:3},position:[-35,0,6],rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1'},{id:'b',name:'Cone',type:'cone',params:{diameter:25,top:8,h:25},position:[0,10,12.5],rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1',resolution:{mode:'tolerance',tolerance:.005}},{id:'c',name:'Tube',type:'tube',params:{diameter:25,inner:18,h:20},position:[35,0,10],rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1',resolution:{mode:'tolerance',tolerance:.005}}],layers:[{id:'layer-1',name:'Layer 1'}],activeLayer:'layer-1'}));
  if(!(await page.locator('#buildPlane').isChecked()))await page.locator('#buildPlane').check();
  await page.evaluate(()=>window.__cad.touch.deselect());await fit(page);await zoom(page,-200);await shot(page,'build-plane-desktop');await page.context().close();},
};
for(const [name,fn] of Object.entries(shots))if(!only.length||only.includes(name)){try{await fn();}catch(e){console.error('FAIL',name,e.message.split('\n')[0]);}}
await env.close();
// Optimize afterwards: for f in images/*.png; do pngquant --force --skip-if-larger --quality 75-95 --ext .png "$f"; done
