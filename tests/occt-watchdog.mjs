import assert from 'node:assert/strict';
import {androidClient} from './android-occt-client.mjs';
import {blank,object} from '../web/templates.mjs';
import {OCCT_STOPPED} from '../web/android-occt.mjs';
import {OCCT_JOB_BUDGET_MS} from '../web/perf-flags.mjs';
globalThis.Android={};assert.equal(OCCT_JOB_BUDGET_MS,20000);
for(const fault of ['timeout','crash','close']){
 const client=androidClient({budget:250});
 try{
  assert.equal(client.started(),0,'no startup OCCT worker');
  const project=blank();project.objects.push(object('box',{w:20,d:20,h:10}));project.objects[0].fillets=[{edges:[0],radius:1}];
  const before=JSON.stringify(project);client.fault(fault);const t=performance.now();
  await assert.rejects(client.run({type:'preview',project,tolerance:.15}),e=>e.message.endsWith(OCCT_STOPPED));
  const elapsed=performance.now()-t;assert.ok(elapsed<1250,`${fault}: ${elapsed} ms`);assert.equal(JSON.stringify(project),before);
  // New misses must reach a fresh OCCT heap; failed initialization answers must not enter the WS14 caches.
  const init=performance.now();const result=await client.run({type:'preview',project,tolerance:.15});assert.ok(result.triangles.length);assert.equal(client.started(),2);
  console.log(JSON.stringify({fault,elapsedMs:+elapsed.toFixed(1),restartFirstFilletMs:+(performance.now()-init).toFixed(1),modelInputUnchanged:true}));
 }finally{client.close();}
}

{const client=androidClient();try{const project=blank();const o=object('box',{w:20,d:20,h:10});o.fillets=[{edges:[0],radius:1}];project.objects.push(o);client.fault('oom');const r=await client.run({type:'preview',project,tolerance:.15});assert.ok(r.triangles.length);assert.equal(client.started(),2);assert.ok(client.logs.some(x=>x.includes('wasm trap')));console.log('PASS: Android trap resets OCCT and retries once');}finally{client.close();}}

{const client=androidClient();try{const project=blank();const o=object('box',{w:20,d:20,h:10});o.fillets=[{edges:[0],radius:1}];project.objects.push(o);client.fault('oom-repeat');await assert.rejects(client.run({type:'preview',project,tolerance:.15}),e=>e.message.endsWith(OCCT_STOPPED));assert.equal(client.started(),2);assert.ok(client.logs.length>=2);console.log('PASS: repeated Android trap stops after one retry');}finally{client.close();}}
