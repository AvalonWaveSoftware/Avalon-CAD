// WS5 bench: worker (engine) time for edits with ENGINE_CACHE off vs on, measured around runtime.process() in Node.
// The "off" run uses a temporary copy of web/ with ENGINE_CACHE=false (tests/perf/.ws5-off, removed afterwards).
// Budgets (ADR v2 WS5): move at 100 objects <=25 ms; stretch commit (check + preview) at 60 objects <=80 ms;
// box beside 10 thread rods move <=40 ms; caches <=150 MB.
import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const R=fileURLToPath(new URL('../../',import.meta.url)),variant=process.argv[2]==='--check'?undefined:process.argv[2];
if(!variant){const off=R+'tests/perf/.ws5-off/';fs.rmSync(off,{recursive:true,force:true});fs.cpSync(R+'web',off+'web',{recursive:true});
 const flags=off+'web/perf-flags.mjs';fs.writeFileSync(flags,fs.readFileSync(flags,'utf8').replace('ENGINE_CACHE=true','ENGINE_CACHE=false'));
 try{const res={};for(const v of ['off','on'])res[v]=JSON.parse(execFileSync(process.execPath,[fileURLToPath(import.meta.url),v],{encoding:'utf8',maxBuffer:1<<26}).trim().split('\n').pop());
  const rows=[['move, 100 objects (ms)','move100',25],['stretch commit, 60 objects (ms)','stretch60',80],['box beside 10 thread rods, move (ms)','rods',40],['worker caches (MB)','cacheMB',150]];
  let ok=true;for(const [label,k,budget] of rows){const pass=res.on[k]<=budget;ok&&=pass;console.log(label.padEnd(40),'off',String(res.off[k]).padStart(8),' on',String(res.on[k]).padStart(8),' budget <=',budget,pass?'PASS':'FAIL');}
  console.log(JSON.stringify(res));if(!ok)process.exitCode=1;
 }finally{fs.rmSync(off,{recursive:true,force:true});}
}else{
 const W=variant==='off'?R+'tests/perf/.ws5-off/web/':R+'web/';
 const {loadPyodide}=await import('pyodide');const {initKernel}=await import(W+'kernel.mjs');const {initLocalEngine}=await import(W+'local-engine.mjs');const {object,defaults,blank}=await import(W+'templates.mjs');const {stretch}=await import(W+'operations.mjs');
 const K=await initKernel(),runtime=await initLocalEngine(K,{loadPyodide,pythonURL:R+'node_modules/pyodide/',pythonSource:fs.readFileSync(R+'engine/python/model_jobs.py','utf8'),rust:{binary:fs.readFileSync(R+'app/assets/mesh-core.wasm')}});
 let id=0;const run=d=>{const t=performance.now(),r=runtime.process({id:++id,...d});if(r.error)throw Error(r.error);return performance.now()-t;};
 const median=a=>{a=[...a].sort((x,y)=>x-y);return +a[a.length>>1].toFixed(1);};
 // The ADR's measured scene (§2 table, and tests/pixels.mjs distinct()): distinct primitives on a 35 mm grid, build plane on.
 const D={box:{w:30,d:30,h:15},cylinder:{diameter:20,h:20},sphere:{diameter:25},tube:{diameter:25,inner:18,h:20},cone:{diameter:25,top:8,h:25}};
 const scene=n=>{const p=blank(),types=['box','cylinder','sphere','tube','cone'];p.buildPlaneEnabled=true;for(let i=0;i<n;i++){const t=types[i%5],q={...D[t]};q.h=(q.h||10)+i*.1;if(t==='sphere')q.diameter+=i*.1;p.objects.push(object(t,q,[(i%10)*35,Math.floor(i/10)*35,0]));}return p;};
 const out={};
 {const p=scene(100);for(let i=0;i<3;i++)run({type:'preview',project:p,tolerance:.15});const t=[];for(let k=0;k<15;k++){const o=p.objects[(k*37)%100];o.position=[o.position[0]+2,o.position[1],o.position[2]];t.push(run({type:'preview',project:p,tolerance:.15}));}out.move100=median(t);}
 {const p=scene(60);for(let i=0;i<3;i++)run({type:'preview',project:p,tolerance:.15});const t=[];for(let k=0;k<9;k++){const i=(k*23)%60;p.objects[i]=stretch(p.objects[i],k%3,1,2);t.push(run({type:'check',project:p,tolerance:.15})+run({type:'preview',project:p,tolerance:.15}));}out.stretch60=median(t);}
 {const p=blank();for(let i=0;i<10;i++)p.objects.push(object('threadrod',structuredClone(defaults.threadrod),[i*25,0,0]));const box=object('box',structuredClone(defaults.box),[0,40,0]);p.objects.push(box);
  for(let i=0;i<3;i++)run({type:'preview',project:p,tolerance:.15});const t=[];for(let k=0;k<9;k++){box.position=[box.position[0]+3,40,0];t.push(run({type:'preview',project:p,tolerance:.15}));}out.rods=median(t);}
 const c=runtime.engineCache?.size();out.cacheMB=c?+(c.localMB+c.derivedMB).toFixed(1):0;out.rss=Math.round(process.memoryUsage().rss/1048576);
 out.mergedPreviews=runtime.engineCache?.stats.mergedPreviews??0;runtime.destroy();console.log(JSON.stringify(out));
}
