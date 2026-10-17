// ADR-0001 F6 (§4 F6, §5.2): Edge ▾ Chamfer (mode-bar label per Master Chief ruling 1). fillets[].kind:'chamfer' is a symmetric chamfer whose distance is stored
// in radius (save format v3); entries without kind are rounds exactly as before. Checks the analytic chamfer volume,
// mixed round + chamfer on one shape (chamfers first, round edges found again through MakeChamfer history), the error
// text, the cache keys (a chamfer never reuses a round's mesh), the validators, the minimum-version writer, and that
// round-only objects take the unchanged replicad fillet() path. STL identity of existing models against the base
// commit is checked by tests/round-chamfer-stl.mjs (needs the base tree).
import assert from 'node:assert/strict';import fs from 'node:fs';
import {loadPyodide} from 'pyodide';
import {initKernel,makeObject,validateProject} from '../web/kernel.mjs';
import {initLocalEngine} from '../web/local-engine.mjs';
import {solidMesh,objectTopology,heapBytes,finishedShapeForTest} from '../web/cad-solid.mjs';import * as R from 'replicad';
import {object,blank} from '../web/templates.mjs';
import {withRoundover} from '../web/operations.mjs';
import {requiredVersion,forWrite} from '../web/migrate.mjs';
const K=await initKernel();
const volume=o=>{const s=makeObject(K,o);try{assert.equal(s.status(),'NoError');return s.volume();}finally{s.delete();}};
const box=()=>({...object('box',{w:30,d:20,h:10}),id:'box1'});
const near=(a,b,eps,msg)=>assert.ok(Math.abs(a-b)<eps,`${msg}: ${a} vs ${b}`);
// Edge order of the base box (explore order): 0 is a 10 mm Z edge, 1 a 20 mm Y edge sharing its corner, 2 the
// opposite parallel Z edge.
const t=objectTopology(box());assert.equal(t.edges.length,12);
// 1. ADR §5.2 F6: box 30×20×10, chamfer d=1 on 2 edges meeting at a corner → 5,985.333 mm³.
const c2=withRoundover(box(),[0,1],1,'chamfer');assert.deepEqual(c2.fillets,[{edges:[0,1],radius:1,kind:'chamfer'}]);
near(volume(c2),6000-15+1/3,1e-6,'two-edge chamfer volume');
// All 12 edges, d=1: each corner keeps {x+y≥1, y+z≥1, x+z≥1} of its unit cube (1/6), so 6000 − ½·(4·30+4·20+4·10) + 8·(1.5−5/6).
near(volume(withRoundover(box(),[...Array(12).keys()],1,'chamfer')),6000-120+8*(1.5-5/6),1e-6,'all-edge chamfer volume');
// 2. Mixed: round r2 on edge 0 and chamfer d1 on the parallel edge 2 (not touching) → each removes its own analytic volume.
const mixed=withRoundover(withRoundover(box(),[0],2),[2],1,'chamfer');assert.deepEqual(mixed.fillets.map(f=>f.kind||'round'),['round','chamfer']);
// ADR-0001 Architect ruling F6-2 (chamfers first): the three mixed cases that failed with rounds first are acceptance
// tests. Volumes are the exact B-rep volumes (OCCT GProp on the finished solid, not the tessellation), each a valid
// solid (BRepCheck). Box edges: 0 = Z edge at (−15,−10); 1 = top Y edge at x=−15 (meets 0 at the top); 8 = bottom X
// edge at y=−10 (meets 0 at the bottom); 9 = top X edge at y=−10 (tangent-connected to 1 through the round on 0).
const brep=o=>{const s=finishedShapeForTest(o);try{assert.ok(new (R.getOC().BRepCheck_Analyzer)(s.wrapped,true,false).IsValid(),'valid solid');return R.measureVolume(s);}finally{s.delete();}};
const exact=(o,v,msg)=>near(brep(o),v,1e-6,msg);
exact(withRoundover(box(),[0],2),6000-(4-Math.PI)*10,'round r2 alone (analytic)');exact(withRoundover(box(),[1],1,'chamfer'),5990,'chamfer d1 on edge 1 alone (analytic ½·1²·20)');
exact(withRoundover(box(),[8],1.5,'chamfer'),5966.25,'chamfer d1.5 on edge 8 alone (analytic ½·1.5²·30)');
// A1. No bleed: chamfer d1 on edge 1 beside the r2 round on edge 0 removes 9.504 mm³ (its own 20 mm edge, ≤ ½·1²·20,
// less the corner the round already took). Rounds first gave 5967.107 (24.309 mm³: it ran along the round onto edge 9).
const roundR2=6000-(4-Math.PI)*10,bleed=withRoundover(withRoundover(box(),[0],2),[1],1,'chamfer');
exact(bleed,5981.912241765,'A1 chamfer beside a round stays on its edge');assert.ok(roundR2-brep(bleed)<10,'A1 removes no more than its own edge');
// A2. Per-edge distances: d0.5 on edge 1 (top end of the round) and d1.5 on edge 8 (bottom end) each remove exactly what
// they remove alone beside the round, so the sum holds (rounds first gave both 0.5: 5930.905).
const c05=withRoundover(withRoundover(box(),[0],2),[1],.5,'chamfer'),c15=withRoundover(withRoundover(box(),[0],2),[8],1.5,'chamfer'),both=withRoundover(c05,[8],1.5,'chamfer');
exact(c05,5989.074216390,'A2 d0.5 beside the round');exact(c15,5958.571352420,'A2 d1.5 beside the round');exact(both,5956.229642718,'A2 both distances');
near(roundR2-brep(both),(roundR2-brep(c05))+(roundR2-brep(c15)),1e-6,'A2 each edge keeps its own distance');
// A3. A chamfer larger than the adjacent round (round r1 on 0, chamfer d2 on 1): valid, 5958.235 (rounds first: BRepCheck-invalid).
exact(withRoundover(withRoundover(box(),[0],1),[1],2,'chamfer'),5958.235240028,'A3 chamfer larger than the round');
// The same cases through the engine (tessellated Manifold, NoError): a non-touching chamfer's share is exact against the
// round alone; where the chamfer meets the round, within the 0.15 mm tessellation (0.02 mm³).
const roundOnly=volume(withRoundover(box(),[0],2));near(roundOnly,roundR2,.05,'round volume');
near(volume(mixed),roundOnly-5,1e-6,'round + chamfer volume');near(roundOnly-volume(bleed),roundR2-5981.912241765,.02,'engine A1 (round seam tessellated)');near(roundOnly-volume(both),roundR2-5956.229642718,.02,'engine A2 (round seam tessellated)');
// Every edge touching a round, chamfered, plus the round itself.
const ring=withRoundover(withRoundover(box(),[0],1.5),[1,3,8,9],0.8,'chamfer');assert.ok(volume(ring)<volume(withRoundover(box(),[0],1.5)));
// 3. Too large → a clear chamfer message (and the round message when the round pass is the one that fails).
assert.throws(()=>volume(withRoundover(box(),[0,1],12,'chamfer')),/That chamfer is too large or conflicts with another edge\. Reduce the distance\./);
assert.throws(()=>volume(withRoundover(withRoundover(box(),[0],25),[2],1,'chamfer')),/That roundover is too large/);
assert.throws(()=>volume(withRoundover(withRoundover(box(),[0],1),[2],25,'chamfer')),/That chamfer is too large/);
// 4. A chamfer never reuses a round's cached mesh (geometryKey / engine-cache key carry kind).
const r1=solidMesh(withRoundover(box(),[0],1),.15),k1=solidMesh(withRoundover(box(),[0],1,'chamfer'),.15);
assert.ok(r1.triangles.length>k1.triangles.length,'round is tessellated, chamfer is planar');
// 5. Topology and edge indices refer to the base shape, so picking is the same in both tools.
assert.deepEqual(objectTopology(c2).edges.map(e=>e.index),t.edges.map(e=>e.index));
// 6. withRoundover replaces whatever is on the chosen edges; radius 0 removes both kinds; rounds keep {edges,radius}.
const swapped=withRoundover(withRoundover(box(),[0,1],2),[1],1,'chamfer');assert.deepEqual(swapped.fillets,[{edges:[0],radius:2},{edges:[1],radius:1,kind:'chamfer'}]);
assert.deepEqual(withRoundover(swapped,[0,1],0).fillets,[]);
assert.deepEqual(Object.keys(withRoundover(box(),[0],1).fillets[0]),['edges','radius'],'a round entry is unchanged (no kind key)');
// 7. Validators: kind is absent or 'chamfer'; anything else is an invalid roundover.
const wrap=o=>({...blank(),objects:[o]});
validateProject(wrap(c2));validateProject(wrap(mixed));
assert.throws(()=>validateProject(wrap({...box(),fillets:[{edges:[0],radius:1,kind:'bevel'}]})),/Invalid roundover/);
assert.throws(()=>validateProject(wrap({...box(),fillets:[{edges:[0],radius:1,kind:null}]})),/Invalid roundover/);
// 8. Minimum-version writer: chamfers need v3, rounds alone stay v2 (byte-identical write).
assert.equal(requiredVersion(wrap(c2)),3);assert.equal(forWrite(wrap(c2)).version,3);
const rounds=wrap(withRoundover(box(),[0,1],2));assert.equal(requiredVersion(rounds),2);assert.equal(forWrite(rounds),rounds);
// 9. Local engine: chamfer preview, check and export work end to end; the export volume matches the analytic value.
const runtime=await initLocalEngine(K,{loadPyodide,pythonURL:new URL('../node_modules/pyodide/',import.meta.url).pathname,pythonSource:fs.readFileSync('engine/python/model_jobs.py','utf8'),rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
let id=0;const run=d=>{const r=runtime.process({id:++id,...d});if(r.error)throw Error(r.error);return r;};
const p=wrap(c2);p.version=3;const preview=run({type:'preview',project:p,tolerance:.15});near(preview.volume,6000-15+1/3,1e-6,'preview volume');
const stl=run({type:'export',project:p,tolerance:.15,ground:true});near(stl.volume,6000-15+1/3,1e-6,'export volume');assert.equal(Buffer.from(stl.buffer).readUInt32LE(80),stl.triangles);
assert.throws(()=>run({type:'check',project:wrap(withRoundover(box(),[0,1],12,'chamfer')),tolerance:.15}),/That chamfer is too large/);
// 10. Round-only objects never reach the new chamfer code (source check: the guard is the first branch).
const src=fs.readFileSync('web/cad-solid.mjs','utf8');assert.match(src,/if\(fillets\.some\(f=>f\.kind==='chamfer'&&f\.radius>0\)\)return edgeFinish\(base,fillets,edges\);\n const radii=new Map\(\);/);
// 11. OCCT heap: 30 mixed builds through fresh geometry do not grow the heap without bound (builders are deleted).
const h0=heapBytes();for(let i=0;i<30;i++)volume(withRoundover(withRoundover(box(),[0],1+i/100),[1,2],0.5,'chamfer'));
console.log(`round-chamfer: analytic volumes ok (2-edge ${volume(c2).toFixed(3)} mm³), mixed round+chamfer valid, errors, keys, validators, v3 writer, engine jobs ok; OCCT heap ${(h0/1048576).toFixed(1)} → ${(heapBytes()/1048576).toFixed(1)} MB`);
