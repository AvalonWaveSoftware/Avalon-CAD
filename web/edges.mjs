// ADR-0001 android-large-mesh-memory (QA F1, Architect ruling 2026-10-24 17:44 CT): selection outline edges without the
// per-vertex string keys of THREE.EdgesGeometry, which allocated ~634 MB per 524k selection redraw (Waydroid renderer
// crash). edgePositions(geometry, angle) returns exactly THREE.EdgesGeometry's position array (r186: same edge set, same
// order, same Float32 values): vertices merge on the same rounded 1e-4 grid (-0 as 0, NaN equal to NaN, like the string
// keys), normals come from the same Triangle.getNormal arithmetic, matched edges are emitted in triangle order and the
// unmatched remainder in first-insertion order. Typed-array open-addressing hashes replace the strings and the object map.
// cachedEdges() keeps one edges geometry per source geometry (identity + attribute versions) so redraws reuse it; it is
// really released when the source geometry is disposed or changes.
import * as THREE from 'three';
const f64=new Float64Array(1),u32=new Uint32Array(f64.buffer),same=(a,b)=>a===b||a!==a&&b!==b;
const mix=(h,v)=>(f64[0]=v,h=Math.imul(h^u32[0],0x9e3779b1),Math.imul(h^u32[1],0x85ebca77)^h>>>15);
const grown=(a,n)=>{const r=new a.constructor(n);r.set(a);return r;};
export function edgePositions(geometry,thresholdAngle=1){
 const P=1e4,dot=Math.cos(THREE.MathUtils.DEG2RAD*thresholdAngle),I=geometry.getIndex(),A=geometry.getAttribute('position'),n=A.count,count=I?I.count:n;
 const X=i=>A.getX(i),Y=i=>A.getY(i),Z=i=>A.getZ(i),r=v=>(v=Math.round(v*P))===0?0:v;
 // 1. one id per distinct rounded position (what the string keys identified)
 let cap=2;while(cap<2*n)cap*=2;const q=new Float64Array(3*n),vid=new Int32Array(n),vt=new Int32Array(cap).fill(-1);let nv=0;
 for(let i=0;i<n;i++){const x=r(X(i)),y=r(Y(i)),z=r(Z(i));let s=mix(mix(mix(1,x),y),z)&cap-1,k;
  while((k=vt[s])>=0&&!(same(q[3*k],x)&&same(q[3*k+1],y)&&same(q[3*k+2],z)))s=s+1&cap-1;
  if(k<0){k=vt[s]=nv++;q[3*k]=x;q[3*k+1]=y;q[3*k+2]=z;}vid[i]=k;}
 // 2. directed edges (vertex-id pairs) in insertion order, like the object's string keys; live=0 once matched
 let ec=1024,ne=0,ea=new Int32Array(ec),eb=new Int32Array(ec),ei=new Int32Array(2*ec),nn=new Float64Array(3*ec),live=new Uint8Array(ec),tc=4096,tab=new Int32Array(tc).fill(-1),out=new Float32Array(6144),no=0;
 const slot=(a,b)=>{let s=mix(mix(2,a),b)&tc-1,e;while((e=tab[s])>=0&&!(ea[e]===a&&eb[e]===b))s=s+1&tc-1;return s;};
 const push=(i,j)=>{if(no+6>out.length)out=grown(out,2*out.length);out[no++]=X(i);out[no++]=Y(i);out[no++]=Z(i);out[no++]=X(j);out[no++]=Y(j);out[no++]=Z(j);};
 const t=[0,0,0],v=[0,0,0];
 for(let i=0;i<count;i+=3){
  for(let k=0;k<3;k++){t[k]=I?I.getX(i+k):i+k;v[k]=vid[t[k]];}
  // Triangle.getNormal(a,b,c): (c-b) x (a-b), times 1/sqrt(lengthSq) when lengthSq > 0, else zero
  const bx=X(t[1]),by=Y(t[1]),bz=Z(t[1]),cx=X(t[2])-bx,cy=Y(t[2])-by,cz=Z(t[2])-bz,ax=X(t[0])-bx,ay=Y(t[0])-by,az=Z(t[0])-bz;
  let x=cy*az-cz*ay,y=cz*ax-cx*az,z=cx*ay-cy*ax;const l=x*x+y*y+z*z,m=l>0?1/Math.sqrt(l):0;x=l>0?x*m:0;y=l>0?y*m:0;z=l>0?z*m:0;
  if(v[0]===v[1]||v[1]===v[2]||v[2]===v[0])continue;
  for(let j=0;j<3;j++){const jn=(j+1)%3,a=v[j],b=v[jn],e=tab[slot(b,a)];
   if(e>=0&&live[e]){if(x*nn[3*e]+y*nn[3*e+1]+z*nn[3*e+2]<=dot)push(t[j],t[jn]);live[e]=0;}
   else if(tab[slot(a,b)]<0){
    if(ne===ec){ec*=2;ea=grown(ea,ec);eb=grown(eb,ec);ei=grown(ei,2*ec);nn=grown(nn,3*ec);live=grown(live,ec);tc=4*ec;tab=new Int32Array(tc).fill(-1);for(let k=0;k<ne;k++)tab[slot(ea[k],eb[k])]=k;}
    const e=ne++;ea[e]=a;eb[e]=b;ei[2*e]=t[j];ei[2*e+1]=t[jn];nn[3*e]=x;nn[3*e+1]=y;nn[3*e+2]=z;live[e]=1;tab[slot(a,b)]=e;}}}
 for(let e=0;e<ne;e++)if(live[e])push(ei[2*e],ei[2*e+1]);
 return out.slice(0,no);}
export function edgesGeometry(geometry,thresholdAngle=1){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(edgePositions(geometry,thresholdAngle),3));return g;}
// One cached edges geometry per (source geometry, angle). Its dispose() is a no-op so disposeGroup(overlay) keeps it for
// the next redraw; it is released (GL buffers freed) when the source is disposed or its position/index version changes.
const cache=new WeakMap();
const versions=g=>(g.getAttribute('position')?.version??-1)+'/'+(g.getIndex()?.version??-1)+'/'+(g.getAttribute('position')?.array?.length??0);
export function cachedEdges(geometry,thresholdAngle){let per=cache.get(geometry);
 if(!per){per=new Map();cache.set(geometry,per);geometry.addEventListener('dispose',()=>{for(const e of per.values())e.geometry.release();per.clear();cache.delete(geometry);});}
 const v=versions(geometry);let e=per.get(thresholdAngle);if(e&&e.v===v)return e.geometry;
 e?.geometry.release();const g=edgesGeometry(geometry,thresholdAngle);g.release=g.dispose.bind(g);g.dispose=()=>{};per.set(thresholdAngle,{v,geometry:g});return g;}
