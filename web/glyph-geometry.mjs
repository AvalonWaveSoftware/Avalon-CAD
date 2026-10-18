// Letters, numbers & symbols (ADR new-primitives-polyhedra-text §2.1/§2.2, item A.4): worker-side glyph geometry.
// The outlines (web/glyphs.mjs) are loaded lazily with a dynamic import on the first job that contains a glyph, so
// worker startup does not parse or build them (Architect ruling 2026-10-17). Both kernels read the same exact
// font-unit contours: Manifold flattens the quadratic Béziers at the job tolerance, OCCT keeps them exact.
// Local frame: the glyph lies in XY (reading from the top view), centred on its outline bounding box, extruded in Z
// from -depth/2 to +depth/2. Scale: cap height = size mm. Never import this module from main.js.
let font=null,loading=null;
export const glyphsReady=()=>!!font;
export function loadGlyphs(){if(font)return Promise.resolve(font);return loading??=import('./glyphs.mjs').then(m=>(font=m)).finally(()=>{loading=null;});}
// True when a job, project, object list or object contains a glyph anywhere (prefab/merge children included).
export function containsGlyph(v,depth=0){
 if(!v||typeof v!=='object'||depth>8)return false;
 if(Array.isArray(v))return v.some(x=>containsGlyph(x,depth+1));
 if(v.type==='glyph'&&v.params)return true;
 for(const k of ['project','objects','object','cutouts','o','params','children'])if(v[k]&&containsGlyph(v[k],depth+1))return true;
 return false;
}
// Before a synchronous job runs: make sure the outlines are loaded when it needs them.
export async function prepareGlyphs(data){if(!font&&containsGlyph(data))await loadGlyphs();}
function need(){if(!font)throw Error('The letter outlines are not loaded yet. Try again.');return font;}
function scaledContours(char,size){
 const F=need(),info=F.glyphInfo(char),path=F.glyphPath(char);
 if(!info||!path)throw Error('Choose a letter, number or symbol.');
 const [x0,y0,x1,y1]=info.bbox,cx=(x0+x1)/2,cy=(y0+y1)/2,k=size/F.GLYPH_FONT.capHeight,contours=[];let c=null;
 const at=(x,y)=>[(x-cx)*k,(y-cy)*k];
 for(const cmd of path){
  if(cmd[0]==='M'){c={start:at(cmd[1],cmd[2]),segs:[]};contours.push(c);}
  else if(cmd[0]==='L')c.segs.push(['L',at(cmd[1],cmd[2])]);
  else if(cmd[0]==='Q')c.segs.push(['Q',at(cmd[1],cmd[2]),at(cmd[3],cmd[4])]);
 }
 return contours;
}
const same=(a,b)=>Math.abs(a[0]-b[0])<1e-9&&Math.abs(a[1]-b[1])<1e-9;
// Quadratic segment count for chord error ≤ tol: the deviation of n equal-parameter chords is |P0−2P1+P2|/(4n²).
function quadSteps(p0,p1,p2,tol){const dx=p0[0]-2*p1[0]+p2[0],dy=p0[1]-2*p1[1]+p2[1],n=Math.ceil(Math.sqrt(Math.hypot(dx,dy)/(4*tol)));return Math.min(64,Math.max(1,n));}
// Closed polygon loops (mm, local frame) for Manifold's CrossSection with the NonZero fill rule.
export function glyphLoops(char,size,tol){
 const loops=[];tol=Math.max(1e-4,tol);
 for(const {start,segs} of scaledContours(char,size)){
  const pts=[start];let p=start;
  for(const s of segs){
   if(s[0]==='L'){p=s[1];pts.push(p);continue;}
   const [,c,e]=s,n=quadSteps(p,c,e,tol);
   for(let i=1;i<=n;i++){const t=i/n,u=1-t;pts.push(i===n?e:[u*u*p[0]+2*u*t*c[0]+t*t*e[0],u*u*p[1]+2*u*t*c[1]+t*t*e[1]]);}
   p=e;
  }
  const clean=pts.filter((a,i)=>!i||!same(a,pts[i-1]));if(clean.length>1&&same(clean[0],clean.at(-1)))clean.pop();
  if(clean.length>=3)loops.push(clean);
 }
 return loops;
}
// Exact OCCT blueprints (lines and quadratic Béziers), the same commands replicad's sketchFontCommands issues for a
// TrueType path, but already in Y-up font orientation, so no mirror is needed.
export function glyphBlueprints(R,char,size){
 const blueprints=[];
 for(const {start,segs} of scaledContours(char,size)){
  const sk=new R.BlueprintSketcher();sk.movePointerTo(start);let last=start;
  for(const s of segs){const end=s[0]==='L'?s[1]:s[2];if(same(end,last))continue;if(s[0]==='L')sk.lineTo(end);else sk.quadraticBezierCurveTo(end,s[1]);last=end;}
  blueprints.push(sk.close());
 }
 return R.organiseBlueprints(blueprints);
}
// ADR-0001 F7 glyph finish (save format v3 params, all optional): bevel (mm, top-cap edges; 0 or absent = none),
// bevelProfile 'chamfer' (default) | 'round', plate (mm slab; 0 or absent = none), plateMargin (mm around the outline's
// bounding box), engrave (true: the glyph is cut ENGRAVE_DEPTH = 1 mm into the top of the plate, whatever its depth;
// Architect F7 ruling 5: the plate must be thicker than 1 mm).
// Absent or zero values build exactly the 2.x glyph. With a plate the local frame stays centred on the bounding box:
//   Emboss (plate, no engrave): total height H = plate + depth; plate z ∈ [−H/2, −H/2 + plate], glyph on top.
//   Engrave: plate z ∈ [−plate/2, plate/2]; the glyph is cut 1 mm deep from its top face.
// Architect F7 ruling 2 (structural perf): OCCT only does the bevel, on a cached part (glyphBevelPart): the bevelled
// glyph (Emboss / no plate) or, for Engrave, the plate's top tile with the bevelled cavity rim. The plate itself is
// always Manifold (glyphPlate), on the meshed bevelled part.
export function glyphFinish(p){const plate=p.plate>0?p.plate:0;return {bevel:p.bevel>0?p.bevel:0,profile:p.bevelProfile==='round'?'round':'chamfer',plate,margin:plate&&p.plateMargin>0?p.plateMargin:0,engrave:!!(plate&&p.engrave===true)};}
export const hasGlyphFinish=p=>p.bevel>0||p.plate>0;
export const ENGRAVE_DEPTH=1;
export const GLYPH_FINISH_KEYS=['bevel','bevelProfile','plate','plateMargin','engrave'];
// Half extents (mm) of the glyph outline's bounding box in the local frame (the outline is centred on it).
export function glyphHalfExtents(char,size){const F=need(),info=F.glyphInfo(char);if(!info)throw Error('Choose a letter, number or symbol.');const [x0,y0,x1,y1]=info.bbox,k=size/F.GLYPH_FONT.capHeight;return [(x1-x0)*k/2,(y1-y0)*k/2];}
// z ranges of the plate and of the glyph prism (for Engrave: the cutting prism, which runs depth above the plate so
// the cut never shares the plate's top face).
export function glyphLayout(p){const f=glyphFinish(p),d=p.depth;if(!f.plate)return {f,glyph:[-d/2,d/2]};
 if(f.engrave)return {f,plate:[-f.plate/2,f.plate/2],glyph:[f.plate/2-ENGRAVE_DEPTH,f.plate/2+ENGRAVE_DEPTH]};const H=f.plate+d;return {f,plate:[-H/2,-H/2+f.plate],glyph:[-H/2+f.plate,H/2]};}
