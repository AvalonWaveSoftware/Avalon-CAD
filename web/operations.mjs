import * as T from 'three';
import {layerOf,assertSameLayer} from './layers.mjs';
import {facetedSphere,customFaces} from './facets.mjs';
import {isThread,containsThreads} from './threads.mjs';
import {polyBounds,POLYHEDRON_TYPES} from './polyhedra-shapes.mjs';
import {GLYPH_METRICS} from './glyph-metrics.mjs';
// Letters: outline bounding box × size / cap height (UI-safe metrics only), and the extrusion depth.
export function glyphDimensions(p){const m=GLYPH_METRICS.m[p.char],k=p.size/GLYPH_METRICS.capHeight;return m?[(m[2]-m[0])*k,(m[3]-m[1])*k,p.depth]:[p.size,p.size,p.depth];}
export const axes=['X','Y','Z'];
export function rotation(o){return new T.Euler(...o.rotation.map(T.MathUtils.degToRad),'ZYX');}
export function matrix(o){return new T.Matrix4().compose(new T.Vector3(...o.position),new T.Quaternion().setFromEuler(rotation(o)),new T.Vector3(...(o.scale||[1,1,1])).multiply(new T.Vector3(o.mirrored?-1:1,1,1)));}
export function direction(o,axis,sign=1){const v=new T.Vector3();v.setComponent(axis,sign*(axis===0&&o.mirrored?-1:1));return v.applyEuler(rotation(o));}
function facetedBounds(o){const n=customFaces(o);if(!n||!['cylinder','cone','tube','sphere'].includes(o.type))return null;const p=o.params,r=Math.max(p.diameter,p.top||0)/2,pts=o.type==='sphere'?facetedSphere(n,p.diameter).flatMap(f=>f.points):Array.from({length:n},(_,i)=>[r*Math.cos(i*2*Math.PI/n),r*Math.sin(i*2*Math.PI/n),0]);const min=[0,1,2].map(i=>Math.min(...pts.map(a=>a[i]))),max=[0,1,2].map(i=>Math.max(...pts.map(a=>a[i])));if(o.type!=='sphere'){min[2]=-p.h/2;max[2]=p.h/2;}return {min,max};}
export function dimensions(o){const p=o.params,s=o.scale||[1,1,1];let d;
 switch(o.type){case'threadrod':{const diameter=p.diameter-2*p.clearance;d=[diameter,diameter,p.h];break;}case'threadtube':d=[p.outer,p.outer,p.h];break;case'wedge':case'pyramid':case'box':case'rounded':case'triprism':d=[p.w,p.d,p.h];break;case'tetrahedron':case'octahedron':case'decahedron':case'dodecahedron':case'icosahedron':d=polyBounds(o.type,p);break;case'torus':d=[p.diameter,p.diameter,p.tube];break;case'glyph':d=glyphDimensions(p);break;case'cylinder':case'cone':case'tube':d=[Math.max(p.diameter,p.top||0),Math.max(p.diameter,p.top||0),p.h];break;case'sphere':d=[p.diameter,p.diameter,p.diameter];break;case'polygon':d=[Math.max(...p.points.map(a=>a[0]))-Math.min(...p.points.map(a=>a[0])),Math.max(...p.points.map(a=>a[1]))-Math.min(...p.points.map(a=>a[1])),p.h];break;default:{const b=o.localBounds;if(b)d=b.max.map((v,i)=>v-b.min[i]);else d=[1,1,1];}}
 const bounds=facetedBounds(o);if(bounds)d=bounds.max.map((v,i)=>v-bounds.min[i]);
 return d.map((v,i)=>v*s[i]);
}
export function stretch(o,axis,sign,amount){const out=structuredClone(o),d=dimensions(o),p=out.params,s=out.scale||[1,1,1];let next=Math.max(.05,d[axis]+amount);
 // Torus: the tube diameter stays below half the outer diameter.
 if(o.type==='torus')next=axis===2?Math.max(.05,Math.min(next,p.diameter/2-.05)):Math.max(next,2*p.tube+.05);
 const delta=next-d[axis];
 if(['joined','prefab'].includes(o.type)&&containsThreads(o))throw Error('Separate the components to change thread length without changing pitch.');
 if(isThread(o)){if(axis!==2)throw Error('Threaded parts stretch in length only. Change thread diameter in Edit.');p.h=next;if(sign<0)p.phase=((p.phase-delta)%p.pitch+p.pitch)%p.pitch;}
 else if(['wedge','pyramid','box','rounded','triprism'].includes(o.type)){const key=['w','d','h'][axis];p[key]=next/s[axis];if(o.type==='rounded')p.r=Math.min(p.r,p.w/2-.0001,p.d/2-.0001);}
 else if(['cylinder','cone','tube','sphere'].includes(o.type)){
  if(axis===2&&o.type!=='sphere')p.h=next/s[axis];else{const ratio=next/d[axis];p.diameter*=ratio;if(p.inner)p.inner*=ratio;if(p.top)p.top*=ratio;}
 }else if(POLYHEDRON_TYPES.includes(o.type)){const ratio=next/d[axis];if(o.type==='decahedron'){p.diameter*=ratio;p.h*=ratio;}else p.size*=ratio; // uniform: keeps the solid regular
 }else if(o.type==='torus'){if(axis===2)p.tube=next/s[axis];else p.diameter=next/s[axis];
 }else if(o.type==='glyph'){if(axis===2)p.depth=next/s[axis];else p.size*=next/d[axis];
 }else if(o.type==='polygon'){
  if(axis===2)p.h=next/s[axis];else{const vals=p.points.map(a=>a[axis]),mid=(Math.max(...vals)+Math.min(...vals))/2,ratio=next/d[axis];for(const a of p.points)a[axis]=mid+(a[axis]-mid)*ratio;}
 }else {out.scale=[...s];out.scale[axis]*=next/d[axis];}
 const offset=facetedBounds(o)?(localCenter(o)[axis]-localCenter(out)[axis])*s[axis]:0;
 const shift=direction(o,axis).multiplyScalar(sign*delta/2+offset);out.position=out.position.map((v,i)=>v+shift.getComponent(i));
 return out;
}
export function faceAxis(o,normal){const n=new T.Vector3(...normal);const order=[0,1,2].sort((a,b)=>Math.abs(n.getComponent(b))-Math.abs(n.getComponent(a)));return {axis:order[0],sign:n.getComponent(order[0])>=0?1:-1};}
export function localCenter(o){const b=facetedBounds(o);if(b)return b.min.map((v,i)=>(v+b.max[i])/2);if(o.type==='polygon'){return [0,1].map(i=>(Math.max(...o.params.points.map(p=>p[i]))+Math.min(...o.params.points.map(p=>p[i])))/2).concat(0);}if(o.localBounds)return o.localBounds.min.map((v,i)=>(v+o.localBounds.max[i])/2);return [0,0,0];}
export function worldCenter(o){return new T.Vector3(...localCenter(o)).applyMatrix4(matrix(o)).toArray();}
export function centerPoints(o,topology){const m=matrix(o),d=dimensions(o),points=[{kind:'center',label:'Object center',point:worldCenter(o)}];
 for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){const local=localCenter(o);local[axis]+=sign*d[axis]/2/(o.scale?.[axis]||1);const v=new T.Vector3(...local).applyMatrix4(m);points.push({kind:'axis',axis,sign,label:axes[axis]+' face center',point:v.toArray()});}
 if(topology)for(const f of topology.faces.filter(f=>f.kind==='PLANE')){const p=new T.Vector3(...f.center).applyMatrix4(m);points.push({kind:'face',face:f.index,label:'Face center',point:p.toArray()});}
 return points;
}
export function alignCenters(o,target){const result=structuredClone(o);const a=worldCenter(o),b=worldCenter(target);result.position=result.position.map((v,i)=>v+b[i]-a[i]);return result;}
export function alignFaceCenters(o,axis,sign,target,targetAxis,targetSign,overlap=.02){const out=structuredClone(o),d=dimensions(o),td=dimensions(target),a=direction(o,axis,sign).multiplyScalar(d[axis]/2),b=direction(target,targetAxis,targetSign).multiplyScalar(td[targetAxis]/2);const sourceCenter=worldCenter(o),targetCenter=worldCenter(target);out.position=out.position.map((v,i)=>v+targetCenter[i]+b.getComponent(i)-sourceCenter[i]-a.getComponent(i));const into=direction(target,targetAxis,targetSign).multiplyScalar(-overlap);out.position=out.position.map((v,i)=>v+into.getComponent(i));return out;}
// ADR-0001 F6: kind 'chamfer' stores a symmetric chamfer distance in radius (save format v3); rounds keep {edges,radius}.
export function withRoundover(o,edgeIndices,radius,kind){const result=structuredClone(o);result.fillets=result.fillets||[];const chosen=new Set(edgeIndices);result.fillets=result.fillets.map(f=>({...f,edges:f.edges.filter(e=>!chosen.has(e))})).filter(f=>f.edges.length);if(radius>0)result.fillets.push(kind==='chamfer'?{edges:[...chosen],radius,kind}:{edges:[...chosen],radius});return result;}
export function conjoined(objects,id,bounds){const center=bounds?bounds.min.map((v,i)=>(v+bounds.max[i])/2):[0,1,2].map(i=>objects.reduce((s,o)=>s+o.position[i],0)/objects.length);return {id,layerId:layerOf(objects[0]),name:'Conjoined solid',type:'joined',mode:'solid',enabled:true,position:center,rotation:[0,0,0],params:{children:objects.map(o=>({...structuredClone(o),position:o.position.map((v,i)=>v-center[i])}))}};}
export function selectedPieces(project,ids){return ids.map(id=>project.objects.find(o=>o.id===id)).filter(o=>o?.enabled);}
export function mergeResult(objects,id,bounds,cutouts=[],fillOverlaps=false){
 assertSameLayer(objects,cutouts);
 const child=(o,mode)=>({...structuredClone(o),sourceMode:o.mode,mode});
 const result=conjoined([...objects.map(o=>child(o,'solid')),...cutouts.map(o=>child(o,'cut'))],id,bounds);result.params.operation='add';
 if(fillOverlaps)result.params.fillOverlaps=true;
 const excluded=objects.flatMap(o=>o.excludedCutouts||[]);
 if(excluded.length)result.excludedCutouts=[...new Set(excluded)];
 result.name='Merged solid';return result;
}
export function connectingBridges(objects,diameter,create){const result=[];for(let i=1;i<objects.length;i++){const a=new T.Vector3(...objects[0].position),b=new T.Vector3(...objects[i].position),v=b.clone().sub(a),length=v.length();if(length<.05)continue;const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),v.normalize()),e=new T.Euler().setFromQuaternion(q,'ZYX'),o=create('cylinder',{diameter,h:length+diameter},a.add(b).multiplyScalar(.5).toArray(),'Connecting bridge');o.rotation=[e.x,e.y,e.z].map(T.MathUtils.radToDeg);o.layerId=layerOf(objects[0]);result.push(o);}return result;}

// S R F is a proper rotation; the remaining local reflection toggles handedness.
export function mirrorObject(o,plane,center=worldCenter(o)){
 const axis={YZ:0,XZ:1,XY:2}[plane];if(axis===undefined)throw Error('Invalid mirror plane.');
 const out=structuredClone(o),s=new T.Matrix4().makeScale(...[0,1,2].map(i=>i===axis?-1:1));
 const r=s.multiply(new T.Matrix4().makeRotationFromEuler(rotation(o))).multiply(new T.Matrix4().makeScale(-1,1,1));
 const e=new T.Euler().setFromRotationMatrix(r,'ZYX');out.rotation=[e.x,e.y,e.z].map(T.MathUtils.radToDeg);
 out.position[axis]=2*center[axis]-out.position[axis];
 if(out.placement)out.placement[axis]=2*center[axis]-out.placement[axis];
 if(o.mirrored)delete out.mirrored;else out.mirrored=true;return out;
}
