// ADR-0001 approved-dom-areas: unit tests for tests/perf/approved-dom.mjs (the "dom" entries of approved-areas.json
// used by tests/pixels.mjs). Runs domChanges in a blank Chromium page; no app, no baseline folder is written.
import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {createRequire} from 'node:module';
import {validSelector,validKind,loadDomEntries,approvedStrings,checkCapture,fmtChange} from './perf/approved-dom.mjs';import {diffIn} from './perf/png.mjs';import {compareDom,compareStrings,stripComments,extractStrings,validateAdditions,RUNTIME_SYNTAX,runtimeSyntax,sourceBuilds} from './perf/dom-baseline.mjs';
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
 // QA pre-review 3: a backslash-newline inside a CSS (or JS) string continues the string; nothing after it is blanked
 {const css="a{content:'one \\\ntwo /* x'} /* real */ b{color:red}",o=stripComments(css,{line:false});assert.equal(o,css.replace('/* real */',' '.repeat(10)),'css backslash-newline');
  const js="const s='one \\\ntwo // x'; // gone",oj=stripComments(js);assert.ok(oj.includes("two // x'")&&!oj.includes('gone'),'js backslash-newline');
  assert.equal(o.split('\n').length,2,'line count kept');}
 // Never silently: whatever the scanner cannot close throws with line:col (extractStrings prefixes the file).
 for(const [src,css,re] of [["a=1;\n/* open",false,/unterminated \/\* comment at 2:1/],["x{content:'open}",true,/unterminated string at 1:11/],["a=1;\nb='open\n",false,/unterminated string at 2:3/],["t=`open",false,/unterminated template literal at 1:3/],["a=(/open\n)",false,/unterminated regex literal .* at 1:4/],["a{} /* open",true,/unterminated \/\* comment at 1:5/]])
  assert.throws(()=>stripComments(src,{line:!css}),re,'throws: '+JSON.stringify(src));
 // at this tree: the comment-only string is gone from the extracted set, the UI error text is still there
 const S=new Set(extractStrings());assert.ok(!S.has('The modeling engine could not start'));assert.ok(S.has('The modeling engine could not start. Close and reopen the app.'));}

