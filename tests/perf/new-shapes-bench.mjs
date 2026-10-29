// ADR new-primitives-polyhedra-text §6: creation and mesh budgets for the new shapes (Node, worker-equivalent code).
//   node tests/perf/new-shapes-bench.mjs [--check]   (--check exits 1 when a §6 budget is exceeded)
// Manifold build = makeLocalSolid (median of 5 after 1 warm-up); OCCT = first-time exact B-rep + topology through
// cad-solid's cache (cache disposed before each). Glyphs: every one of the 94 characters, max reported.
import os from 'node:os';const R=process.cwd()+'/';
const {initKernel,makeLocalSolid}=await import(R+'web/kernel.mjs');const CS=await import(R+'web/cad-solid.mjs');
const {object,advancedDefaults,glyphDefaults,defaults}=await import(R+'web/templates.mjs');const {loadGlyphs}=await import(R+'web/glyph-geometry.mjs');
const {GLYPH_CHARS}=await import(R+'web/glyph-metrics.mjs');
const loadStart=os.loadavg()[0];const K=await initKernel({solidOptions:false});await CS.initSolid();await loadGlyphs();
const now=()=>performance.now(),med=a=>[...a].sort((x,y)=>x-y)[a.length>>1];
function manifold(o,tol){const s0=makeLocalSolid(K,o,tol);const tris=s0.numTri();s0.delete();const t=[];for(let i=0;i<5;i++){const a=now(),s=makeLocalSolid(K,o,tol);t.push(now()-a);s.delete();}return {ms:med(t),tris};}
function occt(o){CS.disposeSolidCache();const a=now();CS.objectTopology(o);return now()-a;}
const poly=['triprism','tetrahedron','octahedron','decahedron','dodecahedron','icosahedron'],P={...defaults,...advancedDefaults};
const out={loadStart:+loadStart.toFixed(2),polyhedra:{},torus:{},glyph:{}};
for(const t of poly){const o=object(t,structuredClone(P[t]));const m=manifold(o,.005);occt(o);out.polyhedra[t]={manifoldMs:+m.ms.toFixed(3),tris:m.tris,occtMs:+occt(o).toFixed(1)};}
{const o=object('torus',structuredClone(P.torus));for(const [q,tol] of [['draft',.15],['fine',.03],['ultra',.01],['maximum',.005]]){const m=manifold(o,tol);out.torus[q]={manifoldMs:+m.ms.toFixed(2),tris:m.tris};}occt(o);out.torus.occtMs=+occt(o).toFixed(1);}
{let mx=0,mxc='',tri=0,tric='',oc=0,occ='',sum=0;for(const c of GLYPH_CHARS){const o=object('glyph',{...glyphDefaults.glyph,char:c});const m=manifold(o,.005);sum+=m.ms;if(m.ms>mx){mx=m.ms;mxc=c;}if(m.tris>tri){tri=m.tris;tric=c;}const t=occt(o);if(t>oc){oc=t;occ=c;}}
 out.glyph={count:GLYPH_CHARS.length,manifoldMaxMs:+mx.toFixed(2),manifoldMaxChar:mxc,manifoldTotalMs:+sum.toFixed(1),maxTrisAtMaximum:tri,maxTrisChar:tric,occtMaxMs:+oc.toFixed(1),occtMaxChar:occ};}
const polyMax=k=>Math.max(...Object.values(out.polyhedra).map(v=>v[k]));
const checks={polyManifoldMs:[polyMax('manifoldMs'),2],polyTris:[Math.max(...poly.filter(t=>t!=='triprism').map(t=>out.polyhedra[t].tris)),36],prismTris:[out.polyhedra.triprism.tris,8],
 torusMaxMs:[out.torus.maximum.manifoldMs,25],torusDraftTris:[out.torus.draft.tris,1200],torusFineTris:[out.torus.fine.tris,3000],torusUltraTris:[out.torus.ultra.tris,8500],torusMaxTris:[out.torus.maximum.tris,16000],
 glyphManifoldMs:[out.glyph.manifoldMaxMs,10],glyphTris:[out.glyph.maxTrisAtMaximum,2000],polyOcctMs:[polyMax('occtMs'),60],torusOcctMs:[out.torus.occtMs,20],glyphOcctMs:[out.glyph.occtMaxMs,80]};
// Amendment A3: first-time torus/'@' are real gates, median of 9 fresh worker processes (first-shape-probe.mjs) after the
// worker's idle warm-up; the no-warm-up cold numbers are reported alongside (not gated). The in-process occtMs above stay reported.
import {execFileSync} from 'node:child_process';
// QA follow-up: median of 9 fresh worker processes per figure at a controlled load. Before each process the bench
// waits for the 1-min load average to be < 2 (retry with backoff 2,4,8,…,30 s, at most ~5 min); the load at each
// start is recorded, and a run that never reached < 2 is marked loadControlled:false (still measured and gated).
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),RUNS=9,MAX_LOAD=2;let loadControlled=true;
async function calm(){let wait=2000,total=0;while(os.loadavg()[0]>=MAX_LOAD){if(total>=300000){loadControlled=false;break;}await sleep(wait);total+=wait;wait=Math.min(wait*2,30000);}return +os.loadavg()[0].toFixed(2);}
async function probe(mode,...a){const runs=[],loads=[];for(let i=0;i<RUNS;i++){loads.push(await calm());
 runs.push(JSON.parse(execFileSync(process.execPath,[R+'tests/perf/first-shape-probe.mjs',mode,...a],{encoding:'utf8'}).trim().split('\n').pop()).ms);}
 return {median:med(runs),min:Math.min(...runs),max:Math.max(...runs),runs,loads};}
const FT={torusWarm:await probe('warm','torus'),glyphAtWarm:await probe('warm','glyph','@'),torusCold:await probe('cold','torus'),glyphAtCold:await probe('cold','glyph','@'),warmUp:await probe('warmcost')};
out.firstTime={torusWarmMs:FT.torusWarm.median,glyphAtWarmMs:FT.glyphAtWarm.median,torusColdMs:FT.torusCold.median,glyphAtColdMs:FT.glyphAtCold.median,warmUpMs:FT.warmUp.median,runs:RUNS,maxLoad:MAX_LOAD,loadControlled,
 maxStartLoad:Math.max(...Object.values(FT).flatMap(p=>p.loads)),spread:Object.fromEntries(Object.entries(FT).map(([k,p])=>[k,{min:+p.min.toFixed(2),max:+p.max.toFixed(2),runs:p.runs.map(x=>+x.toFixed(2))}]))};
checks.torusFirstMs=[out.firstTime.torusWarmMs,20];checks.glyphAtFirstMs=[out.firstTime.glyphAtWarmMs,80];
// Architect follow-up ruling: regression cap (not a release target) on the true-cold '@' with no warm-up.
checks.glyphAtColdCapMs=[out.firstTime.glyphAtColdMs,130];
const KNOWN_MISSES=new Set(['torusOcctMs','glyphOcctMs']);// in-process cache-disposed numbers: reported only, gated by the fresh-process checks
const over=Object.entries(checks).filter(([,[v,b]])=>v>b).map(([k])=>k);const fail=over.filter(k=>!KNOWN_MISSES.has(k));const known=over.filter(k=>KNOWN_MISSES.has(k));if(known.length)out.knownMisses=known;out.loadEnd=+os.loadavg()[0].toFixed(2);out.checks=checks;out.pass=!fail.length;if(fail.length)out.failed=fail;
console.log(JSON.stringify(out));if(process.argv.includes('--check')&&fail.length)process.exit(1);
