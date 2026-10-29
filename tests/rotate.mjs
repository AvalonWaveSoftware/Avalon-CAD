// ADR-0001 F3 (Rotate handles), §5.2: the rotation maths in web/operations.mjs (rotateAbout, snapAngle) and the preview
// budget (§4 F3 / §8: a rotate preview is a placement change: cache hit, no OCCT rebuild, ≤ 140 ms).
import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from 'three';
import {rotateAbout,snapAngle,ROTATE_SNAP,rotation,matrix,worldCenter} from '../web/operations.mjs';
import {object} from '../web/templates.mjs';
const near=(a,b,eps,what)=>a.forEach((v,i)=>assert.ok(Math.abs(v-b[i])<=eps,`${what}: ${a} vs ${b}`));
const rotM=o=>new T.Matrix4().makeRotationFromEuler(rotation(o)).elements;
let seed=0xf3f3;const rnd=()=>((seed=Math.imul(seed^seed>>>15,0x2c1b3c6d)+0x6d2b79f5>>>0)/4294967296);
// 1. Snap: every snapped angle is a whole multiple of 15°; Shift / Snap off (free) passes the angle through.
assert.equal(ROTATE_SNAP,15);
for(let i=0;i<2000;i++){const a=(rnd()-.5)*1440,s=snapAngle(a);assert.ok(Number.isInteger(s/15)&&!Object.is(s,-0),'snapped '+a+' -> '+s);assert.ok(Math.abs(s-a)<=7.5);assert.equal(snapAngle(a,true),a);}
assert.deepEqual([7.4,7.6,-7.6,22.4,-0.1,44.99].map(a=>snapAngle(a)),[0,15,-15,15,0,45]);
// 2. A snapped turn of an unrotated box stores exact multiples of 15° (no float noise, no -0), for every axis.
const box=()=>({...object('box',{w:30,d:20,h:10},[0,0,5]),rotation:[0,0,0]});
for(let axis=0;axis<3;axis++)for(let k=-12;k<=12;k++){const r=rotateAbout(box(),axis,k*15,[0,0,5]);
 r.rotation.forEach(v=>assert.ok(!Object.is(v,-0)&&Number.isInteger(v/15),`axis ${axis} ${k*15}°: rotation ${r.rotation}`));
 near(r.position,[0,0,5],0,'centre-pivot keeps the position');}
assert.deepEqual(rotateAbout(box(),2,45,[0,0,5]).rotation,[0,0,45]);assert.deepEqual(rotateAbout(box(),0,-90,[0,0,5]).rotation,[-90,0,0]);
// A free (Shift) turn keeps its exact angle.
assert.equal(rotateAbout(box(),2,37.3,[0,0,5]).rotation[2],37.3);
// 3. Position turns about the centre: a box 10 mm right of the pivot turned 90° about Z sits 10 mm above it.
{const o={...box(),position:[10,0,5]};const r=rotateAbout(o,2,90,[0,0,5]);near(r.position,[0,10,5],0,'90° about Z');assert.deepEqual(r.rotation,[0,0,90]);
 const r2=rotateAbout(o,0,180,[0,0,0]);near(r2.position,[10,0,-5],1e-12,'180° about X');}
// The selection centre stays put for an object whose centre is not its origin (a sketch with an off-centre outline, and a
// scaled one), for random orientations, axes, angles.
for(let i=0;i<300;i++){const o=object('polygon',{points:[[20,5],[40,5],[40,25],[25,30]],h:8},[rnd()*40-20,rnd()*40-20,rnd()*20]);o.rotation=[rnd()*360-180,rnd()*180-90,rnd()*360-180];if(i%3===0)o.scale=[1.5,.75,2];
 const c=worldCenter(o),r=rotateAbout(o,i%3,(rnd()-.5)*720,c);near(worldCenter(r),c,1e-9,'centre preserved');}
// 4. Euler conversion: the stored ZYX Euler of the result is Raxis·R, for random starts. Matrix within 1e-10: float noise
// is ~1e-15, and the tidy step may move an angle by < 1e-9° (≈ 2e-11 rad) onto a micro-degree.
for(let i=0;i<500;i++){const o={...box(),rotation:[rnd()*360-180,rnd()*180-90,rnd()*360-180]};const axis=i%3,deg=(rnd()-.5)*720;
 const n=new T.Vector3();n.setComponent(axis,1);const want=new T.Matrix4().makeRotationAxis(n,T.MathUtils.degToRad(deg)).multiply(new T.Matrix4().makeRotationFromEuler(rotation(o))).elements;
 near(rotM(rotateAbout(o,axis,deg,o.position)),want,1e-10,'Euler of Raxis·R');}
