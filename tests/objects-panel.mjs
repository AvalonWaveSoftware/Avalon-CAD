import assert from 'node:assert/strict';
import {harness} from './ui-harness.mjs';
// ADR criteria 1, 4-16 (Objects panel, multi-select, Merge) and the no-rebuild-on-select requirement.
const H=await harness(),U=await H.boot(),{w,$,click,q,qa,wait,count,tool}=U;let checks=0;
const box=(id,w2,d,h,position=[0,0,0],layerId='layer-1',mode='solid',enabled=true)=>({id,name:id,type:'box',params:{w:w2,d,h},position,rotation:[0,0,0],mode,enabled,layerId});
const layers=[{id:'layer-1',name:'Layer 1'},{id:'layer-2',name:'Layer 2'}];
const start={format:'tristancad',version:2,name:'Panel',layers,activeLayer:'layer-1',buildPlaneEnabled:false,objects:[box('A',20,20,10),box('B',20,20,10,[10,0,0]),box('hole',4,4,30,[-5,0,0],'layer-1','cut'),box('C',10,10,10,[40,0,0]),box('D',10,10,10,[0,30,0],'layer-2'),box('E',4,4,30,[0,30,0],'layer-2','cut'),box('F',5,5,5,[30,30,0],'layer-2','solid',false)]};
const ctrl=(el,extra={})=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true,ctrlKey:true,...extra}));
const row=id=>q(`[data-row="${id}"]`),selectedRows=()=>qa('#objectsList [data-row].selected').map(r=>r.dataset.row).sort();
const rowsMatch=()=>{const p=w.__cad.project,expected=Array.from(p.layers.flatMap(l=>p.objects.filter(o=>(o.layerId||'layer-1')===l.id).map(o=>o.id)));// Array.from: Undo snapshots are window-realm arrays in the jsdom harness
assert.deepEqual(qa('#objectsList [data-row]').map(r=>r.dataset.row),expected);for(const o of p.objects)assert.ok(row(o.id).querySelector('.rowmain').textContent.startsWith(o.name));};
function tapScreen(point,mods={}){const at=tool.pointScreen(point);for(const type of ['pointerdown','pointerup']){const ev=new w.MouseEvent(type,{clientX:at[0],clientY:at[1],bubbles:true,cancelable:true,...mods});Object.defineProperty(ev,'pointerId',{value:1});Object.defineProperty(ev,'pointerType',{value:'mouse'});$('scene').dispatchEvent(ev);}}
w.__cad.load(start);await wait(()=>w.__cad.model.parts.length===6,'load');
// 1: four modes (F6: Round reads 'Edge ▾', Master Chief ruling 1), three dock buttons, no Objects dock button.
assert.deepEqual(qa('#touchModes button[data-mode]').map(b=>b.textContent),['Select','Move','Stretch','Edge ▾','Mirror']);assert.deepEqual(qa('nav.dock button').map(b=>b.id),['addBtn','editBtn','exportBtn']);assert.equal($('objectsBtn'),null);checks++;
// 4: toggle overlays the viewport, shows the count, starts closed; panel state is never saved.
assert.equal($('objectsToggle').parentElement.id,'viewport');assert.equal($('objectCount').textContent,'7');assert.equal($('objectsPanel').hidden,true);assert.equal($('objectsToggle').getAttribute('aria-expanded'),'false');
for(const mode of ['move','stretch','round','select']){tool.setMode(mode);assert.equal($('objectsToggle').hidden,false);}checks++;
// 5 + no rebuild: open/close the panel without resizing the canvas or posting a preview.
let previews=count('preview'),history=w.__cad.historyLength;const resizes=U.resizes.count;
click('objectsToggle');assert.equal($('objectsPanel').hidden,false);assert.equal($('objectsToggle').getAttribute('aria-expanded'),'true');assert.ok(q('#objectsPanel .panelhead').textContent.startsWith('Objects'));assert.equal(U.resizes.count,resizes);
click('objectsToggle');assert.equal($('objectsPanel').hidden,true);click('objectsToggle');assert.equal(count('preview'),previews);assert.equal(JSON.stringify(Object.keys(w.localStorage)).includes('panel'),false);checks++;
// 6 + 7: layer groups in layer order, top-level rows only, badges, eye and properties.
assert.deepEqual(qa('#objectsList .layerhead b').map(b=>b.textContent),['Layer 1','Layer 2']);rowsMatch();assert.equal(qa('#objectsList [aria-expanded]').length,0);
assert.equal(row('A').querySelector('.badge').textContent,'＋ Add');assert.equal(row('hole').querySelector('.badge').textContent,'− Subtract');assert.ok(row('F').classList.contains('hiddenobj'));
for(const o of start.objects){assert.ok(row(o.id).querySelector('[data-eye]'));assert.ok(row(o.id).querySelector('[data-props]').getAttribute('aria-label').includes(o.name));assert.equal(row(o.id).getAttribute('role'),'treeitem');}checks++;
// 8: row click selects, highlights and labels, with no preview and no history entry.
row('B').querySelector('.rowmain').click();assert.equal(w.__cad.selected,'B');assert.ok($('selectionLabel').textContent.startsWith('B ·'));assert.deepEqual(selectedRows(),['B']);assert.equal(tool.getState().wholeHighlighted,true);assert.equal(count('preview'),previews);assert.equal(w.__cad.historyLength,history);checks++;
// 9: viewport tap highlights and scrolls the row; Clear removes the highlight.
tapScreen([40,0,5]);assert.equal(w.__cad.selected,'C');assert.deepEqual(selectedRows(),['C']);assert.equal(U.scrolled.at(-1),'C');click('deselectBtn');assert.deepEqual(selectedRows(),[]);
// 24 + 9: Ctrl/Shift-click rows builds one shared multi-selection; additive viewport taps highlight rows.
ctrl(row('A').querySelector('.rowmain'));ctrl(row('B').querySelector('.rowmain'),{ctrlKey:false,shiftKey:true});assert.deepEqual(Array.from(tool.getState().multi),['A','B']);assert.deepEqual(selectedRows(),['A','B']);assert.deepEqual([...tool.getState().highlighted].sort(),['A','B']);
tapScreen([40,0,5],{ctrlKey:true});assert.deepEqual(Array.from(tool.getState().multi),['A','B','C']);assert.deepEqual(selectedRows(),['A','B','C']);assert.equal($('selectionLabel').textContent,'3 objects selected');assert.ok(row('C').classList.contains('primary'));
// Long-press on a row toggles it in; the click that ends the press is ignored.
row('D').querySelector('.rowmain').dispatchEvent(new w.MouseEvent('pointerdown',{bubbles:true}));await new Promise(r=>setTimeout(r,520));row('D').querySelector('.rowmain').click();assert.deepEqual(Array.from(tool.getState().multi),['A','B','C','D']);ctrl(row('D').querySelector('.rowmain'));assert.deepEqual(Array.from(tool.getState().multi),['A','B','C']);
// 25 + 13: action bar and Merge button with 2+ selected; hidden with 0 or 1.
assert.equal($('objectsActions').hidden,false);assert.deepEqual(qa('#objectsActions button').map(b=>b.textContent),['Merge','Create Prefab']);assert.equal($('mergeBtn').hidden,false);
assert.equal(count('preview'),previews);assert.equal(w.__cad.historyLength,history);checks++;
row('A').querySelector('.rowmain').click();assert.deepEqual(Array.from(tool.getState().multi),[]);assert.equal($('mergeBtn').hidden,true);assert.equal($('objectsActions').hidden,true);click('deselectBtn');assert.equal($('mergeBtn').hidden,true);checks++;
// 10: properties opens Edit for that object without a preview.
row('B').querySelector('[data-props]').click();assert.equal($('sheet').hidden,false);assert.equal($('objectName').value,'B');assert.equal($('p_w').value,'20');assert.equal(count('preview'),previews);assert.equal(w.__cad.historyLength,history);click('closeSheet');checks++;
// 11: eye hides/shows with one preview and one undo step each.
let volume=w.__cad.model.volume;row('C').querySelector('[data-eye]').click();assert.equal(w.__cad.project.objects.find(o=>o.id==='C').enabled,false);assert.equal(count('preview'),previews+1);assert.equal(w.__cad.historyLength,history+1);await wait(()=>w.__cad.model.volume===volume-1000,'hide');assert.ok(row('C').classList.contains('hiddenobj'));
click('undo');await wait(()=>w.__cad.model.volume===volume,'undo hide');assert.equal(w.__cad.project.objects.find(o=>o.id==='C').enabled,true);assert.ok(!row('C').classList.contains('hiddenobj'));previews=count('preview');history=w.__cad.historyLength;checks++;
// 16: Merge refuses cutouts, other layers and hidden shapes.
ctrl(row('A').querySelector('.rowmain'));ctrl(row('hole').querySelector('.rowmain'));click('objectsMerge');assert.ok($('toast').textContent.includes('cutouts already subtract'));assert.equal($('sheet').hidden,true);
click('deselectBtn');ctrl(row('A').querySelector('.rowmain'));ctrl(row('D').querySelector('.rowmain'));click('mergeBtn');assert.ok($('toast').textContent.includes('same layer'));
click('deselectBtn');ctrl(row('D').querySelector('.rowmain'));ctrl(row('F').querySelector('.rowmain'));click('mergeBtn');assert.ok($('toast').textContent.includes('visible'));assert.equal(count('preview'),previews);checks++;
// 14: merging two overlapping boxes gives one joined object with the union volume; Undo restores both.
click('deselectBtn');ctrl(row('A').querySelector('.rowmain'));ctrl(row('B').querySelector('.rowmain'));click('objectsMerge');assert.equal($('sheetTitle').textContent,'Merge shapes');assert.equal($('preserveCuts').checked,false);$('preserveCuts').checked=true;click('confirmMerge');
await wait(()=>$('sheet').hidden&&w.__cad.project.objects.some(o=>o.type==='joined'),'merge');await wait(()=>w.__cad.model.parts.length===4,'merged model');assert.ok(!w.__cad.project.objects.some(o=>o.id==='hole'),'a cutout only cutting the merged pieces is baked in');
const merged=w.__cad.project.objects.find(o=>o.type==='joined');assert.equal(merged.params.operation,'add');assert.equal(merged.name,'Merged solid');assert.ok(Math.abs(w.__cad.model.volume-volume)<1e-6);assert.equal(w.__cad.selected,merged.id);assert.equal(w.__cad.project.objects.indexOf(merged),0);rowsMatch();assert.deepEqual(selectedRows(),[merged.id]);
click('undo');await wait(()=>w.__cad.project.objects.some(o=>o.id==='A')&&w.__cad.project.objects.some(o=>o.id==='B')&&w.__cad.model.parts.length===6,'undo merge');rowsMatch();assert.deepEqual(Array.from(tool.getState().multi),['A','B']);assert.deepEqual(selectedRows(),['A','B']);
click('redo');await wait(()=>w.__cad.project.objects.some(o=>o.type==='joined')&&w.__cad.model.parts.length===4,'redo merge');rowsMatch();click('undo');await wait(()=>w.__cad.model.parts.length===6);checks++;
// 15: separated pieces fail unless connecting bars are enabled.
click('deselectBtn');ctrl(row('A').querySelector('.rowmain'));ctrl(row('C').querySelector('.rowmain'));click('mergeBtn');click('confirmMerge');await wait(()=>$('mergeError').textContent.includes('separated'),'separated');$('addBridge').checked=true;click('confirmMerge');await wait(()=>$('sheet').hidden&&w.__cad.project.objects.some(o=>o.type==='joined'),'bridge merge');click('undo');await wait(()=>w.__cad.model.parts.length===6);checks++;
// 12: the panel stays current after add, rename, mode and layer change, delete, undo, redo and load.
click('addBtn');q('[data-shape="cylinder"]').click();click('applyObject');await wait(()=>w.__cad.project.objects.length===8&&$('sheet').hidden,'add');rowsMatch();const added=w.__cad.project.objects.at(-1);
row(added.id).querySelector('[data-props]').click();$('objectName').value='Renamed';$('mode').value='cut';$('objectLayer').value='layer-2';click('applyObject');await wait(()=>w.__cad.project.objects.find(o=>o.id===added.id).name==='Renamed'&&$('sheet').hidden,'edit');rowsMatch();assert.equal(row(added.id).querySelector('.badge').textContent,'− Subtract');assert.equal(row(added.id).previousElementSibling.dataset.row,'F');
row(added.id).querySelector('[data-props]').click();click('deleteObject');await wait(()=>w.__cad.project.objects.length===7);rowsMatch();click('undo');await wait(()=>w.__cad.project.objects.length===8);rowsMatch();click('redo');await wait(()=>w.__cad.project.objects.length===7);rowsMatch();
w.__cad.load({...start,objects:start.objects.slice(0,3)});await wait(()=>w.__cad.model.parts.length===3);rowsMatch();assert.equal($('objectCount').textContent,'3');
// A tap inside the panel never reaches the viewport; Android Back closes the panel.
let viewportHits=0;$('viewport').addEventListener('pointerdown',()=>viewportHits++);$('scene').addEventListener('pointerdown',()=>viewportHits++);row('A').querySelector('.rowmain').dispatchEvent(new w.MouseEvent('pointerdown',{bubbles:true}));row('A').querySelector('.rowmain').dispatchEvent(new w.MouseEvent('pointerup',{bubbles:true}));assert.equal(viewportHits,0);
assert.equal(w.handleBack(),true);assert.equal($('objectsPanel').hidden,true);assert.equal(w.handleBack(),false);checks++;
// No rebuild on select, in total: count every preview over a burst of selection work.
previews=count('preview');click('objectsToggle');for(let i=0;i<5;i++){row('A').querySelector('.rowmain').click();ctrl(row('B').querySelector('.rowmain'));tapScreen([0,0,5]);click('deselectBtn');}tool.setMulti(['A','B']);tool.toggleMulti('A');click('objectsToggle');click('objectsToggle');assert.equal(count('preview'),previews);checks++;
// 4: after a reload the panel is closed again and the migrated autosave loads.
await new Promise(r=>setTimeout(r,450));const reload=await H.boot({'tristancad.autosave':w.localStorage.getItem('tristancad.autosave')});assert.equal(reload.$('objectsPanel').hidden,true);assert.equal(reload.$('objectCount').textContent,'3');assert.equal(reload.errors.length,0);reload.close();
// v1 autosave: migrated on load, original kept as a backup until the first save, one toast for fallbacks.
const legacy={format:'tristancad',version:1,name:'Old',objects:[box('t',20,20,10),{id:'r',name:'Old result',type:'joined',mode:'solid',enabled:true,layerId:'layer-1',position:[0,0,0],rotation:[0,0,0],fillets:[{edges:[0],radius:.5}],params:{operation:'subtract',children:[{...box('t2',20,20,10,[40,0,0]),sourceMode:'solid'},{...box('c2',4,4,20,[40,0,0]),mode:'cut',sourceMode:'solid'}]}}]};
const old=await H.boot({'tristancad.autosave':JSON.stringify(legacy)});await old.wait(()=>old.w.__cad.model.parts.length===2,'legacy');assert.equal(old.w.__cad.project.version,2);assert.ok(old.$('toast').textContent.includes('kept as a combined object'));assert.equal(JSON.parse(old.w.localStorage.getItem('tristancad.autosave.v1-backup')).version,1);
old.click('projectMenu');old.click('saveProject');assert.equal(old.w.localStorage.getItem('tristancad.autosave.v1-backup'),null);await new Promise(r=>setTimeout(r,450));assert.equal(JSON.parse(old.w.localStorage.getItem('tristancad.autosave')).version,2);assert.equal(old.errors.length,0);old.close();checks++;
assert.equal(U.errors.length,0,U.errors.join('\n'));
console.log('PASS:',checks,'Objects panel cases: four modes and three dock buttons, closed-by-default overlay toggle with count, layer-grouped top-level rows with Add/Subtract badges, eye and properties, two-way row/viewport selection and scrolling, Ctrl/Shift/long-press multi-select, action bar, Merge visibility/refusals/union/bridges/Undo/Redo, freshness after edits and loads, pointer isolation, Android Back, zero previews for selection work, reload and v1 autosave migration.');
U.close();H.runtime.destroy();
