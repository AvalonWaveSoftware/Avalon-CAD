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
import {ENGINE_CACHE_MERGE as MERGE} from './perf-flags.mjs';
import {makeLocalSolid,placeObjectSolid,meshData} from './kernel.mjs';
export function engineCache(K,{budget=150*1048576}={}){
 const M=K.Manifold,owned=new WeakSet(),serials=new WeakMap(),local=new Map(),unions=new Map(),parts=new Map(),floors=new Map();
 let job=0,maxId=-Infinity,seen=new Map(),next=0,localBytes=0,derivedBytes=0;const stats={localBuilds:0,localHits:0,mergedPreviews:0};
 const boxes=new WeakMap();
 const box=s=>{let b=boxes.get(s);if(!b){b=s.boundingBox();boxes.set(s,b);}return b;};
 // Conservative gap: well above Manifold's own touch tolerance (relative precision × box scale), so anything Manifold
 // could boolean rather than compose counts as touching here.
 const touch=(a,b)=>{let e=1e-3;for(let k=0;k<3;k++)e=Math.max(e,1e-4*(a.max[k]-a.min[k]),1e-4*(b.max[k]-b.min[k]));for(let k=0;k<3;k++)if(a.min[k]>b.max[k]+e||b.min[k]>a.max[k]+e)return false;return true;};
 const partData=(s,styles)=>{const k=serial(s)+(styles?'S':'');let p=parts.get(k);if(!p){p={data:meshData(s,styles)};parts.set(k,p);}p.used=job;return p.data;};
 const serial=s=>{let n=serials.get(s);if(n===undefined){n=++next;serials.set(s,n);}return n;};
 const estimate=s=>64*s.numVert()+128*s.numTri()+1024;
 const free=s=>{owned.delete(s);derivedBytes-=s.__bytes||0;s.delete();};
 const adopt=s=>{owned.add(s);s.__bytes=estimate(s);derivedBytes+=s.__bytes;return s;};
 const releaseLocal=e=>{for(const p of e.placed.values())free(p.s);owned.delete(e.s);e.s.delete();localBytes-=e.bytes;};
 return {stats,
  owns:s=>owned.has(s),
  begin(){job++;maxId=-Infinity;seen=new Map();},
  makeObject(o,tolerance,styles){const styled=!!styles;
   const content=JSON.stringify([o.type,o.params,o.fillets??null,o.resolution??null,tolerance,styled]),n=seen.get(content)||0;seen.set(content,n+1);
   const key=content+'#'+n;let e=local.get(key);
   if(e&&!(e.lo>maxId)){releaseLocal(e);local.delete(key);e=null;}
   if(e){local.delete(key);local.set(key,e);e.used=job;if(styles)for(const [id,flat] of e.styles)styles.set(id,flat);stats.localHits++;}
   else{const lo=M.reserveIDs(1),before=styles?styles.size:0,s=makeLocalSolid(K,o,tolerance,styles),hi=M.reserveIDs(1);owned.add(s);
    e={s,lo,hi,styles:styles?[...styles].slice(before):[],bytes:0,used:job,placed:new Map()};local.set(key,e);stats.localBuilds++;}
   maxId=e.hi;
   const at=JSON.stringify([o.scale??null,o.rotation,o.position]);let p=e.placed.get(at);
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
   for(const d of datas){out.vertices.set(d.vertices,v);const base=v/3;for(let i=0;i<d.triangles.length;i++)out.triangles[t+i]=d.triangles[i]+base;
    if(styles){out.flatTriangles.set(d.flatTriangles,t/3);let top=0;for(let i=0;i<d.smoothingGroups.length;i++){const x=d.smoothingGroups[i];out.smoothingGroups[t/3+i]=x+group;if(x>top)top=x;}group+=top;}
    v+=d.vertices.length;t+=d.triangles.length;}
   let volume=0,min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
   for(const s of final){volume+=s.volume();if(s.isEmpty())continue;const b=box(s);for(let k=0;k<3;k++){min[k]=Math.min(min[k],b.min[k]);max[k]=Math.max(max[k],b.max[k]);}}
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
  clear(){derivedBytes=0;for(const u of unions.values())free(u.s);for(const f of floors.values())if(f.s)free(f.s);for(const e of local.values())releaseLocal(e);unions.clear();floors.clear();parts.clear();local.clear();},
  size:()=>({local:local.size,unions:unions.size,parts:parts.size,floors:floors.size,localMB:+(localBytes/1048576).toFixed(1),derivedMB:+(derivedBytes/1048576).toFixed(1)}),
 };
}
