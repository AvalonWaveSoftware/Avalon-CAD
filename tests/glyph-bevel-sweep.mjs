// ADR-0001 F7: 0.5 mm bevel on all 94 glyphs (Roboto Bold, default 20 mm × 5 mm): every glyph either builds a valid
// bevelled solid or fails with exactly "Bevel not possible on '<char>' at this size" (never a silently unbevelled
// glyph). The failing glyphs are listed and must match the recorded set below, so a change in either direction is
// noticed (the robustness fix is the separate follow-up glyph-chamfer-robustness, not F7).
// ADR-0001 F7 V5: every bevelled glyph must also lie inside its box (Engrave: the plate box; otherwise the glyph prism
// box): the bounds of the built part (.15) and the placement the app's place job gives it (position = −box centre in
// x/y, −box bottom in z, within 1e-4 mm). Before V5, Engrave+Round 'B' was placed at z 8.63 instead of 1 (a blend face
// far outside the glyph). The µm-scale overshoots below are recorded exceptions (mesh tolerance, not stray geometry).
//   node tests/glyph-bevel-sweep.mjs [--profile chamfer|round] [--engrave]
import assert from 'node:assert/strict';
import fs from 'node:fs';import {initKernel,makeObject} from '../web/kernel.mjs';import {initLocalEngine} from '../web/local-engine.mjs';import {glyphBevelNote} from '../web/cad-solid.mjs';
import {object,glyphDefaults} from '../web/templates.mjs';import {loadGlyphs,glyphHalfExtents,glyphLayout} from '../web/glyph-geometry.mjs';import {GLYPH_CHARS} from '../web/glyph-metrics.mjs';
const K=await initKernel();await loadGlyphs();const E=await initLocalEngine(K,{rust:{binary:fs.readFileSync(new URL('../app/assets/mesh-core.wasm',import.meta.url))}});
const arg=k=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:null;},profile=arg('--profile')||'chamfer',engrave=process.argv.includes('--engrave');
const EXPECTED={'chamfer':'2 6 B R a m n & @','round':'2 R a g j &','chamfer engrave':'2 4 6 B m n r & @','round engrave':'6 B n r &'};
// Recorded overshoot exceptions (mm, the largest allowed): chamfer 'd' top +0.0065, round '9' +0.002 in y, round '@' 0.002 (mesh
// tolerance); Engrave+Round '4' +0.056 in z (the .15 mesh of the halved rim fillet; its B-rep faces are inside the box).
const ALLOWED={'chamfer':{d:.008},'round':{9:.003,'@':.003},'round engrave':{4:.06}};
const box=(c,p)=>{const [hx,hy]=glyphHalfExtents(c,p.size),m=engrave?p.plateMargin:0,L=glyphLayout(p);return [[-hx-m,-hy-m,engrave?L.plate[0]:-p.depth/2],[hx+m,hy+m,engrave?L.plate[1]:p.depth/2]];};
const outside=[];
// The part the app actually builds (makeObject: the OCCT bevel part, glyphBevelPart, meshed and closed in Manifold,
// with the half-size retry when OCCT or the closed mesh fails; Engrave: the plate's top tile + lower plate).
const key=profile+(engrave?' engrave':''),extra=engrave?{plate:2,plateMargin:2,engrave:true}:{},fail=[],halved=[],times=[];
for(const c of GLYPH_CHARS){const t=performance.now();
 const o=object('glyph',{...glyphDefaults.glyph,char:c,bevel:.5,bevelProfile:profile,...extra});
 try{const s=makeObject(K,o,.15);let b;try{assert.ok(s.volume()>0);b=s.boundingBox();if(glyphBevelNote(o))halved.push(c);}finally{s.delete();}
  const [lo,hi]=box(c,o.params),r=E.process({id:c,type:'place',object:o,position:[0,0,0],floor:true});assert.ok(!r.error,r.error);
  const at=r.object.position,want=[-(lo[0]+hi[0])/2,-(lo[1]+hi[1])/2,-lo[2]];
  const over=Math.max(...[0,1,2].map(i=>Math.max(lo[i]-b.min[i],b.max[i]-hi[i],Math.abs(at[i]-want[i]))));
  if(over>(ALLOWED[key]?.[c]??1e-4))outside.push(`${c} (${over.toFixed(3)} mm: bounds ${b.min.map(v=>v.toFixed(2))}…${b.max.map(v=>v.toFixed(2))}, placed ${at.map(v=>v.toFixed(2))})`);}
 catch(e){assert.equal(e.message,`Bevel not possible on '${c}' at this size`,c);fail.push(c);}times.push([performance.now()-t,c]);}
times.sort((a,b)=>a[0]-b[0]);const got=fail.join(' ');
console.log(`glyph bevel sweep (${key}): ${94-fail.length}/94 bevelled, ${fail.length} clear errors: ${got||'none'}; halved (notice): ${halved.join(' ')||'none'}; time median ${times[47][0].toFixed(0)} ms, max ${times[93][0].toFixed(0)} ms ('${times[93][1]}')`);
if(EXPECTED[key]!=null)assert.equal(got,EXPECTED[key],'failing glyphs changed vs the recorded set');
console.log(`  inside box (bounds + placement): ${outside.length?'FAIL '+outside.join('; '):'all '+(94-fail.length)}`);
assert.deepEqual(outside,[],'bevelled glyph outside its box (bounds or placement)');
