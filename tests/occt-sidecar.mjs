import {fileURLToPath} from 'node:url';
// WS14 (OCCT_SIDECAR) parity: an engine whose OCCT runs in a separate worker thread (same runJob/solidRemote code as the
// browser) must give exactly the results of the in-process engine: previews, displays, parts, topology (hash and
// body), checks, STL exports and errors, byte for byte. Fixtures plus seeded edit sequences that add, resize and remove
// fillets, move and resize filleted and plain objects. Also checks that an interim (stand-in) preview is offered only
// when a fillet mesh is pending, and that it never reaches the engine caches (the next result is still exact).
import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {initKernel} from '../web/kernel.mjs';import {initLocalEngine} from '../web/local-engine.mjs';
import {object,defaults,blank,advancedDefaults,glyphDefaults} from '../web/templates.mjs';import {loadGlyphs} from '../web/glyph-geometry.mjs';import {migrateProject} from '../web/migrate.mjs';
import {sidecarClient} from './occt-sidecar-client.mjs';
const refDir=fileURLToPath(new URL('./.occt-sidecar-ref/',import.meta.url));fs.rmSync(refDir,{recursive:true,force:true});fs.cpSync('web',refDir+'web',{recursive:true});
process.on('exit',()=>fs.rmSync(refDir,{recursive:true,force:true}));
const rust={binary:fs.readFileSync('app/assets/mesh-core.wasm')};
const refKernel=await import(refDir+'web/kernel.mjs'),refEngine=await import(refDir+'web/local-engine.mjs');
await loadGlyphs();await (await import(refDir+'web/glyph-geometry.mjs')).loadGlyphs();
const KB=await refKernel.initKernel(),B=await refEngine.initLocalEngine(KB,{rust});
const KA=await initKernel({solidOptions:false}),A=await initLocalEngine(KA,{rust}),client=sidecarClient();
const bytes=v=>v instanceof ArrayBuffer?Buffer.from(v):Buffer.from(v.buffer,v.byteOffset,v.byteLength);
const enc=x=>createHash('sha1').update(JSON.stringify(x,(k,v)=>ArrayBuffer.isView(v)||v instanceof ArrayBuffer?bytes(v).toString('base64'):v)||'u').digest('hex');
// Topology bodies are compared without groups[].faceId: that is OCCT's TShape hashCode, derived from the shape's heap
// address, so it depends on allocation history (it differs between two in-process engines too) and nothing reads it
// (the UI uses groups[].face). Everything else in the body must be identical.
const encTopology=t=>enc(t&&{...t,groups:t.groups?.map(({faceId,...g})=>g)});let faceIdOnly=0;
const KEYS=['vertices','triangles','flatTriangles','smoothingGroups','displayPositions','displayNormals','displayIndex','buffer'];
function same(a,b,what){assert.equal(a.error,b.error,what+' error');if(b.error)return;
 for(const k of KEYS){assert.equal(!a[k],!b[k],what+' '+k);if(b[k]&&typeof b[k]!=='number')assert.ok(bytes(a[k]).equals(bytes(b[k])),what+' '+k+' bytes');else assert.equal(a[k],b[k],what+' '+k);}
 assert.equal(a.volume,b.volume,what+' volume');assert.deepEqual(a.bounds,b.bounds,what+' bounds');assert.deepEqual(a.floorAdjustments,b.floorAdjustments,what+' floor');assert.equal(a.count,b.count,what+' count');
 assert.equal(a.parts?.length,b.parts?.length,what+' parts');for(let i=0;i<(b.parts||[]).length;i++){const p=a.parts[i],q=b.parts[i];assert.equal(p.id,q.id);assert.equal(p.topologyHash,q.topologyHash,what+' topologyHash');
  assert.deepEqual(p.bounds,q.bounds);assert.equal(encTopology(p.topology),encTopology(q.topology),what+' topology '+q.id);if(enc(p.topology)!==enc(q.topology))faceIdOnly++;for(const k of ['vertices','triangles','flatTriangles','smoothingGroups'])if(q[k])assert.ok(bytes(p[k]).equals(bytes(q[k])),what+' part '+k);}}
