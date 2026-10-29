import {fileURLToPath} from 'node:url';
// WS14 bench (OCCT_SIDECAR), Node. A cylinder (80 x 30 mm, face tolerance 0.005, a loadable project) gets both
// circular edges filleted (radius ~3) for the first time
// in a project with 10 plain objects, then another object is moved while the fillet is still being computed.
//   off: the in-process engine (OCCT in the geometry worker): the fillet blocks the worker; the move waits behind it.
//   on:  OCCT in a sidecar worker thread, driven by the browser's runJob/solidRemote code.
// Reported (median of ROUNDS, interleaved off/on, each round at 1-minute load < 2):
//   block    longest synchronous engine run in the geometry worker during the fillet and the move;
//   move     time from issuing the move to its first display (on: the interim display, the fillet part shown without
//            its new fillet; off: the move result, after the fillet);
//   final    time from issuing the move to its final result.
// Gated: on.move <= 50 ms (ADR v1 sidecar acceptance) and the final move result is byte-identical to the in-process engine's. Run from the repo root after build:web: node tests/perf/ws14-bench.mjs [--check]
import fs from 'node:fs';import os from 'node:os';
const check=process.argv.includes('--check'),ROUNDS=+(process.env.AVALON_WS14_ROUNDS||5);
const refDir=fileURLToPath(new URL('../.ws14-ref/',import.meta.url));fs.rmSync(refDir,{recursive:true,force:true});fs.cpSync('web',refDir+'web',{recursive:true});
process.on('exit',()=>fs.rmSync(refDir,{recursive:true,force:true}));
const {initKernel}=await import('../../web/kernel.mjs'),{initLocalEngine}=await import('../../web/local-engine.mjs'),T=await import('../../web/templates.mjs');
const {sidecarClient}=await import('../occt-sidecar-client.mjs');
const rust={binary:fs.readFileSync('app/assets/mesh-core.wasm')};
const refK=await import(refDir+'web/kernel.mjs'),refE=await import(refDir+'web/local-engine.mjs');
const B=await refE.initLocalEngine(await refK.initKernel(),{rust}),A=await initLocalEngine(await initKernel({solidOptions:false}),{rust}),client=sidecarClient();
const median=a=>{a=[...a].sort((x,y)=>x-y);return +a[a.length>>1].toFixed(1);},load=()=>+os.loadavg()[0].toFixed(2);
const quiet=async()=>{const t=Date.now();while(os.loadavg()[0]>=2&&Date.now()-t<600000)await new Promise(r=>setTimeout(r,5000));return load();};
// Time every synchronous engine run of A (the geometry worker's blocking slices).
let slices=[];const process0=A.process;A.process=d=>{const t=performance.now();try{return process0(d);}finally{slices.push(performance.now()-t);}};
const project=()=>{const p=T.blank();p.buildPlaneEnabled=true;const cyl=T.object('cylinder',{diameter:80,h:30},[-60,0,15]);cyl.id='fillet';cyl.resolution={mode:'tolerance',tolerance:.005};p.objects.push(cyl);
 for(let i=0;i<10;i++){const t=['box','cylinder','sphere','tube','cone'][i%5],o=T.object(t,structuredClone(T.defaults[t]),[40+(i%5)*30,Math.floor(i/5)*30,10]);o.id='p'+i;p.objects.push(o);}return p;};
let id=0;const job=(p,type='preview')=>({id:++id,type,project:structuredClone(p),tolerance:.15});
const bytes=v=>Buffer.from(v.buffer,v.byteOffset,v.byteLength);
const res={off:[],on:[]};let identical=true;
for(let round=0;round<ROUNDS;round++){const radius=3+round*.05;
 for(const v of ['off','on']){const l=await quiet(),p=project();
  // warm: the project without the fillet (plain parts, topology cached)
  if(v==='off')B.process(job(p));else await client.run(A,job(p));
  p.objects[0].fillets=[{edges:[0,2],radius}];const moved=structuredClone(p);moved.objects[3].position[0]+=5;
  if(v==='off'){const t0=performance.now();B.process(job(p));const t1=performance.now(),r=B.process(job(moved)),t2=performance.now();
   res.off.push({block:Math.max(t1-t0,t2-t1),move:t2-t0,final:t2-t0,load:l});}
  else{slices=[];let abort,interimP1;const aborted=new Promise(r=>abort=r),gotInterim=new Promise(r=>interimP1=r);
   const p1=client.run(A,job(p),{onInterim:interimP1,abort:aborted});await gotInterim;
   // the move arrives while the sidecar computes the fillet: the waiting preview is dropped, the move runs at once
   const t0=performance.now();abort();const c=await p1;let tInterim=null;
   const r=await client.run(A,job(moved),{onInterim:()=>{tInterim=performance.now()-t0;}});const tFinal=performance.now()-t0;
   const ref=B.process(job(moved));for(const k of ['vertices','triangles','displayPositions','displayNormals','displayIndex'])identical&&=!!r[k]&&bytes(r[k]).equals(bytes(ref[k]));
   identical&&=c.canceled===true;res.on.push({slices:slices.map(x=>+x.toFixed(1)),block:Math.max(...slices),move:tInterim??tFinal,final:tFinal,load:l});
   if(v==='on')B.process(job(moved));}}}
const sum=v=>({block:median(res[v].map(r=>r.block)),move:median(res[v].map(r=>r.move)),final:median(res[v].map(r=>r.final)),maxLoad:Math.max(...res[v].map(r=>r.load))});
const off=sum('off'),on=sum('on');
for(const [k,label,budget] of [['block','geometry worker blocked, longest run (ms)',null],['move','move during the fillet → first display (ms)',50],['final','move during the fillet → final result (ms)',null]])
 console.log(label.padEnd(48),'off',String(off[k]).padStart(8),' on',String(on[k]).padStart(8),budget?`budget <= ${budget} ${on[k]<=budget?'PASS':'FAIL'}`:'');
console.log('final move result byte-identical to the in-process engine:',identical?'PASS':'FAIL');
console.log(JSON.stringify({off,on,rounds:res,remote:client.remote.stats(),sidecarRequests:client.stats.requests}));
const ok=identical&&on.move<=50;if(check){console.log(ok?'WS14 PASS':'WS14 FAIL');if(!ok)process.exitCode=1;}
client.close();A.destroy();B.destroy();
