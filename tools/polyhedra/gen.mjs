#!/usr/bin/env node
// Generates web/polyhedra-tables.mjs (ADR new-primitives-polyhedra-text §2.1, Phase A.1).
//
//   node tools/polyhedra/gen.mjs           write the tables
//   node tools/polyhedra/gen.mjs --check   exit 1 if the committed file is stale
//
// Starts from the exact textbook vertex sets (golden ratio φ for the dodecahedron and
// icosahedron), takes the convex hull, orders every face counter-clockwise seen from
// outside, lays face 0 down with web/polyhedra-geometry.mjs orientFaceDown(), scales to
// edge length 1 and prints the result as literals. The output is deterministic:
// numbers use JavaScript's shortest round-trip form.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sub,cross,dot,unit,faceNormal,orientFaceDown,decahedronVertices} from '../../web/polyhedra-geometry.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const OUTPUT=path.join(root,'web/polyhedra-tables.mjs');
const phi=(1+Math.sqrt(5))/2,pm=[-1,1];

// Raw vertex sets and their exact edge lengths.
const RAW={
 tetrahedron:{edge:2*Math.SQRT2,vertices:[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]]},
 octahedron:{edge:Math.SQRT2,vertices:[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]},
 dodecahedron:{edge:2/phi,vertices:(()=>{const v=[];for(const x of pm)for(const y of pm)for(const z of pm)v.push([x,y,z]);for(const a of pm)for(const b of pm)v.push([0,a/phi,b*phi],[a/phi,b*phi,0],[b*phi,0,a/phi]);return v;})()},
 icosahedron:{edge:2,vertices:(()=>{const v=[];for(const a of pm)for(const b of pm)v.push([0,a,b*phi],[a,b*phi,0],[b*phi,0,a]);return v;})()},
};
export const FACE_SIDES={tetrahedron:3,octahedron:3,dodecahedron:5,icosahedron:3};

// Brute-force convex hull faces (≤ 20 vertices), each ordered CCW about its outward normal.
export function hullFaces(V,eps=1e-9){
 const faces=[],seen=new Set();
 for(let i=0;i<V.length;i++)for(let j=i+1;j<V.length;j++)for(let k=j+1;k<V.length;k++){
  let n=cross(sub(V[j],V[i]),sub(V[k],V[i]));
  if(Math.hypot(...n)<eps)continue;
  n=unit(n);let d=dot(n,V[i]),pos=0,neg=0;
  for(const p of V){const s=dot(n,p)-d;if(s>eps)pos++;else if(s<-eps)neg++;}
  if(pos&&neg)continue;
  if(pos){n=n.map(x=>-x);d=-d;}
  const on=V.map((p,idx)=>Math.abs(dot(n,p)-d)<eps?idx:-1).filter(x=>x>=0),key=on.join(',');
  if(seen.has(key))continue;seen.add(key);
  const c=[0,1,2].map(a=>on.reduce((s,idx)=>s+V[idx][a],0)/on.length),u=unit(sub(V[on[0]],c)),w=cross(n,u);
  on.sort((a,b)=>Math.atan2(dot(sub(V[a],c),w),dot(sub(V[a],c),u))-Math.atan2(dot(sub(V[b],c),w),dot(sub(V[b],c),u)));
  faces.push(on);
 }
 return faces;
}

// Canonical sort so the output does not depend on hull discovery order: rotate each
// face to start at its smallest index, then sort faces lexicographically.
function canonical(faces){
 return faces.map(f=>{const m=f.indexOf(Math.min(...f));return [...f.slice(m),...f.slice(0,m)];}).sort((a,b)=>{for(let i=0;i<Math.min(a.length,b.length);i++)if(a[i]!==b[i])return a[i]-b[i];return a.length-b.length;});
}

function build(type){
 const {edge,vertices}=RAW[type],faces=canonical(hullFaces(vertices));
 const V=orientFaceDown(vertices,faces,0).map(p=>p.map(v=>{const r=v/edge;return Math.abs(r)<1e-15?0:r;}));
 const lo=[0,1,2].map(k=>Math.min(...V.map(p=>p[k]))),hi=[0,1,2].map(k=>Math.max(...V.map(p=>p[k])));
 return {vertices:V,faces,size:hi.map((v,k)=>v-lo[k])};
}

// d10 topology: kite k = [top apex, upper ring k, lower ring k, upper ring k+1] and
// [bottom apex, lower ring k+1, upper ring k+1, lower ring k]; vertex order from
// decahedronVertices(): 0 top, 1 bottom, 2+2k upper ring, 3+2k lower ring.
function decahedronFaces(){
 const U=k=>2+2*(k%5),L=k=>3+2*(k%5),faces=[];
 for(let k=0;k<5;k++)faces.push([0,U(k),L(k),U(k+1)]);
 for(let k=0;k<5;k++)faces.push([1,L(k+1),U(k+1),L(k)]);
 const V=decahedronVertices(2,3.6);
 for(const f of faces){const n=faceNormal(V,f),c=f.reduce((s,i)=>[s[0]+V[i][0],s[1]+V[i][1],s[2]+V[i][2]],[0,0,0]);if(dot(n,c)<=0)throw Error('d10 face is not outward');}
 return faces;
}

