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
// tests/perf/strings-additions.json (plain strings, or the exact text of a runtime entry {text, runtime:true, source,
// approval}); loadDomEntries throws with the offending entry otherwise.
//
// Box and structure (ADR-0001 box ruling). Computed style is compared in two parts (dom-baseline.mjs domSnapshot split):
// the non-layout style and the box (rect + layout results). A STYLE change always fails. A BOX change (style equal) passes
// only (i) on the exact element an attribute/text entry matched in that capture, or (ii) when the element's old and new
// boxes both lie entirely inside an approved pixel area for that scene (the box / overlay / per-scene areas of
// approved-areas.json, measured in the page at capture time). An added element passes only with an "added" entry
// {scene, selector, kind:"added", expected?: its full text, approval} and only when its box and every descendant's box lie
// entirely inside an approved pixel area for that scene. Removed elements always fail. Without split data (a baseline
// captured before the split, with no AVALON_PIXEL_SPLIT_REF), every computed-style/box change fails as before.
//
// Later rulings (ADR-0001, 2:36 AM Oct 18, approved-dom-areas-2):
// - "replaced" {scene, oldSelector, newSelector, approval}: a REMOVED element passes only when it matches oldSelector (in the
//   baseline DOM) and a new element matching newSelector was added under the same parent in that capture (each new element
//   pairs once). The new element still needs its own "added" entry. Without the paired new element the removal fails.
// - A "text" entry may expect "" (its own text emptied); approval is required as for every entry. Other kinds may not.
// - Style: a computed-style change, and an inline style attribute change (the same thing; 'style' is still not an entry
//   kind), passes ONLY on an element an attribute/text entry matched in that capture whose old and new boxes both lie
//   inside an approved pixel area. Unmatched style changes and style changes outside every area fail.
// - Offset: in a container (the parent, never body/html, of an element an entry matched: attribute/text matches, accepted
//   added elements, the new side of replaced pairs), an element whose box moved with the same width/height, the same
//   computed style and the same layout values passes when every moved element in that container moved by the same
//   (dx, dy), whether on screen or scrolled off. Any size, style or layout change, or a non-uniform offset, fails.
import fs from 'node:fs';import path from 'node:path';import {readAdditions,additionTexts} from './dom-baseline.mjs';
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
export function validKind(kind){if(kind==='text'||kind==='added'||kind==='replaced')return null;if(typeof kind!=='string'||!/^[a-z][a-z0-9-]*$/.test(kind))return 'kind must be "text" or an attribute name';if(kind==='style'||kind==='class')return `kind "${kind}" is not approvable`;return null;}
// Strings an entry may expect: the active baseline's strings-baseline.json and tests/perf/strings-additions.json (plain
// strings and runtime texts; the file is validated, so a bad runtime entry fails here too).
export function approvedStrings(base,additionsFile){const s=new Set();const f=path.join(base,'strings-baseline.json');if(fs.existsSync(f))for(const x of JSON.parse(fs.readFileSync(f,'utf8')))s.add(x);
 for(const x of additionTexts(additionsFile?readAdditions(additionsFile):readAdditions()))s.add(x);return s;}
// Validates the "dom" list; throws one Error listing every bad entry.
export function loadDomEntries(list,strings){
 if(list==null)return [];if(!Array.isArray(list))throw Error('approved-areas.json "dom" must be a list');const bad=[];
 list.forEach((e,i)=>{const at=`dom[${i}] ${JSON.stringify(e)}`;
  if(!e||typeof e!=='object'){bad.push(at+': not an object');return;}
  const added=e.kind==='added';
  if(e.kind==='replaced'){// ADR-0001 replaced ruling: {scene, oldSelector, newSelector, approval}, nothing else
   for(const k of ['scene','oldSelector','newSelector','approval'])if(typeof e[k]!=='string'||!e[k])bad.push(`${at}: "${k}" must be a non-empty string`);
   for(const k of ['selector','expected'])if(k in e)bad.push(`${at}: a "replaced" entry takes oldSelector/newSelector, not "${k}"`);
   for(const k of ['oldSelector','newSelector']){const v=validSelector(e[k]);if(v)bad.push(`${at}: invalid ${k}: ${v}`);}return;}
  for(const k of ['scene','selector','kind','approval'])if(typeof e[k]!=='string'||!e[k])bad.push(`${at}: "${k}" must be a non-empty string`);
  if(!added&&typeof e.expected!=='string')bad.push(`${at}: "expected" must be a string`);
  if(added&&e.expected!=null&&typeof e.expected!=='string')bad.push(`${at}: "expected" (optional for added) must be a string`);
  const s=validSelector(e.selector);if(s)bad.push(`${at}: invalid selector: ${s}`);
  const k=validKind(e.kind);if(k)bad.push(`${at}: ${k}`);
  // ADR-0001 empty-text ruling: a text entry may expect "" (the element's own text emptied); approval is required above.
  if(typeof e.expected==='string'&&!(e.kind==='text'&&e.expected==='')&&!strings.has(e.expected))bad.push(`${at}: expected ${JSON.stringify(e.expected)} is not in strings-baseline.json or tests/perf/strings-additions.json`);});
 if(bad.length)throw Error('approved-areas.json dom entries rejected:\n  '+bad.join('\n  '));
 return list.map(e=>e.kind==='replaced'?{scene:e.scene,kind:'replaced',oldSelector:e.oldSelector,newSelector:e.newSelector,approval:e.approval}:({scene:e.scene,selector:e.selector,kind:e.kind,expected:e.expected??null,approval:e.approval}));}
