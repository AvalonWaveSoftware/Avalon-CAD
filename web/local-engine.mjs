import {previewShells} from './shell-mesh.mjs';
import {SPLIT_TRIANGLES_3MF} from './three-mf-parts.mjs';
import {makeObject,meshData,validateProject,QUALITY} from './kernel.mjs';
import {validateLayers,assertSameLayer,booleanProject} from './layers.mjs';
import {meshMeasurement,measureExact,objectTopology,objectTopologyEntry,memoTopology} from './cad-solid.mjs';
import {TOPOLOGY_SERVICE,ENGINE_CACHE,JS_ENGINE,BUNDLE_SPLIT,INDEXED_DISPLAY} from './perf-flags.mjs';
import {jsJobs,validateObjects} from './js-engine.mjs';
import {engineCache} from './engine-cache.mjs';
import {initRustMesh} from './rust-mesh.mjs';
import {isThread,threadTopology} from './threads.mjs';
import {resolutionTolerance} from './facets.mjs';
import {lazyMeshPreview} from './lazy-mesh.mjs';

// Only interop and buffer ownership live here. js-engine.mjs (WS7) or Python owns model/job assembly;
// Rust owns preview mesh preparation and binary STL / 3MF generation.
export async function initLocalEngine(K,options={}){
 // F1e (ADR-0002, ruling 2): the mesh fallback tessellates at the app's default STL export quality (Export sheet default
 // "Ultra", QUALITY.ultra), never finer, and keeps placed meshes keyed by object revision so a repeat measure costs no
 // tessellation. Revision = the object's JSON with large number arrays replaced by length + hash. The cache is capped
 // by bytes (MEASURE_CACHE_BYTES of vertex + index data in this worker's JS heap), least-recently-used evicted first; a
 // mesh larger than the cap is returned uncached.
 const measured=new Map(),MEASURE_CACHE_BYTES=12*1048576;let measuredBytes=0;
 const meshBytes=m=>m.vertices.byteLength+m.triangles.byteLength;
 function measureMesh(object){const key=revisionKey(object);let m=measured.get(key);if(m){measured.delete(key);measured.set(key,m);return m;}
  const o=structuredClone(object);validateProject(booleanProject([o]));const s=makeObject(K,o,QUALITY.ultra);try{m=meshData(s);}finally{s.delete();}
  const bytes=meshBytes(m);if(bytes>MEASURE_CACHE_BYTES)return m;
  while(measured.size&&measuredBytes+bytes>MEASURE_CACHE_BYTES){const [k,old]=measured.entries().next().value;measured.delete(k);measuredBytes-=meshBytes(old);}
  measured.set(key,m);measuredBytes+=bytes;return m;}
 const rust=await (options.rust?.ready||initRustMesh(options.rust||{}));
 K.threadMesh=(o,tolerance)=>rust.threadMesh(o.type,o.params,tolerance);
 function placeObject(value,requested,floor){const o=structuredClone(value),at=Array.from(requested);if(at.length!==3||at.some(x=>!Number.isFinite(x)||Math.abs(x)>10000))throw Error('Invalid placement coordinates.');if(floor)at[2]=Math.max(0,at[2]);o.position=[0,0,0];validateProject(booleanProject([o]));const s=makeObject(K,o,.005);try{const b=s.boundingBox();if(s.isEmpty())throw Error('This object contains no material.');o.position=[at[0]-(b.min[0]+b.max[0])/2,at[1]-(b.min[1]+b.max[1])/2,at[2]-b.min[2]];o.positionReference='base';o.placement=at;validateProject(booleanProject([o]));return {object:o};}finally{s.delete();}}
 function groundProject(value){const p=validateProject(value);let min=0;for(const o of p.objects.filter(o=>o.enabled)){const s=makeObject(K,o,.005);try{if(!s.isEmpty())min=Math.min(min,s.boundingBox().min[2]);}finally{s.delete();}}if(min<0)for(const o of p.objects){o.position[2]-=min;if(o.placement)o.placement[2]-=min;}p.buildPlaneEnabled=true;return {project:validateProject(p),lift:-min};}
 let acknowledged=null;const cache=ENGINE_CACHE?engineCache(K,{budget:options.engineCacheBudget,prepare:INDEXED_DISPLAY?d=>rust.prepareIndexed(d.vertices,d.triangles,d.flatTriangles,d.smoothingGroups):null}):null,cachedJob=d=>cache&&['preview','check','export'].includes(d?.type);let active=false;
 const threadEntry=o=>{const tolerance=resolutionTolerance(o,.15);const v=memoTopology(JSON.stringify(['thread',o.type,o.params,tolerance]),()=>threadTopology(K.threadMesh(o,tolerance),o));return {hash:v.hash,topology:v.t};};
 const bridge={runtime_info:version=>({python:version,rust:rust.version,local:true}),
  place_object:placeObject,ground_project:groundProject,
  floor_solid:(o,s)=>active?cache.floor(o,s):(()=>{const z=s.isEmpty()?0:s.boundingBox().min[2],delta=Math.max(0,-z);return delta>0?{solid:s.translate([0,0,delta]),adjustment:{id:o.id,sourcePosition:Array.from(o.position),position:[o.position[0],o.position[1],o.position[2]+delta]}}:null;})(),
  validate_layers:validateLayers,assert_same_layer:assertSameLayer,
  styles:()=>new Map(),make_object:(o,tolerance,styles)=>active?cache.makeObject(o,tolerance,styles):makeObject(K,o,tolerance,styles),
  dispose:s=>{if(!(active&&cache.owns(s)))s.delete();},union:solids=>active?cache.union(solids):K.Manifold.union(solids),
  part:(o,s,styles)=>{if(!TOPOLOGY_SERVICE)return {id:o.id,mode:o.mode,...(active?cache.part(s,styles):meshData(s,styles)),...(active?{contentHash:cache.partKey(s,styles)}:{}),bounds:s.boundingBox(),topology:structuredClone(isThread(o)?threadTopology(K.threadMesh(o,resolutionTolerance(o,.15)),o):objectTopology(o))};
   // WS2: topology by geometry hash; the body rides along only when the requester has not acknowledged the hash
   // (no acknowledgement list means a direct caller, which always gets it). Cached bodies are shared, never mutated.
   const {hash,topology}=isThread(o)?threadEntry(o):objectTopologyEntry(o),part={id:o.id,mode:o.mode,...(active?cache.part(s,styles):meshData(s,styles)),...(active?{contentHash:cache.partKey(s,styles)}:{}),bounds:s.boundingBox(),topologyHash:hash};
   if(!hash||!acknowledged?.has(hash))part.topology=topology;return part;},
  empty_result:(parts,styles)=>({vertices:new Float32Array(),triangles:new Uint32Array(),...(styles?{flatTriangles:new Uint8Array(),smoothingGroups:new Uint32Array()}:{}),parts,volume:0,bounds:null}),
  preview_merge:(groups,parts,styles)=>active?cache.previewMerge(groups,parts,styles):undefined,
  model_result:(s,parts,styles)=>({...meshData(s,styles),parts,volume:s.volume(),bounds:s.isEmpty()?null:s.boundingBox()}),
  boolean_result:(s,removedVolume,targetVolume)=>{const pieces=s.decompose();try{return {count:pieces.filter(p=>p.volume()>0).length,bounds:s.boundingBox(),volume:s.volume(),removedVolume,targetVolume};}finally{pieces.forEach(p=>p.delete());}},
  // ADR-0001 F2a: export format 'stl' (default, unchanged) or '3mf' (Rust encode_3mf of the same mesh).
  finish_result:(model,kind,ground,format='stl')=>{
   if(kind==='export'){if(format!=='stl'&&format!=='3mf'&&format!=='3mf-mesh')throw Error('Unsupported export format.');
    // ADR-0001 F2a option A: '3mf-mesh' validates and returns the export mesh (copies) and its grounding offset; the page's
    // 3MF pool encodes it (or sends it back as 'encode3mf' when the pool is unavailable). Same mesh as the '3mf' path.
    // Architect ruling 3: below 65,536 triangles the model is one part, encoded here on the plain single path.
    if(format==='3mf-mesh'&&model.triangles.length/3<SPLIT_TRIANGLES_3MF)return {buffer:rust.write3MF(model.vertices,model.triangles,ground),triangles:model.triangles.length/3,bounds:model.bounds,volume:model.volume,format:'3mf'};
    if(format==='3mf-mesh')return {mesh3mf:{vertices:model.vertices.slice(),triangles:model.triangles.slice(),minZ:rust.prepare3MF(model.vertices,model.triangles,ground)},triangles:model.triangles.length/3,bounds:model.bounds,volume:model.volume,format:'3mf'};return {buffer:format==='3mf'?rust.write3MF(model.vertices,model.triangles,ground):rust.writeSTL(model.vertices,model.triangles,ground),triangles:model.triangles.length/3,bounds:model.bounds,volume:model.volume,...(format==='3mf'?{format}:{})};}
   // WS9: the dead conjoin result is dropped with BUNDLE_SPLIT (the JS engine rejects the job; Python keeps it).
   if(kind==='conjoin'&&!(BUNDLE_SPLIT&&JS_ENGINE)){const solid=new K.Manifold(new K.Mesh({numProp:3,vertProperties:model.vertices,triVerts:model.triangles}));const pieces=solid.decompose();try{return {count:pieces.length,bounds:model.bounds};}finally{pieces.forEach(p=>p.delete());solid.delete();}}
   // WS10: indexed display (assembled per part by the cache for merged previews, else prepared here for the whole mesh).
   if(kind==='preview'&&INDEXED_DISPLAY){const display=model.display||rust.prepareIndexed(model.vertices,model.triangles,model.flatTriangles,model.smoothingGroups);delete model.display;model.displayPositions=display.positions;model.displayNormals=display.normals;model.displayIndex=display.index;}
   else if(kind==='preview'){const display=rust.prepare(model.vertices,model.triangles,model.flatTriangles,model.smoothingGroups);model.displayPositions=display.positions;model.displayNormals=display.normals;}
   return model;
  },
  response:(result,id,type)=>({...result,id,type}),
  error_response:(id,error)=>({id,error:String(error).replace(/^Error: /,'')}),
 };
 // WS7: JS_ENGINE runs the JS port of model_jobs.py (no Pyodide); options.oracle forces the Python path (tests).
 let python=null,process,info,destroy=()=>{};
 if(JS_ENGINE&&!options.oracle){const jobs=jsJobs(bridge);process=jobs.process;info=jobs.info;}
 else{
  const load=options.loadPyodide||(await import(new URL('python/pyodide.mjs',options.baseURL).href)).loadPyodide;
  python=await load({indexURL:options.pythonURL||new URL('python/',options.baseURL).href,stdout:()=>{},stderr:()=>{}});
  python.registerJsModule('avalon_native',bridge);
  const source=options.pythonSource||await(async()=>{const r=await fetch(new URL('python/model_jobs.py',options.baseURL));if(!r.ok)throw Error('The bundled Python jobs could not load.');return r.text();})();
  python.runPython(source);const job=python.globals.get('process_job'),getInfo=python.globals.get('runtime_info');info=getInfo();getInfo.destroy();process=job;destroy=()=>job.destroy();
 }
 // F1: a lone imported mesh previews without a Manifold (web/lazy-mesh.mjs); same validation and part topology.
 const lazy=data=>{if(data?.type!=='preview'||options.noLazyMesh||!Array.isArray(data.project?.objects))return null;const model=lazyMeshPreview(data.project,{validate:p=>{if(p.format!=='tristancad'||![2,3].includes(p.version))throw Error('This is not a supported AvalonCad project.');validateObjects(p.objects);validateLayers(p);},
  topology:o=>{if(!TOPOLOGY_SERVICE)return {topology:structuredClone(objectTopology(o))};const {hash,topology}=objectTopologyEntry(o);return !hash||!acknowledged?.has(hash)?{topologyHash:hash,topology}:{topologyHash:hash};}});
  return model&&bridge.response(bridge.finish_result(model,'preview',true),data.id,'preview');};
 return {python,rust,info,process:data=>{previewShells(data?.type==='preview');acknowledged=TOPOLOGY_SERVICE&&Array.isArray(data?.topologyAck)?new Set(data.topologyAck):null;try{const r=lazy(data);if(r)return r;}catch(e){return bridge.error_response(data.id,String(e));}active=cachedJob(data);if(active)cache.begin();try{if(data.type==='measure'){try{for(const p of [data.a,data.b].filter(Boolean))validateProject(booleanProject([structuredClone(p.object)]));if(data.mode==='object'&&[data.a?.object,data.b?.object].some(meshMeasurement)){const meshes=[data.a,data.b].map(p=>measureMesh(p.object));return {id:data.id,distance:rust.meshMinDistance(...meshes)};}return {id:data.id,...measureExact(data)};}catch(e){return {id:data.id,error:e.message||String(e)};}}return process(data);}finally{if(active)cache.end();active=false;acknowledged=null;}},engineCache:cache,destroy};
}
// Object revision key for the F1e mesh cache: exact for every field; number arrays of 4,096+ entries (meshes) enter as
// their length and a 64-bit FNV-style hash of the IEEE bits, so the key stays small and cheap for big STL imports.
const f64=new Float64Array(1),u32=new Uint32Array(f64.buffer);
function arrayHash(a){let h1=0x811c9dc5,h2=a.length|0;for(let i=0;i<a.length;i++){f64[0]=a[i];h1=Math.imul(h1^u32[0],16777619);h2=Math.imul(h2^u32[1],1540483477);}return (h1>>>0).toString(36)+'.'+(h2>>>0).toString(36);}
export function revisionKey(o){return JSON.stringify(o,(k,v)=>(Array.isArray(v)||ArrayBuffer.isView(v))&&v.length>=4096?`#${v.length}:${arrayHash(v)}`:v);}
