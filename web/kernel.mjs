import {primitiveMesh,PLANAR_TYPES} from './polyhedra.mjs';
import {glyphManifold,glyphBevelPart,glyphPlate} from './glyph-geometry.mjs';
import {initSolid,solidMesh,noteGlyphBevel,objectTopology,objectTopologyEntry,setTriangulator} from './cad-solid.mjs';
import {TOPOLOGY_SERVICE,INDEXED_DISPLAY} from './perf-flags.mjs';
import {facetedSphere,facetMesh,curvedTypes,resolutionTolerance,customFaces} from './facets.mjs';
import {isThread,containsThreads,validateThread} from './threads.mjs';
import {layerOf,normalizeLayers,materialGroups} from './layers.mjs';
import {QUALITY,segments,validateProject,ccwPoints,assertSimplePolygon,readSTL} from './kernel-ui.mjs';
export {QUALITY,segments,validateProject,ccwPoints,assertSimplePolygon,readSTL};

export async function initKernel(options={}) {
  const {default:Module}=await import('manifold-3d');
  // WS8 (options.parallel): Manifold and OCCT download and compile concurrently; neither depends on the other.
  if(options.parallel&&options.solidOptions!==false){const [K]=await Promise.all([Module(options).then(K=>{K.setup();setTriangulator(K.triangulate);return K;}),initSolid(options.solidOptions||{})]);return K;}
  const K = await Module(options); K.setup(); setTriangulator(K.triangulate); if(options.solidOptions!==false)await initSolid(options.solidOptions||{}); return K;
}
// WS5: makeObject = placeObjectSolid(makeLocalSolid(...)). The local solid (shape, styles) depends only on the
// object's content and tolerance; scale, rotation and translation are applied last (one lazy transform), exactly as before, so a cached local
// solid placed again gives the same solid as a fresh build.
export function makeObject(K,o,tolerance=0.15,styles){return placeObjectSolid(o,makeLocalSolid(K,o,tolerance,styles));}
export function placeObjectSolid(o,local,keepLocal=false){const keep=keepLocal?[]:[local];const own=x=>(keep.push(x),x);let s=local;
  try{if(o.scale)s=own(s.scale(o.scale));s=own(s.rotate(o.rotation));s=own(s.translate(o.position));
    const status=s.status();if(status!=='NoError')throw Error(o.name+': '+status+'. The mesh must be a closed solid.');
    keep.pop();return s;
  } finally {for(const x of keep)x.delete();}
}
export function makeLocalSolid(K,o,tolerance=0.15,styles) {
  const requested=tolerance;tolerance=resolutionTolerance(o,tolerance);
  const {Manifold:M}=K,p=o.params,custom=customFaces(o),n=custom||segments((p.diameter||p.r*2||20)/2,tolerance);
  let s,tagged=false; const keep=[]; const own=x=>(keep.push(x),x);
  try {
    // ADR-0001 F7: a bevelled glyph's bevel is an OCCT product meshed like a filleted part, on its own cached part
    // (glyph-geometry.mjs glyphBevelPart); the plate is then Manifold (glyphPlate, below).
    const bevelled=o.type==='glyph'&&p.bevel>0;
    if(o.fillets?.some(f=>f.radius>0)||bevelled){const m=solidMesh(bevelled?glyphBevelPart(o):o,tolerance,!!styles);
      // WS14 (OCCT_SIDECAR): the fillet mesh is still being computed by the sidecar. This run is a stand-in (never
      // cached, sent, if at all, only as display-only interim data): the part without its fillets (and bevel).
      if(!m)return makeLocalSolid(K,bevelled?{...o,fillets:[],params:{...p,bevel:0}}:{...o,fillets:[]},requested,styles);
      const build=m=>{const descriptor={numProp:3,vertProperties:m.vertices,triVerts:m.triangles,tolerance:1e-5};
      if(styles&&m.displayGroups.length){const first=M.reserveIDs(m.displayGroups.length);descriptor.runIndex=new Uint32Array([...m.displayGroups.map(g=>g.start),m.triangles.length]);descriptor.runOriginalID=new Uint32Array(m.displayGroups.map((g,i)=>{styles.set(first+i,g.flat);return first+i;}));tagged=true;}
      const mesh=new K.Mesh(descriptor);mesh.merge();return new M(mesh);};
      if(!bevelled)s=own(build(m));
      else{
        // F7: OCCT can return a valid bevelled B-rep whose tessellation is not closed (round 'j', 'm' at 0.5 mm). That
        // bevel counts as failed: retried once at half size (the same "Bevel reduced" notice), else the bevel error.
        const fail=()=>Error(`Bevel not possible on '${p.char}' at this size`);
        try{s=own(build(m));}catch{
          if(m.bevelUsed)throw fail();const half={...o,params:{...p,bevel:p.bevel/2}},mh=solidMesh(glyphBevelPart(half),tolerance,!!styles);
          if(!mh)return makeLocalSolid(K,{...o,fillets:[],params:{...p,bevel:0}},requested,styles);
          if(mh.bevelUsed)throw fail();try{s=own(build(mh));}catch{throw fail();}noteGlyphBevel(o,p.bevel/2);}}
      if(bevelled&&p.plate>0){keep.pop();s=own(glyphPlate(K,p,s));}}
    else switch(o.type) {
      case 'threadrod':case 'threadtube':{
        validateThread(o);if(!K.threadMesh)throw Error('The local thread engine is not ready.');
        const m=K.threadMesh(o,tolerance),mesh=new K.Mesh({numProp:3,vertProperties:m.vertices,triVerts:m.triangles});s=own(new M(mesh));break;
      }
      case 'wedge':case 'pyramid':case 'triprism':case 'tetrahedron':case 'octahedron':case 'decahedron':case 'dodecahedron':case 'icosahedron':{const m=primitiveMesh(o.type,p),mesh=new K.Mesh({numProp:3,vertProperties:m.vertices,triVerts:m.triangles});s=own(new M(mesh));break;}
      // Torus: a tube circle (segments for the tube radius) revolved with segments for the outer radius.
      case 'torus':{const r=p.tube/2,ring=(p.diameter-p.tube)/2,nt=segments(r,tolerance),nr=segments(ring+r,tolerance),circle=Array.from({length:nt},(_,i)=>{const a=2*Math.PI*i/nt;return [ring+r*Math.cos(a),r*Math.sin(a)];});s=own(M.revolve([circle],nr));break;}
      case 'glyph':s=own(glyphManifold(K,p,tolerance));break;
      case 'box':s=own(M.cube([p.w,p.d,p.h],true));break;
      case 'rounded': {
        const pts=[], count=custom||Math.max(6,segments(p.r,tolerance)/4),r=Math.min(p.r,p.w/2,p.d/2);
        for(let k=0;k<4;k++) {
          const cx=(k===0||k===3?1:-1)*(p.w/2-r),cy=(k<2?1:-1)*(p.d/2-r);
          for(let i=0;i<=count;i++) {const a=k*Math.PI/2+i*Math.PI/2/count;pts.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}
        }
        const clean=pts.filter((a,i)=>!i||Math.hypot(a[0]-pts[i-1][0],a[1]-pts[i-1][1])>1e-7);
        s=own(M.extrude([clean],p.h,0,0,[1,1],true));break;
      }
      case 'cylinder':s=own(M.cylinder(p.h,p.diameter/2,p.diameter/2,n,true));break;
      case 'cone':s=own(M.cylinder(p.h,p.diameter/2,p.top/2,custom||segments(Math.max(p.diameter,p.top)/2,tolerance),true));break;
      case 'sphere':if(custom){const m=facetMesh(facetedSphere(custom,p.diameter)),mesh=new K.Mesh({numProp:3,vertProperties:m.vertices,triVerts:m.triangles,tolerance:1e-6});mesh.merge();s=own(new M(mesh));}else s=own(M.sphere(p.diameter/2,n));break;
      case 'tube': {const a=own(M.cylinder(p.h,p.diameter/2,p.diameter/2,n,true));const b=own(M.cylinder(p.h+0.2,p.inner/2,p.inner/2,custom||segments(p.inner/2,tolerance),true));s=own(a.subtract(b));break;}
      case 'polygon':s=own(M.extrude([ccwPoints(p.points)],p.h,0,0,[1,1],true));break;
      case 'mesh': {
        const mesh=new K.Mesh({numProp:3,vertProperties:new Float32Array(p.mesh.vertices),triVerts:new Uint32Array(p.mesh.triangles)});mesh.merge();s=own(new M(mesh));break;
      }
      case 'prefab':{const groups=materialGroups(p.children),material=[];for(const group of groups){let merged=own(M.union(group.solids.map(c=>own(makeObject(K,c,tolerance,styles)))));if(group.cuts.length)merged=own(merged.subtract(own(M.union(group.cuts.map(c=>own(makeObject(K,c,tolerance,styles)))))));material.push(merged);}s=own(M.union(material));break;}
      case 'joined':{const solids=p.children.filter(c=>c.mode!=='cut').map(c=>own(makeObject(K,c,tolerance,styles))),cuts=p.children.filter(c=>c.mode==='cut').map(c=>own(makeObject(K,c,tolerance,styles)));if(cuts.length&&p.fillOverlaps){const base=own(solids[0].subtract(own(M.union(cuts))));s=own(M.union([base,...solids.slice(1)]));}else{s=own(M.union(solids));if(cuts.length)s=own(s.subtract(own(M.union(cuts))));}break;}
      default:throw Error('Unsupported shape.');
    }
    if(styles&&!tagged&&!['joined','prefab'].includes(o.type)){if(s.originalID()<0)s=own(s.asOriginal());styles.set(s.originalID(),custom>0||['box','polygon',...PLANAR_TYPES].includes(o.type));}
    keep.pop();return s;
  } finally {for(const x of keep)x.delete();}
}
export function meshData(s,styles) {
  const m=s.getMesh();
  // WS10: getMesh returns JS-owned, exactly sized arrays; with three properties they are the result as they are.
  const own=INDEXED_DISPLAY&&m.numProp===3&&m.vertProperties instanceof Float32Array&&m.triVerts instanceof Uint32Array;
  const vertices=own?m.vertProperties:new Float32Array(m.numVert*3);
  if(!own)for(let i=0;i<m.numVert;i++) for(let k=0;k<3;k++)vertices[i*3+k]=m.vertProperties[i*m.numProp+k];
  const result={vertices,triangles:own?m.triVerts:new Uint32Array(m.triVerts)};
  if(styles){const flat=new Uint8Array(m.triVerts.length/3),groups=new Uint32Array(flat.length);for(let i=0;i<m.runOriginalID.length;i++){const start=m.runIndex[i]/3,end=m.runIndex[i+1]/3;groups.fill(i+1,start,end);if(styles.get(m.runOriginalID[i]))flat.fill(1,start,end);}result.flatTriangles=flat;result.smoothingGroups=groups;}
  return result;
}
// WS5 (Sean's ruling): parts share the memoised topology by reference with its hash, as the worker's parts do (WS2).
const partTopology=o=>{if(!TOPOLOGY_SERVICE)return {topology:structuredClone(objectTopology(o))};const {hash,topology}=objectTopologyEntry(o);return {topology,topologyHash:hash};};
export function buildModel(K,project,tolerance,individual=false) {
  const owned=[],parts=[],styles=individual?new Map():undefined; const own=x=>(owned.push(x),x);
  try {
    const solid=[],cut=[];
    for(const o of project.objects.filter(x=>x.enabled)) {
      const s=own(makeObject(K,o,tolerance,styles));(o.mode==='cut'?cut:solid).push({o,s});
      if(individual)parts.push({id:o.id,mode:o.mode,...meshData(s,styles),bounds:s.boundingBox(),...partTopology(o)});
    }
    if(!solid.length)return {vertices:new Float32Array(),triangles:new Uint32Array(),...(styles?{flatTriangles:new Uint8Array(),smoothingGroups:new Uint32Array()}:{}),parts,volume:0,bounds:null};
    // Add can fill an existing cutout in its selected shapes without changing other parts.
    const groups=new Map();
    for(const entry of solid){const excluded=new Set(entry.o.excludedCutouts||[]),active=cut.filter(c=>layerOf(c.o)===layerOf(entry.o)&&!excluded.has(c.o.id)),key=active.map(c=>c.o.id).join('\0');if(!groups.has(key))groups.set(key,{solids:[],cuts:active.map(c=>c.s)});groups.get(key).solids.push(entry.s);}
    const material=[];
    for(const group of groups.values()){let merged=own(K.Manifold.union(group.solids));if(group.cuts.length)merged=own(merged.subtract(own(K.Manifold.union(group.cuts))));material.push(merged);}
    const s=own(K.Manifold.union(material));
    const status=s.status();if(status!=='NoError')throw Error('Could not build the solid: '+status);
    const result={...meshData(s,styles),parts,volume:s.volume(),bounds:s.isEmpty()?null:s.boundingBox()};
    return result;
  } finally {for(const s of owned)s.delete();}
}
export function writeSTL(vertices,triangles,ground=true) {
  const count=triangles.length/3;
  if(!count)throw Error('The model has no solid material to export.');
  const buffer=new ArrayBuffer(84+count*50),view=new DataView(buffer),label=new TextEncoder().encode('AvalonCad | millimeters | binary STL');
  new Uint8Array(buffer).set(label);view.setUint32(80,count,true);
  let minZ=Infinity;for(let i=2;i<vertices.length;i+=3)minZ=Math.min(minZ,vertices[i]);
  for(let t=0;t<count;t++) {
    const ids=[triangles[t*3]*3,triangles[t*3+1]*3,triangles[t*3+2]*3];
    const a=ids[0],b=ids[1],c=ids[2];
    const u=[vertices[b]-vertices[a],vertices[b+1]-vertices[a+1],vertices[b+2]-vertices[a+2]],w=[vertices[c]-vertices[a],vertices[c+1]-vertices[a+1],vertices[c+2]-vertices[a+2]];
    const normal=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],len=Math.hypot(...normal)||1;
    let offset=84+t*50;for(const v of normal){view.setFloat32(offset,v/len,true);offset+=4;}
    for(const i of ids)for(let k=0;k<3;k++){view.setFloat32(offset,vertices[i+k]-(k===2&&ground?minZ:0),true);offset+=4;}
    view.setUint16(offset,0,true);
  }
  return buffer;
}