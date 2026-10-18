// ADR-0001 F2a option A: the fixed 3MF part split, shared by the Rust wrapper and the pool (mirrors three_mf::part_range).
// Parts 0-3 are the vertex list in quarters, parts 4-7 the triangle list in quarters; independent of worker count.
export const PARTS_3MF=8;
export function partRange3MF(points,triangles,k){const [n,j]=k<4?[points,k]:[triangles,k-4];return [Math.floor(n*j/4),Math.floor(n*(j+1)/4)];}
