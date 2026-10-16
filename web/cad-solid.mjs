import {primitiveFaces} from './polyhedra.mjs';
import {materialGroups} from './layers.mjs';
import * as R from 'replicad';
import {facetedSphere,resolutionTolerance,customFaces} from './facets.mjs';
import {isThread} from './threads.mjs';
import {OCCT_SCOPE,OCCT_CACHE_ENTRIES,TOPOLOGY_SERVICE} from './perf-flags.mjs';
import {geometryHash} from './topology-pack.mjs';
import {withScope,setHeapSource} from './occt-scope.mjs';
export {heapBytes} from './occt-scope.mjs';
const cache=new Map();
const dispose=o=>{try{o?.delete();}catch{}};
export async function initSolid(options={}) {
 const {default:init}=await import('replicad-opencascadejs');const oc=await init(options);R.setOC(oc);setHeapSource(oc);gpropFace=projector=null;return {oc,R};
}
// WS1: replicad's cut()/fuse() leave the BRepAlgoAPI builder (with its whole boolean history) to a
// FinalizationRegistry, so under continuous edits the OCCT heap grows until GC happens to run. The scoped
// version issues the same OCCT calls (glue unset, Build, SimplifyResult(true,true,.001), Shape) and deletes the
// builder at once. Its destructor alone does not release the boolean data structures (≈0.12 MB per tube cut
// stayed in the heap), so Clear() runs first. Error text is unchanged.
function cut(a,b){return OCCT_SCOPE?scopedBoolean(true,a,b):a.cut(b);}
function fuse(a,b){return OCCT_SCOPE?scopedBoolean(false,a,b):a.fuse(b);}
function scopedBoolean(isCut,a,b){const oc=R.getOC(),builder=isCut?new oc.BRepAlgoAPI_Cut(a.wrapped,b.wrapped):new oc.BRepAlgoAPI_Fuse(a.wrapped,b.wrapped);let raw;
 try{builder.Build();builder.SimplifyResult(true,true,.001);raw=builder.Shape();}finally{builder.Clear();builder.delete();}
 const shape=R.cast(raw);if(!R.isShape3D(shape)){dispose(shape);throw new Error(`Could not ${isCut?'cut':'fuse'} as a 3d shape`);}return shape;}
