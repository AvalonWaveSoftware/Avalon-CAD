// ADR-0001 F7 (glyph-emboss-bevel): glyph params bevel / bevelProfile / plate / plateMargin / engrave (save format v3).
// Checks: a glyph without a finish is built exactly as before (Manifold and OCCT); Emboss and Engrave volumes are exact
// (plate box ± glyph area × depth) in both kernels; a bevel (chamfer or round) is an OCCT product meshed through
// solidMesh; an impossible bevel throws "Bevel not possible on '<char>' at this size"; validators, dimensions, stretch
// and the minimum-version writer. The 94-glyph sweep is tests/glyph-bevel-sweep.mjs.
import assert from 'node:assert/strict';
import {initKernel,makeObject,validateProject} from '../web/kernel.mjs';
import {solidMesh,finishedShapeForTest,baseShapeForTest,glyphBevelNote} from '../web/cad-solid.mjs';import * as R from 'replicad';
import {object,blank,glyphDefaults} from '../web/templates.mjs';
import {loadGlyphs,glyphHalfExtents,glyphLayout,glyphBevelPart} from '../web/glyph-geometry.mjs';
import {dimensions,stretch,glyphDimensions} from '../web/operations.mjs';
import {requiredVersion} from '../web/migrate.mjs';
const K=await initKernel();await loadGlyphs();
const g=(char,extra={})=>object('glyph',{...glyphDefaults.glyph,char,...extra});
const mesh=(o,tol=.05)=>{const s=makeObject(K,o,tol);try{assert.equal(s.status(),'NoError');const m=s.getMesh();return {v:s.volume(),pos:Array.from(m.vertProperties),tri:Array.from(m.triVerts)};}finally{s.delete();}};
const occt=o=>{const s=finishedShapeForTest(o);try{return R.measureVolume(s);}finally{s.delete();}};
const close=(a,b,rel,msg)=>assert.ok(Math.abs(a-b)<=rel*Math.max(1,Math.abs(b)),`${msg}: ${a} vs ${b}`);
let checks=0;
// 1. No finish (absent, or explicit zeros): byte-identical Manifold mesh, identical OCCT volume.
for(const c of ['A','g','8','@']){const a=mesh(g(c)),b=mesh(g(c,{bevel:0,plate:0,plateMargin:3,bevelProfile:'round',engrave:false}));
 assert.deepEqual(b,a,c+' zero finish is the plain glyph');close(occt(g(c,{bevel:0,plate:0})),occt(g(c)),1e-12,c+' OCCT plain');checks+=2;}
// 2. Emboss / Engrave: exact volumes in both kernels.
for(const c of ['A','o','R','%']){const P=2,M=1.5,d=glyphDefaults.glyph.depth,[hx,hy]=glyphHalfExtents(c,glyphDefaults.glyph.size),box=4*(hx+M)*(hy+M)*P;
 const area=mesh(g(c)).v/d,emb=g(c,{plate:P,plateMargin:M}),eng=g(c,{plate:P,plateMargin:M,engrave:true}); // Engrave: 1 mm whatever the depth (5 mm here)
 close(mesh(emb).v,box+area*d,1e-6,c+' emboss volume (Manifold)');close(mesh(eng).v,box-area*1,1e-6,c+' engrave volume (Manifold)');
 // curved outlines: the Manifold prism is the flattened outline, OCCT the exact curve (≈0.3 % on 'o').
 close(occt(emb),mesh(emb).v,6e-3,c+' emboss OCCT ≈ Manifold');close(occt(eng),mesh(eng).v,6e-3,c+' engrave OCCT ≈ Manifold');
 const [x,y,z]=glyphDimensions(emb.params);close(x,2*(hx+M),1e-9,'emboss X');close(y,2*(hy+M),1e-9,'emboss Y');assert.equal(z,P+d);assert.equal(glyphDimensions(eng.params)[2],P);
 const L=glyphLayout(emb.params);assert.deepEqual(L.plate,[-(P+d)/2,-(P+d)/2+P]);checks+=7;}
// 3. Bevel: chamfer removes more than round; both below the plain volume; meshed from OCCT (solidMesh) and the plain
//    Manifold path is untouched (bevel 0). Emboss + bevel and Engrave + rim bevel.
for(const [c,extra] of [['A',{}],['A',{plate:2,plateMargin:2}],['o',{plate:2,plateMargin:2,engrave:true}],['T',{plate:3,plateMargin:1,engrave:true}],['T',{}]]){
 const base=occt(g(c,extra)),ch=occt(g(c,{...extra,bevel:.5})),rd=occt(g(c,{...extra,bevel:.5,bevelProfile:'round'}));
 assert.ok(ch<base&&rd<base&&ch<rd,`${c} ${JSON.stringify(extra)} bevel volumes ${base} ${rd} ${ch}`);
 // Architect F7 ruling 2: OCCT meshes only the bevelled part (glyphBevelPart); the plate is Manifold. Same solid as the all-OCCT build.
 const o=g(c,{...extra,bevel:.5}),m=solidMesh(glyphBevelPart(o),.05,false);assert.ok(m,'bevelled part has an OCCT mesh');close(mesh(o).v,ch,5e-3,c+' bevel mesh volume (OCCT bevel + Manifold plate ≈ all-OCCT)');
 close(mesh(g(c,{...extra,bevel:.5,bevelProfile:'round'})).v,rd,5e-3,c+' round bevel mesh volume');checks+=4;}
