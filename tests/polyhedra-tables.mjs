// Phase-1 unit tests for the advanced planar shapes (ADR new-primitives-polyhedra-text §2.1, §5.1–5.3).
// Pure JS: node tests/polyhedra-tables.mjs. With MANIFOLD_MODULES=<dir containing manifold-3d>
// it also builds every shape as a Manifold mesh (status, genus, volume).
// Per Sean's ruling the cube is NOT a table: "Cube" stays the existing 20 mm box.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {UNIT_POLYHEDRA,DECAHEDRON_FACES,DECAHEDRON_CANONICAL_RATIO} from '../web/polyhedra-tables.mjs';
import {polyhedronFaces,polyBounds,POLYHEDRON_TYPES,ADVANCED_FACE_TYPES} from '../web/polyhedra-shapes.mjs';
import {decahedronVertices,faceNormal} from '../web/polyhedra-geometry.mjs';
import {generate} from '../tools/polyhedra/gen.mjs';

let checks=0;const ok=()=>checks++;
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],len=a=>Math.hypot(...a);
const s5=Math.sqrt(5),rel=(a,b)=>Math.abs(a-b)/Math.abs(b);
const SIDES={triprism:[4,3,3,4,4],tetrahedron:3,octahedron:3,decahedron:4,dodecahedron:5,icosahedron:3};
const FACES={triprism:5,tetrahedron:4,octahedron:8,decahedron:10,dodecahedron:12,icosahedron:20};
const TRIS={triprism:8,tetrahedron:4,octahedron:8,decahedron:20,dodecahedron:36,icosahedron:20};
const DEFAULTS={triprism:{w:30,d:40,h:26},tetrahedron:{size:30},octahedron:{size:25},decahedron:{diameter:20,h:36},dodecahedron:{size:11},icosahedron:{size:16}};
const volumeOf=(type,p)=>({
 triprism:p.w*p.h*p.d/2,tetrahedron:p.size**3/(6*Math.SQRT2),octahedron:Math.SQRT2*p.size**3/3,
 dodecahedron:(15+7*s5)*p.size**3/4,icosahedron:5*(3+s5)*p.size**3/12,
 // d10: 10 pyramids from the centre; the kite diagonals are perpendicular, giving (10/3)·H·r²·sin 36°.
 decahedron:10/3*(p.h/2)*(p.diameter/2)**2*Math.sin(Math.PI/5)})[type];

function meshVolume(V,F){let v=0;for(const f of F)for(let i=1;i<f.length-1;i++)v+=dot(V[f[0]],cross(V[f[i]],V[f[i+1]]))/6;return v;}
function fan(F){const t=[];for(const f of F)for(let i=1;i<f.length-1;i++)t.push(f[0],f[i],f[i+1]);return t;}

// Full structural check of one solid; `scale` is a length used for relative tolerances.
function checkSolid(type,params,{vertices:V,faces:F},scale){
 const tag=type+' '+JSON.stringify(params),eps=1e-12*scale;
 assert.equal(F.length,FACES[type],tag+' face count');
 const sides=SIDES[type];F.forEach((f,i)=>assert.equal(f.length,Array.isArray(sides)?sides[i]:sides,tag+' sides'));
 // Closed 2-manifold with consistent orientation: every directed edge once, its reverse once.
 const directed=new Set();
 for(const f of F)for(let i=0;i<f.length;i++){const k=f[i]+'>'+f[(i+1)%f.length];assert.ok(!directed.has(k),tag+' duplicate edge');directed.add(k);}
 for(const k of directed){const [a,b]=k.split('>');assert.ok(directed.has(b+'>'+a),tag+' open or flipped edge');}
 const E=directed.size/2;assert.equal(V.length-E+F.length,2,tag+' Euler');
 assert.ok(new Set(F.flat()).size===V.length,tag+' unused vertex');
 const lo=[0,1,2].map(k=>Math.min(...V.map(p=>p[k]))),hi=[0,1,2].map(k=>Math.max(...V.map(p=>p[k]))),centre=V.reduce((s,p)=>[s[0]+p[0]/V.length,s[1]+p[1]/V.length,s[2]+p[2]/V.length],[0,0,0]);
 for(const f of F){
  const n=faceNormal(V,f),d=dot(n,V[f[0]]);
  for(const i of f)assert.ok(Math.abs(dot(n,V[i])-d)<=eps,tag+' non-planar face '+Math.abs(dot(n,V[i])-d));
  for(const p of V)assert.ok(dot(n,p)-d<=eps,tag+' not convex');
  const fc=f.reduce((s,i)=>[s[0]+V[i][0],s[1]+V[i][1],s[2]+V[i][2]],[0,0,0]).map(x=>x/f.length);
  assert.ok(dot(n,sub(fc,centre))>0,tag+' inward normal');
  for(let i=0;i<f.length;i++){const a=V[f[i]],b=V[f[(i+1)%f.length]],c=V[f[(i+2)%f.length]];assert.ok(dot(cross(sub(b,a),sub(c,b)),n)>0,tag+' face not strictly convex');}
 }
 // Face-down: face 0 lies exactly on Z = min, its first edge exactly parallel to X, face behind it (+Y).
 const f0=F[0];for(const i of f0)assert.equal(V[i][2],lo[2],tag+' bottom face not level');
 assert.equal(V[f0[0]][1],V[f0[1]][1],tag+' bottom edge not parallel to X');assert.ok(Math.abs(V[f0[0]][0]-V[f0[1]][0])>scale*1e-3);
 assert.ok(f0.every(i=>V[i][1]>=V[f0[0]][1]-eps),tag+' bottom face not behind its edge');
 assert.ok(dot(faceNormal(V,f0),[0,0,-1])>1-1e-15,tag+' bottom normal');
 for(let k=0;k<3;k++)assert.ok(Math.abs(lo[k]+hi[k])<=eps,tag+' not centred');
 const bounds=polyBounds(type,params);for(let k=0;k<3;k++)assert.ok(Math.abs(bounds[k]-(hi[k]-lo[k]))<=eps,tag+' polyBounds');
 assert.ok(rel(meshVolume(V,F),volumeOf(type,params))<1e-9,tag+' volume '+meshVolume(V,F)+' vs '+volumeOf(type,params));
 assert.equal(fan(F).length/3,TRIS[type],tag+' triangles');
 if(params.size){const edges=[...directed].map(k=>k.split('>').map(Number)).map(([a,b])=>len(sub(V[a],V[b])));for(const e of edges)assert.ok(Math.abs(e-params.size)<=eps,tag+' irregular edge');}
 checks++;
}

