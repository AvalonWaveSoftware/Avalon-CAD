// ADR-0001 §2.2 / Q14 (W0) in the app: a project that needs v3 autosaves to tristancad.autosave.v3 and leaves the
// last v2-compatible tristancad.autosave untouched; a reload opens the newer v3 work; after a simulated 2.x edit of
// tristancad.autosave the app opens that instead; returning to a v2-compatible project removes the v3 record.
import assert from 'node:assert/strict';import * as H from '../tools/readme-shots/harness.mjs';
const env=await H.start();
const settle=page=>page.waitForTimeout(1600).then(()=>page.evaluate(()=>new Promise(r=>requestIdleCallback(r,{timeout:2000})))).then(()=>page.waitForTimeout(300));
try{const page=await H.open(env,{desktop:true});
 await page.evaluate(()=>window.__cad.load(window.__cad.templates.plate()));await settle(page);
 const v2=await page.evaluate(()=>localStorage.getItem('tristancad.autosave'));assert.equal(JSON.parse(v2).version,2);
 await page.evaluate(()=>{const p=window.__cad.templates.plate();p.objects[0].mirrored=true;p.name='Needs v3';window.__cad.load(p);});await settle(page);
 const s=await page.evaluate(()=>({v2:localStorage.getItem('tristancad.autosave'),v3:localStorage.getItem('tristancad.autosave.v3')}));
 assert.equal(s.v2,v2,'v2 key keeps the last v2-compatible state');const rec=JSON.parse(s.v3);assert.equal(rec.project.version,3);assert.ok(rec.savedAt>0);assert.equal(rec.project.objects[0].mirrored,true);
 await page.reload();await page.waitForFunction(()=>window.__cad?.model?.engine?.local===true,{},{timeout:90000});
 assert.deepEqual(await page.evaluate(()=>[window.__cad.project.name,window.__cad.project.version]),['Needs v3',3],'reload opens the newer v3 autosave');
 // Downgrade simulation: what 2.x reads is the v2 state; a 2.x edit makes it newer than the v3 record.
 await page.evaluate(()=>{const p=JSON.parse(localStorage.getItem('tristancad.autosave'));p.name='Edited in 2.x';localStorage.setItem('tristancad.autosave',JSON.stringify(p));});
 await page.reload();await page.waitForFunction(()=>window.__cad?.model?.engine?.local===true,{},{timeout:90000});
 assert.equal(await page.evaluate(()=>window.__cad.project.name),'Edited in 2.x','the newer 2.x autosave wins');
 // Round-2 ruling 3: the v3 record stays as a backup after a 2.x edit wins, even across autosaves of the 2.x state.
 await page.evaluate(()=>{window.__cad.change(p=>{p.name='Edited in 2.x, then 3.0';});});await settle(page);
 assert.equal(JSON.parse(await page.evaluate(()=>localStorage.getItem('tristancad.autosave.v3'))).project.name,'Needs v3','v3 backup kept');
 // Opening the v3 record and returning to a v2-compatible project in 3.0 removes it.
 await page.evaluate(()=>{const p=window.__cad.templates.plate();p.objects[0].mirrored=true;window.__cad.load(p);});await settle(page);
 await page.evaluate(()=>window.__cad.load(window.__cad.templates.tray()));await settle(page);
 assert.equal(await page.evaluate(()=>localStorage.getItem('tristancad.autosave.v3')),null,'v2-compatible again in 3.0 removes the v3 record');
 await page.context().close();}
finally{await env.close();}
console.log('PASS: dual-key autosave in the app: v3 record written, v2 key untouched, reload opens v3, a 2.x edit wins, v3 record kept as backup after a 2.x win, removed only on return to v2 in 3.0 or replaced by newer v3');
