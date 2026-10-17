import {makeObject,meshData,validateProject} from './kernel.mjs';
import {validateLayers,assertSameLayer,booleanProject} from './layers.mjs';
import {objectTopology,objectTopologyEntry,memoTopology} from './cad-solid.mjs';
import {TOPOLOGY_SERVICE,ENGINE_CACHE,JS_ENGINE,BUNDLE_SPLIT,INDEXED_DISPLAY} from './perf-flags.mjs';
import {jsJobs} from './js-engine.mjs';
import {engineCache} from './engine-cache.mjs';
import {initRustMesh} from './rust-mesh.mjs';
import {isThread,threadTopology} from './threads.mjs';
import {resolutionTolerance} from './facets.mjs';

// Only interop and buffer ownership live here. js-engine.mjs (WS7) or Python owns model/job assembly;
// Rust owns preview mesh preparation and binary STL / 3MF generation.
export async function initLocalEngine(K,options={}){
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
   if(kind==='export'){if(format!=='stl'&&format!=='3mf')throw Error('Unsupported export format.');return {buffer:format==='3mf'?rust.write3MF(model.vertices,model.triangles,ground):rust.writeSTL(model.vertices,model.triangles,ground),triangles:model.triangles.length/3,bounds:model.bounds,volume:model.volume,...(format==='3mf'?{format}:{})};}
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
 return {python,rust,info,process:data=>{acknowledged=TOPOLOGY_SERVICE&&Array.isArray(data?.topologyAck)?new Set(data.topologyAck):null;active=cachedJob(data);if(active)cache.begin();try{return process(data);}finally{if(active)cache.end();active=false;acknowledged=null;}},engineCache:cache,destroy};
}
