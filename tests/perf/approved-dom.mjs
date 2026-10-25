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
//
// Hidden ruling (ADR-0001, 3:02 AM Oct 18, option b): non-rendered containers. An entry with hidden:true and regionFrom
// applies to ONE capture (scene = capture id) and only when the changed element's container renders nothing there: an
// ancestor is 0×0 (display:none gives 0×0) in BOTH captures (the container is the outermost such ancestor), and the element
// itself (for added/removed elements, its whole subtree) is 0×0 too. Kinds: as visible entries (attribute, text, added,
// replaced); an added element needs no area under this rule. Style: a style change passes under the hidden rule only on
// an element a HIDDEN attribute/text entry matched in that capture. Each hidden match then needs 0 differing px (not
// excused by any approved area; ruling (a) on 4f9392c: except px inside another approved area of the same capture) in the container's region = the container's box (same path) in the BASELINE snapshot of
// regionFrom; when that cannot be determined the matches fail with an error. At load (loadDomEntries) a hidden entry must
// have a visible twin (same kind, selector/expected or oldSelector/newSelector) with the SAME approval whose scene covers
// regionFrom. No cross-scene inference: every capture needs its own entries.
//
// Zero-size ruling (ADR-0001, 3:46 AM Oct 18; QA N1/N2, #qaAdd): a zero-size (0×0) element box NEVER counts as inside a
// visible approved area, whatever point it sits at. It applies to every containment check: box changes (old and new box),
// added elements and all their descendants (so the new side of a replaced pair, which needs its own "added" entry), style
// changes on matched elements (old and new box), and the uniform offset (a 0×0 element never passes as an offset, as it has
// no visible area to move). Such an element passes only through a hidden:true entry under the hidden rule, or fails.
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
// Reserved-slot ruling (Architect 2026-10-25, F1e measure): {scene, selector:'#id', kind:'unreserved', approval} approves
// exactly the W0 reserved-slot markers coming off that one element when its feature goes live: class "pending" -> "",
// data-pending removed, aria-hidden "true" removed, tabindex "-1" removed, data-mode added (a lowercase mode name,
// only for the mode-bar slots, and only the exact name(s) the entry lists in "modes": an entry with no "modes" allows
// no data-mode at all, QA M3). Nothing else: its title/aria-label/children need their own entries, its pixels need an
// approved area.
// Style (QA M2): an unreserved match does NOT open the general style ruling for that element. On an element any
// unreserved entry matched (even when a title/aria-label entry matched it too):
//  - an inline style attribute change fails;
//  - a computed-style change passes ONLY when it follows from the allowed marker changes: checkCapture puts the matched
//    marker changes back on the LIVE element (class "pending", aria-hidden "true", tabindex "-1", data-pending, data-mode
//    removed), recomputes the element's non-layout computed-style hash exactly as dom-baseline.mjs does, restores the
//    element, and passes the change only when that hash equals the baseline's. In the app the only rule involved is
//    .pending{visibility:hidden;pointer-events:none}, so in practice exactly visibility and pointer-events may change;
//  - a box-only change (same computed style) passes only when the old and new boxes lie inside an approved pixel area.
export function validKind(kind){if(kind==='text'||kind==='added'||kind==='replaced'||kind==='unreserved')return null;if(typeof kind!=='string'||!/^[a-z][a-z0-9-]*$/.test(kind))return 'kind must be "text" or an attribute name';if(kind==='style'||kind==='class')return `kind "${kind}" is not approvable`;return null;}
// Strings an entry may expect: the active baseline's strings-baseline.json and tests/perf/strings-additions.json (plain
// strings and runtime texts; the file is validated, so a bad runtime entry fails here too).
export function approvedStrings(base,additionsFile,repo){const s=new Set();const f=path.join(base,'strings-baseline.json');if(fs.existsSync(f))for(const x of JSON.parse(fs.readFileSync(f,'utf8')))s.add(x);
 for(const x of additionTexts(additionsFile?readAdditions(additionsFile,repo):readAdditions()))s.add(x);return s;}
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
  if(e.kind==='unreserved'){if('expected' in e)bad.push(`${at}: an "unreserved" entry takes no "expected"`);if(!/^#[A-Za-z][\w-]*$/.test(e.selector||''))bad.push(`${at}: an "unreserved" selector must be one #id`);if(e.hidden)bad.push(`${at}: "unreserved" cannot be hidden`);if('modes' in e&&!(Array.isArray(e.modes)&&e.modes.length&&e.modes.every(m=>typeof m==='string'&&/^[a-z]+$/.test(m))))bad.push(`${at}: "modes" must be a non-empty list of lowercase mode names`);}
  else if('modes' in e)bad.push(`${at}: only an "unreserved" entry takes "modes"`);
  else if(!added&&typeof e.expected!=='string')bad.push(`${at}: "expected" must be a string`);
  if(added&&e.expected!=null&&typeof e.expected!=='string')bad.push(`${at}: "expected" (optional for added) must be a string`);
  const s=validSelector(e.selector);if(s)bad.push(`${at}: invalid selector: ${s}`);
  const k=validKind(e.kind);if(k)bad.push(`${at}: ${k}`);
  // ADR-0001 empty-text ruling: a text entry may expect "" (the element's own text emptied); approval is required above.
  if(typeof e.expected==='string'&&!(e.kind==='text'&&e.expected==='')&&!strings.has(e.expected))bad.push(`${at}: expected ${JSON.stringify(e.expected)} is not in strings-baseline.json or tests/perf/strings-additions.json`);});
 // Hidden ruling (ADR-0001 3:02 AM, option b): {…, hidden:true, regionFrom:<capture id>} is an explicit entry for ONE
 // capture whose changed element sits in a container that renders nothing there. scene must be a capture id
 // (name@desktop|name@phone), never '*' or a bare scene; regionFrom a different capture id on the same device; and a
 // visible entry (no hidden) must exist with the same kind, the same selector/expected (or oldSelector/newSelector),
 // the SAME approval, and a scene covering regionFrom (the visible scene the region is taken from).
 const twinKey=e=>e.kind==='replaced'?JSON.stringify(['replaced',e.oldSelector,e.newSelector]):JSON.stringify([e.kind,e.selector,e.expected??null]);
 const capId=/^[a-z0-9][a-z0-9.-]*@(desktop|phone)$/;
 list.forEach((e,i)=>{if(!e||typeof e!=='object')return;const at=`dom[${i}] ${JSON.stringify(e)}`;
  if('hidden' in e&&e.hidden!==true)bad.push(`${at}: "hidden" must be true when present`);
  if('regionFrom' in e&&e.hidden!==true)bad.push(`${at}: "regionFrom" is only for hidden entries`);
  if(e.hidden!==true)return;
  if(typeof e.scene!=='string'||!capId.test(e.scene)){bad.push(`${at}: a hidden entry's scene must be one capture id (name@desktop or name@phone), not "*" or a bare scene`);return;}
  if(typeof e.regionFrom!=='string'||!capId.test(e.regionFrom)){bad.push(`${at}: a hidden entry needs "regionFrom", the capture id of a visible scene to take the container region from`);return;}
  if(e.regionFrom===e.scene||e.regionFrom.split('@')[1]!==e.scene.split('@')[1])bad.push(`${at}: regionFrom must be another capture on the same device (${e.scene.split('@')[1]})`);
  const covers=v=>v.scene==='*'||v.scene===e.regionFrom||v.scene===e.regionFrom.split('@')[0];
  const twins=list.filter(v=>v&&v!==e&&v.hidden!==true&&twinKey(v)===twinKey(e)&&covers(v));
  if(!twins.length)bad.push(`${at}: no visible entry with the same kind and selector${e.kind==='replaced'?'s':'/expected'} whose scene covers regionFrom ${e.regionFrom}`);
  else if(!twins.some(v=>v.approval===e.approval))bad.push(`${at}: approval must equal the visible entry's approval (${twins.map(v=>JSON.stringify(v.approval)).join(' or ')})`);});
 if(bad.length)throw Error('approved-areas.json dom entries rejected:\n  '+bad.join('\n  '));
 const hid=e=>e.hidden===true?{hidden:true,regionFrom:e.regionFrom}:{};
 return list.map(e=>e.kind==='replaced'?{scene:e.scene,kind:'replaced',oldSelector:e.oldSelector,newSelector:e.newSelector,approval:e.approval,...hid(e)}:({scene:e.scene,selector:e.selector,kind:e.kind,expected:e.expected??null,approval:e.approval,...(Array.isArray(e.modes)?{modes:[...e.modes]}:{}),...hid(e)}));}
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
 // an area with no size (hidden or display:none, e.g. a closed sheet) approves nothing
 const areas=(ctx.areas||[]).map(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return r.width>0&&r.height>0?[r.left,r.top,r.right,r.bottom]:null;}).filter(Boolean);
 const EPS=0.01,zero=b=>!!b&&Math.abs(b[2])<=EPS&&Math.abs(b[3])<=EPS,inside=b=>!!b&&!zero(b)&&areas.some(([l,t,r,bt])=>b[0]>=l-EPS&&b[1]>=t-EPS&&b[0]+b[2]<=r+EPS&&b[1]+b[3]<=bt+EPS);
 const out={matched:[],unmatched:[]},rec=(c,extra)=>({path:c.path,kind:c.kind,old:c.old,now:c.now,...extra});
 const ns=now.split,bs=base.split,boxA=x=>bs?.box?.[pathOf(x,A)],boxB=x=>ns?.box?.[pathOf(x,B)];
 const pairOf=new Map(pairs.map(([a,b])=>[b,a])),pairOfA=new Map(pairs.map(([a,b])=>[a,b]));
 // Hidden ruling: an element is in a non-rendered container when an ANCESTOR is 0×0 (display:none gives 0×0 too) in BOTH
 // captures; the container is the outermost such ancestor. The element itself (and, for added/removed elements, every
 // descendant) must be 0×0 as well, so nothing of it is drawn. Needs split data on both sides; returns the container's path
 // in the new capture, or null.
  const rootB=b=>{let root=null;for(let x=b.parentElement;x&&x!==B;x=x.parentElement){const a=pairOf.get(x);if(a&&zero(boxB(x))&&zero(boxA(a)))root=x;}return root&&pathOf(root,B);};
 const rootA=a=>{let root=null;for(let y=a.parentElement;y&&y!==A;y=y.parentElement){const x=pairOfA.get(y);if(x&&zero(boxA(y))&&zero(boxB(x)))root=x;}return root&&pathOf(root,B);};
 const subZeroB=el=>[el,...el.querySelectorAll('*')].every(x=>zero(boxB(x))),subZeroA=el=>[el,...el.querySelectorAll('*')].every(x=>zero(boxA(x)));
 const hidPaired=b=>{const a=pairOf.get(b);return a&&zero(boxB(b))&&zero(boxA(a))?rootB(b):null;};
 const hidRec=(e,container)=>({approval:e.approval,hidden:{container,regionFrom:e.regionFrom}});
 const ZERO_WHY='zero-size (0×0) element: never inside a visible area; only a hidden entry can approve it';