// The bevel part is shared: changing only the plate never changes the OCCT key (cached bevel).
assert.deepEqual(glyphBevelPart(g('A',{bevel:.5,plate:2,plateMargin:2})),glyphBevelPart(g('A',{bevel:.5,plate:4,plateMargin:1})));assert.deepEqual(glyphBevelPart(g('A',{bevel:.5,plate:2})),glyphBevelPart(g('A',{bevel:.5})));checks+=2;
// 4. Impossible bevel: retried at half, then the exact ADR error (also through makeObject).
// Halved bevel: recorded (bevelUsed) and reported per part for the notice.
{const o=g('R',{bevel:.25}),s=baseShapeForTest(o);try{assert.equal(s.bevelUsed,.125,'R at 0.25 mm only bevels at 0.125 mm');}finally{s.delete();}
 const m=solidMesh(glyphBevelPart(o),.15,false);assert.equal(m.bevelUsed,.125);assert.equal(glyphBevelNote(o),.125);assert.equal(glyphBevelNote(g('A',{bevel:.25})),null);
 const full=baseShapeForTest(g('A',{bevel:.25}));try{assert.equal(full.bevelUsed,undefined);}finally{full.delete();}checks+=5;}
// A valid OCCT bevel whose mesh is open (round 'm' at 0.5 mm, default size) counts as failed: half-size retry + note;
// round 'j' fails at both sizes and gives the bevel error (glyph-chamfer-robustness.md).
{const o=g('m',{bevel:.5,bevelProfile:'round'}),s=makeObject(K,o,.15);try{assert.ok(s.volume()>0);}finally{s.delete();}assert.equal(glyphBevelNote(o),.25,"open 'm' mesh retried at half");
 assert.throws(()=>makeObject(K,g('j',{bevel:.5,bevelProfile:'round'}),.15),{message:"Bevel not possible on 'j' at this size"});checks+=3;}
for(const o of [g('R',{bevel:.5}),g('B',{bevel:.5,plate:2,plateMargin:1}),g('A',{bevel:20})]){
 assert.throws(()=>finishedShapeForTest(o),{message:`Bevel not possible on '${o.params.char}' at this size`});assert.throws(()=>makeObject(K,o,.05),{message:`Bevel not possible on '${o.params.char}' at this size`});checks+=2;}
// 5. Validators ('Invalid dimensions.'), minimum version, stretch.
const proj=o=>({...blank(),objects:[o],version:3});
for(const bad of [{bevel:-1},{bevelProfile:'fillet'},{plate:-2},{plateMargin:-1},{engrave:'yes'},{bevel:'1'}])
 {assert.throws(()=>validateProject(proj(g('A',bad))),{message:'Invalid dimensions.'},JSON.stringify(bad));checks++;}
for(const bad of [{engrave:true},{plate:1,engrave:true},{plate:.5,engrave:true}]){assert.throws(()=>validateProject(proj(g('A',bad))),{message:'Engrave needs a plate thicker than 1 mm.'});checks++;}
for(const ok of [{bevel:.5},{bevelProfile:'round'},{plate:2,plateMargin:0},{plate:1.01,engrave:true},{depth:8,plate:2,engrave:true},{engrave:false}]){validateProject(proj(g('A',ok)));checks++;}
assert.equal(requiredVersion({objects:[g('A')]}),2);assert.equal(requiredVersion({objects:[g('A',{plate:2})]}),3);assert.equal(requiredVersion({objects:[g('A',{bevel:0})]}),3);
{const o=g('A',{plate:2,plateMargin:1.5}),d=dimensions(o);
 const z=stretch(o,2,1,3);assert.equal(z.params.plate,2);close(z.params.depth,o.params.depth+3,1e-9,'emboss Z stretch → depth');
 const x=stretch(o,0,1,4);close(dimensions(x)[0],d[0]+4,1e-9,'plate X stretch');assert.equal(x.params.plateMargin,1.5);
 const e=g('A',{plate:2,plateMargin:1,engrave:true}),ez=stretch(e,2,1,1);assert.equal(ez.params.plate,3);assert.equal(ez.params.depth,e.params.depth);
 const p=g('A');assert.deepEqual(stretch(p,2,1,3).params,{...p.params,depth:p.params.depth+3});checks+=7;}
console.log(`glyph finish (F7): ${checks} checks passed`);
