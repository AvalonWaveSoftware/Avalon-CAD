import {shipTopologies} from '../web/topology-pack.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {build} from 'esbuild';
import {initKernel,readSTL,validateProject} from '../web/kernel.mjs';
import {defaults,object,blank} from '../web/templates.mjs';
import {applyFloorAdjustments,startAtOrigin} from '../web/placement.mjs';
import {makePrefab} from '../web/prefabs.mjs';
import {loadPyodide} from 'pyodide';
import {initLocalEngine} from '../web/local-engine.mjs';
const K=await initKernel({solidOptions:{wasmBinary:fs.readFileSync('node_modules/replicad-opencascadejs/dist/replicad_single.wasm')}});
const runtime=await initLocalEngine(K,{loadPyodide,pythonURL:process.cwd()+'/node_modules/pyodide/',pythonSource:fs.readFileSync('engine/python/model_jobs.py','utf8'),rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
await build({entryPoints:['web/main.mjs'],outfile:'build/test-ui.js',bundle:true,format:'iife',platform:'browser',target:'chrome100',external:['manifold-3d','node:*'],define:{'import.meta.url':'"https://appassets.androidplatform.net/assets/main.js"'},plugins:[{name:'test-renderer',setup(b){b.onResolve({filter:/^three$/},args=>args.importer.endsWith('three-test.mjs')?null:{path:process.cwd()+'/tests/three-test.mjs'});}}]});
const dom=new JSDOM(fs.readFileSync('web/index.html','utf8'),{url:'https://appassets.androidplatform.net/assets/index.html',pretendToBeVisual:true,runScripts:'outside-only'}),w=dom.window;
w.HTMLCanvasElement.prototype.setPointerCapture=function(){};w.HTMLCanvasElement.prototype.releasePointerCapture=function(){};w.HTMLCanvasElement.prototype.hasPointerCapture=function(){return false};const uiErrors=[];w.addEventListener('error',e=>uiErrors.push(e.error?.message||e.message));
w.HTMLCanvasElement.prototype.getBoundingClientRect=function(){return {left:0,top:0,right:412,bottom:600,width:412,height:600}};w.structuredClone=structuredClone;w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.ResizeObserver=class{constructor(fn){this.fn=fn}observe(){this.fn()}};Object.defineProperty(w.HTMLCanvasElement.prototype,'clientWidth',{get:()=>412});Object.defineProperty(w.HTMLCanvasElement.prototype,'clientHeight',{get:()=>600});
w.MessageChannel=class{constructor(){this.port1={};this.port2={close(){}};}};
w.Worker=class {postMessage(input){if(input.type==='occtPort')return;const data=structuredClone(input);setTimeout(()=>{try{const result=runtime.process(data);result.engine=runtime.info;shipTopologies(result);this.onmessage({data:result});}catch(e){this.onmessage({data:{id:data.id,error:e.message}})}},0)}};
w.Android={beginFile(name,mime){w.testSaved={name,mime,chunks:[]}},appendFile(x){w.testSaved.chunks.push(x)},finishFile(){w.testSaved.done=true}};
w.eval(fs.readFileSync('build/test-ui.js','utf8'));
const $=id=>w.document.getElementById(id),click=id=>$(id).click(),sleep=()=>new Promise(r=>setTimeout(r,25));
const wait=async fn=>{for(let i=0;i<60;i++){if(fn())return;await sleep();}throw Error('Wait timed out: '+JSON.stringify({resolution:w.__cad.project.objects[0]?.resolution,volume:w.__cad.model?.volume,error:$('editError')?.textContent,toast:$('toast').textContent}))};
await wait(()=>w.__cad.model!==null);assert.equal(w.__cad.model.volume,0);assert.equal(w.__cad.model.engine.local,true);assert.equal(w.__cad.model.engine.rust,7);

const near=(a,b,t=1e-5)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
let sequence=10000;const job=input=>{const r=runtime.process({id:++sequence,...input});if(r.error)throw Error(r.error);return r;};
const bounds=o=>job({type:'check',project:{...blank(),objects:[o]},tolerance:.005}).bounds;
const place=(o,at=[0,0,0],floor=true)=>job({type:'place',object:startAtOrigin(structuredClone(o)),position:at,floor}).object;
// All native shapes use their actual bottom/bounding center, including rotations,
// odd-sided facets, independent thread parameters and compound assemblies.
for(const [type,params] of Object.entries(defaults)){
 let o=object(type,structuredClone(params),[47,-29,-33]);o.rotation=[17,29,11];
 if(['cylinder','cone','tube','sphere'].includes(type))o.resolution={mode:'faces',count:7};
 const original=JSON.stringify(o);o=place(o);const b=bounds(o);near((b.min[0]+b.max[0])/2,0);near((b.min[1]+b.max[1])/2,0);near(b.min[2],0);assert.deepEqual(o.placement,[0,0,0]);assert.equal(o.positionReference,'base');assert.equal(JSON.stringify(o.params),JSON.stringify(params));
 const lowered=place(o,[3,-9,-7],false),off=bounds(lowered);near(off.min[2],-7);const on=place(lowered,[3,-9,-7],true);near(bounds(on).min[2],0);assert.ok(original.includes(type));
}
const sketch=place(object('polygon',{points:[[10,20],[35,20],[35,30],[10,30]],h:12}));const sketchBounds=bounds(sketch);near(sketchBounds.min[2],0);near((sketchBounds.min[0]+sketchBounds.max[0])/2,0);near((sketchBounds.min[1]+sketchBounds.max[1])/2,0);
const legacyBox=object('box',{w:10,d:8,h:6},[30,-20,-8]);
const importMesh=job({type:'export',project:{...blank(),objects:[legacyBox]},tolerance:.005,ground:false});const imported=object('mesh',{mesh:readSTL(importMesh.buffer)});const placedMesh=place(imported);near(bounds(placedMesh).min[2],0);near((bounds(placedMesh).min[0]+bounds(placedMesh).max[0])/2,0);
const a=object('box',{w:20,d:20,h:10},[40,20,-20]),b=object('sphere',{diameter:10},[48,20,-15]),c=object('box',{w:4,d:40,h:30},[40,20,-20]);c.mode='cut';
const raw={...blank(),objects:[a,b,c]},rawCheck=job({type:'check',project:raw,tolerance:.005}),prefab=makePrefab(raw.objects,'Offset assembly',rawCheck.bounds,raw.layers),placedPrefab=place(prefab.object);near(bounds(placedPrefab).min[2],0);assert.equal(placedPrefab.params.children.length,3);
const snapshot=JSON.stringify(raw),grounded=job({type:'groundProject',project:raw});assert.equal(JSON.stringify(raw),snapshot);assert.equal(grounded.project.buildPlaneEnabled,true);near(grounded.lift,35);for(let i=0;i<3;i++){near(grounded.project.objects[i].position[2]-raw.objects[i].position[2],35);assert.deepEqual(grounded.project.objects[i].params,raw.objects[i].params);}near(job({type:'check',project:grounded.project,tolerance:.005}).volume,rawCheck.volume);
const floorProject={...blank(),buildPlaneEnabled:true,objects:[structuredClone(legacyBox)]},before=JSON.stringify(floorProject),checked=job({type:'check',project:floorProject,tolerance:.005});near(checked.bounds.min[2],0);near(checked.volume,480);assert.equal(JSON.stringify(floorProject),before);assert.equal(checked.floorAdjustments.length,1);applyFloorAdjustments(floorProject,checked);near(floorProject.objects[0].position[2],3);applyFloorAdjustments(floorProject,checked);near(floorProject.objects[0].position[2],3);
// The floor changes position only. STL contains the model's twelve box triangles,
// and Off permits negative Z when the independent printing-ground option is Off.
for(const enabled of [true,false]){
 const p={...blank(),buildPlaneEnabled:enabled,objects:[legacyBox]},out=job({type:'export',project:p,tolerance:.005,ground:false}),data=new DataView(out.buffer);assert.equal(data.getUint32(80,true),12);near(out.volume,480);let min=Infinity;for(let i=84;i<data.byteLength;i+=50)for(let j=0;j<3;j++)min=Math.min(min,data.getFloat32(i+12+j*12+8,true));near(min,enabled?0:-11);
}
assert.throws(()=>validateProject({...blank(),buildPlaneEnabled:'yes'}),/build-plane/);assert.throws(()=>job({type:'place',object:legacyBox,position:[0,0,NaN],floor:true}),/placement/);
console.log('PASS: exact origin grounding for every rotated primitive, odd facets, threaded parts, offset STL and cutout prefab; whole-assembly lift preserves relative positions and volume; floor-only translations, no input mutation, and model-only/nonnegative or negative STL exports.');
const add=type=>{click('addBtn');w.document.querySelector(`[data-shape="${type}"]`).click();};
const apply=async()=>{click('applyObject');await wait(()=>$('sheet').hidden);};
assert.equal($('buildPlane').checked,true);assert.equal(w.__cad.project.buildPlaneEnabled,true);
for(const type of Object.keys(defaults)){
 add(type);for(const i of [0,1,2])assert.equal(Number($('pos'+i).value),0);assert.equal(w.__cad.project.objects.length,0);if(type.startsWith('thread')){assert.equal($('threadUnits').value,'imperial');assert.equal(Number($('threadPitch').value),20);}
 await apply();await wait(()=>w.__cad.model.parts.length===1&&w.__cad.model.parts[0].id===w.__cad.project.objects[0].id);near(w.__cad.model.bounds.min[2],0,1e-4);assert.deepEqual(Array.from(w.__cad.project.objects[0].placement),[0,0,0]);click('undo');await wait(()=>w.__cad.project.objects.length===0&&w.__cad.model.volume===0);
}
add('box');$('p_h').value='10';await apply();await wait(()=>w.__cad.model.parts.length===1);const id=w.__cad.project.objects[0].id;
click('editBtn');$('pos0').value='70';$('pos1').value='-30';$('pos2').value='12';await apply();await wait(()=>w.__cad.model.bounds.min[2]===12);
// Selection and Snap On must not influence the next draft's origin/orientation.
assert.equal(w.__cad.touch.getState().snap,true);add('box');for(const i of [0,1,2])assert.equal(Number($('pos'+i).value),0);await apply();await wait(()=>w.__cad.model.parts.length===2);near(w.__cad.model.parts[1].bounds.min[2],0);near((w.__cad.model.parts[1].bounds.min[0]+w.__cad.model.parts[1].bounds.max[0])/2,0);click('editBtn');click('duplicateObject');for(const i of [0,1,2])assert.equal(Number($('pos'+i).value),0);click('cancelObject');assert.equal(w.__cad.project.objects.length,2);
click('editBtn');$('p_h').value='30';$('pos2').value='-9';await apply();await wait(()=>w.__cad.model.parts[1].bounds.max[2]===30);near(w.__cad.model.parts[1].bounds.min[2],0);near(w.__cad.project.objects[1].placement[2],0);
$('buildPlane').click();assert.equal(w.__cad.project.buildPlaneEnabled,false);click('editBtn');$('pos2').value='-9';await apply();await wait(()=>w.__cad.model.parts[1].bounds.min[2]===-9);near(w.__cad.project.objects[1].placement[2],-9);
const positions=w.__cad.project.objects.map(o=>Array.from(o.position));$('buildPlane').click();await wait(()=>w.__cad.project.buildPlaneEnabled===true&&!$('buildPlane').disabled);await wait(()=>w.__cad.model.bounds.min[2]===0);for(let i=0;i<2;i++)near(w.__cad.project.objects[i].position[2]-positions[i][2],9);click('undo');await wait(()=>w.__cad.project.buildPlaneEnabled===false&&w.__cad.model.bounds.min[2]===-9);click('redo');await wait(()=>w.__cad.project.buildPlaneEnabled===true&&w.__cad.model.bounds.min[2]===0);
click('projectMenu');click('backupProject');const backed=JSON.parse(Buffer.concat(w.testSaved.chunks.map(x=>Buffer.from(x,'base64'))));assert.equal(backed.buildPlaneEnabled,true);assert.equal(backed.objects.length,2);assert.equal(backed.objects.some(o=>o.type==='plane'),false);click('closeSheet');await new Promise(r=>setTimeout(r,450));assert.equal(JSON.parse(w.localStorage.getItem('tristancad.autosave')).buildPlaneEnabled,true);
// Legacy projects retain their existing coordinate frame and stay unrestricted.
w.__cad.load({...blank(),objects:[legacyBox]});await wait(()=>w.__cad.model.parts[0]?.id===legacyBox.id);assert.equal($('buildPlane').checked,false);near(w.__cad.model.bounds.min[2],-11);click('editBtn');near(Number($('pos2').value),-8);click('closeSheet');
// Drag a grounded box through the plane: movement and bottom-face stretching stop
// at Z=0 immediately, while an unrestricted move is allowed below it.
w.__cad.load({...blank(),buildPlaneEnabled:true,objects:[place(object('box',{w:30,d:30,h:10}))]});await wait(()=>w.__cad.model.parts[0]?.id===w.__cad.project.objects[0].id&&w.__cad.model.bounds.min[2]===0);click('fit');const tool=w.__cad.touch,canvas=$('scene');
const pointer=(type,at)=>{const e=new w.MouseEvent(type,{bubbles:true,clientX:at[0],clientY:at[1]});Object.defineProperty(e,'pointerId',{value:1});canvas.dispatchEvent(e);};
const drag=(point,dy)=>{const at=tool.pointScreen(point);pointer('pointerdown',at);pointer('pointermove',[at[0],at[1]+dy]);assert.equal(tool.isDragging(),true);return [at[0],at[1]+dy];};
tool.setMode('move');w.document.querySelector('[data-axis="Z"]').click();if(tool.getState().snap)click('snapStatus');let end=drag([0,0,5],160);near(w.__cad.project.objects[0].placement[2],0);assert.ok($('liveMeasure').textContent.includes('Z 0.00'));pointer('pointerup',end);await wait(()=>!tool.isCommitting());near(w.__cad.model.bounds.min[2],0);
$('buildPlane').click();end=drag([0,0,5],80);assert.ok(w.__cad.project.objects[0].placement[2]<0);pointer('pointerup',end);await wait(()=>!tool.isCommitting()&&w.__cad.model.bounds.min[2]<0);$('buildPlane').click();await wait(()=>w.__cad.project.buildPlaneEnabled&&w.__cad.model.bounds.min[2]===0);tool.setMode('stretch');tool.selectFace(w.__cad.project.objects[0].id,0);const part=w.__cad.model.parts[0],bottomFace=part.topology.faces.find(f=>f.normal[2]<-.9);assert.ok(bottomFace);const obj=w.__cad.project.objects[0],world=bottomFace.center.map((v,i)=>v+obj.position[i]);end=drag(world,80);near(w.__cad.project.objects[0].params.h,.05);pointer('pointerup',end);await wait(()=>!tool.isCommitting());near(w.__cad.model.bounds.min[2],0);tool.selectFace(w.__cad.project.objects[0].id,bottomFace.index);click('stretchSize');$('exactSize').value='20';click('applySize');await wait(()=>$('sheet').hidden&&w.__cad.model.bounds.max[2]===20);near(w.__cad.model.bounds.min[2],0);
assert.deepEqual(uiErrors,[]);console.log('PASS: new object/duplicate origin drafts regardless of selection/snap, Apply-only creation, Imperial default screw/tube panels, bottom-center edits and sizing, plane On/Off, assembly-preserving enable, Undo/Redo, backups/autosave, legacy projects, immediate Z drag limits, face shrinking and exact bottom-face growth above the floor.');runtime.destroy();dom.window.close();
