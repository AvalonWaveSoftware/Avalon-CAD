// ADR-0001 F7 perf (Architect F7 ruling 2): per-step timing of a finished glyph, cold (each run has its own content key).
//   bevel = OCCT B-rep of the bevel part (glyphBevelPart: prism + chamfer/fillet; Engrave: tile cut + rim bevel)
//   mesh  = the rest of the cold solidMesh of that part (topology table + tessellation) = solidMesh − bevel
//   plate = Manifold: mesh → Manifold + glyphPlate (Emboss slab union / Engrave lower plate union)
//   total = makeObject cold (what a preview pays once; afterwards the bevel part is cached).
//   add   = ADR-0001 F7 P4: the WHOLE Add as the app runs it, cold: the place job, then check (.15) and preview (.15)
//           of the placed glyph through the local engine (the geometry worker's job sequence). Default: OCCT in the
//           engine's thread (Android worker.js); --sidecar: OCCT in a worker-thread sidecar driven by runJob (desktop
//           worker-sidecar.js). bevel/mesh/plate/total are parts of it, not the user-visible time.
// Gates: whole Add ≤ 400 ms per glyph (desktop, --sidecar) / ≤ 1200 ms (Android path, --android), plate ≤ 50 ms.
// bevel > 400 ms is still listed (bevelOver400) but no longer gates. Prints load average and process CPU time.
//   node tests/perf/glyph-finish-bench.mjs [--all | --chars=A@j] [--repeat=5] [--rows] [--check] [--sidecar | --android]
//   --repeat=N: every step is the median of N cold runs (each with its own content key).
import os from 'node:os';import fs from 'node:fs';import {initLocalEngine} from '../../web/local-engine.mjs';import {sidecarClient} from '../occt-sidecar-client.mjs';
import {initKernel,makeObject} from '../../web/kernel.mjs';import {solidMesh,baseShapeForTest} from '../../web/cad-solid.mjs';
import {object,glyphDefaults,blank} from '../../web/templates.mjs';import {loadGlyphs,glyphBevelPart,glyphPlate} from '../../web/glyph-geometry.mjs';import {GLYPH_CHARS} from '../../web/glyph-metrics.mjs';
const K=await initKernel();await loadGlyphs();
const sidecar=process.argv.includes('--sidecar'),ADD_BUDGET=sidecar?400:1200,rust={binary:fs.readFileSync(new URL('../../app/assets/mesh-core.wasm',import.meta.url))};
const client=sidecar?sidecarClient():null,E=await initLocalEngine(sidecar?await initKernel({solidOptions:false}):K,{rust});let jobId=0;
const job=async d=>{const r=client?await client.run(E,{id:++jobId,...d}):E.process({id:++jobId,...d});if(r.error)throw Error(r.error);return r;};
async function wholeAdd(o){const a=performance.now(),placed=(await job({type:'place',object:o,position:[0,0,0],floor:true})).object,prj=blank();prj.buildPlaneEnabled=true;prj.objects=[placed];
 await job({type:'check',project:prj,tolerance:.15});await job({type:'preview',project:prj,tolerance:.15});return performance.now()-a;}
