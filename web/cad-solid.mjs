import {primitiveFaces} from './polyhedra.mjs';
import {glyphSolid,glyphSegments,segmentPoints,segmentCentroid,hasGlyphFinish,glyphLayout,glyphHalfExtents} from './glyph-geometry.mjs';
import {materialGroups} from './layers.mjs';
import * as R from 'replicad';
import {facetedSphere,resolutionTolerance,customFaces} from './facets.mjs';
import {isThread} from './threads.mjs';
import {OCCT_SCOPE,OCCT_CACHE_ENTRIES,TOPOLOGY_SERVICE,FILLET_MESH_CACHE} from './perf-flags.mjs';
import {geometryHash} from './topology-pack.mjs';
import {withScope,setHeapSource} from './occt-scope.mjs';
export {heapBytes} from './occt-scope.mjs';
const cache=new Map();
// Test hook: GLYPH_FAST=false runs the full OCCT topology (mesh, edges, face data) for torus and glyphs (parity check in tests/new-shapes.mjs).
let GLYPH_FAST=true;export function setGlyphFastPath(v){GLYPH_FAST=v;}
// Amendment A2: polygon triangulator for glyph caps (Manifold's triangulate, set by kernel.mjs). Without it (the
// OCCT sidecar has no Manifold) glyph topology uses the OCCT mesh as before.
let triangulator=null;export function setTriangulator(fn){triangulator=fn;}
// WS14 (OCCT_SIDECAR): in the geometry worker OCCT is not loaded; solidMesh and objectTopology answer from the remote
// cache of web/occt-remote.mjs, which records a miss (mesh → null, topology → null) for the sidecar to fill.
let remote=null;
export function setSolidRemote(r){remote=r;}
export const solidRemoteMisses=()=>remote?remote.events():0;
const dispose=o=>{try{o?.delete();}catch{}};
// ADR-0001 F7 P3: OCCT is compiled once (wasmModule) and instantiated through Emscripten's instantiateWasm hook, so a
// fresh instance (resetSolid, after an OCCT memory error) reuses the compiled code: no second compile, no new wasm code
// space. If the module cannot be compiled up front, the default Emscripten path runs exactly as before.
let wasmModule=null,solidOptions={},occtTrapped=false;
async function compileOcct(options){
 if(globalThis.process?.versions?.node&&!options.locateFile){const fs=await import('node:fs');return WebAssembly.compile(fs.readFileSync(new URL('replicad_single.wasm',import.meta.resolve('replicad-opencascadejs'))));}
 if(!options.locateFile)return null;const url=options.locateFile('replicad_single.wasm','');
 if(globalThis.process?.versions?.node){const fs=await import('node:fs');return WebAssembly.compile(fs.readFileSync(url));}
 try{return await WebAssembly.compileStreaming(fetch(url,{credentials:'same-origin'}));}catch{const r=await fetch(url,{credentials:'same-origin'});return r.ok?WebAssembly.compile(await r.arrayBuffer()):null;}
}
export async function initSolid(options={}) {
 solidOptions=options;const {default:init}=await import('replicad-opencascadejs');
 if(!wasmModule)wasmModule=await compileOcct(options).catch(()=>null);
 let oc;if(!wasmModule)oc=await init(options);
 else{const module=wasmModule;let fail;const failed=new Promise((_,reject)=>fail=reject);
  oc=await Promise.race([init({...options,instantiateWasm:(imports,done)=>{WebAssembly.instantiate(module,imports).then(i=>done(i,module),fail);return {};}}),failed]);}
 R.setOC(oc);setHeapSource(oc);gpropFace=projector=null;occtTrapped=false;return {oc,R};
}
// P3: a wasm trap (RuntimeError: memory access out of bounds, unreachable, Aborted(OOM)...) inside OCCT leaves its heap
// inconsistent (later calls fail with 'null function or function signature mismatch', or spin). The trap is recorded
// and its error is passed on unchanged; before the next job the worker calls resetSolid(), which drops every B-rep of
// the old heap (never touching it again) and instantiates OCCT afresh from the compiled module. JS-side caches
// (meshes, topology) hold plain data computed before the trap and stay.
const isTrap=e=>e instanceof WebAssembly.RuntimeError;
export function noteOcctError(e){if(isTrap(e))occtTrapped=true;return e;}
export const occtNeedsReset=()=>occtTrapped;
export async function resetSolid(){cache.clear();brepBytes=0;await initSolid(solidOptions);}
const guarded=fn=>(...a)=>{try{return fn(...a);}catch(e){throw noteOcctError(e);}};
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
  case 'wedge':case 'pyramid':case 'triprism':case 'tetrahedron':case 'octahedron':case 'decahedron':case 'dodecahedron':case 'icosahedron':{const {vertices,faces}=primitiveFaces(o.type,p);s=polySolid(faces.map(f=>f.map(i=>vertices[i])));break;}
  case 'box':s=R.makeBox([-p.w/2,-p.d/2,-p.h/2],[p.w/2,p.d/2,p.h/2]);break;
  case 'rounded':s=R.drawRoundedRectangle(p.w,p.d,Math.min(p.r,p.w/2-1e-5,p.d/2-1e-5)).sketchOnPlane('XY',-p.h/2).extrude(p.h);break;
  case 'cylinder':s=R.makeCylinder(p.diameter/2,p.h,[0,0,-p.h/2]);break;
  case 'tube':{const a=R.makeCylinder(p.diameter/2,p.h,[0,0,-p.h/2]),b=R.makeCylinder(p.inner/2,p.h+.2,[0,0,-p.h/2-.1]);try{s=cut(a,b);}finally{dispose(a);dispose(b);}break;}
  case 'cone':{const pts=[[0,0,-p.h/2],[p.diameter/2,0,-p.h/2],[p.top/2,0,p.h/2]];if(p.top>0)pts.push([0,0,p.h/2]);const f=R.makePolygon(pts);try{s=R.revolution(f,[0,0,0],[0,0,1],360);}finally{dispose(f);}break;}
  case 'sphere':s=R.makeSphere(p.diameter/2);break;
  // replicad 1.1.0 has no makeTorus; the OCCT builder is used directly (as makeSphere does) and deleted at once (WS1).
  case 'torus':{const maker=new (R.getOC()).BRepPrimAPI_MakeTorus((p.diameter-p.tube)/2,p.tube/2);try{s=new R.Solid(maker.Shape());}finally{maker.delete();}break;}
  case 'glyph':s=glyphShape(p);break;
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
 if(fillets.some(f=>f.kind==='chamfer'&&f.radius>0))return edgeFinish(base,fillets,edges);
 const radii=new Map();for(const f of fillets)for(const index of f.edges)if(edges[index])radii.set(edges[index].hashCode,f.radius);
 try{return base.fillet(e=>radii.get(e.hashCode)||0);}catch{throw Error('That roundover is too large or conflicts with another edge. Reduce the radius.');}
}
// ADR-0001 F6: chamfers (symmetric BRepFilletAPI_MakeChamfer) and rounds on one shape. Chamfers are cut first and the
// round edges are found again through MakeChamfer.Modified() (an edge the chamfers left alone keeps its identity), then
// the rounds use the same MakeFillet as replicad's fillet(). Rounding first would let a later chamfer propagate along the
// round's tangent seam onto edges nobody picked (and gave an invalid solid when the chamfer exceeds the round; measured
// in tests/round-chamfer.mjs). The result must pass BRepCheck. Shapes without a chamfer never get here.
function edgeFinish(base,fillets,edges){const oc=R.getOC(),by=new Map(),own=[],keep=x=>own[own.length]=x;
 for(const f of fillets)if(f.radius>0)for(const i of f.edges)if(edges[i])by.set(i,f);
 const pass=c=>[...by].filter(([,f])=>(f.kind==='chamfer')===c).sort((a,b)=>a[0]-b[0]),rounds=pass(false);let step=0;
 try{const cb=keep(new oc.BRepFilletAPI_MakeChamfer(base.wrapped));for(const [i,f] of pass(true))cb.Add(f.radius,edges[i].wrapped);let out=keep(cb.Shape());
  if(rounds.length){step=1;const fb=keep(new oc.BRepFilletAPI_MakeFillet(out,oc.ChFi3d_FilletShape.ChFi3d_Rational));
   for(const [i,f] of rounds){let e=edges[i].wrapped;const l=keep(cb.Modified(e));if(l.Size())e=keep(oc.TopoDS.Edge(l.First()));fb.Add(f.radius,e);}out=keep(fb.Shape());}
  return validSolid(out,keep);}
 catch(e){noteOcctError(e);throw Error(step?'That roundover is too large or conflicts with another edge. Reduce the radius.':'That chamfer is too large or conflicts with another edge. Reduce the distance.');}
 finally{own.reverse().forEach(dispose);}}
