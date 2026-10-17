import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadPyodide} from 'pyodide';
import {initKernel,buildModel,validateProject,readSTL} from '../web/kernel.mjs';
import {initLocalEngine} from '../web/local-engine.mjs';
import {blank,object} from '../web/templates.mjs';
import {evaluateBoolean} from './boolean-model.mjs';
import {mergeResult} from '../web/operations.mjs';
import {migrateProject} from '../web/migrate.mjs';
const K=await initKernel(),runtime=await initLocalEngine(K,{loadPyodide,pythonURL:process.cwd()+'/node_modules/pyodide/',pythonSource:fs.readFileSync('engine/python/model_jobs.py','utf8'),rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
let id=0,checks=0;
const job=data=>{const result=runtime.process({id:++id,...data});if(result.error)throw Error(result.error);return result;};
const box=(name,w=10,d=10,h=10,pos=[0,0,0],layer='layer-1',mode='solid')=>({...object('box',{w,d,h},pos,name),id:name,layerId:layer,mode});
const project=objects=>({...blank(),layers:[{id:'layer-1',name:'Layer 1'},{id:'layer-2',name:'Layer 2'}],objects});
function closed(m){const edges=new Map();for(let i=0;i<m.triangles.length;i+=3)for(let j=0;j<3;j++){const a=m.triangles[i+j],b=m.triangles[i+(j+1)%3],key=[a,b].sort((x,y)=>x-y).join(',');const v=edges.get(key)||[];v.push(a<b?1:-1);edges.set(key,v);}for(const v of edges.values()){assert.equal(v.length,2);assert.equal(v[0]+v[1],0);}}
function verify(p,volume){const snapshot=JSON.stringify(p),legacy=buildModel(K,p,.03,true),actual=job({type:'preview',project:p,tolerance:.03});assert.equal(JSON.stringify(p),snapshot);for(const m of [legacy,actual]){assert.ok(Math.abs(m.volume-volume)<1e-7,`${m.volume} vs ${volume}`);closed(m);}assert.deepEqual(actual.bounds,legacy.bounds);const stl=job({type:'export',project:p,tolerance:.005,ground:false});assert.equal(stl.volume,volume);const mesh=readSTL(stl.buffer);assert.ok(mesh.triangles.length>0);assert.equal(stl.buffer.byteLength,84+stl.triangles*50);checks++;}
const legacy=validateProject(migrateProject({format:'tristancad',version:1,objects:[{...box('legacy'),layerId:undefined}]}));assert.equal(legacy.layers[0].name,'Layer 1');assert.equal(legacy.objects[0].layerId,'layer-1');assert.equal(legacy.activeLayer,'layer-1');checks++;
const a=box('a'),hole=box('hole',4,4,4,[0,0,0],'layer-1','cut'),plug=box('plug',4,4,4,[0,0,0],'layer-2');verify(project([a,hole,plug]),1000);
const smallHole=box('small-hole',2,2,2,[0,0,0],'layer-2','cut');verify(project([a,hole,plug,smallHole]),992);
// A cut-only layer never cuts solids on another layer.
verify(project([a,{...hole,layerId:'layer-2'}]),1000);
const left=box('left',10,10,10,[-10,0,0]),right=box('right',10,10,10,[10,0,0]),cutter=box('cutter',40,4,20);
// Subtraction is per-primitive: a layer cutout removes material from every solid on its own layer only.
const cut=o=>({...o,mode:'cut'}),layerCut=cut(cutter);
verify(project([layerCut,left,right]),1200);const protectedPart=box('protected',40,4,10,[0,0,0],'layer-2');verify(project([layerCut,left,right,protectedPart]),2800);assert.equal(buildModel(K,project([layerCut,left,right]),.03).volume,1200);
const entireLeft=cut(box('entire-left',20,20,20,[-10,0,0]));verify(project([entireLeft,left,right]),1000);
assert.throws(()=>evaluateBoolean(K,[a,plug],'add'),/same layer/);assert.throws(()=>job({type:'boolean',objects:[a,plug],operation:'add'}),/same layer/);checks++;
assert.throws(()=>evaluateBoolean(K,[layerCut,left],'subtract'),/Only Merge/);assert.throws(()=>job({type:'boolean',objects:[layerCut,left],operation:'subtract'}),/Only Merge/);checks++;
const stripe=box('stripe',100,2,20,[0,0,0],'layer-1','cut'),partial=cut(box('partial',100,2,20,[0,3,0])),rightWithFill={...right,excludedCutouts:[stripe.id]};
verify(project([partial,left,rightWithFill,stripe]),1400);
const addition=evaluateBoolean(K,[a,box('second',10,10,10,[5,0,0])],'add');const added=mergeResult([a,box('second',10,10,10,[5,0,0])],'added-result',addition.bounds);verify(project([added,{...hole,layerId:'layer-2'}]),1500);
const saved=validateProject(JSON.parse(JSON.stringify(project([layerCut,left,right,protectedPart]))));verify(saved,2800);assert.equal(saved.objects[0].layerId,'layer-1');assert.equal(saved.objects[3].layerId,'layer-2');checks++;
verify(project([{...layerCut,layerId:'layer-2'},left,right]),2000);
for(const malformed of [project([{...a,layerId:'missing'}]),{...project([a]),activeLayer:'missing'},{...project([a]),layers:[]},{...project([a]),layers:[{id:'layer-1',name:'A'},{id:'layer-1',name:'B'}]}]){assert.throws(()=>validateProject(malformed),/layer/i);assert.throws(()=>job({type:'preview',project:malformed}),/layer/i);}checks++;
assert.equal(buildModel(K,legacy,.03).volume,1000);
console.log('PASS:',checks,'layer geometry checks: legacy migration, independent overlapping layers, local cutouts, multi-solid layer cutouts including full removal, per-solid cutout exclusions, Merge-only boolean jobs, cross-layer rejection, closed STL, and actual Python/Rust export parity.');runtime.destroy();
