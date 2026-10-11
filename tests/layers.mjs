import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadPyodide} from 'pyodide';
import {initKernel,buildModel,validateProject,readSTL} from '../web/kernel.mjs';
import {initLocalEngine} from '../web/local-engine.mjs';
import {blank,object} from '../web/templates.mjs';
import {evaluateBoolean} from '../web/boolean-model.mjs';
import {booleanResult} from '../web/operations.mjs';
const K=await initKernel(),runtime=await initLocalEngine(K,{loadPyodide,pythonURL:process.cwd()+'/node_modules/pyodide/',pythonSource:fs.readFileSync('engine/python/model_jobs.py','utf8'),rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
let id=0,checks=0;
const job=data=>{const result=runtime.process({id:++id,...data});if(result.error)throw Error(result.error);return result;};
const box=(name,w=10,d=10,h=10,pos=[0,0,0],layer='layer-1',mode='solid')=>({...object('box',{w,d,h},pos,name),id:name,layerId:layer,mode});
const project=objects=>({...blank(),layers:[{id:'layer-1',name:'Layer 1'},{id:'layer-2',name:'Layer 2'}],objects});
function closed(m){const edges=new Map();for(let i=0;i<m.triangles.length;i+=3)for(let j=0;j<3;j++){const a=m.triangles[i+j],b=m.triangles[i+(j+1)%3],key=[a,b].sort((x,y)=>x-y).join(',');const v=edges.get(key)||[];v.push(a<b?1:-1);edges.set(key,v);}for(const v of edges.values()){assert.equal(v.length,2);assert.equal(v[0]+v[1],0);}}
function verify(p,volume){const snapshot=JSON.stringify(p),legacy=buildModel(K,p,.03,true),actual=job({type:'preview',project:p,tolerance:.03});assert.equal(JSON.stringify(p),snapshot);for(const m of [legacy,actual]){assert.ok(Math.abs(m.volume-volume)<1e-7,`${m.volume} vs ${volume}`);closed(m);}assert.deepEqual(actual.bounds,legacy.bounds);const stl=job({type:'export',project:p,tolerance:.005,ground:false});assert.equal(stl.volume,volume);const mesh=readSTL(stl.buffer);assert.ok(mesh.triangles.length>0);assert.equal(stl.buffer.byteLength,84+stl.triangles*50);checks++;}
const legacy=validateProject({format:'tristancad',version:1,objects:[{...box('legacy'),layerId:undefined}]});assert.equal(legacy.layers[0].name,'Layer 1');assert.equal(legacy.objects[0].layerId,'layer-1');assert.equal(legacy.activeLayer,'layer-1');checks++;
const a=box('a'),hole=box('hole',4,4,4,[0,0,0],'layer-1','cut'),plug=box('plug',4,4,4,[0,0,0],'layer-2');verify(project([a,hole,plug]),1000);
const smallHole=box('small-hole',2,2,2,[0,0,0],'layer-2','cut');verify(project([a,hole,plug,smallHole]),992);
// A cut-only layer never cuts solids on another layer.
verify(project([a,{...hole,layerId:'layer-2'}]),1000);
const left=box('left',10,10,10,[-10,0,0]),right=box('right',10,10,10,[10,0,0]),cutter=box('cutter',40,4,20);
const info=evaluateBoolean(K,[cutter,left,right],'subtract'),local=job({type:'boolean',objects:[cutter,left,right],operation:'subtract'});assert.equal(info.volume,1200);assert.equal(info.targetVolume,2000);assert.equal(info.removedVolume,800);assert.equal(info.count,4);assert.deepEqual(local,{...info,id:local.id,type:'boolean'});checks++;
const result=booleanResult([cutter,left,right],'subtract','multi-result',info.bounds);assert.equal(result.layerId,'layer-1');assert.equal(result.params.children.length,3);const protectedPart=box('protected',40,4,10,[0,0,0],'layer-2');verify(project([result,protectedPart]),2800);assert.equal(buildModel(K,project([result]),.03).volume,1200);
const entireLeft=box('entire-left',20,20,20,[-10,0,0]);assert.equal(evaluateBoolean(K,[entireLeft,left,right],'subtract').volume,1000);assert.equal(job({type:'boolean',objects:[entireLeft,left,right],operation:'subtract'}).volume,1000);checks++;
assert.throws(()=>evaluateBoolean(K,[box('far',5,5,5,[100,0,0]),left,right],'subtract'),/do not overlap/);assert.throws(()=>evaluateBoolean(K,[box('everything',100,100,100),left,right],'subtract'),/entire part/);checks++;
for(const operation of ['add','subtract']){assert.throws(()=>evaluateBoolean(K,[a,plug],operation),/same layer/);assert.throws(()=>job({type:'boolean',objects:[a,plug],operation}),/same layer/);}checks++;
const stripe=box('stripe',100,2,20,[0,0,0],'layer-1','cut'),partial=box('partial',100,2,20,[0,3,0]),rightWithFill={...right,excludedCutouts:[stripe.id]};
const keptInfo=evaluateBoolean(K,[partial,left,rightWithFill],'subtract',.03,[stripe]);assert.equal(keptInfo.targetVolume,1800);assert.equal(keptInfo.volume,1400);assert.equal(job({type:'boolean',objects:[partial,left,rightWithFill],operation:'subtract',cutouts:[stripe]}).volume,1400);
const kept=booleanResult([partial,left,rightWithFill],'subtract','kept-result',keptInfo.bounds,[stripe]);verify(project([kept,stripe]),1400);checks++;
const addition=evaluateBoolean(K,[a,box('second',10,10,10,[5,0,0])],'add');const added=booleanResult([a,box('second',10,10,10,[5,0,0])],'add','added-result',addition.bounds);verify(project([added,{...hole,layerId:'layer-2'}]),1500);
const saved=validateProject(JSON.parse(JSON.stringify(project([result,protectedPart]))));verify(saved,2800);assert.equal(saved.objects[0].layerId,'layer-1');assert.equal(saved.objects[1].layerId,'layer-2');checks++;
const secondLayerResult={...result,layerId:'layer-2'};assert.ok(evaluateBoolean(K,[box('next-cutter',3,30,30,[-10,0,0],'layer-2'),secondLayerResult],'subtract').volume<1200);checks++;
for(const malformed of [project([{...a,layerId:'missing'}]),{...project([a]),activeLayer:'missing'},{...project([a]),layers:[]},{...project([a]),layers:[{id:'layer-1',name:'A'},{id:'layer-1',name:'B'}]}]){assert.throws(()=>validateProject(malformed),/layer/i);assert.throws(()=>job({type:'preview',project:malformed}),/layer/i);}checks++;
assert.equal(buildModel(K,legacy,.03).volume,1000);
console.log('PASS:',checks,'layer geometry checks: legacy migration, independent overlapping layers, local cutouts, multi-target subtraction including full removal, per-target holes/fills, cross-layer rejection, closed STL, and actual Python/Rust export parity.');runtime.destroy();