const HIDDEN_WHY='hidden entry, but the container is rendered (no ancestor is 0×0 in both captures, or the element itself is drawn)';
 const matchedEls=new Set(),hiddenMatched=new Map(),styleAttr=[],unres=new Map();out.unreservedStyle=[];
 for(const c of changes){if(c.kind==='style'){styleAttr.push(c);continue;}
  {const u=c.el&&entries.find(e=>e.kind==='unreserved'&&sceneOk(e)&&c.el.matches(e.selector)&&((c.kind==='class'&&c.old==='pending'&&c.now==='')||(c.kind==='data-pending'&&typeof c.old==='string'&&c.now===null)||(c.kind==='aria-hidden'&&c.old==='true'&&c.now===null)||(c.kind==='tabindex'&&c.old==='-1'&&c.now===null)||(c.kind==='data-mode'&&c.old===null&&typeof c.now==='string'&&Array.isArray(e.modes)&&e.modes.includes(c.now))));if(u){unres.has(c.el)||unres.set(c.el,{selector:u.selector,approval:u.approval,reverts:[]});unres.get(c.el).reverts.push([c.kind,c.old]);out.matched.push(rec(c,{approval:u.approval}));continue;}}const v=c.kind==='text'&&typeof c.now==='string'?c.now.trim():c.now;
  const fits=e=>e.kind!=='added'&&e.kind!=='replaced'&&sceneOk(e)&&e.kind===c.kind&&e.expected===v&&c.el.matches(e.selector);
  const he=c.el&&typeof c.now==='string'?entries.find(e=>e.hidden&&fits(e)):null,hc=he&&hidPaired(c.el);
  if(he&&hc){matchedEls.add(c.el);hiddenMatched.set(c.el,he);out.matched.push(rec(c,hidRec(he,hc)));continue;}
  const e=c.el&&typeof c.now==='string'?entries.find(e=>!e.hidden&&fits(e)):null;
  if(e){matchedEls.add(c.el);out.matched.push(rec(c,{approval:e.approval}));}else out.unmatched.push(rec(c,he?{why:HIDDEN_WHY}:{}));}
 // Style ruling: a style change (computed, or the inline style attribute that causes it) passes ONLY on an element an
 // approved attribute/text entry matched whose old and new boxes both lie inside an approved pixel area.
 // Hidden style (kept tight): a style change on a hidden element passes only when THAT element was matched by a hidden
 // attribute/text entry in this capture, and it and its container are 0×0 in both captures; the region pixel check then
 // applies to it like to every hidden match. A visible entry's match never approves a style change in a hidden container.
 const styleOk=b=>{const a=pairOf.get(b);return matchedEls.has(b)&&!hiddenMatched.has(b)&&!!a&&inside(boxA(a))&&inside(boxB(b));};
 const styleHidden=b=>hiddenMatched.has(b)?hidPaired(b):null;
 const styleMatch=(c,b,extra)=>{if(styleOk(b)){out.matched.push(rec(c,{approval:'style of an element matched by an approved DOM entry, inside an approved pixel area'}));return true;}
  const h=styleHidden(b);if(h){const e=hiddenMatched.get(b);out.matched.push(rec(c,{approval:'style of an element matched by a hidden entry ('+e.approval+'), in a non-rendered container',hidden:{container:h,regionFrom:e.regionFrom}}));return true;}return false;};
 const styleWhy=b=>!matchedEls.has(b)?'style change on an element no approved entry matched':!(bs?.box&&ns?.box)?'no style/box split data':(zero(boxA(pairOf.get(b)))||zero(boxB(b)))?ZERO_WHY:'style change outside the approved areas';
 for(const c of styleAttr){if(unres.has(c.el)){out.unmatched.push(rec(c,{why:'inline style change on an unreserved element (not one of the allowed marker changes)'}));continue;}if(!styleMatch(c,c.el))out.unmatched.push(rec(c,{why:styleWhy(c.el)}));}
 // Replaced ruling: a removed element passes only when a "replaced" entry pairs it (old element matches oldSelector in the
 // baseline) with a new element matching newSelector that was added under the same parent in this capture. Each new
 // element pairs once. The new element itself still needs its own "added" entry (below).
 const usedNew=new Set();
 for(const r of removedTop){let hit=null,hidFail=false;
  const find=hidden=>{for(const e of entries)if(e.kind==='replaced'&&!!e.hidden===hidden&&sceneOk(e)&&r.old.matches(e.oldSelector)){const n=r.siblings.find(x=>!usedNew.has(x)&&x.matches(e.newSelector));if(n)return {e,n};}return null;};
  const hh=find(true);if(hh){const root=subZeroA(r.old)&&subZeroB(hh.n)?rootA(r.old):null;if(root)hit={...hh,hidden:root};else hidFail=true;}
  if(!hit)hit=find(false);
  const c={path:r.path,kind:'element removed',old:label(r.old),now:hit?'replaced by '+label(hit.n):null};
  if(hit){usedNew.add(hit.n);out.matched.push(rec(c,hit.hidden?hidRec(hit.e,hit.hidden):{approval:hit.e.approval}));}
  else out.unmatched.push(rec(c,{why:hidFail?HIDDEN_WHY:entries.some(e=>e.kind==='replaced'&&sceneOk(e)&&r.old.matches(e.oldSelector))?'no paired new element (newSelector) added under the same parent':undefined}));}
 // added elements: an "added" entry, and the element's and all descendants' new boxes inside an approved area
 const acceptedAdded=new Set();
 // export-3mf (2026-10-24, needs Architect ack): <option>/<optgroup> inside an added <select> have no layout box (0×0 in
 // every capture; the select draws them). They are covered by the select's own box, which must still lie inside an area.
 for(const a of addedTop){const sub=[a.el,...a.el.querySelectorAll('*')].filter(x=>!(/^(OPTION|OPTGROUP)$/.test(x.tagName)&&x.closest('select')&&(a.el===x.closest('select')||a.el.contains(x.closest('select'))))),boxes=sub.map(x=>ns?.box?.[pathOf(x,B)]);
  const txt=a.el.textContent.trim(),fits=e=>e.kind==='added'&&sceneOk(e)&&a.el.matches(e.selector)&&(e.expected==null||e.expected===txt);
  const c={path:a.path,kind:'element added',old:null,now:label(a.el)+(txt?' "'+txt.slice(0,60)+'"':'')};
  const he=entries.find(e=>e.hidden&&fits(e)),hc=he&&subZeroB(a.el)?rootB(a.el):null;
  if(he&&hc){acceptedAdded.add(a.el);out.matched.push(rec(c,hidRec(he,hc)));continue;}
  const e=entries.find(e=>!e.hidden&&fits(e));
  if(e&&boxes.every(inside)){acceptedAdded.add(a.el);out.matched.push(rec(c,{approval:e.approval}));}
  else out.unmatched.push(rec(c,{why:he?HIDDEN_WHY:!e?'no matching "added" entry':boxes.some(zero)?ZERO_WHY:'box not entirely inside an approved pixel area'}));}
 // computed style / box of every aligned element pair
 // Offset ruling: containers = parents (never body/html) of the elements approved entries matched (attribute/text matches,
 // accepted added elements, the new side of replaced pairs). An element inside such a container whose box moved with the
 // SAME size, the same computed style and the same layout values passes when every such moved element in that container
 // moved by the same (dx, dy), on screen or scrolled off. Any size, style or layout change, or a non-uniform offset, fails.
 const anchors=[...matchedEls,...unres.keys(),...acceptedAdded,...usedNew],containers=[...new Set(anchors.map(x=>x.parentElement).filter(x=>x&&x!==B&&x.tagName!=='HTML'))];
 const containerOf=b=>{let best=null;for(const c of containers)if(c!==b&&c.contains(b)&&(!best||best.contains(c)))best=c;return best;};
 const offsets=new Map();
 for(const [a,b] of pairs){const pa=pathOf(a,A),pb=pathOf(b,B),x=base.styles[pa],y=now.styles[pb];if(x===y)continue;
  const c={path:pb,kind:'computed style/box',old:x??null,now:y??null};
  if(!bs?.style||!ns?.style||bs.style[pa]==null||ns.style[pb]==null){out.unmatched.push(rec(c,{why:'no style/box split data'}));continue;}
  if(bs.style[pa]!==ns.style[pb]){const cs={...c,kind:'computed style'};
   if(unres.has(b)){const u=unres.get(b);out.unreservedStyle.push({change:rec(cs),selector:u.selector,approval:u.approval,reverts:u.reverts,baseStyle:bs.style[pa],nowStyle:ns.style[pb]});continue;}
   if(!styleMatch(cs,b))out.unmatched.push(rec(cs,matchedEls.has(b)?{why:styleWhy(b)}:{}));continue;}
  const ob=bs.box[pa],nb=ns.box[pb],cb={...c,kind:'box',old:ob,now:nb};
  if(unres.has(b)){if(inside(ob)&&inside(nb))out.matched.push(rec(cb,{approval:'box of an unreserved element, inside an approved pixel area'}));else out.unmatched.push(rec(cb,{why:'box change of an unreserved element outside the approved areas'}));continue;}
  if(matchedEls.has(b)){out.matched.push(rec(cb,{approval:'box of an element matched by an approved DOM entry'}));continue;}
  if(inside(ob)&&inside(nb)){out.matched.push(rec(cb,{approval:'box inside an approved pixel area'}));continue;}
  const C=containerOf(b),same=ob&&nb&&!zero(ob)&&!zero(nb)&&Math.abs(ob[2]-nb[2])<=EPS&&Math.abs(ob[3]-nb[3])<=EPS&&bs.layout?.[pa]!=null&&bs.layout[pa]===ns.layout?.[pb];
  if(C&&same){if(!offsets.has(C))offsets.set(C,[]);offsets.get(C).push({cb,d:[nb[0]-ob[0],nb[1]-ob[1]]});continue;}
  out.unmatched.push(rec(cb,{why:zero(ob)||zero(nb)?ZERO_WHY:C&&ob&&nb&&(Math.abs(ob[2]-nb[2])>EPS||Math.abs(ob[3]-nb[3])>EPS)?'size changed (an offset must keep the size)':C?'layout values changed (an offset must keep them)':'box change outside the approved areas on an unmatched element'}));}
 for(const [C,list] of offsets){const [dx,dy]=list[0].d,uni=list.every(({d})=>Math.abs(d[0]-dx)<=EPS&&Math.abs(d[1]-dy)<=EPS);
  for(const {cb} of list)if(uni)out.matched.push(rec(cb,{approval:`uniform offset (${+dx.toFixed(3)}, ${+dy.toFixed(3)}) in the container of an approved element`}));else out.unmatched.push(rec(cb,{why:'offset not uniform within the container'}));}
 return out;}
