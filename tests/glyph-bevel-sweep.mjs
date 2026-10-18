// ADR-0001 F7: 0.5 mm bevel on all 94 glyphs (Roboto Bold, default 20 mm × 5 mm): every glyph either builds a valid
// bevelled solid or fails with exactly "Bevel not possible on '<char>' at this size" (never a silently unbevelled
// glyph). The failing glyphs are listed and must match the recorded set below, so a change in either direction is
// noticed (the robustness fix is the separate follow-up glyph-chamfer-robustness, not F7).
//   node tests/glyph-bevel-sweep.mjs [--profile chamfer|round] [--engrave]
import assert from 'node:assert/strict';
import {initKernel} from '../web/kernel.mjs';import {baseShapeForTest} from '../web/cad-solid.mjs';import * as R from 'replicad';
import {object,glyphDefaults} from '../web/templates.mjs';import {loadGlyphs,glyphBevelPart} from '../web/glyph-geometry.mjs';import {GLYPH_CHARS} from '../web/glyph-metrics.mjs';
await initKernel();await loadGlyphs();
const arg=k=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:null;},profile=arg('--profile')||'chamfer',engrave=process.argv.includes('--engrave');
const EXPECTED={'chamfer':'2 6 B R a m n & @','round':'R a','chamfer engrave':'2 4 6 B m n r & @','round engrave':'6 n r &'};
// The OCCT part the app actually builds (glyphBevelPart: the bevelled glyph, or for Engrave the plate's top tile).
const extra=engrave?{plate:2,plateMargin:2,engrave:true}:{},fail=[],halved=[],times=[];
for(const c of GLYPH_CHARS){const t=performance.now();
 try{const s=baseShapeForTest(glyphBevelPart(object('glyph',{...glyphDefaults.glyph,char:c,bevel:.5,bevelProfile:profile,...extra})));try{assert.ok(R.measureVolume(s)>0);if(s.bevelUsed)halved.push(c);}finally{s.delete();}}
 catch(e){assert.equal(e.message,`Bevel not possible on '${c}' at this size`,c);fail.push(c);}times.push([performance.now()-t,c]);}
times.sort((a,b)=>a[0]-b[0]);const key=profile+(engrave?' engrave':''),got=fail.join(' ');
console.log(`glyph bevel sweep (${key}): ${94-fail.length}/94 bevelled, ${fail.length} clear errors: ${got||'none'}; halved (notice): ${halved.join(' ')||'none'}; time median ${times[47][0].toFixed(0)} ms, max ${times[93][0].toFixed(0)} ms ('${times[93][1]}')`);
if(EXPECTED[key]!=null)assert.equal(got,EXPECTED[key],'failing glyphs changed vs the recorded set');
