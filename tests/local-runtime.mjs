import assert from 'node:assert/strict';
import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {loadPyodide} from 'pyodide';
import {initKernel,buildModel,writeSTL} from '../web/kernel.mjs';
import {initLocalEngine} from '../web/local-engine.mjs';
import {displayGeometry} from '../web/display-geometry.mjs';
import {blank,object,defaults,advancedDefaults,glyphDefaults,plate,tray} from '../web/templates.mjs';
import {loadGlyphs} from '../web/glyph-geometry.mjs';
import {withRoundover,mergeResult} from '../web/operations.mjs';
import {evaluateBoolean} from './boolean-model.mjs';
import {corners} from './display-corners.mjs';

const K=await initKernel(),start=performance.now();await loadGlyphs();
const runtime=await initLocalEngine(K,{loadPyodide,pythonURL:new URL('../node_modules/pyodide/',import.meta.url).pathname,pythonSource:fs.readFileSync('engine/python/model_jobs.py','utf8'),rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
assert.equal(runtime.info.local,true);assert.equal(runtime.info.rust,5);assert.match(runtime.info.python,/^3\.13\./);
let checks=0,id=0;
const run=data=>{const result=runtime.process({id:++id,...data});assert.equal(result.id,id);if(result.error)throw Error(result.error);return result;};
function previewParity(project,tolerance){
 const snapshot=JSON.stringify(project),legacy=buildModel(K,project,tolerance,true),local=run({type:'preview',project,tolerance});
 assert.equal(JSON.stringify(project),snapshot);assert.ok(Math.abs(local.volume-legacy.volume)<1e-7);assert.deepEqual(local.bounds,legacy.bounds);assert.equal(local.parts.length,legacy.parts.length);
 for(const key of ['vertices','triangles','flatTriangles','smoothingGroups'])assert.ok(Buffer.from(local[key].buffer).equals(Buffer.from(legacy[key].buffer)),key+' parity');
 const D=corners(local);assert.equal(D.positions.length,local.triangles.length*3);
 const old=displayGeometry(local.vertices,local.triangles,local.flatTriangles,undefined,local.smoothingGroups),oldP=old.getAttribute('position').array,oldN=old.getAttribute('normal').array;
 assert.ok(Buffer.from(D.positions.buffer).equals(Buffer.from(oldP.buffer)),'Display position parity');for(let i=0;i<oldN.length;i++)assert.ok(Math.abs(D.normals[i]-oldN[i])<2e-6,'Rust preview must match source-isolated crease and facet normals');old.dispose();
 const exportMesh=buildModel(K,project,tolerance);if(exportMesh.triangles.length)for(const ground of [false,true]){const stl=run({type:'export',project,tolerance,ground});assert.ok(Buffer.from(stl.buffer).equals(Buffer.from(writeSTL(exportMesh.vertices,exportMesh.triangles,ground))),'Exact STL parity');assert.ok(Math.abs(stl.volume-legacy.volume)<1e-7);}
 checks++;console.log('Checked model',checks,project.name,tolerance,local.triangles.length/3,'triangles;',Math.round(process.memoryUsage().rss/1024/1024),'MiB RSS');
}
previewParity(blank(),.15);
for(const p of [plate(),tray()])for(const tolerance of [.15,.03,.01,.005])previewParity(p,tolerance);
// ADR new-primitives-polyhedra-text §5.5: the 12 grid types, the Advanced shapes and the Text tool.
const allDefaults={...defaults,...advancedDefaults,...glyphDefaults};
for(const type of Object.keys(allDefaults)){
 const shape=object(type,structuredClone(allDefaults[type]),[3,-5,20]);shape.rotation=[15,30,70];if(type!=='box')shape.resolution={mode:'tolerance',tolerance:.005};
 previewParity({...blank(),objects:[shape]},.15);
 if(!['box','threadrod','threadtube','wedge','pyramid','torus','glyph',...Object.keys(advancedDefaults),'triprism'].includes(type)){const fixed={...shape,resolution:{mode:'faces',count:type==='rounded'?3:32}};previewParity({...blank(),objects:[fixed]},.03);}
}
const smooth=object('sphere',{diameter:20});smooth.resolution={mode:'tolerance',tolerance:.005};const faceted=object('sphere',{diameter:20},[8,0,0]);faceted.resolution={mode:'faces',count:32};
const info=evaluateBoolean(K,[smooth,faceted],'add'),mixed=mergeResult([smooth,faceted],'mixed-local',info.bounds);previewParity({...blank(),objects:[mixed]},.15);
const cutter=object('cylinder',{diameter:5,h:30});cutter.resolution={mode:'faces',count:12};previewParity({...blank(),objects:[smooth,{...cutter,mode:'cut'}]},.15);
const box=object('box',{w:30,d:20,h:10}),rounded=withRoundover(box,Array.from({length:12},(_,i)=>i),1);previewParity({...blank(),objects:[rounded]},.01);
const roundedFacet=withRoundover({...cutter,params:{diameter:20,h:20}},[0],.5);previewParity({...blank(),objects:[roundedFacet]},.03);
const fillA=object('box',{w:20,d:20,h:10}),fillB=object('box',{w:20,d:20,h:10},[10,0,0]),fillOther=object('box',{w:10,d:10,h:10},[40,8,0]),stripe=object('box',{w:100,d:4,h:20},[0,8,0]);stripe.mode='cut';
const fillInfo=evaluateBoolean(K,[fillA,fillB],'add',.03,[stripe],true),fill=mergeResult([fillA,fillB],'fill-local',fillInfo.bounds,[stripe],true);fill.excludedCutouts=[stripe.id];previewParity({...blank(),objects:[fill,fillOther,stripe]},.03);
for(const operation of ['add']){
 const shapes=[smooth,faceted],expected=evaluateBoolean(K,shapes,operation,.03),actual=run({type:'boolean',objects:shapes,operation,tolerance:.03});
 for(const key of ['count','bounds','volume','removedVolume','targetVolume'])assert.deepEqual(actual[key],expected[key]);checks++;
}
const bad=runtime.process({id:++id,type:'boolean',objects:[cutter,smooth],operation:'subtract',tolerance:.03});assert.ok(bad.error.includes('Only Merge'));const lone=runtime.process({id:++id,type:'boolean',objects:[smooth],operation:'add',tolerance:.03});assert.ok(lone.error.includes('at least two'));checks++;
assert.throws(()=>runtime.rust.prepare(new Float32Array([0,0,0]),new Uint32Array([0,1,2])),/invalid mesh/);
assert.throws(()=>runtime.rust.writeSTL(new Float32Array([NaN,0,0]),new Uint32Array([0,0,0])),/invalid STL/);
assert.throws(()=>runtime.rust.prepare(new Float32Array([0,0,0]),new Uint32Array([0,0,0]),new Uint8Array(2)),/invalid mesh/);checks++;
for(let i=0;i<12;i++)assert.equal(run({type:'preview',project:{...blank(),objects:[box]},tolerance:.15}).volume,6000);checks++;
// Record timings separately from correctness; migration does not imply a speedup.
const dense=buildModel(K,{...blank(),objects:[{...smooth,params:{diameter:100},resolution:{mode:'tolerance',tolerance:.005}}]},.15,true);
const before=performance.now();const oldView=displayGeometry(dense.vertices,dense.triangles,dense.flatTriangles,undefined,dense.smoothingGroups);const javascriptMs=performance.now()-before;oldView.dispose();
const rustStart=performance.now();runtime.rust.prepare(dense.vertices,dense.triangles,dense.flatTriangles,dense.smoothingGroups);const rustMs=performance.now()-rustStart;
console.log('PASS:',checks,'local Python/Rust cases: geometry and exact STL parity, per-object normals, cuts and fills, all-edge fillets, errors and repeated jobs.');
console.log('Runtime:',JSON.stringify(runtime.info),'initialized/tested in',Math.round(performance.now()-start),'ms. Desktop preview sample:',dense.triangles.length/3,'triangles; JS',javascriptMs.toFixed(1),'ms; Rust',rustMs.toFixed(1),'ms. No phone speed claim.');
runtime.destroy();
