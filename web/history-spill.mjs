// ADR-0001 android-large-mesh-memory (C): Undo history keeps at most SPILL_BUDGET bytes of shared mesh arrays
// (web/history.mjs, A) on the heap. Above it the oldest large arrays that only Undo/Redo entries hold are written off
// the heap (IndexedDB in the Android WebView and on web, a temp file in the desktop app) and the entries hold a
// Spilled marker instead. Undo/Redo resolves markers back to byte-identical arrays before restoring. Reach, the
// 40-entry cap and every message stay as they are; a failed write keeps the array in memory, with no UI.
// Spilled data is pruned once no entry refers to it, cleared on close/exit and swept at startup.
import {isShared,hashOf,lookupShared,intern,INTERN_MIN} from './history.mjs';
export const SPILL_BUDGET=64*1048576;
export class Spilled{constructor(hash,length){this.hash=hash;this.length=length;Object.freeze(this);}}
// Visits every shared mesh array of a snapshot tree (fn(array)) and every marker (fm(marker)).
function walk(v,fn,fm){if(v===null||typeof v!=='object')return;if(v instanceof Spilled)return fm?.(v);if(Array.isArray(v)){if(v.length>=INTERN_MIN&&isShared(v))return fn?.(v);if(typeof v[0]==='number')return;for(const x of v)walk(x,fn,fm);return;}for(const k of Object.keys(v))walk(v[k],fn,fm);}
// Returns the tree with each node map(node) gives a replacement for swapped in (copying only the path), or the tree.
function rewrite(v,map){if(v===null||typeof v!=='object')return v;const r=map(v);if(r!==undefined)return r;if(Array.isArray(v)&&typeof v[0]==='number')return v;
 if(Array.isArray(v)){let out=null;for(let i=0;i<v.length;i++){const s=rewrite(v[i],map);if(s!==v[i]){out??=v.slice();out[i]=s;}}return out?Object.freeze(out):v;}
 let out=null;for(const k of Object.keys(v)){const s=rewrite(v[k],map);if(s!==v[k]){out??={...v};out[k]=s;}}return out?Object.freeze(out):v;}
export const hasSpilled=e=>{let found=false;if(e&&typeof e==='object')walk(e,null,()=>{found=true;});return found;};
// Stores: put(hash, Float64Array) / get(hash) -> Float64Array|null / del(hash) / clear(). All may reject.
export function idbStore(name='avalon-history-spill'){let db=null;
 const open=()=>db||(db=new Promise((ok,no)=>{const q=indexedDB.open(name,1);q.onupgradeneeded=()=>q.result.createObjectStore('p');q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error);}).catch(e=>{db=null;throw e;}));
 const tx=(mode,f)=>open().then(d=>new Promise((ok,no)=>{const t=d.transaction('p',mode),s=t.objectStore('p');let r;const q=f(s);if(q)q.onsuccess=()=>{r=q.result;};t.oncomplete=()=>ok(r);t.onerror=t.onabort=()=>no(t.error||Error('spill_tx'));}));
 return {put:(h,a)=>tx('readwrite',s=>s.put(a.buffer,h)),get:h=>tx('readonly',s=>s.get(h)).then(b=>b?new Float64Array(b):null),del:h=>tx('readwrite',s=>s.delete(h)),clear:()=>tx('readwrite',s=>s.clear())};}
export function desktopStore(api){return {put:(h,a)=>api.put(h,new Uint8Array(a.buffer)),get:h=>api.get(h).then(b=>b?new Float64Array(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)):null),del:h=>api.del(h),clear:()=>api.clear()};}
export function defaultStore(){try{if(typeof window!=='undefined'&&window.AvalonDesktop?.spill)return desktopStore(window.AvalonDesktop.spill);if(typeof indexedDB!=='undefined')return idbStore();}catch{}return null;}
// lists(): [history, future] arrays (mutated in place); pinned(): trees whose arrays must stay (live project, lastSnap…).
export function historySpill({store,lists,pinned,budget=SPILL_BUDGET}){
 const stored=new Map(),failed=new Set(),stats={spills:0,restores:0,restoreMs:0,failures:0};let busy=null,again=false;
 const residentBytes=()=>{const seen=new Set();let n=0;for(const l of lists())for(const e of l)walk(e,a=>{if(!seen.has(a)){seen.add(a);n+=a.length*8;}});return n;};
 async function pass(){
  for(;;){const [hist,fut]=lists(),order=new Map();let total=0;
   [...hist,...fut].forEach((e,i)=>walk(e,a=>{if(!order.has(a))total+=a.length*8;order.set(a,i);}));
   if(total<=budget)break;
   const keep=new Set();for(const t of pinned())walk(t,a=>keep.add(a));
   const cands=[...order].filter(([a])=>!keep.has(a)&&!failed.has(hashOf(a))).sort((x,y)=>x[1]-y[1]);if(!cands.length)break;
   const a=cands[0][0],h=hashOf(a);
   if(!stored.has(h)){if(a.some(v=>typeof v!=='number')){failed.add(h);continue;}
    try{await store.put(h,Float64Array.from(a));stored.set(h,a.length);stats.spills++;}catch(e){failed.add(h);stats.failures++;continue;}}
   const m=new Spilled(h,a.length),map=v=>v===a?m:undefined;for(const l of lists())for(let i=0;i<l.length;i++)if(typeof l[i]==='object')l[i]=rewrite(l[i],map);}
  await prune();}
 async function prune(){if(!stored.size)return;const live=new Set();for(const l of lists())for(const e of l)walk(e,null,m=>live.add(m.hash));
  for(const h of [...stored.keys()])if(!live.has(h)){stored.delete(h);try{await store.del(h);}catch{}}}
 const schedule=()=>{if(!store)return;if(busy){again=true;return busy;}busy=(async()=>{try{do{again=false;await pass();}while(again);}catch{}finally{busy=null;}})();return busy;};
 return {stats,residentBytes,schedule,prune:()=>store&&(busy?busy.then(prune):prune()).catch(()=>{}),
  // Resolves every marker of entry e back to its array (byte-identical, hash-checked). Rejects if one can't be read.
  async resolve(e){if(!hasSpilled(e))return e;const t=performance.now(),got=new Map(),marks=[];walk(e,null,m=>marks.push(m));
   for(const m of marks){if(got.has(m.hash))continue;let a=lookupShared(m.hash);
    if(!a){const f=await store.get(m.hash);if(!f||f.length!==m.length)throw Error('spill_missing');const arr=Array.from(f);if(hashOf(arr)!==m.hash)throw Error('spill_hash');a=intern(arr,m.hash);}
    got.set(m.hash,a);}
   const r=rewrite(e,v=>v instanceof Spilled?got.get(v.hash):undefined);stats.restores++;stats.restoreMs=performance.now()-t;return r;},
  clear:()=>{stored.clear();return store?.clear().catch(()=>{});}};}
