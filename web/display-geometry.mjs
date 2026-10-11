import {BufferGeometry,BufferAttribute} from 'three';

export function hasFixedFacets(o){return o.resolution?.mode==='faces'||o.params.children?.some(hasFixedFacets)||false;}
export function prepareDisplayMesh(vertices,triangles,flat=false,groups){
 const v=vertices instanceof Float32Array?vertices:new Float32Array(vertices),t=triangles;
 if(v.length%3||t.length%3||v.some(x=>!Number.isFinite(x))||t.some(i=>!Number.isInteger(i)||i<0||i>=v.length/3)||groups?.length&&groups.length!==t.length/3||ArrayBuffer.isView(flat)&&flat.length&&flat.length!==t.length/3)throw Error('Invalid display mesh.');
 const positions=new Float32Array(t.length*3),normals=new Float32Array(positions.length),faces=new Float64Array(t.length),buckets=new Map(),ids=[];
 const bits=new Uint32Array(v.buffer,v.byteOffset,v.length),unit=n=>{const d=Math.hypot(...n)||1;return n.map(x=>x/d);};
 for(let f=0;f<t.length/3;f++){
  const a=t[f*3]*3,b=t[f*3+1]*3,c=t[f*3+2]*3,u=[0,1,2].map(k=>v[c+k]-v[b+k]),w=[0,1,2].map(k=>v[a+k]-v[b+k]);
  faces.set(unit([u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]]),f*3);
  for(let j=0;j<3;j++){const p=t[f*3+j]*3,key=[0,1,2].map(k=>v[p+k]===0?0:bits[p+k]).concat(groups?.[f]||0).join(',');let list=buckets.get(key);if(!list){list=[];buckets.set(key,list);}list.push(f);ids.push(list);}
 }
 const crease=Math.cos(Math.PI/6);
 for(let f=0;f<t.length/3;f++)for(let j=0;j<3;j++){
  const at=f*9+j*3,p=t[f*3+j]*3,n=Array.from(faces.subarray(f*3,f*3+3));positions.set(v.subarray(p,p+3),at);
  let normal=n;
  if(flat!==true&&!flat?.[f]){const sum=[0,0,0];for(const other of ids[f*3+j]){const start=other*3;if(n.reduce((s,x,k)=>s+x*faces[start+k],0)>crease)for(let k=0;k<3;k++)sum[k]+=faces[start+k];}normal=unit(sum);}
  normals.set(normal,at);
 }
 return {positions,normals};
}
export function displayGeometry(vertices,triangles,flat=false,prepared,groups){
 const data=prepared||prepareDisplayMesh(vertices,triangles,flat,groups);
 if(data.positions.length!==triangles.length*3||data.normals.length!==data.positions.length)throw Error('Invalid prepared display mesh.');
 const g=new BufferGeometry();g.setAttribute('position',new BufferAttribute(data.positions,3));g.setAttribute('normal',new BufferAttribute(data.normals,3));return g;
}
