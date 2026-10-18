// Perf ADR v2 WS0 / §4.2: DOM, CSS and string invariance against the captured baseline.
//   node tests/perf/dom-baseline.mjs            check static files + string table (exit 1 on any difference)
//   node tests/perf/dom-baseline.mjs --update   regenerate static.json and strings-baseline.json in AVALON_PIXEL_BASELINE
// The per-scene DOM/computed-style snapshots are taken by tests/pixels.mjs through domSnapshot() below.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const HERE=path.dirname(new URL(import.meta.url).pathname);
export const REPO=path.resolve(HERE,'../..');
// Baselines are artifacts outside git (ADR v2 WS0 step 3).
export const BASE=path.resolve(process.env.AVALON_PIXEL_BASELINE||'/workspace/avalon-cad-artifacts/perf-baseline');
export const ASSETS=path.resolve(process.env.AVALON_ASSETS||path.join(REPO,'app/assets'));
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
export function stripComments(src,{line=true}={}){let out='',i=0;const n=src.length,stack=[];let prev='';// last significant token char/word
 const blank=s=>s.replace(/[^\n]/g,' ');const regexOk=()=>prev===''||/[(,=:[!&|?{};+\-*%<>~^]$/.test(prev)||/(?:^|[^\w$])(?:return|typeof|case|in|of|void|delete|new|throw|yield|await|else|do)$/.test(prev);
 while(i<n){const c=src[i],d=src[i+1];
  if(c==='/'&&d==='*'){const j=src.indexOf('*/',i+2),e=j<0?n:j+2;out+=blank(src.slice(i,e));i=e;continue;}
  if(line&&c==='/'&&d==='/'){let e=src.indexOf('\n',i);if(e<0)e=n;out+=blank(src.slice(i,e));i=e;continue;}
  if(!line){out+=c;i++;continue;}// CSS: nothing else to track except strings
  if(c==="'"||c==='"'){let j=i+1;while(j<n&&src[j]!==c&&src[j]!=='\n'){if(src[j]==='\\')j++;j++;}out+=src.slice(i,j+1);i=j+1;prev='a';continue;}
  if(c==='`'||(c==='}'&&stack.length&&stack.at(-1)===0)){// template literal body (start, or resume after ${ … })
   if(c==='}')stack.pop();let j=i+1,interp=false;while(j<n&&src[j]!=='`'){if(src[j]==='\\'){j+=2;continue;}if(src[j]==='$'&&src[j+1]==='{'){j+=2;stack.push(0);interp=true;break;}j++;}
   if(interp){out+=src.slice(i,j);i=j;prev='{';}else{out+=src.slice(i,j+1);i=j+1;prev='a';}continue;}
  if(c==='{'&&stack.length){stack[stack.length-1]++;}else if(c==='}'&&stack.length){stack[stack.length-1]--;}
  if(c==='/'&&regexOk()){let j=i+1,cls=false;while(j<n&&src[j]!=='\n'){if(src[j]==='\\'){j+=2;continue;}if(src[j]==='[')cls=true;else if(src[j]===']')cls=false;else if(src[j]==='/'&&!cls)break;j++;}
   if(src[j]==='/'){j++;while(j<n&&/[a-z]/.test(src[j]))j++;out+=src.slice(i,j);i=j;prev='a';continue;}}
  out+=c;i++;if(!/\s/.test(c))prev=/[\w$]/.test(c)?(/[\w$]$/.test(prev)?prev+c:c).slice(-8):c;}
 return out;}
export function extractStrings(){const set=new Set();
 for(const f of STRING_SOURCES()){const raw=fs.readFileSync(path.join(REPO,f),'utf8');
  // ADR-0001 approved-dom-areas (b): // and /* */ comments are not UI text. JS sources (.mjs/.cjs) lose both, CSS loses
  // /* */; Python and HTML are read as before (// is floor division in Python).
  const src=/\.(mjs|cjs|js)$/.test(f)?stripComments(raw):f.endsWith('.css')?stripComments(raw,{line:false}):raw;
  if(f.endsWith('.html')){for(const m of src.matchAll(/>([^<>]*[A-Za-z][^<>]*)</g))set.add(m[1].trim());for(const m of src.matchAll(/(?:title|aria-label|placeholder)="([^"]+)"/g))set.add(m[1]);continue;}
  for(const m of src.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)){const s=(m[1]??m[2]??m[3]);if(s.length>1&&!/[=(){};<>\[\]`$\\]/.test(s)&&!/^\.{0,2}\/|\.(m?js|cjs|wasm|py)$/.test(s)&&/[A-Za-z]/.test(s)&&/[ .!?…:·]|^[A-Z][a-z]+$/.test(s))set.add(s);}}
 return [...set].filter(Boolean).sort();}
// ADR new-primitives-polyhedra-text §5.12: the string table may differ from the baseline only by the additions listed
// in tests/perf/strings-additions.json (each one approved with the feature); a baseline string may never be removed
// or edited, and any other new string still fails.
export const APPROVED_ADDITIONS=()=>{const f=path.join(HERE,'strings-additions.json');return fs.existsSync(f)?new Set(JSON.parse(fs.readFileSync(f,'utf8')).strings):new Set();};
// ADR-0001 approved-dom-areas (a): strings-additions.json may also list approved removals, "removals": [{string, approval}].
// A baseline string missing from the build passes only if it is listed there (exact string); unlisted removals fail.
// Like additions, an entry is dropped when the baseline rolls forward without that string.
export const APPROVED_REMOVALS=(f=path.join(HERE,'strings-additions.json'))=>fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')).removals||[]:[];
// Pure comparison of a baseline string list with the extracted one (testable): returns the failures and the counts.
export function compareStrings(baseline,strings,approved,removals){const bt=new Set(baseline),now=new Set(strings),errors=[];
 if(!Array.isArray(removals))errors.push('strings-additions.json "removals" must be a list');
 const ok=new Map();for(const [i,r] of (Array.isArray(removals)?removals:[]).entries()){if(!r||typeof r.string!=='string'||!r.string||typeof r.approval!=='string'||!r.approval)errors.push(`removals[${i}] ${JSON.stringify(r)}: needs a non-empty "string" and "approval"`);else ok.set(r.string,r.approval);}
 const added=strings.filter(s=>!bt.has(s)&&!approved.has(s)),missing=[...bt].filter(s=>!now.has(s)),removed=missing.filter(s=>!ok.has(s)),removedApproved=missing.filter(s=>ok.has(s));
 const stale=[...ok.keys()].filter(s=>!bt.has(s)||now.has(s));
 for(const s of added)errors.push('new/changed user-visible string: '+JSON.stringify(s));
 for(const s of removed)errors.push('string missing vs baseline: '+JSON.stringify(s));
 return {errors,added,removed,removedApproved,stale,approvedSeen:strings.filter(s=>!bt.has(s)&&approved.has(s)).length};}
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
 const styles={};for(const e of document.body.querySelectorAll('*')){if(e.id==='scene')continue;const cs=getComputedStyle(e);let s='';const names=[];for(let i=0;i<cs.length;i++)names.push(cs[i]);names.sort();// custom-property enumeration order is not stable across runs
  for(const k of names){if(k==='display'&&e.id==='toast')continue;s+=k+':'+cs.getPropertyValue(k)+';';}
  const r=e.getBoundingClientRect();styles[pathOf(e)]=await hex(s+'|'+[r.x,r.y,r.width,r.height].join(','));}
 return {html,styles};});}
export function compareDom(a,b){const out=[];if(a.html!==b.html){let i=0;while(i<a.html.length&&a.html[i]===b.html[i])i++;out.push(`outerHTML differs at char ${i}: baseline …${a.html.slice(Math.max(0,i-60),i+60)}… now …${b.html.slice(Math.max(0,i-60),i+60)}…`);}
 const keys=new Set([...Object.keys(a.styles),...Object.keys(b.styles)]);let n=0;for(const k of keys)if(a.styles[k]!==b.styles[k]){if(n++<5)out.push('computed style/box differs: '+k);}if(n>5)out.push(`…${n} elements with style differences`);return out;}
function main(){const update=process.argv.includes('--update');fs.mkdirSync(BASE,{recursive:true});
 const st=staticState(),strings=extractStrings(),fS=path.join(BASE,'static.json'),fT=path.join(BASE,'strings-baseline.json');
 if(update){fs.writeFileSync(fS,JSON.stringify(st,null,1)+'\n');fs.writeFileSync(fT,JSON.stringify(strings,null,1)+'\n');console.log('wrote',fS,'and',fT,strings.length,'strings');return;}
 const bs=JSON.parse(fs.readFileSync(fS,'utf8')),bt=new Set(JSON.parse(fs.readFileSync(fT,'utf8'))),now=new Set(strings);let bad=0;
 for(const f of STATIC_FILES)if(bs[f]!==st[f]){bad++;console.error(`FAIL ${f} is not byte-identical to the baseline (${bs[f]} → ${st[f]})`);}
 const c=compareStrings([...bt],strings,APPROVED_ADDITIONS(),APPROVED_REMOVALS()),approvedSeen=c.approvedSeen;
 for(const e of c.errors){bad++;console.error('FAIL '+e);}
 for(const s of c.stale)console.log('note: listed removal not needed (string still present, or not in this baseline):',JSON.stringify(s));
 if(bad){console.error(`dom-baseline: ${bad} difference(s)`);process.exit(1);}console.log(`dom-baseline: static files identical (${STATIC_FILES.join(', ')}), ${strings.length-approvedSeen} baseline strings identical${approvedSeen?`, ${approvedSeen} approved addition(s)`:''}${c.removedApproved.length?`, ${c.removedApproved.length} approved removal(s)`:''}`);}
if(process.argv[1]&&path.resolve(process.argv[1])===new URL(import.meta.url).pathname)main();
