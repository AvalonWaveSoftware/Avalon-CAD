// ADR-0001 W0 (ruling 4): lazy UI chunks in the browser, phone (412x915 touch, Android stub) and desktop (1440x900).
// Startup loads no chunk; opening Help loads the help chunk through import() and shows the same sheet as before.
import assert from 'node:assert/strict';import * as H from '../tools/readme-shots/harness.mjs';
const env=await H.start();const out=[];
try{for(const desktop of [false,true]){const page=await H.open(env,{desktop});
 const chunks=()=>page.evaluate(()=>performance.getEntriesByType('resource').map(r=>r.name).filter(n=>/\/chunk-[^/]*\.js/.test(n)).map(n=>n.split('/').pop()));
 await page.waitForFunction(()=>window.__cad?.model?.engine,null,{timeout:90000});await page.waitForTimeout(500);assert.deepEqual(await chunks(),[],'no lazy chunk at startup');
 await page.click('#helpBtn');await page.waitForFunction(()=>document.querySelector('#sheetTitle')?.textContent==='Make your first part'&&!!document.querySelector('#loadExample'));
 const loaded=await chunks();assert.equal(loaded.length,1,'Help loads exactly one chunk');assert.match(loaded[0],/^chunk-help-sheet-/);
 const text=await page.evaluate(()=>document.querySelector('#sheet').textContent);assert.match(text,/AvalonCad 2\.7\.2 · an offline solid-modeling app built for your phone\./,'same text as before (web build)');
 await page.click('#loadExample');await page.waitForFunction(()=>window.__cad.project.objects.length>0);
 out.push(`${desktop?'desktop':'phone'}: 0 chunks at startup, ${loaded[0]} on Help`);await page.context().close();}}
finally{await env.close();}
console.log('PASS: lazy chunks: '+out.join('; '));
