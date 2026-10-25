// ADR-0001 F8 (§4 F8, §5.2 F8): Hollow (o.shell = {thickness, open?}). Every §1.3 shell case comes out as measured
// (✓ or the clear hollow error, never the silently unshelled solid), the open box 2,672 mm³ and closed box 3,504 mm³,
// the guard, rounds > t allowed and ≤ t refused, chamfers and unsupported types refused with a reason, undo, save/load
// v3, Manifold status/genus, cache keys, the Android deferral (cancel on edit) and timings on the in-process (worker)
// and sidecar paths. Volume-guard misfires on correct hollows are recorded (stop item for the Architect), not hidden.
import {segments} from '../web/kernel-ui.mjs';
import assert from 'node:assert/strict';import fs from 'node:fs';
import {initKernel,makeObject,validateProject} from '../web/kernel.mjs';
import {initLocalEngine} from '../web/local-engine.mjs';
import {solidMesh,objectTopology,objectTopologyEntry,finishedShapeForTest,brepVolumeForTest} from '../web/cad-solid.mjs';
import {hollowError,hollowRefusal,validateShell,shellStrategy,smallestDimension,SHELL_DEFAULT,SHELL_MIN,shellDefault,maxWall,SHELL_TYPES,SHELL_EXTRUSIONS,SHELL_BUDGET_MS} from '../web/shell-rules.mjs';
import {deferShells,takeDeferredShells,computeShells,shellDeferrals} from '../web/shell-mesh.mjs';
import {object,blank,defaults,advancedDefaults,glyphDefaults} from '../web/templates.mjs';
import {loadGlyphs} from '../web/glyph-geometry.mjs';import {GLYPH_CHARS} from '../web/glyph-metrics.mjs';
import {requiredVersion,forWrite,migrateProject} from '../web/migrate.mjs';import {snapshot} from '../web/history.mjs';
import {sidecarClient} from './occt-sidecar-client.mjs';
await loadGlyphs();const K=await initKernel(),rust={binary:fs.readFileSync('app/assets/mesh-core.wasm')};
const ALL={...defaults,...advancedDefaults,...glyphDefaults},BOX={w:30,d:20,h:10};
const part=(type,params,extra={})=>({...object(type,structuredClone(params||ALL[type]),[0,0,0]),...extra});
const build=(o,tol=.15)=>{const t0=performance.now();try{const s=makeObject(K,o,tol);try{return {v:s.volume(),genus:s.genus(),status:s.status(),ms:performance.now()-t0};}finally{s.delete();}}catch(e){return {error:e.message,ms:performance.now()-t0};}};
const ERR=t=>hollowError(t);const near=(a,b,e,what)=>assert.ok(Math.abs(a-b)<=e,`${what}: ${a} vs ${b}`);
const top=o=>objectTopology({...o,shell:undefined}).faces.findIndex(f=>f.kind==='PLANE'&&f.normal[2]>.999&&Math.abs(f.center[2]-Math.max(...objectTopology({...o,shell:undefined}).faces.filter(g=>g.normal[2]>.999).map(g=>g.center[2])))<1e-6);
const all12=r=>[{edges:[...Array(12).keys()],radius:r}];
let n=0;const ok=(what,cond=true)=>{assert.ok(cond,what);n++;};
// The ADR error text, verbatim.
assert.equal(ERR(2),"Can't hollow this shape at 2 mm. Try a smaller wall or remove rounds.");assert.equal(ERR(.4),"Can't hollow this shape at 0.4 mm. Try a smaller wall or remove rounds.");
assert.equal(SHELL_DEFAULT,2);assert.equal(SHELL_MIN,.4);
// §5.2: open box 2,672 mm³ (top removed) and closed box 3,504 mm³, exact; Manifold NoError, genus 0 (one cup surface) / −1 (two closed surfaces).
const closedBox=build(part('box',BOX,{shell:{thickness:2}}));near(closedBox.v,3504,1e-6,'closed box');assert.equal(closedBox.genus,-1);assert.equal(closedBox.status,'NoError');n++;
const ob=part('box',BOX),topFace=top(ob),openBox=build({...ob,shell:{thickness:2,open:[topFace]}});near(openBox.v,2672,1e-3,'open box');assert.equal(openBox.genus,0);assert.equal(openBox.status,'NoError');n++;
// §1.3 rows. Open 2 mm, top removed: box / cylinder / dodecahedron ✓ (exact volumes).
for(const [t,p,v] of [['cylinder',{diameter:20,h:20},2664.071],['dodecahedron',{size:11},3976.973]]){const o=part(t,p),r=build({...o,shell:{thickness:2,open:[top(o)]}});near(r.v,v,t==='cylinder'?v*.003:.05,'open '+t+' (mesh of the exact B-rep)');assert.equal(r.genus,0);n++;}
// Closed = outer − offset(−t): box / sphere / torus / cone / dodecahedron (exact in OCCT). Torus 30/8 at 2 mm is a correct
// hollow (2,605.6 mm³ exact). batch-3.0b (Master Chief, QA 16:56 CT): torus and tube are exact OCCT hollows; the B-rep
// volume is checked to 1e-6 relative, the mesh (sampled torus faces / BRepMesh) to 1 %.
const closed={sphere:[{diameter:25},3332.183,3332.183*.005],cone:[{diameter:25,top:8,h:25},3053.02,3053.02*.005],dodecahedron:[{size:11},4224.864,.05]};
for(const [t,[p,v,e]] of Object.entries(closed)){const r=build(part(t,p,{shell:{thickness:2}}));near(r.v,v,e,'closed '+t);assert.equal(r.genus,-1,'closed genus '+t);assert.equal(r.status,'NoError');n++;}
{const o=part('torus',{diameter:30,tube:8},{shell:{thickness:2}}),r=build(o),exact=2*Math.PI**2*11*(16-4);assert.ok(!r.error,'torus: '+r.error);assert.equal(shellStrategy(o),'occt');near(brepVolumeForTest(o),exact,exact*1e-6,'closed torus B-rep exact (2π²R(r²−(r−t)²))');near(r.v,exact,exact*.01,'closed torus mesh vs exact 2,605.6 mm³');assert.equal(r.genus,1,'closed torus: two genus-1 surfaces');assert.equal(r.status,'NoError');n++;}
// MakeThickSolid with no face removed returns only the inner solid: never used for a closed hollow (closed = outer − offset).
// Open shell after round r1.5 (< t) or a chamfer: silent unshelled result in OCCT → refused by the type rules, and the
// guard alone (no validation) still turns it into the hollow error.
for(const [what,fillets] of [['round r1.5',all12(1.5)],['chamfer 1',[{edges:[...Array(12).keys()],radius:1,kind:'chamfer'}]],['chamfer 3',[{edges:[...Array(12).keys()],radius:3,kind:'chamfer'}]]]){
 const o=part('box',BOX,{fillets}),r=build({...o,shell:{thickness:2,open:[top(o)]}});ok('open after '+what+' → error, not unshelled',!!r.error);
 assert.throws(()=>validateProject({...blank(),version:3,objects:[{...o,shell:{thickness:2,open:[top(o)]}}]}),new RegExp(what.startsWith('chamfer')?'not offered for shapes with chamfers':"Can't hollow this shape at 2 mm"));n++;}