export const fmtChange=c=>`${c.hidden?'[hidden] ':''}${c.kind} at ${c.path}: ${JSON.stringify(c.old)} → ${JSON.stringify(c.now)}${c.why?' ('+c.why+')':''}`.slice(0,300);
// Runs IN THE PAGE. The element's non-layout computed-style hash (dom-baseline.mjs domSnapshot split.style: sorted
// property names, LAYOUT excluded, #toast display skipped, sha-256 hex first 16) now and with the reverts applied
// ([kind, old]: old null = remove the attribute), then the element's attributes are restored exactly.
export async function unreservedStyleHash({selector,reverts}){
 const e=document.querySelector(selector);if(!e)return {error:`no live element ${selector}`};
 const LAYOUT=new Set(['width','height','inline-size','block-size','top','right','bottom','left','inset-block-start','inset-block-end','inset-inline-start','inset-inline-end','transform-origin','perspective-origin']);
 const enc=new TextEncoder(),hex=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,16);
 const style=()=>{const cs=getComputedStyle(e),names=[];for(let i=0;i<cs.length;i++)names.push(cs[i]);names.sort();let sv='';for(const k of names){if(k==='display'&&e.id==='toast')continue;if(!LAYOUT.has(k))sv+=k+':'+cs.getPropertyValue(k)+';';}return sv;};
 const saved=e.getAttributeNames().map(n=>[n,e.getAttribute(n)]),now=await hex(style());
 try{for(const [k,old] of reverts)old===null?e.removeAttribute(k):e.setAttribute(k,old);return {now,reverted:await hex(style())};}
 finally{for(const n of e.getAttributeNames())e.removeAttribute(n);for(const [n,v] of saved)e.setAttribute(n,v);}}
