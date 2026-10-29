import assert from 'node:assert/strict';
import {harness} from './ui-harness.mjs';
const H=await harness(),U=await H.boot(),{w,$,q,click,wait,tool}=U;
const p={format:'tristancad',version:2,name:'Groups',objects:Array.from({length:3},(_,i)=>({id:'o'+i,name:'Box '+i,type:'box',params:{w:4,d:4,h:4},position:[i*10,0,5],rotation:[0,0,0],enabled:true,mode:'solid'}))};
w.__cad.load(p);await wait(()=>w.__cad.model.parts.length===3);
tool.setMulti(['o0','o1']);const history=w.__cad.historyLength;
q('#touchAction button:last-child').click();await wait(()=>w.__cad.project.groups?.length===1);
assert.equal(w.__cad.historyLength,history+1);const gid=w.__cad.project.groups[0].id;
click('objectsToggle');q('[data-select="o0"]').click();assert.deepEqual(Array.from(w.__cad.selection()).sort(),['o0','o1']);assert.equal($('selectionLabel').textContent,'2 objects selected');
assert.equal($('bounds').textContent,'14.0 × 4.0 × 4.0 mm');
q(`[data-collapse="${gid}"]`).click();assert.equal(q('[data-select="o0"]'),null);q(`[data-collapse="${gid}"]`).click();
q(`[data-rename="${gid}"]`).click();await wait(()=>$('groupName'));$('groupName').value='Assembly';click('saveGroupName');assert.equal(w.__cad.project.groups[0].name,'Assembly');
q('[data-select="o0"]').dispatchEvent(new w.MouseEvent('dblclick',{bubbles:true}));assert.deepEqual(Array.from(w.__cad.selection()),['o0']);
q('[data-select="o0"]').click();tool.toggleMulti('o2');assert.equal(w.__cad.selection().length,3);tool.toggleMulti('o0');assert.deepEqual(Array.from(w.__cad.selection()),['o2']);
q('[data-select="o0"]').click();
const bases=structuredClone(w.__cad.project.objects),dragHistory=w.__cad.historyLength;
tool.setMode('move');q('[data-axis="X"]').click();
const at=tool.pointScreen([0,0,5]);
function pointer(type,x,y){const e=new w.MouseEvent(type,{clientX:x,clientY:y,bubbles:true,cancelable:true});Object.defineProperty(e,'pointerId',{value:1});Object.defineProperty(e,'pointerType',{value:'touch'});$('scene').dispatchEvent(e);}
pointer('pointerdown',...at);pointer('pointermove',at[0]+40,at[1]);pointer('pointerup',at[0]+40,at[1]);await wait(()=>!tool.isCommitting());
const delta=w.__cad.project.objects[0].position[0]-bases[0].position[0];assert.ok(delta>0);assert.ok(Math.abs(w.__cad.project.objects[1].position[0]-bases[1].position[0]-delta)<1e-10);assert.equal(w.__cad.project.objects[2].position[0],bases[2].position[0]);assert.equal(w.__cad.historyLength,dragHistory+1);
click('undo');await wait(()=>w.__cad.project.objects[0].position[0]===bases[0].position[0]);
tool.setMode('select');q('[data-select="o0"]').click();click('editBtn');await wait(()=>$('groupSelected'));$('pos0').value='8';click('applyObject');await wait(()=>$('sheet').hidden);assert.equal(w.__cad.project.objects[0].position[0],8);assert.equal(w.__cad.project.objects[1].position[0],18);click('undo');await wait(()=>w.__cad.project.objects[0].position[0]===0);
q('[data-select="o0"]').click();w.__cad.commands.run('duplicate');await wait(()=>w.__cad.project.objects.length===5);assert.equal(w.__cad.project.groups.length,2);assert.equal(w.__cad.selection().length,2);
// Native copy/paste events are also the Electron menu accelerators' route; text fields keep their normal behavior.
const clipboard=new Map(),clipboardData={setData:(k,v)=>clipboard.set(k,v),getData:k=>clipboard.get(k)||''};
function event(type){const e=new w.Event(type,{bubbles:true,cancelable:true});Object.defineProperty(e,'clipboardData',{value:clipboardData});w.document.dispatchEvent(e);return e;}
assert.equal(event('copy').defaultPrevented,true);assert.equal(event('paste').defaultPrevented,true);await wait(()=>w.__cad.project.objects.length===7);assert.equal(w.__cad.project.groups.length,3);
let h=w.__cad.historyLength;w.__cad.commands.run('delete');await wait(()=>w.__cad.project.objects.length===5);assert.equal(w.__cad.historyLength,h+1);assert.equal(w.__cad.project.groups.length,2);click('undo');await wait(()=>w.__cad.project.objects.length===7);click('redo');await wait(()=>w.__cad.project.objects.length===5);
q('[data-select="o0"]').click();w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'G',ctrlKey:true,shiftKey:true,bubbles:true,cancelable:true}));await wait(()=>w.__cad.project.groups.length===1);assert.equal(w.__cad.project.objects[0].groupId,undefined);
assert.deepEqual(U.errors,[]);
// Real cached Python/Rust preview: 100 members, warmed geometry, five placements.
const many={...p,groups:[{id:'all',name:'Group'}],objects:Array.from({length:100},(_,i)=>({...p.objects[0],id:'b'+i,groupId:'all',position:[i*6,0,5]}))};
H.runtime.process({id:500,type:'preview',project:many,tolerance:.15});
const builds=H.runtime.engineCache.stats.localBuilds,times=[];
for(let i=0;i<5;i++){for(const o of many.objects)o.position[0]+=1;const start=performance.now();const r=H.runtime.process({id:501+i,type:'preview',project:many,tolerance:.15});times.push(performance.now()-start);assert.equal(r.parts.length,100);}
assert.equal(H.runtime.engineCache.stats.localBuilds,builds,'placement changes reuse geometry');
console.log('100-member cached preview ms:',times.map(t=>t.toFixed(2)).join(', '),'local builds during moves:',H.runtime.engineCache.stats.localBuilds-builds);
assert.ok(Math.max(...times)<=140,'100-member preview cadence');
console.log('PASS groups UI: 14 flows (group, selection, bounds, collapse, rename, member drill-in, additive selection, drag, numeric move, duplicate, clipboard, delete, undo/redo, ungroup) at 412px.');
U.close();H.runtime.destroy();