let id=0,jobs=0,interims=0,interimWithoutMesh=0,errors=0;
async function check(project,tolerance,what){for(const type of ['preview','check','export']){const job={id:++id,type,project:structuredClone(project),tolerance,ground:true};
 let offered=false;const a=await client.run(A,job,{onInterim:r=>{offered=true;assert.ok(r.displayPositions&&!r.error,what+' interim');}}),b=B.process(structuredClone(job));
 if(offered){interims++;assert.equal(type,'preview');}same(a,b,what+' '+type);jobs++;if(b.error)errors++;}}
for(const f of fs.readdirSync('tests/fixtures').filter(f=>f.endsWith('.tcad'))){const p=migrateProject(JSON.parse(fs.readFileSync('tests/fixtures/'+f,'utf8')),[]);await check(p,.15,f);}
let seed=0x14ab;const rnd=()=>((seed=Math.imul(seed^seed>>>15,0x2c1b3c6d)+0x6d2b79f5>>>0)/4294967296),pick=a=>a[Math.floor(rnd()*a.length)],num=(a,b)=>Math.round((a+rnd()*(b-a))*4)/4;
// ADR new-primitives-polyhedra-text: torus, triangular prism, two polyhedra and text join the random scenes.
const TYPES=['box','cylinder','sphere','tube','cone','rounded','torus','triprism','dodecahedron','decahedron','glyph'],ALL={...defaults,...advancedDefaults,...glyphDefaults};
const make=()=>{const t=pick(TYPES),o=object(t,structuredClone(ALL[t]),[num(-30,30),num(-30,30),num(0,8)]);return o;};
const fillet=o=>{if(o.type==='box')o.fillets=[{edges:pick([[0,1,2,3],[0,1,2,3,4,5,6,7,8,9,10,11],[4,5]]),radius:num(.5,2)}];else if(o.type==='cylinder')o.fillets=[{edges:[0,2],radius:num(.5,2)}];};
const EDITS=[
 p=>{const o=pick(p.objects);if(o)fillet(o);},
 p=>{const o=pick(p.objects.filter(o=>o.fillets?.length));if(o)o.fillets[0].radius=num(.5,3);},
 p=>{const o=pick(p.objects.filter(o=>o.fillets?.length));if(o)delete o.fillets;},
 p=>{const o=pick(p.objects);if(o)o.position=[o.position[0]+num(-5,5),o.position[1]+num(-5,5),o.position[2]];},
 p=>{const o=pick(p.objects);if(!o)return;const k=pick(Object.keys(o.params).filter(k=>typeof o.params[k]==='number'));if(k)o.params[k]=Math.max(2,o.params[k]+num(-2,4));},
 p=>{p.objects.push(make());},
 p=>{if(p.objects.length>1)p.objects.splice(Math.floor(rnd()*p.objects.length),1);},
 p=>{const o=pick(p.objects);if(o)o.mode=o.mode==='cut'?'solid':'cut';},
 p=>{const o=pick(p.objects);if(o){o.resolution={mode:'tolerance',tolerance:pick([.05,.01,.005])};}},
 p=>{p.buildPlaneEnabled=!p.buildPlaneEnabled;},
];
const SEQUENCES=+(process.env.AVALON_SIDECAR_SEQUENCES||60);
for(let n=0;n<SEQUENCES;n++){const p=blank();const count=1+Math.floor(rnd()*4);for(let i=0;i<count;i++)p.objects.push(make());if(rnd()<.7)fillet(pick(p.objects));
 for(let step=0;step<4;step++){pick(EDITS)(p);await check(p,pick([.15,.15,.05]),'sequence '+n+' step '+step);}}
