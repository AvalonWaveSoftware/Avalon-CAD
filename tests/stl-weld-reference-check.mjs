import {readSTLTyped,weldExact} from '../web/worker-stl.mjs';
import assert from 'node:assert/strict';
import os from 'node:os';
import {performance} from 'node:perf_hooks';
import {execFileSync} from 'node:child_process';
import {readSTL} from '../web/kernel-ui.mjs';
import {weldExactReference} from './stl-weld-reference.mjs';
import {sphereSTL,tetraSTL} from './stl-weld-fixtures.mjs';
export const baselineRead=Function(execFileSync('git',['show','6e08e75:web/kernel-ui.mjs'],{encoding:'utf8'}).split('export function readSTL')[1].replace(/^/, 'return function readSTL'))();
export function cornersEqual(a,b){const av=Float32Array.from(a.vertices),bv=Float32Array.from(b.vertices),ab=new Uint32Array(av.buffer),bb=new Uint32Array(bv.buffer);for(let i=0;i<a.triangles.length;i++)for(let k=0;k<3;k++)assert.equal(ab[a.triangles[i]*3+k],bb[b.triangles[i]*3+k],`corner ${i}:${k}`);}
const signed=weldExactReference([0,0,0,-0,0,0,0,0,0,Math.fround(1e-40),0,0],[0,1,2,3,2,1]);assert.equal(signed.vertices.length,9);assert.deepEqual(signed.triangles,[0,1,0,2,0,1]);
const tetra=baselineRead(tetraSTL()),tw=weldExactReference(tetra.vertices,tetra.triangles);assert.equal(tw.vertices.length,12);cornersEqual(tetra,tw);
const ascii=new TextEncoder().encode('solid test\nvertex -0 0 0\nvertex 0 1 0\nvertex 1 0 0\nendsolid').buffer;
assert.deepEqual(readSTLTyped(ascii).vertices,new Float32Array([-0,0,0,0,1,0,1,0,0]));
const invalid=tetraSTL();new DataView(invalid).setFloat32(96,NaN,true);assert.throws(()=>readSTLTyped(invalid),/Invalid STL file/);
const sphere=sphereSTL(),old=baselineRead(sphere),parsed=readSTLTyped(sphere),welded=weldExactReference(parsed.vertices,parsed.triangles);assert.equal(welded.vertices.length,262146*3);assert.equal(welded.triangles.length,524288*3);cornersEqual(old,welded);
const times={baseline:[],parse:[],referenceWeld:[]};for(let i=0;i<5;i++){let t=performance.now();baselineRead(sphere);times.baseline.push(performance.now()-t);t=performance.now();const p=readSTLTyped(sphere);times.parse.push(performance.now()-t);t=performance.now();weldExactReference(p.vertices,p.triangles);times.referenceWeld.push(performance.now()-t);}
console.log('PASS JS reference: signed zero, tetra, 524288 sphere, exact corners');console.log(JSON.stringify({load:os.loadavg(),ms:times,median:Object.fromEntries(Object.entries(times).map(([k,v])=>[k,[...v].sort((a,b)=>a-b)[2]]))}));
