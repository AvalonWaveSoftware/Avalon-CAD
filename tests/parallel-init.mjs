// WS8: the concurrent init path (initKernel({parallel}) + a pre-started Rust core) yields the same engine: same info
// and byte-identical previews, checks and exports for every fixture.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {initKernel} from '../web/kernel.mjs';
import {initLocalEngine} from '../web/local-engine.mjs';
import {initRustMesh} from '../web/rust-mesh.mjs';
import {migrateProject} from '../web/migrate.mjs';
const binary=fs.readFileSync('app/assets/mesh-core.wasm');
const seqT=performance.now(),seq=await initLocalEngine(await initKernel(),{rust:{binary}}),seqMs=performance.now()-seqT;
const parT=performance.now(),ready=initRustMesh({binary}),par=await initLocalEngine(await initKernel({parallel:true}),{rust:{ready}}),parMs=performance.now()-parT;
assert.deepEqual(par.info,seq.info);
const bytes=v=>(v instanceof ArrayBuffer||Object.prototype.toString.call(v)==="[object ArrayBuffer]")?Buffer.from(v):Buffer.from(v.buffer,v.byteOffset,v.byteLength);
let jobs=0,id=0;
for(const f of fs.readdirSync('tests/fixtures').filter(f=>f.endsWith('.tcad'))){const p=migrateProject(JSON.parse(fs.readFileSync('tests/fixtures/'+f,'utf8')),[]);
 for(const type of ['preview','check','export']){const job={type,project:p,tolerance:.15,ground:true},a=seq.process({id:++id,...job}),b=par.process({id,...job});
  assert.equal(a.error,b.error,f+' '+type);for(const k of ['vertices','triangles','buffer'])if(typeof a[k]==="number")assert.equal(a[k],b[k]);else if(a[k]){assert.ok(b[k],f+" "+type+" "+k+" missing");assert.ok(bytes(a[k]).equals(bytes(b[k])),f+' '+type+' '+k);}
  assert.equal(a.volume,b.volume);assert.deepEqual(a.bounds,b.bounds);jobs++;}}
let failed=null;try{await initRustMesh({url:'file:///nonexistent/mesh-core.wasm',streaming:true});}catch(e){failed=e;}assert.ok(failed,'a missing Rust core still fails');
console.log('Parallel init:',jobs,'jobs identical to sequential init; init',Math.round(seqMs),'ms sequential vs',Math.round(parMs),'ms parallel (Node, second kernel warm)');
seq.destroy();par.destroy();
