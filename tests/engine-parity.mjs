// WS5 parity: the cached engine must give geometrically equal previews and byte-identical parts, checks and exports to a full rebuild. Each job is
// compared with the same job after clearing every cache (a full rebuild) and, where the legacy JS builder applies, with
// buildModel. Covers the fixtures and 500 seeded random edit sequences (move, rotate, resize, add, duplicate, delete,
// reorder, enable, cut, layer, exclusion, build plane).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadPyodide} from 'pyodide';
import {initKernel,buildModel,writeSTL} from '../web/kernel.mjs';
import {initLocalEngine} from '../web/local-engine.mjs';
import {object,defaults,blank,advancedDefaults,glyphDefaults} from '../web/templates.mjs';import {loadGlyphs} from '../web/glyph-geometry.mjs';await loadGlyphs();
import {migrateProject} from '../web/migrate.mjs';
import {ENGINE_CACHE,ENGINE_CACHE_MERGE} from '../web/perf-flags.mjs';
import {corners} from './display-corners.mjs';
// The reference is full-rebuild mode itself: a second engine loaded from a temporary copy of web/ with ENGINE_CACHE=false
// (its own manifold instance, so its run IDs are independent).
const offDir=new URL('./.engine-parity-off/',import.meta.url).pathname;fs.rmSync(offDir,{recursive:true,force:true});fs.cpSync('web',offDir+'web',{recursive:true});
fs.writeFileSync(offDir+'web/perf-flags.mjs',fs.readFileSync(offDir+'web/perf-flags.mjs','utf8').replace('ENGINE_CACHE=true','ENGINE_CACHE=false'));
process.on('exit',()=>fs.rmSync(offDir,{recursive:true,force:true}));
const offKernel=await import(offDir+'web/kernel.mjs'),offEngine=await import(offDir+'web/local-engine.mjs');
const K=await initKernel(),K0=await offKernel.initKernel();
const runtime=await initLocalEngine(K,{loadPyodide,pythonURL:new URL('../node_modules/pyodide/',import.meta.url).pathname,pythonSource:fs.readFileSync('engine/python/model_jobs.py','utf8'),rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
const reference=await offEngine.initLocalEngine(K0,{loadPyodide,pythonURL:new URL('../node_modules/pyodide/',import.meta.url).pathname,pythonSource:fs.readFileSync('engine/python/model_jobs.py','utf8'),rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});assert.equal(reference.engineCache,null);
const cache=runtime.engineCache;if(!ENGINE_CACHE){assert.equal(cache,null);console.log('Engine parity skipped: ENGINE_CACHE is off');process.exit(0);}
let id=0,jobs=0;const run=data=>runtime.process({id:++id,...data}),rebuild=data=>{const r=reference.process({id,...data});return r;};
const KEYS=['vertices','triangles','flatTriangles','smoothingGroups','displayPositions','displayNormals','displayIndex','buffer'];
// WS10: the cached preview's display (assembled from per-part displays) must be byte-identical, expanded, to a fresh
// preparation of its own mesh.
let displayExact=0;
const displayCheck=(m,what)=>{if(!m.displayPositions||m.error)return;const D=corners(m),fresh=runtime.rust.prepare(m.vertices,m.triangles,m.flatTriangles,m.smoothingGroups);
 assert.ok(bytes(D.positions).equals(bytes(fresh.positions))&&bytes(D.normals).equals(bytes(fresh.normals)),what+' display');displayExact++;};
const bytes=v=>(v instanceof ArrayBuffer||Object.prototype.toString.call(v)==="[object ArrayBuffer]")?Buffer.from(v):Buffer.from(v.buffer,v.byteOffset,v.byteLength);
// Architect ruling (WS5 option 1): the preview's merged mesh may be geometrically equal. Volume, bounds and the
// canonicalized (sorted, de-duplicated) vertex set must agree within 1e-9 (relative for volume); the triangle count
// and the number of flat-shaded triangles must match. Parts, checks and exports stay byte-identical.
const canon=v=>{const pts=[];for(let i=0;i<v.length;i+=3)pts.push([v[i],v[i+1],v[i+2]]);pts.sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);return pts.filter((p,i)=>!i||p.some((x,k)=>x!==pts[i-1][k]));};
const geometric=(a,b,what)=>{assert.ok(Math.abs(a.volume-b.volume)<=1e-9*Math.max(1,Math.abs(b.volume)),what+' volume '+a.volume+' vs '+b.volume);
 assert.equal(!a.bounds,!b.bounds,what+' bounds');if(b.bounds)for(const e of ['min','max'])for(let k=0;k<3;k++)assert.ok(Math.abs(a.bounds[e][k]-b.bounds[e][k])<=1e-9,what+' bounds');
 const p=canon(a.vertices),q=canon(b.vertices);assert.equal(p.length,q.length,what+' vertex set size');for(let i=0;i<p.length;i++)for(let k=0;k<3;k++)assert.ok(Math.abs(p[i][k]-q[i][k])<=1e-9,what+' vertex set');
 assert.equal(a.triangles.length,b.triangles.length,what+' triangle count');if(b.flatTriangles)assert.equal(a.flatTriangles.reduce((x,y)=>x+y,0),b.flatTriangles.reduce((x,y)=>x+y,0),what+' flat count');};
const same=(a,b,what,geo=false)=>{assert.equal(a.error,b.error,what+' error');if(a.error)return;
 if(geo){geometric(a,b,what);assert.deepEqual(a.floorAdjustments,b.floorAdjustments,what+' floor');}
 else for(const k of KEYS){assert.equal(!a[k],!b[k],what+' '+k);if(typeof a[k]==="number")assert.equal(a[k],b[k]);else if(a[k])assert.ok(bytes(a[k]).equals(bytes(b[k])),what+' '+k+' bytes');}
 if(!geo){assert.equal(a.volume,b.volume,what+' volume');assert.deepEqual(a.bounds,b.bounds,what+' bounds');assert.deepEqual(a.floorAdjustments,b.floorAdjustments,what+' floor');assert.equal(a.triangles?.length,b.triangles?.length);}
 assert.equal(a.parts?.length,b.parts?.length,what+' parts');for(let i=0;i<(a.parts||[]).length;i++){const p=a.parts[i],q=b.parts[i];assert.equal(p.id,q.id);assert.equal(p.topologyHash,q.topologyHash);assert.deepEqual(p.bounds,q.bounds);for(const k of ['vertices','triangles','flatTriangles','smoothingGroups'])assert.ok(Buffer.from(p[k].buffer).equals(Buffer.from(q[k].buffer)),what+' part '+k);}};
function check(project,tolerance,what){
 for(const type of ['check','preview','export']){const job={type,project,tolerance,ground:true},hit=run(job),full=rebuild(job);same(hit,full,what+' '+type,type==='preview'&&!!ENGINE_CACHE_MERGE);if(type==='preview'){displayCheck(hit,what);displayCheck(full,what+' full');}jobs++;
  if(type==='export'&&!full.error&&!project.buildPlaneEnabled){const m=buildModel(K,project,tolerance);if(m.triangles.length)assert.ok(bytes(hit.buffer).equals(Buffer.from(writeSTL(m.vertices,m.triangles,true))),what+' legacy STL');}
  if(type==='preview'&&!full.error&&!project.buildPlaneEnabled){const legacy=buildModel(K,project,tolerance,true);geometric(hit,legacy,what+' legacy');}}
 // and once more warm, after the full rebuild refilled the caches
 const warm=run({type:'preview',project,tolerance}),again=run({type:'preview',project,tolerance});same(warm,again,what+' warm');}
for(const f of fs.readdirSync('tests/fixtures').filter(f=>f.endsWith('.tcad'))){const p=migrateProject(JSON.parse(fs.readFileSync('tests/fixtures/'+f,'utf8')),[]);check(p,.15,f);check({...p,buildPlaneEnabled:true},.05,f+' on the build plane');}
let seed=0x5eed;const rnd=()=>((seed=Math.imul(seed^seed>>>15,0x2c1b3c6d)+0x6d2b79f5>>>0)/4294967296),pick=a=>a[Math.floor(rnd()*a.length)],num=(a,b)=>Math.round((a+rnd()*(b-a))*4)/4;
// ADR new-primitives-polyhedra-text: the eight new object types join the random scenes.
const TYPES=['box','cylinder','sphere','wedge','cone','rounded','tube','pyramid','torus','triprism','tetrahedron','octahedron','decahedron','dodecahedron','icosahedron','glyph'],ALL={...defaults,...advancedDefaults,...glyphDefaults};
const make=()=>{const o=object(pick(TYPES),structuredClone(ALL[pick(TYPES)]&&ALL[TYPES[0]]),[num(-20,20),num(-20,20),num(-6,10)]);o.params=structuredClone(ALL[o.type]);return o;};
const EDITS=[
 p=>{const o=pick(p.objects);if(o)o.position=[o.position[0]+num(-5,5),o.position[1]+num(-5,5),o.position[2]+num(-4,4)];},
 p=>{const o=pick(p.objects);if(o)o.rotation=[num(0,90),0,num(0,180)];},
 p=>{const o=pick(p.objects);if(!o)return;const k=pick(Object.keys(o.params).filter(k=>typeof o.params[k]==='number'));if(k)o.params[k]=Math.max(1,o.params[k]+num(-2,4));},
 p=>{p.objects.push(make());},
 p=>{const o=pick(p.objects);if(o)p.objects.push({...structuredClone(o),id:'dup'+(++id)});},
 p=>{if(p.objects.length>1)p.objects.splice(Math.floor(rnd()*p.objects.length),1);},
 p=>{if(p.objects.length>1){const i=Math.floor(rnd()*p.objects.length),[o]=p.objects.splice(i,1);p.objects.splice(Math.floor(rnd()*p.objects.length),0,o);}},
 p=>{const o=pick(p.objects);if(o)o.enabled=!o.enabled;},
 p=>{const o=pick(p.objects);if(o)o.mode=o.mode==='cut'?'solid':'cut';},
 p=>{const o=pick(p.objects);if(o)o.layerId=o.layerId==='layer-2'?'layer-1':'layer-2';},
 p=>{const o=pick(p.objects),c=pick(p.objects.filter(x=>x.mode==='cut'));if(o&&c)o.excludedCutouts=o.excludedCutouts?.length?[]:[c.id];},
 p=>{p.buildPlaneEnabled=!p.buildPlaneEnabled;},
 p=>{const o=pick(p.objects);if(o)o.scale=o.scale?undefined:[1,1,num(1,2)];},
];
const SEQUENCES=+(process.env.AVALON_PARITY_SEQUENCES||500);
for(let n=0;n<SEQUENCES;n++){
 const p=blank();p.layers.push({id:'layer-2',name:'Layer 2'});const count=1+Math.floor(rnd()*5);for(let i=0;i<count;i++)p.objects.push(make());
 for(let step=0;step<3;step++){
  pick(EDITS)(p);const tolerance=pick([.15,.15,.05]);
  const hx=run({type:'export',project:p,tolerance,ground:true}),fx=rebuild({type:'export',project:p,tolerance,ground:true});same(hx,fx,'sequence '+n+' export');jobs++;
   const hit=run({type:'preview',project:p,tolerance}),full=rebuild({type:'preview',project:p,tolerance}),hit2=run({type:'check',project:p,tolerance}),full2=rebuild({type:'check',project:p,tolerance});if(step===2&&n%50===0)cache.clear();
  try{same(hit,full,'sequence '+n+' step '+step+' preview',!!ENGINE_CACHE_MERGE);displayCheck(hit,'sequence '+n+' step '+step);same(hit2,full2,'sequence '+n+' step '+step+' check');}catch(e){if(process.env.DUMP)fs.writeFileSync(process.env.DUMP,JSON.stringify({p,tolerance}));throw e;}jobs+=2;
  if(!p.buildPlaneEnabled&&!full.error){const lp=buildModel(K,p,tolerance,true);geometric(hit,lp,'sequence '+n+' legacy preview');}
 }
}
const size=cache.size();assert.ok(size.localMB+size.derivedMB<=150);
console.log('Engine parity:',jobs,'jobs match a full rebuild (parts, checks, STL exports byte-identical; previews '+(ENGINE_CACHE_MERGE?'geometrically equal within 1e-9':'byte-identical')+')',JSON.stringify(cache.stats),JSON.stringify(size),'displays byte-identical to a fresh preparation: '+displayExact);
runtime.destroy();reference.destroy();
