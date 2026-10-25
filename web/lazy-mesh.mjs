// F1 (Architect ruling 2026-10-24 20:53): a preview of a lone imported mesh (one enabled object, a solid mesh, no cutout,
// no fillet) is built from the raw indexed mesh, without a Manifold: building one for 524k triangles grew manifold.wasm
// to ~270 MB, which never shrinks. Manifold orders the triangles differently, so the arrays are not byte-identical,
// but the picture is (pixel checks: tests/lazy-mesh.mjs, strict pixels). Vertices get Manifold's transform arithmetic
// (scale, rotate in x-y-z with exact multiples of 90°, translate, as one 3x4 matrix in doubles, then float32), so
// positions and bounds match. Anything else, or a mesh that is not closed (every directed edge exactly once with its
// reverse, every vertex used), returns null and the job takes the Manifold path. Check, export and booleans always build the Manifold.
import {customFaces} from './facets.mjs';
const sind=x=>{if(!Number.isFinite(x))return Math.sin(x);if(x<0)return -sind(-x);let q=Math.round(x/90);if(Math.abs(x/90-Math.trunc(x/90))===.5&&q%2)q--;const r=x-q*90,a=r*Math.PI/180;
 switch(q%4){case 0:return Math.sin(a);case 1:return Math.cos(a);case 2:return -Math.sin(a);default:return -Math.cos(a);}};
const cosd=x=>sind(x+90);
// column-major 3x3 / 3x4 (columns of 3), as Manifold's linalg
const mv=(m,v)=>{const o=[0,0,0];for(let k=0;k<3;k++)o[k]=m[0][k]*v[0]+m[1][k]*v[1]+m[2][k]*v[2];return o;};
const mm=(a,b)=>b.map(c=>mv(a,c));
const compose=(m,prev)=>{// mat3x4 m * Mat4(prev)
 const col=(c,w)=>{const o=[0,0,0];for(let k=0;k<3;k++)o[k]=m[0][k]*c[0]+m[1][k]*c[1]+m[2][k]*c[2]+m[3][k]*w;return o;};
 return [col(prev[0],0),col(prev[1],0),col(prev[2],0),col(prev[3],1)];};
export function placementMatrix(o){let t=[[1,0,0],[0,1,0],[0,0,1],[0,0,0]];
 if(o.scale)t=compose([[o.scale[0],0,0],[0,o.scale[1],0],[0,0,o.scale[2]],[0,0,0]],t);
 const [x,y,z]=o.rotation,rX=[[1,0,0],[0,cosd(x),sind(x)],[0,-sind(x),cosd(x)]],rY=[[cosd(y),0,-sind(y)],[0,1,0],[sind(y),0,cosd(y)]],rZ=[[cosd(z),sind(z),0],[-sind(z),cosd(z),0],[0,0,1]];
 t=compose([...mm(mm(rZ,rY),rX),[0,0,0]],t);
 return compose([[1,0,0],[0,1,0],[0,0,1],[...o.position]],t);}
function closed(tri,nv){const n=tri.length;if(n%3||!n)return false;const e=new Float64Array(n),r=new Float64Array(n),S=nv;
 for(let i=0;i<n;i+=3)for(let k=0;k<3;k++){const a=tri[i+k],b=tri[i+(k+1)%3];if(!(a<nv&&b<nv)||a===b)return false;e[i+k]=a*S+b;r[i+k]=b*S+a;}
 const used=new Uint8Array(nv);for(let i=0;i<n;i++)used[tri[i]]=1;if(used.indexOf(0)>=0)return false;
 e.sort();r.sort();for(let i=0;i<n;i++){if(e[i]!==r[i])return false;if(i&&e[i]===e[i-1])return false;}return true;}
// → model like the Manifold preview path (before finish_result), or null.
export function lazyMeshPreview(project,{topology,validate}){
 const on=project.objects.filter(o=>o.enabled!==false);if(on.length!==1)return null;const o=on[0],m=o.params?.mesh;
 if(o.type!=='mesh'||o.mode==='cut'||!m||o.fillets?.some(f=>f.radius>0))return null;
 validate(project);
 const src=m.vertices,nv=src.length/3;if(!Number.isInteger(nv)||!closed(m.triangles,nv))return null;
 const T=placementMatrix(o),d=new Float64Array(src.length),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<src.length;i+=3){const x=Math.fround(src[i]),y=Math.fround(src[i+1]),z=Math.fround(src[i+2]);
  for(let k=0;k<3;k++){const v=T[0][k]*x+T[1][k]*y+T[2][k]*z+T[3][k];d[i+k]=v;if(v<min[k])min[k]=v;if(v>max[k])max[k]=v;}}
 const adjustments=[];let dz=0;
 if(project.buildPlaneEnabled&&min[2]<0){dz=-min[2];adjustments.push({id:o.id,sourcePosition:Array.from(o.position),position:[o.position[0],o.position[1],o.position[2]+dz]});}
 const vertices=new Float32Array(src.length);for(let i=0;i<d.length;i++)vertices[i]=i%3===2&&dz?d[i]+dz:d[i];
 // the floored solid's box is Manifold's box of the shifted doubles, not the shifted box
 if(dz){min[2]=Infinity;max[2]=-Infinity;for(let i=2;i<d.length;i+=3){const v=d[i]+dz;if(v<min[2])min[2]=v;if(v>max[2])max[2]=v;}}
 const triangles=new Uint32Array(m.triangles),nt=triangles.length/3,flat=customFaces(o)>0?1:0,bounds={min,max};
 let volume=0;for(let t=0;t<triangles.length;t+=3){const a=triangles[t]*3,b=triangles[t+1]*3,c=triangles[t+2]*3;
  volume+=vertices[a]*(vertices[b+1]*vertices[c+2]-vertices[b+2]*vertices[c+1])-vertices[a+1]*(vertices[b]*vertices[c+2]-vertices[b+2]*vertices[c])+vertices[a+2]*(vertices[b]*vertices[c+1]-vertices[b+1]*vertices[c]);}
 const part={id:o.id,mode:o.mode,vertices:vertices.slice(),triangles:triangles.slice(),flatTriangles:new Uint8Array(nt).fill(flat),smoothingGroups:new Uint32Array(nt).fill(1),bounds:{min:[...min],max:[...max]},...topology(o)};
 return {vertices,triangles,flatTriangles:new Uint8Array(nt).fill(flat),smoothingGroups:new Uint32Array(nt).fill(1),parts:[part],volume:volume/6,bounds,floorAdjustments:adjustments};}
