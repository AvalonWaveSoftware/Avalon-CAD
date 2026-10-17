import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadPyodide} from 'pyodide';
import {initKernel,makeObject,validateProject,readSTL} from '../web/kernel.mjs';
import {initLocalEngine} from '../web/local-engine.mjs';
import {defaults,object,blank} from '../web/templates.mjs';
import {stretch,dimensions,mergeResult} from '../web/operations.mjs';
import {parseThreadNumber} from '../web/threads.mjs';
import {corners} from './display-corners.mjs';

const K=await initKernel(),runtime=await initLocalEngine(K,{loadPyodide,pythonURL:process.cwd()+'/node_modules/pyodide/',pythonSource:fs.readFileSync('engine/python/model_jobs.py','utf8'),rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
let id=0,cases=0;
const run=data=>{const r=runtime.process({id:++id,...data});if(r.error)throw Error(r.error);return r;};
const project=o=>validateProject({...blank(),objects:[o]});
function closed(v,t){const edges=new Map();let volume=0;
 for(let i=0;i<t.length;i+=3){const ids=Array.from(t.slice(i,i+3)),a=ids.map(j=>Array.from(v.slice(j*3,j*3+3)));
  const u=a[1].map((x,k)=>x-a[0][k]),w=a[2].map((x,k)=>x-a[0][k]),n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];assert.ok(Math.hypot(...n)>1e-9,'Degenerate triangle');volume+=a[0].reduce((s,x,k)=>s+x*n[k],0)/6;
  for(let j=0;j<3;j++){const x=ids[j],y=ids[(j+1)%3],key=Math.min(x,y)+':'+Math.max(x,y),e=edges.get(key)||[0,0];e[0]++;e[1]+=x<y?1:-1;edges.set(key,e);}
 }
 for(const [count,balance] of edges.values()){assert.equal(count,2,'Mesh edge is not watertight');assert.equal(balance,0,'Mesh orientation is inconsistent');}assert.ok(volume>0);return volume;
}
function crests(mesh,o){const values=[],radius=o.params.diameter/2+(o.type==='threadtube'?o.params.clearance:-o.params.clearance);
 for(let i=0;i<mesh.vertices.length;i+=3){const [x,y,z]=mesh.vertices.slice(i,i+3);if(Math.abs(y)<1e-6&&Math.abs(x-radius)<1e-5&&Math.abs(z)<o.params.h/2-1e-6)values.push(z+o.position[2]);}
 return values.sort((a,b)=>a-b);
}
for(const type of ['threadrod','threadtube'])for(const hand of ['right','left'])for(const units of ['metric','imperial']){
 const params={...defaults[type],hand,units,h:units==='metric'?20.7:50.8,...(units==='imperial'?{diameter:6.35,pitch:1.27}:{}),phase:.31};
 const o=object(type,params),m=run({type:'preview',project:project(o),tolerance:.005});
 assert.ok(Math.abs(closed(m.vertices,m.triangles)-m.volume)<1e-5);assert.equal(m.parts[0].topology.faceCount,type==='threadrod'?3:4);assert.equal(m.parts[0].topology.flatFaces,2);assert.equal(m.parts[0].topology.edges.length,0);assert.equal(corners(m).normals.length,m.triangles.length*3);
 assert.ok(Math.abs(m.bounds.max[2]-m.bounds.min[2]-params.h)<1e-5);
 const s=makeObject(K,o,.005),core=K.Manifold.sphere(.1,24),inside=s.intersect(core);
 assert.ok(type==='threadrod'?Math.abs(inside.volume()-core.volume())<1e-7:inside.volume()===0,'Rod core must be solid; tube must remain open');inside.delete();core.delete();s.delete();cases++;
}
for(const type of ['threadrod','threadtube'])for(const sign of [-1,1])for(const amount of [9.37,-7.23]){
 const o=object(type,{...defaults[type],h:30,phase:.31},[0,0,15]),next=stretch(o,2,sign,amount);
 for(const key of ['diameter','pitch','clearance','hand','units'])assert.equal(next.params[key],o.params[key]);assert.equal(next.params.h,30+amount);assert.equal(next.position[2]-sign*next.params.h/2,o.position[2]-sign*o.params.h/2);
 const oldMesh=runtime.rust.threadMesh(type,o.params,.005),newMesh=runtime.rust.threadMesh(type,next.params,.005),old=crests(oldMesh,o),changed=crests(newMesh,next);
 const commonMin=Math.max(o.position[2]-o.params.h/2,next.position[2]-next.params.h/2)+.001,commonMax=Math.min(o.position[2]+o.params.h/2,next.position[2]+next.params.h/2)-.001;
 for(const z of old.filter(z=>z>commonMin&&z<commonMax))assert.ok(changed.some(v=>Math.abs(v-z)<1e-5),'Stretch changed existing thread positions');
 const m=run({type:'preview',project:project(next),tolerance:.005});closed(m.vertices,m.triangles);assert.throws(()=>stretch(o,0,1,1),/length only/);cases++;
}
const male=object('threadrod',{...defaults.threadrod,h:20}),female=object('threadtube',{...defaults.threadtube,h:20});
for(const hand of ['right','left']){male.params.hand=female.params.hand=hand;const a=makeObject(K,male,.005),b=makeObject(K,female,.005),overlap=a.intersect(b);assert.equal(overlap.volume(),0,'Matching rod and bore with clearance must not intersect');a.delete();b.delete();overlap.delete();cases++;}
// Compare real triangle centroids with the analytic helical surface at Maximum quality.
for(const type of ['threadrod','threadtube'])for(const [diameter,pitch,h] of [[3,.5,7.43],[8,1.25,20.73],[20,2.5,40.31]]){
 const p={...defaults[type],diameter,pitch,h,outer:diameter+6,phase:.31},m=runtime.rust.threadMesh(type,p,.005);let deviation=0;
 for(let i=type==='threadtube'?m.groups[2]:0;i<m.groups[3];i+=3){const point=[0,0,0];for(let j=0;j<3;j++)for(let k=0;k<3;k++)point[k]+=m.vertices[m.triangles[i+j]*3+k]/3;
  const phase=((point[2]+p.h/2+p.phase)/p.pitch-Math.atan2(point[1],point[0])/(2*Math.PI))%1,q=(phase+1)%1,u=Math.min(q,1-q),depth=Math.min(Math.sqrt(3)*p.pitch*Math.max(0,u-.0625),Math.sqrt(3)*p.pitch*17/48),r=type==='threadrod'?p.diameter/2-depth-p.clearance:Math.max(p.diameter/2-depth,p.diameter/2-Math.sqrt(3)*p.pitch*5/16)+p.clearance;
  deviation=Math.max(deviation,Math.abs(Math.hypot(point[0],point[1])-r));
 }assert.ok(deviation<=.0051,`${type}: Maximum thread deviation ${deviation}`);closed(m.vertices,m.triangles);cases++;
}
const imperial=object('threadrod',{...defaults.threadrod,units:'imperial',diameter:6.35,pitch:1.27,h:50.8}),metric={...imperial,params:{...imperial.params,units:'metric'}};
const a=run({type:'export',project:project(imperial),tolerance:.005,ground:true}),b=run({type:'export',project:project(metric),tolerance:.005,ground:true});assert.ok(Buffer.from(a.buffer).equals(Buffer.from(b.buffer)));assert.equal(imperial.params.h/imperial.params.pitch,40);
const imported=object('mesh',{mesh:readSTL(a.buffer)}),s=makeObject(K,imported,.005);assert.equal(s.status(),'NoError');assert.ok(Math.abs(s.volume()-a.volume)<1e-5);s.delete();cases++;
const rod=object('threadrod',{...defaults.threadrod,h:30},[0,0,15]),plate=object('box',{w:30,d:30,h:4},[0,0,1]);
const add=run({type:'boolean',operation:'add',objects:[plate,rod],tolerance:.005});assert.equal(add.count,1);const joined=mergeResult([plate,rod],'threaded-plate',add.bounds);const jm=run({type:'preview',project:project(joined),tolerance:.005});closed(jm.vertices,jm.triangles);assert.equal(jm.parts[0].topology,null);assert.throws(()=>stretch(joined,2,1,10),/Separate/);cases++;
const plateOnly=run({type:'preview',project:project(plate),tolerance:.005});const hm=run({type:'preview',project:{...project(plate),objects:[plate,{...rod,mode:'cut'}]},tolerance:.005});assert.ok(hm.volume<plateOnly.volume);closed(hm.vertices,hm.triangles);cases++;
for(const change of [{pitch:0},{pitch:10},{h:700},{clearance:-.1},{outer:defaults.threadtube.diameter},{units:'unknown'},{hand:'unknown'}])assert.throws(()=>project(object('threadtube',{...defaults.threadtube,...change})));cases++;
for(const [s,want] of [['1/4',.25],['3/8',.375],['1 1/2',1.5],['0.025',.025]])assert.equal(parseThreadNumber(s),want);for(const s of ['1/0','NaN','Infinity','a'])assert.throws(()=>parseThreadNumber(s));cases++;
const backup=JSON.parse(JSON.stringify(project(stretch(imperial,2,-1,4.37))));assert.equal(backup.objects[0].params.units,'imperial');assert.equal(backup.objects[0].params.pitch,1.27);assert.ok(backup.objects[0].params.phase>0);run({type:'preview',project:validateProject(backup),tolerance:.005});assert.ok(Math.abs(dimensions(backup.objects[0])[2]-55.17)<1e-10);cases++;
runtime.destroy();console.log(`PASS: ${cases} thread cases: metric/imperial and both hands, closed oriented solids, open bores, actual mating clearance, fixed pitch and phase through stretching at both ends, exact unit/STL parity, addition/subtraction, validation and editable backups.`);
