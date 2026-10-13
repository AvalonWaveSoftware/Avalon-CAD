import assert from 'node:assert/strict';
import {harness} from './ui-harness.mjs';
import {replaceWithInstance,makePrefab} from '../web/prefabs.mjs';
import {PREFAB_DEFAULTS} from '../web/prefabs-ui.mjs';
// ADR Addendum A, criteria 24-34: Create Prefab from a multi-selection in the Objects panel.
const H=await harness(),U=await H.boot(),{w,$,click,q,qa,wait,count,tool}=U;let checks=0;
const box=(id,w2,d,h,position=[0,0,0],layerId='layer-1',mode='solid',enabled=true)=>({id,name:id,type:'box',params:{w:w2,d,h},position,rotation:[0,0,0],mode,enabled,layerId});
const layers=[{id:'layer-1',name:'Layer 1'},{id:'layer-2',name:'Layer 2'},{id:'layer-3',name:'Unused'}];
// outCut is an unselected Layer-1 cutout that cuts member A and the unselected X.
const start={format:'tristancad',version:2,name:'Prefab source',layers,activeLayer:'layer-1',buildPlaneEnabled:false,objects:[
 box('X',10,10,10,[-5,22,0]),box('A',20,20,10),box('B',10,10,10,[14,0,0]),{...box('outCut',4,40,30,[-5,10,0],'layer-1','cut')},
 box('D',10,10,10,[0,0,20],'layer-2'),box('Dcut',4,4,30,[0,0,20],'layer-2','cut'),box('Hidden',5,5,5,[30,0,20],'layer-2','solid',false),{...box('Y',6,6,6,[40,0,0]),excludedCutouts:['Dcut']}]};
