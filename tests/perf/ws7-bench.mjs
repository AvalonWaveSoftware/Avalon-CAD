// WS7 bench: JS job engine vs Pyodide (JS_ENGINE off = temporary copy of web/ under tests/perf/.ws7-off/).
// Each variant runs in a fresh Node process. Budgets (ADR v2 WS7, §8): worker init (Manifold + OCCT + Rust + job
// engine, Node) <=700 ms; app/assets <=25.1 MB (25,100,000 B). Also reported: RSS after init, 100-object check.
import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const R=fileURLToPath(new URL('../../',import.meta.url)),variant=process.argv[2]==='--check'?undefined:process.argv[2];
const size=p=>{const st=fs.statSync(p);return st.isDirectory()?fs.readdirSync(p).reduce((a,f)=>a+size(path.join(p,f)),0):st.size;};
if(!variant){const off=R+'tests/perf/.ws7-off/';fs.rmSync(off,{recursive:true,force:true});fs.cpSync(R+'web',off+'web',{recursive:true});
 const flags=off+'web/perf-flags.mjs';fs.writeFileSync(flags,fs.readFileSync(flags,'utf8').replace('JS_ENGINE=true','JS_ENGINE=false'));
 try{const res={};for(const v of ['off','on']){const runs=[];for(let i=0;i<3;i++)runs.push(JSON.parse(execFileSync(process.execPath,[fileURLToPath(import.meta.url),v],{encoding:'utf8',maxBuffer:1<<26}).trim().split('\n').pop()));
   const med=k=>runs.map(r=>r[k]).sort((a,b)=>a-b)[1];res[v]={init:med('init'),manifold:med('manifold'),occt:med('occt'),engine:med('engine'),rss:med('rss'),check100:med('check100')};}
  // assets: on = the built app/assets (JS_ENGINE build); off = that plus the Pyodide files build-web.mjs ships when the flag is off.
  const py=['pyodide.mjs','pyodide.asm.js','pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json'].reduce((a,f)=>a+size(R+'node_modules/pyodide/'+f),0)+size(R+'engine/python/model_jobs.py');
  const built=size(R+'app/assets'),hasPy=fs.existsSync(R+'app/assets/python');res.on.assets=hasPy?built-size(R+'app/assets/python'):built;res.off.assets=res.on.assets+py;
  const rows=[['worker init, Node (ms)','init',700],['  module import (ms)','manifold'],['  initKernel: Manifold + OCCT (ms)','occt'],['  rust + job engine (ms)','engine'],['RSS after init (MB)','rss'],['check, 100 objects (ms)','check100'],['app/assets (B)','assets',25100000]];
  let ok=true;for(const [l,k,b] of rows){const pass=b==null||res.on[k]<=b;ok&&=pass;console.log(l.padEnd(30),'off',String(res.off[k]).padStart(10),' on',String(res.on[k]).padStart(10),b==null?'':` budget <= ${b} ${pass?'PASS':'FAIL'}`);}
  console.log(JSON.stringify(res));if(!ok)process.exitCode=1;
 }finally{fs.rmSync(off,{recursive:true,force:true});}
}else{
 const W=variant==='off'?R+'tests/perf/.ws7-off/web/':R+'web/';const t0=performance.now();
 const {loadPyodide}=variant==='off'?await import('pyodide'):{};
 const kernel=await import(W+'kernel.mjs'),{initLocalEngine}=await import(W+'local-engine.mjs'),{object,blank}=await import(W+'templates.mjs');
 const t1=performance.now();const K=await kernel.initKernel();const t2=performance.now();
 const rt=await initLocalEngine(K,variant==='off'?{loadPyodide,pythonURL:R+'node_modules/pyodide/',pythonSource:fs.readFileSync(R+'engine/python/model_jobs.py','utf8'),rust:{binary:fs.readFileSync(R+'app/assets/mesh-core.wasm')}}:{rust:{binary:fs.readFileSync(R+'app/assets/mesh-core.wasm')}});
 const t3=performance.now();
 const D={box:{w:30,d:30,h:15},cylinder:{diameter:20,h:20},sphere:{diameter:25},tube:{diameter:25,inner:18,h:20},cone:{diameter:25,top:8,h:25}};
 const p=blank(),types=['box','cylinder','sphere','tube','cone'];for(let i=0;i<100;i++){const t=types[i%5],q={...D[t]};q.h=(q.h||10)+i*.1;if(t==='sphere')q.diameter+=i*.1;p.objects.push(object(t,q,[(i%10)*35,Math.floor(i/10)*35,0]));}
 let id=0;const c=[];for(let k=0;k<5;k++){p.objects[k].position[0]+=1;const t=performance.now();const r=rt.process({id:++id,type:'check',project:p,tolerance:.15});if(r.error)throw Error(r.error);c.push(performance.now()-t);}c.sort((a,b)=>a-b);
 console.log(JSON.stringify({init:Math.round(t3-t0),manifold:Math.round(t1-t0),occt:Math.round(t2-t1),engine:Math.round(t3-t2),rss:Math.round(process.memoryUsage().rss/1048576),check100:+c[2].toFixed(1)}));rt.destroy();
}
