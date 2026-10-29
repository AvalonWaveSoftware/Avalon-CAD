import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {matrix,mirrorObject,worldCenter,withRoundover} from '../web/operations.mjs';
import {object,defaults,blank} from '../web/templates.mjs';
import {initKernel,makeObject} from '../web/kernel.mjs';
import {initLocalEngine} from '../web/local-engine.mjs';
import {engineCache} from '../web/engine-cache.mjs';
import {requiredVersion} from '../web/migrate.mjs';
import {validateProject} from '../web/kernel-ui.mjs';
const K=await initKernel({solidOptions:{wasmBinary:fs.readFileSync('node_modules/replicad-opencascadejs/dist/replicad_single.wasm')}});
await initLocalEngine(K,{rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
let cases=0;
for(const plane of ['YZ','XZ','XY'])for(const mirrored of [false,true]){
 const o={...object('wedge',defaults.wedge),position:[7,9,12],rotation:[29,67,-143],scale:[1.2,.8,1.1],...(mirrored?{mirrored:true}:{})};
 const center=[3,4,5],m=mirrorObject(o,plane,center),twice=mirrorObject(m,plane,center),a={YZ:0,XZ:1,XY:2}[plane];
 for(const p of [[0,0,0],[1,2,3],[-7,8,-9]]){
  const original=new T.Vector3(...p).applyMatrix4(matrix(o)),reflected=original.clone();reflected.setComponent(a,2*center[a]-reflected.getComponent(a));
  assert.ok(reflected.distanceTo(new T.Vector3(...p).applyMatrix4(matrix(m)))<1e-10);
  assert.ok(original.distanceTo(new T.Vector3(...p).applyMatrix4(matrix(twice)))<1e-10);
 }
 assert.equal(!!twice.mirrored,!!o.mirrored);cases++;
}
function signed(s){const m=s.getMesh(),v=m.vertProperties,t=m.triVerts,n=m.numProp;let sum=0;for(let i=0;i<t.length;i+=3){const p=[0,1,2].map(j=>new T.Vector3(...v.slice(t[i+j]*n,t[i+j]*n+3)));sum+=p[0].dot(p[1].cross(p[2]))/6;}return sum;}
let solids=0;
for(const o of [object('wedge',defaults.wedge),withRoundover(object('box',defaults.box),[0],1),object('threadrod',defaults.threadrod)]){
 const original=makeObject(K,o),m=mirrorObject(o,'YZ'),s=makeObject(K,m);
 assert.ok(Math.abs(s.volume()-original.volume())<1e-6);assert.ok(signed(s)>0);
 const mesh=original.getMesh(),ref=s.getMesh();const points=(m,flip)=>{const r=[];for(let i=0;i<m.vertProperties.length;i+=m.numProp)r.push([m.vertProperties[i]*(flip?-1:1),m.vertProperties[i+1],m.vertProperties[i+2]].map(v=>v.toFixed(4)).join(','));return r.sort();};
 assert.deepEqual(points(mesh,true),points(ref,false),'exact reflected vertices including thread helix');
 original.delete();s.delete();solids++;
}
const child=mirrorObject(withRoundover(object('box',defaults.box),[0],1),'YZ');
const joined={...object('joined',{children:[child]}),fillets:[{edges:[],radius:0}]};const s=makeObject(K,joined);assert.ok(signed(s)>0);s.delete();
const cache=engineCache(K),o=withRoundover(object('box',defaults.box),[0],1);
cache.begin();cache.makeObject(o,.15);cache.end();const builds=cache.stats.localBuilds;
const times=[];for(let i=0;i<5;i++){cache.begin();const start=performance.now();const s=cache.makeObject(mirrorObject(o,'YZ'),.15);s.volume();times.push(performance.now()-start);cache.end();}
assert.equal(cache.stats.localBuilds,builds);assert.ok(Math.max(...times)<140);cache.destroy?.();
const project={...blank(),objects:[mirrorObject(o,'YZ')]};validateProject(project);assert.equal(requiredVersion(project),3);assert.equal(requiredVersion({...blank(),objects:[o]}),2);
assert.throws(()=>validateProject({...project,objects:[{...o,mirrored:1}]}));
console.log(`mirror-mode: ${cases} transform cases, ${solids} solids + mirrored B-rep child, positive signed volumes, thread reflection, v3 validation; cached placement ms ${times.map(t=>t.toFixed(2)).join(', ')}; local builds ${builds} → ${cache.stats.localBuilds}`);
