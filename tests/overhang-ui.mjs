import assert from 'node:assert/strict';
import {harness} from './ui-harness.mjs';
const h=await harness(),a=await h.boot(),{$,q,w,click,wait}=a;
w.__cad.load(w.__cad.templates.plate());await wait(()=>w.__cad.model?.volume>0);
const original=w.__cad.display.material,project=JSON.stringify(w.__cad.project),jobs=a.posted.length;
q('[data-view=iso]').click();assert.equal($('sheet').hidden,true);
q('[data-view=iso]').dispatchEvent(new w.MouseEvent('dblclick'));assert.equal($('sheetTitle').textContent,'View');assert.equal($('overhang').checked,false);
$('overhang').checked=true;$('overhang').dispatchEvent(new w.Event('change'));
assert.notEqual(w.__cad.display.material,original);assert.equal(w.localStorage.getItem('tristancad.overhang'),'true');
assert.equal(JSON.stringify(w.__cad.project),project);assert.equal(a.posted.length,jobs);
$('overhang').checked=false;$('overhang').dispatchEvent(new w.Event('change'));assert.equal(w.__cad.display.material,original);
assert.equal(w.localStorage.getItem('tristancad.overhang'),'false');
$('overhang').checked=true;$('overhang').dispatchEvent(new w.Event('change'));click('closeSheet');click('exportBtn');click('downloadSTL');await wait(()=>w.testSaved?.done);
assert.ok(w.testSaved.chunks.length);await wait(()=>a.posted.includes('overhangStats'));
// A stale mesh-core.wasm ('mesh-core.wasm needs rebuild') is a failure, not a pass.
const stats=await w.__cad.request('overhangStats',{project:structuredClone(w.__cad.project),tolerance:.15});assert.deepEqual([stats.area,stats.count],[0,0],'the plate rests on the build plate: no overhang');
const b=await h.boot({'tristancad.overhang':'true'});b.q('[data-view=iso]').dispatchEvent(new b.w.MouseEvent('dblclick'));assert.equal(b.$('overhang').checked,true);
a.close();b.close();console.log('PASS: overhang toggle, preference, no geometry job or project change, exact cached off material; stats job handled independently while STL saves.');
