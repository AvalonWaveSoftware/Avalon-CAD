// ADR-0001 F7 P3: after an OCCT memory error (a wasm trap) the geometry worker re-creates OCCT from the already-compiled
// module before the next job, and the error the user sees is unchanged. Emulates a device whose OCCT heap cannot grow
// past 150 MB (V8 --wasm-max-mem-pages=2400): the Ultra STL export of a 400 mm cylinder with 40 mm rounded rims traps;
// the jobs after it (a filleted box through OCCT, an Engrave plate letter) must give exactly the meshes and STL an
// unconstrained run gives (before P3 they failed with 'null function or function signature mismatch' / 'memory access
// out of bounds' until the app was restarted).
//   node tests/occt-reset.mjs
import {fileURLToPath} from 'node:url';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import fs from 'node:fs';import crypto from 'node:crypto';
if(process.argv[2]==='--child'){
 const {initKernel}=await import('../web/kernel.mjs');const {initLocalEngine}=await import('../web/local-engine.mjs');const S=await import('../web/cad-solid.mjs');
 const {object,blank}=await import('../web/templates.mjs');const {loadGlyphs}=await import('../web/glyph-geometry.mjs');
 const K=await initKernel();await loadGlyphs();const E=await initLocalEngine(K,{rust:{binary:fs.readFileSync(new URL('../app/assets/mesh-core.wasm',import.meta.url))}});
 const h=x=>crypto.createHash('sha256').update(ArrayBuffer.isView(x)?Buffer.from(x.buffer,x.byteOffset,x.byteLength):Buffer.from(x)).digest('hex').slice(0,16);
 // As web/worker.mjs drain(): a job that finds OCCT trapped first gets a fresh instance.
 let id=0,resets=0;const run=async d=>{if(S.occtNeedsReset()){resets++;await S.resetSolid();}const r=E.process({id:++id,...d});if(r.error)throw Error(r.error);return r;};
 const make={big:()=>{const o=object('cylinder',{diameter:400,h:200},[0,0,0]);o.fillets=[{edges:[0,2],radius:40}];return o;},
  box:()=>{const o=object('box',{w:30,d:30,h:15},[0,0,0]);o.fillets=[{edges:[0,1,2,3,4,5,6,7,8,9,10,11],radius:1.75}];return o;},
  A:()=>object('glyph',{char:'A',size:20,depth:5,font:'roboto-bold@1',plate:2,plateMargin:2,engrave:true},[0,0,0],'Letter A')};
 const out=[];for(const c of process.argv[3].split(',')){const o=make[c]();o.id='g1';
  try{const placed=(await run({type:'place',object:o,position:[0,0,0],floor:true})).object,prj=blank();prj.buildPlaneEnabled=true;prj.objects=[placed];
   const pv=await run({type:'preview',project:prj,tolerance:.15}),ex=await run({type:'export',project:prj,tolerance:.01,ground:true});
   out.push({c,place:placed.position,preview:h(pv.vertices)+h(pv.triangles),stl:h(ex.buffer)});}catch(e){out.push({c,error:e.message});}}
 console.log(JSON.stringify({out,resets}));process.exit(0);}
const child=(rows,flags=[])=>{const r=spawnSync(process.execPath,[...flags,fileURLToPath(new URL(import.meta.url)),'--child',rows],{encoding:'utf8',maxBuffer:1<<24});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout.trim().split('\n').at(-1));};
const t=performance.now(),free=child('box,A'),capped=child('big,box,A',['--wasm-max-mem-pages=2400']);
assert.equal(capped.out[0].error,'RuntimeError: memory access out of bounds','the trap reaches the user with its original text');
assert.equal(capped.resets,1,'one fresh OCCT instance after the trap');
assert.deepEqual(capped.out.slice(1),free.out,'jobs after the trap give exactly the unconstrained results');
console.log(`occt reset: trap '${capped.out[0].error}', then ${free.out.length} objects identical after 1 reset (${((performance.now()-t)/1000).toFixed(1)} s)`);
