// Test-only oracle. Never imported by web/.
export function overhangStats(positions,indices,threshold=Math.SQRT1_2,ground=true){
 let area=0,count=0,bed=ground?Infinity:0;if(ground)for(let i=2;i<positions.length;i+=3)bed=Math.min(bed,positions[i]);
 for(let i=0;i<indices.length;i+=3){
  const [a,b,c]=[indices[i]*3,indices[i+1]*3,indices[i+2]*3],u=[],v=[];
  for(let k=0;k<3;k++){u[k]=positions[b+k]-positions[a+k];v[k]=positions[c+k]-positions[a+k];}
  if(positions[a+2]===bed&&positions[b+2]===bed&&positions[c+2]===bed)continue; // on the build plate (QA addendum)
  const x=u[1]*v[2]-u[2]*v[1],y=u[2]*v[0]-u[0]*v[2],z=u[0]*v[1]-u[1]*v[0],length=Math.hypot(x,y,z);
  if(z < -threshold*length){area+=length/2;count++;}
 }
 return {area,count};
}