// Closed offset of a rounded box r1.5 < t: silently wrong inner volume in OCCT → refused (rounds must exceed t); r3 > t ✓.
assert.throws(()=>validateShell(part('box',BOX,{fillets:all12(1.5),shell:{thickness:2}})),{message:ERR(2)});n++;
assert.throws(()=>validateShell(part('box',BOX,{fillets:all12(2),shell:{thickness:2}})),{message:ERR(2)},'r = t refused');n++;
const r3=build(part('box',BOX,{fillets:all12(3),shell:{thickness:2}}));near(r3.v,3116.5,3116.5*.003,'closed r3 > t');assert.equal(r3.genus,-1);validateShell(part('box',BOX,{fillets:all12(3),shell:{thickness:2}}));n++;
// Open shell with rounds > t: allowed by the rules; OCCT returns an invalid solid (BRepCheck) → the hollow error.
{const o=part('box',BOX,{fillets:all12(3)});ok('open after r3: BRepCheck guard',build({...o,shell:{thickness:2,open:[top(o)]}}).error===ERR(2));}
// Closed offset of a chamfered box throws in OCCT; chamfers are not offered.
assert.equal(hollowRefusal(part('box',BOX,{fillets:[{edges:[0],radius:1,kind:'chamfer'}]})),'Hollow is not offered for shapes with chamfers.');n++;
// Shell-then-fillet is invalid: rounds are never applied to a hollow (base → rounds → shell last); a hollowed part has
// no picking of its own: its topology is the unhollowed base (open faces are base faces, like fillet edges).
{const o=part('box',BOX),h={...o,shell:{thickness:2}};assert.deepEqual(objectTopology(h).faces.map(f=>f.index),objectTopology(o).faces.map(f=>f.index));assert.equal(objectTopologyEntry(h).hash,objectTopologyEntry(o).hash);n++;}
// Glyphs: OCCT closed offset fails 94/94 [M]; the Manifold path (2D offset, inset extrusion) is used. Every glyph builds
// NoError at every wall; the guard accepts all 94 at 0.4 mm. At 0.8 / 1 / 2 mm it refuses most of them (misfire, recorded).
const glyphStats={};
for(const t of [.4,.8,1,2]){let pass=0,worst=0;for(const c of GLYPH_CHARS){const o=part('glyph',{...ALL.glyph,char:c},{shell:{thickness:t}});assert.equal(shellStrategy(o),'manifold');const r=build(o);worst=Math.max(worst,r.ms);if(!r.error){pass++;assert.equal(r.status,'NoError');}else assert.equal(r.error,ERR(t));}glyphStats[t]={pass,worst:+worst.toFixed(1)};}
assert.equal(glyphStats[.4].pass,94,'Glyph hollow 94/94 at 0.4 mm');n++;
// Glyph open faces: the inset runs through the open cap (one cup per stroke loop); a side face is not a cap → error.
{const o=part('glyph',{...ALL.glyph,char:'O'}),t=objectTopology(o),cap=t.faces.findIndex(f=>f.normal[2]>.999),side=t.faces.findIndex(f=>Math.abs(f.normal[2])<.5);
 const c=build({...o,shell:{thickness:.8}}),op=build({...o,shell:{thickness:.8,open:[cap]}});assert.ok(op.v<c.v);assert.equal(op.status,'NoError');assert.equal(op.genus,1);
 assert.equal(build({...o,shell:{thickness:.8,open:[side]}}).error,ERR(.8));n++;}
