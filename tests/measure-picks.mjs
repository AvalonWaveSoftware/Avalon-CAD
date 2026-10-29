import assert from 'node:assert/strict';
import {harness} from './ui-harness.mjs';
import {blank,object} from '../web/templates.mjs';
const h=await harness(),u=await h.boot(),p=blank();
p.objects=[object('box',{w:30,d:20,h:10},[-40,0,5]),object('box',{w:30,d:20,h:10},[40,0,5])];
u.w.__cad.load(p);await u.wait(()=>u.w.__cad.model?.parts?.length===2,'two boxes');
const before=JSON.stringify(u.w.__cad.project),history=u.w.__cad.historyLength,selected=u.w.__cad.selected;
const a=u.tool.measureCenters()[0],xy=u.tool.pointScreen(a);
const snap=u.tool.measurePick({clientX:xy[0]+21,clientY:xy[1]},'point');assert.ok(snap);assert.ok(u.tool.measureCenters().some(p=>p.every((v,i)=>v===snap.point[i])),'snap uses marked centers at 21 px');
let picks=0;u.tool.measureHandler(()=>picks++);const canvas=u.$('scene');
for(const world of [[-40,0,5],[40,0,5]]){const [x,y]=u.tool.pointScreen(world);for(const type of ['pointerdown','pointerup']){const e=new u.w.MouseEvent(type,{clientX:x,clientY:y,bubbles:true});Object.defineProperties(e,{pointerId:{value:1},pointerType:{value:'touch'}});canvas.dispatchEvent(e);}}
assert.equal(picks,2);assert.equal(JSON.stringify(u.w.__cad.project),before);assert.equal(u.w.__cad.historyLength,history);assert.equal(u.w.__cad.selected,selected);u.tool.measureHandler(null);assert.deepEqual(u.errors,[]);u.close();console.log('PASS measure picks: 7 assertions; 44 px center target, two taps, no selection/history/project writes');
