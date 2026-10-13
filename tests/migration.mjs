import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadPyodide} from 'pyodide';
import {initKernel,buildModel,validateProject} from '../web/kernel.mjs';
import {initLocalEngine} from '../web/local-engine.mjs';
import {migrateProject,migratePrefabRecord} from '../web/migrate.mjs';
import {validatePrefab} from '../web/prefabs.mjs';
import {layerOf} from '../web/layers.mjs';
import {legacy} from './legacy-240.mjs';
// ADR criteria 17-22: every 2.4.0 fixture loads as v2 and renders exactly like 2.4.0 did.
const L=await legacy(),oldK=await L.kernel.initKernel(),K=await initKernel();
const runtime=await initLocalEngine(K,{loadPyodide,pythonURL:process.cwd()+'/node_modules/pyodide/',pythonSource:fs.readFileSync('engine/python/model_jobs.py','utf8'),rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
let checks=0,id=0;const job=data=>{const r=runtime.process({id:++id,...data});if(r.error)throw Error(r.error);return r;};
const fixture=name=>JSON.parse(fs.readFileSync(new URL('./fixtures/'+name+'.tcad',import.meta.url),'utf8'));
const names=fs.readdirSync(new URL('./fixtures/',import.meta.url)).filter(f=>f.endsWith('.tcad')).map(f=>f.slice(0,-5)).sort();
assert.ok(names.length>=10);
const subtracts=list=>list.flatMap(o=>[...(o.type==='joined'&&o.params.operation==='subtract'?[o]:[]),...(o.type==='prefab'?subtracts(o.params.children):[])]);
function pieces(m){if(!m.triangles.length)return 0;const s=new K.Manifold(new K.Mesh({numProp:3,vertProperties:m.vertices,triVerts:m.triangles}));const parts=s.decompose();try{return parts.filter(p=>p.volume()>0).length;}finally{parts.forEach(p=>p.delete());s.delete();}}
// Sampled symmetric Hausdorff distance (vertices and triangle centroids to the other surface).
function pointTriangle(p,a,b,c){const sub=(u,v)=>[u[0]-v[0],u[1]-v[1],u[2]-v[2]],dot=(u,v)=>u[0]*v[0]+u[1]*v[1]+u[2]*v[2],ab=sub(b,a),ac=sub(c,a),ap=sub(p,a),d1=dot(ab,ap),d2=dot(ac,ap);if(d1<=0&&d2<=0)return a;const bp=sub(p,b),d3=dot(ab,bp),d4=dot(ac,bp);if(d3>=0&&d4<=d3)return b;const vc=d1*d4-d3*d2;if(vc<=0&&d1>=0&&d3<=0){const v=d1/(d1-d3);return [a[0]+v*ab[0],a[1]+v*ab[1],a[2]+v*ab[2]];}const cp=sub(p,c),d5=dot(ab,cp),d6=dot(ac,cp);if(d6>=0&&d5<=d6)return c;const vb=d5*d2-d1*d6;if(vb<=0&&d2>=0&&d6<=0){const w=d2/(d2-d6);return [a[0]+w*ac[0],a[1]+w*ac[1],a[2]+w*ac[2]];}const va=d3*d6-d5*d4;if(va<=0&&d4-d3>=0&&d5-d6>=0){const w=(d4-d3)/((d4-d3)+(d5-d6));return [b[0]+w*(c[0]-b[0]),b[1]+w*(c[1]-b[1]),b[2]+w*(c[2]-b[2])];}const den=1/(va+vb+vc),v=vb*den,w=vc*den;return [a[0]+ab[0]*v+ac[0]*w,a[1]+ab[1]*v+ac[1]*w,a[2]+ab[2]*v+ac[2]*w];}
function oneSided(A,B){const vb=i=>[B.vertices[i*3],B.vertices[i*3+1],B.vertices[i*3+2]],tris=[];for(let t=0;t<B.triangles.length;t+=3)tris.push([vb(B.triangles[t]),vb(B.triangles[t+1]),vb(B.triangles[t+2])]);
 const samples=[];for(let i=0;i<A.vertices.length;i+=3)samples.push([A.vertices[i],A.vertices[i+1],A.vertices[i+2]]);for(let t=0;t<A.triangles.length;t+=3){const p=[0,1,2].map(k=>A.triangles[t+k]*3);samples.push([0,1,2].map(j=>(A.vertices[p[0]+j]+A.vertices[p[1]+j]+A.vertices[p[2]+j])/3));}
 let worst=0;for(const p of samples){let best=Infinity;for(const [a,b,c] of tris){const q=pointTriangle(p,a,b,c),d=Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);if(d<best)best=d;if(best<1e-9)break;}worst=Math.max(worst,best);}return worst;}
const hausdorff=(A,B)=>Math.max(oneSided(A,B),oneSided(B,A));
function close(a,b,label,rel=1e-6){assert.ok(Math.abs(a-b)<=rel*Math.max(1,Math.abs(b)),`${label}: ${a} vs ${b}`);}
function same(oldModel,newModel,label){close(newModel.volume,oldModel.volume,label+' volume');
 if(oldModel.bounds||newModel.bounds)for(const k of ['min','max'])for(let i=0;i<3;i++)assert.ok(Math.abs(newModel.bounds[k][i]-oldModel.bounds[k][i])<=1e-6,`${label} bounds ${k}${i}: ${newModel.bounds[k][i]} vs ${oldModel.bounds[k][i]}`);
 assert.equal(pieces(newModel),pieces(oldModel),label+' piece count');}
const report=[];
for(const name of names){
 const v1=fixture(name),snapshot=JSON.stringify(v1),warnings=[];
 const migrated=validateProject(migrateProject(v1,warnings));assert.equal(JSON.stringify(v1),snapshot,'input is not mutated');
 assert.equal(migrated.version,2);
 // 22: idempotent, and 2.4.0 refuses v2 instead of misrendering.
 assert.equal(JSON.stringify(migrateProject(migrated)),JSON.stringify(migrated));assert.throws(()=>L.kernel.validateProject(migrated),/not a supported/);
 // 18: identical render (2.4.0 kernel on v1 vs this kernel on v2), total and per layer, preview and STL resolution.
 const oldModel=L.kernel.buildModel(oldK,L.kernel.validateProject(v1),.03),newModel=buildModel(K,migrated,.03);same(oldModel,newModel,name);
 for(const layer of migrated.layers){const only=p=>({...p,objects:p.objects.filter(o=>layerOf(o)===layer.id)});same(L.kernel.buildModel(oldK,only(L.kernel.validateProject(v1)),.03),buildModel(K,only(migrated),.03),name+' '+layer.name);}
 const oldSTL=L.kernel.buildModel(oldK,L.kernel.validateProject(v1),.01),newSTL=job({type:'export',project:migrated,tolerance:.01,ground:false});
 const stlEqual=oldSTL.triangles.length/3===newSTL.triangles;close(newSTL.volume,oldSTL.volume,name+' STL volume');let distance=0;
 // ADR 18: equal STL triangle count, or (if tessellation order changes) equal volume and Hausdorff distance within 1e-4 mm.
 if(!stlEqual){distance=hausdorff(oldSTL,buildModel(K,migrated,.01));assert.ok(distance<=1e-4,name+' Hausdorff '+distance);}
 const preview=job({type:'preview',project:migrated,tolerance:.03});close(preview.volume,oldModel.volume,name+' Python preview');
 report.push(`${name}: ${v1.objects.length}→${migrated.objects.length} objects, volume ${oldModel.volume.toFixed(4)}, STL triangles ${oldSTL.triangles.length/3}/${newSTL.triangles}${stlEqual?'':' (differs; Hausdorff '+distance.toExponential(2)+' mm)'}, ${warnings.length} warning(s)`);
 // 17: no subtract-joined objects remain except documented fallbacks (which warn).
 const left=subtracts(migrated.objects);if(left.length)assert.ok(warnings.length>=1,name+' fallback warns');
 if(!['fallbacks','over-limit'].includes(name))assert.equal(left.length,0,name+' still has Subtract results');
 checks++;
}
// 19: extracted cutouts are top-level cut objects on the original layer; unrelated solids are not newly cut.
{const m=migrateProject(fixture('two-layer'));const c1=m.objects.find(o=>o.name==='c1'),bystander=m.objects.find(o=>o.id==='bystander'),c2=m.objects.find(o=>o.name==='c2');
 assert.equal(c1.mode,'cut');assert.equal(c1.layerId,'layer-1');assert.equal(c2.mode,'cut');assert.equal(c2.layerId,'layer-2');assert.ok(bystander.excludedCutouts.includes(c1.id));assert.ok(!c1.sourceMode&&!c1.positionReference);
 const t1=m.objects.find(o=>o.name==='t1');assert.equal(t1.mode,'solid');assert.ok(!t1.excludedCutouts?.includes(c1.id));assert.notEqual(c1.id,'c1');checks++;}
{const m=migrateProject(fixture('existing-cutouts')),ids=new Set(m.objects.map(o=>o.id));assert.equal(ids.size,m.objects.length,'fresh unique ids');
 const late=m.objects.find(o=>o.id==='late-hole'),a=m.objects.find(o=>o.name==='a');assert.ok(late&&!a.excludedCutouts?.includes('late-hole'),'a cutout added after the subtract keeps cutting the parts');
 assert.ok(a.excludedCutouts.includes('stripe'),'baked layer cutouts never cut again');assert.equal(m.objects.filter(o=>o.id==='stripe').length,1);checks++;}
// 20: kept disabled copies stay present, disabled and unchanged.
{const v1=fixture('keep-cutter'),m=migrateProject(v1),copy=v1.objects[1],kept=m.objects.find(o=>o.id===copy.id),newCut=m.objects.find(o=>o.mode==='cut');const {excludedCutouts,...rest}=kept;assert.deepEqual(rest,copy);assert.equal(kept.enabled,false);
 // Only addition: it excludes the extracted cutout, so re-enabling the copy later still shows the full shape as in 2.4.0.
 assert.deepEqual(excludedCutouts,[newCut.id]);assert.equal(m.objects.filter(o=>o.mode==='cut').length,1);checks++;}
// 21: fallbacks stay joined, render identically (checked above) and produce one warning toast message each.
{const w=[],m=migrateProject(fixture('fallbacks'),w);assert.equal(subtracts(m.objects).length,3);assert.equal(w.length,3);assert.ok(w.every(x=>/kept as a combined object/.test(x)));
 const o=[],lim=migrateProject(fixture('over-limit'),o);assert.equal(lim.objects.length,99);assert.equal(o.length,1);assert.ok(/limit/.test(o[0]));
 const n=[],nested=migrateProject(fixture('subtract-in-add'),n);assert.equal(nested.objects[0].params.operation,'add');assert.equal(n.length,1);checks++;}
// Prefab children use the prefab's own internal layers.
{const m=migrateProject(fixture('prefab-subtract')),children=m.objects[0].params.children;assert.equal(subtracts(children).length,0);assert.ok(children.some(c=>c.mode==='cut'&&c.layerId==='A'));assert.ok(children.every(c=>['A','B'].includes(c.layerId)));
 const record={format:'avaloncad-prefab',version:1,id:'r',name:'Legacy prefab',createdAt:1,object:{...fixture('prefab-subtract').objects[0]}},migratedRecord=validatePrefab(migratePrefabRecord(record));assert.equal(migratedRecord.version,1);assert.equal(subtracts(migratedRecord.object.params.children).length,0);checks++;}
// v2 and non-project input pass through unchanged.
{const v2={format:'tristancad',version:2,objects:[],layers:[{id:'layer-1',name:'Layer 1'}],activeLayer:'layer-1'};assert.equal(migrateProject(v2),v2);assert.throws(()=>validateProject({...v2,version:1}),/not a supported/);assert.throws(()=>validateProject({...v2,version:3}),/not a supported/);checks++;}
console.log(report.join('\n'));
console.log('PASS:',checks,'migration cases: 2.4.0 fixtures (simple, multi-target, existing cutouts, keep-cutter copy, subtract inside Add, prefab, two layers, nested rotated, fallbacks, over-limit) load as v2 with identical 2.4.0 volume, per-layer volume, bounds, piece count and STL triangles (or Hausdorff ≤1e-4 mm where tessellation order changes); fresh ids, layer-local cutouts, idempotence and 2.4.0 rejection.');
runtime.destroy();
