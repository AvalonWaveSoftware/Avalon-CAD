// WS2 (ADR v2): transferable packing of topology bodies. Every plain numeric array goes into one Float64Array (exact
// for any double), typed arrays are copied into their own transferable buffers, and the remaining skeleton (object
// keys, strings, booleans, nulls, scalars) is UTF-8 JSON in a Uint8Array. Scalars JSON cannot round-trip (-0, NaN,
// ±Infinity) and undefined fields are tagged. Topology has no keys starting with '$' (the tag namespace). unpackTopology rebuilds the same object graph (same keys, order, array kinds and values).
const isNumArray=v=>Array.isArray(v)&&v.length>0&&v.every(x=>typeof x==='number');
export function packTopology(t){
 let total=0;const typed=[],count=v=>{if(isNumArray(v)){total+=v.length;return;}if(ArrayBuffer.isView(v))return;if(Array.isArray(v))v.forEach(count);else if(v&&typeof v==='object')for(const k in v)count(v[k]);};
 count(t);const nums=new Float64Array(total);let at=0;
 const enc=v=>{
  if(typeof v==='number')return Object.is(v,-0)||!Number.isFinite(v)?{$x:String(v===0?'-0':v)}:v;
  if(ArrayBuffer.isView(v)){typed.push(v.slice());return {$t:typed.length-1};}
  if(isNumArray(v)){nums.set(v,at);const ref={$a:[at,v.length]};at+=v.length;return ref;}
  if(Array.isArray(v))return v.map(enc);
  if(v&&typeof v==='object'){const out={};for(const k in v)out[k]=v[k]===undefined?{$u:0}:enc(v[k]);return out;}
  return v;};
 const meta=new TextEncoder().encode(JSON.stringify(enc(t)));
 return {meta,nums,typed};
}
export function unpackTopology({meta,nums,typed}){
 const dec=v=>{
  if(Array.isArray(v))return v.map(dec);
  if(v&&typeof v==='object'){
   if('$a' in v)return Array.from(nums.subarray(v.$a[0],v.$a[0]+v.$a[1]));
   if('$t' in v)return typed[v.$t];
   if('$u' in v)return undefined;
   if('$x' in v)return v.$x==='-0'?-0:Number(v.$x);
   for(const k in v)v[k]=dec(v[k]);return v;}
  return v;};
 return dec(JSON.parse(new TextDecoder().decode(meta)));
}
export const packedBuffers=p=>[p.meta.buffer,p.nums.buffer,...p.typed.map(x=>x.buffer)];
export const packedBytes=p=>p.meta.byteLength+p.nums.byteLength+p.typed.reduce((s,x)=>s+x.byteLength,0);
// 53-bit string hash (cyrb53) of the geometry key, as hex: short enough to send for every part on every preview.
export function geometryHash(key){let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<key.length;i++){const c=key.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677);}
 h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
 return (4294967296*(2097151&h2)+(h1>>>0)).toString(16).padStart(14,'0');}
// Worker side: move each part's topology body into result.topologies (once per hash per message, packed) and return
// the buffers to transfer. Parts without a hash (mesh content) keep topology as before (null).
export function shipTopologies(result){const bodies=new Map(),buffers=[];
 for(const p of result.parts||[]){if(!p.topologyHash){if(p.topology)buffers.push(p.topology.vertices.buffer,p.topology.triangles.buffer);continue;}if(p.topology&&!bodies.has(p.topologyHash))bodies.set(p.topologyHash,packTopology(p.topology));delete p.topology;}
 if(bodies.size){result.topologies=[...bodies].map(([hash,body])=>({hash,...body}));for(const b of bodies.values())buffers.push(...packedBuffers(b));}
 return buffers;}
