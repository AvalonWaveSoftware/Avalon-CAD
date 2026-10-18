// ADR-0001 approved-dom-areas: approved DOM changes for tests/pixels.mjs (compare only, never with --update).
// tests/perf/approved-areas.json may carry a "dom" list of entries
//   {scene: <scene name, capture id or '*'>, selector: <CSS selector>, kind: <attribute name | 'text'>,
//    expected: <exact new value>, approval: <commit / ruling ref>}
// A DOM change in a capture passes only when an entry matches it: the scene matches, the changed element (in the new
// capture) matches the selector, the change is of the same kind, and the new value === expected. Every other DOM change
// fails: added/removed/retagged elements, removed attributes, aria-label/role changes without their own entry, and every
// computed-style/box change (a style hash is never an approvable string). Entries are for in-flight, unmerged changes
// only: an entry is removed when its change merges and the baseline rolls forward.
//
// Selector validity rule (checked at load, see validSelector): a selector is a single complex selector (no ',' list)
// made of compound selectors joined by descendant (' ') or child ('>') combinators. Each compound is an optional tag
// name followed by #id, .class and [attr="value"] / [attr=value] parts only. The LAST compound (the element the entry
// approves) must contain at least one #id, .class or [attr=value] part. Rejected: '*', any pseudo-class or
// pseudo-element (':not', ':is', ':where', ':has', '::before', ...), '+'/'~' combinators, attribute presence or partial
// matches ([title], [title^=…], [title*=…], [title~=…], [title|=…], [title$=…], ' i' flags), and bare tag selectors such
// as 'body', 'html', 'div' or 'main button'. kind is 'text' (the element's own direct text nodes joined; the new text, trimmed, must equal expected) or an attribute name
// ([a-z][a-z0-9-]*); 'style' and 'class' are rejected (layout state, not approvable strings).
//
// expected must be exactly a string in the active baseline's strings-baseline.json (AVALON_PIXEL_BASELINE) or in
// tests/perf/strings-additions.json; loadDomEntries throws with the offending entry otherwise.
import fs from 'node:fs';import path from 'node:path';
const IDENT='-?[_a-zA-Z][_a-zA-Z0-9-]*',VAL=`(?:"[^"\\\\]*"|'[^'\\\\]*'|${IDENT})`;
const PART=new RegExp(`^(?:#${IDENT}|\\.${IDENT}|\\[${IDENT}=${VAL}\\])`),TAG=new RegExp(`^[a-z][a-z0-9-]*`);
// Returns null when valid, else the reason.
export function validSelector(sel){
 if(typeof sel!=='string'||!sel.trim())return 'empty selector';
 if(sel.includes(','))return 'selector lists (",") are not allowed';
 if(/\*/.test(sel))return "'*' is not allowed";
 if(/::?[a-zA-Z]/.test(sel.replace(/"[^"]*"|'[^']*'/g,'')))return 'pseudo-classes and pseudo-elements are not allowed';
 if(/[+~]/.test(sel.replace(/"[^"]*"|'[^']*'/g,'')))return "'+' and '~' combinators are not allowed";
 // split into compounds on ' ' / '>' outside [...] and quotes
 const compounds=[];let cur='',q=null,br=0,comb=false;
 for(const ch of sel.trim()){if(q){cur+=ch;if(ch===q)q=null;continue;}if(ch==='"'||ch==="'"){q=ch;cur+=ch;continue;}
  if(ch==='[')br++;if(ch===']')br--;
  if(!br&&(ch===' '||ch==='>')){if(cur){compounds.push(cur);cur='';}if(ch==='>'){if(comb||!compounds.length)return 'dangling combinator';comb=true;}continue;}
  comb=false;cur+=ch;}
 if(q||br)return 'unbalanced quotes or brackets';if(comb||!cur)return 'dangling combinator';compounds.push(cur);let last=null;
 for(const c of compounds){if(!c)return 'dangling combinator';let s=c,tag=null,parts=0;const t=s.match(TAG);if(t){tag=t[0];s=s.slice(tag.length);}
  while(s){const m=s.match(PART);if(!m)return `unsupported selector part "${s}" in "${c}" (allowed: tag, #id, .class, [attr="value"])`;parts++;s=s.slice(m[0].length);}
  if(!tag&&!parts)return `empty compound in "${sel}"`;last={tag,parts};}
 if(!last.parts)return `the last compound "${compounds.at(-1)}" needs an #id, .class or [attr="value"] (bare tag selectors match broadly)`;
 return null;}
export function validKind(kind){if(kind==='text')return null;if(typeof kind!=='string'||!/^[a-z][a-z0-9-]*$/.test(kind))return 'kind must be "text" or an attribute name';if(kind==='style'||kind==='class')return `kind "${kind}" is not approvable`;return null;}
// Strings an entry may expect: the active baseline's strings-baseline.json and tests/perf/strings-additions.json.
export function approvedStrings(base,additionsFile=path.join(path.dirname(new URL(import.meta.url).pathname),'strings-additions.json')){
 const s=new Set();const f=path.join(base,'strings-baseline.json');if(fs.existsSync(f))for(const x of JSON.parse(fs.readFileSync(f,'utf8')))s.add(x);
 if(fs.existsSync(additionsFile))for(const x of JSON.parse(fs.readFileSync(additionsFile,'utf8')).strings)s.add(x);return s;}
// Validates the "dom" list; throws one Error listing every bad entry.
export function loadDomEntries(list,strings){
 if(list==null)return [];if(!Array.isArray(list))throw Error('approved-areas.json "dom" must be a list');const bad=[];
 list.forEach((e,i)=>{const at=`dom[${i}] ${JSON.stringify(e)}`;
  if(!e||typeof e!=='object'){bad.push(at+': not an object');return;}
  for(const k of ['scene','selector','kind','expected','approval'])if(typeof e[k]!=='string'||(!e[k]&&k!=='expected'))bad.push(`${at}: "${k}" must be a non-empty string`);
  const s=validSelector(e.selector);if(s)bad.push(`${at}: invalid selector: ${s}`);
  const k=validKind(e.kind);if(k)bad.push(`${at}: ${k}`);
  if(typeof e.expected==='string'&&!strings.has(e.expected))bad.push(`${at}: expected ${JSON.stringify(e.expected)} is not in strings-baseline.json or tests/perf/strings-additions.json`);});
 if(bad.length)throw Error('approved-areas.json dom entries rejected:\n  '+bad.join('\n  '));
 return list.map(e=>({scene:e.scene,selector:e.selector,kind:e.kind,expected:e.expected,approval:e.approval}));}
// Runs IN THE PAGE (page.evaluate(domChanges,[baseHtml,nowHtml,entries,scene,id])): parses both body snapshots, aligns
// elements (children by tag#id, LCS), and lists every change with its element path; each change is matched or unmatched.
export function domChanges([baseHtml,nowHtml,entries,scene,id]){
 const parse=h=>new DOMParser().parseFromString('<!doctype html><html>'+h+'</html>','text/html').body;
 const A=parse(baseHtml),B=parse(nowHtml),changes=[];
 const label=e=>e.tagName.toLowerCase()+(e.id?'#'+e.id:'');
 const own=e=>[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.data).join('');// raw: any whitespace change is a change too
 const key=e=>label(e);
 const lcs=(a,b)=>{const n=a.length,m=b.length,L=Array.from({length:n+1},()=>new Int32Array(m+1));
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)L[i][j]=key(a[i])===key(b[j])?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
  const pairs=[],da=[],db=[];let i=0,j=0;while(i<n&&j<m){if(key(a[i])===key(b[j])){pairs.push([a[i],b[j]]);i++;j++;}else if(L[i+1][j]>=L[i][j+1])da.push(a[i++]);else db.push(b[j++]);}
  while(i<n)da.push(a[i++]);while(j<m)db.push(b[j++]);return {pairs,da,db};};
 const walk=(a,b,p)=>{
  const names=new Set([...a.getAttributeNames(),...b.getAttributeNames()]);
  for(const n of [...names].sort()){const x=a.getAttribute(n),y=b.getAttribute(n);if(x!==y)changes.push({path:p,el:b,kind:n,old:x,now:y});}
  const ta=own(a),tb=own(b);if(ta!==tb)changes.push({path:p,el:b,kind:'text',old:ta,now:tb});
  const {pairs,da,db}=lcs([...a.children],[...b.children]);
  for(const e of da)changes.push({path:p+'>'+label(e),el:null,kind:'element removed',old:label(e),now:null});
  for(const e of db)changes.push({path:p+'>'+label(e),el:null,kind:'element added',old:null,now:label(e)});
  for(const [x,y] of pairs)walk(x,y,p+'>'+label(y));};
 walk(A,B,'body');
 const out={matched:[],unmatched:[]};
 for(const c of changes){const e=c.el&&typeof c.now==='string'?entries.find(e=>(e.scene==='*'||e.scene===scene||e.scene===id)&&e.kind===c.kind&&e.expected===(c.kind==='text'?c.now.trim():c.now)&&c.el.matches(e.selector)):null;
  const rec={path:c.path,kind:c.kind,old:c.old,now:c.now};if(e){rec.approval=e.approval;out.matched.push(rec);}else out.unmatched.push(rec);}
 return out;}
// Node side: computed-style/box changes (never approvable) as unmatched changes.
export function styleChanges(a,b){const out=[];for(const k of new Set([...Object.keys(a.styles),...Object.keys(b.styles)]))if(a.styles[k]!==b.styles[k])out.push({path:k,kind:'computed style/box',old:a.styles[k]??null,now:b.styles[k]??null});return out;}
export const fmtChange=c=>`${c.kind} at ${c.path}: ${JSON.stringify(c.old)} → ${JSON.stringify(c.now)}`.slice(0,300);
// One capture: page = a Playwright page (domChanges runs in it), base/now = {html,styles} snapshots, compareDom = the
// old message builder. Returns {matched:[…], unmatched:[…], errors:[…]}; errors is empty exactly when nothing is unmatched,
// and with no entries it fails exactly the captures the old check failed, with the same messages.
export async function checkCapture(page,{name,id,base,now,entries,compareDom}){
 const st=styleChanges(base,now);
 const res=base.html===now.html?{matched:[],unmatched:[]}:await page.evaluate(domChanges,[base.html,now.html,entries,name,id]);
 if(base.html!==now.html&&!res.matched.length&&!res.unmatched.length)res.unmatched.push({path:'body',kind:'outerHTML',old:'(baseline)',now:'differs with no element-level change (attribute order or serialisation)'});
 const unmatched=[...res.unmatched,...st];
 const errors=unmatched.length?compareDom(base,now).filter(e=>res.unmatched.length||!e.startsWith('outerHTML differs')):[];
 return {matched:res.matched,unmatched,errors};}
