// WS3 (ADR v2): persistent render resources. Shared materials survive dispose(); pooled geometries share per key,
// recycle by layout with values identical to a fresh build, and are really released one generation later.
import assert from 'node:assert/strict';import * as T from 'three';
import {material,geometryPool,updateInPlace,updateChanged,uploads,sphere,beginSpheres} from '../web/render-resources.mjs';import {PERSISTENT_GL} from '../web/perf-flags.mjs';
if(!PERSISTENT_GL){console.log('render-resources: PERSISTENT_GL is off; skipped');process.exit(0);}
const a=material('basic',T.MeshBasicMaterial,{color:0x9af0cf,transparent:true,opacity:.18}),b=material('basic',T.MeshBasicMaterial,{color:0x9af0cf,transparent:true,opacity:.18});
assert.equal(a,b);let fired=0;a.addEventListener('dispose',()=>fired++);a.dispose();assert.equal(fired,0,'shared material ignores dispose');
assert.notEqual(material('basic',T.MeshBasicMaterial,{color:0x9af0cf,transparent:true,opacity:.45}),a);assert.notEqual(material('line',T.LineBasicMaterial,{color:0x9af0cf}),material('basic',T.MeshBasicMaterial,{color:0x9af0cf}));
const arrays=g=>JSON.stringify([Object.fromEntries(Object.entries(g.attributes).map(([k,x])=>[k,Array.from(x.array)])),g.index?Array.from(g.index.array):null]);
// spheres: same radius shares, a new radius recycles last generation's geometry with fresh-identical values
beginSpheres();const s1=sphere(T.SphereGeometry,2.5,10,8);assert.equal(sphere(T.SphereGeometry,2.5,10,8),s1);beginSpheres();
const s2=sphere(T.SphereGeometry,3.25,10,8);assert.equal(s2,s1,'recycled');assert.equal(arrays(s2),arrays(new T.SphereGeometry(3.25,10,8)));assert.equal(s2.boundingSphere,null);
const s3=sphere(T.SphereGeometry,7,12,8);assert.notEqual(s3,s1,'different layout is not recycled');
// release: a geometry unused for a whole generation is really disposed
const pool=geometryPool();let released=0;pool.begin();const g=pool.get('k',()=>new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3(1,2,3)]));g.addEventListener('dispose',()=>released++);
g.dispose();assert.equal(released,0);pool.begin();assert.equal(released,0);pool.begin();assert.equal(released,1);
// updateInPlace refuses mismatched layouts
const box=new T.BoxGeometry(1,1,1);assert.equal(updateInPlace(box,{position:new Float32Array(3)}),false);
const flat=new T.BufferGeometry();flat.setAttribute('position',new T.BufferAttribute(new Float32Array(6),3));const ver=flat.attributes.position.version;
assert.equal(updateInPlace(flat,{position:new Float32Array([1,2,3,4,5,6])}),true);assert.deepEqual(Array.from(flat.attributes.position.array),[1,2,3,4,5,6]);assert.ok(flat.attributes.position.version>ver);
// WS10: updateChanged writes and uploads only the changed span of each array; unchanged arrays are not uploaded.
{const g=new T.BufferGeometry(),P=Float32Array.from({length:30},(_,i)=>i),N=Float32Array.from({length:30},(_,i)=>-i),I=Uint32Array.from([0,1,2,2,3,4,5,6,7,7,8,9]);
 g.setAttribute('position',new T.BufferAttribute(P.slice(),3));g.setAttribute('normal',new T.BufferAttribute(N.slice(),3));g.setIndex(new T.BufferAttribute(I.slice(),1));
 const nv=g.attributes.normal.version,iv=g.index.version,P2=P.slice();P2[7]=70;P2[12]=-0;P2[13]=130;const u=uploads.bytes;
 assert.equal(updateChanged(g,{position:P2,normal:N.slice()},I.slice()),true);assert.deepEqual(Array.from(g.attributes.position.array),Array.from(P2));
 assert.ok(Object.is(g.attributes.position.array[12],-0),'bit-level compare keeps -0');assert.deepEqual(g.attributes.position.updateRanges,[{start:7,count:7}]);
 assert.equal(g.attributes.normal.version,nv);assert.equal(g.index.version,iv);assert.equal(uploads.bytes-u,28);
 assert.equal(updateChanged(g,{position:P2},I),false,'attribute set must match');assert.equal(updateChanged(g,{position:P2,normal:N},I.subarray(3)),false,'index length must match');
 const plain=new T.BufferGeometry();plain.setAttribute('position',new T.BufferAttribute(P.slice(),3));plain.setAttribute('normal',new T.BufferAttribute(N.slice(),3));assert.equal(updateChanged(plain,{position:P,normal:N},I),false,'non-indexed geometry is never updated as indexed');}
console.log('render-resources: shared materials, sphere/tool geometry pools and in-place updates ok');