const ids=o=>w.__cad.project.objects.map(x=>x.id),library=()=>JSON.parse(w.localStorage.getItem('tristancad.prefabs')||'[]');
const exportSTL=async()=>{const r=await w.__cad.request('export',{project:structuredClone(w.__cad.project),tolerance:.01,ground:false});return {triangles:r.triangles,volume:r.volume,bounds:r.bounds};};
function sameGeometry(a,b,label){assert.ok(Math.abs(a.volume-b.volume)<=1e-6*Math.max(1,b.volume),`${label} volume ${a.volume} vs ${b.volume}`);for(const k of ['min','max'])for(let i=0;i<3;i++)assert.ok(Math.abs(a.bounds[k][i]-b.bounds[k][i])<=1e-6,label+' bounds');}
assert.deepEqual(PREFAB_DEFAULTS,{replaceSelection:true,bakeOutsideCutouts:true});
w.__cad.load(start);await wait(()=>w.__cad.model.parts.length===7,'load');click('objectsToggle');
const before={volume:w.__cad.model.volume,bounds:structuredClone(w.__cad.model.bounds)},beforeSTL=await exportSTL(),beforeProject=JSON.stringify(w.__cad.project);
// 24 + 25: build the selection in the panel; the action bar shows Merge and Create Prefab.
const ctrl=id=>q(`[data-row="${id}"] .rowmain`).dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true,ctrlKey:true}));
click('deselectBtn');for(const id of ['B','D','Dcut','Hidden','A'])ctrl(id);assert.deepEqual(Array.from(tool.getState().multi),['B','D','Dcut','Hidden','A']);assert.equal($('objectsActions').hidden,false);assert.equal($('objectsPrefab').textContent,'Create Prefab');checks++;
// 26: the existing Save prefab sheet with source "N objects selected"; empty names are rejected.
let checksPosted=count('check'),previews=count('preview');click('objectsPrefab');assert.equal($('sheetTitle').textContent,'Save prefab');assert.equal($('prefabSource').value,'selection');assert.equal(q('#prefabSource option[value="selection"]').textContent,'5 objects selected');assert.equal($('prefabName').value,'Prefab 1');
assert.equal($('prefabReplace').checked,true);assert.equal($('prefabBake').checked,true);assert.equal($('prefabHiddenNote').textContent,'1 hidden object not included.');assert.equal($('prefabOutsideNote').textContent,'1 other cutout also cuts these objects.');
$('prefabName').value='   ';click('savePrefab');assert.equal($('prefabError').textContent,'Enter a prefab name.');assert.equal(count('check'),checksPosted);
// 29: bake off warns before confirming; bake on clears the warning.
$('prefabBake').checked=false;$('prefabBake').dispatchEvent(new w.Event('change'));assert.ok($('prefabBakeWarning').textContent.startsWith('Geometry will change: 1 outside cutout'));$('prefabBake').checked=true;$('prefabBake').dispatchEvent(new w.Event('change'));assert.equal($('prefabBakeWarning').textContent,'');
const longName='L'.repeat(70);$('prefabName').value=longName;click('savePrefab');
await wait(()=>$('sheet').hidden&&w.__cad.project.objects.some(o=>o.type==='prefab'),'create');await wait(()=>count('preview')===previews+1&&w.__cad.model.parts.some(p=>w.__cad.project.objects.find(o=>o.type==='prefab').id===p.id),'rebuilt');
// 32: exactly one check and one preview with replace on.
await new Promise(r=>setTimeout(r,200));assert.equal(count('check'),checksPosted+1);assert.equal(count('preview'),previews+1);checks++;
const instance=w.__cad.project.objects.find(o=>o.type==='prefab');assert.equal(instance.name.length,60);assert.equal(library().length,1);assert.equal(library()[0].name,'L'.repeat(60));assert.ok($('toast').textContent.startsWith('Prefab created. Undo restores the parts'));
// 27: members replaced in place by one selected instance on the primary's layer, with identical geometry.
assert.deepEqual(ids(),['X',instance.id,'outCut','Hidden','Y']);assert.equal(w.__cad.selected,instance.id);assert.equal(instance.layerId,'layer-1');assert.deepEqual(Array.from(instance.rotation),[0,0,0]);
sameGeometry(w.__cad.model,before,'replace');const afterSTL=await exportSTL();sameGeometry(afterSTL,beforeSTL,'STL');assert.equal(afterSTL.triangles,beforeSTL.triangles);checks++;
// 28: mixed layers kept inside the prefab (unused layers pruned); Layer-2 cutout stays on Layer 2.
assert.deepEqual(instance.params.layers.map(l=>l.id),['layer-1','layer-2']);const kids=instance.params.children;assert.equal(kids.length,5);assert.ok(kids.some(c=>c.mode==='cut'&&c.layerId==='layer-2'&&c.name==='Dcut'));assert.ok(kids.some(c=>c.mode==='cut'&&c.layerId==='layer-1'&&c.name==='outCut'));
const only=(p,keep)=>({...p,objects:p.objects.filter(keep)});
const l1=await w.__cad.request('check',{project:only(JSON.parse(beforeProject),o=>['A','B','outCut'].includes(o.id)),tolerance:.03}),inside=await w.__cad.request('check',{project:{...structuredClone(w.__cad.project),objects:[{...structuredClone(instance),params:{...structuredClone(instance.params),children:kids.filter(c=>c.layerId==='layer-1')}}]},tolerance:.03});assert.ok(Math.abs(l1.volume-inside.volume)<1e-6,'the Layer-2 cutout does not cut Layer-1 members');checks++;
// 29: the baked cutout reproduces geometry and the original still cuts X.
assert.ok(ids().includes('outCut'));assert.ok(instance.excludedCutouts.includes('outCut'));assert.ok(!w.__cad.project.objects.find(o=>o.id==='X').excludedCutouts);
// 30: hidden members are left out of the prefab and stay in the project.
assert.equal(w.__cad.project.objects.find(o=>o.id==='Hidden').enabled,false);assert.ok(!kids.some(c=>c.name==='Hidden'));
// Member ids are removed from other objects' exclusions.
assert.equal(w.__cad.project.objects.find(o=>o.id==='Y').excludedCutouts,undefined);checks++;
// 28: Ungroup restores pieces with identical geometry.
q(`[data-row="${instance.id}"] [data-props]`).click();click('explodeObject');await wait(()=>!w.__cad.project.objects.some(o=>o.type==='prefab')&&w.__cad.model.parts.length>=7,'ungroup');sameGeometry(w.__cad.model,before,'ungroup');click('undo');await wait(()=>w.__cad.project.objects.some(o=>o.type==='prefab')&&w.__cad.model.parts.length===4,'undo ungroup');
// 31: one Undo restores members, exclusions and the previous selection; Redo re-applies; the library entry stays.
click('undo');await wait(()=>ids().join()===JSON.parse(beforeProject).objects.map(o=>o.id).join()&&w.__cad.model.parts.length===7,'undo create');assert.equal(JSON.stringify(w.__cad.project.objects),JSON.stringify(JSON.parse(beforeProject).objects));assert.deepEqual(Array.from(tool.getState().multi),['B','D','Dcut','Hidden','A']);assert.equal(library().length,1);
qa('#objectsList [data-row].selected').map(r=>r.dataset.row).sort().forEach((id,i,a)=>assert.deepEqual(a,['A','B','D','Dcut','Hidden']));
click('redo');await wait(()=>w.__cad.project.objects.some(o=>o.type==='prefab'),'redo');assert.equal(w.__cad.selected,w.__cad.project.objects.find(o=>o.type==='prefab').id);checks++;
// 33: .tcad v2 save/reload keeps the instance, rendering identically without the library.
click('projectMenu');click('backupProject');const tcad=JSON.parse(Buffer.concat(w.testSaved.chunks.map(x=>Buffer.from(x,'base64'))));click('closeSheet');assert.equal(tcad.version,2);assert.ok(tcad.objects.some(o=>o.type==='prefab'));
const fresh=await H.boot({'tristancad.autosave':JSON.stringify(tcad)});await fresh.wait(()=>fresh.w.__cad.model.parts.length===4,'reload');assert.equal(fresh.w.localStorage.getItem('tristancad.prefabs'),null);sameGeometry(fresh.w.__cad.model,before,'reload');fresh.close();
// 32: with replace off, one check and no preview; the model is unchanged.
click('undo');await wait(()=>w.__cad.model.parts.length===7);const unchanged=JSON.stringify(w.__cad.project);checksPosted=count('check');previews=count('preview');click('objectsPrefab');$('prefabReplace').checked=false;$('prefabReplace').dispatchEvent(new w.Event('change'));assert.equal($('savePrefab').textContent,'Save prefab');click('savePrefab');await wait(()=>library().length===2,'library only');
await new Promise(r=>setTimeout(r,200));assert.equal(count('check'),checksPosted+1);assert.equal(count('preview'),previews);assert.equal(JSON.stringify(w.__cad.project),unchanged);click('closeSheet');checks++;
// Bake off really drops the outside cutout from the prefab (geometry changes as warned).
click('objectsPrefab');$('prefabBake').checked=false;$('prefabBake').dispatchEvent(new w.Event('change'));click('savePrefab');await wait(()=>w.__cad.project.objects.some(o=>o.type==='prefab'),'bake off');await wait(()=>count('preview')>previews);const noBake=w.__cad.project.objects.find(o=>o.type==='prefab');assert.ok(!noBake.params.children.some(c=>c.name==='outCut'));click('undo');await wait(()=>!w.__cad.project.objects.some(o=>o.type==='prefab')&&w.__cad.model.parts.length===7);checks++;
// 34: a selection with only cutouts is refused.
click('deselectBtn');ctrl('outCut');ctrl('Dcut');click('objectsPrefab');click('savePrefab');assert.ok($('prefabError').textContent.includes('needs solid material'));click('closeSheet');checks++;
// 33: a full 100-entry library shows the limit error and leaves the model unchanged.
const full=Array.from({length:100},(_,i)=>({...library()[0],id:'full-'+i}));const crowded=await H.boot({'tristancad.autosave':JSON.stringify(start),'tristancad.prefabs':JSON.stringify(full)});await crowded.wait(()=>crowded.w.__cad.model.parts.length===7);crowded.click('objectsToggle');crowded.click('deselectBtn');
for(const id of ['A','B'])crowded.q(`[data-row="${id}"] .rowmain`).dispatchEvent(new crowded.w.MouseEvent('click',{bubbles:true,ctrlKey:true}));const snap=JSON.stringify(crowded.w.__cad.project);crowded.click('objectsPrefab');crowded.click('savePrefab');await crowded.wait(()=>crowded.$('prefabError').textContent.includes('Maximum 100 saved prefabs'),'limit');assert.equal(JSON.stringify(crowded.w.__cad.project),snap);crowded.close();checks++;
// Pure replaceWithInstance contract.
{const p=structuredClone(start),record=makePrefab([p.objects[1],p.objects[2]],'Pure',{min:[-10,-10,-5],max:[19,10,5]},p.layers,{pruneLayers:true}),r=replaceWithInstance(p,['A','B'],record,{min:[-10,-10,-5],max:[19,10,5]},'layer-1');
 assert.deepEqual(r.project.objects.map(o=>o.id),['X',r.instance.id,'outCut','D','Dcut','Hidden','Y']);assert.deepEqual(r.instance.position,[4.5,0,0]);assert.deepEqual(r.instance.excludedCutouts,['outCut']);assert.deepEqual(record.object.params.layers.map(l=>l.id),['layer-1']);assert.equal(JSON.stringify(p),JSON.stringify(start));checks++;}
assert.equal(U.errors.length,0,U.errors.join('\n'));
console.log('PASS:',checks,'Create Prefab cases: panel multi-select and action bar, Save prefab sheet with selection source, name validation/truncation, replace-in-place with identical volume/bounds/STL, mixed and pruned layers, layer-local cutouts, Ungroup parity, baked outside cutouts and bake-off warning, hidden members, exclusion cleanup, one-step Undo/Redo with selection, one check + one preview (or zero previews), .tcad v2 reload without the library, cutout-only refusal and 100-entry limit.');
U.close();H.runtime.destroy();
