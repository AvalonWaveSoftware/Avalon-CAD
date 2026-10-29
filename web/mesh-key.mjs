// Cache keys that stay small for big imported meshes (limits-3.0 rev6, Waydroid QA D1). JSON.stringify of a 523k-triangle
// mesh is a ~19 MB string, and every cache layer made two or three of them per job; number arrays of 4,096+ entries (meshes)
// enter a key as their length and a 64-bit FNV-style hash of the IEEE bits instead. Everything else stays exact.
const f64=new Float64Array(1),u32=new Uint32Array(f64.buffer);
export function arrayHash(a){let h1=0x811c9dc5,h2=a.length|0;for(let i=0;i<a.length;i++){f64[0]=a[i];h1=Math.imul(h1^u32[0],16777619);h2=Math.imul(h2^u32[1],1540483477);}return (h1>>>0).toString(36)+'.'+(h2>>>0).toString(36);}
export const hashedKey=o=>JSON.stringify(o,(k,v)=>(Array.isArray(v)||ArrayBuffer.isView(v))&&v.length>=4096?`#${v.length}:${arrayHash(v)}`:v);
