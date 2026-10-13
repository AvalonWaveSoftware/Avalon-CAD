import {makeObject,meshData,validateProject} from './kernel.mjs';
import {validateLayers,assertSameLayer,booleanProject} from './layers.mjs';
import {objectTopology} from './cad-solid.mjs';
import {initRustMesh} from './rust-mesh.mjs';
import {isThread,threadTopology} from './threads.mjs';
import {resolutionTolerance} from './facets.mjs';

// Only interop and buffer ownership live here. Python owns model/job assembly;
// Rust owns preview mesh preparation and binary STL generation.
export async function initLocalEngine(K,options={}){
 const rust=await initRustMesh(options.rust||{});
 K.threadMesh=(o,tolerance)=>rust.threadMesh(o.type,o.params,tolerance);
 const load=options.loadPyodide||(await import(new URL('python/pyodide.mjs',options.baseURL).href)).loadPyodide;
 const python=await load({indexURL:options.pythonURL||new URL('python/',options.baseURL).href,stdout:()=>{},stderr:()=>{}});
 function placeObject(value,requested,floor){const o=structuredClone(value),at=Array.from(requested);if(at.length!==3||at.some(x=>!Number.isFinite(x)||Math.abs(x)>10000))throw Error('Invalid placement coordinates.');if(floor)at[2]=Math.max(0,at[2]);o.position=[0,0,0];validateProject(booleanProject([o]));const s=makeObject(K,o,.005);try{const b=s.boundingBox();if(s.isEmpty())throw Error('This object contains no material.');o.position=[at[0]-(b.min[0]+b.max[0])/2,at[1]-(b.min[1]+b.max[1])/2,at[2]-b.min[2]];o.positionReference='base';o.placement=at;validateProject(booleanProject([o]));return {object:o};}finally{s.delete();}}
 function groundProject(value){const p=validateProject(value);let min=0;for(const o of p.objects.filter(o=>o.enabled)){const s=makeObject(K,o,.005);try{if(!s.isEmpty())min=Math.min(min,s.boundingBox().min[2]);}finally{s.delete();}}if(min<0)for(const o of p.objects){o.position[2]-=min;if(o.placement)o.placement[2]-=min;}p.buildPlaneEnabled=true;return {project:validateProject(p),lift:-min};}
 const bridge={runtime_info:version=>({python:version,rust:rust.version,local:true}),
  place_object:placeObject,ground_project:groundProject,
  floor_solid:(o,s)=>{const z=s.isEmpty()?0:s.boundingBox().min[2],delta=Math.max(0,-z);return delta>0?{solid:s.translate([0,0,delta]),adjustment:{id:o.id,sourcePosition:Array.from(o.position),position:[o.position[0],o.position[1],o.position[2]+delta]}}:null;},
  validate_layers:validateLayers,assert_same_layer:assertSameLayer,
  styles:()=>new Map(),make_object:(o,tolerance,styles)=>makeObject(K,o,tolerance,styles),
  dispose:s=>s.delete(),union:solids=>K.Manifold.union(solids),
  part:(o,s,styles)=>({id:o.id,mode:o.mode,...meshData(s,styles),bounds:s.boundingBox(),topology:structuredClone(isThread(o)?threadTopology(K.threadMesh(o,resolutionTolerance(o,.15)),o):objectTopology(o))}),
  empty_result:(parts,styles)=>({vertices:new Float32Array(),triangles:new Uint32Array(),...(styles?{flatTriangles:new Uint8Array(),smoothingGroups:new Uint32Array()}:{}),parts,volume:0,bounds:null}),
  model_result:(s,parts,styles)=>({...meshData(s,styles),parts,volume:s.volume(),bounds:s.isEmpty()?null:s.boundingBox()}),
  boolean_result:(s,removedVolume,targetVolume)=>{const pieces=s.decompose();try{return {count:pieces.filter(p=>p.volume()>0).length,bounds:s.boundingBox(),volume:s.volume(),removedVolume,targetVolume};}finally{pieces.forEach(p=>p.delete());}},
  finish_result:(model,kind,ground)=>{
   if(kind==='export')return {buffer:rust.writeSTL(model.vertices,model.triangles,ground),triangles:model.triangles.length/3,bounds:model.bounds,volume:model.volume};
   if(kind==='conjoin'){const solid=new K.Manifold(new K.Mesh({numProp:3,vertProperties:model.vertices,triVerts:model.triangles}));const pieces=solid.decompose();try{return {count:pieces.length,bounds:model.bounds};}finally{pieces.forEach(p=>p.delete());solid.delete();}}
   if(kind==='preview'){const display=rust.prepare(model.vertices,model.triangles,model.flatTriangles,model.smoothingGroups);model.displayPositions=display.positions;model.displayNormals=display.normals;}
   return model;
  },
  response:(result,id,type)=>({...result,id,type}),
  error_response:(id,error)=>({id,error:String(error).replace(/^Error: /,'')}),
 };
 python.registerJsModule('avalon_native',bridge);
 const source=options.pythonSource||await(async()=>{const r=await fetch(new URL('python/model_jobs.py',options.baseURL));if(!r.ok)throw Error('The bundled Python jobs could not load.');return r.text();})();
 python.runPython(source);const process=python.globals.get('process_job'),getInfo=python.globals.get('runtime_info');const info=getInfo();getInfo.destroy();
 return {python,rust,info,process:data=>process(data),destroy:()=>process.destroy()};
}
