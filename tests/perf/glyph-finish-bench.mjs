// ADR-0001 F7 perf (Architect F7 ruling 2): per-step timing of a finished glyph, cold (each run has its own content key).
//   bevel = OCCT B-rep of the bevel part (glyphBevelPart: prism + chamfer/fillet; Engrave: tile cut + rim bevel)
//   mesh  = the rest of the cold solidMesh of that part (topology table + tessellation) = solidMesh − bevel
//   plate = Manifold: mesh → Manifold + glyphPlate (Emboss slab union / Engrave lower plate union)
//   total = makeObject cold (what a preview pays once; afterwards the bevel part is cached).
// Gates: bevel ≤ 400 ms per glyph (desktop), plate ≤ 50 ms. Prints load average and process CPU time.
//   node tests/perf/glyph-finish-bench.mjs [--all] [--check]
import os from 'node:os';
import {initKernel,makeObject} from '../../web/kernel.mjs';import {solidMesh,baseShapeForTest} from '../../web/cad-solid.mjs';
import {object,glyphDefaults} from '../../web/templates.mjs';import {loadGlyphs,glyphBevelPart,glyphPlate} from '../../web/glyph-geometry.mjs';import {GLYPH_CHARS} from '../../web/glyph-metrics.mjs';
const K=await initKernel();await loadGlyphs();
const all=process.argv.includes('--all'),chars=all?[...GLYPH_CHARS]:['A','@','j','0','&'],cpu0=process.cpuUsage(),load0=os.loadavg()[0];
let n=0;const t=f=>{const a=performance.now();const r=f();return [performance.now()-a,r];};
const rows=[];
for(const finish of [{name:'emboss',x:{plate:2,plateMargin:2}},{name:'engrave',x:{plate:2,plateMargin:2,engrave:true}}])for(const profile of ['chamfer','round'])for(const c of chars){
 const o=object('glyph',{...glyphDefaults.glyph,char:c,size:20+(++n)*1e-6,bevel:.5,bevelProfile:profile,...finish.x}),D=glyphBevelPart(o);
 let bevel,mesh,plate,total,err=null;
 try{[bevel]=t(()=>baseShapeForTest(D).delete());}catch(e){err=e.message;}
 if(!err){const o2=object('glyph',{...o.params,size:o.params.size+5e-7}),D2=glyphBevelPart(o2);
  const [ms,m]=t(()=>solidMesh(D2,.15,false));mesh=Math.max(0,ms-bevel);
  try{[plate]=t(()=>{const mm=new K.Mesh({numProp:3,vertProperties:m.vertices,triVerts:m.triangles,tolerance:1e-5});mm.merge();glyphPlate(K,o2.params,new K.Manifold(mm)).delete();});
  const o3=object('glyph',{...o.params,size:o.params.size+9e-7});[total]=t(()=>makeObject(K,o3,.15).delete());}catch(e){err='after bevel: '+(e.message||e.code||String(e));}}
 rows.push({c,finish:finish.name,profile,bevel,mesh,plate,total,err});}
const cpu=process.cpuUsage(cpu0),ok=rows.filter(r=>!r.err);for(const r of rows)if(r.err&&!/^Bevel not possible/.test(r.err))console.log('ERROR',r.c,r.finish,r.profile,r.err);const _=0,q=(a,f)=>{const v=a.map(f).sort((x,y)=>x-y);return {median:+v[v.length>>1].toFixed(1),max:+v.at(-1).toFixed(1)};};
const worst=k=>ok.reduce((a,r)=>r[k]>a[k]?r:a,ok[0]);
const summary={chars:chars.length,runs:rows.length,errors:rows.length-ok.length,load:{start:+load0.toFixed(2),end:+os.loadavg()[0].toFixed(2)},cpuSeconds:+((cpu.user+cpu.system)/1e6).toFixed(1),
 bevel:q(ok,r=>r.bevel),mesh:q(ok,r=>r.mesh),plate:q(ok,r=>r.plate),total:q(ok,r=>r.total),
 worstBevel:(w=>`${w.c} ${w.finish} ${w.profile} ${w.bevel.toFixed(0)} ms`)(worst('bevel')),worstPlate:(w=>`${w.c} ${w.finish} ${w.profile} ${w.plate.toFixed(1)} ms`)(worst('plate')),
 bevelOver400:ok.filter(r=>r.bevel>400).map(r=>`${r.c}/${r.finish}/${r.profile}:${r.bevel.toFixed(0)}`),plateOver50:ok.filter(r=>r.plate>50).map(r=>`${r.c}/${r.finish}/${r.profile}:${r.plate.toFixed(0)}`)};
summary.pass=!summary.bevelOver400.length&&!summary.plateOver50.length;
console.log('glyph-finish-bench',JSON.stringify(summary,null,1));
if(process.argv.includes('--rows'))for(const r of rows)console.log(JSON.stringify(r));
if(process.argv.includes('--check')&&!summary.pass)process.exit(1);
