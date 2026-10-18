// ADR-0001 F7 P3: after an OCCT memory error (a wasm trap) the geometry worker re-creates OCCT from the already-compiled
// module before the next job, and the error the user sees is unchanged. Emulates a device whose OCCT heap cannot grow
// past 300 MB (V8 --wasm-max-mem-pages): the Ultra STL export of Engrave+Round 't' (≈1.2 GB of OCCT heap) traps; the
// jobs after it must give exactly the meshes and STL an unconstrained run gives (before P3 they failed with
// 'null function or function signature mismatch' / 'memory access out of bounds' until the app was restarted).
//   node tests/occt-reset.mjs
import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import fs from 'node:fs';import crypto from 'node:crypto';
if(process.argv[2]==='--child'){
 const {initKernel}=await import('../web/kernel.mjs');const {initLocalEngine}=await import('../web/local-engine.mjs');const S=await import('../web/cad-solid.mjs');
 const {object,blank}=await import('../web/templates.mjs');const {loadGlyphs}=await import('../web/glyph-geometry.mjs');
 const K=await initKernel();await loadGlyphs();const E=await initLocalEngine(K,{rust:{binary:fs.readFileSync(new URL('../app/assets/mesh-core.wasm',import.meta.url))}});
 const h=x=>crypto.createHash('sha256').update(ArrayBuffer.isView(x)?Buffer.from(x.buffer,x.byteOffset,x.byteLength):Buffer.from(x)).digest('hex').slice(0,16);
 // As web/worker.mjs drain(): a job that finds OCCT trapped first gets a fresh instance.
 let id=0,resets=0;const run=async d=>{if(S.occtNeedsReset()){resets++;await S.resetSolid();}const r=E.process({id:++id,...d});if(r.error)throw Error(r.error);return r;};
 const out=[];for(const [c,profile,engrave] of process.argv[3].split(',').map(r=>r.split(':'))){
  const o=object('glyph',{char:c,size:20,depth:5,font:'roboto-bold@1',plate:2,plateMargin:2,bevel:.5,bevelProfile:profile,engrave:engrave==='e'},[0,0,0],'Letter '+c);o.id='g1';
  try{const placed=(await run({type:'place',object:o,position:[0,0,0],floor:true})).object,prj=blank();prj.buildPlaneEnabled=true;prj.objects=[placed];
   const pv=await run({type:'preview',project:prj,tolerance:.15}),ex=await run({type:'export',project:prj,tolerance:.01,ground:true});
   out.push({c,place:placed.position,preview:h(pv.vertices)+h(pv.triangles),stl:h(ex.buffer)});}catch(e){out.push({c,error:e.message});}}
 console.log(JSON.stringify({out,resets}));process.exit(0);}
const child=(rows,flags=[])=>{const r=spawnSync(process.execPath,[...flags,new URL(import.meta.url).pathname,'--child',rows],{encoding:'utf8',maxBuffer:1<<24});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout.trim().split('\n').at(-1));};
const t=performance.now(),free=child('x:chamfer:,A:round:'),capped=child('t:round:e,x:chamfer:,A:round:',['--wasm-max-mem-pages=4800']);
assert.equal(capped.out[0].error,'RuntimeError: memory access out of bounds','the trap reaches the user with its original text');
assert.equal(capped.resets,1,'one fresh OCCT instance after the trap');
assert.deepEqual(capped.out.slice(1),free.out,'jobs after the trap give exactly the unconstrained results');
console.log(`occt reset: trap '${capped.out[0].error}', then ${free.out.length} glyphs identical after 1 reset (${((performance.now()-t)/1000).toFixed(1)} s)`);
