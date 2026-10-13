// Regenerates the AvalonCad 2.4.0 (.tcad v1) migration fixtures with the unmodified 2.4.0 code:
//   node tests/fixtures/make-fixtures.mjs
import fs from 'node:fs';
import {legacy} from '../legacy-240.mjs';
const L=await legacy(),K=await L.kernel.initKernel();
const {booleanResult,withRoundover}=L.operations,{evaluateBoolean}=L.model;
const box=(id,w,d,h,position=[0,0,0],layerId='layer-1',mode='solid')=>({id,name:id,type:'box',params:{w,d,h},position,rotation:[0,0,0],mode,enabled:true,layerId});
const cyl=(id,diameter,h,position=[0,0,0],layerId='layer-1',mode='solid')=>({id,name:id,type:'cylinder',params:{diameter,h},position,rotation:[0,0,0],mode,enabled:true,layerId});
const two=[{id:'layer-1',name:'Layer 1'},{id:'layer-2',name:'Layer 2'}];
const project=(name,objects,layers=[{id:'layer-1',name:'Layer 1'}])=>({format:'tristancad',version:1,name,objects,layers,activeLayer:layers[0].id,buildPlaneEnabled:false});
// Mirrors boolean-tools.mjs 2.4.0: subtract the first shape from the others, baking the given layer cutouts.
function subtract(id,cutter,targets,cutouts=[]){const info=evaluateBoolean(K,[cutter,...targets],'subtract',.03,cutouts);return booleanResult([cutter,...targets],'subtract',id,info.bounds,cutouts);}
function add(id,objects,cutouts=[],fill=false){const info=evaluateBoolean(K,objects,'add',.03,cutouts,fill);return booleanResult(objects,'add',id,info.bounds,cutouts,fill);}
const out={};
{const t=box('target',20,20,10),c=box('cutter',10,10,20,[2,1,0]);out['simple-subtract']=project('Simple subtract',[subtract('simple-result',c,[t])]);}
{const c=box('multi-cutter',40,4,20),l=box('left',10,10,10,[-10,0,0]),r=box('right',10,10,10,[10,0,0]);out['multi-target']=project('Multi-target subtract',[subtract('multi-result',c,[l,r])]);}
{const stripe=box('stripe',100,2,20,[0,0,0],'layer-1','cut'),a=box('a',10,10,10,[-10,0,0]),b={...box('b',10,10,10,[10,0,0]),excludedCutouts:['stripe']},c=cyl('drill',4,30,[0,3,0]);c.params.diameter=30;c.params.h=3;c.rotation=[90,0,0];
 const far=cyl('far-hole',3,30,[60,0,0],'layer-1','cut'),bystander=box('bystander',10,10,10,[40,0,0]);
 const result=subtract('layered-result',c,[a,b],[stripe]),late=box('late-hole',3,30,30,[-12,0,0],'layer-1','cut');
 out['existing-cutouts']=project('Subtract over existing cutouts',[result,stripe,far,bystander,late]);}
{const t=box('target',20,20,10),c=cyl('cutter',8,20,[3,0,0]);const r=subtract('kept-result',c,[t]);out['keep-cutter']=project('Keep cutter',[r,{...structuredClone(c),enabled:false}]);}
{const t=box('target',20,20,10),c=cyl('cutter',8,20),r=subtract('inner-sub',c,[t]),extra=box('extra',10,10,10,[12,0,0]);out['subtract-in-add']=project('Subtract inside Add',[add('outer-add',[r,extra])]);}
{const t=box('p-target',20,20,10,[0,0,0],'A'),c=box('p-cutter',6,30,30,[0,0,0],'A'),r=subtract('p-sub',c,[t]),plug=box('p-plug',4,4,4,[0,0,0],'B'),hole=box('p-hole',2,2,20,[8,8,0],'A','cut'),layers=[{id:'A',name:'First'},{id:'B',name:'Second'}];
 const parts=[r,plug,hole],bounds=L.kernel.buildModel(K,{...project('x',parts,layers)},.03).bounds,record=L.prefabs.makePrefab(parts,'Prefab with subtract',bounds,layers),inst={...record.object,id:'prefab-instance',layerId:'layer-1',position:[5,5,7]};
 out['prefab-subtract']=project('Prefab containing subtract',[inst]);}
{const t1=box('t1',20,20,10),c1=box('c1',6,6,30,[0,0,0]),r1=subtract('l1-result',c1,[t1]),bystander=box('bystander',8,8,8,[0,0,12]);bystander.params.h=30;
 const t2=box('t2',20,20,10,[0,0,0],'layer-2'),c2=cyl('c2',10,30,[5,5,0],'layer-2'),r2=subtract('l2-result',c2,[t2]),l2hole=cyl('l2-hole',3,30,[-6,-6,0],'layer-2','cut');
 out['two-layer']=project('Two layers',[r1,bystander,r2,l2hole],two);}
{const base=box('base',30,30,10),c1=box('c1',8,8,30,[-6,0,0]),first=subtract('first',c1,[base]);first.rotation=[10,20,30];first.position=[3,-2,4];const c2=cyl('c2',6,40,[8,0,4]);c2.rotation=[0,15,0];out['nested-rotated']=project('Subtract of a rotated subtract',[subtract('second',c2,[first])]);}
{const t=box('target',20,20,10),c=box('cutter',10,10,20),r=subtract('stretched',c,[t]);r.scale=[1.5,1,1];const f=subtract('fill-flag',box('c3',4,4,20,[30,0,0]),[box('t3',10,10,10,[30,0,0])]);f.params.fillOverlaps=true;
 const jc=subtract('joined-cut',structuredClone(subtract('cut-group',box('c4',2,2,20,[60,0,0]),[box('inner',6,6,6,[60,0,0])])),[box('t4',10,10,10,[60,0,0])]);
 out['fallbacks']=project('Fallback cases',[r,f,jc]);}
{const objects=Array.from({length:98},(_,i)=>box('filler-'+i,1,1,1,[(i%10)*3+50,Math.floor(i/10)*3,0]));const c=box('lim-cutter',40,4,20),l=box('lim-left',10,10,10,[-10,0,0]),r=box('lim-right',10,10,10,[10,0,0]);out['over-limit']=project('Over the object limit',[subtract('lim-result',c,[l,r]),...objects]);}
for(const [name,p] of Object.entries(out)){L.kernel.validateProject(p);L.kernel.buildModel(K,p,.03);fs.writeFileSync(new URL(name+'.tcad',import.meta.url),JSON.stringify(p,null,1)+'\n');}
console.log('Wrote',Object.keys(out).length,'2.4.0 fixtures.');
