import assert from 'node:assert/strict';
import fs from 'node:fs';
import {initKernel,buildModel,writeSTL,readSTL,validateProject,segments,assertSimplePolygon} from '../web/kernel.mjs';
import {blank,plate,tray,object} from '../web/templates.mjs';
const K=await initKernel();
// Example outputs go to build/ (git-ignored), not the shared ../deliverables folder.
const OUT='build/test-output';fs.mkdirSync(OUT,{recursive:true});
function closed(v,t){const edges=new Map(),key=i=>v.slice(i*3,i*3+3).join(',');for(let i=0;i<t.length;i+=3)for(let j=0;j<3;j++){const a=key(t[i+j]),b=key(t[i+(j+1)%3]);const k=[a,b].sort().join('|'),e=edges.get(k)||[0,0];e[0]++;e[1]+=a<b?1:-1;edges.set(k,e);}for(const e of edges.values()){assert.equal(e[0],2,'edge must have two incident triangles');assert.equal(e[1],0,'edge orientation must cancel');}}
let checks=0;
for(const p of [plate(),tray()])for(const tol of [.15,.03,.01,.005]) {
 validateProject(p);const m=buildModel(K,p,tol,true);assert.ok(m.volume>0);closed(m.vertices,m.triangles);
 const stl=writeSTL(m.vertices,m.triangles),read=readSTL(stl);assert.equal(stl.byteLength,84+m.triangles.length/3*50);closed(new Float32Array(read.vertices),new Uint32Array(read.triangles));
 const loaded=blank();loaded.objects.push(object('mesh',{mesh:read}));const round=buildModel(K,loaded,tol);assert.ok(Math.abs(round.volume-m.volume)<.1);checks++;
 if(p.name==='Mounting plate'&&tol===.005){fs.writeFileSync(OUT+'/Example-Mounting-Plate.stl',new Uint8Array(stl));fs.writeFileSync(OUT+'/Example-Mounting-Plate.tcad',JSON.stringify(p,null,2));}
}
const p=blank();p.objects=[object('box',{w:20,d:30,h:10},[0,0,5])];let m=buildModel(K,p,.01);assert.equal(m.volume,6000);assert.deepEqual(m.bounds,{min:[-10,-15,0],max:[10,15,10]});checks++;
const hole=object('cylinder',{diameter:6,h:20},[0,0,5]);hole.mode='cut';p.objects.push(hole);m=buildModel(K,p,.005);assert.ok(Math.abs(m.volume-(6000-Math.PI*9*10))<1);closed(m.vertices,m.triangles);checks++;
hole.enabled=false;assert.equal(buildModel(K,p,.01).volume,6000);hole.enabled=true;hole.position=[500,0,0];assert.equal(buildModel(K,p,.01).volume,6000);checks++;
const types=[['cylinder',{diameter:20,h:10}],['sphere',{diameter:25}],['tube',{diameter:30,inner:20,h:12}],['cone',{diameter:30,top:0,h:20}],['rounded',{w:20,d:20,h:10,r:10}],['polygon',{h:10,points:[[0,0],[30,0],[30,10],[10,10],[10,30],[0,30]]}]];
for(const [type,params] of types){const p=blank();p.objects.push(object(type,params,[4,-5,20]));p.objects[0].rotation=[15,30,70];validateProject(p);const m=buildModel(K,p,.01);assert.ok(m.volume>0);closed(m.vertices,m.triangles);checks++;}
assert.throws(()=>assertSimplePolygon([[0,0],[10,10],[0,10],[10,0]]));assert.throws(()=>validateProject({format:'bad',objects:[]}));const bad=blank();bad.objects=[object('tube',{diameter:20,inner:25,h:10})];assert.throws(()=>validateProject(bad));checks++;
for(const radius of [1,10,100])for(const t of [.15,.03,.01,.005])assert.ok(radius*(1-Math.cos(Math.PI/segments(radius,t)))<=t+1e-8);
const elevated=blank();elevated.objects.push(object('box',{w:5,d:5,h:5},[0,0,40]));const em=buildModel(K,elevated,.01),grounded=readSTL(writeSTL(em.vertices,em.triangles));assert.equal(Math.min(...grounded.vertices.filter((_,i)=>i%3===2)),0);checks++;
console.log('PASS:',checks,'geometry cases, closed oriented meshes, STL round trips, dimensions, cutouts, transforms, disabled objects, sketch validation and curve tolerances.');
