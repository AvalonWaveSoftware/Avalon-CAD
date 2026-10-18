// ADR-0001 approved-dom-areas: unit tests for tests/perf/approved-dom.mjs (the "dom" entries of approved-areas.json
// used by tests/pixels.mjs). Runs domChanges in a blank Chromium page; no app, no baseline folder is written.
import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {createRequire} from 'node:module';
import {validSelector,validKind,loadDomEntries,approvedStrings,checkCapture} from './perf/approved-dom.mjs';import {compareDom} from './perf/dom-baseline.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.AVALON_PLAYWRIGHT||'playwright');
const STR=new Set(['Edge (F)','Move (M)','Project menu','Ready · millimeters','Fit model (0)']);
const E=(o)=>({scene:'*',kind:'title',approval:'test',...o});

// 1. Selector validity rule.
for(const ok of ['#projectMenu','button#projectMenu','[data-mode=round]','[data-mode="round"]','.toolbar button.icon','#touchModes > [data-mode=move]','div#app button[aria-label="Project menu"]','main#viewport>div#desktopHelp'])
 assert.equal(validSelector(ok),null,'valid: '+ok);
for(const bad of ['*','body','html','div','main button','#app *','*[title]','[title]','[title^=Edge]','[title*=x]','[title~=x]','[title|=x]','[title$=x]','[data-mode=round i]','#a, #b','button:not(#x)','#a:hover','#a::before',':is(#a)','#a + #b','#a ~ #b','#a >','','  '])
 assert.notEqual(validSelector(bad),null,'rejected: '+JSON.stringify(bad));
assert.equal(validKind('title'),null);assert.equal(validKind('aria-label'),null);assert.equal(validKind('text'),null);
for(const k of ['style','class','Title','','on click'])assert.notEqual(validKind(k),null,'kind rejected: '+k);

// 2. Load-time validation: wildcard selector and a value not in the strings tables are rejected with clear messages.
assert.deepEqual(loadDomEntries(undefined,STR),[]);assert.deepEqual(loadDomEntries([],STR),[]);
assert.equal(loadDomEntries([E({selector:'#projectMenu',expected:'Project menu'})],STR).length,1);
assert.throws(()=>loadDomEntries([E({selector:'*',expected:'Project menu'})],STR),/dom\[0\].*invalid selector: '\*' is not allowed/s);
assert.throws(()=>loadDomEntries([E({selector:'body',expected:'Project menu'})],STR),/bare tag selectors match broadly/);
assert.throws(()=>loadDomEntries([E({selector:'[title]',expected:'Project menu'})],STR),/unsupported selector part/);
assert.throws(()=>loadDomEntries([E({selector:'#projectMenu',expected:'Project menu!'})],STR),/expected "Project menu!" is not in strings-baseline.json or tests\/perf\/strings-additions.json/);
assert.throws(()=>loadDomEntries([E({selector:'#projectMenu',expected:'Project menu',approval:''})],STR),/"approval" must be a non-empty string/);
assert.throws(()=>loadDomEntries([E({selector:'#projectMenu',expected:'Project menu',kind:'style'})],STR),/not approvable/);
// approvedStrings reads the baseline's strings-baseline.json plus strings-additions.json.
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ada-'));fs.writeFileSync(path.join(tmp,'strings-baseline.json'),JSON.stringify(['Base string']));
const add=path.join(tmp,'additions.json');fs.writeFileSync(add,JSON.stringify({strings:['Added string']}));
const S=approvedStrings(tmp,add);assert.ok(S.has('Base string')&&S.has('Added string')&&!S.has('Other'));fs.rmSync(tmp,{recursive:true});
// The committed file's dom entries are valid against strings-additions.json and the named baseline's strings (if present).
{const a=JSON.parse(fs.readFileSync(new URL('./perf/approved-areas.json',import.meta.url),'utf8'));
 loadDomEntries(a.dom,approvedStrings(path.join('/workspace/avalon-cad-artifacts',a.baseline||'-none-')));}

