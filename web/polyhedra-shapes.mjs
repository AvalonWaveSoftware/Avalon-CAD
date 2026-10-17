// Advanced planar shapes (ADR new-primitives-polyhedra-text §2.1): the regular
// polyhedra, the d10 pentagonal trapezohedron and the isosceles triangular prism.
// Pure JS with no kernel imports, so it is safe for both the UI bundle and the worker.
// Every solid rests on face 0 at Z = min, with that face's first edge parallel to X, and is
// centred on its bounding box. Faces are listed counter-clockwise seen from outside
// (outward normals), the same convention as primitiveFaces() in polyhedra.mjs.
import {UNIT_POLYHEDRA,UNIT_SIZES,DECAHEDRON_FACES} from './polyhedra-tables.mjs';
import {orientFaceDown,decahedronVertices,sub,cross,dot,unit} from './polyhedra-geometry.mjs';

export const POLYHEDRON_TYPES=Object.freeze(['tetrahedron','octahedron','decahedron','dodecahedron','icosahedron']);
export const ADVANCED_FACE_TYPES=Object.freeze(['triprism',...POLYHEDRON_TYPES]);

const clone=faces=>faces.map(f=>f.slice());
function scaled(table,k){return {vertices:table.vertices.map(p=>[p[0]*k,p[1]*k,p[2]*k]),faces:clone(table.faces)};}

// Planar faces for the new flat-faced types. Params (mm):
//   triprism {w,d,h}: isosceles cross-section in XZ (base w, apex height h), length d along Y.
//   tetrahedron / octahedron / dodecahedron / icosahedron {size}: edge length.
//   decahedron {diameter,h}: ring diameter and apex-to-apex height.
export function polyhedronFaces(type,params){
 if(type==='triprism'){
  const x=params.w/2,y=params.d/2,z=params.h/2;
  return {vertices:[[-x,-y,-z],[x,-y,-z],[0,-y,z],[-x,y,-z],[x,y,-z],[0,y,z]],faces:[[1,0,3,4],[0,1,2],[3,5,4],[1,4,5,2],[0,2,5,3]]}; // face 0 = bottom
 }
 if(type==='decahedron'){
  const faces=clone(DECAHEDRON_FACES);
  return {vertices:orientFaceDown(decahedronVertices(params.diameter,params.h),faces,0),faces};
 }
 const table=UNIT_POLYHEDRA[type];
 if(!table)throw Error('Unknown planar primitive.');
 return scaled(table,params.size);
}

// Overall size [x, y, z] in mm, for dimensions() and localCenter(). Cheap for the
// tabled solids (unit bbox × size); the d10 is computed from its vertices.
export function polyBounds(type,params){
 if(type==='triprism')return [params.w,params.d,params.h];
 if(type==='decahedron'){
  // The extents of the face-down d10 along its own axes: the bottom edge (X), the kite plane's other axis (Y) and the
  // kite normal (Z). Rotation-invariant, so main.js does not need orientFaceDown.
  const V=decahedronVertices(params.diameter,params.h),[a,b,c]=DECAHEDRON_FACES[0].map(i=>V[i]),n=unit(cross(sub(b,a),sub(c,a))),ex=unit(sub(b,a));
  return [ex,cross(n,ex),n].map(axis=>{const t=V.map(p=>dot(p,axis));return Math.max(...t)-Math.min(...t);});
 }
 const size=UNIT_SIZES[type];
 if(!size)throw Error('Unknown planar primitive.');
 return size.map(v=>v*params.size);
}
