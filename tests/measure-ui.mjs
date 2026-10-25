// Node-only lifecycle test: stale worker replies must never re-open or redraw a closed tool.
import assert from 'node:assert/strict';import * as T from 'three';
import {fmtLen,unitLabel,setUnit} from '../web/units.mjs';
import {installMeasure,MEASURE_TEXT} from '../web/measure-tool.mjs';
const elements=new Map();const element=id=>({id,hidden:false,style:{},classList:{add(){},remove(){}},value:'point',textContent:'',innerHTML:''});
for(const id of ['measureBtn','measureMode','closeMeasure','measureResult'])elements.set(id,element(id));
globalThis.document={getElementById:id=>elements.get(id),createElement:()=>element('panel')};
let handler,modelClose,resolve,invalidates=0;
const scene=new T.Scene(),touch={measureHandler(fn,close){handler=fn;modelClose=close;},setMode(){},measureCenters:()=>[[0,0,0]],measurePick:e=>e.pick};
const canvas={parentElement:{append(p){elements.set('measurePanel',p);}}};
const tool=installMeasure({T,fmtLen,unitLabel,touch,scene,canvas,invalidate:()=>invalidates++,request:()=>new Promise(r=>resolve=r)});
tool.toggle();assert.equal(tool.active,true);assert.equal(elements.get('measurePanel').hidden,false);assert.ok(handler);await handler({pick:{point:[0,0,0]}});await handler({pick:{point:[3,4,0]}});assert.match(elements.get('measureResult').textContent,/5\.000000 mm/);assert.ok(scene.children[0].children.length>0);setUnit('in');tool.unitsChanged();assert.match(elements.get('measureResult').textContent,/0.197 in/);setUnit('mm');
assert.equal(tool.close(),true);assert.equal(tool.active,false);assert.equal(handler,null);assert.equal(scene.children[0].children.length,0);assert.equal(elements.get('measurePanel').hidden,true);assert.equal(tool.close(),false);
tool.toggle();elements.get('measureMode').value='object';elements.get('measureMode').onchange();await handler({pick:{point:[0,0,0],object:{}}});const pending=handler({pick:{point:[1,0,0],object:{}}});tool.close();const old=elements.get('measureResult').textContent;resolve({distance:100});await pending;assert.equal(elements.get('measureResult').textContent,old);assert.equal(scene.children[0].children.length,0);
tool.toggle();modelClose();assert.equal(tool.active,false);assert.ok(invalidates>0);assert.equal(MEASURE_TEXT.title,'Measure');console.log('PASS measure UI: 17 assertions; point readout, overlay disposal, stale replies, model invalidation');
