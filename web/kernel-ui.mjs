// WS9 (ADR v2): the UI-safe part of the kernel (validation, QUALITY, polygon checks, STL import). main.mjs and the UI
// modules import only this file, so replicad/OCCT glue (kernel.mjs, cad-solid.mjs) stays out of main.js. Moved verbatim.
import {curvedTypes} from './facets.mjs';
import {isThread,containsThreads,validateThread} from './threads.mjs';
import {normalizeLayers} from './layers.mjs';
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
