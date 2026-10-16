import {primitiveMesh} from './polyhedra.mjs';
import {initSolid,solidMesh,objectTopology,objectTopologyEntry} from './cad-solid.mjs';
import {TOPOLOGY_SERVICE} from './perf-flags.mjs';
import {facetedSphere,facetMesh,curvedTypes,resolutionTolerance,customFaces} from './facets.mjs';
import {isThread,containsThreads,validateThread} from './threads.mjs';
import {layerOf,normalizeLayers,materialGroups} from './layers.mjs';

export async function initKernel(options={}) {
  const {default:Module}=await import('manifold-3d');
  const K = await Module(options); K.setup(); if(options.solidOptions!==false)await initSolid(options.solidOptions||{}); return K;
}
export const QUALITY = { draft:0.15, fine:0.03, ultra:0.01, maximum:0.005 };
export function segments(radius, tolerance) {
  if (!(radius>0)) return 32;
  return Math.min(1024, Math.max(24, Math.ceil(Math.PI/Math.acos(Math.max(-1,1-Math.min(tolerance,radius)/radius))/4)*4));
}
export function validateProject(p) {
  if (!p || p.format!=='tristancad' || p.version!==2 || !Array.isArray(p.objects) || p.objects.length>100) throw Error('This is not a supported AvalonCad project (maximum 100 objects).');
  const out=structuredClone(p);
  normalizeLayers(out);
  if(out.buildPlaneEnabled!==undefined&&typeof out.buildPlaneEnabled!=='boolean')throw Error('Invalid build-plane setting.');
  out.name=String(out.name||'Untitled').slice(0,80);
  const types=['box','rounded','cylinder','cone','sphere','tube','threadrod','threadtube','polygon','mesh','joined','wedge','pyramid','prefab'];
  const ids=new Set();
  for (const o of out.objects) {
    if (!types.includes(o.type)||typeof o.id!=='string'||ids.has(o.id)) throw Error('Project contains an invalid object.'); ids.add(o.id);
    o.name=String(o.name||o.type).slice(0,60); o.mode=o.mode==='cut'?'cut':'solid'; o.enabled=o.enabled!==false;
    for (const key of ['position','rotation']) if (!Array.isArray(o[key])||o[key].length!==3||o[key].some(v=>!Number.isFinite(v)||Math.abs(v)>10000)) throw Error('Invalid object coordinates.');
    o.params=o.params||{};
    if(o.positionReference!==undefined&&o.positionReference!=='base')throw Error('Invalid position reference.');
    if(o.positionReference==='base'&&o.placement===undefined||o.placement!==undefined&&o.positionReference!=='base')throw Error('Invalid base position.');
    if(o.placement!==undefined&&(!Array.isArray(o.placement)||o.placement.length!==3||o.placement.some(v=>!Number.isFinite(v)||Math.abs(v)>10000)))throw Error('Invalid base position.');
    if(isThread(o))validateThread(o);
    if(['joined','prefab'].includes(o.type)&&containsThreads(o)&&o.scale?.some(v=>Math.abs(v-1)>1e-8))throw Error('Separate threaded components before changing their dimensions to preserve thread pitch.');
    if(o.params.fillOverlaps!==undefined&&(!['joined','prefab'].includes(o.type)||typeof o.params.fillOverlaps!=='boolean'))throw Error('Invalid Add overlap setting.');
    if(o.excludedCutouts!==undefined&&(!Array.isArray(o.excludedCutouts)||o.excludedCutouts.length>100||o.excludedCutouts.some(id=>typeof id!=='string'||id.length>100)||new Set(o.excludedCutouts).size!==o.excludedCutouts.length))throw Error('Invalid saved cutout exclusions.');
    if(o.resolution){
      const r=o.resolution;
      if(!curvedTypes.includes(o.type)||!['auto','faces','tolerance'].includes(r.mode))throw Error('Invalid face-resolution mode.');
      if(r.mode==='faces'&&(!Number.isInteger(r.count)||r.count<(o.type==='sphere'?4:o.type==='rounded'?1:3)||r.count>(o.type==='rounded'?128:512)))throw Error(o.type==='sphere'?'Sphere face count must be a whole number from 4 to 512.':o.type==='rounded'?'Segments per corner must be a whole number from 1 to 128.':'Sides must be a whole number from 3 to 512.');
      if(r.mode==='tolerance'&&(!Number.isFinite(r.tolerance)||r.tolerance<.005||r.tolerance>2))throw Error('Face resolution must be from 0.005 to 2 mm.');
    }
    if(o.scale && (!Array.isArray(o.scale)||o.scale.length!==3||o.scale.some(v=>!Number.isFinite(v)||v<.001||v>1000)))throw Error('Invalid object scale.');
    if(o.fillets && (!Array.isArray(o.fillets)||o.fillets.length>100||o.fillets.some(f=>!Number.isFinite(f.radius)||f.radius<0||f.radius>10000||!Array.isArray(f.edges)||f.edges.length>500||f.edges.some(i=>!Number.isInteger(i)||i<0||i>10000))))throw Error('Invalid roundover.');
    if(o.type==='joined') {if(!Array.isArray(o.params.children)||o.params.children.length<2)throw Error('A combined solid needs at least two components.');if(!o.params.children.some(c=>c.mode!=='cut'))throw Error('Combined objects need positive material.');validateProject({format:'tristancad',version:2,objects:o.params.children,layers:out.layers,activeLayer:out.activeLayer});}
    if(o.type==='prefab'){if(!Array.isArray(o.params.children)||!o.params.children.length||o.params.children.length>100||!o.params.children.some(c=>c.enabled!==false&&c.mode!=='cut'))throw Error('A prefab needs 1–100 components with positive material.');if(!Array.isArray(o.params.layers))throw Error('The prefab is missing its internal layers.');validateProject({format:'tristancad',version:2,objects:o.params.children,layers:o.params.layers});}
    for(const v of Object.values(o.params)) if(typeof v==='number' && (!Number.isFinite(v)||Math.abs(v)>10000)) throw Error('Invalid dimensions.');
    const positiveKeys={wedge:['w','d','h'],pyramid:['w','d','h'],box:['w','d','h'],rounded:['w','d','h','r'],cylinder:['diameter','h'],cone:['diameter','h'],sphere:['diameter'],tube:['diameter','inner','h'],polygon:['h']}[o.type]||[];
    if(positiveKeys.some(k=>!(o.params[k]>=0.05))) throw Error('Dimensions must be at least 0.05 mm.');
    if(o.type==='cone' && !(o.params.top>=0 && o.params.top<=10000)) throw Error('Invalid cone top diameter.');
    if(o.type==='rounded' && o.params.r>Math.min(o.params.w,o.params.d)/2) throw Error('Corner radius is larger than half the width or depth.');
    if(o.type==='tube' && o.params.inner>=o.params.diameter) throw Error('The inner diameter must be smaller than the outer diameter.');
    if(o.type==='polygon') {
      const pts=o.params.points;
      if(!Array.isArray(pts)||pts.length<3||pts.length>300||pts.some(a=>!Array.isArray(a)||a.length!==2||a.some(v=>!Number.isFinite(v)||Math.abs(v)>10000))) throw Error('Invalid sketch polygon.');
      assertSimplePolygon(pts);
    }
    if(o.type==='mesh') {
      const m=o.params.mesh;
      if(!m||!Array.isArray(m.vertices)||!Array.isArray(m.triangles)||m.vertices.length>3000000||m.triangles.length>3000000||m.vertices.length%3||m.triangles.length%3||m.vertices.some(v=>!Number.isFinite(v)||Math.abs(v)>10000)||m.triangles.some(v=>!Number.isInteger(v)||v<0||v>=m.vertices.length/3)) throw Error('Invalid imported mesh.');
    }
  }
  return out;
}
export function ccwPoints(points){const area=points.reduce((sum,p,i)=>{const n=points[(i+1)%points.length];return sum+p[0]*n[1]-p[1]*n[0];},0);return area<0?[...points].reverse():points;}
export function assertSimplePolygon(points) {
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  const on=(a,b,c)=>Math.abs(cross(a,b,c))<1e-8 && c[0]>=Math.min(a[0],b[0])-1e-8 && c[0]<=Math.max(a[0],b[0])+1e-8 && c[1]>=Math.min(a[1],b[1])-1e-8 && c[1]<=Math.max(a[1],b[1])+1e-8;
  const intersects=(a,b,c,d)=>((cross(a,b,c)*cross(a,b,d)<0 && cross(c,d,a)*cross(c,d,b)<0)||on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b));
  let area=0;
  for(let i=0;i<points.length;i++) {
    const a=points[i],b=points[(i+1)%points.length];
    if(Math.hypot(a[0]-b[0],a[1]-b[1])<0.001) throw Error('Remove repeated sketch points.');
    area+=a[0]*b[1]-a[1]*b[0];
    for(let j=i+1;j<points.length;j++) {
      if(j===i+1||(i===0&&j===points.length-1)) continue;
      if(intersects(a,b,points[j],points[(j+1)%points.length])) throw Error('Sketch lines cross. Draw a simple closed outline.');
    }
  }
  if(Math.abs(area)<0.01) throw Error('Sketch needs an enclosed area.');
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
  tolerance=resolutionTolerance(o,tolerance);
  const {Manifold:M}=K,p=o.params,custom=customFaces(o),n=custom||segments((p.diameter||p.r*2||20)/2,tolerance);
  let s,tagged=false; const keep=[]; const own=x=>(keep.push(x),x);
  try {
    if(o.fillets?.some(f=>f.radius>0)){const m=solidMesh(o,tolerance,!!styles),descriptor={numProp:3,vertProperties:m.vertices,triVerts:m.triangles,tolerance:1e-5};
      if(styles&&m.displayGroups.length){const first=M.reserveIDs(m.displayGroups.length);descriptor.runIndex=new Uint32Array([...m.displayGroups.map(g=>g.start),m.triangles.length]);descriptor.runOriginalID=new Uint32Array(m.displayGroups.map((g,i)=>{styles.set(first+i,g.flat);return first+i;}));tagged=true;}
      const mesh=new K.Mesh(descriptor);mesh.merge();s=own(new M(mesh));}
    else switch(o.type) {
      case 'threadrod':case 'threadtube':{
        validateThread(o);if(!K.threadMesh)throw Error('The local thread engine is not ready.');
        const m=K.threadMesh(o,tolerance),mesh=new K.Mesh({numProp:3,vertProperties:m.vertices,triVerts:m.triangles});s=own(new M(mesh));break;
      }
      case 'wedge':case 'pyramid':{const m=primitiveMesh(o.type,p),mesh=new K.Mesh({numProp:3,vertProperties:m.vertices,triVerts:m.triangles});s=own(new M(mesh));break;}
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
    if(styles&&!tagged&&!['joined','prefab'].includes(o.type)){if(s.originalID()<0)s=own(s.asOriginal());styles.set(s.originalID(),custom>0||['box','polygon','wedge','pyramid'].includes(o.type));}
    keep.pop();return s;
  } finally {for(const x of keep)x.delete();}
}
export function meshData(s,styles) {
  const m=s.getMesh();
  const vertices=new Float32Array(m.numVert*3);
  for(let i=0;i<m.numVert;i++) for(let k=0;k<3;k++)vertices[i*3+k]=m.vertProperties[i*m.numProp+k];
  const result={vertices,triangles:new Uint32Array(m.triVerts)};
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
export function readSTL(buffer) {
  const view=new DataView(buffer),vertices=[],triangles=[];
  if(buffer.byteLength>=84 && 84+view.getUint32(80,true)*50===buffer.byteLength) {
    const count=view.getUint32(80,true);if(count>1000000)throw Error('STL exceeds 1 million triangles.');
    for(let t=0;t<count;t++)for(let j=0;j<3;j++){const at=84+t*50+12+j*12;vertices.push(view.getFloat32(at,true),view.getFloat32(at+4,true),view.getFloat32(at+8,true));triangles.push(triangles.length);}
  } else {
    const text=new TextDecoder().decode(buffer),rx=/vertex\s+([-+\deE.]+)\s+([-+\deE.]+)\s+([-+\deE.]+)/g;let m;
    while((m=rx.exec(text))){vertices.push(+m[1],+m[2],+m[3]);triangles.push(triangles.length);if(triangles.length>3000000)throw Error('STL exceeds 1 million triangles.');}
  }
  if(!triangles.length||triangles.length%3||vertices.some(v=>!Number.isFinite(v)))throw Error('Invalid STL file.');
  return {vertices,triangles};
}