// Sketch extrusion: Manifold closed; open → OCCT shell.
{const pts=[[0,0],[30,0],[30,20],[10,25],[0,20]],o=part('polygon',{points:pts,h:10});assert.equal(shellStrategy({...o,shell:{thickness:2}}),'manifold');near(build({...o,shell:{thickness:2}}).v,3831.1,.5,'closed sketch');
 const op=build({...o,shell:{thickness:2,open:[top(o)]}});near(op.v,2858.13,.5,'open sketch');assert.equal(shellStrategy({...o,shell:{thickness:2,open:[0]}}),'occt');n++;}
// Tube: closed = Manifold annulus extrusion (its OCCT closed offset is empty; batch-3.0 Architect 11:18 CT); open ✓ (OCCT).
{const o=part('tube',{diameter:40,inner:20,h:20},{shell:{thickness:2}}),r=build(o),exact=Math.PI*(100-100)*20+Math.PI*(400-100)*20-Math.PI*(18*18-12*12)*16;assert.equal(shellStrategy(o),'occt');assert.ok(!r.error,'closed tube: '+r.error);assert.equal(r.status,'NoError');near(brepVolumeForTest(o),exact,exact*1e-6,'closed tube B-rep exact (OCCT offset shell closed into a solid)');near(r.v,exact,exact*.01,'closed tube mesh');n++;}
{const o=part('tube',{diameter:40,inner:20,h:20}),r=build({...o,shell:{thickness:2,open:[top(o)]}});near(r.v,8670.796,8670.796*.003,'open tube');n++;}
// Unsupported types: not offered, with the reason (validation and the Hollow section use the same text).
const NOT='Hollow is not offered for threads, imported meshes, merged shapes, prefabs or bevelled letters.';
for(const t of ['threadrod','threadtube','mesh','joined','prefab'])assert.equal(hollowRefusal({type:t,params:{}}),NOT,t);
assert.equal(hollowRefusal(part('glyph',{...ALL.glyph,bevel:.5})),NOT,'bevelled glyph');n++;
assert.throws(()=>validateShell(part('threadrod',null,{shell:{thickness:1}})),{message:NOT});n++;
// Thickness rules: minimum 0.4 mm and below half the smallest dimension; structure.
const WALL='Wall thickness must be at least 0.4 mm and less than half the smallest dimension.';
assert.throws(()=>validateShell(part('box',BOX,{shell:{thickness:.3}})),{message:WALL});assert.throws(()=>validateShell(part('box',BOX,{shell:{thickness:5}})),{message:WALL});validateShell(part('box',BOX,{shell:{thickness:4.99}}));
assert.equal(smallestDimension(part('box',BOX)),10);assert.equal(smallestDimension(part('tube',{diameter:25,inner:18,h:20})),3.5);
for(const bad of [{},{thickness:'2'},{thickness:2,open:[]},{thickness:2,open:[1,1]},{thickness:2,open:[-1]},{thickness:2,extra:1},null,[2]])assert.throws(()=>validateShell(part('box',BOX,{shell:bad})),{message:'Invalid hollow setting.'},JSON.stringify(bad));n++;
// A guard failure leaves the model unchanged (the job errors; nothing is stored).
const rt=await initLocalEngine(K,{rust});let id=0;
{const p={...blank(),version:3,objects:[part('box',BOX,{shell:{thickness:2}})]};const before=JSON.stringify(p);const r=rt.process({id:++id,type:'check',project:p,tolerance:.15});assert.ok(!r.error);assert.equal(JSON.stringify(p),before);
 const bad={...blank(),version:3,objects:[part('box',BOX,{fillets:[{edges:[0],radius:1}],shell:{thickness:2}})]};const badBefore=JSON.stringify(bad);const e=rt.process({id:++id,type:'check',project:bad,tolerance:.15});assert.equal(e.error,ERR(2));assert.equal(JSON.stringify(bad),badBefore);
 const tor={...blank(),version:3,objects:[part('torus',{diameter:30,tube:8},{shell:{thickness:2}})]};assert.ok(!rt.process({id:++id,type:'check',project:tor,tolerance:.15}).error,'torus 30/8 @2 checks');n++;}