// 7. Runtime texts in strings-additions.json and extractor corrections (ADR-0001 rulings; QA pre-review notes).
{const R=fs.mkdtempSync(path.join(os.tmpdir(),'ada-repo-'));fs.mkdirSync(path.join(R,'web'));
 const fx=["const a='Plain literal text.';","el.title='Layers · '+layerName(p);","const t=`${label} (${keyText(k)})`;",
  "const pos=(ref?'Bottom-center placement':'Object center position')+' · '+byUnit('millimeters','inches');","// 'Comment text only.'",
  ...Array(14).fill(''),"const far='Far away text.';"];
 fs.writeFileSync(path.join(R,'web/fx.mjs'),fx.join('\n')+'\n');fs.writeFileSync(path.join(R,'web/bad.mjs'),"const x='open\n");
 const ok={text:'Layers · Layer 1',runtime:true,source:'web/fx.mjs:2',approval:'ruling X'};
 assert.doesNotThrow(()=>validateAdditions({strings:['Plain.',ok]},R));
 for(const [bad,re] of [[{...ok,runtime:undefined},/needs runtime:true/],[{...ok,text:''},/"text" must be a non-empty string/],[{...ok,approval:undefined},/"approval" must be a non-empty string/],
  [{...ok,source:undefined},/"source" must be a non-empty string/],[{...ok,source:'web/fx.mjs'},/source must be "file:line"/],[{...ok,source:'web/nope.mjs:3'},/source file web\/nope.mjs does not exist/],[{...ok,source:'web/fx.mjs:999999'},/web\/fx.mjs has no line 999999/]])
  assert.throws(()=>validateAdditions({strings:[bad]},R),re,JSON.stringify(bad));
 // template/pattern syntax is rejected (the exact set RUNTIME_SYNTAX); ordinary UI punctuation is not
 assert.deepEqual(RUNTIME_SYNTAX,['${','*','\\','[',']','{','}','^','$','|','.*','.+','.?','(?:','(?=','(?!','(?<']);
 for(const x of RUNTIME_SYNTAX)assert.throws(()=>validateAdditions({strings:[{...ok,text:'Layers · '+x+'1'}]},R),/template\/pattern syntax .* is not allowed/,'rejects '+x);
 for(const t of ['Help (?)','Undo (Cmd/Ctrl+Z)','Redo (Cmd/Ctrl+Shift+Z)','Fit model (0)','Edge (F)'])assert.deepEqual(runtimeSyntax(t),[],'ordinary text: '+t);
 // the cited line (±3) must contain or build the text
 const sb=(t,src)=>sourceBuilds(t,src,R);
 assert.equal(sb('Plain literal text.','web/fx.mjs:1').how,'literal');
 assert.equal(sb('Bottom-center placement · millimeters','web/fx.mjs:4').how,'concatenation of literals');
 assert.match(sb('Layers · Layer 1','web/fx.mjs:2').how,/1 dynamic part/);
 assert.match(sb('Help (?)','web/fx.mjs:3').how,/2 dynamic part/);
 assert.ok(sb('Plain literal text.','web/fx.mjs:3').ok,'within ±3 lines');
 for(const [t,src] of [['Nope · x','web/fx.mjs:2'],['Layer 1 · Layers','web/fx.mjs:2'],['Help','web/fx.mjs:3'],['Help (?) more','web/fx.mjs:3'],['Far away text.','web/fx.mjs:2'],['Comment text only.','web/fx.mjs:5'],['Object center position - millimeters','web/fx.mjs:4']])
  assert.equal(sb(t,src).ok,false,'not built: '+t+' @ '+src);
 // known limit, pinned: dynamic parts are not traced, so line 4's chain (…)+' · '+(…) also admits other ' · ' texts
 assert.ok(sb('Bottom-center placement · inches · x','web/fx.mjs:4').ok);
 assert.ok(sb('Far away text.','web/fx.mjs:20').ok);
 assert.match(sb('x','web/bad.mjs:1').why,/cannot scan web\/bad.mjs: stripComments: unterminated string/,'unreadable source fails loudly');
 assert.throws(()=>validateAdditions({strings:[{...ok,text:'Nope · x'}]},R),/cannot verify the source: web\/fx.mjs:2 \(±3 lines\) neither contains nor builds "Nope · x"/);
 // a dom entry may cite a runtime text by its exact text, never by a pattern
 const tmpA=fs.mkdtempSync(path.join(os.tmpdir(),'ada-'));const af=path.join(tmpA,'additions.json');fs.writeFileSync(af,JSON.stringify({strings:['Plain.',ok]}));
 const S2=approvedStrings(tmpA,af,R);assert.ok(S2.has('Layers · Layer 1')&&S2.has('Plain.'));
 assert.equal(loadDomEntries([E({selector:'#layersBtn',expected:'Layers · Layer 1'})],S2).length,1);
 assert.throws(()=>loadDomEntries([E({selector:'#layersBtn',expected:'Layers · Layer 2'})],S2),/not in strings-baseline/);
 fs.writeFileSync(af,JSON.stringify({strings:[{...ok,source:'web/nope.mjs:1'}]}));assert.throws(()=>approvedStrings(tmpA,af,R),/does not exist/);fs.rmSync(tmpA,{recursive:true});
 // extractor corrections: accepted as missing, kept apart from removals; fields and source validated; stale when still extracted
 const cr=[{string:'Comment only.',reason:'comment-only',source:'web/fx.mjs:5'}];
 const c=compareStrings(['A b.','Comment only.'],['A b.'],new Set(),[],cr);
 assert.deepEqual([c.errors,c.corrected,c.removedApproved,c.staleCorrections],[[],['Comment only.'],[],[]]);
 assert.equal(compareStrings(['A b.','Comment only.'],['A b.'],new Set(),[],[]).errors.length,1);
 assert.deepEqual(compareStrings(['A b.','Comment only.'],['A b.','Comment only.'],new Set(),[],cr).staleCorrections,['Comment only.'],'a correction for a string still extracted is stale');
 assert.deepEqual(compareStrings(['A b.'],['A b.'],new Set(),[],cr).staleCorrections,['Comment only.'],'a correction for a string not in the baseline is stale');
 assert.throws(()=>validateAdditions({strings:[],extractorCorrections:[{string:'x',reason:'r'}]},R),/"source" must be a non-empty string/);
 assert.throws(()=>validateAdditions({strings:[],extractorCorrections:[{string:'x',reason:'r',source:'web/nope.mjs:1'}]},R),/does not exist/);
 fs.rmSync(R,{recursive:true});
 // the committed file is valid and lists the comment-only string as a correction, not a removal
 const RR=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
 const cur=JSON.parse(fs.readFileSync(new URL('./perf/strings-additions.json',import.meta.url),'utf8'));validateAdditions(cur,RR);
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
 const mk=(body,els)=>S({body,styles:Object.fromEntries(Object.entries(els).map(([k,v])=>[P+k,v.comb])),split:{style:Object.fromEntries(Object.entries(els).map(([k,v])=>[P+k,v.style])),box:Object.fromEntries(Object.entries(els).map(([k,v])=>[P+k,v.box])),layout:Object.fromEntries(Object.entries(els).map(([k,v])=>[P+k,v.layout??'L']))}});
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
 // Style ruling: a style change passes ONLY on a matched element inside an approved area (old and new boxes)
 b6=mk('<div id="pill">Ready</div>',{'div#pill:0':{comb:'c1',style:'s1',box:IN1}});n6=mk('<div id="pill">Ready · millimeters</div>',{'div#pill:0':{comb:'c2',style:'s2',box:IN1}});
 r=await chk(b6,n6,[pill]);assert.deepEqual([r.matched.map(c=>c.kind),r.unmatched.length,r.errors],[['text','computed style'],0,[]],'style change on a matched element inside an area passes');
 r=await chk(b6,n6,[pill],[]);assert.deepEqual([r.matched.map(c=>c.kind),r.unmatched.map(c=>c.kind+': '+c.why),r.errors],[['text'],['computed style: style change outside the approved areas'],['computed style/box differs: div#app:0>div#pill:0']],'style change on a matched element outside every area fails');
 {const bo=mk('<div id="pill">Ready</div>',{'div#pill:0':{comb:'c1',style:'s1',box:IN1}}),no=mk('<div id="pill">Ready · millimeters</div>',{'div#pill:0':{comb:'c2',style:'s2',box:[110,110,250,20]}});
  r=await chk(bo,no,[pill]);assert.deepEqual(r.unmatched.map(c=>c.kind),['computed style'],'style change on a matched element whose new box leaves the area fails');}
 b6=mk('<div id="pill">Ready</div>',{'div#pill:0':{comb:'c1',style:'s1',box:IN1}});n6=mk('<div id="pill">Ready</div>',{'div#pill:0':{comb:'c2',style:'s2',box:IN1}});
 r=await chk(b6,n6,[pill]);assert.deepEqual([r.matched.length,r.unmatched.map(c=>c.kind)],[0,['computed style']],'style change on an unmatched element fails, inside an area too');
 // the inline style attribute is a style change under the same rule (never an approvable kind)
 {const bo=mk('<div id="pill">Ready</div>',{'div#pill:0':{comb:'c1',style:'s1',box:IN1}}),no=mk('<div id="pill" style="display:flex">Ready · millimeters</div>',{'div#pill:0':{comb:'c2',style:'s2',box:IN1}});
  r=await chk(bo,no,[pill]);assert.deepEqual([r.matched.map(c=>c.kind),r.unmatched.length],[['text','style','computed style'],0],'style attribute on a matched element inside an area passes');
  r=await chk(bo,no,[pill],[]);assert.deepEqual(r.unmatched.map(c=>c.kind).sort(),['computed style','style'],'style attribute outside every area fails');
  const nu=mk('<div id="pill" style="display:flex">Ready</div>',{'div#pill:0':{comb:'c2',style:'s2',box:IN1}});
  r=await chk(bo,nu,[pill]);assert.deepEqual(r.unmatched.map(c=>c.kind+': '+(c.why||'')).sort(),['computed style: ','style: style change on an element no approved entry matched'],'style attribute on an unmatched element fails');
  assert.throws(()=>loadDomEntries([E({selector:'#pill',kind:'style',expected:'Edge'})],STR),/not approvable/);}
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
 // an area with no size (a closed sheet) approves nothing, not even zero-size boxes at its corner
 {await page.evaluate(()=>{const z=document.createElement('div');z.id='zero';z.style.cssText='position:absolute;left:0;top:0;width:0;height:0';document.body.appendChild(z);});
  const Z=[0,0,0,0],bz=mk('<div id="hdr">D</div>',{'div#hdr:0':{comb:'h',style:'s',box:Z}});
  const nz=mk('<div id="hdr">D</div><div id="unitSwitch"><b>Ready · millimeters</b></div>',{'div#hdr:0':{comb:'h',style:'s',box:Z},'div#unitSwitch:1':{comb:'u',style:'s',box:Z},'div#unitSwitch:1>b:0':{comb:'k',style:'s',box:Z}});
  r=await chk(bz,nz,[add],['#zero']);assert.deepEqual(r.unmatched.map(c=>c.why),['box not entirely inside an approved pixel area'],'zero-size area approves nothing');
  await page.evaluate(()=>document.getElementById('zero').remove());}
 // 8. Replaced (ADR-0001 replaced ruling): a removed element passes only when paired with the named new element
 {const old=mk('<div id="sc"><div class="sectionlabel">Pos</div><div id="f">x</div></div>',{'div#sc:0':{comb:'a',style:'s',box:IN1}}),
   rep=mk('<div id="sc"><div class="sectionlabel" id="posTitle">Pos</div><div id="f">x</div></div>',{'div#sc:0':{comb:'a',style:'s',box:IN1},'div#sc:0>div#posTitle:0':{comb:'p',style:'s',box:IN1}});
  const R1={scene:'*',kind:'replaced',oldSelector:'#sc>div.sectionlabel',newSelector:'#posTitle',approval:'test'},addP=E({selector:'#posTitle',kind:'added',expected:undefined});
  r=await chk(old,rep,[R1,addP]);assert.deepEqual([r.matched.map(c=>c.kind).sort(),r.unmatched.length,r.errors.length],[['element added','element removed'],0,0],'replaced: paired removal passes');
  r=await chk(old,rep,[addP]);assert.deepEqual(r.unmatched.map(c=>c.kind),['element removed'],'removal without a replaced entry fails');
  r=await chk(old,rep,[R1]);assert.deepEqual(r.unmatched.map(c=>c.kind),['element added'],'the new element still needs its own added entry');
  const gone=mk('<div id="sc"><div id="f">x</div></div>',{'div#sc:0':{comb:'a',style:'s',box:IN1}});
  r=await chk(old,gone,[R1,addP]);assert.deepEqual(r.unmatched.map(c=>c.kind+': '+c.why),['element removed: no paired new element (newSelector) added under the same parent'],'replaced without its paired new element fails');
  const wrong=mk('<div id="sc"><div class="sectionlabel" id="other">Pos</div><div id="f">x</div></div>',{'div#sc:0':{comb:'a',style:'s',box:IN1},'div#sc:0>div#other:0':{comb:'p',style:'s',box:IN1}});
  r=await chk(old,wrong,[R1,E({selector:'#other',kind:'added',expected:undefined})]);assert.deepEqual(r.unmatched.map(c=>c.kind),['element removed'],'replaced with a different new element fails');
  const elsewhere=mk('<div id="sc"><div id="f">x</div></div><div class="sectionlabel" id="posTitle">Pos</div>',{'div#sc:0':{comb:'a',style:'s',box:IN1},'div#posTitle:1':{comb:'p',style:'s',box:IN1}});
  r=await chk(old,elsewhere,[R1,addP]);assert.deepEqual(r.unmatched.map(c=>c.kind),['element removed'],'replaced: the new element must be under the same parent');
  r=await chk(old,rep,[{...R1,scene:'other'},addP]);assert.equal(r.unmatched.length,1,'replaced in the wrong scene fails');
  r=await chk(old,rep,[{...R1,oldSelector:'#sc>div.nope'},addP]);assert.equal(r.unmatched.length,1,'oldSelector not matching fails');
  assert.equal(loadDomEntries([R1],STR).length,1);
  for(const [bad,re] of [[{...R1,oldSelector:undefined},/"oldSelector" must be a non-empty string/],[{...R1,newSelector:'div'},/invalid newSelector: .*bare tag/],[{...R1,approval:''},/"approval" must be/],[{...R1,selector:'#x'},/not "selector"/],[{...R1,expected:'Pos'},/not "expected"/],[{...R1,oldSelector:'*'},/invalid oldSelector/]])
   assert.throws(()=>loadDomEntries([bad],STR),re,JSON.stringify(bad));}
 // 9. Empty text (ADR-0001): a text entry may expect "" with an approval; still exact
 {const bo=mk('<div id="hd">Dimensions · millimeters<span id="t">x</span></div>',{'div#hd:0':{comb:'a',style:'s',box:IN1}}),no=mk('<div id="hd"><span id="t">x</span></div>',{'div#hd:0':{comb:'a',style:'s',box:IN1}});
  const ET=E({selector:'#hd',kind:'text',expected:''});assert.equal(loadDomEntries([ET],STR).length,1);
  assert.throws(()=>loadDomEntries([{...ET,approval:''}],STR),/"approval" must be/);assert.throws(()=>loadDomEntries([E({selector:'#hd',kind:'title',expected:''})],STR),/not in strings-baseline/);
  r=await chk(bo,no,[ET]);assert.deepEqual([r.matched.map(c=>c.kind),r.unmatched.length],[['text'],0],'empty text with an entry passes');
  r=await chk(bo,no,[]);assert.equal(r.unmatched.length,1,'empty text without an entry fails');
  const nx=mk('<div id="hd">D<span id="t">x</span></div>',{'div#hd:0':{comb:'a',style:'s',box:IN1}});r=await chk(bo,nx,[ET]);assert.equal(r.unmatched.length,1,'an "" entry does not cover other text');}
 // 10. Uniform offset (ADR-0001 offset ruling): same size, style and layout, same (dx,dy), in the container of a matched element
 {const fld=(y,h=20,lay='L',sty='s')=>({comb:'f'+y+h+lay+sty,style:sty,box:[10,y,50,h],layout:lay});
  const body='<div id="sc"><div id="hd">Dims</div><div id="f1"><b>x</b></div><div id="f2">y</div></div><div id="out">z</div>';
  const base=mk(body,{'div#sc:0':{comb:'c',style:'s',box:IN1},'div#sc:0>div#hd:0':{comb:'h',style:'s',box:IN1},'div#sc:0>div#f1:1':fld(900),'div#sc:0>div#f1:1>b:0':fld(905,10),'div#sc:0>div#f2:2':fld(1300),'div#out:1':fld(50)});
  const moved=(o={})=>mk(body.replace('>Dims<','>Dims · millimeters<'),{'div#sc:0':{comb:'c',style:'s',box:IN1},'div#sc:0>div#hd:0':{comb:'h2',style:'s',box:IN1},'div#sc:0>div#f1:1':o.f1??fld(912),'div#sc:0>div#f1:1>b:0':o.b??fld(917,10),'div#sc:0>div#f2:2':o.f2??fld(1312),'div#out:1':o.out??fld(50)});
  const HD=E({selector:'#hd',kind:'text',expected:'Dims · millimeters'});
  r=await chk(base,moved(),[HD],[]);assert.deepEqual([r.unmatched.length,r.matched.filter(c=>/uniform offset \(0, 12\)/.test(c.approval)).length],[0,3],'uniform offset (offscreen, no area) in the matched container passes');
  r=await chk(base,moved(),[],[]);assert.ok(r.unmatched.length>=3,'offset without a matched element in the container fails');
  r=await chk(base,moved({f2:fld(1312,24)}),[HD],[]);assert.deepEqual(r.unmatched.map(c=>c.path+': '+c.why),['div#app:0>div#sc:0>div#f2:2: size changed (an offset must keep the size)'],'offset with a size change fails');
  r=await chk(base,moved({f2:fld(1312,20,'L',  's2')}),[HD],[]);assert.deepEqual(r.unmatched.map(c=>c.kind),['computed style'],'offset with a style change fails');
  r=await chk(base,moved({f2:fld(1312,20,'L2')}),[HD],[]);assert.deepEqual(r.unmatched.map(c=>c.why),['layout values changed (an offset must keep them)'],'offset with a layout change fails');
  r=await chk(base,moved({f2:fld(1320)}),[HD],[]);assert.deepEqual([r.unmatched.length,r.unmatched.every(c=>c.why==='offset not uniform within the container')],[3,true],'non-uniform offset fails');
  r=await chk(base,moved({out:fld(62)}),[HD],[]);assert.deepEqual(r.unmatched.map(c=>c.path),['div#app:0>div#out:1'],'an element outside the container does not get the offset');
  // a matched element directly under body does not make body a container
  const tb='<div id="hd">Dims</div><div id="f1">x</div>',tB=mk(tb,{'div#hd:0':{comb:'h',style:'s',box:IN1},'div#f1:1':fld(900)}),tN=mk(tb.replace('>Dims<','>Dims · millimeters<'),{'div#hd:0':{comb:'h2',style:'s',box:IN1},'div#f1:1':fld(912)});
  r=await chk(tB,tN,[HD],[]);assert.deepEqual(r.unmatched.map(c=>c.kind),[],'#app is the container here');
  const raw=(h,y)=>({html:`<body><div id="hd">${h}</div><div id="f1">x</div></body>`,styles:{'div#hd:0':h,'div#f1:1':'f'+y},split:{style:{'div#hd:0':'s','div#f1:1':'s'},box:{'div#hd:0':IN1,'div#f1:1':[10,y,50,20]},layout:{'div#hd:0':'L','div#f1:1':'L'}}});
  r=await chk(raw('Dims',900),raw('Dims · millimeters',912),[HD],[]);assert.deepEqual(r.unmatched.map(c=>c.path),['div#f1:1'],'body is never an offset container');}
 // 11. Hidden entries (ADR-0001 hidden ruling, option b): non-rendered containers, explicit per-capture entries
 {const Z=[0,0,0,0],V=[450,90,540,810],AP='inch F1c (test)';
  const body=(now)=>now?'<div id="sheet"><div id="sc"><div class="sectionlabel" id="posTitle">Pos</div><div id="hd" style="display:flex"><span id="unitSwitch">mmin</span></div></div></div>'
                       :'<div id="sheet"><div id="sc"><div class="sectionlabel">Pos</div><div id="hd">Dims</div></div></div>';
  const snapH=(now,{sheet=Z,hd=sheet,kid=Z}={})=>mk(body(now),{'div#sheet:0':{comb:'s'+sheet,style:'s',box:sheet},'div#sheet:0>div#sc:0':{comb:'c'+sheet,style:'s',box:sheet},
    ...(now?{'div#sheet:0>div#sc:0>div#posTitle:0':{comb:'p',style:'s',box:Z},'div#sheet:0>div#sc:0>div#hd:1':{comb:'h2'+hd,style:'s2',box:hd},'div#sheet:0>div#sc:0>div#hd:1>span#unitSwitch:0':{comb:'u',style:'s',box:kid}}
          :{'div#sheet:0>div#sc:0>div:0':{comb:'p',style:'s',box:Z},'div#sheet:0>div#sc:0>div#hd:1':{comb:'h1'+hd,style:'s1',box:hd}})});
  const H={scene:'s@desktop',hidden:true,regionFrom:'v@desktop',approval:AP};
  const HE=[{...H,selector:'#hd',kind:'text',expected:''},{...H,kind:'replaced',oldSelector:'#sc>div.sectionlabel',newSelector:'#posTitle'},
    {...H,selector:'#posTitle',kind:'added',expected:null},{...H,selector:'#unitSwitch',kind:'added',expected:null}];
  const reg={rect:V};let px=0,asked=[];const regionOf=(rf,c)=>{asked.push([rf,c]);return reg;},pxIn=()=>px;
  const chkH=(b,n,entries,o={})=>checkCapture(page,{name:'s',id:'s@desktop',base:b,now:n,entries,areas:[],compareDom,regionOf:o.regionOf??regionOf,pxIn:o.pxIn??pxIn});
  r=await chkH(snapH(false),snapH(true),HE);
  assert.deepEqual([r.unmatched.map(fmtChange),r.errors],[[],[]],'hidden: text "", replaced, added and the matched element\'s style pass');
  assert.deepEqual(r.matched.map(c=>c.kind).sort(),['computed style','element added','element added','element removed','style','text']);
  assert.ok(r.matched.every(c=>c.hidden?.container==='div#app:0>div#sheet:0'&&c.hidden.regionFrom==='v@desktop'),'container = outermost 0×0 ancestor');
  assert.deepEqual(asked,[['v@desktop','div#app:0>div#sheet:0']],'one region lookup per container');
  // negatives: an ancestor visible in the old or in the new capture; the scene's container visible in both
  for(const [b,n,what] of [[snapH(false,{sheet:V}),snapH(true),'old'],[snapH(false),snapH(true,{sheet:V}),'new'],[snapH(false,{sheet:V}),snapH(true,{sheet:V}),'both (container visible in this scene)']]){
   r=await chkH(b,n,HE);assert.equal(r.matched.filter(c=>c.hidden).length,0,'no hidden match: ancestor visible in '+what);
   assert.ok(r.unmatched.some(c=>c.why&&/hidden entry, but the container is rendered/.test(c.why)),'reason given: '+what);}
  // the element itself drawn (an added child with a size) fails even in a 0×0 container
  r=await chkH(snapH(false),snapH(true,{kid:[10,10,5,5]}),HE);assert.deepEqual(r.unmatched.map(c=>c.kind),['element added'],'added element with a drawn descendant fails');
  // nonzero px in the region: every hidden match of that container fails, loudly
  px=3;r=await chkH(snapH(false),snapH(true),HE);px=0;
  assert.equal(r.matched.length,0);assert.ok(r.unmatched.length>=6&&r.unmatched.every(c=>/3 differing px in the region of div#app:0>div#sheet:0/.test(c.why||'')),'nonzero px in the region fails');
  assert.ok(r.errors.some(e=>/^hidden entry: 3 differing px in the region/.test(e)));
  // region not determinable / pixels not readable: fail loudly
  r=await chkH(snapH(false),snapH(true),HE,{regionOf:()=>({error:'the baseline snapshot of v@desktop has no style/box split data'})});
  assert.ok(r.errors.some(e=>/cannot determine the region of div#app:0>div#sheet:0 from v@desktop: the baseline snapshot of v@desktop has no style\/box split data/.test(e))&&!r.matched.length);
  r=await chkH(snapH(false),snapH(true),HE,{pxIn:()=>({error:'no baseline png'})});assert.ok(r.errors.some(e=>/cannot count pixels .*no baseline png/.test(e))&&!r.matched.length);
  r=await checkCapture(page,{name:'s',id:'s@desktop',base:snapH(false),now:snapH(true),entries:HE,areas:[],compareDom});assert.ok(r.errors.some(e=>/no region source/.test(e)),'no region source fails');
  // per capture: an entry for s@phone does not apply to s@desktop (no cross-scene inference)
  r=await chkH(snapH(false),snapH(true),HE.map(e=>({...e,scene:'s@phone',regionFrom:'v@phone'})));assert.equal(r.matched.length,0,'another capture\'s hidden entry does not apply');
  // style: a hidden element matched only by a VISIBLE entry does not get the hidden style approval
  r=await chkH(snapH(false),snapH(true),[{scene:'*',selector:'#hd',kind:'text',expected:'',approval:AP},...HE.slice(1)]);
  assert.deepEqual(r.unmatched.map(c=>c.kind).sort(),['computed style','style'],'style on a hidden element matched only by a visible entry fails');
  // loader: per-capture scene, regionFrom, a visible twin with the same approval
  const vis=[{scene:'*',selector:'#hd',kind:'text',expected:'',approval:AP},{scene:'v',kind:'replaced',oldSelector:'#sc>div.sectionlabel',newSelector:'#posTitle',approval:AP},{scene:'v@desktop',selector:'#posTitle',kind:'added',approval:AP},{scene:'*',selector:'#unitSwitch',kind:'added',approval:AP}];
  const hidL=HE.map(({expected,...e})=>e.kind==='added'?e:{...e,...(expected!==undefined&&e.kind!=='replaced'?{expected}:{})});
  assert.equal(loadDomEntries([...vis,...hidL],STR).length,8);
  for(const [bad,re] of [[{...hidL[0],approval:'other ref'},/approval must equal the visible entry's approval \("inch F1c \(test\)"\)/],[{...hidL[0],scene:'*'},/must be one capture id/],[{...hidL[0],scene:'s'},/must be one capture id/],
   [{...hidL[0],regionFrom:undefined},/needs "regionFrom"/],[{...hidL[0],regionFrom:'v@phone'},/same device/],[{...hidL[0],regionFrom:'s@desktop'},/another capture/],[{...hidL[0],hidden:'yes'},/"hidden" must be true/],
   [{...hidL[0],selector:'#other'},/no visible entry with the same kind and selector\/expected/],[{...hidL[0],expected:'Dims'},/no visible entry|not in strings/],[{...hidL[2],regionFrom:'w@desktop'},/whose scene covers regionFrom w@desktop/]])
   assert.throws(()=>loadDomEntries([...vis,bad],STR),re,JSON.stringify(bad));
  assert.throws(()=>loadDomEntries([{...vis[0],regionFrom:'v@desktop'}],STR),/only for hidden entries/);
  // diffIn (pixels.mjs region count) on real screenshots: a 10×10 change inside / outside the region
  await page.setContent('<body style="margin:0;background:#fff"></body>');const p0=await page.screenshot();
  await page.setContent('<body style="margin:0;background:#fff"><div style="position:absolute;left:20px;top:30px;width:10px;height:10px;background:#f00"></div></body>');const p1=await page.screenshot();
  assert.deepEqual([diffIn(p0,p1,[0,0,100,100]),diffIn(p0,p1,[25,30,100,100]),diffIn(p0,p1,[40,0,100,100])],[100,50,0],'diffIn counts only inside the region');}
}finally{await browser.close();}
console.log('PASS approved-dom-areas: selector rule (8 valid, 23 rejected), kinds, load-time strings check, matched title/text/aria-label changes pass, unmatched/wrong scene/kind/value/selector, aria-label and role without an entry, removed attributes, added elements and style/box changes fail; per-capture matched/unmatched counts; strings removals listed vs unlisted; comment-skipping extractor; box on matched element / inside area pass, outside fails, style change fails, added inside passes / outside / wrong text fail, removed fails; runtime texts and extractor corrections validated');