// The finished OCCT result must pass BRepCheck and be a 3D shape (F6 edge finish); throws 0 otherwise.
function validSolid(out,keep){const oc=R.getOC();if(!keep(new oc.BRepCheck_Analyzer(out,true,false)).IsValid())throw 0;const r=R.cast(out);if(!R.isShape3D(r)){dispose(r);throw 0;}return r;}
// ADR-0001 F7: the finished glyph (glyph-geometry.mjs glyphLayout): the prism and the plate. Without a finish this is
// exactly the 2.x glyphSolid. Emboss: the glyph fused onto the plate; Engrave: the plate minus the glyph prism.
function glyphShape(p){
 if(!hasGlyphFinish(p))return glyphSolid(R,p);
 const {f,plate,glyph}=glyphLayout(p);let s=glyphSolid(R,p,glyph[0],glyph[1]-glyph[0]);
 const [hx,hy]=glyphHalfExtents(p.char,p.size),ox=hx+f.margin,oy=hy+f.margin,slab=R.makeBox([-ox,-oy,plate[0]],[ox,oy,plate[1]]),g=s;
 try{s=f.engrave?cut(slab,g):fuse(slab,g);}finally{dispose(slab);dispose(g);}
 return s;
}
function fullShape(o) {
 if(o.scale?.some(v=>Math.abs(v-1)>1e-8))throw Error('A scaled compound uses mesh editing. Round its component shapes before conjoining.');
 const s=baseShape(o),edges=s.edges;let r;
 try{r=applyFillets(s,o.fillets,edges);}finally{edges.forEach(dispose);dispose(s);}
 if(o.rotation?.some(v=>v)){for(let i=0;i<3;i++)if(o.rotation[i]){const dir=[0,0,0];dir[i]=1;r=r.rotate(o.rotation[i],[0,0,0],dir);}}
 if(o.position)r=r.translate(o.position);return r;
}
function safeTuple(v){try{return v.toTuple();}finally{dispose(v);}}
function topology(s,edges,o){return OCCT_SCOPE?scopedTopology(s,edges,o):legacyTopology(s,edges);}
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
 // Amendment A2: candidates are bucketed by OCCT's shape hash (equal for IsSame shapes), so the de-duplication is no
 // longer quadratic; the same shapes come out in the same first-seen order.
 const explorer=new oc.TopExp_Explorer(shape.wrapped,abs(E),E.TopAbs_SHAPE),seen=[],out=[],buckets=new Map(),hash=oc.ReplicadShapeHasher;
 try{while(explorer.More()){const item=explorer.Current(),h=hash.HashCode(item,2147483647),b=buckets.get(h);if(b?.some(x=>x.IsSame(item)))item.delete();else{if(b)b.push(item);else buckets.set(h,[item]);seen.push(item);out.push(new Wrap(cast(oc.TopoDS)(item)));}explorer.Next();}}
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
// Amendment A2: the torus is one TORUS face, so its pick/highlight mesh is the exact parametric surface sampled on a
// regular grid (at least OCCT's 105 × 105 at the default size, finer when the 0.08 mm deflection needs it) instead of
// a 200 ms BRepMesh run. It is used only for face picking and highlights; preview and STL come from Manifold.
export function torusTopologyMesh({diameter,tube},faceId){
 const r=tube/2,R0=(diameter-tube)/2,seg=rad=>Math.max(105,Math.ceil(2*Math.PI/(2*Math.acos(Math.max(-1,1-.08/rad))))),nu=seg(R0+r),nv=seg(r);
 const vertices=new Float32Array((nu+1)*(nv+1)*3),triangles=new Uint32Array(nu*nv*6);let k=0,t=0;
 for(let i=0;i<=nu;i++){const u=2*Math.PI*i/nu,cu=Math.cos(u),su=Math.sin(u);for(let j=0;j<=nv;j++){const v=2*Math.PI*j/nv,w=R0+r*Math.cos(v);vertices[k++]=w*cu;vertices[k++]=w*su;vertices[k++]=r*Math.sin(v);}}
 for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*(nv+1)+j,b=a+nv+1;triangles.set([a,b,b+1,a,b+1,a+1],t);t+=6;}
 return {vertices,triangles,faceGroups:[{start:0,count:triangles.length,faceId}]};}