// --- generated tables are current and well-formed ----------------------------------------
assert.equal(generate(),fs.readFileSync(new URL('../web/polyhedra-tables.mjs',import.meta.url),'utf8'),'web/polyhedra-tables.mjs is stale: run node tools/polyhedra/gen.mjs');ok();
assert.deepEqual(Object.keys(UNIT_POLYHEDRA),['tetrahedron','octahedron','dodecahedron','icosahedron']);
assert.deepEqual([...POLYHEDRON_TYPES],['tetrahedron','octahedron','decahedron','dodecahedron','icosahedron']);
assert.deepEqual([...ADVANCED_FACE_TYPES],['triprism',...POLYHEDRON_TYPES]);ok();
// Sean's ruling: no cube/hexahedron table; Cube is the existing box.
for(const t of ['cube','hexahedron','box','wedge','pyramid','torus','glyph'])assert.throws(()=>polyhedronFaces(t,{size:10,w:1,d:1,h:1}),/Unknown planar primitive/,t);
assert.ok(!('cube' in UNIT_POLYHEDRA)&&!('hexahedron' in UNIT_POLYHEDRA));ok();
assert.ok(Object.isFrozen(UNIT_POLYHEDRA)&&Object.isFrozen(DECAHEDRON_FACES));ok();
// Unit tables: planarity ≤ 1e-12 absolute, edge 1, size equals the vertex bbox.
for(const [type,t] of Object.entries(UNIT_POLYHEDRA)){checkSolid(type,{size:1},t,1);const lo=[0,1,2].map(k=>Math.min(...t.vertices.map(p=>p[k]))),hi=[0,1,2].map(k=>Math.max(...t.vertices.map(p=>p[k])));assert.deepEqual(t.size,hi.map((v,k)=>v-lo[k]));}
// Exact face-down heights: inradius·2 for the face-to-face solids, known closed forms.
const H={tetrahedron:Math.sqrt(2/3),octahedron:Math.sqrt(2/3),dodecahedron:Math.sqrt(2.5+11/10*s5),icosahedron:(3+s5)/(2*Math.sqrt(3))*1};
for(const [type,h] of Object.entries(H))assert.ok(Math.abs(UNIT_POLYHEDRA[type].size[2]-h)<1e-12,type+' height '+UNIT_POLYHEDRA[type].size[2]+' vs '+h);ok();
// d10 canonical proportion = dual of the uniform pentagonal antiprism = (5+√5)/4 ≈ 1.809 (ADR §4 A.1).
assert.ok(Math.abs(DECAHEDRON_CANONICAL_RATIO-(5+s5)/4)<1e-14);ok();