const arg=k=>process.argv.find(a=>a.startsWith(`--${k}=`))?.slice(k.length+3),repeat=Math.max(1,+(arg('repeat')||1)),med=v=>v.sort((x,y)=>x-y)[v.length>>1];
const all=process.argv.includes('--all'),chars=arg('chars')?[...arg('chars')]:all?[...GLYPH_CHARS]:['A','@','j','0','&'],cpu0=process.cpuUsage(),load0=os.loadavg()[0];
let n=0;const t=f=>{const a=performance.now();const r=f();return [performance.now()-a,r];};
// Warm-up (not timed): OCCT/Manifold/mesh-core started and JIT-compiled, as they are by the app's first preview.
{const w=object('glyph',{...glyphDefaults.glyph,char:'I',size:19.5,bevel:.5,plate:2,plateMargin:2},[0,0,0],'warm-up');w.id='g1';await wholeAdd(w);}
const rows=[];
for(const finish of [{name:'emboss',x:{plate:2,plateMargin:2}},{name:'engrave',x:{plate:2,plateMargin:2,engrave:true}}])for(const profile of ['chamfer','round'])for(const c of chars){
 const runs=[];let err=null;
 for(let i=0;i<repeat&&!err;i++){
 const o=object('glyph',{...glyphDefaults.glyph,char:c,size:20+(++n)*1e-6,bevel:.5,bevelProfile:profile,...finish.x}),D=glyphBevelPart(o);
 let bevel,mesh,plate,total;
 // --sidecar: cad-solid's backend is the sidecar (solidRemote), so only the whole Add is timed (it is what the app runs).
 if(!sidecar)try{[bevel]=t(()=>baseShapeForTest(D).delete());}catch(e){err=e.message;}
 if(!err&&!sidecar){const o2=object('glyph',{...o.params,size:o.params.size+5e-7}),D2=glyphBevelPart(o2);
  const [ms,m]=t(()=>solidMesh(D2,.15,false));mesh=Math.max(0,ms-bevel);
  try{[plate]=t(()=>{const mm=new K.Mesh({numProp:3,vertProperties:m.vertices,triVerts:m.triangles,tolerance:1e-5});mm.merge();glyphPlate(K,o2.params,new K.Manifold(mm)).delete();});
  const o3=object('glyph',{...o.params,size:o.params.size+9e-7});[total]=t(()=>makeObject(K,o3,.15).delete());}catch(e){err='after bevel: '+(e.message||e.code||String(e));}}
 let add;if(!err)try{const o4=object('glyph',{...o.params,size:o.params.size+1.3e-6},[0,0,0],'Letter '+c);o4.id='g1';add=await wholeAdd(o4);}catch(e){err=/^Bevel not possible/.test(e.message)?e.message:'add: '+(e.message||String(e));}
 if(!err)runs.push({bevel,mesh,plate,total,add});}
 const pick=k=>runs.length?med(runs.map(r=>r[k])):undefined,bevel=pick('bevel'),mesh=pick('mesh'),plate=pick('plate'),total=pick('total'),add=pick('add');
 rows.push({c,finish:finish.name,profile,bevel,mesh,plate,total,add,err});}
client?.close();
const cpu=process.cpuUsage(cpu0),ok=rows.filter(r=>!r.err);for(const r of rows)if(r.err&&!/^Bevel not possible/.test(r.err))console.log('ERROR',r.c,r.finish,r.profile,r.err);const _=0,q=(a,f)=>{const v=a.map(f).sort((x,y)=>x-y);return {median:+v[v.length>>1].toFixed(1),max:+v.at(-1).toFixed(1)};};
const worst=k=>ok.reduce((a,r)=>r[k]>a[k]?r:a,ok[0]);
const summary={path:sidecar?'desktop (sidecar)':'Android (in-process OCCT)',addBudget:ADD_BUDGET,chars:chars.length,repeat,runs:rows.length,errors:rows.length-ok.length,load:{start:+load0.toFixed(2),end:+os.loadavg()[0].toFixed(2)},cpuSeconds:+((cpu.user+cpu.system)/1e6).toFixed(1),
 ...(sidecar?{}:{bevel:q(ok,r=>r.bevel),mesh:q(ok,r=>r.mesh),plate:q(ok,r=>r.plate),total:q(ok,r=>r.total)}),add:q(ok,r=>r.add),worstAdd:(w=>`${w.c} ${w.finish} ${w.profile} ${w.add.toFixed(0)} ms`)(worst('add')),
 ...(sidecar?{}:{worstBevel:(w=>`${w.c} ${w.finish} ${w.profile} ${w.bevel.toFixed(0)} ms`)(worst('bevel')),worstPlate:(w=>`${w.c} ${w.finish} ${w.profile} ${w.plate.toFixed(1)} ms`)(worst('plate')),
 bevelOver400:ok.filter(r=>r.bevel>400).map(r=>`${r.c}/${r.finish}/${r.profile}:${r.bevel.toFixed(0)}`),plateOver50:ok.filter(r=>r.plate>50).map(r=>`${r.c}/${r.finish}/${r.profile}:${r.plate.toFixed(0)}`)}),
 addOverBudget:ok.filter(r=>r.add>ADD_BUDGET).map(r=>`${r.c}/${r.finish}/${r.profile}:${r.add.toFixed(0)}`)};
summary.pass=!summary.addOverBudget.length&&!summary.plateOver50?.length;
console.log('glyph-finish-bench',JSON.stringify(summary,null,1));
if(process.argv.includes('--rows'))for(const r of rows)console.log(JSON.stringify(r));
if(process.argv.includes('--check')&&!summary.pass)process.exit(1);