// Save / load: a hollow writes format 3 and loads back unchanged; without a hollow format 2, byte-identical JSON.
{const plain={...blank(),objects:[part('box',BOX)]},h=structuredClone(plain);h.objects[0].shell={thickness:2,open:[topFace]};
 assert.equal(requiredVersion(plain),2);assert.equal(forWrite(plain),plain);assert.equal(requiredVersion(h),3);
 const saved=JSON.stringify(forWrite(h)),loaded=migrateProject(JSON.parse(saved),[]);assert.equal(loaded.version,3);assert.deepEqual(loaded.objects[0].shell,{thickness:2,open:[topFace]});validateProject(loaded);
 const j={...blank(),objects:[{...object('joined',{children:[part('box',BOX,{shell:{thickness:2}}),part('cylinder',null,{position:[20,0,0]})]},[0,0,0])}]};assert.equal(requiredVersion(j),3,'nested hollow → v3');n++;}
// Undo: the history snapshot of the project before Apply restores the object without its hollow.
{const p={...blank(),objects:[part('box',BOX)]},s0=snapshot(p,null);const q=structuredClone(p);q.objects[0].shell={thickness:2};const s1=snapshot(q,s0);
 assert.equal(validateProject(s0,true).objects[0].shell,undefined);assert.deepEqual(validateProject(s1,true).objects[0].shell,{thickness:2});assert.equal(s1.objects[0].params,s0.objects[0].params,'structural sharing');n++;}
