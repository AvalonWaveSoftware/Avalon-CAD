// QA (WS7): the engine cache's byte accounting went negative (-0.1 MB) after clear(). The accounting must never
// go below zero, must match the live entries, and must be exactly zero after clear(). Exercises growth, frees of
// unused derived entries, LRU eviction under a small budget, and clear().
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {initKernel} from '../web/kernel.mjs';
import {initLocalEngine} from '../web/local-engine.mjs';
import {object,defaults,blank,advancedDefaults,glyphDefaults} from '../web/templates.mjs';import {loadGlyphs} from '../web/glyph-geometry.mjs';await loadGlyphs();
import {ENGINE_CACHE} from '../web/perf-flags.mjs';
if(!ENGINE_CACHE){console.log('Engine cache accounting skipped: ENGINE_CACHE is off');process.exit(0);}
const K=await initKernel(),opts={rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}};
let seed=0xacc7;const rnd=()=>((seed=Math.imul(seed^seed>>>15,0x2c1b3c6d)+0x6d2b79f5>>>0)/4294967296),pick=a=>a[Math.floor(rnd()*a.length)],num=(a,b)=>Math.round((a+rnd()*(b-a))*4)/4;
// ADR new-primitives-polyhedra-text: the eight new object types join the random scenes.
const TYPES=['box','cylinder','sphere','wedge','cone','rounded','tube','pyramid','torus','triprism','tetrahedron','octahedron','decahedron','dodecahedron','icosahedron','glyph'],ALL={...defaults,...advancedDefaults,...glyphDefaults};
const make=()=>{const o=object(pick(TYPES),undefined,[num(-20,20),num(-20,20),num(-6,10)]);o.params=structuredClone(ALL[o.type]);return o;};
let checks=0,id=0;
for(const budget of [undefined,64*1024]){
 const runtime=await initLocalEngine(K,{...opts,engineCacheBudget:budget}),cache=runtime.engineCache;
 const ok=what=>{const s=cache.size();assert.ok(s.localBytes>=0&&s.derivedBytes>=0,what+' negative: '+JSON.stringify(s));assert.ok(s.localMB>=0&&s.derivedMB>=0&&!Object.is(s.localMB,-0)&&!Object.is(s.derivedMB,-0),what+' MB: '+JSON.stringify(s));
  if(!s.local)assert.equal(s.localBytes,0,what+' local bytes with no entries');checks++;};
 ok('fresh');
 for(let n=0;n<40;n++){const p=blank();const count=1+Math.floor(rnd()*6);for(let i=0;i<count;i++)p.objects.push(make());
  for(let step=0;step<4;step++){
   for(const type of ['preview','check','export'])runtime.process({id:++id,type,project:p,tolerance:pick([.15,.05]),ground:true});ok('job '+n+'.'+step);
   const o=pick(p.objects);if(rnd()<.5)o.position=[o.position[0]+num(-5,5),o.position[1],o.position[2]];else if(p.objects.length>1)p.objects.splice(0,1);}
  if(n%10===9){cache.clear();const s=cache.size();assert.equal(s.localBytes,0,'local after clear');assert.equal(s.derivedBytes,0,'derived after clear');ok('clear '+n);}}
 cache.clear();cache.clear();const s=cache.size();assert.deepEqual([s.localBytes,s.derivedBytes],[0,0]);ok('double clear');
 runtime.destroy();}
console.log('Engine cache accounting:',checks,'checks, never negative, zero after clear');