// Round trip: Euler -> quaternion -> Euler (a 0° turn) gives the same orientation and, away from gimbal lock, the same angles.
for(let i=0;i<500;i++){const o={...box(),rotation:[rnd()*340-170,rnd()*170-85,rnd()*340-170]};const r=rotateAbout(o,i%3,0,o.position);near(r.rotation,o.rotation,1e-9,'Euler round trip');near(rotM(r),rotM(o),1e-10,'round-trip matrix');}
// 5. §5.2: rotating 360° in 24 steps of 15° returns within 1e-9 (orientation, angles and position), about each axis, from
// an arbitrary start and an off-object pivot.
for(let axis=0;axis<3;axis++){const start={...box(),position:[5,-3,2],rotation:[10,20,30]};let o=start;for(let k=0;k<24;k++)o=rotateAbout(o,axis,15,[1,2,3]);
 near(o.position,start.position,1e-9,'24 steps position');near(o.rotation,start.rotation,1e-9,'24 steps angles');near(matrix(o).elements,matrix(start).elements,1e-9,'24 steps matrix');
 let back=start;for(let k=0;k<24;k++)back=rotateAbout(back,axis,-15,[1,2,3]);near(back.rotation,start.rotation,1e-9,'24 steps back');}
// Only rotation and position change; the input is not mutated.
{const o={...box(),position:[1,2,3],rotation:[0,0,0],fillets:[{edges:[0],radius:1}]};const before=JSON.stringify(o),r=rotateAbout(o,1,30,[0,0,0]);assert.equal(JSON.stringify(o),before);
 const strip=x=>{const {rotation,position,...rest}=x;return JSON.stringify(rest);};assert.equal(strip(r),strip(o));}
// 6. Preview budget: a rotate preview of a rounded (OCCT-filleted) part reuses the cached local solid (placement change only,
// no OCCT rebuild), ≤ 140 ms per preview (median), like a Move preview.
const {initKernel}=await import('../web/kernel.mjs'),{initLocalEngine}=await import('../web/local-engine.mjs'),{ENGINE_CACHE}=await import('../web/perf-flags.mjs');
if(ENGINE_CACHE){const K=await initKernel(),rt=await initLocalEngine(K,{rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}}),cache=rt.engineCache;
 const part={id:'fb',name:'fb',type:'cylinder',params:{diameter:30,h:15},position:[0,0,7.5],rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1',fillets:[{edges:[0,2],radius:2}],resolution:{mode:'tolerance',tolerance:.01}};
 const proj=o=>({format:'tristancad',version:2,name:'Rotate',objects:[o],layers:[{id:'layer-1',name:'Layer 1'}],activeLayer:'layer-1'});let id=0;
 const res=rt.process({id:++id,type:'preview',project:proj(part),tolerance:.15});assert.ok(!res.error,res.error);const builds=cache.stats.localBuilds,hits=cache.stats.localHits,times=[];
 for(let k=1;k<=12;k++){const o=rotateAbout(part,k%3,k*7.5,worldCenter(part)),t=performance.now(),r=rt.process({id:++id,type:'preview',project:proj(o),tolerance:.15});times.push(performance.now()-t);assert.ok(!r.error,r.error);}
 assert.equal(cache.stats.localBuilds,builds,'a rotate preview never rebuilds the local (OCCT) solid');assert.equal(cache.stats.localHits-hits,12,'every rotate preview is a placement-cache hit');
 times.sort((a,b)=>a-b);const median=times[6];console.log(`rotate preview (filleted cylinder): median ${median.toFixed(1)} ms, max ${times.at(-1).toFixed(1)} ms over 12; local builds +0, hits +12`);
 assert.ok(median<=140,'rotate preview median '+median+' ms > 140 ms');rt.destroy();}
console.log('PASS: rotate (F3): 15° snap, free Shift angle, centre pivot, ZYX Euler = Raxis·R, 24×15° round trip within 1e-9, preview is a placement-cache hit');
