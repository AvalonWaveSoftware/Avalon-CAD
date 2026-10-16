// WS6 bench: 12-edge fillet box (radius 2) at tolerance 0.005 (ADR §2: move 2,112 ms / export 1,920 ms).
// Variants (temporary copies of web/ under tests/perf/.ws6-*/, removed afterwards):
//   off / on      FILLET_MESH_CACHE false / true, everything else as shipped (ENGINE_CACHE on)
//   off-e / on-e  the same with ENGINE_CACHE=false too, isolating WS6 from the WS5 solid cache.
// Budgets (ADR v2 WS6): re-export of the unchanged model <=100 ms (as shipped, ENGINE_CACHE on). The fillet-move
// <=20 ms target moved to WS10 by Architect ruling (2026-10-16): the remaining cost is display preparation. Meshes must be
// byte-identical between off and on (checked here on preview, part and STL bytes).
import fs from 'node:fs';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const R=fileURLToPath(new URL('../../',import.meta.url)),variant=process.argv[2]==='--check'?undefined:process.argv[2];
const VARIANTS={off:{FILLET_MESH_CACHE:false},on:{},'off-e':{FILLET_MESH_CACHE:false,ENGINE_CACHE:false},'on-e':{ENGINE_CACHE:false}};
if(!variant){const res={};
 try{for(const [v,flags] of Object.entries(VARIANTS)){const dir=R+`tests/perf/.ws6-${v}/`;fs.rmSync(dir,{recursive:true,force:true});fs.cpSync(R+'web',dir+'web',{recursive:true});
   let f=fs.readFileSync(dir+'web/perf-flags.mjs','utf8');for(const [k,x] of Object.entries(flags))f=f.replace(new RegExp(`${k}=(true|false|'[a-z]*')`),`${k}=${x}`);fs.writeFileSync(dir+'web/perf-flags.mjs',f);
   res[v]=JSON.parse(execFileSync(process.execPath,[fileURLToPath(import.meta.url),v],{encoding:'utf8',maxBuffer:1<<26}).trim().split('\n').pop());}
  let ok=true;const row=(label,k,budget)=>{for(const [a,b] of [['off','on'],['off-e','on-e']]){const info=a.endsWith('-e')||budget==='WS10',pass=budget==null||budget==='WS10'||res[b][k]<=budget;if(!info)ok&&=pass;console.log((label+(a.endsWith('-e')?' (ENGINE_CACHE off)':'')).padEnd(46),a.padEnd(5),String(res[a][k]).padStart(8),b.padEnd(5),String(res[b][k]).padStart(8),budget==null?'':budget==='WS10'?'(<=20 ms target moved to WS10, Architect ruling)':a.endsWith('-e')?`(info; budget <= ${budget} applies as shipped)`:`budget <= ${budget} ${pass?'PASS':'FAIL'}`);}};
  row('fillet move, tol 0.005 (ms)','move','WS10');row('re-export unchanged, tol 0.005 (ms)','reexport',100);row('first build (ms)','first');
  const same=Object.values(res).every(r=>r.hash===res.off.hash);ok&&=same;console.log('meshes byte-identical across variants:',same?'PASS':'FAIL',res.off.hash.slice(0,16));
  console.log(JSON.stringify(res));if(!ok)process.exitCode=1;
 }finally{for(const v of Object.keys(VARIANTS))fs.rmSync(R+`tests/perf/.ws6-${v}/`,{recursive:true,force:true});}
}else{
 const W=R+`tests/perf/.ws6-${variant}/web/`;
 const {loadPyodide}=await import('pyodide');const {initKernel}=await import(W+'kernel.mjs');const {initLocalEngine}=await import(W+'local-engine.mjs');const {object,blank}=await import(W+'templates.mjs');
 const K=await initKernel(),rt=await initLocalEngine(K,{loadPyodide,pythonURL:R+'node_modules/pyodide/',pythonSource:fs.readFileSync(R+'engine/python/model_jobs.py','utf8'),rust:{binary:fs.readFileSync(R+'app/assets/mesh-core.wasm')}});
 let id=0;const time=d=>{const t=performance.now(),r=rt.process({id:++id,...d});if(r.error)throw Error(r.error);return [performance.now()-t,r];};
 const median=a=>{a=[...a].sort((x,y)=>x-y);return +a[a.length>>1].toFixed(1);};
 const p=blank(),o=object('box',{w:30,d:30,h:15},[0,0,7.5]);o.fillets=[{edges:[0,1,2,3,4,5,6,7,8,9,10,11],radius:2}];o.resolution={mode:'tolerance',tolerance:.005};p.objects.push(o);
 const h=crypto.createHash('sha256');const feed=r=>{for(const k of ['vertices','triangles','flatTriangles','smoothingGroups','buffer'])if(r[k]&&typeof r[k]!=='number')h.update(Buffer.from(r[k] instanceof ArrayBuffer?r[k]:r[k].buffer));for(const q of r.parts||[])for(const k of ['vertices','triangles'])h.update(Buffer.from(q[k].buffer));};
 const [first,r0]=time({type:'preview',project:p,tolerance:.15});feed(r0);
 const mv=[];for(let k=0;k<7;k++){o.position=[o.position[0]+1,0,7.5];const [t,r]=time({type:'preview',project:p,tolerance:.15});mv.push(t);feed(r);}
 const [,e0]=time({type:'export',project:p,tolerance:.005,ground:true});feed(e0);const ex=[];for(let k=0;k<5;k++){const [t,r]=time({type:'export',project:p,tolerance:.005,ground:true});ex.push(t);feed(r);}
 rt.destroy();console.log(JSON.stringify({first:+first.toFixed(1),move:median(mv),reexport:median(ex),hash:h.digest('hex')}));
}