// Runs IN THE PAGE: page.evaluate(domChanges,[base,now,ctx]); base/now = {html,styles,split?} snapshots, ctx = {entries,
// scene, id, areas: [selector...]} (areas are measured in the live page). Parses both bodies, aligns elements (children by
// tag#id, LCS) and lists every change as matched or unmatched.
export function domChanges([base,now,ctx]){
 const {entries,scene,id}=ctx;const sceneOk=e=>e.scene==='*'||e.scene===scene||e.scene===id;
 const parse=h=>new DOMParser().parseFromString('<!doctype html><html>'+h+'</html>','text/html').body;
 const A=parse(base.html),B=parse(now.html),changes=[],pairs=[],addedTop=[],removedTop=[];
 const label=e=>e.tagName.toLowerCase()+(e.id?'#'+e.id:'');
 const pathOf=(e,body)=>{const p=[];for(;e&&e!==body;e=e.parentElement)p.unshift(e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+':'+[...e.parentElement.children].indexOf(e));return p.join('>');};
 const own=e=>[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.data).join('');
 const key=e=>label(e);
 const lcs=(a,b)=>{const n=a.length,m=b.length,L=Array.from({length:n+1},()=>new Int32Array(m+1));
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)L[i][j]=key(a[i])===key(b[j])?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
  const pr=[],da=[],db=[];let i=0,j=0;while(i<n&&j<m){if(key(a[i])===key(b[j])){pr.push([a[i],b[j]]);i++;j++;}else if(L[i+1][j]>=L[i][j+1])da.push(a[i++]);else db.push(b[j++]);}
  while(i<n)da.push(a[i++]);while(j<m)db.push(b[j++]);return {pairs:pr,da,db};};
 const walk=(a,b,p)=>{
  const names=new Set([...a.getAttributeNames(),...b.getAttributeNames()]);
  for(const n of [...names].sort()){const x=a.getAttribute(n),y=b.getAttribute(n);if(x!==y)changes.push({path:p,el:b,kind:n,old:x,now:y});}
  const ta=own(a),tb=own(b);if(ta!==tb)changes.push({path:p,el:b,kind:'text',old:ta,now:tb});
  const r=lcs([...a.children],[...b.children]);
  const sib=r.db;for(const e of r.da)removedTop.push({path:p+'>'+label(e),old:e,siblings:sib});
  for(const e of r.db)addedTop.push({path:p+'>'+label(e),el:e});
  for(const [x,y] of r.pairs){pairs.push([x,y]);walk(x,y,p+'>'+label(y));}};
 walk(A,B,'body');
 // live-page boxes of the approved pixel areas (CSS px); an element box is inside when it lies entirely within one
 const areas=(ctx.areas||[]).map(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom];}).filter(Boolean);
 const EPS=0.01,inside=b=>!!b&&areas.some(([l,t,r,bt])=>b[0]>=l-EPS&&b[1]>=t-EPS&&b[0]+b[2]<=r+EPS&&b[1]+b[3]<=bt+EPS);
 const out={matched:[],unmatched:[]},rec=(c,extra)=>({path:c.path,kind:c.kind,old:c.old,now:c.now,...extra});
 const matchedEls=new Set(),styleAttr=[];
 for(const c of changes){if(c.kind==='style'){styleAttr.push(c);continue;}const v=c.kind==='text'&&typeof c.now==='string'?c.now.trim():c.now;
  const e=c.el&&typeof c.now==='string'?entries.find(e=>e.kind!=='added'&&e.kind!=='replaced'&&sceneOk(e)&&e.kind===c.kind&&e.expected===v&&c.el.matches(e.selector)):null;
  if(e){matchedEls.add(c.el);out.matched.push(rec(c,{approval:e.approval}));}else out.unmatched.push(rec(c));}
 const ns=now.split,bs=base.split,pathA=new Map(),boxA=x=>bs?.box?.[pathOf(x,A)],boxB=x=>ns?.box?.[pathOf(x,B)];
 const pairOf=new Map(pairs.map(([a,b])=>[b,a]));
 // Style ruling: a style change (computed, or the inline style attribute that causes it) passes ONLY on an element an
 // approved attribute/text entry matched whose old and new boxes both lie inside an approved pixel area.
 const styleOk=b=>{const a=pairOf.get(b);return matchedEls.has(b)&&!!a&&inside(boxA(a))&&inside(boxB(b));};
 const styleWhy=b=>!matchedEls.has(b)?'style change on an element no approved entry matched':!(bs?.box&&ns?.box)?'no style/box split data':'style change outside the approved areas';
 for(const c of styleAttr)if(styleOk(c.el))out.matched.push(rec(c,{approval:'style of an element matched by an approved DOM entry, inside an approved pixel area'}));else out.unmatched.push(rec(c,{why:styleWhy(c.el)}));
 // Replaced ruling: a removed element passes only when a "replaced" entry pairs it (old element matches oldSelector in the
 // baseline) with a new element matching newSelector that was added under the same parent in this capture. Each new
 // element pairs once. The new element itself still needs its own "added" entry (below).
 const usedNew=new Set();
 for(const r of removedTop){let hit=null;
  for(const e of entries)if(e.kind==='replaced'&&sceneOk(e)&&r.old.matches(e.oldSelector)){const n=r.siblings.find(x=>!usedNew.has(x)&&x.matches(e.newSelector));if(n){hit={e,n};break;}}
  const c={path:r.path,kind:'element removed',old:label(r.old),now:hit?'replaced by '+label(hit.n):null};
  if(hit){usedNew.add(hit.n);out.matched.push(rec(c,{approval:hit.e.approval}));}
  else out.unmatched.push(rec(c,{why:entries.some(e=>e.kind==='replaced'&&sceneOk(e)&&r.old.matches(e.oldSelector))?'no paired new element (newSelector) added under the same parent':undefined}));}
 // added elements: an "added" entry, and the element's and all descendants' new boxes inside an approved area
 const acceptedAdded=new Set();
 for(const a of addedTop){const sub=[a.el,...a.el.querySelectorAll('*')],boxes=sub.map(x=>ns?.box?.[pathOf(x,B)]);
  const txt=a.el.textContent.trim(),e=entries.find(e=>e.kind==='added'&&sceneOk(e)&&a.el.matches(e.selector)&&(e.expected==null||e.expected===txt));
  const c={path:a.path,kind:'element added',old:null,now:label(a.el)+(txt?' "'+txt.slice(0,60)+'"':'')};
  if(e&&boxes.every(inside)){acceptedAdded.add(a.el);out.matched.push(rec(c,{approval:e.approval}));}
  else out.unmatched.push(rec(c,{why:!e?'no matching "added" entry':'box not entirely inside an approved pixel area'}));}
 // computed style / box of every aligned element pair
 // Offset ruling: containers = parents (never body/html) of the elements approved entries matched (attribute/text matches,
 // accepted added elements, the new side of replaced pairs). An element inside such a container whose box moved with the
 // SAME size, the same computed style and the same layout values passes when every such moved element in that container
 // moved by the same (dx, dy), on screen or scrolled off. Any size, style or layout change, or a non-uniform offset, fails.
 const anchors=[...matchedEls,...acceptedAdded,...usedNew],containers=[...new Set(anchors.map(x=>x.parentElement).filter(x=>x&&x!==B&&x.tagName!=='HTML'))];
 const containerOf=b=>{let best=null;for(const c of containers)if(c!==b&&c.contains(b)&&(!best||best.contains(c)))best=c;return best;};
 const offsets=new Map();
 for(const [a,b] of pairs){const pa=pathOf(a,A),pb=pathOf(b,B),x=base.styles[pa],y=now.styles[pb];if(x===y)continue;
  const c={path:pb,kind:'computed style/box',old:x??null,now:y??null};
  if(!bs?.style||!ns?.style||bs.style[pa]==null||ns.style[pb]==null){out.unmatched.push(rec(c,{why:'no style/box split data'}));continue;}
  if(bs.style[pa]!==ns.style[pb]){const cs={...c,kind:'computed style'};
   if(styleOk(b))out.matched.push(rec(cs,{approval:'style of an element matched by an approved DOM entry, inside an approved pixel area'}));
   else out.unmatched.push(rec(cs,matchedEls.has(b)?{why:styleWhy(b)}:{}));continue;}
  const ob=bs.box[pa],nb=ns.box[pb],cb={...c,kind:'box',old:ob,now:nb};
  if(matchedEls.has(b)){out.matched.push(rec(cb,{approval:'box of an element matched by an approved DOM entry'}));continue;}
  if(inside(ob)&&inside(nb)){out.matched.push(rec(cb,{approval:'box inside an approved pixel area'}));continue;}
  const C=containerOf(b),same=ob&&nb&&Math.abs(ob[2]-nb[2])<=EPS&&Math.abs(ob[3]-nb[3])<=EPS&&bs.layout?.[pa]!=null&&bs.layout[pa]===ns.layout?.[pb];
  if(C&&same){if(!offsets.has(C))offsets.set(C,[]);offsets.get(C).push({cb,d:[nb[0]-ob[0],nb[1]-ob[1]]});continue;}
  out.unmatched.push(rec(cb,{why:C&&ob&&nb&&(Math.abs(ob[2]-nb[2])>EPS||Math.abs(ob[3]-nb[3])>EPS)?'size changed (an offset must keep the size)':C?'layout values changed (an offset must keep them)':'box change outside the approved areas on an unmatched element'}));}
 for(const [C,list] of offsets){const [dx,dy]=list[0].d,uni=list.every(({d})=>Math.abs(d[0]-dx)<=EPS&&Math.abs(d[1]-dy)<=EPS);
  for(const {cb} of list)if(uni)out.matched.push(rec(cb,{approval:`uniform offset (${+dx.toFixed(3)}, ${+dy.toFixed(3)}) in the container of an approved element`}));else out.unmatched.push(rec(cb,{why:'offset not uniform within the container'}));}
 return out;}
