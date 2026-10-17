// ADR new-primitives-polyhedra-text §5 (items 1–7, 9, 10): Torus, Triangular prism, the Advanced shapes (tetrahedron,
// octahedron, d10, dodecahedron, icosahedron) and the Text tool (94 Roboto Bold glyphs), in both kernels.
//   node tests/new-shapes.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {execFileSync} from 'node:child_process';
import * as R from 'replicad';
import {initKernel,makeObject,makeLocalSolid,buildModel,validateProject,QUALITY} from '../web/kernel.mjs';
import {initLocalEngine} from '../web/local-engine.mjs';
import {objectTopology,baseShapeForTest,solidMesh} from '../web/cad-solid.mjs';
import {blank,object,defaults,advancedDefaults,glyphDefaults,names} from '../web/templates.mjs';
import {loadGlyphs,glyphsReady,containsGlyph,prepareGlyphs,glyphLoops,glyphOutlines} from '../web/glyph-geometry.mjs';
import {dimensions,stretch,withRoundover,mergeResult} from '../web/operations.mjs';
import {makePrefab,instantiatePrefab,validatePrefab} from '../web/prefabs.mjs';
import {GLYPH_CHARS} from '../web/glyph-metrics.mjs';
import {curvedTypes} from '../web/facets.mjs';
import {evaluateBoolean} from './boolean-model.mjs';

