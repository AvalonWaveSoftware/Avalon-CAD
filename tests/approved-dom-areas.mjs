// ADR-0001 approved-dom-areas: unit tests for tests/perf/approved-dom.mjs (the "dom" entries of approved-areas.json
// used by tests/pixels.mjs). Runs domChanges in a blank Chromium page; no app, no baseline folder is written.
import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {createRequire} from 'node:module';
import {validSelector,validKind,loadDomEntries,approvedStrings,checkCapture} from './perf/approved-dom.mjs';import {compareDom,compareStrings,stripComments,extractStrings,validateAdditions} from './perf/dom-baseline.mjs';
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

// 4. Strings removals (approved-dom-areas a): a missing baseline string passes only when listed in "removals".
{const base=['Keep me.','Old text.','Gone too.'],now=['Keep me.','New text.'],approved=new Set(['New text.']);
 let c=compareStrings(base,now,approved,[]);assert.deepEqual(c.removed,['Old text.','Gone too.']);assert.equal(c.errors.length,2);assert.match(c.errors[0],/^string missing vs baseline: "Old text."/);
 c=compareStrings(base,now,approved,[{string:'Old text.',approval:'ruling X'}]);assert.deepEqual([c.removed,c.removedApproved,c.errors.length],[['Gone too.'],['Old text.'],1],'listed passes, unlisted fails');
 c=compareStrings(base,now,approved,[{string:'Old text.',approval:'ruling X'},{string:'Gone too.',approval:'ruling Y'}]);assert.deepEqual(c.errors,[]);
 c=compareStrings(base,now,new Set(),[{string:'Old text.',approval:'ruling X'},{string:'Gone too.',approval:'ruling Y'}]);assert.deepEqual(c.errors,['new/changed user-visible string: "New text."'],'removals do not approve additions');
 c=compareStrings(base,now,approved,[{string:'Old text.'}]);assert.ok(c.errors.some(e=>/removals\[0\].*needs a non-empty "string" and "approval"/.test(e)));
 c=compareStrings(base,now,approved,[{string:'Keep me.',approval:'x'},{string:'Old text.',approval:'x'},{string:'Gone too.',approval:'x'}]);assert.deepEqual([c.errors,c.stale],[[],['Keep me.']],'a listed string still present is only noted');
 assert.ok(compareStrings(base,now,approved,{}).errors.some(e=>/must be a list/.test(e)));}

// 5. The extractor skips // and /* */ comments (approved-dom-areas b) and leaves literals alone.
{const src=["const a='Kept string.'; // 'Comment string.'","/* 'Block comment.' */ const b=\"Also kept.\";","const u='http://x.y/z'; const r=/\\/\\/ not a comment/g; const d=x/2/3; // 'After division.'","const t=`Tpl // not a comment ${a+'Inner kept.'} done`; /** 'Doc comment.' */","const s='a /* not a comment */ b';"].join('\n');
 const out=stripComments(src);assert.equal(out.split('\n').length,src.split('\n').length,'line numbers kept');
 for(const k of ["'Kept string.'",'"Also kept."',"'http://x.y/z'","/\\/\\/ not a comment/g","x/2/3","`Tpl // not a comment ${a+'Inner kept.'} done`","'a /* not a comment */ b'"])assert.ok(out.includes(k),'kept: '+k);
 for(const k of ['Comment string.','Block comment.','After division.','Doc comment.'])assert.ok(!out.includes(k),'stripped: '+k);
 assert.equal(stripComments("a{color:red} /* 'x y.' */ b{content:'// kept'}",{line:false}),'a{color:red} '+' '.repeat("/* 'x y.' */".length)+" b{content:'// kept'}");
 // QA §3 (i): '/' after a postfix ++/-- is division, so the comment after it is stripped and a later string is kept intact;
 // a prefix ++ before a regex still reads the regex.
 {const o=stripComments("const d=i++ / 2 + 'it/'; const s='Hidden // text.'; // 'Gone.'\nlet k=j-- / 4; // 'Gone too.'\nx=++y; const r=/a\\/b/; return /q/.test(z);");
  for(const k of ["'Hidden // text.'","'it/'","j-- / 4","/a\\/b/","/q/.test"])assert.ok(o.includes(k),'postfix kept: '+k);for(const k of ['Gone.','Gone too.'])assert.ok(!o.includes(k),'postfix stripped: '+k);}
 // QA §3 (ii): CSS strings are tracked, so '/*' inside content:'…' is not a comment and the rest of the file survives.
 {const css="a{content:'/* x'} b{content:\"*/ y\"} /* real */ c{color:red}",o=stripComments(css,{line:false});
  assert.equal(o,css.replace('/* real */',' '.repeat(10)),'css string with /* kept');}
 // Never silently: whatever the scanner cannot close throws with line:col (extractStrings prefixes the file).
 for(const [src,css,re] of [["a=1;\n/* open",false,/unterminated \/\* comment at 2:1/],["x{content:'open}",true,/unterminated string at 1:11/],["a=1;\nb='open\n",false,/unterminated string at 2:3/],["t=`open",false,/unterminated template literal at 1:3/],["a=(/open\n)",false,/unterminated regex literal .* at 1:4/],["a{} /* open",true,/unterminated \/\* comment at 1:5/]])
  assert.throws(()=>stripComments(src,{line:!css}),re,'throws: '+JSON.stringify(src));
 // at this tree: the comment-only string is gone from the extracted set, the UI error text is still there
 const S=new Set(extractStrings());assert.ok(!S.has('The modeling engine could not start'));assert.ok(S.has('The modeling engine could not start. Close and reopen the app.'));}

