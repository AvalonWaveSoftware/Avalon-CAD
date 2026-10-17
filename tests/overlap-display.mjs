import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadPyodide} from 'pyodide';
import {initKernel,buildModel,writeSTL} from '../web/kernel.mjs';
import {initLocalEngine} from '../web/local-engine.mjs';
import {prepareDisplayMesh} from '../web/display-geometry.mjs';
import {blank,object} from '../web/templates.mjs';
import {mergeResult,withRoundover} from '../web/operations.mjs';
import {evaluateBoolean} from './boolean-model.mjs';
import {makePrefab} from '../web/prefabs.mjs';
import {corners} from './display-corners.mjs';

const K=await initKernel(),engine=await initLocalEngine(K,{loadPyodide,pythonURL:process.cwd()+'/node_modules/pyodide/',pythonSource:fs.readFileSync('engine/python/model_jobs.py','utf8'),rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
let checks=0,id=0;
const job=data=>{const result=engine.process({id:++id,...data});if(result.error)throw Error(result.error);return result;};
const smooth=(type,params,position=[0,0,0])=>({...object(type,params,position),resolution:{mode:'tolerance',tolerance:.005}});
const ball=smooth('sphere',{diameter:20},[0,0,-5]),box=object('box',{w:30,d:30,h:8}),p={...blank(),objects:[box,ball]};
function faceNormal(m,f){const p=[0,1,2].map(j=>Array.from(m.vertices.subarray(m.triangles[f*3+j]*3,m.triangles[f*3+j]*3+3))),a=p[1].map((v,i)=>v-p[0][i]),b=p[2].map((v,i)=>v-p[0][i]),n=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],len=Math.hypot(...n);return n.map(v=>v/(len||1));}
function bentTop(m,normals){let bent=0,total=0;for(let f=0;f<m.triangles.length/3;f++)if([0,1,2].every(j=>Math.abs(m.vertices[m.triangles[f*3+j]*3+2]-4)<1e-5)){total++;for(let j=0;j<3;j++)if(Math.abs(normals[f*9+j*3+2]-1)>1e-6)bent++;}assert.ok(total>0);return bent;}
const reproduced=job({type:'preview',project:p,tolerance:.15}),unscoped=engine.rust.prepare(reproduced.vertices,reproduced.triangles);
assert.ok(bentTop(reproduced,unscoped.normals)>0,'The regression case must expose cross-object normal blending');assert.equal(bentTop(reproduced,corners(reproduced).normals),0);
const sphereGroups=new Set();for(let f=0;f<reproduced.flatTriangles.length;f++)if(!reproduced.flatTriangles[f])sphereGroups.add(reproduced.smoothingGroups[f]);assert.equal(sphereGroups.size,1);assert.ok(new Set(reproduced.smoothingGroups).size>=2);checks++;
function verify(project){
 const before=JSON.stringify(project),m=job({type:'preview',project,tolerance:.03}),reference=buildModel(K,project,.03,true),fallback=prepareDisplayMesh(m.vertices,m.triangles,m.flatTriangles,m.smoothingGroups),D=corners(m);
 assert.equal(JSON.stringify(project),before);assert.ok(Math.abs(m.volume-reference.volume)<1e-6);assert.deepEqual(m.bounds,reference.bounds);assert.deepEqual(m.smoothingGroups,reference.smoothingGroups);assert.ok(m.smoothingGroups.every(x=>x>0));
 for(let i=0;i<m.triangles.length;i++)for(let k=0;k<3;k++)assert.equal(D.positions[i*3+k],m.vertices[m.triangles[i]*3+k],'Shading must never move a vertex');
 assert.deepEqual(fallback.positions,D.positions);for(let i=0;i<fallback.normals.length;i++)assert.ok(Math.abs(fallback.normals[i]-D.normals[i])<2e-6);
 for(let f=0;f<m.flatTriangles.length;f++)if(m.flatTriangles[f]){const n=faceNormal(m,f);for(let j=0;j<3;j++)for(let k=0;k<3;k++)assert.ok(Math.abs(D.normals[f*9+j*3+k]-n[k])<2e-6,'Planar/faceted triangles must remain flat across overlaps');}
 const high=buildModel(K,project,.005),stl=job({type:'export',project,tolerance:.005,ground:false});assert.deepEqual(Buffer.from(stl.buffer),Buffer.from(writeSTL(high.vertices,high.triangles,false)));assert.ok(Math.abs(stl.volume-high.volume)<1e-6);checks++;return m;
}
verify(p);
for(const x of [-7,-2,0,2,7]){const moved={...ball,position:[x,0,-5]};verify({...blank(),objects:[box,moved]});assert.equal(moved.params.diameter,20);}
const angled=object('box',{w:20,d:20,h:20},[8,0,0]);angled.rotation=[0,0,20];verify({...blank(),objects:[object('box',{w:20,d:20,h:20}),angled]});
verify({...blank(),objects:[box,{...box,id:'identical-box'}]});
verify({...blank(),objects:[box,smooth('cylinder',{diameter:18,h:12},[0,0,1]),smooth('sphere',{diameter:20},[5,0,-5])]});
const add=evaluateBoolean(K,[box,ball],'add'),joined=mergeResult([box,ball],'overlap-add',add.bounds);verify({...blank(),objects:[joined]});
verify({...blank(),objects:[box,{...ball,mode:'cut'}]});
const cutout={...ball,mode:'cut'};verify({...blank(),objects:[box,cutout]});
const roundBox=withRoundover(object('box',{w:30,d:30,h:8}),[0],.5);verify({...blank(),objects:[roundBox,ball]});
const prefab=makePrefab(p.objects,'Overlapping assembly',reproduced.bounds,p.layers);verify({...blank(),objects:[prefab.object]});
const layered={...blank(),layers:[{id:'layer-1',name:'Base'},{id:'layer-2',name:'Detail'}],objects:[box,cutout,{...ball,id:'protected-sphere',layerId:'layer-2'}]};verify(layered);
// Submillimeter gaps must keep nearby surfaces independent, even in one source mesh.
const angle=20*Math.PI/180,v=new Float32Array([0,0,0,1,0,0,0,1,0,0,0,.002,1,0,.002,0,Math.cos(angle),.002-Math.sin(angle)]),t=new Uint32Array([0,1,2,3,4,5]),thin=engine.rust.prepare(v,t,new Uint8Array(2),new Uint32Array([1,1]));assert.equal(thin.normals[1],0);assert.ok(Math.abs(thin.normals[10]-Math.sin(angle))<1e-6);assert.throws(()=>engine.rust.prepare(v,t,new Uint8Array(2),new Uint32Array([1])),/invalid mesh/);checks++;
console.log('PASS:',checks,'overlap cases: reproduced bent flat-face shading, isolated source normals, precise thin-gap welding, planar/faceted preservation, smooth curves, movement without changed dimensions, identical/angled overlaps, Add/Subtract, fillets, prefabs, layers, unchanged vertex coordinates and exact Maximum STL parity.');engine.destroy();