export const fmtChange=c=>`${c.kind} at ${c.path}: ${JSON.stringify(c.old)} → ${JSON.stringify(c.now)}${c.why?' ('+c.why+')':''}`.slice(0,300);
// One capture. page = a Playwright page (domChanges runs in it); base/now = snapshots; splitRef = an optional capture of
// the baseline's own build with split data, used only when the baseline snapshot has none and the reference's html and
// combined styles are identical to the baseline's. Returns {matched, unmatched, errors}; errors are the old messages
// (outerHTML line when an HTML-level change is unmatched; 'computed style/box differs: <path>' for unmatched style/box
// changes, first 5 then a count), so with no entries and no areas the result is exactly the old one.
export async function checkCapture(page,{name,id,base,now,entries,areas=[],splitRef=null,compareDom}){
 if(base.html===now.html&&JSON.stringify(base.styles)===JSON.stringify(now.styles))return {matched:[],unmatched:[],errors:[]};
 if(!base.split&&splitRef&&splitRef.split&&splitRef.html===base.html&&JSON.stringify(splitRef.styles)===JSON.stringify(base.styles))base={...base,split:splitRef.split};
 const res=await page.evaluate(domChanges,[{html:base.html,styles:base.styles,split:base.split||null},{html:now.html,styles:now.styles,split:now.split||null},{entries,scene:name,id,areas}]);
 const htmlUn=res.unmatched.filter(c=>!/^(computed style|box)/.test(c.kind)),styleUn=res.unmatched.filter(c=>/^(computed style|box)/.test(c.kind));
 if(base.html!==now.html&&!res.matched.length&&!htmlUn.length&&!res.unmatched.some(c=>c.kind==='element added'))htmlUn.push({path:'body',kind:'outerHTML',old:'(baseline)',now:'differs with no element-level change (attribute order or serialisation)'});
 const unmatched=[...htmlUn,...styleUn],errors=[];
 if(htmlUn.length)errors.push(...compareDom(base,{html:now.html,styles:base.styles}));
 styleUn.slice(0,5).forEach(c=>errors.push('computed style/box differs: '+c.path));if(styleUn.length>5)errors.push(`…${styleUn.length} elements with style differences`);
 return {matched:res.matched,unmatched,errors};}