// Manifold solid in the local frame (caller owns the result). A bevel never reaches this (kernel.mjs meshes bevelled
// glyphs from the OCCT solid).
export function glyphManifold(K,p,tol){
 const {char,size,depth}=p,cs=new K.CrossSection(glyphLoops(char,size,tol),'NonZero');
 if(!hasGlyphFinish(p)){try{return K.Manifold.extrude(cs,depth,0,0,[1,1],true);}finally{cs.delete();}}
 const {f,plate,glyph}=glyphLayout(p),[hx,hy]=glyphHalfExtents(char,size),keep=[cs],own=x=>(keep.push(x),x);
 try{const g=own(own(K.Manifold.extrude(cs,glyph[1]-glyph[0])).translate([0,0,glyph[0]]));
  const slab=own(own(K.Manifold.cube([2*(hx+f.margin),2*(hy+f.margin),f.plate],true)).translate([0,0,(plate[0]+plate[1])/2]));
  return f.engrave?slab.subtract(g):slab.add(g);}
 finally{for(const x of keep)x.delete();}
}
// Engrave + bevel: the OCCT tile is the top `h` of the plate (whole plate when it is ≤ 1.5 mm thick) with the cavity cut
// and its rim bevelled; Manifold adds the plate below it.
export const glyphRimTile=f=>{const top=f.plate/2,h=Math.min(f.plate,ENGRAVE_DEPTH+.5);return [top-h,top];};
// The OCCT part a bevelled glyph needs (cached by its own content key, so plate edits never redo the bevel):
//   no plate / Emboss: the glyph alone, bevelled, centred on its depth (same params as a plate-less glyph);
//   Engrave: type 'glyph-rim', the top tile of the plate in plate-local coordinates.
export function glyphBevelPart(o){const p=o.params,f=glyphFinish(p),q={};for(const k of Object.keys(p))if(!['plate','plateMargin','engrave'].includes(k))q[k]=p[k];
 if(f.engrave){delete q.depth;q.plate=p.plate;q.plateMargin=p.plateMargin;return {type:'glyph-rim',params:q,resolution:o.resolution||null};}
 return {type:'glyph',params:q,resolution:o.resolution||null};}
