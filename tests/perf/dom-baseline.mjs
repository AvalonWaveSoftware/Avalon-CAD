import {fileURLToPath} from 'node:url';
// Perf ADR v2 WS0 / §4.2: DOM, CSS and string invariance against the captured baseline.
//   node tests/perf/dom-baseline.mjs            check static files + string table (exit 1 on any difference)
//   node tests/perf/dom-baseline.mjs --update   regenerate static.json and strings-baseline.json in AVALON_PIXEL_BASELINE
// The per-scene DOM/computed-style snapshots are taken by tests/pixels.mjs through domSnapshot() below.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const HERE=path.dirname(fileURLToPath(import.meta.url));
export const REPO=path.resolve(HERE,'../..');
// Baselines are artifacts outside git (ADR v2 WS0 step 3).
export const BASE=path.resolve(process.env.AVALON_PIXEL_BASELINE||'/workspace/avalon-cad-artifacts/perf-baseline');
export const ASSETS=path.resolve(process.env.AVALON_ASSETS||path.join(REPO,'app/assets'));
import {versionTokens,withVersionTokens} from './version-token.mjs';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
export const STATIC_FILES=['style.css','index.html'];
// Code-like fragments (containing = ( ) { } ; < > [ ] $ \ or backticks) are skipped; template/HTML strings are covered
// by the per-scene DOM snapshots instead. User-visible strings come from the app's own sources (three.js/replicad strings are not UI text).
// web/glyphs.mjs is generated font outline data (ADR new-primitives-polyhedra-text §2.2), not UI text.
const GENERATED_DATA=new Set(['glyphs.mjs']);
const STRING_SOURCES=()=>[...fs.readdirSync(path.join(REPO,'web')).filter(f=>/\.(mjs|html|css)$/.test(f)&&!GENERATED_DATA.has(f)).map(f=>'web/'+f),'engine/python/model_jobs.py','desktop/main.cjs'].filter(f=>fs.existsSync(path.join(REPO,f)));
// Blanks out // line and /* */ block comments (newlines kept, so line numbers stay) while leaving string, template and
// regular-expression literals untouched. A '/' starts a regex literal where an expression may start (after one of
// ( , = : [ ! & | ? { } ; + - * % < > ~ ^, at the start, or after return/typeof/case/in/of/void/delete/new/throw/yield/await).
// line:false (CSS) strips only block comments.
// approved-dom-areas-2 (QA §3 edge cases): '/' after a postfix ++/-- is division, not a regex start; CSS strings are
// tracked, so '/*' inside content:'…' is not a comment. Anything the scanner cannot close (an unterminated /* */, string,
// template or regex) throws with line:col instead of silently blanking the rest of the file; extractStrings adds the file.
export function stripComments(src,{line=true,tok=null}={}){let out='',i=0;const n=src.length,stack=[];let prev='';// last significant token char/word
 const where=k=>{const b=src.slice(0,k).split('\n');return `${b.length}:${b.at(-1).length+1}`},fail=(k,what)=>{throw Error(`stripComments: unterminated ${what} at ${where(k)}`)};
 const blank=s=>s.replace(/[^\n]/g,' ');const regexOk=()=>prev===''||/[(,=:[!&|?{};+\-*%<>~^]$/.test(prev)||/(?:^|[^\w$])(?:return|typeof|case|in|of|void|delete|new|throw|yield|await|else|do)$/.test(prev);
 while(i<n){const c=src[i],d=src[i+1];
  if(c==='/'&&d==='*'){const j=src.indexOf('*/',i+2);if(j<0)fail(i,'/* comment');const e=j+2;tok?.({k:'cmt',s:src.slice(i+2,j),a:i+2,b:j});out+=blank(src.slice(i,e));i=e;continue;}
  if(line&&c==='/'&&d==='/'){let e=src.indexOf('\n',i);if(e<0)e=n;tok?.({k:'cmt',s:src.slice(i+2,e),a:i+2,b:e});out+=blank(src.slice(i,e));i=e;continue;}
  if(c==="'"||c==='"'){let j=i+1;while(j<n&&src[j]!==c&&src[j]!=='\n'){if(src[j]==='\\')j++;j++;}if(src[j]!==c)fail(i,'string');tok?.({k:'str',s:src.slice(i+1,j),a:i,b:j+1,depth:stack.length});out+=src.slice(i,j+1);i=j+1;prev='a';continue;}
  if(!line){out+=c;i++;continue;}// CSS: strings (above) and /* */ only
  if((c==='+'||c==='-')&&d===c){const post=prev!==''&&!regexOk();out+=c+d;i+=2;prev=post?'a':c;continue;}// x++ / 2: operand ends
  if(c==='`'||(c==='}'&&stack.length&&stack.at(-1)===0)){// template literal body (start, or resume after ${ … })
   if(c==='}')stack.pop();let j=i+1,interp=false;while(j<n&&src[j]!=='`'){if(src[j]==='\\'){j+=2;continue;}if(src[j]==='$'&&src[j+1]==='{'){j+=2;stack.push(0);interp=true;break;}j++;}
   if(!interp&&j>=n)fail(i,'template literal');
   tok?.({k:'tpl',s:src.slice(i+1,interp?j-2:j),open:c==='`',close:!interp,a:i,b:interp?j:j+1,depth:stack.length-(interp?1:0)});
   if(interp){out+=src.slice(i,j);i=j;prev='{';}else{out+=src.slice(i,j+1);i=j+1;prev='a';}continue;}
  if(c==='{'&&stack.length){stack[stack.length-1]++;}else if(c==='}'&&stack.length){stack[stack.length-1]--;}
  if(c==='/'&&regexOk()){let j=i+1,cls=false;while(j<n&&src[j]!=='\n'){if(src[j]==='\\'){j+=2;continue;}if(src[j]==='[')cls=true;else if(src[j]===']')cls=false;else if(src[j]==='/'&&!cls)break;j++;}
   if(src[j]==='/'){j++;while(j<n&&/[a-z]/.test(src[j]))j++;out+=src.slice(i,j);i=j;prev='a';continue;}
   fail(i,'regex literal (or a / the scanner misread as one)');}
  out+=c;i++;if(!/\s/.test(c))prev=/[\w$]/.test(c)?(/[\w$]$/.test(prev)?prev+c:c).slice(-8):c;}
 return out;}
// batch-3.0 (Architect ruling 2026-10-25 10:40 CT; narrowed in batch-3.0b after QA S6). The one exception to "every
// literal is a candidate string": a literal written directly as the argument of .startsWith( or .endsWith( (e.g.
// shell-ui.mjs why.startsWith('Hollow is not offered')) is a test in code. It is left out ONLY when another extracted
// string actually starts with it (startsWith) or ends with it (endsWith), i.e. it is a fragment of a full message that
// is itself gated. Otherwise it is read like any literal (e.g. 'blob:'; an unmatched fragment still fails the gate).
// Rule tests: tests/approved-dom-areas.mjs §6 (extractFrom on synthetic sources) and the tree check after them.
export const PREFIX_TEST=/\.(startsWith|endsWith)\(\s*$/;
const candidate=s=>s.length>1&&!/[=(){};<>\[\]`$\\]/.test(s)&&!/^\.{0,2}\/|\.(m?js|cjs|wasm|py)$/.test(s)&&/[A-Za-z]/.test(s)&&/[ .!?…:·]|^[A-Z][a-z]+$/.test(s);
export function extractFrom(sources){const set=new Set(),tests=[];
 for(const [f,raw] of sources){
  // ADR-0001 approved-dom-areas (b): // and /* */ comments are not UI text. JS sources (.mjs/.cjs) lose both, CSS loses
  // /* */; Python and HTML are read as before (// is floor division in Python).
  let src;try{src=/\.(mjs|cjs|js)$/.test(f)?stripComments(raw):f.endsWith('.css')?stripComments(raw,{line:false}):raw;}catch(e){throw Error(`${f}: ${e.message}`);}
  if(f.endsWith('.html')){for(const m of src.matchAll(/>([^<>]*[A-Za-z][^<>]*)</g))set.add(m[1].trim());for(const m of src.matchAll(/(?:title|aria-label|placeholder)="([^"]+)"/g))set.add(m[1]);continue;}
  for(const m of src.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)){const s=(m[1]??m[2]??m[3]),t=src.slice(Math.max(0,m.index-16),m.index).match(PREFIX_TEST);
   if(t)tests.push([s,t[1]]);else if(candidate(s))set.add(s);}}
 for(const [s,kind] of tests)if(candidate(s)&&![...set].some(x=>x!==s&&x[kind](s)))set.add(s);
 return [...set].filter(Boolean).sort();}
export function extractStrings(){return extractFrom(STRING_SOURCES().map(f=>[f,fs.readFileSync(path.join(REPO,f),'utf8')]));}
// ADR new-primitives-polyhedra-text §5.12: the string table may differ from the baseline only by the additions listed
// in tests/perf/strings-additions.json (each one approved with the feature); a baseline string may never be removed
// or edited, and any other new string still fails.
// ADR-0001 approved-dom-areas (runtime ruling): an entry of "strings" is either a plain string (extracted from source) or
// a runtime text {text, runtime:true, source:"file:line", approval}: the exact rendered text of a title/label the
// extractor cannot see (composed at runtime). No templates, no patterns. All four fields are required and source must be
// an existing file (relative to the repo) with that line; validateAdditions throws otherwise.
export function checkSource(src,repo=REPO){const m=typeof src==='string'&&src.match(/^([^:]+):(\d+)$/);if(!m)return 'source must be "file:line"';
 const f=path.join(repo,m[1]);if(!fs.existsSync(f))return `source file ${m[1]} does not exist`;if(+m[2]<1||+m[2]>fs.readFileSync(f,'utf8').split('\n').length)return `${m[1]} has no line ${m[2]}`;return null;}
// QA pre-review (approved-dom-areas-2): a runtime text is the exact rendered text, so pattern or template syntax in it
// is rejected at load. The rejected set, exactly: "${", "*", "\", "[", "]", "{", "}", "^", "$", "|", ".*", ".+", ".?",
// "(?:", "(?=", "(?!", "(?<". ("?", "(", ")", "+", "/" and "." alone are ordinary UI text: "Help (?)", "Cmd/Ctrl+Z".)
export const RUNTIME_SYNTAX=['${','*','\\','[',']','{','}','^','$','|','.*','.+','.?','(?:','(?=','(?!','(?<'];
export const runtimeSyntax=t=>RUNTIME_SYNTAX.filter(x=>t.includes(x));
// Source check: the cited line (±SOURCE_WINDOW lines; comments stripped) must contain or build the text. Verified when
//  (a) the text is the content of a string literal there, or
//  (b) the text is a concatenation of string-literal contents found there, or
//  (c) a template literal or a '+' chain ON THE CITED LINE has static parts that, in order, with each dynamic part (${…} or a
//      non-literal '+' operand) standing for a non-empty run of text, spell exactly the text; at least one static part
//      must be non-empty.
// Limit: in (c) the dynamic parts are not traced to their values; the entry's approval covers them. Anything else
// (including a window the scanner cannot read) fails loudly.
export const SOURCE_WINDOW=3;
const unesc=t=>t.replace(/\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|\r\n|[\s\S])/g,(m,x)=>x[0]==='u'||x[0]==='x'?String.fromCodePoint(parseInt(x.replace(/[ux{}]/g,''),16)):x==='n'?'\n':x==='t'?'\t':x==='r'?'\r':/^\r?\n$/.test(x)?'':x);
// Literal units of a JS source from the stripComments scanner (the same one the extractor uses): string literals and
// whole template literals at nesting depth 0, a template as static parts with a gap per ${…}.
export function literalUnits(code){const toks=[];stripComments(code,{tok:t=>toks.push(t)});const units=[];let tpl=null;
 for(const t of toks){if(t.depth!==0)continue;
  if(t.k==='str'){units.push({parts:[{s:unesc(t.s)}],a:t.a,b:t.b});continue;}
  if(t.open)tpl={parts:[],a:t.a};if(!tpl)continue;if(!t.open)tpl.parts.push({gap:1});tpl.parts.push({s:unesc(t.s)});if(t.close){tpl.b=t.b;units.push(tpl);tpl=null;}}
 return units.sort((x,y)=>x.a-y.a);}
export function sourceBuilds(text,src,repo=REPO){const m=src.match(/^([^:]+):(\d+)$/),L=+m[2];let raw,units,code;
 try{raw=fs.readFileSync(path.join(repo,m[1]),'utf8');code=stripComments(raw);units=literalUnits(raw);}catch(e){return {ok:false,why:`cannot scan ${m[1]}: ${e.message}`};}
 const lineOf=k=>code.slice(0,k).split('\n').length,win=units.filter(u=>Math.abs(lineOf(u.a)-L)<=SOURCE_WINDOW);
 const lits=win.filter(u=>u.parts.length===1).map(u=>u.parts[0].s);
 if(lits.includes(text))return {ok:true,how:'literal'};
 // export-3mf (2026-10-24): the text of one HTML element inside a string/template literal (e.g. <label …>File format</label>
 // or <option …>…</option> in an innerHTML template). It is shown exactly as written, but the extractor skips literals that
 // hold markup, so these are listed as runtime entries and verified here.
 if(win.some(u=>u.parts.some(q=>typeof q.s==='string'&&q.s.includes('>'+text+'<'))))return {ok:true,how:'element text in an HTML literal'};
 const ls=[...new Set(lits.filter(Boolean))],can=new Array(text.length+1).fill(false);can[0]=true;
 for(let k=0;k<text.length;k++)if(can[k])for(const l of ls)if(text.startsWith(l,k))can[k+l.length]=true;
 if(can[text.length])return {ok:true,how:'concatenation of literals'};
 // '+' chains: units joined by '+' (direct) or by '+ <expression> +' (a gap); an operand '+' before the first unit or
 // after the last one is a leading/trailing gap. A ';', ',' or line break between units ends the chain.
 const chains=[];let ch=null;
 for(let k=0;k<win.length;k++){const u=win[k],prevEnd=k?win[k-1].b:Math.max(0,code.lastIndexOf('\n',u.a)),before=code.slice(prevEnd,u.a);
  if(ch){const between=before;if(/^\s*\+\s*$/.test(between))ch.push(...u.parts);else if(/^\s*\+[^;,\n]*\+\s*$/.test(between))ch.push({gap:1},...u.parts);else{chains.push(ch);ch=null;}}
  if(ch&&lineOf(u.a)===L)ch.onLine=true;
  if(!ch){ch=[];if(lineOf(u.a)===L)ch.onLine=true;if(/[\w$)\]]\s*\+\s*$/.test(before))ch.push({gap:1});ch.push(...u.parts);}
  const after=code.slice(u.b,k+1<win.length?win[k+1].a:code.indexOf('\n',u.b)>=0?code.indexOf('\n',u.b):code.length);
  if(!(k+1<win.length&&/^\s*\+[^;,\n]*$/.test(after)&&/\+\s*$/.test(after))&&/^\s*\+\s*[\w$(!]/.test(after)){ch.push({gap:1});chains.push(ch);ch=null;}}
 if(ch)chains.push(ch);
 const esc=t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 for(const c of chains){if(!c.onLine)continue;const parts=[];for(const p of c){if(p.gap){if(!parts.at(-1)?.gap)parts.push(p);}else if(parts.length&&!parts.at(-1).gap)parts[parts.length-1]={s:parts.at(-1).s+p.s};else parts.push({s:p.s});}
  if(!parts.some(p=>!p.gap&&p.s)||!parts.some(p=>p.gap))continue;
  if(new RegExp('^'+parts.map(p=>p.gap?'([\\s\\S]+?)':esc(p.s)).join('')+'$').test(text))return {ok:true,how:`static parts of a template or '+' chain (${parts.filter(p=>p.gap).length} dynamic part(s) not traced)`};}
 return {ok:false,why:`${m[1]}:${L} (±${SOURCE_WINDOW} lines) neither contains nor builds ${JSON.stringify(text)} (as a literal, a concatenation of literals, or the static parts of a template or '+' chain)`};}
// QA N3 / ADR-0001 (3:46 AM Oct 18): an extractor correction gets the same contains-or-builds check on its cited line as a
// runtime entry, applied to what a correction claims: the string was only ever seen by the old extractor inside a COMMENT.
// Verified when a comment (// or /* */; CSS /* */ only) within ±SOURCE_WINDOW lines of the cited line contains the string
// as a quoted literal ('…', "…" or `…`, exactly what the pre-correction extractor matched there). It fails loudly when:
// the file is not a JS (.mjs/.cjs/.js) or CSS source (other sources keep their comments, so a correction cannot apply);
// the scanner cannot read it; no such quoted literal is in a comment nearby; or the code there (comments stripped)
// contains or builds the string (sourceBuilds), since then it is not comment-only.
export function correctionSource(text,src,repo=REPO){const m=src.match(/^([^:]+):(\d+)$/),L=+m[2],js=/\.(mjs|cjs|js)$/.test(m[1]),css=m[1].endsWith('.css');
 if(!js&&!css)return {ok:false,why:`${m[1]} is not a JS or CSS source: comments are not stripped there, so no extractor correction can apply`};
 let raw;const cm=[];try{raw=fs.readFileSync(path.join(repo,m[1]),'utf8');stripComments(raw,{line:js,tok:t=>{if(t.k==='cmt')cm.push(t);}});}catch(e){return {ok:false,why:`cannot scan ${m[1]}: ${e.message}`};}
 const lineOf=k=>raw.slice(0,k).split('\n').length;let found=false;
 for(const c of cm)for(const q of c.s.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g))if((q[1]??q[2]??q[3])===text&&Math.abs(lineOf(c.a+q.index)-L)<=SOURCE_WINDOW)found=true;
 if(!found)return {ok:false,why:`no comment at ${m[1]}:${L} (±${SOURCE_WINDOW} lines) quotes ${JSON.stringify(text)}`};
 if(js){const v=sourceBuilds(text,src,repo);if(v.ok)return {ok:false,why:`${m[1]}:${L} also contains or builds ${JSON.stringify(text)} in code (${v.how}): not comment-only`};}
 return {ok:true,how:'quoted in a comment'};}
export function validateAdditions(a,repo=REPO){const bad=[];
 if(!a||!Array.isArray(a.strings))bad.push('"strings" must be a list');
 for(const [i,s] of (a?.strings||[]).entries()){if(typeof s==='string')continue;const at=`strings[${i}] ${JSON.stringify(s)}`;
  if(!s||typeof s!=='object'){bad.push(at+': must be a string or a runtime entry');continue;}
  if(s.runtime!==true)bad.push(at+': an object entry needs runtime:true');
  for(const k of ['text','source','approval'])if(typeof s[k]!=='string'||!s[k])bad.push(`${at}: "${k}" must be a non-empty string`);
  const e=checkSource(s.source,repo);if(e)bad.push(`${at}: ${e}`);
  if(typeof s.text==='string'){const x=runtimeSyntax(s.text);if(x.length)bad.push(`${at}: template/pattern syntax ${x.map(v=>JSON.stringify(v)).join(', ')} is not allowed in a runtime text (exact rendered text only)`);
   else if(!e&&s.text){const v=sourceBuilds(s.text,s.source,repo);if(!v.ok)bad.push(`${at}: cannot verify the source: ${v.why}`);}}}
 for(const [i,c] of (a?.extractorCorrections||[]).entries()){const at=`extractorCorrections[${i}] ${JSON.stringify(c)}`;for(const k of ['string','reason','source'])if(!c||typeof c[k]!=='string'||!c[k])bad.push(`${at}: "${k}" must be a non-empty string`);const e=c&&checkSource(c.source,repo);if(e)bad.push(`${at}: ${e}`);
  else if(typeof c.string==='string'&&c.string){const v=correctionSource(c.string,c.source,repo);if(!v.ok)bad.push(`${at}: cannot verify the source: ${v.why}`);}}
 if(a?.extractorCorrections!=null&&!Array.isArray(a.extractorCorrections))bad.push('"extractorCorrections" must be a list');
 if(bad.length)throw Error('tests/perf/strings-additions.json rejected:\n  '+bad.join('\n  '));return a;}
const ADDITIONS_FILE=path.join(HERE,'strings-additions.json');
export const readAdditions=(f=ADDITIONS_FILE,repo=REPO)=>fs.existsSync(f)?validateAdditions(JSON.parse(fs.readFileSync(f,'utf8')),repo):{strings:[]};
export const additionTexts=a=>a.strings.map(s=>typeof s==='string'?s:s.text);
export const APPROVED_ADDITIONS=()=>new Set(additionTexts(readAdditions()));
// ADR-0001 approved-dom-areas (a): strings-additions.json may also list approved removals, "removals": [{string, approval}].
// A baseline string missing from the build passes only if it is listed there (exact string); unlisted removals fail.
// Like additions, an entry is dropped when the baseline rolls forward without that string.
export const APPROVED_REMOVALS=(f=ADDITIONS_FILE)=>fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')).removals||[]:[];
// Extractor corrections {string, reason, source}: a baseline string that the corrected extractor no longer sees because
// its only source was never UI text (e.g. comment-only). Accepted as missing, kept apart from approved removals.
export const EXTRACTOR_CORRECTIONS=(f=ADDITIONS_FILE)=>fs.existsSync(f)?readAdditions(f).extractorCorrections||[]:[];
// Pure comparison of a baseline string list with the extracted one (testable): returns the failures and the counts.
export function compareStrings(baseline,strings,approved,removals,corrections=[]){const bt=new Set(baseline),now=new Set(strings),errors=[];
 if(!Array.isArray(removals))errors.push('strings-additions.json "removals" must be a list');
 const ok=new Map();for(const [i,r] of (Array.isArray(removals)?removals:[]).entries()){if(!r||typeof r.string!=='string'||!r.string||typeof r.approval!=='string'||!r.approval)errors.push(`removals[${i}] ${JSON.stringify(r)}: needs a non-empty "string" and "approval"`);else ok.set(r.string,r.approval);}
 const corr=new Set(corrections.map(c=>c.string)),added=strings.filter(s=>!bt.has(s)&&!approved.has(s)),missing=[...bt].filter(s=>!now.has(s)),removed=missing.filter(s=>!ok.has(s)&&!corr.has(s)),removedApproved=missing.filter(s=>ok.has(s)),corrected=missing.filter(s=>corr.has(s)&&!ok.has(s));
 const stale=[...ok.keys()].filter(s=>!bt.has(s)||now.has(s)),staleCorrections=[...corr].filter(s=>!bt.has(s)||now.has(s));
 for(const s of added)errors.push('new/changed user-visible string: '+JSON.stringify(s));
 for(const s of removed)errors.push('string missing vs baseline: '+JSON.stringify(s));
 return {errors,added,removed,removedApproved,corrected,stale,staleCorrections,approvedSeen:strings.filter(s=>!bt.has(s)&&approved.has(s)).length};}
// Version-token rule (tests/perf/version-token.mjs, Master Chief ruling 2026-10-28): a static HTML file may differ from the baseline
// ONLY in the ?v=<semver> query of its same-origin script/link URLs. The baseline keeps just the file's hash, so the baseline's token is
// read from its own DOM snapshots (the body <script src>); the current file with its tokens set to that value must hash exactly
// like the baseline. Any other byte of difference fails. Returns {ok,from,to} or {ok:false,why}.
export function versionTokenOnly(f,baselineSha,{base=BASE,assets=ASSETS}={}){if(!/\.html$/.test(f))return {ok:false};
 const text=fs.readFileSync(path.join(assets,f),'utf8'),now=[...new Set(versionTokens(text))];if(now.length!==1)return {ok:false,why:`${now.length} distinct ?v= tokens in the file`};
 const dir=path.join(base,'dom');if(!fs.existsSync(dir))return {ok:false,why:'no DOM snapshots to read the baseline token from'};
 const seen=new Set();for(const n of fs.readdirSync(dir).filter(x=>x.endsWith('.json')).slice(0,3))for(const v of versionTokens(JSON.parse(fs.readFileSync(path.join(dir,n),'utf8')).html))seen.add(v);
 if(seen.size!==1)return {ok:false,why:`baseline DOM carries ${seen.size} distinct ?v= tokens`};const from=[...seen][0];
 return sha(withVersionTokens(text,from))===baselineSha?{ok:true,from,to:now[0]}:{ok:false,why:'differs by more than the ?v= token'};}
export function staticState(){return Object.fromEntries(STATIC_FILES.map(f=>[f,sha(fs.readFileSync(path.join(ASSETS,f)))]));}
// Runs in the page: outerHTML of body (id/class/style/text and all other attributes) with the #scene canvas size
// attributes dropped and random object ids normalised; computed styles hashed per element.
export async function domSnapshot(page){return page.evaluate(async()=>{
 const ids=new Map();const walk=list=>{for(const o of list||[]){if(o?.id&&!ids.has(o.id))ids.set(o.id,'obj'+ids.size);walk(o.children);walk(o.objects);walk(o.params?.objects);}};walk(window.__cad?.project?.objects);
 const body=document.body.cloneNode(true);const c=body.querySelector('#scene');if(c){c.removeAttribute('width');c.removeAttribute('height');c.removeAttribute('style');}
 // #toast is hidden in captures (as capture.mjs does); its text/hidden state depends on a timer, so it is not compared.
 const tst=body.querySelector('#toast');if(tst){tst.removeAttribute('hidden');tst.removeAttribute('class');tst.textContent='';}
 let html=body.outerHTML;for(const [id,n] of [...ids].sort((a,b)=>b[0].length-a[0].length))html=html.split(id).join('{'+n+'}');
 html=html.replace(/\b[a-z0-9]{6,10}-[a-z0-9]+-[a-z0-9]{5}\b/g,'{uid}');
 const enc=new TextEncoder(),hex=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,16);
 const pathOf=e=>{const p=[];for(;e&&e!==document.body;e=e.parentElement){p.unshift(e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+':'+[...e.parentElement.children].indexOf(e));}return p.join('>');};
 // ADR-0001 approved-dom-areas (box ruling): besides the unchanged combined hash (styles), each element's computed style
 // is split into its non-layout part (split.style) and its box: the rect (split.box) plus the computed values that are
 // layout results (split.layout: width/height/inset/origins). A change of the combined hash with split.style equal is a
 // box change; anything else is a style change. Baselines captured before this have no split.
 const LAYOUT=new Set(['width','height','inline-size','block-size','top','right','bottom','left','inset-block-start','inset-block-end','inset-inline-start','inset-inline-end','transform-origin','perspective-origin']);
 const split={style:{},box:{},layout:{}};
 const styles={};for(const e of document.body.querySelectorAll('*')){if(e.id==='scene')continue;const cs=getComputedStyle(e);let s='';const names=[];for(let i=0;i<cs.length;i++)names.push(cs[i]);names.sort();// custom-property enumeration order is not stable across runs
  let sv='',sl='';for(const k of names){if(k==='display'&&e.id==='toast')continue;const v=k+':'+cs.getPropertyValue(k)+';';s+=v;if(LAYOUT.has(k))sl+=v;else sv+=v;}
  const r=e.getBoundingClientRect(),p=pathOf(e);styles[p]=await hex(s+'|'+[r.x,r.y,r.width,r.height].join(','));
  split.style[p]=await hex(sv);split.box[p]=[r.x,r.y,r.width,r.height];split.layout[p]=await hex(sl);}
 return {html,styles,split};});}
export function compareDom(a,b){const out=[];if(a.html!==b.html){let i=0;while(i<a.html.length&&a.html[i]===b.html[i])i++;out.push(`outerHTML differs at char ${i}: baseline …${a.html.slice(Math.max(0,i-60),i+60)}… now …${b.html.slice(Math.max(0,i-60),i+60)}…`);}
 const keys=new Set([...Object.keys(a.styles),...Object.keys(b.styles)]);let n=0;for(const k of keys)if(a.styles[k]!==b.styles[k]){if(n++<5)out.push('computed style/box differs: '+k);}if(n>5)out.push(`…${n} elements with style differences`);return out;}
function main(){const update=process.argv.includes('--update');fs.mkdirSync(BASE,{recursive:true});
 const st=staticState(),strings=extractStrings(),fS=path.join(BASE,'static.json'),fT=path.join(BASE,'strings-baseline.json');
 if(update){fs.writeFileSync(fS,JSON.stringify(st,null,1)+'\n');fs.writeFileSync(fT,JSON.stringify(strings,null,1)+'\n');console.log('wrote',fS,'and',fT,strings.length,'strings');return;}
 const bs=JSON.parse(fs.readFileSync(fS,'utf8')),bt=new Set(JSON.parse(fs.readFileSync(fT,'utf8'))),now=new Set(strings);let bad=0;
 for(const f of STATIC_FILES)if(bs[f]!==st[f]){const t=versionTokenOnly(f,bs[f]);if(t.ok)console.log(`note: ${f} equals the baseline except the ?v= token (${t.from} → ${t.to}; version-token rule)`);else{bad++;console.error(`FAIL ${f} is not byte-identical to the baseline (${bs[f]} → ${st[f]})${t.why?' ['+t.why+']':''}`);}}
 const c=compareStrings([...bt],strings,APPROVED_ADDITIONS(),APPROVED_REMOVALS(),EXTRACTOR_CORRECTIONS()),approvedSeen=c.approvedSeen;
 for(const e of c.errors){bad++;console.error('FAIL '+e);}
 for(const s of c.stale)console.log('note: listed removal not needed (string still present, or not in this baseline):',JSON.stringify(s));
 for(const s of c.staleCorrections)console.log('note: listed extractor correction not needed (string still extracted, or not in this baseline):',JSON.stringify(s));
 console.log(`strings: ${strings.length} extracted, ${c.errors.length} error(s), ${approvedSeen} approved addition(s) in use, ${c.removedApproved.length} approved removal(s), ${c.corrected.length} extractor correction(s)${c.corrected.length?' ('+c.corrected.map(x=>JSON.stringify(x)).join(', ')+')':''}, ${c.stale.length+c.staleCorrections.length} stale`);
 if(bad){console.error(`dom-baseline: ${bad} difference(s)`);process.exit(1);}console.log(`dom-baseline: static files identical (${STATIC_FILES.join(', ')}), ${strings.length-approvedSeen} baseline strings identical${approvedSeen?`, ${approvedSeen} approved addition(s)`:''}${c.removedApproved.length?`, ${c.removedApproved.length} approved removal(s)`:''}${c.corrected.length?`, ${c.corrected.length} extractor correction(s)`:''}`);}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