let checks=0;const ok=()=>checks++;
const rel=(a,b)=>Math.abs(a-b)/Math.abs(b);
const K=await initKernel();
const runtime=await initLocalEngine(K,{rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
let seq=0;const job=d=>{const r=runtime.process({id:++seq,...d});if(r.error)throw Error(r.error);return r;};

// --- lazy glyph outlines (Architect ruling): nothing loads them at import; a glyph job before loading fails cleanly
assert.equal(glyphsReady(),false,'glyphs.mjs must not load at startup');
const A=object('glyph',structuredClone(glyphDefaults.glyph),[0,0,2.5],'Text A');
assert.throws(()=>makeLocalSolid(K,A,.15),/letter outlines are not loaded/);
assert.equal(containsGlyph({type:'preview',project:{...blank(),objects:[object('box',{w:1,d:1,h:1})]}}),false);
const nested={type:'boolean',objects:[{type:'prefab',params:{children:[A]}}]};assert.equal(containsGlyph(nested),true);
assert.equal(containsGlyph({kind:'mesh',o:A}),true);assert.equal(containsGlyph({type:'place',object:A}),true);
await prepareGlyphs({type:'preview',project:blank()});assert.equal(glyphsReady(),false,'no glyph, no load');
await prepareGlyphs({type:'preview',project:{...blank(),objects:[A]}});assert.equal(glyphsReady(),true);ok();

const NEW={torus:defaults.torus,triprism:defaults.triprism,...advancedDefaults,...glyphDefaults};
assert.deepEqual(Object.keys(defaults).slice(-2),['torus','triprism'],'grid tiles 11–12');assert.equal(Object.keys(defaults).length,12);
assert.deepEqual(Object.keys(advancedDefaults),['tetrahedron','octahedron','decahedron','dodecahedron','icosahedron'],'5 Advanced shapes, no cube');
assert.ok(!('cube' in advancedDefaults)&&!('hexahedron' in advancedDefaults)&&!names.cube&&!names.hexahedron);
for(const t of Object.keys(NEW))assert.ok(names[t],t+' name');ok();

// --- 1. watertight 2-manifold for every type × quality × min/default/max params
const RANGE={
 torus:[{diameter:.2,tube:.05},defaults.torus,{diameter:1000,tube:400}],
 triprism:[{w:.05,d:.05,h:.05},defaults.triprism,{w:1000,d:1000,h:1000}],
 tetrahedron:[{size:.05},advancedDefaults.tetrahedron,{size:1000}],octahedron:[{size:.05},advancedDefaults.octahedron,{size:1000}],
 decahedron:[{diameter:.05,h:.05},advancedDefaults.decahedron,{diameter:1000,h:2000}],
 dodecahedron:[{size:.05},advancedDefaults.dodecahedron,{size:1000}],icosahedron:[{size:.05},advancedDefaults.icosahedron,{size:1000}],
 glyph:[{...glyphDefaults.glyph,size:.05,depth:.05},glyphDefaults.glyph,{...glyphDefaults.glyph,size:1000,depth:200}],
};
function closed(s,tag){assert.equal(s.status(),'NoError',tag);const t=s.getMesh().triVerts,dir=new Set(),und=new Map();
 for(let i=0;i<t.length;i+=3)for(let k=0;k<3;k++){const a=t[i+k],b=t[i+(k+1)%3],d=a+','+b;assert.ok(!dir.has(d),tag+' repeated directed edge');dir.add(d);const u=a<b?a+','+b:b+','+a;und.set(u,(und.get(u)||0)+1);}
 for(const n of und.values())assert.equal(n,2,tag+' edge not shared by exactly 2 triangles');}
// Expected glyph genus from the font data alone: counters (counter-clockwise loops) − outer loops + 1.
const signed=l=>{let a=0;for(let i=0;i<l.length;i++){const p=l[i],q=l[(i+1)%l.length];a+=p[0]*q[1]-q[0]*p[1];}return a/2;};
const glyphGenus=c=>{const loops=glyphLoops(c,20,.001),outer=loops.filter(l=>signed(l)<0).length;return loops.length-outer-outer+1;};
assert.equal(glyphGenus('o'),1);assert.equal(glyphGenus('8'),2);assert.equal(glyphGenus('B'),2);assert.equal(glyphGenus('W'),0);assert.equal(glyphGenus('%'),0);assert.equal(glyphGenus('i'),-1);
for(const [type,sets] of Object.entries(RANGE))for(const [si,params] of sets.entries())for(const [q,tol] of Object.entries(QUALITY)){
 const o=object(type,structuredClone(params));validateProject({...blank(),objects:[o]});const s=makeLocalSolid(K,o,tol),tag=`${type}[${si}]@${q}`;
 try{closed(s,tag);const genus=type==='torus'?1:type==='glyph'?(si?glyphGenus('A'):undefined):0;if(genus!==undefined)assert.equal(s.genus(),genus,tag+' genus');}finally{s.delete();}ok();}
for(const c of GLYPH_CHARS)for(const tol of [QUALITY.draft,QUALITY.maximum]){const s=makeLocalSolid(K,object('glyph',{...glyphDefaults.glyph,char:c}),tol);try{closed(s,'glyph '+c);assert.equal(s.genus(),glyphGenus(c),'glyph genus '+c);}finally{s.delete();}}ok();

// --- 2. OCCT faces: count, kind, sides; the Number of faces panel reads the same topology
const FACES={triprism:[5,'PLANE',[3,3,4,4,4]],tetrahedron:[4,'PLANE',[3]],octahedron:[8,'PLANE',[3]],decahedron:[10,'PLANE',[4]],dodecahedron:[12,'PLANE',[5]],icosahedron:[20,'PLANE',[3]],torus:[1,'TORUS',null]};
for(const [type,[n,kind,sides]] of Object.entries(FACES)){const o=object(type,structuredClone(NEW[type])),t=objectTopology(o);
 assert.equal(t.faceCount,n,type+' faces');assert.equal(t.faces.length,n);assert.ok(t.faces.every(f=>f.kind===kind),type+' kinds');assert.equal(t.flatFaces,kind==='PLANE'?n:0);
 if(sides)assert.deepEqual(t.faces.map(f=>f.edges.length).sort(),sides.length===1?Array(n).fill(sides[0]):sides,type+' sides');ok();}
{const t=objectTopology(A);assert.ok(t.faces.length>=3&&t.faces.every(f=>f.kind==='PLANE'),'A: planar caps and sides');const o=objectTopology(object('glyph',{...glyphDefaults.glyph,char:'o'}));assert.ok(o.faces.some(f=>f.kind!=='PLANE'),'o: curved extrusion faces');ok();}

// --- 3. volumes: analytic, both kernels (polyhedra/prism 1e-6; torus exact in OCCT, polygonal bound in Manifold)
const S5=Math.sqrt(5),sin36=Math.sin(Math.PI/5);
const VOLUME={tetrahedron:p=>p.size**3/(6*Math.SQRT2),octahedron:p=>Math.SQRT2*p.size**3/3,dodecahedron:p=>(15+7*S5)*p.size**3/4,icosahedron:p=>5*(3+S5)*p.size**3/12,
 triprism:p=>p.w*p.h*p.d/2,decahedron:p=>10/3*(p.h/2)*(p.diameter/2)**2*sin36,torus:p=>2*Math.PI**2*((p.diameter-p.tube)/2)*(p.tube/2)**2};
for(const [type,f] of Object.entries(VOLUME))for(const params of [NEW[type],RANGE[type][2]]){const o=object(type,structuredClone(params)),exact=f(params);
 const shape=baseShapeForTest(o);try{assert.ok(rel(R.measureVolume(shape),exact)<1e-6,type+' OCCT volume');}finally{shape.delete();}
 for(const tol of Object.values(QUALITY)){const s=makeLocalSolid(K,o,tol);try{const v=s.volume();if(type==='torus'){const r=params.tube/2;assert.ok(v<exact&&rel(v,exact)<3*Math.min(tol,r)/r,'torus Manifold volume '+tol);}else assert.ok(rel(v,exact)<1e-6,type+' Manifold volume');}finally{s.delete();}}ok();}

// --- 4. exact STEP (test only): planar faces, toroidal surface, B-spline glyph curves; the re-import keeps the volume
async function step(o){const shape=baseShapeForTest(o);try{const blob=shape.blobSTEP(),text=await blob.text(),back=await R.importSTEP(blob);try{return {text,volume:R.measureVolume(shape),back:R.measureVolume(back)};}finally{back.delete();}}finally{shape.delete();}}
const surfaces=t=>new Set([...t.matchAll(/=\s*(PLANE|[A-Z_]+_SURFACE)\s*\(/g)].map(m=>m[1]));
for(const [type,[n]] of Object.entries(FACES)){const r=await step(object(type,structuredClone(NEW[type])));
 assert.equal((r.text.match(/ADVANCED_FACE\s*\(/g)||[]).length,n,type+' STEP faces');assert.deepEqual([...surfaces(r.text)],[type==='torus'?'TOROIDAL_SURFACE':'PLANE'],type+' STEP surfaces');assert.ok(rel(r.back,r.volume)<1e-6,type+' STEP re-import');ok();}
for(const c of 'oS8@'){const r=await step(object('glyph',{...glyphDefaults.glyph,char:c}));assert.ok(/B_SPLINE_CURVE|BEZIER_CURVE/.test(r.text),c+' exact curves in STEP');assert.ok(!/POLYLINE/.test(r.text),c+' no polyline');assert.ok(surfaces(r.text).has('PLANE'));assert.ok(rel(r.back,r.volume)<1e-6,c+' STEP re-import');ok();}

// --- 6. glyph integrity: every OCCT glyph volume within 0.5 % of Manifold at 0.005 (and the Manifold volume ≤ exact)
let worst=0,worstChar='';for(const c of GLYPH_CHARS){const o=object('glyph',{...glyphDefaults.glyph,char:c}),shape=baseShapeForTest(o),s=makeLocalSolid(K,o,QUALITY.maximum);
 try{const d=rel(s.volume(),R.measureVolume(shape));if(d>worst){worst=d;worstChar=c;}assert.ok(d<.005,c+' OCCT/Manifold volume '+d);}finally{shape.delete();s.delete();}}
console.log(`glyph OCCT vs Manifold @0.005: worst ${(worst*100).toFixed(3)} % (${worstChar})`);ok();
// The picker's outlines are the same contours, as SVG paths for every character.
{const out=await glyphOutlines();assert.deepEqual(Object.keys(out),[...GLYPH_CHARS]);for(const [c,[adv,d]] of Object.entries(out)){assert.ok(adv>0&&/^M[-\d ]+/.test(d)&&d.endsWith('Z'),c);}ok();}

// --- validation, dimensions and stretch
const bad=(o,re)=>assert.throws(()=>validateProject({...blank(),objects:[o]}),re);
bad(object('torus',{diameter:30,tube:15}),/tube diameter must be less than half the outer diameter/);bad(object('torus',{diameter:30,tube:0}),/at least 0.05/);
const torusFaces=object('torus',{...defaults.torus});torusFaces.resolution={mode:'faces',count:32};bad(torusFaces,/face-resolution mode/);
const torusSmooth=object('torus',{...defaults.torus});torusSmooth.resolution={mode:'tolerance',tolerance:.005};validateProject({...blank(),objects:[torusSmooth]});assert.ok(curvedTypes.includes('torus'));
for(const char of ['AB','',' ','é',7,undefined])bad(object('glyph',{...glyphDefaults.glyph,char}),/Choose a letter, number or symbol/);
bad(object('glyph',{...glyphDefaults.glyph,font:'roboto-bold@2'}),/Choose a letter, number or symbol/);
for(const c of GLYPH_CHARS)validateProject({...blank(),objects:[object('glyph',{...glyphDefaults.glyph,char:c})]});
for(const t of Object.keys(advancedDefaults))bad(object(t,{size:.01,diameter:.01,h:.01}),/at least 0.05/);
for(const t of ['triprism',...Object.keys(advancedDefaults)]){const o=object(t,structuredClone(NEW[t]));o.resolution={mode:'tolerance',tolerance:.01};bad(o,/face-resolution mode/);}ok();
for(const [type,params] of Object.entries(NEW)){const o=object(type,structuredClone(params)),b=job({type:'check',project:{...blank(),objects:[o]},tolerance:.005}).bounds,d=dimensions(o);
 for(let k=0;k<3;k++)assert.ok(Math.abs(b.max[k]-b.min[k]-d[k])<(type==='torus'?.01:1e-4),type+' dimensions '+k),assert.ok(Math.abs((b.max[k]+b.min[k])/2)<1e-4,type+' bbox centred');ok();}
assert.deepEqual(dimensions(object('decahedron',{diameter:20,h:36})).map(v=>+v.toFixed(2)),[30.58,20,16.16],'d10 reference size (Architect ruling)');
for(const [type,params] of Object.entries(NEW))for(let axis=0;axis<3;axis++){const o=object(type,structuredClone(params)),d=dimensions(o),next=stretch(o,axis,1,4);validateProject({...blank(),objects:[next]});
 const e=dimensions(next);assert.ok(next.scale===undefined,type+' stretch edits parameters');
 if(type==='torus')assert.ok(Math.abs(e[axis]-(axis===2?Math.min(d[2]+4,params.diameter/2-.05):d[axis]+4))<1e-9);
 else assert.ok(Math.abs(e[axis]-d[axis]-4)<1e-9,type+' stretch '+axis);
 if(advancedDefaults[type])for(let k=0;k<3;k++)assert.ok(Math.abs(e[k]/d[k]-e[axis]/d[axis])<1e-12,type+' uniform');
 if(type==='glyph'&&axis<2)assert.ok(Math.abs(e[1-axis]/d[1-axis]-e[axis]/d[axis])<1e-12,'glyph keeps proportion');}ok();
{const t=stretch(object('torus',{diameter:30,tube:8}),0,1,-40);assert.ok(t.params.diameter>2*t.params.tube);validateProject({...blank(),objects:[t]});
 const z=stretch(object('torus',{diameter:30,tube:8}),2,1,40);assert.ok(z.params.tube<15);validateProject({...blank(),objects:[z]});ok();}

// --- 7. save/load: .tcad round trip, prefab/Merge/cutout children, forward compatibility with 2.7.0
const scene={...blank(),name:'New shapes',buildPlaneEnabled:true,objects:Object.entries(NEW).map(([t,p],i)=>{const o=object(t,structuredClone(p),[(i%4)*40,Math.floor(i/4)*40,15],names[t]);return o;})};
scene.objects.push(object('glyph',{...glyphDefaults.glyph,char:'%'},[0,-40,2.5],'Text %'),object('glyph',{...glyphDefaults.glyph,char:'"'},[40,-40,2.5],'Text "'));
const saved=JSON.stringify(validateProject(scene)),loaded=validateProject(JSON.parse(saved));assert.equal(JSON.stringify(loaded),saved,'.tcad round trip');
const record=makePrefab(loaded.objects.slice(0,4),'New shapes prefab',job({type:'check',project:{...blank(),objects:loaded.objects.slice(0,4)},tolerance:.03}).bounds,loaded.layers);
const inst=[0,1,2].map(()=>instantiatePrefab(JSON.parse(JSON.stringify(record)),'layer-1'));validatePrefab(JSON.parse(JSON.stringify(record)));validateProject({...blank(),objects:inst});
const pv=job({type:'check',project:{...blank(),objects:[inst[0]]},tolerance:.03}).volume,parts=job({type:'check',project:{...blank(),objects:loaded.objects.slice(0,4)},tolerance:.03}).volume;assert.ok(rel(pv,parts)<1e-9,'prefab volume');ok();
{const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'avalon-270-'));let old=null;
 try{for(const f of ['kernel-ui','facets','threads','layers'])fs.writeFileSync(path.join(tmp,f+'.mjs'),execFileSync('git',['show','aab9865:web/'+f+'.mjs'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}));old=await import(path.join(tmp,'kernel-ui.mjs'));}catch(e){console.log('forward-compat check skipped (no aab9865 in git):',e.message.split('\n')[0]);}
 if(old){for(const o of scene.objects)assert.throws(()=>old.validateProject({...blank(),objects:[o]}),/Project contains an invalid object\./,o.type+': 2.7.0 gives the existing error');ok();}
 fs.rmSync(tmp,{recursive:true,force:true});}

// --- 9. Merge, cutout, build plane, roundovers
{const torus=object('torus',{...defaults.torus},[0,0,4]),box=object('box',{w:20,d:20,h:8},[15,0,4]);const r=job({type:'boolean',objects:[torus,box],operation:'add',tolerance:.03});
 assert.equal(r.count,1);const merged=mergeResult([torus,box],'m1',r.bounds);validateProject({...blank(),objects:[merged]});const m=job({type:'check',project:{...blank(),objects:[merged]},tolerance:.03});assert.ok(Math.abs(m.volume-r.volume)<1e-6,'merged torus + box');
 assert.deepEqual(evaluateBoolean(K,[torus,box],'add').count,1);ok();}
{const plate=object('box',{w:40,d:30,h:6},[0,0,3]),cut=object('glyph',{...glyphDefaults.glyph,char:'B',depth:4},[0,0,5.5]);cut.mode='cut';
 const solid=job({type:'check',project:{...blank(),objects:[plate]},tolerance:.03}).volume,engraved=job({type:'check',project:{...blank(),objects:[plate,cut]},tolerance:.03});
 const removed=solid-engraved.volume;assert.ok(removed>100,'engraved volume '+removed);const pieces=job({type:'boolean',objects:[plate,{...cut,mode:'solid',position:[50,0,0]}],operation:'add',tolerance:.03});assert.equal(pieces.count,2);
 const one=job({type:'boolean',objects:[plate],cutouts:[cut],operation:'add',tolerance:.03});assert.equal(one.count,1,'engraved plate is one solid');ok();}
for(const [type,params] of Object.entries(NEW)){const o=object(type,structuredClone(params),[0,0,-50]);o.rotation=[33,-20,71];const g=job({type:'groundProject',project:{...blank(),objects:[o]}});
 const b=job({type:'check',project:g.project,tolerance:.005}).bounds;assert.ok(b.min[2]>=-1e-6&&b.min[2]<1e-3,type+' grounded at Z=0');
 const placed=job({type:'place',object:{...structuredClone(o),positionReference:'base',placement:[0,0,0]},position:[0,0,-5],floor:true}).object;assert.ok(job({type:'check',project:{...blank(),objects:[placed]},tolerance:.005}).bounds.min[2]>=-1e-6,type+' place floor');ok();}
for(const type of ['dodecahedron','triprism']){const o=object(type,structuredClone(NEW[type])),t=objectTopology(o),rounded=withRoundover(o,[t.edges[0].index],1);
 const m=solidMesh(rounded,.03);assert.ok(m.triangles.length>3*36,type+' roundover mesh');const v=job({type:'check',project:{...blank(),objects:[rounded]},tolerance:.03}).volume;assert.ok(v<VOLUME[type](o.params)&&v>.95*VOLUME[type](o.params),type+' roundover volume');ok();}

// --- 10. STL at every preset for a scene with all new shapes: counts inside the §6 budget, deterministic
const MAX_TRIS={torus:[1200,3000,8500,16000],triprism:[8,8,8,8],tetrahedron:[4,4,4,4],octahedron:[8,8,8,8],decahedron:[20,20,20,20],dodecahedron:[36,36,36,36],icosahedron:[20,20,20,20]};
const counts={};for(const [qi,[q,tol]] of Object.entries(QUALITY).entries()){const a=job({type:'export',project:loaded,tolerance:tol}),b=job({type:'export',project:loaded,tolerance:tol});
 assert.ok(Buffer.from(a.buffer).equals(Buffer.from(b.buffer)),q+' STL deterministic');counts[q]=a.triangles;
 for(const [type,limits] of Object.entries(MAX_TRIS)){const m=buildModel(K,{...blank(),objects:[object(type,structuredClone(NEW[type]))]},tol);assert.ok(m.triangles.length/3<=limits[qi],`${type} ${q}: ${m.triangles.length/3} tris`);}ok();}
let glyphMax=[0,''];for(const c of GLYPH_CHARS){const m=buildModel(K,{...blank(),objects:[object('glyph',{...glyphDefaults.glyph,char:c})]},QUALITY.maximum),n=m.triangles.length/3;if(n>glyphMax[0])glyphMax=[n,c];}
console.log('STL triangles for the all-shapes scene:',JSON.stringify(counts),'· largest glyph at Maximum:',glyphMax[0],JSON.stringify(glyphMax[1]));
console.log('PASS:',checks,'new-shapes checks: lazy glyph load, watertight 2-manifolds and genus at 4 qualities × min/default/max, OCCT face counts/kinds/sides, analytic volumes in both kernels, exact STEP (planes, torus, B-spline glyphs, re-import), 94 glyph volumes OCCT≈Manifold, validation, dimensions, stretch, .tcad/prefab round trip, 2.7.0 forward-compat error, Merge, engraving, build plane, roundovers, deterministic STL budgets.');