// One capture. page = a Playwright page (domChanges runs in it); base/now = snapshots; splitRef = an optional capture of
// the baseline's own build with split data, used only when the baseline snapshot has none and the reference's html and
// combined styles are identical to the baseline's. Returns {matched, unmatched, errors}; errors are the old messages
// (outerHTML line when an HTML-level change is unmatched; 'computed style/box differs: <path>' for unmatched style/box
// changes, first 5 then a count), so with no entries and no areas the result is exactly the old one.
export async function checkCapture(page,{name,id,base,now,entries,areas=[],splitRef=null,compareDom,regionOf=null,pxIn=null}){
 if(base.html===now.html&&JSON.stringify(base.styles)===JSON.stringify(now.styles))return {matched:[],unmatched:[],errors:[]};
 if(!base.split&&splitRef&&splitRef.split&&splitRef.html===base.html&&JSON.stringify(splitRef.styles)===JSON.stringify(base.styles))base={...base,split:splitRef.split};
 const res=await page.evaluate(domChanges,[{html:base.html,styles:base.styles,split:base.split||null},{html:now.html,styles:now.styles,split:now.split||null},{entries,scene:name,id,areas}]);
 // Hidden ruling, pixel side: every hidden match needs 0 differing px (vs the baseline png, NOT excused by any approved
 // area) in its container's region, which is the container's box (same path) in the BASELINE snapshot of regionFrom
 // (its split data, or the split reference's when that is the same state). If the region cannot be determined, or the
 // pixels cannot be read, the matches fail and the capture gets an error naming why.
 // Unreserved style ruling (QA M2, see the comment at validKind): verify each computed-style change on an unreserved
 // element by putting its matched marker changes back on the live element and comparing the recomputed style hash.
 for(const u of res.unreservedStyle||[]){const h=await page.evaluate(unreservedStyleHash,{selector:u.selector,reverts:u.reverts});
  if(h.error)res.unmatched.push({...u.change,why:'unreserved element: cannot verify the style change: '+h.error});
  else if(h.now!==u.nowStyle)res.unmatched.push({...u.change,why:'unreserved element: the live element no longer has the captured style'});
  else if(h.reverted===u.baseStyle)res.matched.push({...u.change,approval:'style change caused only by the unreserved marker changes (reverting them restores the baseline computed style) ('+u.approval+')'});
  else res.unmatched.push({...u.change,why:'unreserved element: computed-style change beyond the allowed marker changes'});}
 delete res.unreservedStyle;
 const hidErrors=[];
 {const groups=new Map();for(const m of res.matched)if(m.hidden){const k=m.hidden.container+'|'+m.hidden.regionFrom;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(m);}
  for(const [k,ms] of groups){const [container,regionFrom]=k.split('|');let why=null;
   const reg=regionOf?await regionOf(regionFrom,container):{error:'no region source (regionOf) for hidden entries'};
   if(!reg||reg.error||!reg.rect)why=`hidden entry: cannot determine the region of ${container} from ${regionFrom}: ${reg?.error||'unknown'}`;
   else{const px=pxIn?await pxIn(reg.rect):{error:'no pixel source (pxIn)'};
    // ruling (a) on 4f9392c: pxIn returns a number (every differing region px counts) or {differing, uncovered}: a
    // differing px passes only when it lies inside another approved area OF THIS CAPTURE; any uncovered one fails.
    const un=typeof px==='number'?px:typeof px?.uncovered==='number'?px.uncovered:null,cov=typeof px?.differing==='number'?px.differing-px.uncovered:0;
    if(un==null)why=`hidden entry: cannot count pixels in ${JSON.stringify(reg.rect)}: ${px?.error||'unknown'}`;
    else if(un>0)why=`hidden entry: ${un} differing px in the region of ${container} outside every approved area of this capture${cov?` (${cov} more covered)`:''} (${JSON.stringify(reg.rect)} CSS px, from ${regionFrom})`;
    else for(const m of ms){m.hidden.region=reg.rect;if(cov)m.hidden.coveredPx=cov;}}
   if(why){hidErrors.push(why);for(const m of ms){res.matched.splice(res.matched.indexOf(m),1);const {approval,hidden,...rest}=m;res.unmatched.push({...rest,why});}}}}
 const htmlUn=res.unmatched.filter(c=>!/^(computed style|box)/.test(c.kind)),styleUn=res.unmatched.filter(c=>/^(computed style|box)/.test(c.kind));
 if(base.html!==now.html&&!res.matched.length&&!htmlUn.length&&!res.unmatched.some(c=>c.kind==='element added'))htmlUn.push({path:'body',kind:'outerHTML',old:'(baseline)',now:'differs with no element-level change (attribute order or serialisation)'});
 const unmatched=[...htmlUn,...styleUn],errors=[...new Set(hidErrors)];
 if(htmlUn.length)errors.push(...compareDom(base,{html:now.html,styles:base.styles}));
 styleUn.slice(0,5).forEach(c=>errors.push('computed style/box differs: '+c.path));if(styleUn.length>5)errors.push(`…${styleUn.length} elements with style differences`);
 return {matched:res.matched,unmatched,errors};}
