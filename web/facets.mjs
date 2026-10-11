// Convex sphere approximations with an exact number of planar faces.
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>a.map(v=>v/Math.hypot(...a));
const memo=new Map();
function normals(count){
 if(count===4)return [[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(unit);
 if(count===6)return [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
 if(count===8){const a=[];for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1])a.push(unit([x,y,z]));return a;}
 const phi=(1+Math.sqrt(5))/2;
 if(count===12){const a=[];for(const x of [-1,1])for(const y of [-phi,phi])a.push(unit([0,x,y]),unit([x,y,0]),unit([y,0,x]));return a;}
 if(count===20){const a=[];for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1])a.push(unit([x,y,z]));for(const x of [-1/phi,1/phi])for(const y of [-phi,phi])a.push(unit([0,x,y]),unit([x,y,0]),unit([y,0,x]));return a;}
 return Array.from({length:count},(_,i)=>{const z=1-2*(i+.5)/count,r=Math.sqrt(1-z*z),a=i*Math.PI*(3-Math.sqrt(5));return [r*Math.cos(a),r*Math.sin(a),z];});
}
function clean(points){return points.filter((a,i)=>Math.hypot(...sub(a,points[(i+points.length-1)%points.length]))>1e-8);}
function build(count){
 const v=[[-8,-8,-8],[8,-8,-8],[8,8,-8],[-8,8,-8],[-8,-8,8],[8,-8,8],[8,8,8],[-8,8,8]];
 let faces=[[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]].map(ids=>({normal:unit(cross(sub(v[ids[1]],v[ids[0]]),sub(v[ids[2]],v[ids[0]]))),points:ids.map(i=>v[i]),seed:true}));
 for(const normal of normals(count)){
  const next=[],cap=[];
  for(const face of faces){
   const clipped=[];
   for(let i=0;i<face.points.length;i++){
    const a=face.points[i],b=face.points[(i+1)%face.points.length],da=dot(a,normal)-1,db=dot(b,normal)-1;
    if(da<=1e-9)clipped.push(a);
    if((da<-1e-9&&db>1e-9)||(da>1e-9&&db<-1e-9)){const t=da/(da-db),p=a.map((x,j)=>x+t*(b[j]-x));clipped.push(p);cap.push(p);}
    if(Math.abs(da)<=1e-9)cap.push(a);
   }
   const points=clean(clipped);if(points.length>=3)next.push({...face,points});
  }
  const unique=new Map(cap.map(p=>[p.map(v=>Math.round(v*1e8)).join(','),p])),pts=[...unique.values()];
  if(pts.length<3)throw Error('Could not build that face count.');
  const center=[0,1,2].map(i=>pts.reduce((s,p)=>s+p[i],0)/pts.length),u=unit(cross(Math.abs(normal[2])<.9?[0,0,1]:[0,1,0],normal)),w=cross(normal,u);
  pts.sort((a,b)=>Math.atan2(dot(sub(a,center),w),dot(sub(a,center),u))-Math.atan2(dot(sub(b,center),w),dot(sub(b,center),u)));
  next.push({normal,points:clean(pts)});faces=next;
 }
 if(faces.some(f=>f.seed)||faces.length!==count)throw Error('Could not make a closed solid with that face count.');
 // Use maximum axis span for Diameter / overall size; center the bounding box.
 const all=faces.flatMap(f=>f.points),lo=[0,1,2].map(i=>Math.min(...all.map(p=>p[i]))),hi=[0,1,2].map(i=>Math.max(...all.map(p=>p[i]))),mid=lo.map((v,i)=>(v+hi[i])/2),scale=1/Math.max(...hi.map((v,i)=>v-lo[i]));
 return faces.map(f=>({normal:f.normal,points:f.points.map(p=>p.map((v,i)=>(v-mid[i])*scale))}));
}
export function facetedSphere(count,diameter=1){
 if(!Number.isInteger(count)||count<4||count>512)throw Error('Sphere face count must be a whole number from 4 to 512.');
 if(!memo.has(count)){memo.set(count,build(count));if(memo.size>16)memo.delete(memo.keys().next().value);}
 return memo.get(count).map(f=>({normal:[...f.normal],points:f.points.map(p=>p.map(v=>v*diameter))}));
}
export function facetMesh(faces){
 const vertices=[],triangles=[],ids=new Map();
 const id=p=>{const key=p.map(v=>Math.round(v*1e7)).join(',');if(!ids.has(key)){ids.set(key,vertices.length/3);vertices.push(...p);}return ids.get(key);};
 for(const f of faces){const indices=f.points.map(id);for(let i=1;i<indices.length-1;i++)triangles.push(indices[0],indices[i],indices[i+1]);}
 return {vertices:new Float32Array(vertices),triangles:new Uint32Array(triangles)};
}
export const curvedTypes=['sphere','cylinder','cone','tube','rounded','threadrod','threadtube'];
export function resolutionTolerance(o,fallback){return o.resolution?.mode==='tolerance'?o.resolution.tolerance:fallback;}
export function customFaces(o){return o.resolution?.mode==='faces'?o.resolution.count:0;}
