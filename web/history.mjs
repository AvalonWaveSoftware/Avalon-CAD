// WS11 (ADR v2): Undo/Redo history as structurally shared, deep-frozen project snapshots instead of JSON strings.
// snapshot(value, previous) is JSON.parse(JSON.stringify(value)) as a frozen tree (undefined members dropped, -0 as 0,
// non-finite numbers as null, toJSON honoured), in which every subtree equal to the matching subtree of `previous` is
// that subtree itself, so an edit only copies what changed and an imported mesh is held once. Undo restores with
// validateProject(snapshot, true) (web/kernel-ui.mjs): the same validation and a mutable copy equal to JSON.parse of the
// old string, except that large frozen number arrays (meshes) stay shared, as no code writes into them.
const numeric=new WeakSet();
const num=x=>Number.isFinite(x)?(x===0?0:x):null;
function equalArray(a,b){if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;}
export function snapshot(value,previous){
 if(value!==null&&typeof value==='object'&&typeof value.toJSON==='function')value=value.toJSON();
 if(typeof value==='number')return num(value);
 if(value===null||typeof value!=='object')return value;
 if(ArrayBuffer.isView(value))return snapshot(Object.fromEntries(Object.entries(value)),previous);
 if(Array.isArray(value)){
  const p=Array.isArray(previous)?previous:null;
  // number arrays (meshes, coordinates): compare first, the common case being an unchanged mesh; copy only on a change
  if(p&&numeric.has(p)&&p.length===value.length){let i=0;while(i<value.length&&value[i]===p[i])i++;if(i===value.length)return p;}
  if(value.length&&value.every(v=>typeof v==='number')){const out=new Array(value.length);for(let i=0;i<value.length;i++)out[i]=num(value[i]);numeric.add(out);return Object.freeze(out);}
  let same=!!p&&p.length===value.length;
  const out=new Array(value.length);
  for(let i=0;i<value.length;i++){const v=value[i],q=p?.[i];const s=v===undefined||typeof v==='function'||typeof v==='symbol'?null:snapshot(v,q);out[i]=s;if(same&&s!==q)same=false;}
  return same?p:Object.freeze(out);}
 const p=previous!==null&&typeof previous==='object'&&!Array.isArray(previous)?previous:null;const out={};let n=0,same=!!p;
 for(const k of Object.keys(value)){const v=value[k];if(v===undefined||typeof v==='function'||typeof v==='symbol')continue;const q=p&&Object.hasOwn(p,k)?p[k]:undefined;const s=snapshot(v,q);out[k]=s;n++;if(same&&(s!==q||!Object.hasOwn(p,k)))same=false;}
 if(same&&Object.keys(p).length!==n)same=false;
 if(same){const a=Object.keys(p),b=Object.keys(out);for(let i=0;i<a.length;i++)if(a[i]!==b[i]){same=false;break;}}
 return same?p:Object.freeze(out);}