// 7. Runtime texts in strings-additions.json and extractor corrections (ADR-0001 rulings).
{const R=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
 const ok={text:'Layers · Layer 1',runtime:true,source:'web/main.mjs:1',approval:'ruling X'};
 assert.doesNotThrow(()=>validateAdditions({strings:['Plain.',ok]},R));
 for(const [bad,re] of [[{...ok,runtime:undefined},/needs runtime:true/],[{...ok,text:''},/"text" must be a non-empty string/],[{...ok,approval:undefined},/"approval" must be a non-empty string/],
  [{...ok,source:undefined},/"source" must be a non-empty string/],[{...ok,source:'web/main.mjs'},/source must be "file:line"/],[{...ok,source:'web/nope.mjs:3'},/source file web\/nope.mjs does not exist/],[{...ok,source:'web/main.mjs:999999'},/web\/main.mjs has no line 999999/]])
  assert.throws(()=>validateAdditions({strings:[bad]},R),re,JSON.stringify(bad));
 // a dom entry may cite a runtime text by its exact text, never by a pattern
 const tmpA=fs.mkdtempSync(path.join(os.tmpdir(),'ada-'));const af=path.join(tmpA,'additions.json');fs.writeFileSync(af,JSON.stringify({strings:['Plain.',ok]}));
 const S2=approvedStrings(tmpA,af);assert.ok(S2.has('Layers · Layer 1')&&S2.has('Plain.'));
 assert.equal(loadDomEntries([E({selector:'#layersBtn',expected:'Layers · Layer 1'})],S2).length,1);
 assert.throws(()=>loadDomEntries([E({selector:'#layersBtn',expected:'Layers · Layer 2'})],S2),/not in strings-baseline/);
 fs.writeFileSync(af,JSON.stringify({strings:[{...ok,source:'web/nope.mjs:1'}]}));assert.throws(()=>approvedStrings(tmpA,af),/does not exist/);fs.rmSync(tmpA,{recursive:true});
 // extractor corrections: accepted as missing, kept apart from removals; fields and source validated
 const c=compareStrings(['A b.','Comment only.'],['A b.'],new Set(),[],[{string:'Comment only.',reason:'comment-only',source:'web/main.mjs:1'}]);
 assert.deepEqual([c.errors,c.corrected,c.removedApproved],[[],['Comment only.'],[]]);
 assert.equal(compareStrings(['A b.','Comment only.'],['A b.'],new Set(),[],[]).errors.length,1);
 assert.throws(()=>validateAdditions({strings:[],extractorCorrections:[{string:'x',reason:'r'}]},R),/"source" must be a non-empty string/);
 assert.throws(()=>validateAdditions({strings:[],extractorCorrections:[{string:'x',reason:'r',source:'web/nope.mjs:1'}]},R),/does not exist/);
 // the committed file is valid and lists the comment-only string as a correction, not a removal
 const cur=JSON.parse(fs.readFileSync(new URL('./perf/strings-additions.json',import.meta.url),'utf8'));validateAdditions(cur,R);
 assert.ok(cur.extractorCorrections.some(x=>x.string==='The modeling engine could not start'&&x.source==='web/perf-flags.mjs:72'));assert.ok(!cur.removals.some(x=>x.string==='The modeling engine could not start'));}

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
 // 6. Box and structure (ADR-0001 box ruling). Live page with an approved pixel area #area at [100,100]-[300,200] (CSS px).
 await page.setContent('<div id="area" style="position:absolute;left:100px;top:100px;width:200px;height:100px"></div>');
 const P='div#app:0>',S=(o)=>({html:`<body><div id="app">${o.body}</div></body>`,styles:o.styles,split:o.split});
 const st=(h,box)=>({style:h,box,layout:'L'});
 const mk=(body,els)=>S({body,styles:Object.fromEntries(Object.entries(els).map(([k,v])=>[P+k,v.comb])),split:{style:Object.fromEntries(Object.entries(els).map(([k,v])=>[P+k,v.style])),box:Object.fromEntries(Object.entries(els).map(([k,v])=>[P+k,v.box])),layout:{}}});
 const IN1=[110,110,50,20],IN2=[110,110,80,20],OUT1=[10,10,50,20],OUT2=[10,10,80,20];
 const chk=(b,n,entries,areas=['#area'])=>checkCapture(page,{name:'s',id:'s@desktop',base:b,now:n,entries,areas,compareDom});
 const pill=E({selector:'#pill',kind:'text',expected:'Ready · millimeters'});
 // a box change on the element an entry matched passes (even outside every area)
 let b6=mk('<div id="pill">Ready</div>',{'div#pill:0':{comb:'c1',style:'s',box:OUT1}}),n6=mk('<div id="pill">Ready · millimeters</div>',{'div#pill:0':{comb:'c2',style:'s',box:OUT2}});
 r=await chk(b6,n6,[pill]);assert.deepEqual([r.matched.map(c=>c.kind),r.unmatched.length,r.errors.length],[['text','box'],0,0],'box change on a matched element passes');
 // the same box change on an unmatched element outside the areas fails
 b6=mk('<div id="pill">Ready</div><div id="other">x</div>',{'div#pill:0':{comb:'c1',style:'s',box:IN1},'div#other:1':{comb:'o1',style:'s',box:OUT1}});
 n6=mk('<div id="pill">Ready</div><div id="other">x</div>',{'div#pill:0':{comb:'c1',style:'s',box:IN1},'div#other:1':{comb:'o2',style:'s',box:OUT2}});
 r=await chk(b6,n6,[]);assert.deepEqual([r.unmatched.map(c=>c.kind),r.errors],[['box'],['computed style/box differs: div#app:0>div#other:1']],'box change outside the areas on an unmatched element fails');
 // a box change on an unmatched element whose old and new boxes lie inside an approved area passes; one corner out fails
 n6=mk('<div id="pill">Ready</div><div id="other">x</div>',{'div#pill:0':{comb:'c2',style:'s',box:IN2},'div#other:1':{comb:'o1',style:'s',box:OUT1}});
 r=await chk(b6,n6,[]);assert.deepEqual([r.matched.map(c=>c.kind+':'+c.approval),r.unmatched.length],[['box:box inside an approved pixel area'],0],'box inside an area passes');
 r=await chk(b6,n6,[],[]);assert.equal(r.unmatched.length,1,'no areas: the same box change fails');
 n6=mk('<div id="pill">Ready</div><div id="other">x</div>',{'div#pill:0':{comb:'c2',style:'s',box:[110,110,250,20]},'div#other:1':{comb:'o1',style:'s',box:OUT1}});
 r=await chk(b6,n6,[]);assert.equal(r.unmatched.length,1,'box partly outside the area fails');
 // a style change on a matched element fails, inside an area too
 b6=mk('<div id="pill">Ready</div>',{'div#pill:0':{comb:'c1',style:'s1',box:IN1}});n6=mk('<div id="pill">Ready · millimeters</div>',{'div#pill:0':{comb:'c2',style:'s2',box:IN1}});
 r=await chk(b6,n6,[pill]);assert.deepEqual([r.matched.map(c=>c.kind),r.unmatched.map(c=>c.kind),r.errors],[['text'],['computed style'],['computed style/box differs: div#app:0>div#pill:0']],'style change on a matched element fails');
 // no split data: every combined-hash change fails as before
 r=await chk({...b6,split:undefined},{...n6,split:undefined},[pill]);assert.equal(r.unmatched[0].why,'no style/box split data');
 // added element: inside an area with an "added" entry passes; outside fails; wrong text fails; no entry fails
 const add=E({selector:'#unitSwitch',kind:'added',expected:'Ready · millimeters'}),addNoText=E({selector:'#unitSwitch',kind:'added',expected:undefined});
 b6=mk('<div id="hdr">D</div>',{'div#hdr:0':{comb:'h',style:'s',box:IN1}});
 const withAdd=(box,txt='Ready · millimeters',kid=box)=>mk(`<div id="hdr">D</div><div id="unitSwitch"><b>${txt}</b></div>`,{'div#hdr:0':{comb:'h',style:'s',box:IN1},'div#unitSwitch:1':{comb:'u',style:'s',box},'div#unitSwitch:1>b:0':{comb:'k',style:'s',box:kid}});
 r=await chk(b6,withAdd(IN2),[add]);assert.deepEqual([r.matched.map(c=>c.kind),r.unmatched.length,r.errors.length],[['element added'],0,0],'added inside an area passes');
 r=await chk(b6,withAdd(IN2),[addNoText]);assert.equal(r.unmatched.length,0,'added without expected text passes inside an area');
 r=await chk(b6,withAdd(OUT2),[add]);assert.deepEqual([r.matched.length,r.unmatched[0].kind,r.unmatched[0].why],[0,'element added','box not entirely inside an approved pixel area'],'added outside fails');
 r=await chk(b6,withAdd(IN2,'Ready · millimeters',OUT1),[add]);assert.equal(r.unmatched.length,1,'added with a descendant outside the area fails');
 r=await chk(b6,withAdd(IN2,'Ready'),[add]);assert.deepEqual([r.matched.length,r.unmatched[0].why],[0,'no matching "added" entry'],'added with the wrong text fails');
 r=await chk(b6,withAdd(IN2),[]);assert.equal(r.unmatched.length,1,'added without an entry fails');assert.match(r.errors[0],/^outerHTML differs/);
 // removed element still fails, even inside an area with an "added" entry for it
 r=await chk(withAdd(IN2),b6,[add]);assert.deepEqual(r.unmatched.map(c=>c.kind),['element removed']);
 // "added" entries are validated like the others; expected is optional
 assert.equal(loadDomEntries([{scene:'*',selector:'#unitSwitch',kind:'added',approval:'x'}],STR).length,1);
 assert.throws(()=>loadDomEntries([{scene:'*',selector:'div',kind:'added',approval:'x'}],STR),/bare tag/);
 assert.throws(()=>loadDomEntries([{scene:'*',selector:'#u',kind:'added',expected:'nope',approval:'x'}],STR),/not in strings-baseline/);
}finally{await browser.close();}
console.log('PASS approved-dom-areas: selector rule (8 valid, 23 rejected), kinds, load-time strings check, matched title/text/aria-label changes pass, unmatched/wrong scene/kind/value/selector, aria-label and role without an entry, removed attributes, added elements and style/box changes fail; per-capture matched/unmatched counts; strings removals listed vs unlisted; comment-skipping extractor; box on matched element / inside area pass, outside fails, style change fails, added inside passes / outside / wrong text fail, removed fails; runtime texts and extractor corrections validated');
