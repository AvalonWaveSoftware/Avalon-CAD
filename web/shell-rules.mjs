// ADR-0001 F8 (Q12): the Hollow rules, shared by validation, the kernels and the Hollow section. No three.js, no OCCT.
// o.shell = {thickness, open?: [base face index…]}: inward wall, outer dimensions kept, closed unless open faces are picked.
export const SHELL_DEFAULT=2,SHELL_MIN=.4;
// ADR-0001 F8 hard limit: a hollow that has not answered in 5 s is the hollow error and the model stays unchanged (ADR-0003).
export const SHELL_TIMEOUT_MS=5000;
export function withShellTimeout(promise,t,ms=SHELL_TIMEOUT_MS){let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(hollowError(t))),ms);})]).finally(()=>clearTimeout(timer));}
const ALWAYS=['threadrod','threadtube','mesh','joined','prefab'];
// ADR-0003: Hollow is offered only for the types the shell gate measures (tests/shell-objects.mjs cases); a new type
// joins this list together with a gate case. Extrusions have the 50 ms budget, the rest 100 ms.
export const SHELL_TYPES=['box','cylinder','sphere','cone','dodecahedron','octahedron','wedge','triprism','rounded','polygon','glyph','torus','tube','pyramid','tetrahedron','icosahedron','decahedron'];
export const SHELL_EXTRUSIONS=['polygon','glyph'],SHELL_BUDGET_MS={primitive:100,extrusion:50};
// The ADR text, verbatim (t in mm).
export const hollowError=t=>`Can't hollow this shape at ${+(+t).toFixed(3)} mm. Try a smaller wall or remove rounds.`;
// Why Hollow is not offered for o (null when it is). Rounds are judged against the wall t (every radius must exceed it).
export function hollowRefusal(o,t=SHELL_DEFAULT){
 if(!ALWAYS.includes(o.type)&&!SHELL_TYPES.includes(o.type))return 'Hollow is not offered for this shape.';
 if(ALWAYS.includes(o.type)||o.type==='glyph'&&(o.params?.bevel>0||o.params?.plate>0))return 'Hollow is not offered for threads, imported meshes, merged shapes, prefabs or bevelled letters.';
 const f=(o.fillets||[]).filter(x=>x.radius>0);
 if(f.some(x=>x.kind==='chamfer'))return 'Hollow is not offered for shapes with chamfers.';
 if(f.some(x=>!(x.radius>t)))return hollowError(t);
 return null;}
// Smallest dimension of the part (the wall must stay below half of it).
// ADR-0003 wall safety: a tube's bore offsets outward while its skin offsets inward, so the wall must stay below half the
// radial wall; a pointed solid (pyramid, regular polyhedra; size = edge) keeps an inner solid only while the wall stays
// below half its inradius, so for those the "dimension" is the inradius (closed form, no tables in the UI bundle).
const INRADIUS_PER_EDGE={tetrahedron:.2041241452,octahedron:.4082482905,dodecahedron:1.1135163644,icosahedron:.7557613141};
// d10 {diameter,h}: distance from the centre to kite 0's plane (apex, ring vertex 0, ring vertex 2; same construction
// as polyhedra-geometry decahedronVertices). All ten kites are congruent, so this is the inradius.
function decahedronInradius(D,h){const r=D/2,H=h/2,c=Math.cos(Math.PI/5),z=H*(1-c)/(1+c),a=2*Math.PI/5;
 const u=[r,0,z-H],v=[r*Math.cos(a),r*Math.sin(a),z-H],n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
 return Math.abs(n[2]*H)/Math.hypot(n[0],n[1],n[2]);}
export function smallestDimension(o){const p=o.params||{};
 if(o.type==='tube')return Math.min((p.diameter-p.inner)/2,p.h);
 if(INRADIUS_PER_EDGE[o.type])return INRADIUS_PER_EDGE[o.type]*p.size;
 if(o.type==='decahedron')return decahedronInradius(p.diameter,p.h);
 if(o.type==='pyramid'){const a=Math.min(p.w,p.d)/2;return Math.min(a*p.h/(a+Math.hypot(a,p.h)),p.h);}
 if(o.type==='torus')return p.tube;
 if(o.type==='glyph')return Math.min(p.size,p.depth);
 if(o.type==='polygon'){const xs=p.points.map(a=>a[0]),ys=p.points.map(a=>a[1]);return Math.min(p.h,Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));}
 const v=Object.entries(p).filter(([k,x])=>typeof x==='number'&&!['r','top'].includes(k)&&x>0).map(([,x])=>x);return v.length?Math.min(...v):0;}
// Largest wall the rules accept (exclusive): below half the smallest dimension and below every round's radius.
export function maxWall(o){return Math.min(smallestDimension(o)/2,...(o.fillets||[]).filter(x=>x.radius>0).map(x=>x.radius));}
// ADR-0003 ruling (a): the Hollow panel default is min(2 mm, 0.9 × max wall) rounded down to 0.1 mm, never below 0.4 mm,
// so validateShell always accepts it; null when no wall is possible (max wall ≤ 0.4 mm), and Hollow is then disabled
// with the wall message.
export function shellDefault(o){const m=maxWall(o);if(!(m>SHELL_MIN))return null;
 const t=Math.max(SHELL_MIN,Math.floor(Math.min(SHELL_DEFAULT,.9*m)*10+1e-9)/10);return t<m?t:null;}
// Structure, type and thickness rules (validateProject). Throws the user-facing reason.
export function validateShell(o){const s=o.shell;
 if(!s||typeof s!=='object'||Array.isArray(s)||Object.keys(s).some(k=>k!=='thickness'&&k!=='open')||!Number.isFinite(s.thickness)||s.open!==undefined&&(!Array.isArray(s.open)||!s.open.length||s.open.length>100||s.open.some(i=>!Number.isInteger(i)||i<0||i>10000)||new Set(s.open).size!==s.open.length))throw Error('Invalid hollow setting.');
 const why=hollowRefusal(o,s.thickness);if(why)throw Error(why);
 if(!(s.thickness>=SHELL_MIN&&s.thickness<smallestDimension(o)/2))throw Error('Wall thickness must be at least 0.4 mm and less than half the smallest dimension.');}
// Kernel choice (ADR §4 F8 table, with the parity rule: closed boxes and extrusions are Manifold-built so every job
// engine gives the same mesh). 'manifold' or 'occt'.
// batch-3.0b (Master Chief, QA 2026-10-25 16:56 CT): closed tube and torus are exact OCCT hollows again (shell-solid.mjs
// closes the bare offset shell OCCT returns for them; cad-solid.mjs samples the torus faces directly).
export const shellStrategy=o=>o.type==='glyph'||!o.shell.open&&!(o.fillets||[]).some(f=>f.radius>0)&&['box','polygon'].includes(o.type)?'manifold':'occt';
// The guard on any kernel: material was removed (a cavity of at least 1 % of the part; less is an empty hollow, e.g.
// glyph 'O' @2 removes 0.25 %), the wall band is no more than a wall over the outer area (an inward
// offset band never exceeds t·A), and the bounds kept. batch-3.0 (Architect ruling 11:03 CT): the earlier heuristic
// v < V − 0.5·t·A refused correct thick-wall hollows on curved or thin shapes (torus 30/8 @2: 2,605.6 mm³).
export function hollowGuard({volume,area,box},{volume:v,box:b},t){
 return v>0&&v<=volume*.99&&v<=t*area*(1+1e-3)&&box.every((x,i)=>Math.abs(x-b[i])<=1e-6);}