// Amendment A2.4: glyph face data from the glyph tables. The OCCT solid (needed for edge/face ids, roundovers and
// face counts) is the same; its faces and edges are matched to the outline segments by their end points. Face
// records keep OCCT's ids, order, kinds, edges, loops, normals and plane centres; side-face centres are the exact
// arc-length centroids. The pick/highlight mesh and edge polylines are sampled from the same segments at the same
// tolerances (0.08 / 0.06 mm). Returns null (full OCCT path) if any face or edge cannot be matched.
// tests/new-shapes.mjs compares this with the full OCCT computation for all 94 glyphs.
function glyphTopology(s,edges,o){return withScope(own=>{
 const {size,depth,char}=o.params,z0=-depth/2,z1=depth/2,key=(x,y)=>Math.round(x*1e5)+','+Math.round(y*1e5);
 const contours=glyphSegments(char,size),pair=new Map(),vin=new Map(),vout=new Map();
 for(const list of contours)for(const g of list){pair.set(key(...g.p0)+'|'+key(...g.p1),g);pair.set(key(...g.p1)+'|'+key(...g.p0),g);vout.set(key(...g.p0),g);vin.set(key(...g.p1),g);}
 const info=edges.map(e=>{const c=own(e.curve).wrapped,a=c.Value(c.FirstParameter()),b=c.Value(c.LastParameter());try{const A=[a.X(),a.Y(),a.Z()],B=[b.X(),b.Y(),b.Z()];
  if(Math.abs(A[0]-B[0])<1e-7&&Math.abs(A[1]-B[1])<1e-7)return {vertical:true,A,B,k:key(A[0],A[1])};return {seg:pair.get(key(A[0],A[1])+'|'+key(B[0],B[1])),A,B};}finally{a.delete();b.delete();}});
 if(info.some(e=>e.vertical?!(vin.has(e.k)&&vout.has(e.k)):!e.seg))return null;
 const faces=own.all(explore(s,'face')),edgeIds=new Map(edges.map((e,i)=>[e.hashCode,i])),capOf=[],segOf=[];
 const faceData=faces.map((f,i)=>{const es=own.all(explore(f,'edge')),indices=es.map(e=>edgeIds.get(e.hashCode)).filter(e=>e!==undefined),horiz=indices.filter(k=>!info[k].vertical);
  const kind=f.geomType;let center=[0,0,0],normal=[0,0,1];
  try{normal=occNormal(f);const cap=kind==='PLANE'&&Math.abs(normal[0])<1e-12&&Math.abs(normal[1])<1e-12;
   if(cap)capOf[i]=new Set(horiz.map(k=>info[k].seg.contour));else segOf[i]=info[horiz[0]]?.seg;
   if(kind==='PLANE')center=occCenter(f);else{const [x,y]=segmentCentroid(segOf[i]);center=[x,y,0];}}catch{return null;}
  const outer=own(own(f.clone()).outerWire()),all=own.all(explore(f,'wire')),inner=all.filter(w=>!outer.isSame(w));
  const loops=[outer,...inner].map(w=>own.all(explore(w,'edge')).map(e=>edgeIds.get(e.hashCode)).filter(e=>e!==undefined));return {index:i,kind,center,normal,edges:indices,loops};});
 if(faceData.some((f,i)=>!f||!capOf[i]&&!segOf[i]))return null;
 const V=[],Tr=[],groups=[];
 for(const f of faceData){const i=f.index,start=Tr.length,base=V.length/3,n=f.normal;
  if(segOf[i]){const pts=segmentPoints(segOf[i],.08,.12);for(const [x,y] of pts)V.push(x,y,z0,x,y,z1);
   const d=[pts[1][0]-pts[0][0],pts[1][1]-pts[0][1]],flip=d[0]*n[1]-d[1]*n[0]<0;
   for(let k=0;k+1<pts.length;k++){const a=base+2*k,b=a+2;if(flip)Tr.push(a,a+1,b+1,a,b+1,b);else Tr.push(a,b,b+1,a,b+1,a+1);}}
  else{const z=n[2]>0?z1:z0,polys=[];for(let c=0;c<contours.length;c++)if(capOf[i].has(c)){const loop=[];for(const g of contours[c]){const pts=segmentPoints(g,.08,.12);for(let k=0;k+1<pts.length;k++)loop.push(pts[k]);}loop.reverse();polys.push(loop);}
   const flat=polys.flat();for(const [x,y] of flat)V.push(x,y,z);for(const t of triangulator(polys,1e-9))if(n[2]>0)Tr.push(base+t[0],base+t[1],base+t[2]);else Tr.push(base+t[0],base+t[2],base+t[1]);}
  groups.push({start,count:Tr.length-start,faceId:faces[i].hashCode,face:i});}
 const pickEdges=[];for(let k=0;k<info.length;k++){const e=info[k];
  if(!e.vertical){const pts=segmentPoints(e.seg,.06,.12),fwd=Math.hypot(pts[0][0]-e.A[0],pts[0][1]-e.A[1])<1e-6;if(!fwd)pts.reverse();pickEdges.push({index:k,points:pts.flatMap(([x,y])=>[x,y,e.A[2]])});continue;}
  const gi=vin.get(e.k),go=vout.get(e.k),ti=gi.c?[gi.p1[0]-gi.c[0],gi.p1[1]-gi.c[1]]:[gi.p1[0]-gi.p0[0],gi.p1[1]-gi.p0[1]],to=go.c?[go.c[0]-go.p0[0],go.c[1]-go.p0[1]]:[go.p1[0]-go.p0[0],go.p1[1]-go.p0[1]];
  const dot=(ti[0]*to[0]+ti[1]*to[1])/(Math.hypot(...ti)*Math.hypot(...to));if(Math.abs(dot)<.9999)pickEdges.push({index:k,points:[...e.A,...e.B]});}
 return {vertices:new Float32Array(V),triangles:new Uint32Array(Tr),groups,faces:faceData,edges:pickEdges};
});}
function scopedTopology(s,edges,o){if(o?.type==='glyph'&&GLYPH_FAST&&triangulator&&!hasGlyphFinish(o.params)){const t=glyphTopology(s,edges,o);if(t)return t;}return withScope(own=>{
 const faces=own.all(explore(s,'face')),edgeIds=new Map(edges.map((e,i)=>[e.hashCode,i]));
 const mesh=GLYPH_FAST&&o?.type==='torus'&&faces.length===1?torusTopologyMesh(o.params,faces[0].hashCode):s.mesh({tolerance:.08,angularTolerance:.12});
 const groups=mesh.faceGroups.map(g=>({...g,face:faces.findIndex(f=>f.hashCode===g.faceId)}));
 // A torus has only its two seam edges, each bordering the one face twice, so it never has a pick edge; meshEdges
 // would triangulate the whole surface (≈190 ms) just to drop them.
 const lines=GLYPH_FAST&&o?.type==='torus'&&faces.length===1?{edgeGroups:[],lines:[]}:s.meshEdges({tolerance:.06,angularTolerance:.12});
 const edgeData=lines.edgeGroups.map(g=>({index:edgeIds.get(g.edgeId),points:Array.from(lines.lines.slice(g.start*3,(g.start+g.count)*3))})).filter(e=>e.index!==undefined);
 const faceData=faces.map((f,i)=>{const es=own.all(explore(f,'edge'));let center=[0,0,0],normal=[0,0,1];try{center=occCenter(f);normal=occNormal(f);}catch{}const indices=es.map(e=>edgeIds.get(e.hashCode)).filter(e=>e!==undefined);
  const outer=own(own(f.clone()).outerWire()),all=own.all(explore(f,'wire')),inner=all.filter(w=>!outer.isSame(w));
  const loops=[outer,...inner].map(w=>own.all(explore(w,'edge')).map(e=>edgeIds.get(e.hashCode)).filter(e=>e!==undefined));return {index:i,kind:f.geomType,center,normal,edges:indices,loops};});
 // Amendment A2 (glyphs, ~170 edges): adjacency is collected once, and an edge on a cap (a ±Z plane) is always a
 // sharp edge because every side face of an extrusion is vertical. tests/new-shapes.mjs checks this against the full
 // computation for all 94 glyphs.
 const glyph=o?.type==='glyph',adjacency=new Map();if(glyph)for(const f of faceData)for(const e of f.edges){const l=adjacency.get(e);if(l)l.push(f);else adjacency.set(e,[f]);}
 const cap=f=>f.kind==='PLANE'&&Math.abs(f.normal[0])<1e-12&&Math.abs(f.normal[1])<1e-12&&f.normal[2]!==0;
 const pickEdges=edgeData.filter(e=>{const fs=glyph?adjacency.get(e.index)||[]:faceData.filter(f=>f.edges.includes(e.index)),adjacent=fs.map(f=>faces[f.index]);if(adjacent.length<2)return false;if(glyph&&GLYPH_FAST&&(cap(fs[0])||cap(fs[1])))return true;try{const at=occMidpoint(edges[e.index],own),a=occNormal(adjacent[0],at),b=occNormal(adjacent[1],at),dot=a.reduce((sum,v,i)=>sum+v*b[i],0)/(Math.hypot(...a)*Math.hypot(...b));return Math.abs(dot)<.9999;}catch{return true;}});
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
const meshOnly=o=>o.type==='glyph'&&hasGlyphFinish(o.params);
function cached(o) {
 const key=geometryKey(o);
 if(cache.has(key)){const v=cache.get(key);cache.delete(key);cache.set(key,v);return v;}
 const base=baseShape(o),edges=explore(base,'edge');let s,t,ok=false;
 // F7: finished glyphs (plate) have no topology (objectTopology answers null), so none is extracted.
 try{t=meshOnly(o)?{faces:[],edges:[]}:topology(base,edges,o);s=applyFillets(base,o.fillets,edges);ok=true;}finally{edges.forEach(dispose);if(!OCCT_SCOPE)dispose(base);else if(!ok)release({s,base});}
 const surfaceFaces=explore(s,'face');t.faceCount=surfaceFaces.length;t.flatFaces=surfaceFaces.filter(f=>f.geomType==='PLANE').length;surfaceFaces.forEach(dispose);
 if(TOPOLOGY_SERVICE){const entry=OCCT_SCOPE?{s,base}:{s};entry.bytes=brepEstimate(t);brepBytes+=entry.bytes;cache.set(key,entry);storeTopology(key,t);
  while(cache.size>1&&(cache.size>BREP_ENTRIES||brepBytes>BREP_BYTES)){const first=cache.keys().next().value,old=cache.get(first);release(old);brepBytes-=old.bytes;cache.delete(first);}return entry;}
 const entry=OCCT_SCOPE?{s,base,topology:t}:{s,topology:t};cache.set(key,entry);while(cache.size>OCCT_CACHE_ENTRIES){const first=cache.keys().next().value;release(cache.get(first));cache.delete(first);}return entry;
}
// Byte estimates: the B-rep plus its attached triangulations scale with the tessellation that topology() produced.
export function topologyBytes(t){let n=(t.vertices?.byteLength||0)+(t.triangles?.byteLength||0)+48*(t.groups?.length||0);for(const f of t.faces||[])n+=160+8*(f.edges.length+f.loops.reduce((a,l)=>a+l.length,0));for(const e of t.edges||[])n+=32+8*e.points.length;return n;}
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
export function objectTopologyEntry(o){const t=objectTopology(o);if(!t)return {hash:null,topology:t};return {hash:remote?geometryHash(geometryKey(o)):topologyEntry(geometryKey(o)).hash,topology:t};}
export const topologyCacheStats=()=>({brepEntries:cache.size,brepBytes,topologyEntries:topologies.size,topologyBytes:topologyTotal});
// WS6: tessellated B-rep meshes (fillets, faces resolution) by (geometry key, effective tolerance, display), LRU
// with a 64 MB cap. A move or a re-export of an unchanged shape reuses the mesh; callers get fresh copies.
const MESH_BYTES=64*1048576,meshes=new Map();let meshBytes=0;
const copyMesh=m=>({...m,vertices:m.vertices.slice(),triangles:m.triangles.slice(),...(m.displayGroups?{displayGroups:m.displayGroups.map(g=>({...g}))}:{})});
export const filletMeshStats=()=>({entries:meshes.size,bytes:meshBytes});
export const solidMesh=guarded(function solidMesh(o,tolerance,display=false){
 const base=geometryKey(o)+'|'+resolutionTolerance(o,tolerance)+'|',key=base+(display?1:0);
 if(remote)return remote.solidMesh(o,tolerance,display,key);
 if(!FILLET_MESH_CACHE)return tessellate(o,tolerance,display);
 let e=meshes.get(key);
 if(e){meshes.delete(key);meshes.set(key,e);return copyMesh(e.m);}
 const m=tessellate(o,tolerance,display),bytes=m.vertices.byteLength+m.triangles.byteLength+64*(m.displayGroups?.length||0)+256;
 if(bytes<=MESH_BYTES&&!occtTrapped){meshes.set(key,{m:copyMesh(m),bytes});meshBytes+=bytes;for(const [k,v] of meshes){if(meshBytes<=MESH_BYTES)break;meshes.delete(k);meshBytes-=v.bytes;}}
 return m;
});
// WS14: the sidecar tessellates without its own mesh cache (the geometry worker caches the result).
export const solidMeshFresh=guarded((o,tolerance,display=false)=>tessellate(o,tolerance,display));
function tessellate(o,tolerance,display) {
 tolerance=resolutionTolerance(o,tolerance);
 const {s}=cached(o),m=s.mesh({tolerance:Math.max(.001,tolerance*.5),angularTolerance:Math.min(.18,Math.max(.025,Math.sqrt(tolerance/10)))});
 const result={vertices:new Float32Array(m.vertices),triangles:new Uint32Array(m.triangles)};
 if(display){const faces=s.faces,planes=new Set(faces.filter(f=>f.geomType==='PLANE').map(f=>f.hashCode));faces.forEach(dispose);result.displayGroups=m.faceGroups.map(g=>({start:g.start,count:g.count,flat:planes.has(g.faceId)})).sort((a,b)=>a.start-b.start);}
 return result;
}
// F7: a finished glyph (plate) is one piece: no face or edge picking, like an imported mesh (its mesh is Manifold-built).
function objectTopologyRaw(o) {if(o?.type==='glyph'&&hasGlyphFinish(o.params))return null;if(isThread(o)||['joined','prefab'].includes(o.type)&&containsMesh(o))return null;if(remote)return remote.topology(o,geometryKey(o));try{return shapeTopology(o);}catch(e){if(o.type==='mesh'||['joined','prefab'].includes(o.type)&&(containsMesh(o)||containsScale(o)))return null;throw e;}}
export const objectTopology=guarded(objectTopologyRaw);
function containsScale(o){return o.scale?.some(v=>Math.abs(v-1)>1e-8)||o.params?.children?.some(containsScale);}
function containsMesh(o){return o.type==='mesh'||isThread(o)||o.params?.children?.some(containsMesh);}
export function disposeSolidCache(){meshes.clear();meshBytes=0;for(const entry of cache.values())release(entry);cache.clear();brepBytes=0;topologies.clear();topologyTotal=0;}
// Test hook (WS1 parity): topology of o through the legacy or the scoped extractor, without touching the cache.
export function topologyVariant(o,scoped){const base=baseShape(o),edges=base.edges;try{return scoped?scopedTopology(base,edges,o):legacyTopology(base,edges);}finally{edges.forEach(dispose);if(scoped){try{R.getOC().BRepTools.Clean(base.wrapped,true);}catch{}}dispose(base);}}
// Test hook (new-primitives ADR §5.4, exact STEP): the exact base B-rep of o, outside the cache; the caller deletes it.
export function baseShapeForTest(o){return baseShape(o);}
// Test hook (ADR-0001 F6 acceptance): the exact finished B-rep (base + chamfers/rounds) of o, outside the cache; the caller deletes it.
export function finishedShapeForTest(o){const base=baseShape(o),edges=explore(base,'edge');try{return applyFillets(base,o.fillets,edges);}finally{edges.forEach(dispose);dispose(base);}}
// Amendment A2.5: warm the torus / glyph topology code paths once (JIT and wasm tier-up) on a tiny shape, outside the
// caches, so the first real Add does not pay that cost. Returns ms. The worker calls it only when it is idle.
export function warmShape(o){const t=performance.now(),base=baseShape(o),edges=explore(base,'edge');
 try{topology(base,edges,o);}finally{edges.forEach(dispose);try{R.getOC().BRepTools.Clean(base.wrapped,true);}catch{}dispose(base);}return performance.now()-t;}