// --- defaults (ADR §2.1 / ruling 4) and other sizes ---------------------------------------
const DEFAULT_BBOX={triprism:[30,40,26],tetrahedron:[30,25.98,24.49],octahedron:[25,28.87,20.41],decahedron:[30.58,20,16.16],dodecahedron:[28.8,30.28,24.5],icosahedron:[25.89,29.89,24.18]};
for(const type of ADVANCED_FACE_TYPES){
 const p=DEFAULTS[type];checkSolid(type,p,polyhedronFaces(type,p),40);
 assert.deepEqual(polyBounds(type,p).map(v=>+v.toFixed(2)),DEFAULT_BBOX[type],type+' default bbox');
}
ok();
for(const k of [0.1,1,7.5,250,1000]){
 for(const type of ['tetrahedron','octahedron','dodecahedron','icosahedron'])checkSolid(type,{size:k},polyhedronFaces(type,{size:k}),k*3);
 checkSolid('triprism',{w:k,d:2*k,h:0.5*k},polyhedronFaces('triprism',{w:k,d:2*k,h:0.5*k}),k*2);
 checkSolid('decahedron',{diameter:k,h:1.8*k},polyhedronFaces('decahedron',{diameter:k,h:1.8*k}),k*2);
}
// d10 kites stay exactly planar and congruent for any h/D (h is separately editable).
for(const ratio of [0.3,0.8,1.2,DECAHEDRON_CANONICAL_RATIO,2.5,5,12]){
 const p={diameter:20,h:20*ratio},m=polyhedronFaces('decahedron',p);checkSolid('decahedron',p,m,20*Math.max(1,ratio));
 const area=f=>len(f.slice(1,-1).reduce((s,_,i)=>{const c=cross(sub(m.vertices[f[i+1]],m.vertices[f[0]]),sub(m.vertices[f[i+2]],m.vertices[f[0]]));return [s[0]+c[0],s[1]+c[1],s[2]+c[2]];},[0,0,0]))/2;
 const a0=area(m.faces[0]);for(const f of m.faces)assert.ok(rel(area(f),a0)<1e-12,'d10 kites not congruent');
 // Upright construction has the same volume as the laid-down solid.
 assert.ok(rel(meshVolume(decahedronVertices(p.diameter,p.h),DECAHEDRON_FACES),volumeOf('decahedron',p))<1e-12);
}
ok();
// Uniform scaling (Stretch on polyhedra scales `size`, d10 scales diameter and h together).
for(const type of POLYHEDRON_TYPES){
 const p=DEFAULTS[type],q=Object.fromEntries(Object.entries(p).map(([k,v])=>[k,v*1.5])),a=polyhedronFaces(type,p),b=polyhedronFaces(type,q);
 a.vertices.forEach((v,i)=>v.forEach((x,k)=>assert.ok(Math.abs(b.vertices[i][k]-1.5*x)<1e-12*60,type+' scaling')));
 assert.deepEqual(a.faces,b.faces);
}
ok();
// Callers get fresh arrays: mutating a result never touches the frozen tables.
const m1=polyhedronFaces('icosahedron',{size:1});m1.vertices[0][0]=99;m1.faces[0][0]=99;
assert.notEqual(UNIT_POLYHEDRA.icosahedron.vertices[0][0],99);assert.notEqual(UNIT_POLYHEDRA.icosahedron.faces[0][0],99);ok();
// UI-safe: the three modules import only each other.
for(const f of ['polyhedra-shapes.mjs','polyhedra-geometry.mjs','polyhedra-tables.mjs']){
 const src=fs.readFileSync(new URL('../web/'+f,import.meta.url),'utf8'),imports=[...src.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(x=>x[1]);
 for(const i of imports)assert.ok(['./polyhedra-tables.mjs','./polyhedra-geometry.mjs'].includes(i),f+' imports '+i);
}
ok();

// --- optional Manifold cross-check ---------------------------------------------------------
let note='Manifold cross-check skipped (set MANIFOLD_MODULES)';
if(process.env.MANIFOLD_MODULES){
 const {default:Module}=await import(path.join(process.env.MANIFOLD_MODULES,'manifold-3d/manifold.js'));const M=await Module();M.setup();
 for(const type of ADVANCED_FACE_TYPES){
  const p=DEFAULTS[type],{vertices,faces}=polyhedronFaces(type,p),mesh=new M.Mesh({numProp:3,vertProperties:new Float32Array(vertices.flat()),triVerts:new Uint32Array(fan(faces))}),solid=new M.Manifold(mesh);
  try{assert.equal(solid.status(),'NoError',type);assert.equal(solid.genus(),0,type);assert.equal(solid.numTri(),TRIS[type],type);assert.ok(rel(solid.volume(),volumeOf(type,p))<1e-6,type+' Manifold volume');}finally{solid.delete();}
 }
 ok();note='Manifold: 6 shapes NoError, genus 0, tri counts, volume within 1e-6 (float32 vertices)';
}
console.log('PASS:',checks,'polyhedra checks: generator up to date, no cube table, closed oriented 2-manifolds, Euler 2, planarity ≤1e-12·scale, convexity, outward normals, face-down + X-aligned bottom edge, centred bbox, analytic volumes, regular edges, d10 planar/congruent for any h/D, uniform scaling, UI-safe imports.');
console.log('  '+note);
