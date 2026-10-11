import assert from 'node:assert/strict';
import {initKernel,buildModel,validateProject,writeSTL,readSTL} from '../web/kernel.mjs';
import {facetedSphere} from '../web/facets.mjs';
import {object,blank} from '../web/templates.mjs';
import {stretch,dimensions,alignFaceCenters,withRoundover} from '../web/operations.mjs';
const K=await initKernel();
const project=o=>({...blank(),objects:Array.isArray(o)?o:[o]});
function model(o,t=.15){return buildModel(K,validateProject(project(o)),t,true);}
// Count connected coplanar triangle groups in the resulting STL independently
// of the CAD face metadata, and require every edge to have two opposing uses.
function flatFaces(vertices,triangles){
 const points=i=>Array.from(vertices.slice(i*3,i*3+3)),key=i=>points(i).join(','),normals=[],adj=Array.from({length:triangles.length/3},()=>[]),edges=new Map();
 for(let t=0;t<triangles.length;t+=3){const [a,b,c]=Array.from(triangles.slice(t,t+3)).map(points),u=b.map((v,i)=>v-a[i]),v=c.map((x,i)=>x-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...n);assert.ok(length>1e-10,'Nonzero triangle');normals.push(n.map(x=>x/length));for(let i=0;i<3;i++){const x=key(triangles[t+i]),y=key(triangles[t+(i+1)%3]),k=[x,y].sort().join('|');if(!edges.has(k))edges.set(k,[]);edges.get(k).push({t:t/3,sign:x<y?1:-1});}}
 for(const pair of edges.values()){assert.equal(pair.length,2,'Closed watertight edge');assert.equal(pair[0].sign+pair[1].sign,0,'Opposite edge orientation');const a=pair[0].t,b=pair[1].t;// Float32 STL coordinates can perturb normals on skinny triangles.
 if(normals[a].reduce((s,v,i)=>s+v*normals[b][i],0)>.99999){adj[a].push(b);adj[b].push(a);}}
 let count=0;const seen=new Set();for(let i=0;i<adj.length;i++)if(!seen.has(i)){count++;const queue=[i];seen.add(i);while(queue.length){const j=queue.pop();for(const n of adj[j])if(!seen.has(n)){seen.add(n);queue.push(n);}}}return count;
}
let checks=0;
for(const count of [4,5,6,7,8,9,12,20,32,128,512]){
 const o=object('sphere',{diameter:25});o.resolution={mode:'faces',count};
 const m=model(o),fine=model(o,.005);assert.equal(m.parts[0].topology.faceCount,count);assert.equal(m.parts[0].topology.flatFaces,count);assert.ok(m.volume>0);assert.deepEqual(Array.from(fine.triangles),Array.from(m.triangles),'Fixed facets survive export quality');
 const stl=readSTL(writeSTL(m.vertices,m.triangles));assert.equal(flatFaces(stl.vertices,stl.triangles),count,'Actual STL planar faces');assert.ok(Math.abs(Math.max(...m.bounds.max.map((v,i)=>v-m.bounds.min[i]))-25)<1e-4,'Overall size');assert.equal(facetedSphere(count).length,count);checks++;
}
const cube=object('sphere',{diameter:25});cube.resolution={mode:'faces',count:6};const cm=model(cube);assert.equal(cm.volume,15625);assert.equal(cm.triangles.length/3,12);
const f=cm.parts[0].topology.faces.find(f=>f.normal[2]>.9);const rounded=model(withRoundover(cube,f.edges,.8),.03);assert.ok(rounded.volume<cm.volume);assert.ok(rounded.parts[0].topology.faceCount>6);checks++;
for(const type of ['cylinder','cone','tube','rounded']){
 const p={cylinder:{diameter:20,h:10},cone:{diameter:20,top:5,h:10},tube:{diameter:20,inner:12,h:10},rounded:{w:30,d:20,h:10,r:3}}[type],o=object(type,p);o.resolution={mode:'faces',count:type==='rounded'?2:6};const m=model(o);assert.equal(flatFaces(m.vertices,m.triangles),type==='tube'||type==='rounded'?14:8);assert.equal(m.parts[0].topology.flatFaces,m.parts[0].topology.faceCount);checks++;
}
const odd=object('cylinder',{diameter:20,h:10});odd.resolution={mode:'faces',count:5};const before=model(odd),after=model(stretch(odd,0,1,5));assert.ok(Math.abs(after.bounds.min[0]-before.bounds.min[0])<1e-4,'Odd-sided shape anchors opposite face');assert.ok(Math.abs(dimensions(odd)[0]-(before.bounds.max[0]-before.bounds.min[0]))<1e-4);checks++;
const box=object('box',{w:30,d:30,h:10}),snapped=alignFaceCenters(cube,2,-1,box,2,1);assert.deepEqual(snapped.position,[0,0,17.48]);const united=model([box,snapped]);assert.ok(united.volume<30*30*10+15625);checks++;
const smooth=object('sphere',{diameter:25}),coarse=model(smooth);smooth.resolution={mode:'tolerance',tolerance:.005};const detailed=model(smooth);assert.ok(detailed.triangles.length>coarse.triangles.length);assert.deepEqual(Array.from(model(smooth,.15).triangles),Array.from(model(smooth,.005).triangles));checks++;
const serialized=JSON.parse(JSON.stringify(project(cube)));assert.equal(validateProject(serialized).objects[0].resolution.count,6);checks++;
for(const resolution of [{mode:'faces',count:3},{mode:'faces',count:513},{mode:'faces',count:6.5},{mode:'tolerance',tolerance:0},{mode:'bad'}]){const o=structuredClone(cube);o.resolution=resolution;assert.throws(()=>validateProject(project(o)));checks++;}
console.log('PASS:',checks,'resolution cases: exact planar STL counts, watertight edges, fixed export facets, smooth deviation, fillets, odd-sided stretching, snapping and backup validation.');
