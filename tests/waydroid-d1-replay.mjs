// Waydroid QA 2026-10-25 D1 ('RuntimeError: null function' on Add Box until the app restarted). Replays the QA session
// (Android, in-worker OCCT, as web/worker.mjs localJob: preview with deferred hollows → computeShells → reset if
// trapped → re-run; Mirror and Apply run a check job): tube hollow closed → open top; torus 30/8 at X40 hollow 2;
// group; ring-rotate the tube, Undo; Mirror YZ in place, YZ with Copy; Add Box at X−45, Apply.
// Run 1 (clean): every job succeeds. Run 2: a wasm trap is injected into OCCT's MakeThickSolidByJoin (the open tube
// hollow, the step before D1). Before the fix hollowBrep turned the trap into the hollow message, so OCCT was never
// flagged nor reset and every later OCCT job ran on the trapped heap. Now the trap reaches the job unchanged, OCCT is
// flagged, reset before the next call, and the rest of the session (Add Box included) gives exactly the clean results.
//   node tests/waydroid-d1-replay.mjs
import assert from 'node:assert/strict';import fs from 'node:fs';
import * as R from 'replicad';
import {initKernel} from '../web/kernel.mjs';import {initLocalEngine} from '../web/local-engine.mjs';
import {objectTopology,occtNeedsReset,resetSolid,disposeSolidCache} from '../web/cad-solid.mjs';
import {deferShells,takeDeferredShells,computeShells,takeHollowLog} from '../web/shell-mesh.mjs';
import {object,blank,defaults} from '../web/templates.mjs';import {mirrorObject} from '../web/operations.mjs';
const K=await initKernel(),rust={binary:fs.readFileSync(new URL('../app/assets/mesh-core.wasm',import.meta.url))};
// Volume and triangle count per job (the vertex bytes of a cold first hollow differ in Manifold IDs between sessions).
const h=r=>r.error||r.volume.toFixed(4)+'/'+r.triangles.length/3;
async function session(inject){disposeSolidCache();takeHollowLog();const E=await initLocalEngine(K,{rust});
 let id=0,resets=0,trapAt=null;const log=[];
 const fresh=async()=>{if(occtNeedsReset()){resets++;await resetSolid();}};
 async function job(type,p){const data={id:++id,type,project:structuredClone(p),tolerance:.15};
  await fresh();deferShells(type==='preview');let r=E.process(data);const shells=takeDeferredShells();
  if(shells.length){await computeShells(shells,()=>false);if(occtNeedsReset()&&trapAt===null)trapAt=log.length;await fresh();r=E.process(data);}
  if(r.error&&/RuntimeError/.test(r.error)&&trapAt===null)trapAt=log.length;log.push(type+' '+h(r));return r;}
 let p={...blank(),version:3,objects:[]};const hist=[];const change=f=>{hist.push(structuredClone(p));f(p);return job('preview',p);};
 const tube=object('tube',{...defaults.tube},[0,0,10]);tube.id='tube';await change(p=>p.objects.push(tube));
 await change(p=>{p.objects[0].shell={thickness:1.5};});
 const top=objectTopology({...tube,shell:undefined}).faces.findIndex(f=>f.normal?.[2]>.999);
 const proto=R.getOC().BRepOffsetAPI_MakeThickSolid.prototype,real=proto.MakeThickSolidByJoin;
 if(inject)proto.MakeThickSolidByJoin=function(){proto.MakeThickSolidByJoin=real;throw new WebAssembly.RuntimeError('null function or function signature mismatch');};
 await change(p=>{p.objects[0].shell={thickness:1.5,open:[top]};});
 if(inject)assert.equal(proto.MakeThickSolidByJoin,real,'the injected trap ran');
 const torus=object('torus',{...defaults.torus},[40,0,4]);torus.id='torus';await change(p=>p.objects.push(torus));await change(p=>{p.objects[1].shell={thickness:2};});
 await change(p=>{p.groups=[{id:'g1',name:'Group 1'}];for(const o of p.objects)o.groupId='g1';});
 await change(p=>{p.objects[0].rotation=[0,0,15];});p=hist.pop();await job('preview',p);
 {const q=structuredClone(p);q.objects[0]=mirrorObject(q.objects[0],'YZ');await job('check',q);p=q;await job('preview',p);}
 {const q=structuredClone(p);const c=mirrorObject(q.objects[0],'YZ');c.id='copy';q.objects.push(c);await job('check',q);p=q;await job('preview',p);}
 {const q=structuredClone(p),b=object('box',{...defaults.box},[-45,0,7.5]);b.id='box';q.objects.push(b);await job('check',q);p=q;await job('preview',p);}
 return {log,resets,trapAt,hollows:takeHollowLog()};}
const clean=await session(false),trapped=await session(true);
assert.ok(clean.log.every(l=>!/RuntimeError|null function|could not/i.test(l)),'clean replay: '+clean.log.join(', '));
assert.equal(clean.resets,0);assert.equal(trapped.resets,1,'one OCCT reset after the injected trap');
assert.equal(trapped.trapAt,2,'the trap is seen at the open-top hollow, not masked as the hollow message');
// The step that trapped re-runs on the fresh OCCT inside the job (computeShells → reset → re-run), so even it matches.
assert.deepEqual(trapped.log,clean.log,'after the reset the whole session, Add Box included, gives the clean results');
assert.ok(clean.hollows.some(x=>x.engine==='occt'&&x.type==='torus'&&x.offset>=0&&x.mesh>=0),'hollow engine log with OCCT phases');
console.log(`waydroid-d1-replay: ${clean.log.length} jobs clean; injected trap at job ${trapped.trapAt} → 1 OCCT reset, identical results`);
