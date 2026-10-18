// ADR-0001 UI round 2, ruling 3: F1b (and anything after it) never changes an existing accessible name. Every button's
// name at startup, in each sheet and panel and in the action bars is compared with the same state in the 3.0 base
// build (v3-foundation; 8fa7115 when F1b was written, the final W0 0b97fac after the W0 merge-forward, release-3.0 7faa154 since F6 renamed Round to "Edge ▾"). Any change fails; a
// button that had no name in the base (or did not exist) is exempt. The base build is made once from `git archive <sha>`
// in a temp folder (AVALON_A11Y_SHA picks another base, e.g. 8fa7115; AVALON_A11Y_BASE overrides the folder).
import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {execSync} from 'node:child_process';
const REPO=path.resolve(new URL('..',import.meta.url).pathname),BASE_SHA=process.env.AVALON_A11Y_SHA||'7faa154';
const base=process.env.AVALON_A11Y_BASE||path.join(os.tmpdir(),'avalon-a11y-base-'+BASE_SHA);
if(!fs.existsSync(path.join(base,'app/assets/main.js'))){fs.mkdirSync(base,{recursive:true});execSync(`git archive ${BASE_SHA} | tar -x -C ${JSON.stringify(base)}`,{cwd:REPO,shell:'/bin/bash'});
 if(!fs.existsSync(path.join(base,'node_modules')))fs.symlinkSync(path.join(REPO,'node_modules'),path.join(base,'node_modules'));
 if(fs.existsSync(path.join(REPO,'build/wasm-opt')))fs.cpSync(path.join(REPO,'build/wasm-opt'),path.join(base,'build/wasm-opt'),{recursive:true});
 execSync('node build-web.mjs',{cwd:base,stdio:'ignore'});}
process.env.AVALON_ASSETS=path.join(base,'app/assets');const HB=await import('../tools/readme-shots/harness.mjs?base');delete process.env.AVALON_ASSETS;
const HN=await import('../tools/readme-shots/harness.mjs?now');
// Accessible name of a button, as browsers compute it here: aria-label, else its text, else its title.
const names=page=>page.evaluate(()=>{const key=b=>b.id?'#'+b.id:b.dataset.mode?'mode:'+b.dataset.mode:b.dataset.view?'view:'+b.dataset.view:b.dataset.unit?'unit:'+b.dataset.unit:
  (()=>{const p=[];for(let e=b;e&&e!==document.body;e=e.parentElement)p.unshift((e.id?'#'+e.id:e.tagName.toLowerCase())+':'+[...e.parentElement.children].indexOf(e));return p.join('>');})();
 const out={};for(const b of document.querySelectorAll('button'))out[key(b)]=((b.getAttribute('aria-label')??'').trim()||b.textContent.replace(/\s+/g,' ').trim()||(b.getAttribute('title')??'').trim());return out;});
const STEPS=[['startup',async()=>{}],
 ...[['#addBtn','add sheet'],['#projectMenu','projects sheet'],['#layersBtn','layers sheet'],['#exportBtn','export sheet'],['#helpBtn','help sheet']].map(([b,w])=>[w,async p=>{await p.click(b);await p.waitForFunction(()=>!document.querySelector('#sheet').hidden&&document.querySelector('#sheetContent button'));await p.waitForTimeout(300);},true]),
 ['example loaded',async p=>{await p.click('#helpBtn');await p.waitForSelector('#loadExample');await p.click('#loadExample');await p.waitForFunction(()=>window.__cad.project.objects.length>0&&window.__cad.selected);await p.waitForTimeout(600);}],
 ['edit sheet',async p=>{await p.click('#editBtn');await p.waitForFunction(()=>!document.querySelector('#sheet').hidden&&document.querySelector('#sheetContent button'));await p.waitForTimeout(300);},true],
 ['objects panel',async p=>{await p.click('#objectsToggle');await p.waitForFunction(()=>!document.querySelector('#objectsPanel').hidden&&document.querySelector('#objectsList button'));await p.waitForTimeout(300);}],
 ['move bar',async p=>{await p.click('#objectsToggle');await p.click('[data-mode="move"]');await p.waitForTimeout(300);}],
 ['round bar',async p=>{await p.click('[data-mode="round"]');await p.waitForTimeout(300);}],
 ['stretch bar',async p=>{await p.click('[data-mode="stretch"]');await p.waitForTimeout(300);}]];
async function collect(H,desktop){const env=await H.start();try{const page=await H.open(env,{desktop});await page.waitForTimeout(600);const got={};
 for(const [what,run,closes] of STEPS){await run(page);got[what]=await names(page);if(closes&&await page.evaluate(()=>!document.querySelector('#sheet').hidden)){await page.click('#closeSheet');await page.waitForFunction(()=>document.querySelector('#sheet').hidden);}}
 return got;}finally{await env.close();}}
const out=[];
for(const desktop of [false,true]){const was=await collect(HB,desktop),now=await collect(HN,desktop),bad=[];let n=0;
 for(const [what] of STEPS)for(const [k,v] of Object.entries(was[what])){if(!v)continue;n++;if(!(k in now[what]))continue;if(now[what][k]!==v)bad.push(`${what} ${k}: "${v}" → "${now[what][k]}"`);}
 assert.deepEqual(bad,[],(desktop?'desktop':'phone')+': accessible names changed vs '+BASE_SHA+'\n'+bad.join('\n'));out.push(`${desktop?'desktop':'phone'}: ${n} named buttons in ${STEPS.length} states unchanged`);}
console.log('PASS: a11y-names vs '+BASE_SHA+': '+out.join('; '));
