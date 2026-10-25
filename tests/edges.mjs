// ADR-0001 android-large-mesh-memory (QA F1): web/edges.mjs must give exactly THREE.EdgesGeometry's position buffer
// (byte for byte: same edges, same order) on the real 524k sphere display geometry, the Mounting plate pick geometries
// (tests/fixtures/edges, dumped from the app) and primitives, indexed and not, at the app's angles (28, 15) and others.
// cachedEdges reuses one geometry per source, ignores the overlay's dispose() and releases on source dispose/change.
// Env EDGES_SPHERE: directory with sphere524k-0.pos.f32 / .idx.u32 (default the android-large-mesh-memory artifacts).
import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';
import {edgePositions,cachedEdges} from '../web/edges.mjs';
const bytes=a=>Buffer.from(a.buffer,a.byteOffset,a.byteLength);
const geo=(pos,idx)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));if(idx)g.setIndex(new THREE.BufferAttribute(idx,1));return g;};
const read=(f,T)=>{const b=fs.readFileSync(f);return new T(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));};
let n=0;const check=(name,g,angles=[28,15,1,90])=>{for(const a of angles){const want=new THREE.EdgesGeometry(g,a).getAttribute('position').array,got=edgePositions(g,a);
 assert.equal(got.constructor,Float32Array);assert.equal(got.length,want.length,`${name} @${a}: ${got.length} vs ${want.length} floats`);assert.ok(bytes(got).equals(bytes(want)),`${name} @${a}: bytes differ`);n++;}};
// primitives (indexed and non-indexed), incl. degenerate triangles, -0/0 and NaN positions, duplicate directed edges
const prims={box:new THREE.BoxGeometry(1,2,3,2,2,2),sphere:new THREE.SphereGeometry(5,24,16),cyl:new THREE.CylinderGeometry(1,2,3,17,3),torus:new THREE.TorusKnotGeometry(3,1,64,8),cone:new THREE.ConeGeometry(2,4,9),ico:new THREE.IcosahedronGeometry(2,1)};
for(const [k,g] of Object.entries(prims)){check(k,g);if(g.index)check(k+'-nonindexed',g.toNonIndexed());}
check('odd',geo(new Float32Array([0,0,0,1,0,0,0,1,0,-0,-0,0,1,0,0,0,0,1,0.00004,0,0,1,0,0,0,1,0,NaN,0,0,NaN,0,0,0,0,2,1e9,0,0,0,1e9,0,0,0,1e9]),new Uint32Array([0,1,2,3,4,5,0,1,2,6,7,8,9,10,11,12,13,14,2,1,0])));
check('odd-nonindexed',geo(new Float32Array([0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0.00006,0,0,1,1,1])));
// Mounting plate (app pick geometries)
const fx=new URL('./fixtures/edges/',import.meta.url).pathname;for(let k=0;k<5;k++)check('plate-'+k,geo(read(fx+`plate-${k}.pos.f32`,Float32Array),read(fx+`plate-${k}.idx.u32`,Uint32Array)));
// 524k sphere (app display geometry)
const S=process.env.EDGES_SPHERE||'/workspace/avalon-cad-artifacts/android-large-mesh-memory/edges-fixtures';
const sp=geo(read(S+'/sphere524k-0.pos.f32',Float32Array),read(S+'/sphere524k-0.idx.u32',Uint32Array));
let t=performance.now();const want=new THREE.EdgesGeometry(sp,28).getAttribute('position').array;const tw=performance.now()-t;t=performance.now();const got=edgePositions(sp,28);const tg=performance.now()-t;
assert.ok(bytes(got).equals(bytes(want)),'sphere524k @28 differs');assert.equal(got.length,want.length);n++;check('sphere524k',sp,[15,1,0.1]);
// cache
const g=new THREE.BoxGeometry(1,1,1);const e1=cachedEdges(g,28);assert.equal(cachedEdges(g,28),e1,'reused');let rel=0;e1.addEventListener('dispose',()=>rel++);
e1.dispose();assert.equal(rel,0,'overlay dispose ignored');g.attributes.position.needsUpdate=true;const e2=cachedEdges(g,28);assert.notEqual(e2,e1);assert.equal(rel,1,'released on change');
let rel2=0;e2.addEventListener('dispose',()=>rel2++);g.dispose();assert.equal(rel2,1,'released with source');assert.notEqual(cachedEdges(g,28),e2);
console.log(`edges: ${n} byte-identical comparisons; sphere524k@28 ${want.length/6} edges, THREE ${tw.toFixed(0)} ms, helper ${tg.toFixed(0)} ms`);
