// ADR-0001 F4 (§5.2): exported STL of mirrored objects through the real export job, both kernels. Each case is exported
// unmirrored and mirrored across YZ at the origin; the mirrored STL must be the unmirrored one reflected (same vertex set
// with x negated, same volume), every facet's stored normal must agree with its winding, and the signed volume must be
// positive (normals outward). Covers the Manifold placement path, the OCCT tessellation path (roundovers, threads) and the
// B-rep child path (cad-solid fullShape: a conjoined solid with a roundover over a mirrored child).
import assert from 'node:assert/strict';import fs from 'node:fs';
import {initKernel} from '../web/kernel.mjs';import {initLocalEngine} from '../web/local-engine.mjs';
import {object,defaults,blank} from '../web/templates.mjs';import {mirrorObject,withRoundover} from '../web/operations.mjs';
import {objectTopology} from '../web/cad-solid.mjs';
const K=await initKernel({solidOptions:{wasmBinary:fs.readFileSync('node_modules/replicad-opencascadejs/dist/replicad_single.wasm')}});
const rt=await initLocalEngine(K,{rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
let id=0;const exp=(objects,tolerance)=>{const r=rt.process({id:++id,type:'export',project:{...blank(),objects},tolerance,ground:false});assert.ok(!r.error,r.error);return r;};
function stl(buffer){const d=new DataView(buffer instanceof ArrayBuffer?buffer:buffer.buffer),n=d.getUint32(80,true),tris=[];let signed=0,disagree=0;
 for(let i=0;i<n;i++){const o=84+i*50,f=k=>d.getFloat32(o+k*4,true),nn=[f(0),f(1),f(2)],v=[0,1,2].map(j=>[f(3+j*3),f(4+j*3),f(5+j*3)]);tris.push(v);
  const a=v[1].map((x,k)=>x-v[0][k]),b=v[2].map((x,k)=>x-v[0][k]),c=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],len=Math.hypot(...c);
  if(len>1e-9&&Math.hypot(...nn)>0&&c[0]*nn[0]+c[1]*nn[1]+c[2]*nn[2]<=0)disagree++;
  signed+=(v[0][0]*(v[1][1]*v[2][2]-v[1][2]*v[2][1])-v[0][1]*(v[1][0]*v[2][2]-v[1][2]*v[2][0])+v[0][2]*(v[1][0]*v[2][1]-v[1][1]*v[2][0]))/6;}
 return {n,tris,signed,disagree};}
const key=(v,flip)=>[v[0]*(flip?-1:1),v[1],v[2]].map(x=>(Math.round(x*1e3)/1e3+0).toFixed(3)).join(',');
// A reflected triangle (a,b,c) is wound (a,c,b): compare triangles as rotation-normalised, winding-reversed tuples.
const tri=(t,flip)=>{const k=(flip?[t[0],t[2],t[1]]:t).map(v=>key(v,flip)),i=k.indexOf([...k].sort()[0]);return [k[i],k[(i+1)%3],k[(i+2)%3]].join('|');};
let cases=0;
function check(name,objects,mirrored,tolerance,exact=true){
 const a=stl(exp(objects,tolerance).buffer),b=stl(exp(mirrored,tolerance).buffer);
 assert.equal(b.disagree,0,name+': facet normals disagree with winding');assert.ok(b.signed>0,name+': signed volume '+b.signed);
 assert.ok(Math.abs(b.signed-a.signed)<=1e-4*Math.abs(a.signed),name+': volume '+a.signed+' vs '+b.signed);
 if(exact){assert.equal(b.n,a.n,name+': triangle count');assert.deepEqual(b.tris.map(t=>tri(t,false)).sort(),a.tris.map(t=>tri(t,true)).sort(),name+': mirrored STL is the reflection');}
 cases++;return {a,b};
}
const at=(o,p,r=[0,0,0])=>({...o,position:p,rotation:r});
const box=at(object('box',defaults.box),[12,-3,4],[10,20,30]),edges=objectTopology(box).edges.map(e=>e.index);
const rounded=withRoundover(box,edges.slice(0,4),2),thread=at(object('threadrod',defaults.threadrod),[5,0,0]);
const mir=o=>mirrorObject(o,'YZ',[0,0,0]);
for(const tolerance of [.15,.03]){
 check('wedge (Manifold) '+tolerance,[at(object('wedge',defaults.wedge),[7,9,12],[29,67,-143])],[mir(at(object('wedge',defaults.wedge),[7,9,12],[29,67,-143]))],tolerance);
 check('rounded box (OCCT tessellation) '+tolerance,[rounded],[mir(rounded)],tolerance);
 check('thread (left-handed) '+tolerance,[thread],[mir(thread)],tolerance);
}
// B-rep child path: a conjoined solid with a roundover is built in OCCT from its children (fullShape). Mirroring every
// child across the parent's YZ plane must give the reflection of the original conjoined solid.
const kid=at(withRoundover(object('box',defaults.box),[0,1],1.5),[8,2,0],[0,0,25]),cyl=at(object('box',{w:12,d:10,h:8}),[-6,0,0]);
const joined=children=>{const j={...object('joined',{children}),position:[3,1,2]},edges=objectTopology(j).edges.map(e=>e.index);assert.ok(edges.length>0);return withRoundover(j,edges,.5);};
const plain=joined([kid,cyl]),flipped={...joined([mir(kid),mir(cyl)]),position:[-3,1,2]};assert.ok(flipped.params.children.every(c=>c.mirrored===true));
check('B-rep children (fullShape) .15',[plain],[flipped],.15,false);check('B-rep children (fullShape) .03',[plain],[flipped],.03,false);
// Twice mirrored is the original object: identical STL bytes.
const r1=exp([rounded],.15),r2=exp([mir(mir(rounded))],.15);assert.ok(Buffer.from(r1.buffer).equals(Buffer.from(r2.buffer)),'twice mirrored = original STL bytes');
rt.destroy?.();console.log(`mirror-stl: ${cases} export cases (Manifold, OCCT tessellation, thread, B-rep children): facet normals agree with winding, signed volume > 0 and equal to the original; Manifold/OCCT/thread exports are the exact reflection; twice mirrored = identical bytes`);
