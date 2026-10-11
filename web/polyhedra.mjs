// Exact planar primitive surfaces, shared by the mesh and CAD kernels.
export function primitiveFaces(type,{w,d,h}){
 const x=w/2,y=d/2,z=h/2;
 let vertices,faces;
 if(type==='wedge'){
  vertices=[[-x,-y,-z],[x,-y,-z],[x,-y,z],[-x,y,-z],[x,y,-z],[x,y,z]];
  faces=[[0,1,2],[3,5,4],[0,3,4,1],[1,4,5,2],[0,2,5,3]];
 }else if(type==='pyramid'){
  vertices=[[-x,-y,-z],[x,-y,-z],[x,y,-z],[-x,y,-z],[0,0,z]];
  faces=[[0,3,2,1],[0,1,4],[1,2,4],[2,3,4],[3,0,4]];
 }else throw Error('Unknown planar primitive.');
 return {vertices,faces};
}
export function primitiveMesh(type,params){const {vertices,faces}=primitiveFaces(type,params),triangles=[];for(const f of faces)for(let i=1;i<f.length-1;i++)triangles.push(f[0],f[i],f[i+1]);return {vertices:new Float32Array(vertices.flat()),triangles:new Uint32Array(triangles)};}
