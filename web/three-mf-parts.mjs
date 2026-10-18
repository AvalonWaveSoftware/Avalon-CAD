// ADR-0001 F2a option A + Architect ruling 3: the fixed 3MF part split, shared by the Rust wrapper and the pool
// (mirrors three_mf::parts_for / part_range). The part count depends ONLY on the triangle count: one part (the plain
// single-stream path) below 65,536 triangles, 8 at or above; never on the worker count.
export const PARTS_3MF=8,SPLIT_TRIANGLES_3MF=65536;
export const parts3MF=triangles=>triangles<SPLIT_TRIANGLES_3MF?1:PARTS_3MF;
/** [[vertexStart, vertexEnd], [triangleStart, triangleEnd]] of part k of n (records, not floats). */
export function partRange3MF(points,triangles,k,n=parts3MF(triangles)){
 if(n===1)return [[0,points],[0,triangles]];
 const q=(m,j)=>[Math.floor(m*j/4),Math.floor(m*(j+1)/4)];
 return k<4?[q(points,k),[0,0]]:[[0,0],q(triangles,k-4)];}
