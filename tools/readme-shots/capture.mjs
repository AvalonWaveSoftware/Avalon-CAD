// Re-shoot the README screenshots (3.0): cd to the repo root, then  node tools/readme-shots/capture.mjs [shotName...]
// Requires Playwright (npm install --no-save playwright, or AVALON_PLAYWRIGHT=<path to an installed copy>) and a Chromium
// (AVALON_CHROMIUM). Serves app/assets by default (override with AVALON_ASSETS=/path/to/app/assets) on localhost with
// outside requests blocked, in headless Chromium with software WebGL. Phone shots are 412x915 at 2x touch, desktop shots
// are 1440x900 at 1x (the same viewports as tests/pixels.mjs). PNGs go to docs/images/ (override with SHOTS_OUT).
// With no names it makes every shot that does not exist yet; name a shot to remake it, or set SHOTS_FORCE=1 to remake all.
import {start,open,tap,idle} from './harness.mjs';
import fs from 'node:fs';import zlib from 'node:zlib';import path from 'node:path';
const OUT=(process.env.SHOTS_OUT||new URL('../../docs/images/',import.meta.url).pathname).replace(/\/?$/,'/');fs.mkdirSync(OUT,{recursive:true});
const only=process.argv.slice(2),force=process.env.SHOTS_FORCE==='1';
const env=await start();
const clean=page=>page.addStyleTag({content:'#busy{visibility:hidden!important}#toast{display:none!important}'});
// OrbitControls zoom: dispatch wheel events straight on the canvas (works in mobile emulation too).
const zoom=async(page,dy)=>{await page.evaluate(dy=>{const c=document.querySelector('#scene'),r=c.getBoundingClientRect();for(let i=0;i<Math.abs(dy)/100;i++)c.dispatchEvent(new WheelEvent('wheel',{deltaY:Math.sign(dy)*100,clientX:r.x+r.width/2,clientY:r.y+r.height/2,bubbles:true,cancelable:true}));},dy);await page.waitForTimeout(500);};
const shot=async(page,name)=>{await idle(page);await page.screenshot({path:OUT+name+'.png'});console.log('saved',name);};
const loadProject=async(page,fn,n=1)=>{await page.evaluate(`window.__cad.load((${fn})(window.__cad.templates))`);await page.waitForFunction(n=>window.__cad.model.volume>0&&window.__cad.model.parts.length>=n,n,{timeout:120000});await idle(page);};
const ob=(id,type,params,position,extra={})=>({id,name:extra.name||id,type,params,position,rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1',...extra});
const proj=(name,objects,extra={})=>({format:'tristancad',version:2,name,objects,layers:[{id:'layer-1',name:'Layer 1'}],activeLayer:'layer-1',...extra});
const fit=async page=>{await page.locator('#fit').click();await page.waitForTimeout(700);};
const view=async(page,v)=>{await page.locator(`[data-view=${v}]`).click();await page.waitForTimeout(600);};
const deselect=page=>page.evaluate(()=>{window.__cad.touch.setMode('select');window.__cad.touch.deselect();});
const heroPlate=t=>{const p=t.plate();p.objects.push({id:'boss',name:'1/4-20 threaded boss',type:'threadtube',params:{diameter:6.35,pitch:1.27,h:12.7,outer:14,clearance:.1524,phase:0,units:'imperial',hand:'right'},position:[0,0,12.35],rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1'});return p;};
async function roundPlate(page){
 await page.evaluate(()=>window.__cad.touch.deselect?.());
 await tap(page,'round',[[0,-20,6]],3);await page.waitForTimeout(300);
 await page.evaluate(()=>window.__cad.touch.radiusMenu());await page.locator('#exactRadius').fill('2');await page.locator('#applyRadius').click();
 await page.waitForFunction(()=>document.querySelector('#sheet').hidden&&window.__cad.project.objects.some(o=>o.fillets?.length),{},{timeout:120000});await idle(page);
}
// Thread presets exactly as web/threads.mjs lists them: the nominal diameter in mm (inch presets are converted) and the pitch in mm.
const IMP=[['#6-32',.138,32],['#10-24',.19,24],['1/4-20',.25,20],['3/8-16',.375,16],['1/2-13',.5,13],['3/4-10',.75,10]];
const MET=[['M3 × 0.5',3,.5],['M5 × 0.8',5,.8],['M8 × 1.25',8,1.25],['M12 × 1.75',12,1.75],['M16 × 2',16,2],['M20 × 2.5',20,2.5]];
const screwRow=(list,imperial,h,gap)=>proj(imperial?'Imperial screw presets':'Metric screw presets',list.map(([label,d,p],i)=>ob('s'+i,'threadrod',{diameter:imperial?d*25.4:d,pitch:imperial?25.4/p:p,h,clearance:0,phase:0,units:imperial?'imperial':'metric',hand:'right'},[(i-(list.length-1)/2)*gap,0,h/2],{name:label+' screw'})),{buildPlaneEnabled:true});
// A torus as a binary STL / a 3MF package, so the import shots show a file that is not one of the built-in shapes.
function torusMesh(R=18,r=6,nu=48,nv=24){const v=[],t=[];for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i/nu*2*Math.PI,b=j/nv*2*Math.PI;v.push((R+r*Math.cos(b))*Math.cos(a),(R+r*Math.cos(b))*Math.sin(a),r*Math.sin(b)+r);}
 for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*nv+j,b=((i+1)%nu)*nv+j,c=((i+1)%nu)*nv+(j+1)%nv,d=i*nv+(j+1)%nv;t.push(a,b,c,a,c,d);}return {v,t};}
function stlBuffer({v,t}){const b=Buffer.alloc(84+50*t.length/3);b.writeUInt32LE(t.length/3,80);for(let i=0;i<t.length/3;i++)for(let k=0;k<3;k++)for(let j=0;j<3;j++)b.writeFloatLE(v[t[i*3+k]*3+j],84+i*50+12+k*12+j*4);return b;}
const crcT=(()=>{const c=[];for(let n=0;n<256;n++){let x=n;for(let k=0;k<8;k++)x=x&1?0xEDB88320^(x>>>1):x>>>1;c[n]=x>>>0;}return c;})();
const crc=b=>{let x=0xFFFFFFFF;for(const y of b)x=crcT[(x^y)&255]^(x>>>8);return (x^0xFFFFFFFF)>>>0;};
function zip(files){const parts=[],cd=[];let off=0;for(const [name,data] of files){const n=Buffer.from(name),raw=Buffer.from(data),def=zlib.deflateRawSync(raw),c=crc(raw);
  const h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50,0);h.writeUInt16LE(20,4);h.writeUInt16LE(8,8);h.writeUInt32LE(c,14);h.writeUInt32LE(def.length,18);h.writeUInt32LE(raw.length,22);h.writeUInt16LE(n.length,26);
  const e=Buffer.alloc(46);e.writeUInt32LE(0x02014b50,0);e.writeUInt16LE(20,4);e.writeUInt16LE(20,6);e.writeUInt16LE(8,10);e.writeUInt32LE(c,16);e.writeUInt32LE(def.length,20);e.writeUInt32LE(raw.length,24);e.writeUInt16LE(n.length,28);e.writeUInt32LE(off,42);
  parts.push(h,n,def);cd.push(e,n);off+=30+n.length+def.length;}
 const cdb=Buffer.concat(cd),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(cdb.length,12);end.writeUInt32LE(off,16);return Buffer.concat([...parts,cdb,end]);}
function threeMF({v,t}){const verts=[];for(let i=0;i<v.length;i+=3)verts.push(`<vertex x="${v[i].toFixed(4)}" y="${v[i+1].toFixed(4)}" z="${v[i+2].toFixed(4)}"/>`);const tris=[];for(let i=0;i<t.length;i+=3)tris.push(`<triangle v1="${t[i]}" v2="${t[i+1]}" v3="${t[i+2]}"/>`);
 return zip([['[Content_Types].xml','<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>'],
  ['_rels/.rels','<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>'],
  ['3D/3dmodel.model',`<?xml version="1.0"?><model unit="millimeter" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><resources><object id="1" type="model"><mesh><vertices>${verts.join('')}</vertices><triangles>${tris.join('')}</triangles></mesh></object></resources><build><item objectid="1"/></build></model>`]]);}
const addApply=async(page,sel)=>{await page.locator('#addBtn').click();await page.locator(sel).click();};
const shots={
 // ---- the threaded screw presets (first in the README) ----
 async 'screw-presets-imperial'(){const page=await open(env,{desktop:true});await clean(page);await loadProject(page,`()=>(${JSON.stringify(screwRow(IMP,true,38.1,26))})`,6);
  await deselect(page);await fit(page);await view(page,'front');await zoom(page,-2000);await shot(page,'screw-presets-imperial');await page.context().close();},
 async 'screw-presets-metric'(){const page=await open(env,{desktop:true});await clean(page);await loadProject(page,`()=>(${JSON.stringify(screwRow(MET,false,38,26))})`,6);
  await deselect(page);await fit(page);await view(page,'front');await zoom(page,-2000);await shot(page,'screw-presets-metric');await page.context().close();},
 async 'screw-preset-sheet'(){const page=await open(env);await clean(page);await addApply(page,'[data-shape="threadrod"]');await page.waitForSelector('#threadPreset');
  await page.locator('#threadLength').fill('1.5');await page.locator('#threadPreset').selectOption({label:'3/8-16'});await page.waitForTimeout(300);
  await page.locator('#threadPreset').scrollIntoViewIfNeeded();await page.evaluate(()=>{const s=document.querySelector('#threadUnits');s.scrollIntoView({block:'start'});});await page.waitForTimeout(500);
  console.log('preset shown:',await page.locator('#threadPreset option:checked').textContent(),'| summary:',await page.locator('#threadSummary').textContent());await shot(page,'screw-preset-sheet');await page.context().close();},
 async 'screw-preset-sheet-metric'(){const page=await open(env,{desktop:true});await clean(page);await addApply(page,'[data-shape="threadrod"]');await page.waitForSelector('#threadPreset');
  await page.locator('#threadUnits').selectOption('metric');await page.locator('#threadLength').fill('30');await page.locator('#threadPreset').selectOption({label:'M8 × 1.25'});await page.waitForTimeout(300);
  await page.locator('#threadUnits').scrollIntoViewIfNeeded();await page.waitForTimeout(400);
  console.log('preset shown:',await page.locator('#threadPreset option:checked').textContent(),'| summary:',await page.locator('#threadSummary').textContent());await shot(page,'screw-preset-sheet-metric');await page.context().close();},
 async 'screw-tube-pair'(){const page=await open(env);await clean(page);
  await loadProject(page,`()=>(${JSON.stringify(proj('Screw and tube',[ob('rod','threadrod',{diameter:6.35,pitch:1.27,h:38.1,clearance:0,phase:0,units:'imperial',hand:'right'},[-11,0,19.05],{name:'1/4-20 all-thread screw'}),ob('tube','threadtube',{diameter:6.35,pitch:1.27,h:25.4,outer:12.7,clearance:.1524,phase:0,units:'imperial',hand:'right'},[11,0,12.7],{name:'1/4-20 threaded tube'})],{buildPlaneEnabled:true}))})`,2);
  await deselect(page);await fit(page);await zoom(page,-300);await shot(page,'screw-tube-pair');await page.context().close();},
 // ---- the main UI ----
 async 'desktop-main'(){const page=await open(env,{desktop:true});await clean(page);await loadProject(page,heroPlate);await roundPlate(page);
  await deselect(page);await fit(page);await zoom(page,-200);await page.locator('#objectsToggle').click();await page.waitForTimeout(400);await page.locator('[data-row="boss"] .rowmain').click();await page.waitForTimeout(700);await shot(page,'desktop-main');await page.context().close();},
 async 'phone-main'(){const page=await open(env);await clean(page);await loadProject(page,heroPlate);await roundPlate(page);
  await deselect(page);await fit(page);await zoom(page,-300);await shot(page,'phone-main');await page.context().close();},
 async 'add-shapes-sheet'(){const page=await open(env);await clean(page);await page.locator('#addBtn').click();await page.waitForSelector('[data-shape="threadrod"]');await page.waitForTimeout(500);await shot(page,'add-shapes-sheet');await page.context().close();},
 // ---- 3.0 features ----
 async 'import-3mf-applied'(){const page=await open(env,{desktop:true});await clean(page);await page.locator('#importFile').setInputFiles({name:'ring.3mf',mimeType:'model/3mf',buffer:threeMF(torusMesh())});await page.waitForSelector('#applyObject');await page.locator('#applyObject').click();
  await page.waitForFunction(()=>document.querySelector('#sheet').hidden&&window.__cad.model?.parts?.length>=1,{},{timeout:120000});await deselect(page);await fit(page);await zoom(page,-300);await shot(page,'import-3mf-applied');await page.context().close();},
 async 'import-cancel'(){const page=await open(env);await clean(page);await page.evaluate(()=>localStorage.setItem('testImportDelayMs','20000'));
  await page.locator('#importFile').setInputFiles({name:'ring.stl',mimeType:'model/stl',buffer:stlBuffer(torusMesh())});
  await page.waitForSelector('#jobCancel',{state:'visible',timeout:30000});await page.waitForTimeout(600);await page.screenshot({path:OUT+'import-cancel.png'});console.log('saved import-cancel');
  await page.locator('#jobCancel').click();await page.waitForTimeout(500);await page.context().close();},
 async 'glyph-emboss-sheet'(){const page=await open(env,{desktop:true});await clean(page);await page.locator('#addBtn').click();await page.locator('#lettersBtn').click();
  await page.waitForFunction(()=>document.querySelectorAll('[data-glyph] svg').length===94,null,{timeout:120000});await page.locator('[data-glyph][aria-label="Letter A"]').click();await page.waitForFunction(()=>document.querySelector('#objectName')?.value==='Letter A');await page.waitForTimeout(800);
  console.log('size text:',await page.evaluate(()=>[...document.querySelectorAll('#sheet *')].filter(e=>e.children.length===0&&/Overall size/.test(e.textContent)).map(e=>e.textContent).join('|')));await shot(page,'glyph-emboss-sheet');await page.context().close();},
 async 'glyph-emboss-result'(){const page=await open(env,{desktop:true});await clean(page);await page.locator('#addBtn').click();await page.locator('#lettersBtn').click();
  await page.waitForFunction(()=>document.querySelectorAll('[data-glyph] svg').length===94,null,{timeout:120000});await page.locator('[data-glyph][aria-label="Letter A"]').click();await page.waitForFunction(()=>document.querySelector('#objectName')?.value==='Letter A');
  await page.locator('#applyObject').click();await page.waitForFunction(()=>document.querySelector('#sheet').hidden&&window.__cad.model.volume>0,{},{timeout:120000});await deselect(page);await fit(page);await zoom(page,-300);await shot(page,'glyph-emboss-result');await page.context().close();},
 async 'rotate-rings'(){const page=await open(env);await clean(page);await loadProject(page,heroPlate);await deselect(page);await fit(page);await zoom(page,-200);await tap(page,'select',[[0,-15,6]]);await page.waitForTimeout(400);await page.evaluate(()=>window.__cad.touch.setMode('rotate'));await page.waitForTimeout(800);await shot(page,'rotate-rings');await page.context().close();},
 async 'hollow-open-box'(){const page=await open(env,{desktop:true});await clean(page);await loadProject(page,`()=>(${JSON.stringify(proj('Open hollow box',[ob('hb','box',{w:40,d:40,h:20},[0,0,10],{name:'Hollow box',shell:{thickness:2,open:[5]}})],{version:3}))})`);await deselect(page);await view(page,'iso').catch(()=>{});await fit(page);await shot(page,'hollow-open-box');await page.context().close();},
 async 'hollow-sheet'(){const page=await open(env);await clean(page);await loadProject(page,`()=>(${JSON.stringify(proj('Hollow box',[ob('hb','box',{w:30,d:30,h:15},[0,0,7.5],{name:'Box',shell:{thickness:2}})],{version:3}))})`);await tap(page,'select',[[0,0,15]],2);await page.locator('#quickEdit').click();await page.waitForSelector('#hollowOn');await page.locator('#hollowPick').evaluate(e=>e.scrollIntoView({block:'center'}));await page.waitForTimeout(500);await shot(page,'hollow-sheet');await page.context().close();},
 async 'measure-tool'(){const page=await open(env,{desktop:true});await clean(page);await loadProject(page,heroPlate);await deselect(page);await fit(page);await zoom(page,-200);await page.locator('#measureBtn').click();await page.waitForTimeout(500);
  for(const pt of [[-30,-15,6],[30,15,6]]){const at=await page.evaluate(pt=>window.__cad.touch.pointScreen(pt),pt);await page.mouse.click(at[0],at[1]);await page.waitForTimeout(800);}
  await page.waitForTimeout(1200);console.log('measure result:',await page.locator('#measureResult').textContent());await shot(page,'measure-tool');await page.context().close();},
 async 'edge-chamfer-menu'(){const page=await open(env);await clean(page);await loadProject(page,heroPlate);await deselect(page);await fit(page);await zoom(page,-200);await page.locator('#touchModes [data-mode=round]').click();await page.waitForSelector('#edgeToolMenu',{state:'visible'});await page.waitForTimeout(500);await shot(page,'edge-chamfer-menu');await page.context().close();},
 async 'export-sheet'(){const page=await open(env);await clean(page);await loadProject(page,heroPlate);await deselect(page);await fit(page);await page.locator('#exportBtn').click();await page.waitForTimeout(500);
  await page.locator('#exportFormat').selectOption({index:1}).catch(e=>console.log('no format select',e.message.split('\n')[0]));await page.waitForTimeout(500);await shot(page,'export-sheet');await page.context().close();},
 async 'overhang-view'(){const page=await open(env,{desktop:true});await clean(page);await loadProject(page,`()=>(${JSON.stringify(proj('Overhang',[ob('sphere','sphere',{diameter:40},[0,0,35],{name:'Sphere'}),ob('post','cylinder',{diameter:14,h:25},[40,0,12.5],{name:'Post'})]))})`,2);await page.locator('[data-view=iso]').dblclick();await page.locator('#overhang').check();await page.locator('#closeSheet').click();await deselect(page);await view(page,'front');await zoom(page,-200);await shot(page,'overhang-view');await page.context().close();},
 async 'mirror-mode'(){const page=await open(env);await clean(page);await loadProject(page,heroPlate);await deselect(page);await fit(page);await zoom(page,-200);await tap(page,'select',[[0,-15,6]]);await page.evaluate(()=>window.__cad.touch.setMode('mirror'));await page.waitForTimeout(700);await shot(page,'mirror-mode');await page.context().close();},
 // ---- the 2.x features, re-shot on the 3.0 build ----
 async 'roundover-edge-selection'(){const page=await open(env);await clean(page);await loadProject(page,t=>t.plate());
  await deselect(page);await fit(page);await zoom(page,-500);await tap(page,'round',[[0,-20,6]],3);await page.waitForTimeout(800);await shot(page,'roundover-edge-selection');await page.context().close();},
 async 'multi-select-merge'(){const page=await open(env,{desktop:true});await clean(page);
  const O=(id,name,type,params,position,extra={})=>ob(id,type,params,position,{name,...extra});
  await loadProject(page,`()=>(${JSON.stringify(proj('Bracket',[O('base','Base','rounded',{w:60,d:30,h:8,r:4},[0,0,4]),O('upright','Upright','rounded',{w:60,d:8,h:40,r:3},[0,11,20]),O('rib','Rib','wedge',{w:6,d:22,h:32},[0,-4,24]),O('slot','Cable hole','cylinder',{diameter:10,h:12},[0,11,26],{mode:'cut',rotation:[90,0,0]})]))})`);
  await deselect(page);await fit(page);await zoom(page,-200);
  await page.locator('#objectsToggle').click();await page.waitForTimeout(300);
  for(const id of ['base','upright','rib'])await page.locator(`[data-row="${id}"] .rowmain`).click({modifiers:['Control']});
  await page.waitForTimeout(500);await shot(page,'multi-select-desktop');
  await page.locator('#objectsMerge').click();await page.waitForTimeout(400);if(await page.locator('#preserveCuts').count())await page.locator('#preserveCuts').check();await page.waitForTimeout(300);
  await shot(page,'merge-dialog-desktop');await page.context().close();},
 async 'layers-panel'(){const page=await open(env);await clean(page);await loadProject(page,heroPlate);
  await page.locator('#layersBtn').click();await page.waitForTimeout(400);
  const add=page.locator('button:has-text("Create a new layer")').first();if(await add.count()){await add.click();await page.waitForTimeout(500);}
  await shot(page,'layers-panel');await page.context().close();},
 async 'prefabs-panel'(){const page=await open(env);await clean(page);await loadProject(page,heroPlate);
  await page.locator('#addBtn').click();await page.locator('#prefabsBtn').click();await page.locator('#createPrefab').click();await page.locator('#prefabName').fill('Mounting plate w/ boss');await page.locator('#prefabSource').selectOption('project');await page.locator('#savePrefab').click();
  await page.waitForFunction(()=>document.querySelectorAll('[data-prefab-insert]').length===1);await page.waitForTimeout(400);await shot(page,'prefabs-panel');await page.context().close();},
 async 'build-plane-desktop'(){const page=await open(env,{desktop:true});await clean(page);
  await loadProject(page,`()=>(${JSON.stringify(proj('Build plane layout',[ob('a','rounded',{w:40,d:30,h:12,r:3},[-35,0,6],{name:'Rounded box'}),ob('b','cone',{diameter:25,top:8,h:25},[0,10,12.5],{name:'Cone',resolution:{mode:'tolerance',tolerance:.005}}),ob('c','tube',{diameter:25,inner:18,h:20},[35,0,10],{name:'Tube',resolution:{mode:'tolerance',tolerance:.005}})]))})`);
  if(!(await page.locator('#buildPlane').isChecked()))await page.locator('#buildPlane').check();
  await deselect(page);await fit(page);await zoom(page,-200);await shot(page,'build-plane-desktop');await page.context().close();},
};
const log=[];
for(const [name,fn] of Object.entries(shots)){
 const wanted=only.length?only.includes(name):(force||!(fs.existsSync(OUT+name+'.png')||(name==='multi-select-merge'&&fs.existsSync(OUT+'multi-select-desktop.png'))));
 if(!wanted)continue;
 try{await fn();}catch(e){console.error('FAIL',name,e.message.split('\n')[0]);log.push(name);}
}
await env.close();if(log.length)console.error('failed shots:',log.join(', '));
// Optimize afterwards (tools/readme-shots/README.md): quantize to 256 colours and re-save with maximum PNG compression.
