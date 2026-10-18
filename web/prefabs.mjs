import {prefabForWrite} from './migrate.mjs';
import {validateProject} from './kernel-ui.mjs';
import {DEFAULT_LAYER,booleanProject,layerOf} from './layers.mjs';
import {uid} from './templates.mjs';

export function freshComponents(objects,inherited=new Map()){
 const map=new Map(inherited);for(const o of objects)map.set(o.id,uid());
 return objects.map(o=>{const copy=structuredClone(o);copy.id=map.get(o.id);if(copy.excludedCutouts)copy.excludedCutouts=copy.excludedCutouts.filter(id=>map.has(id)).map(id=>map.get(id));if(copy.params.children)copy.params.children=freshComponents(copy.params.children,map);return copy;});
}
export function prefabParts(objects,includeSubtractions=true){
 function strip(o){if(o.enabled===false||o.mode==='cut')return null;const copy=structuredClone(o);delete copy.excludedCutouts;
  if(copy.params.children){const before=JSON.stringify(copy.params.children),children=copy.params.children.map(strip).filter(Boolean);if(!children.length)return null;copy.params.children=children;if(copy.type==='joined'&&children.length===1){const only=children[0];copy.type='prefab';copy.params.layers=booleanProject([only]).layers;}if(JSON.stringify(children)!==before)delete copy.fillets;delete copy.params.fillOverlaps;if(copy.params.operation==='subtract')copy.params.operation='add';}return copy;
 }
 return includeSubtractions?structuredClone(objects.filter(o=>o.enabled!==false)):objects.map(strip).filter(Boolean);
}
export function makePrefab(objects,name,bounds,layers,{pruneLayers=false}={}){
 if(!bounds||!objects.some(o=>o.mode!=='cut'))throw Error('A prefab needs solid material.');
 if(pruneLayers){const used=new Set(objects.map(layerOf)),kept=layers.filter(l=>used.has(l.id));if(kept.length)layers=kept;}
 const center=bounds.min.map((v,i)=>(v+bounds.max[i])/2),id=uid(),children=freshComponents(objects).map(o=>({...o,position:o.position.map((v,i)=>v-center[i])}));
 const shape={id:uid(),name,type:'prefab',mode:'solid',enabled:true,layerId:DEFAULT_LAYER,position:[0,0,0],rotation:[0,0,0],localBounds:{min:bounds.min.map((v,i)=>v-center[i]),max:bounds.max.map((v,i)=>v-center[i])},params:{children,layers:structuredClone(layers)}};
 return validatePrefab(prefabForWrite({format:'avaloncad-prefab',version:1,id,name,createdAt:Date.now(),object:shape}));
}
export function validatePrefab(value){
 if(!value||value.format!=='avaloncad-prefab'||(value.version!==1&&value.version!==2)||typeof value.id!=='string'||!value.id.length||value.id.length>100||typeof value.name!=='string'||!value.name.trim()||value.name.length>60||value.object?.type!=='prefab')throw Error('This is not a supported AvalonCad prefab.');
 const copy=structuredClone(value);copy.name=copy.name.trim();copy.object.name=copy.name;copy.object.mode='solid';copy.object.enabled=true;
 copy.object=validateProject(booleanProject([copy.object])).objects[0];
 const b=copy.object.localBounds;if(!b||!['min','max'].every(k=>Array.isArray(b[k])&&b[k].length===3&&b[k].every(Number.isFinite))||b.max.some((v,i)=>v<=b.min[i]))throw Error('The prefab is missing valid size information.');
 return copy;
}
export function instantiatePrefab(record,layerId){const out=structuredClone(validatePrefab(record).object);out.id=uid();out.layerId=layerId;out.params.children=freshComponents(out.params.children);out.position=[0,0,(out.localBounds.max[2]-out.localBounds.min[2])/2];return out;}
// Replace the member objects with one instance of the prefab, in place (Addendum A.3 step 5).
// Pure: returns {project,instance}; the caller commits it with a single change().
export function replaceWithInstance(project,memberIds,record,bounds,primaryLayer){
 const members=new Set(memberIds),next=structuredClone(project),at=next.objects.findIndex(o=>members.has(o.id));
 if(at<0)throw Error('The selected objects are no longer in the project.');
 const instance=structuredClone(record.object);instance.id=uid();instance.layerId=primaryLayer;instance.params.children=freshComponents(instance.params.children);
 instance.position=bounds.min.map((v,i)=>(v+bounds.max[i])/2);instance.rotation=[0,0,0];delete instance.positionReference;delete instance.placement;
 next.objects=next.objects.filter(o=>!members.has(o.id));
 // Project cutouts on the instance's layer were either baked in or did not cut the members: never cut the instance again.
 const excluded=next.objects.filter(o=>o.mode==='cut'&&layerOf(o)===primaryLayer).map(o=>o.id);
 if(excluded.length>100)throw Error('Too many cutouts on this layer to replace the selection (maximum 100).');
 if(excluded.length)instance.excludedCutouts=excluded;else delete instance.excludedCutouts;
 for(const o of next.objects)if(o.excludedCutouts){o.excludedCutouts=o.excludedCutouts.filter(id=>!members.has(id));if(!o.excludedCutouts.length)delete o.excludedCutouts;}
 next.objects.splice(at,0,instance);
 return {project:next,instance};
}