// 3. Matching in a page, and per-capture counts.
const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{const page=await browser.newPage();
 const snap=(body)=>({html:`<body><div id="app">${body}</div></body>`,styles:{'div#app:0':'h1'}});
 const base=snap('<button id="projectMenu" aria-label="Project menu">P</button><button data-mode="round">Edge ▾</button><span id="busy">Ready</span>');
 const run=(nowBody,entries,{styles}={})=>{const now=snap(nowBody);if(styles)now.styles=styles;return checkCapture(page,{name:'blank',id:'blank@desktop',base,now,entries,compareDom});};
 // identical: nothing to report
 let r=await run('<button id="projectMenu" aria-label="Project menu">P</button><button data-mode="round">Edge ▾</button><span id="busy">Ready</span>',[]);
 assert.deepEqual([r.matched.length,r.unmatched.length,r.errors.length],[0,0,0]);
 // a matched title change passes
 const titled='<button id="projectMenu" aria-label="Project menu" title="Project menu">P</button><button data-mode="round" title="Edge (F)">Edge ▾</button><span id="busy">Ready</span>';
 const ok=[E({selector:'#projectMenu',expected:'Project menu'}),E({scene:'blank',selector:'[data-mode=round]',expected:'Edge (F)'})];
 r=await run(titled,ok);assert.deepEqual([r.matched.length,r.unmatched.length,r.errors.length],[2,0,0],'matched title changes pass');
 assert.equal(r.matched[0].approval,'test');
 // the same change with no entry (or a wrong value / scene / kind / selector) is unmatched and fails, with the old message
 r=await run(titled,[]);assert.deepEqual([r.matched.length,r.unmatched.length],[0,2]);assert.match(r.errors[0],/^outerHTML differs/);
 r=await run(titled,[ok[0],E({selector:'[data-mode=round]',expected:'Move (M)'})]);assert.deepEqual([r.matched.length,r.unmatched.length],[1,1],'wrong value');
 r=await run(titled,[ok[0],E({scene:'objects-panel',selector:'[data-mode=round]',expected:'Edge (F)'})]);assert.deepEqual([r.matched.length,r.unmatched.length],[1,1],'wrong scene');
 r=await run(titled,[ok[0],E({selector:'[data-mode=round]',kind:'aria-label',expected:'Edge (F)'})]);assert.deepEqual([r.matched.length,r.unmatched.length],[1,1],'wrong kind');
 r=await run(titled,[ok[0],E({selector:'[data-mode=move]',expected:'Edge (F)'})]);assert.deepEqual([r.matched.length,r.unmatched.length],[1,1],'selector does not match');
 // an unmatched text change fails; a matching text entry passes
 r=await run('<button id="projectMenu" aria-label="Project menu">P</button><button data-mode="round">Edge ▾</button><span id="busy">Ready · millimeters</span>',[]);
 assert.deepEqual([r.unmatched.length,r.unmatched[0].kind,r.errors.length>0],[1,'text',true]);
 r=await run('<button id="projectMenu" aria-label="Project menu">P</button><button data-mode="round">Edge ▾</button><span id="busy">Ready · millimeters</span>',[E({selector:'#busy',kind:'text',expected:'Ready · millimeters'})]);
 assert.deepEqual([r.matched.length,r.unmatched.length,r.errors.length],[1,0,0]);
 // aria-label change: a title entry with the same value does NOT cover it (no implicit matching); its own entry does
 const aria='<button id="projectMenu" aria-label="Fit model (0)">P</button><button data-mode="round">Edge ▾</button><span id="busy">Ready</span>';
 r=await run(aria,[E({selector:'#projectMenu',expected:'Fit model (0)'})]);assert.deepEqual([r.matched.length,r.unmatched.length,r.unmatched[0].kind],[0,1,'aria-label'],'aria-label without an entry fails');assert.ok(r.errors.length);
 r=await run(aria,[E({selector:'#projectMenu',kind:'aria-label',expected:'Fit model (0)'})]);assert.deepEqual([r.matched.length,r.unmatched.length,r.errors.length],[1,0,0]);
 // role change without an entry fails
 r=await run('<button id="projectMenu" aria-label="Project menu" role="menuitem">P</button><button data-mode="round">Edge ▾</button><span id="busy">Ready</span>',[]);assert.equal(r.unmatched[0].kind,'role');
 // removed attribute, added element: never matchable
 r=await run('<button id="projectMenu">P</button><button data-mode="round">Edge ▾</button><span id="busy">Ready</span>',[E({selector:'#projectMenu',kind:'aria-label',expected:'Project menu'})]);assert.deepEqual([r.matched.length,r.unmatched.length],[0,1],'removed attribute');
 r=await run(titled.replace('</span>','</span><i class="x">!</i>'),ok);assert.deepEqual([r.matched.length,r.unmatched.length,r.unmatched[0].kind],[2,1,'element added']);
 // computed-style/box change is never matched; counts per capture add matched and unmatched separately
 r=await run(titled,ok,{styles:{'div#app:0':'h2'}});assert.deepEqual([r.matched.length,r.unmatched.length,r.unmatched[0].kind],[2,1,'computed style/box']);
 assert.ok(r.errors.some(e=>e.startsWith('computed style/box differs'))&&!r.errors.some(e=>e.startsWith('outerHTML')),'only the style message when every HTML change matched');
 // whitespace-only text change is still a change
 r=await run('<button id="projectMenu" aria-label="Project menu">P </button><button data-mode="round">Edge ▾</button><span id="busy">Ready</span>',[]);assert.equal(r.unmatched.length,1);
}finally{await browser.close();}
console.log('PASS approved-dom-areas: selector rule (8 valid, 23 rejected), kinds, load-time strings check, matched title/text/aria-label changes pass, unmatched/wrong scene/kind/value/selector, aria-label and role without an entry, removed attributes, added elements and style/box changes fail; per-capture matched/unmatched counts');
