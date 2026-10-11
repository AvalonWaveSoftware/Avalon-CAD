export const DEFAULT_LAYER='layer-1';
export const layerOf=o=>o.layerId??DEFAULT_LAYER;
export const layerName=(project,id=project.activeLayer??DEFAULT_LAYER)=>project.layers?.find(l=>l.id===id)?.name||'Layer 1';
export function validateLayers(project){
 const layers=project.layers??[{id:DEFAULT_LAYER,name:'Layer 1'}];
 if(!Array.isArray(layers)||!layers.length||layers.length>100)throw Error('A project needs 1–100 layers.');
 const ids=new Set();
 for(const l of layers){if(!l||typeof l.id!=='string'||!l.id.length||l.id.length>100||ids.has(l.id)||typeof l.name!=='string'||!l.name.trim()||l.name.length>60)throw Error('Invalid project layer.');ids.add(l.id);}
 if(!ids.has(project.activeLayer??layers[0].id))throw Error('The active layer is missing.');
 for(const o of project.objects)if(!ids.has(layerOf(o)))throw Error('An object refers to a missing layer.');
 return layers;
}
export function normalizeLayers(project){
 const layers=validateLayers(project);project.layers=structuredClone(layers);project.activeLayer??=layers[0].id;
 for(const o of project.objects)o.layerId??=DEFAULT_LAYER;
 return project;
}
export function assertSameLayer(objects,cutouts=[]){
 const id=layerOf(objects[0]||{});
 if([...objects,...cutouts].some(o=>layerOf(o)!==id))throw Error('Add and Subtract must use shapes on the same layer. Move them to one layer in Edit first.');
 return id;
}
export function booleanProject(objects){const ids=new Set();function visit(o){ids.add(layerOf(o));if(o.type!=='prefab')for(const c of o.params?.children||[])visit(c);}objects.forEach(visit);return {format:'tristancad',version:1,objects,layers:[...ids].map(id=>({id,name:id}))};}
export function materialGroups(objects){
 const enabled=objects.filter(o=>o.enabled!==false),cuts=enabled.filter(o=>o.mode==='cut'),groups=new Map();
 for(const o of enabled.filter(o=>o.mode!=='cut')){const active=cuts.filter(c=>layerOf(c)===layerOf(o)&&!o.excludedCutouts?.includes(c.id)),key=active.map(c=>c.id).join('\0');if(!groups.has(key))groups.set(key,{solids:[],cuts:active});groups.get(key).solids.push(o);}
 return [...groups.values()];
}
