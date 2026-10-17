// Orientation helpers for the advanced planar shapes (ADR new-primitives-polyhedra-text
// §2.1). Shared by the runtime (polyhedra-shapes.mjs) and the table generator
// (tools/polyhedra/gen.mjs), so tables and the d10 are laid face-down by one code path.
// Pure JS, UI-safe.
export const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export const unit=a=>{const l=Math.hypot(a[0],a[1],a[2]);return [a[0]/l,a[1]/l,a[2]/l];};
const apply=(R,p)=>[dot(R[0],p),dot(R[1],p),dot(R[2],p)];

// Newell normal of a planar polygon (outward for counter-clockwise faces).
export function faceNormal(vertices,face){
 const n=[0,0,0];
 for(let i=0;i<face.length;i++){const a=vertices[face[i]],b=vertices[face[(i+1)%face.length]];n[0]+=(a[1]-b[1])*(a[2]+b[2]);n[1]+=(a[2]-b[2])*(a[0]+b[0]);n[2]+=(a[0]-b[0])*(a[1]+b[1]);}
 return unit(n);
}

// Rotation matrix taking unit vector a onto unit vector b (Rodrigues).
function rotateOnto(a,b){
 const c=dot(a,b);
 if(c<-1+1e-15)return [[1,0,0],[0,-1,0],[0,0,-1]];
 const [x,y,z]=cross(a,b),k=1/(1+c);
 return [[c+x*x*k,x*y*k-z,x*z*k+y],[y*x*k+z,c+y*y*k,y*z*k-x],[z*x*k-y,z*y*k+x,c+z*z*k]];
}

// Rest face `bottom` on Z = min with its first edge (face[0] → face[1]) parallel to X
// and the face behind it (+Y), then centre the bounding box on the origin. Coordinates
// of the bottom face and of the aligned edge are snapped so they are exactly level.
export function orientFaceDown(vertices,faces,bottom=0){
 const f=faces[bottom];
 let V=vertices.map(p=>apply(rotateOnto(faceNormal(vertices,f),[0,0,-1]),p));
 const a=V[f[0]],b=V[f[1]],e=sub(b,a),centroid=f.reduce((s,i)=>[s[0]+V[i][0]/f.length,s[1]+V[i][1]/f.length],[0,0]);
 // The edge points along +X or -X so that the rest of the face lies at +Y.
 const side=(centroid[0]-a[0])*e[1]-(centroid[1]-a[1])*e[0];
 const angle=-Math.atan2(e[1],e[0])+(side<0?0:Math.PI),c=Math.cos(angle),s=Math.sin(angle);
 V=V.map(p=>[c*p[0]-s*p[1],s*p[0]+c*p[1],p[2]]);
 const zmin=Math.min(...f.map(i=>V[i][2])),y0=Math.min(V[f[0]][1],V[f[1]][1]);
 for(const i of f)V[i][2]=zmin;
 V[f[0]][1]=V[f[1]][1]=y0;
 const lo=[0,1,2].map(k=>Math.min(...V.map(p=>p[k]))),hi=[0,1,2].map(k=>Math.max(...V.map(p=>p[k]))),mid=lo.map((v,k)=>(v+hi[k])/2);
 return V.map(p=>p.map((v,k)=>{const r=v-mid[k];return Math.abs(r)<1e-15?0:r;}));
}

// d10: pentagonal trapezohedron with ring diameter D (radius r) and apex-to-apex
// height h. The zig-zag ring sits at z = ±H(1−cos36°)/(1+cos36°), H = h/2, which
// makes every kite exactly planar for any h. Built upright, then laid on kite 0.
export function decahedronVertices(diameter,h){
 const r=diameter/2,H=h/2,c=Math.cos(Math.PI/5),z0=H*(1-c)/(1+c),V=[[0,0,H],[0,0,-H]];
 for(let k=0;k<5;k++){const a=2*Math.PI*k/5,b=a+Math.PI/5;V.push([r*Math.cos(a),r*Math.sin(a),z0],[r*Math.cos(b),r*Math.sin(b),-z0]);}
 return V;
}
