// ADR-0001 F6, Master Chief ruling 2 (2026-10-17): all-edge chamfer ≤ 2.5× all-edge round, per primitive
// (replaces "chamfer ≤ fillet time").
//   node tests/perf/round-chamfer-bench.mjs [--check]   (--check exits 1 when a primitive exceeds 2.5×)
// Each primitive at its default size gets every edge rounded (r 0.5) and, separately, every edge chamfered (d 0.5):
// the exact finished B-rep (base + edge finish, outside cad-solid's cache) is built by finishedShapeForTest, median of
// 5 after 1 warm-up, round and chamfer runs interleaved so machine load hits both alike. A primitive with no edges
// (sphere, torus) or whose round cannot be built at 0.5 mm is reported and skipped; a chamfer that fails where the round
// works fails the check. Glyph 'A' (Roboto Bold, default size) stands for the letters.
import os from 'node:os';const R=process.cwd()+'/';
const {initKernel}=await import(R+'web/kernel.mjs');const CS=await import(R+'web/cad-solid.mjs');
const {object,defaults,advancedDefaults,glyphDefaults}=await import(R+'web/templates.mjs');const {loadGlyphs}=await import(R+'web/glyph-geometry.mjs');
const {withRoundover}=await import(R+'web/operations.mjs');
await initKernel({solidOptions:false});await CS.initSolid();await loadGlyphs();
const LIMIT=2.5,D=.5,check=process.argv.includes('--check'),loadStart=os.loadavg()[0];
const now=()=>performance.now(),med=a=>[...a].sort((x,y)=>x-y)[a.length>>1];
const P={...defaults,...advancedDefaults};
const prims=[...['box','pyramid','cylinder','tube','cone','sphere','rounded','wedge','torus','triprism','tetrahedron','octahedron','decahedron','dodecahedron','icosahedron'].filter(t=>P[t]).map(t=>[t,object(t,structuredClone(P[t]))]),["glyph 'A'",object('glyph',{...glyphDefaults.glyph,char:'A'})]];
const build=o=>{const a=now();const s=CS.finishedShapeForTest(o);const t=now()-a;s.delete();return t;};
const out={loadStart:+loadStart.toFixed(2),limit:LIMIT,distance:D,primitives:{}};let bad=0;
for(const [name,o] of prims){const n=CS.objectTopology(o).edges.length,all=[...Array(n).keys()];
 if(!n){out.primitives[name]={edges:0,skipped:'no edges'};continue;}
 const round=withRoundover(o,all,D),chamfer=withRoundover(o,all,D,'chamfer');
 try{build(round);}catch(e){out.primitives[name]={edges:n,skipped:'round not possible: '+e.message};continue;}
 try{build(chamfer);}catch(e){out.primitives[name]={edges:n,error:'chamfer failed where the round works: '+e.message};bad++;continue;}
 const tr=[],tc=[];for(let i=0;i<5;i++){tr.push(build(round));tc.push(build(chamfer));}
 const r=med(tr),c=med(tc),ratio=c/r;out.primitives[name]={edges:n,roundMs:+r.toFixed(1),chamferMs:+c.toFixed(1),ratio:+ratio.toFixed(2),ok:ratio<=LIMIT};if(ratio>LIMIT)bad++;}
console.log(JSON.stringify(out,null,1));
console.log(`round-chamfer-bench: ${Object.entries(out.primitives).map(([k,v])=>v.ratio!=null?`${k} ${v.ratio}×`:`${k} ${v.skipped?'skipped':'FAIL'}`).join(', ')} (limit ${LIMIT}×)`);
if(check&&bad){console.error(`FAIL: ${bad} primitive(s) over ${LIMIT}× or failing`);process.exit(1);}