// Canonical d10 proportion: polar dual of the uniform pentagonal antiprism, reported as
// apex half-height / ring radius (ADR: ≈ 1.809) and as h / ring diameter.
function canonicalD10(){
 const s=Math.PI/5,R=1/(2*Math.sin(s)),zh=Math.sqrt(1-2*R*R*(1-Math.cos(s)))/2; // unit edge: pentagon circumradius R, half height zh
 // Dual vertices = poles of the antiprism faces with respect to its midsphere (radius ρ).
 const pts=[];for(let k=0;k<5;k++){pts.push([R*Math.cos(2*s*k),R*Math.sin(2*s*k),zh],[R*Math.cos(2*s*k+s),R*Math.sin(2*s*k+s),-zh]);}
 const edgeMid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],rho2=dot(edgeMid(pts[0],pts[2]),edgeMid(pts[0],pts[2]));
 if(Math.abs(rho2-dot(edgeMid(pts[0],pts[1]),edgeMid(pts[0],pts[1])))>1e-12)throw Error('antiprism has no midsphere');
 // Top pentagon face plane z = zh → pole (0,0,ρ²/zh). A side triangle (pts 0,1,2) → pole n·ρ²/d.
 const apex=rho2/zh,a=pts[0],b=pts[1],c=pts[2],n=unit(cross(sub(b,a),sub(c,a))),d=Math.abs(dot(n,a)),pole=n.map(v=>v*rho2/d*Math.sign(dot(n,a)));
 const r=Math.hypot(pole[0],pole[1]);
 return {apexOverRadius:apex/r,ringZOverApex:Math.abs(pole[2])/apex};
}

const num=v=>Object.is(v,-0)?'0':String(v);
const list=a=>'['+a.map(num).join(',')+']';

export function generate(){
 const tables={};for(const type of ['tetrahedron','octahedron','dodecahedron','icosahedron'])tables[type]=build(type);
 for(const [type,t] of Object.entries(tables))if(!t.faces.every(f=>f.length===FACE_SIDES[type]))throw Error(type+' face sides');
 const d10=canonicalD10(),c=Math.cos(Math.PI/5);
 if(Math.abs(d10.ringZOverApex-(1-c)/(1+c))>1e-12)throw Error('d10 ring height does not match the planar-kite rule');
 const out=['// GENERATED by tools/polyhedra/gen.mjs. Do not edit; run `node tools/polyhedra/gen.mjs`.',
  '// Unit-edge face-down tables for the regular polyhedra (ADR new-primitives-polyhedra-text §2.1).',
  '// Each solid rests on face 0 at Z = min, with that face\'s first edge parallel to X, and is',
  '// centred on its bounding box. Faces are counter-clockwise seen from outside. `size` is the',
  '// bounding box at edge 1; multiply vertices and size by the edge length in mm.',
  '// The tables are marked pure so a bundle that only needs UNIT_SIZES (main.js, for dimensions) drops them.',
  'export const UNIT_POLYHEDRA=/* @__PURE__ */Object.freeze({'];
 for(const [type,t] of Object.entries(tables)){
  out.push(` ${type}:/* @__PURE__ */Object.freeze({`,`  size:${list(t.size)},`,`  vertices:[`,...t.vertices.map((p,i)=>`   ${list(p)}${i<t.vertices.length-1?',':''}`),'  ],',`  faces:[${t.faces.map(f=>list(f)).join(',')}]`,' }),');
 }
 out[out.length-1]=' })';out.push('});');
 out.push('// d10 (pentagonal trapezohedron) topology over decahedronVertices() in polyhedra-geometry.mjs:',
  '// 0 top apex, 1 bottom apex, 2+2k upper ring, 3+2k lower ring. Ten planar kites.',
  '// Unit-edge bounding-box sizes (the same values as UNIT_POLYHEDRA[type].size), UI-safe and small.',
  `export const UNIT_SIZES=Object.freeze({${Object.entries(tables).map(([type,t])=>`${type}:${list(t.size)}`).join(',')}});`,
  `export const DECAHEDRON_FACES=Object.freeze([${decahedronFaces().map(f=>list(f)).join(',')}]);`,
  '// Canonical d10 (dual of the uniform pentagonal antiprism): apex half-height / ring radius,',
  '// which equals apex-to-apex height h / ring diameter. Defaults use 36 / 20 = 1.8.',
  `export const DECAHEDRON_CANONICAL_RATIO=${num(d10.apexOverRadius)};`,'');
 return out.join('\n');
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const text=generate();
 if(process.argv.includes('--check')){
  const current=fs.existsSync(OUTPUT)?fs.readFileSync(OUTPUT,'utf8'):'';
  if(current!==text){console.error('web/polyhedra-tables.mjs is stale; run node tools/polyhedra/gen.mjs');process.exit(1);}
  console.log('web/polyhedra-tables.mjs is up to date');
 }else{fs.writeFileSync(OUTPUT,text);console.log('wrote',path.relative(root,OUTPUT),text.length,'bytes');}
}