// Cache keys: the hollow joins the solid-mesh key only when present (other keys unchanged); different walls never share a mesh.
{const o=part('box',BOX,{fillets:all12(3)}),a=solidMesh({...o,shell:{thickness:2}},.15),b=solidMesh({...o,shell:{thickness:1.5}},.15),c=solidMesh(o,.15);
 assert.notEqual(a.triangles.length,c.triangles.length);assert.ok(!Buffer.from(a.vertices.buffer).equals(Buffer.from(b.vertices.buffer)),'2 mm and 1.5 mm walls never share a mesh');n++;}
// Merge/subtract: a hollowed part is an ordinary solid to Merge (its compound has no picking, like a mesh component).
{const j=object('joined',{children:[part('box',BOX,{shell:{thickness:2}}),{...part('cylinder',{diameter:6,h:40}),mode:'cut'}]},[0,0,0]);assert.equal(objectTopology(j),null);const r=build(j);assert.equal(r.status,'NoError');near(r.v,3504-Math.PI*9*10+Math.PI*9*(10-4),2,'hollow box minus a rod');n++;}
// Android (in-worker OCCT): a preview with a hollow not yet built shows the unhollowed part as interim data; it is never
// cached, then the hollow is built and the preview re-run; a newer preview cancels it.
const A=await initLocalEngine(K,{rust});
{const o=part('cone',{diameter:30,top:6,h:24},{shell:{thickness:1.5}}),p={...blank(),version:3,objects:[o]};
 deferShells(true);const d0=shellDeferrals(),first=A.process({id:++id,type:'preview',project:p,tolerance:.15});const list=takeDeferredShells();assert.equal(list.length,1);assert.equal(shellDeferrals(),d0+1);
 const plain=A.process({id:++id,type:'preview',project:{...p,objects:[{...o,shell:undefined}]},tolerance:.15});assert.equal(first.volume,plain.volume,'interim = unhollowed');
 assert.equal(await computeShells(list,()=>true),false,'cancel on edit');
 assert.equal(await computeShells(list,()=>false),true);deferShells(true);const done=A.process({id:++id,type:'preview',project:p,tolerance:.15});assert.equal(takeDeferredShells().length,0);assert.ok(done.volume<plain.volume*.6,'hollow after compute');n++;}
