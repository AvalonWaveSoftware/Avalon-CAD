// WS5 (ADR v2): the incremental engine's solid caches, used by the local-engine bridge for preview/check/export jobs.
//  - local solids by content (type, params, fillets, resolution) + tolerance + styled, one entry per
//    occurrence of that content in the job (identical objects never share a solid, as in a full rebuild);
//  - placed (scaled + rotated + translated) and floored solids by transform; per-part mesh data by placed solid;
//  (unions are recomputed every job; see union below).
// Manifold orders the runs of a boolean result by run (original) ID, so a cached solid is reused only while the IDs
// stay in the order a full rebuild would assign them (object order); the first object whose cached IDs would be out
// of order, and every object after it, is rebuilt. Moves keep IDs, so a move rebuilds nothing.
// Cached solids are owned here: the bridge's dispose() skips them. Derived entries unused for two jobs are freed;
// local solids are evicted least-recently-used above the byte budget.
import {ENGINE_CACHE_MERGE as MERGE,INDEXED_DISPLAY} from './perf-flags.mjs';
import {makeLocalSolid,placeObjectSolid,meshData} from './kernel.mjs';
import {hashedKey} from './mesh-key.mjs';
import {solidRemoteMisses} from './cad-solid.mjs';
import {shellDeferrals,shellPreview} from './shell-mesh.mjs';
// dst[at+i]=src[i]+base (a plain copy when base is 0): one small monomorphic loop for every merged index buffer.
const offsetInto=(dst,src,at,base)=>{if(!base){dst.set(src,at);return;}for(let i=0;i<src.length;i++)dst[at+i]=src[i]+base;};
export function engineCache(K,{budget=150*1048576,prepare=null}={}){
 const M=K.Manifold,owned=new WeakSet(),serials=new WeakMap(),local=new Map(),unions=new Map(),parts=new Map(),floors=new Map();
 let job=0,maxId=-Infinity,seen=new Map(),next=0,localBytes=0,derivedBytes=0;const stats={localBuilds:0,localHits:0,mergedPreviews:0,displayBuilds:0,displayHits:0};
 const boxes=new WeakMap();
 const box=s=>{let b=boxes.get(s);if(!b){b=s.boundingBox();boxes.set(s,b);}return b;};
 // Conservative gap: well above Manifold's own touch tolerance (relative precision × box scale), so anything Manifold
 // could boolean rather than compose counts as touching here.
 const touch=(a,b)=>{let e=1e-3;for(let k=0;k<3;k++)e=Math.max(e,1e-4*(a.max[k]-a.min[k]),1e-4*(b.max[k]-b.min[k]));for(let k=0;k<3;k++)if(a.min[k]>b.max[k]+e||b.min[k]>a.max[k]+e)return false;return true;};
 const partData=(s,styles)=>{const k=serial(s)+(styles?'S':'');let p=parts.get(k);if(!p){p={data:meshData(s,styles)};parts.set(k,p);}p.used=job;return p.data;};
 const serial=s=>{let n=serials.get(s);if(n===undefined){n=++next;serials.set(s,n);}return n;};
 const estimate=s=>64*s.numVert()+128*s.numTri()+1024;
 const free=s=>{owned.delete(s);derivedBytes-=s.__bytes||0;s.__bytes=0;s.delete();};
 const adopt=s=>{owned.add(s);s.__bytes=estimate(s);derivedBytes+=s.__bytes;return s;};
 // limits-3.0 rev6 (Waydroid QA D1): over budget, solids that this job has not touched are released BEFORE a big imported mesh is built,
 // not after the job (end() below), so the previous job's copy and the new one are not both held in wasm memory (it never shrinks).
 const estimateMesh=m=>64*(m.vertices.length/3)+128*(m.triangles.length/3);
 const evictIdle=need=>{for(const [k,e] of local){if(localBytes+derivedBytes+need<=budget)break;if(e.used===job)continue;releaseLocal(e);local.delete(k);}};
 const releaseLocal=e=>{for(const p of e.placed.values())free(p.s);owned.delete(e.s);e.s.delete();localBytes-=e.bytes;};
 // WS10: per-part indexed displays. A part entry is one placed solid (a byte-identical mesh), so it keeps its display;
 // a moved part is a new placed solid and is prepared afresh. (Reusing a moved part's normals was tried and dropped:
 // normals from translated float32 positions differ in the last bits, which flipped 1-10 pixels by one level.)
 const partDisplay=(s,styles,data)=>{const p=parts.get(serial(s)+(styles?'S':''));if(!p.display){p.display=prepare(data);stats.displayBuilds++;}else stats.displayHits++;return p.display;};
 return {stats,
  owns:s=>owned.has(s),
  begin(){job++;maxId=-Infinity;seen=new Map();},
  makeObject(o,tolerance,styles){const styled=!!styles;
   const content=hashedKey(o.shell?[o.type,o.params,o.fillets??null,o.resolution??null,tolerance,styled,o.shell,shellPreview()]:[o.type,o.params,o.fillets??null,o.resolution??null,tolerance,styled]),n=seen.get(content)||0;seen.set(content,n+1);
   const key=content+'#'+n;let e=local.get(key);
   if(e&&!(e.lo>maxId)){releaseLocal(e);local.delete(key);e=null;}
   if(e){local.delete(key);local.set(key,e);e.used=job;if(styles)for(const [id,flat] of e.styles)styles.set(id,flat);stats.localHits++;}
   else{evictIdle(o.type==='mesh'?estimateMesh(o.params.mesh):0);const lo=M.reserveIDs(1),before=styles?styles.size:0,misses=solidRemoteMisses()+shellDeferrals(),s=makeLocalSolid(K,o,tolerance,styles),hi=M.reserveIDs(1);
    // WS14 (OCCT_SIDECAR): a stand-in built while a fillet mesh was missing is never cached; it is placed, used for
    // this run only and disposed by the bridge like any uncached solid. IDs stay ordered (maxId moves past it).
    if(solidRemoteMisses()+shellDeferrals()>misses){maxId=hi;return placeObjectSolid(o,s);}
    owned.add(s);
    e={s,lo,hi,styles:styles?[...styles].slice(before):[],bytes:0,used:job,placed:new Map()};local.set(key,e);stats.localBuilds++;}
   maxId=e.hi;
   const at=JSON.stringify([o.scale??null,o.rotation,o.position,o.mirrored===true]);let p=e.placed.get(at);
   if(!p){const s=adopt(placeObjectSolid(o,e.s,true));p={s,used:job};e.placed.set(at,p);}else p.used=job;
   // Never query the local solid itself: evaluating it bakes its lazy transforms and changes the last ulp of every later
   // placement. Its size is estimated from the placed copy (evaluating that one is harmless; the union evaluates it anyway).
   if(!e.bytes){e.bytes=p.s.__bytes;localBytes+=e.bytes;}
   return p.s;},
  floor(o,s){const k=serial(s);let f=floors.get(k);
   if(!f){const z=s.isEmpty()?0:s.boundingBox().min[2],delta=Math.max(0,-z);f={delta,s:delta>0?adopt(s.translate([0,0,delta])):null};floors.set(k,f);}
   f.used=job;return f.delta>0?{solid:f.s,adjustment:{id:o.id,sourcePosition:Array.from(o.position),position:[o.position[0],o.position[1],o.position[2]+f.delta]}}:null;},
  // Unions are not cached: Manifold flattens nested lazy unions into one boolean, so an already evaluated group union
  // feeding the final union rounds differently (last-ulp bounds) from a full rebuild. Each job recomputes them.
  union:solids=>M.union(Array.from(solids)),
  // Preview only (Architect ruling on WS5, option 1: geometric equality for the display mesh). When every solid of
  // the preview is disjoint from every other solid and from every cutout (bounding boxes apart), the full union is
  // a plain compose: the same vertices and triangles, only concatenated in another order. That mesh is assembled here
  // from the cached per-part meshes, so a move costs no boolean at all. Any touching or overlapping solid or cutout
  // returns undefined and the job uses the full union: Manifold's batch union pairs overlapping pieces by size across
  // the whole model, and a partial (cached) union can then differ in redundant coplanar vertices (e.g. a duplicate
  // in place), which the vertex-set check rejects. Check and export jobs never come here.
  previewMerge(groups,parts,styles){if(!MERGE)return undefined;
   const final=[],cuts=[];for(const g of groups){final.push(...Array.from(g[0]));cuts.push(...Array.from(g[1]));}
   for(const c of cuts)for(const s of final)if(touch(box(c),box(s)))return undefined;
   for(let i=0;i<final.length;i++)for(let j=i+1;j<final.length;j++)if(touch(box(final[i]),box(final[j])))return undefined;
   for(const s of final){const st=s.status();if(st!=='NoError')throw Error('Could not build the solid: '+st);}
   stats.mergedPreviews++;
   if(MERGE==='compose'){// Manifold compose: the same SortGeometry order as the compose step of the full union.
    const c=M.compose(final);try{const st=c.status();if(st!=='NoError')throw Error('Could not build the solid: '+st);return {...meshData(c,styles),parts,volume:c.volume(),bounds:c.isEmpty()?null:c.boundingBox()};}finally{c.delete();}}
   const datas=final.map(s=>partData(s,styles));let nv=0,nt=0;for(const d of datas){nv+=d.vertices.length;nt+=d.triangles.length;}
   const out={vertices:new Float32Array(nv),triangles:new Uint32Array(nt),...(styles?{flatTriangles:new Uint8Array(nt/3),smoothingGroups:new Uint32Array(nt/3)}:{})};
   let v=0,t=0,group=0;
   for(const d of datas){out.vertices.set(d.vertices,v);offsetInto(out.triangles,d.triangles,t,v/3);
    if(styles){out.flatTriangles.set(d.flatTriangles,t/3);let top=0;for(let i=0;i<d.smoothingGroups.length;i++){const x=d.smoothingGroups[i];out.smoothingGroups[t/3+i]=x+group;if(x>top)top=x;}group+=top;}
    v+=d.vertices.length;t+=d.triangles.length;}
   let volume=0,min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
   for(const s of final){volume+=s.volume();if(s.isEmpty())continue;const b=box(s);for(let k=0;k<3;k++){min[k]=Math.min(min[k],b.min[k]);max[k]=Math.max(max[k],b.max[k]);}}
   // WS10: the merged display is the per-part displays concatenated (parts never weld: their boxes are apart and their
   // smoothing groups distinct), the same arrays prepare_indexed gives for the merged mesh.
   if(INDEXED_DISPLAY&&prepare){const ds=final.map((s,i)=>partDisplay(s,styles,datas[i]));let np=0,ni=0;for(const d of ds){np+=d.positions.length;ni+=d.index.length;}
    const P=new Float32Array(np),N=new Float32Array(np),I=new Uint32Array(ni);let a=0,b=0;
    for(const d of ds){P.set(d.positions,a);N.set(d.normals,a);offsetInto(I,d.index,b,a/3);a+=d.positions.length;b+=d.index.length;}
    out.display={positions:P,normals:N,index:I};}
   return {...out,parts,volume,bounds:min[0]===Infinity?null:{min,max}};},
  // A part's content key: equal keys mean byte-identical part meshes (same cached solid), so the UI can keep its pick mesh.
  partKey:(s,styles)=>serial(s)+(styles?'S':''),
  part(s,styles){const k=serial(s)+(styles?'S':'');let p=parts.get(k);if(!p){p={data:meshData(s,styles)};parts.set(k,p);}p.used=job;
   const out={};for(const [name,v] of Object.entries(p.data))out[name]=v.slice();return out;},
  end(){
   for(const [k,u] of unions)if(u.used<job-1){free(u.s);unions.delete(k);}
   for(const [k,p] of parts)if(p.used<job-1)parts.delete(k);
   for(const [k,f] of floors)if(f.used<job-1){if(f.s)free(f.s);floors.delete(k);}
   for(const e of local.values())for(const [k,p] of e.placed)if(p.used<job-1){free(p.s);e.placed.delete(k);}
   for(const [k,e] of local){if(localBytes+derivedBytes<=budget)break;if(e.used===job)continue;releaseLocal(e);local.delete(k);}},
  // The frees below subtract their own bytes; zeroing first drove derivedMB negative (QA, -0.1 MB).
  clear(){for(const u of unions.values())free(u.s);for(const f of floors.values())if(f.s)free(f.s);for(const e of local.values())releaseLocal(e);unions.clear();floors.clear();parts.clear();local.clear();localBytes=0;derivedBytes=0;},
  size:()=>({local:local.size,unions:unions.size,parts:parts.size,floors:floors.size,localMB:+(localBytes/1048576).toFixed(1),derivedMB:+(derivedBytes/1048576).toFixed(1),localBytes,derivedBytes}),
 };
}
