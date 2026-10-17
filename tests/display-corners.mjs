// WS10: per-corner view of a preview's display arrays (expands displayIndex when the display is indexed), so tests can
// keep checking corner i of triangle f at [f*9+i*3].
export function corners(m){if(!m.displayIndex)return {positions:m.displayPositions,normals:m.displayNormals};
 const n=m.displayIndex.length,positions=new Float32Array(n*3),normals=new Float32Array(n*3);
 for(let i=0;i<n;i++){const j=m.displayIndex[i]*3;for(let k=0;k<3;k++){positions[i*3+k]=m.displayPositions[j+k];normals[i*3+k]=m.displayNormals[j+k];}}
 return {positions,normals};}
