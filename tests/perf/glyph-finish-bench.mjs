// ADR-0001 F7 perf: Emboss (plate, Manifold) ≤ 50 ms and a 0.5 mm bevel (OCCT, solidMesh at the default tolerance)
// ≤ 400 ms on glyph 'A' at the default 20 × 5 mm, cold (no cache: each run is a new params key). Median of 5.
//   node tests/perf/glyph-finish-bench.mjs [--check]
import {initKernel,makeObject} from '../../web/kernel.mjs';import {solidMesh} from '../../web/cad-solid.mjs';
import {object,glyphDefaults} from '../../web/templates.mjs';import {loadGlyphs} from '../../web/glyph-geometry.mjs';
const K=await initKernel();await loadGlyphs();
const med=a=>a.sort((x,y)=>x-y)[a.length>>1],time=f=>{const t=performance.now();f();return performance.now()-t;};
const g=x=>object('glyph',{...glyphDefaults.glyph,char:'A',...x});
const emb=[],bc=[],br=[];for(let i=0;i<6;i++){const k=1+i*.01;
 emb.push(time(()=>makeObject(K,g({plate:2*k,plateMargin:1.5}),.15).delete()));
 bc.push(time(()=>solidMesh(g({bevel:.5*k}),.15,false)));br.push(time(()=>solidMesh(g({bevel:.5*k,bevelProfile:'round'}),.15,false)));}
emb.shift();bc.shift();br.shift();
const r={embossMs:+med(emb).toFixed(1),bevelChamferMs:+med(bc).toFixed(1),bevelRoundMs:+med(br).toFixed(1),limits:{emboss:50,bevel:400}};
r.pass=r.embossMs<=50&&r.bevelChamferMs<=400&&r.bevelRoundMs<=400;console.log('glyph-finish-bench',JSON.stringify(r));
if(process.argv.includes('--check')&&!r.pass)process.exit(1);