// A first-time fillet offers an interim preview; the following moves of another object, with the fillet cached, do not.
{const p=blank(),o=object('box',{w:30,d:30,h:15},[0,0,7.5]),q=object('cylinder',structuredClone(defaults.cylinder),[40,0,10]);o.fillets=[{edges:[0,1,2,3,4,5,6,7,8,9,10,11],radius:1.75}];o.resolution={mode:'tolerance',tolerance:.005};p.objects.push(o,q);
 let offered=0;const a=await client.run(A,{id:++id,type:'preview',project:p,tolerance:.15},{onInterim:()=>offered++});same(a,B.process({id,type:'preview',project:p,tolerance:.15}),'first-time fillet');assert.equal(offered,1,'interim for a first-time fillet');
 q.position[0]+=3;offered=0;const c=await client.run(A,{id:++id,type:'preview',project:p,tolerance:.15},{onInterim:()=>offered++});same(c,B.process({id,type:'preview',project:p,tolerance:.15}),'move beside a cached fillet');assert.equal(offered,0,'no interim once cached');}
// Errors: an impossible fillet must fail with the same message through the sidecar, every time it is asked.
{const p=blank(),o=object('box',{w:4,d:4,h:4},[0,0,2]);o.fillets=[{edges:[0,1,2,3,4,5,6,7,8,9,10,11],radius:3}];p.objects.push(o);
 for(let k=0;k<2;k++)for(const type of ['preview','export']){const job={id:++id,type,project:p,tolerance:.15,ground:true},a=await client.run(A,job),b=B.process(structuredClone(job));assert.ok(b.error,'impossible fillet fails');same(a,b,'impossible fillet '+type);errors++;jobs++;}}
// ADR-0001 F6: chamfers and mixed round + chamfer go through the same remote solidMesh/topology path (geometryKey carries
// kind): identical previews, checks, exports and errors; a first-time chamfer offers the stand-in preview like a fillet.
{const p=blank(),o=object('box',{w:30,d:20,h:10},[0,0,5]),q=object('cylinder',structuredClone(defaults.cylinder),[40,0,10]);o.fillets=[{edges:[0],radius:2},{edges:[1,2],radius:1,kind:'chamfer'}];q.fillets=[{edges:[0],radius:1.5,kind:'chamfer'}];p.objects.push(o,q);p.version=3;
 let offered=0;const a=await client.run(A,{id:++id,type:'preview',project:p,tolerance:.15},{onInterim:()=>offered++});same(a,B.process({id,type:'preview',project:p,tolerance:.15}),'first-time chamfer');assert.equal(offered,1,'interim for a first-time chamfer');jobs++;interims++;
 await check(p,.15,'round + chamfer');o.fillets[1].radius=1.25;await check(p,.05,'chamfer resized');
 const r=structuredClone(p);r.objects[0].fillets=[{edges:[0],radius:2},{edges:[1,2],radius:1}];await check(r,.15,'same edges rounded, not chamfered');
 const bad=blank(),x=object('box',{w:4,d:4,h:4},[0,0,2]);x.fillets=[{edges:[0,1,2,3,4,5,6,7,8,9,10,11],radius:3,kind:'chamfer'}];bad.objects.push(x);
 for(const type of ['preview','export']){const job={id:++id,type,project:bad,tolerance:.15,ground:true},a=await client.run(A,job),b=B.process(structuredClone(job));assert.match(b.error,/That chamfer is too large/);same(a,b,'impossible chamfer '+type);errors++;jobs++;}}
// ADR-0001 F7: plate-only glyphs (Emboss, Engrave) stay on Manifold: identical results with the sidecar on.
{const p=blank(),G=(char,x,pos)=>object('glyph',{...glyphDefaults.glyph,char,...x},pos);p.objects.push(G('A',{plate:2,plateMargin:1.5},[0,0,4]),G('o',{depth:1,plate:2,plateMargin:1,engrave:true},[30,0,1]),G('T',{plate:1.5},[0,30,3]));p.version=3;
 await check(p,.15,'glyph finish');}
console.log(`OCCT sidecar parity: ${jobs} jobs identical to the in-process engine (previews, displays, parts, topology, checks, STL exports; ${errors} identical errors); ${interims} interim previews offered, all for pending fillet meshes; ${client.stats.requests} sidecar requests; ${faceIdOnly} topology bodies differed only in OCCT faceId hash codes`,JSON.stringify(client.remote.stats()));
client.close();A.destroy();B.destroy();
