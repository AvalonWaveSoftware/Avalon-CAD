// ADR-0001 stage empty-project-preview: an empty project previews without error in every engine (JS kernel, local
// Python/Rust engine, JS engine, OCCT sidecar) and the app shows the normal 'Ready · millimeters' status with no toast.
import assert from 'node:assert/strict';import fs from 'node:fs';import {loadPyodide} from 'pyodide';
import {initKernel,buildModel} from '../web/kernel.mjs';import {initLocalEngine} from '../web/local-engine.mjs';import {blank} from '../web/templates.mjs';
import {sidecarClient} from './occt-sidecar-client.mjs';import * as H from '../tools/readme-shots/harness.mjs';
const out=[];const empty=()=>{const p=blank();assert.equal(p.objects.length,0);return p;};
const K=await initKernel(),legacy=buildModel(K,empty(),.15,true);assert.equal(legacy.triangles.length,0);out.push('JS kernel');
const rust={binary:fs.readFileSync('app/assets/mesh-core.wasm')};
const py=await initLocalEngine(K,{loadPyodide,pythonURL:new URL('../node_modules/pyodide/',import.meta.url).pathname,pythonSource:fs.readFileSync('engine/python/model_jobs.py','utf8'),rust});
const KJ=await initKernel({solidOptions:false}),js=await initLocalEngine(KJ,{rust}),client=sidecarClient();
try{for(const [name,run] of [['Python/Rust engine',d=>py.process(d)],['JS engine',d=>js.process(d)],['OCCT sidecar',d=>client.run(js,d)]])
 for(const tolerance of [.15,.005]){const r=await run({id:1,type:'preview',project:empty(),tolerance});assert.equal(r.error,undefined,name+' error: '+r.error);assert.equal(r.triangles.length,0,name+' triangles');if(tolerance===.15)out.push(name);}}
finally{client.close();}
const env=await H.start();
try{for(const desktop of [false,true]){const page=await H.open(env,{desktop}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.waitForFunction(()=>window.__cad?.model?.engine,null,{timeout:90000});
 await page.evaluate(()=>{window.__toasts=[];const t=document.querySelector('#toast');new MutationObserver(()=>{if(t.textContent)window.__toasts.push(t.textContent);}).observe(t,{subtree:true,childList:true,characterData:true});
  window.__seen=false;const b=document.querySelector('#busy');new MutationObserver(()=>{if(b.textContent==='Building solid…')window.__seen=true;}).observe(b,{subtree:true,childList:true,characterData:true});});
 await page.evaluate(()=>window.__cad.load({format:'tristancad',version:2,name:'My model',objects:[],layers:[{id:'layer-1',name:'Layer 1'}],activeLayer:'layer-1'}));
 await page.waitForFunction(()=>window.__seen&&document.querySelector('#busy').textContent!=='Building solid…',null,{timeout:90000});await page.waitForTimeout(500);
 assert.equal(await page.evaluate(()=>document.querySelector('#busy').textContent),'Ready · millimeters',(desktop?'desktop':'phone')+' status');
 assert.deepEqual(await page.evaluate(()=>window.__toasts),[],'no toast');assert.deepEqual(errors,[]);out.push(desktop?'desktop UI':'phone UI');await page.close();}}
finally{await env.close();}
console.log('PASS empty-project preview: no error, 0 triangles, Ready · millimeters, no toast —',out.join(', '));process.exit(0);