// Manifold plate around the meshed bevelled part g (consumed). Emboss: g raised onto the slab; Engrave: the plate
// below the tile plus the tile. No plate: g as is.
export function glyphPlate(K,p,g){const {f,plate,glyph}=glyphLayout(p);if(!f.plate)return g;const [hx,hy]=glyphHalfExtents(p.char,p.size),w=2*(hx+f.margin),d=2*(hy+f.margin),keep=[g],own=x=>(keep.push(x),x);
 try{if(!f.engrave){const slab=own(own(K.Manifold.cube([w,d,f.plate],true)).translate([0,0,(plate[0]+plate[1])/2]));return slab.add(own(g.translate([0,0,(glyph[0]+glyph[1])/2])));}
  const [z0]=glyphRimTile(f);if(z0<=plate[0]+1e-9){keep.shift();return g;}
  const lower=own(own(K.Manifold.cube([w,d,z0-plate[0]],true)).translate([0,0,(plate[0]+z0)/2]));return lower.add(g);}
 finally{for(const x of keep)x.delete();}}
// Exact B-rep glyph prism in the local frame (z0 = bottom; default: centred on depth).
export function glyphSolid(R,{char,size,depth},z0=-depth/2,h=depth){return glyphBlueprints(R,char,size).sketchOnPlane('XY',z0).extrude(h);}
// Picker tiles (main.js has no outlines): every character as [advance, SVG path d] in font units with Y down, so
// the sheet shows the exact Roboto Bold shapes that will be built, the same on every platform.
export async function glyphOutlines(){const F=await loadGlyphs(),out={};
 for(const c of F.GLYPH_CHARS){let d='';for(const cmd of F.glyphPath(c)){if(cmd[0]==='Z'){d+='Z';continue;}d+=cmd[0];for(let i=1;i<cmd.length;i+=2)d+=(i>1?' ':'')+cmd[i]+' '+(-cmd[i+1]);}out[c]=[F.glyphInfo(c).adv,d];}
 return out;}
// Amendment A2 (face data from the tables): the exact outline segments the OCCT solid is built from (same scaling,
// same skipped zero-length segments as glyphBlueprints), and a polyline of one segment at a chord tolerance.
export function glyphSegments(char,size){
 const out=[];
 for(const [ci,{start,segs}] of scaledContours(char,size).entries()){let last=start;const list=[];
  for(const s of segs){const end=s[0]==='L'?s[1]:s[2];if(same(end,last))continue;list.push(s[0]==='L'?{contour:ci,p0:last,p1:end}:{contour:ci,p0:last,c:s[1],p1:end});last=end;}
  out.push(list);}
 return out;}
export function segmentPoints(s,tol,angle=0){if(!s.c)return [s.p0,s.p1];const a=[s.c[0]-s.p0[0],s.c[1]-s.p0[1]],b=[s.p1[0]-s.c[0],s.p1[1]-s.c[1]],turn=Math.abs(Math.atan2(a[0]*b[1]-a[1]*b[0],a[0]*b[0]+a[1]*b[1]));
 const n=Math.min(64,Math.max(quadSteps(s.p0,s.c,s.p1,Math.max(1e-4,tol)),angle>0?Math.ceil(turn/angle):1)),pts=[s.p0];
 for(let i=1;i<=n;i++){const t=i/n,u=1-t;pts.push(i===n?s.p1:[u*u*s.p0[0]+2*u*t*s.c[0]+t*t*s.p1[0],u*u*s.p0[1]+2*u*t*s.c[1]+t*t*s.p1[1]]);}return pts;}
// Arc-length centroid of a segment (the surface centroid of its extruded side face), 24-point Gauss–Legendre.
const GL=(()=>{const n=24,x=[],w=[];for(let i=1;i<=n;i++){let z=Math.cos(Math.PI*(i-.25)/(n+.5)),pp;for(let k=0;k<100;k++){let p1=1,p2=0;for(let j=1;j<=n;j++){const p3=p2;p2=p1;p1=((2*j-1)*z*p2-(j-1)*p3)/j;}pp=n*(z*p1-p2)/(z*z-1);const z1=z;z=z1-p1/pp;if(Math.abs(z-z1)<1e-15)break;}x.push(z);w.push(2/((1-z*z)*pp*pp));}return {x,w};})();
export function segmentCentroid(s){if(!s.c)return [(s.p0[0]+s.p1[0])/2,(s.p0[1]+s.p1[1])/2];let L=0,X=0,Y=0;
 for(let i=0;i<GL.x.length;i++){const t=(GL.x[i]+1)/2,u=1-t,dx=2*(u*(s.c[0]-s.p0[0])+t*(s.p1[0]-s.c[0])),dy=2*(u*(s.c[1]-s.p0[1])+t*(s.p1[1]-s.c[1])),sp=Math.hypot(dx,dy)*GL.w[i]/2;
  L+=sp;X+=sp*(u*u*s.p0[0]+2*u*t*s.c[0]+t*t*s.p1[0]);Y+=sp*(u*u*s.p0[1]+2*u*t*s.c[1]+t*t*s.p1[1]);}return [X/L,Y/L];}
