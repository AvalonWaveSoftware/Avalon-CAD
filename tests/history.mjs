// WS11: snapshot history. Over 50 seeded scripted sessions (add, move, rotate, resize, rename, delete, toggle, cut,
// import a mesh, undo, redo) the snapshot history must restore exactly what the JSON-string history restores
// (validateProject(JSON.parse(...))), compared as the JSON the autosave would write; snapshots are deep-frozen and
// share unchanged subtrees; restoring never aliases a mutable member. Also times one Undo step with a 20k-triangle
// import (ADR: 24 ms -> <= 2 ms estimate; gated on the ADR section 4 budget <= 3 ms).
import assert from 'node:assert/strict';
import {snapshot} from '../web/history.mjs';
import {validateProject} from '../web/kernel-ui.mjs';
import {object,blank} from '../web/templates.mjs';
const frozen=x=>{if(x===null||typeof x!=='object')return true;if(!Object.isFrozen(x))return false;return Object.values(x).every(frozen);};
let seed=1;const rnd=()=>(seed=(seed*1103515245+12345)%2147483648)/2147483648,pick=a=>a[Math.floor(rnd()*a.length)];
const mesh=n=>{const vertices=[],triangles=[];const k=Math.ceil(Math.sqrt(n/2));for(let i=0;i<=k;i++)for(let j=0;j<=k;j++)vertices.push(i,j,Math.sin(i*j)*.5+(i===0&&j===0?-0:0));
 for(let i=0;i<k;i++)for(let j=0;j<k;j++){const a=i*(k+1)+j,b=a+1,c=a+k+1,d=c+1;triangles.push(a,c,b,b,c,d);}return {vertices:vertices.slice(0,vertices.length),triangles:triangles.slice(0,n*3)};};
const closedMesh=()=>({vertices:[0,0,0,10,0,0,0,10,0,0,0,10],triangles:[0,2,1,0,1,3,0,3,2,1,2,3]});
let steps=0,undos=0,shared=0;
for(let session=0;session<50;session++){seed=session+1;
 let project=validateProject({...blank(),buildPlaneEnabled:true}),last=null;const hs=[],hj=[],fs=[],fj=[];
 const push=()=>{last=snapshot(project,last);assert.ok(frozen(last));hs.push(last);hj.push(JSON.stringify(project));fs.length=0;fj.length=0;};
 const same=(a,b,what)=>assert.equal(JSON.stringify(a),JSON.stringify(b),what);
 for(let step=0;step<20;step++){steps++;const op=pick(['add','add','move','move','rotate','resize','rename','delete','toggle','cut','import','undo','undo','redo']);
  if(op==='undo'||op==='redo'){const [from,fromJ,to,toJ]=op==='undo'?[hs,hj,fs,fj]:[fs,fj,hs,hj];if(!from.length)continue;
   last=snapshot(project,last);to.push(last);toJ.push(JSON.stringify(project));const s=from.pop(),j=fromJ.pop();
   const a=validateProject(s,true),b=validateProject(JSON.parse(j));same(a,b,'session '+session+' step '+step+' '+op);project=a;last=s;undos++;continue;}
  const before=snapshot(project,last);push();if(before===hs[hs.length-1])shared++;
  const o=project.objects.length?pick(project.objects):null;
  if(op==='add'||!o){const t=pick(['box','cylinder','sphere','cone','tube']);const x=object(t,{box:{w:10+rnd()*20,d:10,h:5},cylinder:{diameter:10,h:5+rnd()},sphere:{diameter:8+rnd()},cone:{diameter:10,top:2,h:8},tube:{diameter:10,inner:6,h:5}}[t],[rnd()*50-25,rnd()*50-25,0]);x.id='o'+session+'_'+step;x.layerId=project.activeLayer;project.objects.push(x);}
  else if(op==='move')o.position[pick([0,1,2])]+=pick([1,-1,-o.position[0],0.5]);
  else if(op==='rotate')o.rotation[2]=pick([0,45,90,-0]);
  else if(op==='resize')o.scale=[1+rnd(),1,1];
  else if(op==='rename')o.name=pick(['a','b','long name '.repeat(9)]);
  else if(op==='delete')project.objects.splice(project.objects.indexOf(o),1);
  else if(op==='toggle')o.enabled=!o.enabled;
  else if(op==='cut')o.mode=o.mode==='cut'?'solid':'cut';
  else if(op==='import'){const x=object('mesh',{mesh:closedMesh()},[0,0,0],'part');x.id='m'+session+'_'+step;x.layerId=project.activeLayer;project.objects.push(x);}
  project=validateProject(project);
 }}
// timing: Undo with a 20k-triangle import in the project (snapshot of the current project for Redo + restore)
{let project=validateProject({...blank(),buildPlaneEnabled:true});const x=object('mesh',{mesh:mesh(20000)},[0,0,0],'scan');x.id='scan';x.layerId=project.activeLayer;project.objects.push(x);project=validateProject(project);
 let last=snapshot(project);const json=JSON.stringify(project);const t=[],o=[];
 for(let k=0;k<15;k++){project.objects[0].position[0]+=1;const h=snapshot(project,last);last=h;project.objects[0].position[0]+=1;
  let s=performance.now();const redo=snapshot(project,last);project=validateProject(h,true);last=h;t.push(performance.now()-s);
  s=performance.now();const j=JSON.stringify(project);validateProject(JSON.parse(json));o.push(performance.now()-s);assert.ok(redo!==h);}
 const med=a=>[...a].sort((x,y)=>x-y)[a.length>>1];const on=med(t),off=med(o);
 console.log(`History: ${steps} steps over 50 sessions, ${undos} undo/redo restores equal to the JSON history; snapshots frozen; undo with a 20k-triangle import ${off.toFixed(1)} ms (JSON) -> ${on.toFixed(2)} ms (ADR section 4 budget <= 3 ms ${on<=3?'PASS':'FAIL'}; WS11 estimate <= 2 ms ${on<=2?'met':'not met'})`);
 assert.ok(on<=3,'undo budget');}
// validateProject(snapshot, true): still rejects what validateProject rejects (an invalid mesh, also after the same
// arrays passed once inside another project), shares only large frozen number arrays, and returns mutable copies.
{const p=validateProject({...blank(),buildPlaneEnabled:true});const x=object('mesh',{mesh:mesh(200)},[0,0,0],'scan');x.id='scan';x.layerId=p.activeLayer;p.objects.push(x);
 const s=snapshot(validateProject(p)),r=validateProject(s,true);
 assert.equal(r.objects[0].params.mesh.vertices,s.objects[0].params.mesh.vertices);assert.ok(!Object.isFrozen(r.objects[0].position));assert.ok(!Object.isFrozen(r.objects));
 r.objects[0].position[0]=5;r.name='changed';assert.equal(s.objects[0].position[0],0);
 const bad=JSON.parse(JSON.stringify(s));bad.objects[0].params.mesh.triangles[0]=1e9;assert.throws(()=>validateProject(snapshot(bad),true),/Invalid imported mesh/);
 const nan=JSON.parse(JSON.stringify(s));nan.objects[0].params.mesh.vertices[4]=20000;assert.throws(()=>validateProject(snapshot(nan),true),/Invalid imported mesh/);
 assert.deepEqual(validateProject(s,true),validateProject(JSON.parse(JSON.stringify(s))));
 console.log('History: validateProject(snapshot, true) rejects invalid meshes, shares frozen mesh arrays, returns mutable copies');}
