import {BUNDLE_SPLIT} from './perf-flags.mjs';
// WS7 (ADR v2): model/job assembly in JS. A line-for-line port of engine/python/model_jobs.py (build_model,
// evaluate_boolean, process_job, runtime_info) over the same native bridge, with the same messages. The Python file
// stays as the test-only parity oracle (tests/js-engine-parity.mjs) and as the JS_ENGINE=false build.
// engine.info keeps its shape; the Python version it reported is kept as a constant (ADR D2).
export const PYTHON_VERSION='3.13.2';
const TYPES=new Set(['box','rounded','cylinder','cone','sphere','tube','threadrod','threadtube','polygon','mesh','joined','wedge','pyramid','prefab','torus','triprism','tetrahedron','octahedron','decahedron','dodecahedron','icosahedron','glyph']);
// WS9 (BUNDLE_SPLIT): the UI never sends 'conjoin' (dead since the operations moved to the UI); it is unsupported.
const KINDS=['preview','check','export','boolean',...(BUNDLE_SPLIT?[]:['conjoin']),'place','groundProject'];
const field=(obj,name,fallback)=>{const v=obj?.[name];return v==null?fallback:v;};
// Python's math.isfinite raised a TypeError for a non-numeric coordinate; here it is an invalid coordinate (the UI's
// validateProject rejects such projects before any job, so no caller reaches this case).
const isFinite=v=>(typeof v==='number'||typeof v==='boolean')&&Number.isFinite(+v);
export function validateObjects(objects){
 if(objects.length>100)throw Error('Maximum 100 objects per project.');
 const ids=new Set();
 for(const obj of objects){
  if(!TYPES.has(field(obj,'type'))||typeof field(obj,'id')!=='string'||ids.has(obj.id))throw Error('Project contains an invalid object.');
  ids.add(obj.id);
  for(const key of ['position','rotation']){const values=field(obj,key);if(values==null||values.length!==3||Array.from(values).some(v=>!isFinite(v)||Math.abs(v)>10000))throw Error('Invalid object coordinates.');}
 }
}
export function jsJobs(native){
 function buildModel(project,tolerance,individual=false){
  if(field(project,'format')!=='tristancad'||![2,3].includes(field(project,'version')))throw Error('This is not a supported AvalonCad project.');
  validateObjects(project.objects);native.validate_layers(project);
  const owned=[],parts=[],solids=[],cuts=[],adjustments=[],styles=individual?native.styles():undefined,own=s=>(owned.push(s),s);
  try{
   for(const obj of project.objects){
    if(field(obj,'enabled',true)===false)continue;
    let solid=own(native.make_object(obj,tolerance,styles));
    if(field(project,'buildPlaneEnabled',false)){const grounded=native.floor_solid(obj,solid);if(grounded){solid=own(grounded.solid);adjustments.push(grounded.adjustment);}}
    (field(obj,'mode')==='cut'?cuts:solids).push([obj,solid]);
    if(individual)parts.push(native.part(obj,solid,styles));
   }
   if(!solids.length){const model=native.empty_result(parts,styles);model.floorAdjustments=adjustments;return model;}
   const groups=new Map();
   for(const [obj,solid] of solids){
    const excluded=new Set(field(obj,'excludedCutouts',[])),active=cuts.filter(([c])=>field(c,'layerId','layer-1')===field(obj,'layerId','layer-1')&&!excluded.has(c.id)),key=JSON.stringify(active.map(([c])=>c.id));
    if(!groups.has(key))groups.set(key,[[],active.map(([,s])=>s)]);groups.get(key)[0].push(solid);
   }
   if(individual){const merged=native.preview_merge([...groups.values()].map(([g,c])=>[[...g],[...c]]),parts,styles);if(merged!=null){merged.floorAdjustments=adjustments;return merged;}}
   const material=[];
   for(const [groupSolids,groupCuts] of groups.values()){let merged=own(native.union(groupSolids));if(groupCuts.length)merged=own(merged.subtract(own(native.union(groupCuts))));material.push(merged);}
   const result=own(native.union(material));
   if(result.status()!=='NoError')throw Error('Could not build the solid: '+result.status());
   const model=native.model_result(result,parts,styles);model.floorAdjustments=adjustments;return model;
  }finally{for(const s of owned)native.dispose(s);}
 }
 function evaluateBoolean(job){
  const objects=job.objects,operation=job.operation,tolerance=field(job,'tolerance',.03),cutouts=field(job,'cutouts',[]);
  if(operation!=='add')throw Error('Only Merge is supported.');
  if(!objects.length||objects.length<2&&!cutouts.length)throw Error('Select at least two shapes to merge.');
  validateObjects([...objects,...cutouts]);native.assert_same_layer(objects,cutouts);
  const owned=[],own=s=>(owned.push(s),s);
  try{
   const solids=objects.map(o=>own(native.make_object(o,tolerance,undefined)));
   const cuts=cutouts.length?own(native.union(cutouts.map(o=>own(native.make_object(o,tolerance,undefined))))):null;
   let result;
   if(cuts!==null&&field(job,'fillOverlaps',false)){const base=own(solids[0].subtract(cuts));result=own(native.union([base,...solids.slice(1)]));}
   else{result=own(native.union(solids));if(cuts!==null)result=own(result.subtract(cuts));}
   if(result.status()!=='NoError')throw Error('The operation could not produce a closed solid. Check the shapes and their overlap.');
   if(result.isEmpty()||!(result.volume()>0))throw Error('The selected shapes have no material remaining.');
   return native.boolean_result(result,0,0);
  }finally{for(const s of owned)native.dispose(s);}
 }
 function processJob(job){
  try{
   const kind=field(job,'type');let result;
   if(!KINDS.includes(kind))throw Error('Unsupported geometry command.');
   if(kind==='place')result=native.place_object(job.object,job.position,field(job,'floor',false));
   else if(kind==='groundProject')result=native.ground_project(job.project);
   else if(kind==='boolean')result=evaluateBoolean(job);
   else{const model=buildModel(job.project,field(job,'tolerance',.15),kind==='preview');result=native.finish_result(model,kind,field(job,'ground',true));}
   return native.response(result,field(job,'id'),kind);
  }catch(error){return native.error_response(field(job,'id'),String(error));}
 }
 return {process:processJob,info:native.runtime_info(PYTHON_VERSION)};
}
