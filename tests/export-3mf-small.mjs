// ADR-0001 F2a, Architect ruling 3: every small sample (2 small QA samples + the regression projects; all below 65,536
// triangles, so 1 part) is no more than 2 % bigger than the c60c94c encoder's output recorded in
// tests/fixtures/3mf/c60c94c-sizes.json. Also reports how many are byte-identical to c60c94c.
import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {initKernel} from '../web/kernel.mjs';import {initLocalEngine} from '../web/local-engine.mjs';import {meshes} from './three-mf-small-samples.mjs';
import {parts3MF} from '../web/three-mf-parts.mjs';
const ref=JSON.parse(fs.readFileSync('tests/fixtures/3mf/c60c94c-sizes.json','utf8'));const byName=new Map(ref.samples.map(s=>[s.name,s]));
const K=await initKernel(),engine=await initLocalEngine(K,{rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
const got=await meshes(engine);assert.equal(got.length,ref.samples.length,'same sample set as the fixture (regenerate it if the samples changed)');
let identical=0,worst=0;const rows=[];
for(const m of got){const r=byName.get(m.name);assert.ok(r,'no c60c94c size for '+m.name);assert.equal(m.triangles.length/3,r.triangles,m.name+': mesh changed; regenerate the fixture');
 assert.equal(parts3MF(r.triangles),1,m.name+' is a small (1-part) sample');
 const b=Buffer.from(engine.rust.write3MF(m.vertices,m.triangles,true)),ratio=b.length/r.bytes;worst=Math.max(worst,ratio);
 const same=crypto.createHash('sha256').update(b).digest('hex')===r.sha256;identical+=same;rows.push(`${m.name}: ${r.bytes} -> ${b.length} B (${((ratio-1)*100).toFixed(2)} %)${same?' identical':''}`);
 assert.ok(ratio<=1.02,`${m.name}: ${b.length} B is more than 2 % over c60c94c's ${r.bytes} B`);}
console.log(rows.join('\n'));
console.log(`PASS export-3mf-small: ${got.length} small samples <= 1.02x c60c94c (worst ${worst.toFixed(4)}x), ${identical}/${got.length} byte-identical`);
process.exit(0);
