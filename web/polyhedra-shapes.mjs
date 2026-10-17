// Advanced planar shapes (ADR new-primitives-polyhedra-text §2.1): the regular
// polyhedra, the d10 pentagonal trapezohedron and the isosceles triangular prism.
// Pure JS with no kernel imports, so it is safe for both the UI bundle and the worker.
// Every solid rests on face 0 at Z = min, with that face's first edge parallel to X, and is
// centred on its bounding box. Faces are listed counter-clockwise seen from outside
// (outward normals), the same convention as primitiveFaces() in polyhedra.mjs.
import {UNIT_POLYHEDRA,DECAHEDRON_FACES} from './polyhedra-tables.mjs';
import {orientFaceDown,decahedronVertices} from './polyhedra-geometry.mjs';

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
 if(type==='decahedron'){const V=polyhedronFaces(type,params).vertices;return [0,1,2].map(k=>Math.max(...V.map(p=>p[k]))-Math.min(...V.map(p=>p[k])));}
 const table=UNIT_POLYHEDRA[type];
 if(!table)throw Error('Unknown planar primitive.');
 return table.size.map(v=>v*params.size);
}