// Timings: in-process (Android worker path) and OCCT sidecar (desktop/web) for the default primitives at 2 mm, the box
// and sketch on Manifold, glyphs; budgets primitives ≤ 100 ms desktop, extrusions/glyphs ≤ 50 ms, hard limit 5 s.
const GUARD_MISFIRES={};for(const [k,o] of [['torus 30/8 @2',part('torus',{diameter:30,tube:8},{shell:{thickness:2}})],['tetrahedron 30 @2',part('tetrahedron',{size:30},{shell:{thickness:2}})],['box 30×20×6 @2',part('box',{w:30,d:20,h:6},{shell:{thickness:2}})],['plate 60×40×5 @2',part('box',{w:60,d:40,h:5},{shell:{thickness:2}})],['torus 30/6 @2',part('torus',{diameter:30,tube:6},{shell:{thickness:2}})]])GUARD_MISFIRES[k]=build(o).error?'refused':'accepted';GUARD_MISFIRES.glyphs=glyphStats;
// Timings: in-process (Android worker path) first, then the OCCT sidecar (desktop/web; solidRemote is process-global, so
// it is created last). Export job, first build of each hollow (default sizes, 2 mm; glyph 'B' 0.4 mm). The sidecar
// result must be byte-identical to the in-process one.
const timing={worker:{},sidecar:{}},stl={};
const cases=[['box',BOX],['cylinder'],['sphere'],['cone'],['dodecahedron'],['octahedron'],['wedge'],['triprism'],['rounded'],['polygon',{points:[[0,0],[30,0],[30,20],[10,25],[0,20]],h:10}],['glyph',{...ALL.glyph,char:'B'}],['torus'],['tube',{diameter:30,inner:18,h:20}],['pyramid'],['tetrahedron'],['icosahedron'],['decahedron']];
// Sizes ×1.01 so no B-rep or mesh of an earlier group is reused; one warm-up hollow per path (engine/JIT start) first.
const grow=(t,p)=>{const q=structuredClone(p||ALL[t]);for(const k of Object.keys(q))if(typeof q[k]==='number'&&k!=='r')q[k]*=1.01;if(q.points)q.points=q.points.map(a=>a.map(v=>v*1.01));return q;};
const job=(t,p,scale=true)=>({id:++id,type:'export',project:{...blank(),version:3,objects:[part(t,scale?grow(t,p):p,{id:'h-'+t,shell:{thickness:t==='glyph'?.4:2}})]},tolerance:.15,ground:true});
const warm=()=>job('cylinder',{diameter:9,h:9},false);
const W=await initLocalEngine(K,{rust});W.process(warm());
for(const [t,p] of cases){const t0=performance.now(),r=W.process(job(t,p));timing.worker[t]=+(performance.now()-t0).toFixed(1);assert.ok(!r.error,t+': '+r.error);stl[t]=Buffer.from(r.buffer);}
const KA=await initKernel({solidOptions:false}),SA=await initLocalEngine(KA,{rust}),client=sidecarClient();await client.run(SA,warm());
for(const [t,p] of cases){const j=job(t,p),t0=performance.now(),r=await client.run(SA,j);timing.sidecar[t]=+(performance.now()-t0).toFixed(1);assert.ok(!r.error,t+': '+r.error);assert.ok(Buffer.from(r.buffer).equals(stl[t]),'sidecar STL = in-process STL: '+t);}
client.close();n++;
// ADR-0003: every offered type is measured here, refused types stay refused, and warm sidecar hollows meet the budgets.
assert.deepEqual([...new Set(cases.map(c=>c[0]))].sort(),[...SHELL_TYPES].sort(),'every offered type has a gate case');
assert.equal(hollowRefusal({type:'torus2',params:{}}),'Hollow is not offered for this shape.');
// Wall-safety rejections for the geometrically tight types (ADR-0003): the type stays offered, the bad wall is refused.
for(const [t,p,w] of [['tube',{diameter:25,inner:18,h:20},2],['tetrahedron',{size:30},3.1],['pyramid',{w:30,d:30,h:30},4.7],['torus',{diameter:30,tube:8},4],['icosahedron',{size:16},6.1],['decahedron',{diameter:20,h:36},4.5]])assert.throws(()=>validateShell(part(t,p,{shell:{thickness:w}})),{message:WALL},t+' wall '+w);
for(const [t,ms] of Object.entries(timing.sidecar)){const cap=SHELL_EXTRUSIONS.includes(t)?SHELL_BUDGET_MS.extrusion:SHELL_BUDGET_MS.primitive;assert.ok(ms<=cap,'hollow budget '+t+': '+ms+' ms > '+cap+' ms');}
// ADR-0003 (a): the panel default is min(2, 0.9 x max wall) floored to 0.1 mm, always accepted; no default when max wall <= 0.4.
// polygon has no template defaults (a sketch): the sketch used above.
const DEF=t=>ALL[t]??{points:[[0,0],[30,0],[30,20],[10,25],[0,20]],h:10};
for(const t of SHELL_TYPES){const o=part(t,DEF(t)),d=shellDefault(o);if(d===null){assert.ok(maxWall(o)<=SHELL_MIN,t);continue;}
 assert.equal(d,Math.max(SHELL_MIN,Math.floor(Math.min(2,.9*maxWall(o))*10+1e-9)/10),t+' default');assert.doesNotThrow(()=>validateShell(part(t,DEF(t),{shell:{thickness:d}})),t+' default '+d+' accepted');}
assert.equal(shellDefault(part('tube',{diameter:25,inner:18,h:20})),1.5);assert.equal(shellDefault(part('tube',{diameter:3,inner:2,h:5})),null);
n++;
console.log('shell-objects: '+n+' groups passed');console.log('timings (ms, export job, first build):',JSON.stringify(timing));console.log('guard misfires on correct hollows:',JSON.stringify(GUARD_MISFIRES));
process.exit(0);
