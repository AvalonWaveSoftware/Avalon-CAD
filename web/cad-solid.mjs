import {primitiveFaces} from './polyhedra.mjs';
import {materialGroups} from './layers.mjs';
import * as R from 'replicad';
import {facetedSphere,resolutionTolerance,customFaces} from './facets.mjs';
import {isThread} from './threads.mjs';
const cache=new Map();
const dispose=o=>{try{o?.delete();}catch{}};
export async function initSolid(options={}) {
 const {default:init}=await import('replicad-opencascadejs');const oc=await init(options);R.setOC(oc);return {oc,R};
}
function baseShape(o) {
 const p=o.params,n=customFaces(o);let s;
 const prism=(radius,height,z=-height/2)=>{const f=R.makePolygon(Array.from({length:n},(_,i)=>[radius*Math.cos(i*2*Math.PI/n),radius*Math.sin(i*2*Math.PI/n),z])),v=new R.Vector([0,0,height]);try{return R.basicFaceExtrusion(f,v);}finally{dispose(f);dispose(v);}};
 const polySolid=polygons=>{const faces=polygons.map(points=>R.makePolygon(points));try{return R.makeSolid(faces);}finally{faces.forEach(dispose);}};
 if(n){
  if(o.type==='sphere')return polySolid(facetedSphere(n,p.diameter).map(f=>f.points));
  if(o.type==='cylinder')return prism(p.diameter/2,p.h);
  if(o.type==='tube'){const a=prism(p.diameter/2,p.h),b=prism(p.inner/2,p.h+.2,-p.h/2-.1);try{return a.cut(b);}finally{dispose(a);dispose(b);}}
  if(o.type==='cone'){const ring=(r,z)=>Array.from({length:n},(_,i)=>[r*Math.cos(i*2*Math.PI/n),r*Math.sin(i*2*Math.PI/n),z]),bottom=ring(p.diameter/2,-p.h/2),top=ring(p.top/2,p.h/2),polygons=[[...bottom].reverse()];if(p.top>0)polygons.push(top);for(let i=0;i<n;i++){const j=(i+1)%n;polygons.push(p.top>0?[bottom[i],bottom[j],top[j],top[i]]:[bottom[i],bottom[j],[0,0,p.h/2]]);}return polySolid(polygons);}
  if(o.type==='rounded'){const pts=[],r=Math.min(p.r,p.w/2,p.d/2);for(let k=0;k<4;k++){const cx=(k===0||k===3?1:-1)*(p.w/2-r),cy=(k<2?1:-1)*(p.d/2-r);for(let i=0;i<=n;i++){const a=k*Math.PI/2+i*Math.PI/2/n;pts.push([cx+r*Math.cos(a),cy+r*Math.sin(a),-p.h/2]);}}const clean=pts.filter((a,i)=>!i||Math.hypot(...a.map((v,j)=>v-pts[i-1][j]))>1e-7);if(Math.hypot(...clean[0].map((v,j)=>v-clean.at(-1)[j]))<1e-7)clean.pop();const f=R.makePolygon(clean),v=new R.Vector([0,0,p.h]);try{return R.basicFaceExtrusion(f,v);}finally{dispose(f);dispose(v);}}
 }
 switch(o.type) {
  case 'wedge':case 'pyramid':{const {vertices,faces}=primitiveFaces(o.type,p);s=polySolid(faces.map(f=>f.map(i=>vertices[i])));break;}
  case 'box':s=R.makeBox([-p.w/2,-p.d/2,-p.h/2],[p.w/2,p.d/2,p.h/2]);break;
  case 'rounded':s=R.drawRoundedRectangle(p.w,p.d,Math.min(p.r,p.w/2-1e-5,p.d/2-1e-5)).sketchOnPlane('XY',-p.h/2).extrude(p.h);break;
  case 'cylinder':s=R.makeCylinder(p.diameter/2,p.h,[0,0,-p.h/2]);break;
  case 'tube':{const a=R.makeCylinder(p.diameter/2,p.h,[0,0,-p.h/2]),b=R.makeCylinder(p.inner/2,p.h+.2,[0,0,-p.h/2-.1]);try{s=a.cut(b);}finally{dispose(a);dispose(b);}break;}
  case 'cone':{const pts=[[0,0,-p.h/2],[p.diameter/2,0,-p.h/2],[p.top/2,0,p.h/2]];if(p.top>0)pts.push([0,0,p.h/2]);const f=R.makePolygon(pts);try{s=R.revolution(f,[0,0,0],[0,0,1],360);}finally{dispose(f);}break;}
  case 'sphere':s=R.makeSphere(p.diameter/2);break;
  case 'polygon':{const area=p.points.reduce((s,a,i)=>{const b=p.points[(i+1)%p.points.length];return s+a[0]*b[1]-a[1]*b[0];},0);const pts=area<0?[...p.points].reverse():p.points;const f=R.makePolygon(pts.map(a=>[a[0],a[1],-p.h/2])),v=new R.Vector([0,0,p.h]);try{s=R.basicFaceExtrusion(f,v);}finally{dispose(f);dispose(v);}break;}
  case 'prefab':{for(const group of materialGroups(p.children)){let merged;for(const child of [...group.solids,...group.cuts]){const a=fullShape(child);if(!merged)merged=a;else{const old=merged;try{merged=child.mode==='cut'?old.cut(a):old.fuse(a);}finally{dispose(old);dispose(a);}}}const fs=merged.faces,empty=!fs.length;fs.forEach(dispose);if(empty){dispose(merged);continue;}if(!s)s=merged;else{const old=s;try{s=old.fuse(merged);}finally{dispose(old);dispose(merged);}}}if(!s)throw Error('The prefab contains no solid material.');break;}
  case 'joined':{
   const solid=p.children.filter(c=>c.mode!=='cut'),cuts=p.children.filter(c=>c.mode==='cut'),order=p.fillOverlaps?[solid[0],...cuts,...solid.slice(1)]:[...solid,...cuts];
   for(const child of order){const a=fullShape(child);if(!s){s=a;}else{const old=s;try{s=child.mode==='cut'?old.cut(a):old.fuse(a);}finally{dispose(old);dispose(a);}}}break;
  }
  default:throw Error('Edge roundovers require parametric shapes. Imported STL meshes can still be moved, stretched and conjoined.');
 }
 return s;
}
function applyFillets(base,fillets,edges) {
 if(!fillets?.some(f=>f.radius>0))return base.clone();
 const radii=new Map();for(const f of fillets)for(const index of f.edges)if(edges[index])radii.set(edges[index].hashCode,f.radius);
 try{return base.fillet(e=>radii.get(e.hashCode)||0);}catch{throw Error('That roundover is too large or conflicts with another edge. Reduce the radius.');}
}
function fullShape(o) {
 if(o.scale?.some(v=>Math.abs(v-1)>1e-8))throw Error('A scaled compound uses mesh editing. Round its component shapes before conjoining.');
 const s=baseShape(o),edges=s.edges;let r;
 try{r=applyFillets(s,o.fillets,edges);}finally{edges.forEach(dispose);dispose(s);}
 if(o.rotation?.some(v=>v)){for(let i=0;i<3;i++)if(o.rotation[i]){const dir=[0,0,0];dir[i]=1;r=r.rotate(o.rotation[i],[0,0,0],dir);}}
 if(o.position)r=r.translate(o.position);return r;
}
function safeTuple(v){try{return v.toTuple();}finally{dispose(v);}}
function topology(s,edges) {
 const faces=s.faces,edgeIds=new Map(edges.map((e,i)=>[e.hashCode,i]));
 const mesh=s.mesh({tolerance:.08,angularTolerance:.12});
 const groups=mesh.faceGroups.map(g=>({...g,face:faces.findIndex(f=>f.hashCode===g.faceId)}));
 const lines=s.meshEdges({tolerance:.06,angularTolerance:.12});
 const edgeData=lines.edgeGroups.map(g=>({index:edgeIds.get(g.edgeId),points:Array.from(lines.lines.slice(g.start*3,(g.start+g.count)*3))})).filter(e=>e.index!==undefined);
 const faceData=faces.map((f,i)=>{const es=f.edges;let center=[0,0,0],normal=[0,0,1];try{center=safeTuple(f.center);normal=safeTuple(f.normalAt());}catch{}const indices=es.map(e=>edgeIds.get(e.hashCode)).filter(e=>e!==undefined);es.forEach(dispose);const wires=[f.clone().outerWire(),...f.clone().innerWires()],loops=wires.map(w=>{const eds=w.edges,result=eds.map(e=>edgeIds.get(e.hashCode)).filter(e=>e!==undefined);eds.forEach(dispose);dispose(w);return result;});return {index:i,kind:f.geomType,center,normal,edges:indices,loops};});
 const pickEdges=edgeData.filter(e=>{const adjacent=faceData.filter(f=>f.edges.includes(e.index)).map(f=>faces[f.index]);if(adjacent.length<2)return false;try{const at=safeTuple(edges[e.index].pointAt(.5)),a=safeTuple(adjacent[0].normalAt(at)),b=safeTuple(adjacent[1].normalAt(at)),dot=a.reduce((sum,v,i)=>sum+v*b[i],0)/(Math.hypot(...a)*Math.hypot(...b));return Math.abs(dot)<.9999;}catch{return true;}});
 faces.forEach(dispose);
 return {vertices:new Float32Array(mesh.vertices),triangles:new Uint32Array(mesh.triangles),groups,faces:faceData,edges:pickEdges};
}
function cached(o) {
 const key=JSON.stringify([o.type,o.params,o.fillets||[],o.resolution||null]);
 if(cache.has(key)){const v=cache.get(key);cache.delete(key);cache.set(key,v);return v;}
 const base=baseShape(o),edges=base.edges;let s,t;
 try{t=topology(base,edges);s=applyFillets(base,o.fillets,edges);}finally{edges.forEach(dispose);dispose(base);}
 const surfaceFaces=s.faces;t.faceCount=surfaceFaces.length;t.flatFaces=surfaceFaces.filter(f=>f.geomType==='PLANE').length;surfaceFaces.forEach(dispose);
 const entry={s,topology:t};cache.set(key,entry);while(cache.size>20){const first=cache.keys().next().value;dispose(cache.get(first).s);cache.delete(first);}return entry;
}
export function solidMesh(o,tolerance,display=false) {
 tolerance=resolutionTolerance(o,tolerance);
 const {s}=cached(o),m=s.mesh({tolerance:Math.max(.001,tolerance*.5),angularTolerance:Math.min(.18,Math.max(.025,Math.sqrt(tolerance/10)))});
 const result={vertices:new Float32Array(m.vertices),triangles:new Uint32Array(m.triangles)};
 if(display){const faces=s.faces,planes=new Set(faces.filter(f=>f.geomType==='PLANE').map(f=>f.hashCode));faces.forEach(dispose);result.displayGroups=m.faceGroups.map(g=>({start:g.start,count:g.count,flat:planes.has(g.faceId)})).sort((a,b)=>a.start-b.start);}
 return result;
}
export function objectTopology(o) {if(isThread(o)||['joined','prefab'].includes(o.type)&&containsMesh(o))return null;try{return cached(o).topology;}catch(e){if(o.type==='mesh'||['joined','prefab'].includes(o.type)&&(containsMesh(o)||containsScale(o)))return null;throw e;}}
function containsScale(o){return o.scale?.some(v=>Math.abs(v-1)>1e-8)||o.params?.children?.some(containsScale);}
function containsMesh(o){return o.type==='mesh'||isThread(o)||o.params?.children?.some(containsMesh);}
export function disposeSolidCache(){for(const {s} of cache.values())dispose(s);cache.clear();}
