// Exercise RC jobs through the actual shared Android geometry bundle.
import assert from 'node:assert/strict';
import {androidClient} from './android-occt-client.mjs';
import {object,blank} from '../web/templates.mjs';
const android=androidClient(),legacy=androidClient({legacy:true,desktop:true});
try{
 android.warmShapes();await android.run({type:'preview',project:blank(),tolerance:.15});assert.equal(android.started(),0,'warm-up waits for an actual OCCT need');
 const a=object('box',{w:30,d:20,h:10}),b=object('box',{w:30,d:20,h:10},[40,0,0]);
 const measure={type:'measure',mode:'object',a:{object:a},b:{object:b}};
 assert.equal((await android.run(measure)).distance,10);
 const torus=object('torus',{diameter:30,tube:8});torus.shell={thickness:2};torus.resolution={mode:'tolerance',tolerance:.005};
 const project=blank();project.objects.push(torus);
 const data={type:'preview',project,tolerance:.15},pv=await android.run(data),ref=await legacy.run(data);
 assert.equal(pv.triangles.length,ref.triangles.length,'Android retains coarse hollow preview');
 for(const type of ['check','export']){
  const job={type,project,tolerance:.05,ground:true},x=await android.run(job),y=await legacy.run(job);
  for(const k of type==='export'?['buffer']:['vertices','triangles'])assert.deepEqual(new Uint8Array(x[k].buffer||x[k]),new Uint8Array(y[k].buffer||y[k]));
 }
 const mesh={type:'encode3mf',vertices:new Float32Array([0,0,0,1,0,0,0,1,0]),triangles:new Uint32Array([0,1,2]),ground:true};
 assert.deepEqual(new Uint8Array((await android.run(mesh)).buffer),new Uint8Array((await legacy.run(mesh)).buffer));
 console.log('PASS: Android RC measure, coarse hollow preview ('+pv.triangles.length/3+' triangles), exact check/STL and encode3mf bytes');
}finally{android.close();legacy.close();}