function baseShape(o) {
 const p=o.params,n=customFaces(o);let s;
 const prism=(radius,height,z=-height/2)=>{const f=R.makePolygon(Array.from({length:n},(_,i)=>[radius*Math.cos(i*2*Math.PI/n),radius*Math.sin(i*2*Math.PI/n),z])),v=new R.Vector([0,0,height]);try{return R.basicFaceExtrusion(f,v);}finally{dispose(f);dispose(v);}};
 const polySolid=polygons=>{const faces=polygons.map(points=>R.makePolygon(points));try{return R.makeSolid(faces);}finally{faces.forEach(dispose);}};
 if(n){
  if(o.type==='sphere')return polySolid(facetedSphere(n,p.diameter).map(f=>f.points));
  if(o.type==='cylinder')return prism(p.diameter/2,p.h);
  if(o.type==='tube'){const a=prism(p.diameter/2,p.h),b=prism(p.inner/2,p.h+.2,-p.h/2-.1);try{return cut(a,b);}finally{dispose(a);dispose(b);}}
  if(o.type==='cone'){const ring=(r,z)=>Array.from({length:n},(_,i)=>[r*Math.cos(i*2*Math.PI/n),r*Math.sin(i*2*Math.PI/n),z]),bottom=ring(p.diameter/2,-p.h/2),top=ring(p.top/2,p.h/2),polygons=[[...bottom].reverse()];if(p.top>0)polygons.push(top);for(let i=0;i<n;i++){const j=(i+1)%n;polygons.push(p.top>0?[bottom[i],bottom[j],top[j],top[i]]:[bottom[i],bottom[j],[0,0,p.h/2]]);}return polySolid(polygons);}
  if(o.type==='rounded'){const pts=[],r=Math.min(p.r,p.w/2,p.d/2);for(let k=0;k<4;k++){const cx=(k===0||k===3?1:-1)*(p.w/2-r),cy=(k<2?1:-1)*(p.d/2-r);for(let i=0;i<=n;i++){const a=k*Math.PI/2+i*Math.PI/2/n;pts.push([cx+r*Math.cos(a),cy+r*Math.sin(a),-p.h/2]);}}const clean=pts.filter((a,i)=>!i||Math.hypot(...a.map((v,j)=>v-pts[i-1][j]))>1e-7);if(Math.hypot(...clean[0].map((v,j)=>v-clean.at(-1)[j]))<1e-7)clean.pop();const f=R.makePolygon(clean),v=new R.Vector([0,0,p.h]);try{return R.basicFaceExtrusion(f,v);}finally{dispose(f);dispose(v);}}
 }
 switch(o.type) {
  case 'wedge':case 'pyramid':{const {vertices,faces}=primitiveFaces(o.type,p);s=polySolid(faces.map(f=>f.map(i=>vertices[i])));break;}
  case 'box':s=R.makeBox([-p.w/2,-p.d/2,-p.h/2],[p.w/2,p.d/2,p.h/2]);break;
  case 'rounded':s=R.drawRoundedRectangle(p.w,p.d,Math.min(p.r,p.w/2-1e-5,p.d/2-1e-5)).sketchOnPlane('XY',-p.h/2).extrude(p.h);break;
  case 'cylinder':s=R.makeCylinder(p.diameter/2,p.h,[0,0,-p.h/2]);break;
  case 'tube':{const a=R.makeCylinder(p.diameter/2,p.h,[0,0,-p.h/2]),b=R.makeCylinder(p.inner/2,p.h+.2,[0,0,-p.h/2-.1]);try{s=cut(a,b);}finally{dispose(a);dispose(b);}break;}
  case 'cone':{const pts=[[0,0,-p.h/2],[p.diameter/2,0,-p.h/2],[p.top/2,0,p.h/2]];if(p.top>0)pts.push([0,0,p.h/2]);const f=R.makePolygon(pts);try{s=R.revolution(f,[0,0,0],[0,0,1],360);}finally{dispose(f);}break;}
  case 'sphere':s=R.makeSphere(p.diameter/2);break;
  case 'polygon':{const area=p.points.reduce((s,a,i)=>{const b=p.points[(i+1)%p.points.length];return s+a[0]*b[1]-a[1]*b[0];},0);const pts=area<0?[...p.points].reverse():p.points;const f=R.makePolygon(pts.map(a=>[a[0],a[1],-p.h/2])),v=new R.Vector([0,0,p.h]);try{s=R.basicFaceExtrusion(f,v);}finally{dispose(f);dispose(v);}break;}
  case 'prefab':{for(const group of materialGroups(p.children)){let merged;for(const child of [...group.solids,...group.cuts]){const a=fullShape(child);if(!merged)merged=a;else{const old=merged;try{merged=child.mode==='cut'?cut(old,a):fuse(old,a);}finally{dispose(old);dispose(a);}}}const fs=merged.faces,empty=!fs.length;fs.forEach(dispose);if(empty){dispose(merged);continue;}if(!s)s=merged;else{const old=s;try{s=fuse(old,merged);}finally{dispose(old);dispose(merged);}}}if(!s)throw Error('The prefab contains no solid material.');break;}
  case 'joined':{
   const solid=p.children.filter(c=>c.mode!=='cut'),cuts=p.children.filter(c=>c.mode==='cut'),order=p.fillOverlaps?[solid[0],...cuts,...solid.slice(1)]:[...solid,...cuts];
   for(const child of order){const a=fullShape(child);if(!s){s=a;}else{const old=s;try{s=child.mode==='cut'?cut(old,a):fuse(old,a);}finally{dispose(old);dispose(a);}}}break;
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
function topology(s,edges){return OCCT_SCOPE?scopedTopology(s,edges):legacyTopology(s,edges);}
function legacyTopology(s,edges) {
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
// Same OCCT calls in the same order as legacyTopology (so output is byte-identical), but every temporary is owned
// by a scope: the face clones, the wires (replicad's innerWires() drops the outer wire it gets from this.wires
// without deleting it, so it is computed here from f.wires), the edge curve adaptors behind pointAt(), and the
// Vectors on the throw path.
// replicad's .edges/.faces/.wires getters (iterTopo) keep every TopExp_Explorer.Current() copy alive until GC. This
// walks the same explorer in the same order with the same IsSame de-duplication, and deletes those copies.
const KIND={edge:[E=>E.TopAbs_EDGE,T=>x=>T.Edge(x),()=>R.Edge],face:[E=>E.TopAbs_FACE,T=>x=>T.Face(x),()=>R.Face],wire:[E=>E.TopAbs_WIRE,T=>x=>T.Wire(x),()=>R.Wire]};
function explore(shape,kind){if(!OCCT_SCOPE)return shape[kind+'s'];const oc=R.getOC(),[abs,cast,wrap]=KIND[kind],E=oc.TopAbs_ShapeEnum,Wrap=wrap();
 const explorer=new oc.TopExp_Explorer(shape.wrapped,abs(E),E.TopAbs_SHAPE),seen=[],out=[];
 try{while(explorer.More()){const item=explorer.Current();if(seen.some(x=>x.IsSame(item)))item.delete();else{seen.push(item);out.push(new Wrap(cast(oc.TopoDS)(item)));}explorer.Next();}}
 finally{seen.forEach(x=>x.delete());explorer.delete();}
 return out;}
// Value-for-value re-implementations of replicad's faceCenter/faceNormalAt/curvePointAt that delete every OCCT
// temporary they create (replicad leaves gp_Pnt/gp_XYZ results and the GeomAPI_ProjectPointOnSurf projector to GC).
// They issue the same OCCT calls with the same arguments, and read the same doubles.
function occCenter(f){const oc=R.getOC(),props=new oc.GProp_GProps();try{oc.BRepGProp.SurfaceProperties(f.wrapped,props,1e-7,true);const c=props.CentreOfMass();try{return [c.X(),c.Y(),c.Z()];}finally{c.delete();}}finally{props.delete();}}
// BRepGProp_Face and GeomAPI_ProjectPointOnSurf keep ≈1 KB in the heap per construction even when deleted, so one
// instance of each is reused through Load()/Init() (the same routines their constructors run).
let gpropFace=null,projector=null;
function occNormal(f,at){const oc=R.getOC(),face=f.wrapped;let u,v;
 if(at){const surface=oc.BRep_Tool.Surface(face),pnt=new oc.gp_Pnt(at[0],at[1],at[2]),algo=oc.Extrema_ExtAlgo.Extrema_ExtAlgo_Grad;
  try{if(projector)projector.Init(pnt,surface,algo);else projector=new oc.GeomAPI_ProjectPointOnSurf(pnt,surface,algo);({U:u,V:v}=projector.LowerDistanceParameters(0,0));}finally{pnt.delete();surface.delete();}}
 else{const {UMin,UMax,VMin,VMax}=oc.BRepTools.UVBounds(face,0,0,0,0);u=.5*(UMin+UMax);v=.5*(VMin+VMax);}
 if(gpropFace)gpropFace.Load(face);else gpropFace=new oc.BRepGProp_Face(face,false);
 const point=new oc.gp_Pnt(),normal=new oc.gp_Vec();
 try{gpropFace.Normal(u,v,point,normal);return [normal.X(),normal.Y(),normal.Z()];}finally{normal.delete();point.delete();}}
function occMidpoint(e,own){const curve=own(e.curve).wrapped,first=curve.FirstParameter(),p=curve.Value(first+(curve.LastParameter()-first)*.5);try{return [p.X(),p.Y(),p.Z()];}finally{p.delete();}}
function scopedTopology(s,edges){return withScope(own=>{
 const faces=own.all(explore(s,'face')),edgeIds=new Map(edges.map((e,i)=>[e.hashCode,i]));
 const mesh=s.mesh({tolerance:.08,angularTolerance:.12});
 const groups=mesh.faceGroups.map(g=>({...g,face:faces.findIndex(f=>f.hashCode===g.faceId)}));
 const lines=s.meshEdges({tolerance:.06,angularTolerance:.12});
 const edgeData=lines.edgeGroups.map(g=>({index:edgeIds.get(g.edgeId),points:Array.from(lines.lines.slice(g.start*3,(g.start+g.count)*3))})).filter(e=>e.index!==undefined);
 const faceData=faces.map((f,i)=>{const es=own.all(explore(f,'edge'));let center=[0,0,0],normal=[0,0,1];try{center=occCenter(f);normal=occNormal(f);}catch{}const indices=es.map(e=>edgeIds.get(e.hashCode)).filter(e=>e!==undefined);
  const outer=own(own(f.clone()).outerWire()),all=own.all(explore(f,'wire')),inner=all.filter(w=>!outer.isSame(w));
  const loops=[outer,...inner].map(w=>own.all(explore(w,'edge')).map(e=>edgeIds.get(e.hashCode)).filter(e=>e!==undefined));return {index:i,kind:f.geomType,center,normal,edges:indices,loops};});
 const pickEdges=edgeData.filter(e=>{const adjacent=faceData.filter(f=>f.edges.includes(e.index)).map(f=>faces[f.index]);if(adjacent.length<2)return false;try{const at=occMidpoint(edges[e.index],own),a=occNormal(adjacent[0],at),b=occNormal(adjacent[1],at),dot=a.reduce((sum,v,i)=>sum+v*b[i],0)/(Math.hypot(...a)*Math.hypot(...b));return Math.abs(dot)<.9999;}catch{return true;}});
 return {vertices:new Float32Array(mesh.vertices),triangles:new Uint32Array(mesh.triangles),groups,faces:faceData,edges:pickEdges};
});}
// WS1: a Poly_Triangulation that mesh()/meshEdges() attach to a B-rep stays in the OCCT heap after the replicad
// wrapper is deleted (≈0.36 MB per sphere). With OCCT_SCOPE the base shape stays alive alongside the cached solid
// (they share TShapes, so cleaning one earlier could change a later mesh), and both are stripped with
// BRepTools.Clean and deleted together when the entry leaves the cache. Nothing is cleaned while still in use.
function release(entry){if(OCCT_SCOPE){const oc=R.getOC();for(const x of [entry.s,entry.base]){try{if(x)oc.BRepTools.Clean(x.wrapped,true);}catch{}}}dispose(entry.s);dispose(entry.base);}
const geometryKey=o=>JSON.stringify([o.type,o.params,o.fillets||[],o.resolution||null]);
// WS2: the B-rep LRU holds 64 entries and an estimated byte budget; topology lives in its own map (below), so a
// preview whose topology is cached never touches the B-rep, and evicting a B-rep keeps its topology.
const BREP_ENTRIES=64,BREP_BYTES=128*1048576,TOPOLOGY_BYTES=32*1048576;let brepBytes=0;
function cached(o) {
 const key=geometryKey(o);
 if(cache.has(key)){const v=cache.get(key);cache.delete(key);cache.set(key,v);return v;}
 const base=baseShape(o),edges=explore(base,'edge');let s,t,ok=false;
 try{t=topology(base,edges);s=applyFillets(base,o.fillets,edges);ok=true;}finally{edges.forEach(dispose);if(!OCCT_SCOPE)dispose(base);else if(!ok)release({s,base});}
 const surfaceFaces=explore(s,'face');t.faceCount=surfaceFaces.length;t.flatFaces=surfaceFaces.filter(f=>f.geomType==='PLANE').length;surfaceFaces.forEach(dispose);
 if(TOPOLOGY_SERVICE){const entry=OCCT_SCOPE?{s,base}:{s};entry.bytes=brepEstimate(t);brepBytes+=entry.bytes;cache.set(key,entry);storeTopology(key,t);
  while(cache.size>1&&(cache.size>BREP_ENTRIES||brepBytes>BREP_BYTES)){const first=cache.keys().next().value,old=cache.get(first);release(old);brepBytes-=old.bytes;cache.delete(first);}return entry;}
 const entry=OCCT_SCOPE?{s,base,topology:t}:{s,topology:t};cache.set(key,entry);while(cache.size>OCCT_CACHE_ENTRIES){const first=cache.keys().next().value;release(cache.get(first));cache.delete(first);}return entry;
}
// Byte estimates: the B-rep plus its attached triangulations scale with the tessellation that topology() produced.
function topologyBytes(t){let n=(t.vertices?.byteLength||0)+(t.triangles?.byteLength||0)+48*(t.groups?.length||0);for(const f of t.faces||[])n+=160+8*(f.edges.length+f.loops.reduce((a,l)=>a+l.length,0));for(const e of t.edges||[])n+=32+8*e.points.length;return n;}
function brepEstimate(t){return 65536+4*((t.vertices?.byteLength||0)+(t.triangles?.byteLength||0));}
const topologies=new Map();let topologyTotal=0;
function storeTopology(key,t){const old=topologies.get(key);if(old){topologyTotal-=old.bytes;topologies.delete(key);}const bytes=topologyBytes(t);topologies.set(key,{t,bytes,hash:geometryHash(key)});topologyTotal+=bytes;
 while(topologies.size>1&&topologyTotal>TOPOLOGY_BYTES){const first=topologies.keys().next().value;topologyTotal-=topologies.get(first).bytes;topologies.delete(first);}}
function topologyEntry(key){const v=topologies.get(key);if(v){topologies.delete(key);topologies.set(key,v);}return v;}
// Topology for o by geometry hash. A miss whose B-rep is still cached rebuilds that entry, so topology always comes
// from a fresh base shape exactly as before.
function shapeTopology(o){if(!TOPOLOGY_SERVICE)return cached(o).topology;const key=geometryKey(o);let v=topologyEntry(key);
 if(!v){if(cache.has(key)){const old=cache.get(key);release(old);brepBytes-=old.bytes;cache.delete(key);}cached(o);v=topologyEntry(key);}return v.t;}
// Content-addressed topology for any cacheable value (thread rods use it so threadMesh runs once per geometry).
export function memoTopology(key,build){let v=topologyEntry(key);if(!v){storeTopology(key,build());v=topologyEntry(key);}return v;}
// {hash, topology} for a part, or null topology (mesh content) with a null hash.
export function objectTopologyEntry(o){const t=objectTopology(o);if(!t)return {hash:null,topology:t};return {hash:topologyEntry(geometryKey(o)).hash,topology:t};}
export const topologyCacheStats=()=>({brepEntries:cache.size,brepBytes,topologyEntries:topologies.size,topologyBytes:topologyTotal});
export function solidMesh(o,tolerance,display=false) {
 tolerance=resolutionTolerance(o,tolerance);
 const {s}=cached(o),m=s.mesh({tolerance:Math.max(.001,tolerance*.5),angularTolerance:Math.min(.18,Math.max(.025,Math.sqrt(tolerance/10)))});
 const result={vertices:new Float32Array(m.vertices),triangles:new Uint32Array(m.triangles)};
 if(display){const faces=s.faces,planes=new Set(faces.filter(f=>f.geomType==='PLANE').map(f=>f.hashCode));faces.forEach(dispose);result.displayGroups=m.faceGroups.map(g=>({start:g.start,count:g.count,flat:planes.has(g.faceId)})).sort((a,b)=>a.start-b.start);}
 return result;
}
export function objectTopology(o) {if(isThread(o)||['joined','prefab'].includes(o.type)&&containsMesh(o))return null;try{return shapeTopology(o);}catch(e){if(o.type==='mesh'||['joined','prefab'].includes(o.type)&&(containsMesh(o)||containsScale(o)))return null;throw e;}}
function containsScale(o){return o.scale?.some(v=>Math.abs(v-1)>1e-8)||o.params?.children?.some(containsScale);}
function containsMesh(o){return o.type==='mesh'||isThread(o)||o.params?.children?.some(containsMesh);}
export function disposeSolidCache(){for(const entry of cache.values())release(entry);cache.clear();brepBytes=0;topologies.clear();topologyTotal=0;}
// Test hook (WS1 parity): topology of o through the legacy or the scoped extractor, without touching the cache.
export function topologyVariant(o,scoped){const base=baseShape(o),edges=base.edges;try{return (scoped?scopedTopology:legacyTopology)(base,edges);}finally{edges.forEach(dispose);if(scoped){try{R.getOC().BRepTools.Clean(base.wrapped,true);}catch{}}dispose(base);}}
