// WS11 (ADR v2): Undo/Redo history as structurally shared, deep-frozen project snapshots instead of JSON strings.
// snapshot(value, previous) is JSON.parse(JSON.stringify(value)) as a frozen tree (undefined members dropped, -0 as 0,
// non-finite numbers as null, toJSON honoured), in which every subtree equal to the matching subtree of `previous` is
// that subtree itself, so an edit only copies what changed and an imported mesh is held once. Undo restores with
// validateProject(snapshot, true) (web/kernel-ui.mjs): the same validation and a mutable copy equal to JSON.parse of the
// old string, except that large frozen number arrays (meshes) stay shared, as no code writes into them.
const numeric=new WeakSet();
// ADR-0001 android-large-mesh-memory (A): number arrays of INTERN_MIN+ entries (imported meshes) are content-addressed:
// an equal array already held by any snapshot is returned by reference, so loading the same model again (or an Undo
// entry of it) never holds a second copy. Canonical arrays are frozen and only weakly indexed here.
export const INTERN_MIN=16384;
const canonical=new Map(),f64=new Float64Array(1),i32=new Int32Array(f64.buffer);
const forget=typeof FinalizationRegistry==='function'?new FinalizationRegistry(h=>{const l=canonical.get(h)?.filter(r=>r.deref());if(l?.length)canonical.set(h,l);else canonical.delete(h);}):null;
export function numberHash(a){let h1=-2128831035,h2=a.length|0;for(let i=0;i<a.length;i++){const v=a[i];f64[0]=v===null?NaN:v;h1=Math.imul(h1^i32[0],16777619);h2=Math.imul(h2^i32[1],1540483477)+(v===null?7:0)|0;}return (h1>>>0).toString(36)+'.'+(h2>>>0).toString(36)+'.'+a.length;}
const hashes=new WeakMap();
export const hashOf=a=>{let h=hashes.get(a);if(h===undefined){h=numberHash(a);hashes.set(a,h);}return h;};
export const isShared=a=>Array.isArray(a)&&a.length>=INTERN_MIN&&numeric.has(a);
export function lookupShared(h){for(const r of canonical.get(h)||[]){const a=r.deref();if(a)return a;}return null;}
// Registers out (a frozen number array, or a restored one) and returns the canonical equal array.
export function intern(out,h=numberHash(out)){
 for(const r of canonical.get(h)||[]){const a=r.deref();if(a&&equalArray(a,out))return a;}
 if(!Object.isFrozen(out))Object.freeze(out);numeric.add(out);hashes.set(out,h);
 if(typeof WeakRef!=='function')return out;
 const l=canonical.get(h)||[];l.push(new WeakRef(out));canonical.set(h,l);forget?.register(out,h);return out;}
const num=x=>Number.isFinite(x)?(x===0?0:x):null;
// A large number array in ONE pass (type check, normalise, copy, hash) instead of every() + copy + numberHash(out):
// the same frozen array and the same hash string as before, read once while it is in cache. null if not all numbers.
function copyHashed(value){const n=value.length,out=new Array(n);let h1=-2128831035,h2=n|0;
 for(let i=0;i<n;i++){const x=value[i];if(typeof x!=='number')return null;const v=Number.isFinite(x)?(x===0?0:x):null;out[i]=v;f64[0]=v===null?NaN:v;h1=Math.imul(h1^i32[0],16777619);h2=Math.imul(h2^i32[1],1540483477)+(v===null?7:0)|0;}
 return intern(out,(h1>>>0).toString(36)+'.'+(h2>>>0).toString(36)+'.'+n);}
function equalArray(a,b){if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;}
export function snapshot(value,previous){
 if(value!==null&&typeof value==='object'&&typeof value.toJSON==='function')value=value.toJSON();
 if(typeof value==='number')return num(value);
 if(value===null||typeof value!=='object')return value;
 if(ArrayBuffer.isView(value))return snapshot(Object.fromEntries(Object.entries(value)),previous);
 if(Array.isArray(value)){
  if(value.length>=INTERN_MIN&&numeric.has(value))return value;
  const p=Array.isArray(previous)?previous:null;
  // number arrays (meshes, coordinates): compare first, the common case being an unchanged mesh; copy only on a change
  if(p&&numeric.has(p)&&p.length===value.length){let i=0;while(i<value.length&&value[i]===p[i])i++;if(i===value.length)return p;}
  if(value.length>=INTERN_MIN){const out=copyHashed(value);if(out)return out;}
  else if(value.length&&value.every(v=>typeof v==='number')){const out=new Array(value.length);for(let i=0;i<value.length;i++)out[i]=num(value[i]);numeric.add(out);return Object.freeze(out);}
  let same=!!p&&p.length===value.length;
  const out=new Array(value.length);
  for(let i=0;i<value.length;i++){const v=value[i],q=p?.[i];const s=v===undefined||typeof v==='function'||typeof v==='symbol'?null:snapshot(v,q);out[i]=s;if(same&&s!==q)same=false;}
  return same?p:Object.freeze(out);}
 const p=previous!==null&&typeof previous==='object'&&!Array.isArray(previous)?previous:null;const out={};let n=0,same=!!p;
 for(const k of Object.keys(value)){const v=value[k];if(v===undefined||typeof v==='function'||typeof v==='symbol')continue;const q=p&&Object.hasOwn(p,k)?p[k]:undefined;const s=snapshot(v,q);out[k]=s;n++;if(same&&(s!==q||!Object.hasOwn(p,k)))same=false;}
 if(same&&Object.keys(p).length!==n)same=false;
 if(same){const a=Object.keys(p),b=Object.keys(out);for(let i=0;i<a.length;i++)if(a[i]!==b[i]){same=false;break;}}
 return same?p:Object.freeze(out);}
