// WS3 (ADR v2): persistent render resources. A shared material is created once per (kind, parameters) and its
// dispose() is a no-op, so every existing disposal path (disposeGroup, touch-tools clear, applyModel) leaves the
// WebGL program alive and no edit re-links or re-compiles. Sphere geometries are shared per radius for one draw
// generation: beginSpheres() at the start of a redraw really disposes the radii the previous redraw did not reuse.
// Materials are never mutated after creation (only the startup grid material is, and it is not shared).
import {PERSISTENT_GL} from './perf-flags.mjs';
const materials=new Map();
export function material(kind,Class,params){if(!PERSISTENT_GL)return new Class(params);const key=kind+JSON.stringify(params);let m=materials.get(key);
 if(!m){m=new Class(params);m.dispose=()=>{};materials.set(key,m);}return m;}
// A geometry pool for one redraw generation. get(key, build) shares a geometry built this generation for the same key
// (same radius/points); otherwise it builds the geometry and, when a geometry from the previous generation has the same
// layout (attribute names, types and lengths, index length), copies the new arrays into that one (bufferSubData into
// the existing GL buffers, identical values) and uses it instead. begin() really disposes what the previous redraw
// left unused. Pooled geometries ignore dispose(), so the existing clear()/disposeGroup paths stay as they are.
const layout=g=>Object.entries(g.attributes).map(([k,a])=>k+':'+a.array.constructor.name+':'+a.array.length+':'+a.itemSize).join('|')+'#'+(g.index?g.index.array.constructor.name+g.index.array.length:'');
export function geometryPool(){let current=new Map(),previous=[];
 const adopt=g=>{if(!g.release){g.release=g.dispose.bind(g);g.dispose=()=>{};}return g;};
 return {
  begin(){for(const g of previous)g.release();previous=[...new Set(current.values())];current=new Map();},
  get(key,build){if(!PERSISTENT_GL)return build();let g=current.get(key);if(g)return g;const fresh=build(),l=layout(fresh),i=previous.findIndex(x=>x.userData.layout===l);
   if(i>=0){g=previous.splice(i,1)[0];updateInPlace(g,Object.fromEntries(Object.entries(fresh.attributes).map(([k,a])=>[k,a.array])),fresh.index?.array);fresh.dispose();}
   else{g=adopt(fresh);g.userData.layout=l;}
   current.set(key,g);return g;},
  size:()=>current.size+previous.length,
 };}
const spheres=geometryPool();
export const beginSpheres=()=>spheres.begin();
export function sphere(Geometry,radius,width,height){if(!PERSISTENT_GL)return new Geometry(radius,width,height);return spheres.get('s'+radius+','+width+','+height,()=>new Geometry(radius,width,height));}
// Copy arrays into a geometry's attributes when every length matches (bufferSubData, no new GL buffer); false otherwise.
export function updateInPlace(g,attributes,index){if(!PERSISTENT_GL)return false;
 for(const [name,array] of Object.entries(attributes)){const a=g.attributes[name];if(!a||a.array.length!==array.length||a.array.constructor!==array.constructor)return false;}
 if(Object.keys(g.attributes).length!==Object.keys(attributes).length)return false;
 if(index!==undefined&&(!g.index||g.index.array.length!==index.length||g.index.array.constructor!==index.constructor))return false;
 for(const [name,array] of Object.entries(attributes)){const a=g.attributes[name];a.array.set(array);a.needsUpdate=true;}
 if(index!==undefined){g.index.array.set(index);g.index.needsUpdate=true;}
 g.boundingBox=null;g.boundingSphere=null;return true;}
// Tool and overlay geometry rebuilt on every redraw (axis lines, selection edges): recycled by layout, never shared.
let unique=0;export const pooled=(pool,build)=>PERSISTENT_GL?pool.get('u'+(++unique),build):build();
export const toolPool=spheres,overlayPool=geometryPool();
export const sharedCounts=()=>({materials:materials.size,spheres:spheres.size()});
