// Phase-1 unit tests for the Roboto Bold glyph data (ADR new-primitives-polyhedra-text §2.2, §5.6).
// Pure JS: node tests/glyph-data.mjs. With MANIFOLD_MODULES=<dir containing manifold-3d>
// it also builds every glyph in Manifold (CrossSection NonZero/EvenOdd, extrude, genus).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {GLYPH_FONT,GLYPH_CHARS,glyphPath,glyphInfo} from '../web/glyphs.mjs';
import {GLYPH_METRICS,GLYPH_CHARS as METRIC_CHARS} from '../web/glyph-metrics.mjs';

let checks=0;const ok=()=>checks++;
const EXPECTED_CHARS='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'+'!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
const OVERLAP_PRONE='8aegB%&@$';

// --- character set, ids and metrics ---------------------------------------------------
assert.equal(EXPECTED_CHARS.length,94);
assert.equal(GLYPH_CHARS,EXPECTED_CHARS);assert.equal(METRIC_CHARS,EXPECTED_CHARS);ok();
assert.deepEqual(Object.keys(GLYPH_FONT.glyphs),[...EXPECTED_CHARS]);
assert.deepEqual(Object.keys(GLYPH_METRICS.m),[...EXPECTED_CHARS]);ok();
assert.equal(GLYPH_FONT.id,'roboto-bold@1');assert.equal(GLYPH_METRICS.id,GLYPH_FONT.id);
for(const k of ['upm','capHeight','ascender','descender'])assert.equal(GLYPH_METRICS[k],GLYPH_FONT[k]);
assert.equal(GLYPH_FONT.upm,4096);assert.equal(GLYPH_FONT.capHeight,2912);ok();
assert.ok(Object.isFrozen(GLYPH_FONT)&&Object.isFrozen(GLYPH_FONT.glyphs)&&Object.isFrozen(GLYPH_METRICS.m));ok();
assert.equal(glyphPath(' '),null);assert.equal(glyphPath('é'),null);assert.equal(glyphInfo('AB'),null);ok();
for(const c of EXPECTED_CHARS){const i=glyphInfo(c);assert.deepEqual(i.bbox,GLYPH_METRICS.m[c],c);}ok();
// Cap height = size: H and every flat-topped capital reach exactly capHeight from the baseline.
for(const c of 'EFHIKLNTZ'){const b=glyphInfo(c).bbox;assert.equal(b[1],0,c);assert.equal(b[3],GLYPH_FONT.capHeight,c);}ok();
// glyphPath returns a fresh copy each time.
const p1=glyphPath('A');p1[0][1]=-1;assert.notEqual(glyphPath('A')[0][1],-1);ok();
// UI-safe split: metrics module carries no outlines and stays small; the outline module is the big one.
const metricsSrc=fs.readFileSync(new URL('../web/glyph-metrics.mjs',import.meta.url),'utf8'),glyphSrc=fs.readFileSync(new URL('../web/glyphs.mjs',import.meta.url),'utf8');
assert.ok(!/import\s/.test(metricsSrc)&&!/import\s/.test(glyphSrc));
assert.ok(Buffer.byteLength(metricsSrc)<6000,'glyph-metrics.mjs '+Buffer.byteLength(metricsSrc));
assert.ok(Buffer.byteLength(glyphSrc)<36000,'glyphs.mjs '+Buffer.byteLength(glyphSrc));
for(const src of [metricsSrc,glyphSrc]){assert.match(src,/Copyright 2011 The Roboto Project Authors/);assert.match(src,/SIL Open Font License, Version 1\.1/);assert.match(src,/licenses\/Roboto-OFL-1\.1\.txt/);}ok();
const ofl=fs.readFileSync(new URL('../licenses/Roboto-OFL-1.1.txt',import.meta.url),'utf8');
assert.match(ofl,/SIL OPEN FONT LICENSE Version 1\.1/);assert.match(ofl,/^Copyright 2011 The Roboto Project Authors/);assert.ok(!/with Reserved Font Name/i.test(ofl));ok();

// --- outline structure ----------------------------------------------------------------
const qAt=(p0,p1,p2,t)=>{const u=1-t;return [u*u*p0[0]+2*u*t*p1[0]+t*t*p2[0],u*u*p0[1]+2*u*t*p1[1]+t*t*p2[1]];};
function contours(c){
 const out=[];let cur=null;
 for(const cmd of glyphPath(c)){
  const [op,...v]=cmd;
  assert.ok(v.every(Number.isInteger),c+' non-integer coordinate');
  if(op==='M'){assert.equal(cur,null,c+' M inside contour');cur={start:v,segs:[],last:v};}
  else if(op==='L'){assert.ok(cur,c);assert.ok(v[0]!==cur.last[0]||v[1]!==cur.last[1],c+' zero-length line');cur.segs.push({p0:cur.last,p1:v});cur.last=v;}
  else if(op==='Q'){assert.ok(cur,c);const ctrl=v.slice(0,2),end=v.slice(2);assert.ok(end[0]!==cur.last[0]||end[1]!==cur.last[1]||ctrl[0]!==end[0]||ctrl[1]!==end[1],c+' zero-length quad');cur.segs.push({p0:cur.last,c:ctrl,p1:end});cur.last=end;}
  else if(op==='Z'){assert.ok(cur,c);if(cur.last[0]!==cur.start[0]||cur.last[1]!==cur.start[1])cur.segs.push({p0:cur.last,p1:cur.start});assert.ok(cur.segs.length>=2,c+' degenerate contour');out.push(cur.segs);cur=null;}
  else assert.fail(c+' unknown op '+op);
 }
 assert.equal(cur,null,c+' unclosed contour');
 return out;
}
// Flatten with a chord tolerance (data units) into closed polygons.
function flatten(segs,tol){
 const pts=[];
 for(const s of segs){
  if(!s.c){pts.push(s.p1);continue;}
  const dev=Math.hypot(s.p0[0]-2*s.c[0]+s.p1[0],s.p0[1]-2*s.c[1]+s.p1[1])/4,n=Math.max(2,Math.ceil(Math.sqrt(dev/tol)));
  for(let i=1;i<=n;i++)pts.push(i===n?s.p1:qAt(s.p0,s.c,s.p1,i/n));
 }
 return pts;
}
const signedArea=poly=>{let a=0;for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length];a+=p[0]*q[1]-q[0]*p[1];}return a/2;};
// Scanline at height y: crossings with winding direction, sorted by x.
function crossings(polys,y){
 const xs=[];
 for(const poly of polys)for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length];if((p[1]<=y)!==(q[1]<=y))xs.push([p[0]+(y-p[1])*(q[0]-p[0])/(q[1]-p[1]),q[1]>p[1]?1:-1]);}
 return xs.sort((a,b)=>a[0]-b[0]);
}
function scanAreas(polys,ymin,ymax,lines){
 let nz=0,eo=0,maxWinding=0,worst=0;const dy=(ymax-ymin)/lines;
 for(let i=0;i<lines;i++){
  const y=ymin+(i+0.5)*dy+1e-7*Math.SQRT2;let w=0,lenNZ=0,lenEO=0;const xs=crossings(polys,y);
  for(let k=0;k<xs.length-1;k++){w+=xs[k][1];const span=xs[k+1][0]-xs[k][0];if(w!==0)lenNZ+=span;if(Math.abs(w)%2===1)lenEO+=span;maxWinding=Math.max(maxWinding,Math.abs(w));}
  worst=Math.max(worst,Math.abs(lenNZ-lenEO));nz+=lenNZ*dy;eo+=lenEO*dy;
 }
 return {nz,eo,maxWinding,worst};
}
const pointIn=(poly,pt)=>{let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>pt[1])!==(b[1]>pt[1])&&pt[0]<(b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;};

const TOL=0.5; // data units = 1/4096 em: ≈ 0.003 mm at 20 mm cap height
const report={},emScale=20/(GLYPH_FONT.upm);
for(const c of EXPECTED_CHARS){
 const cs=contours(c),polys=cs.map(s=>flatten(s,TOL)),b=glyphInfo(c).bbox;
 // bbox is tight (within rounding) and contains every curve point.
 const all=polys.flat(),lo=[Math.min(...all.map(p=>p[0])),Math.min(...all.map(p=>p[1]))],hi=[Math.max(...all.map(p=>p[0])),Math.max(...all.map(p=>p[1]))];
 for(let k=0;k<2;k++){assert.ok(lo[k]>=b[k]-1e-9&&lo[k]-b[k]<1.01,c+' bbox min');assert.ok(hi[k]<=b[k+2]+1e-9&&b[k+2]-hi[k]<1.01,c+' bbox max');}
 // Orientation + nesting: outer contours clockwise (negative area, y up), counters
 // counter-clockwise, and each contour's orientation matches its nesting depth.
 let holes=0,shoelace=0;
 polys.forEach((poly,i)=>{
  const a=signedArea(poly);assert.ok(Math.abs(a)>1,c+' sliver contour');shoelace+=a;
  const probe=poly[0],depth=polys.filter((other,j)=>j!==i&&pointIn(other,probe)).length;
  assert.equal(a<0,depth%2===0,`${c}: contour ${i} orientation does not match nesting depth ${depth}`);
  if(a>0)holes++;
 });
 // No overlaps: NonZero and EvenOdd fills agree on every scanline (§2.2, §5.6), and the
 // winding number never exceeds 1.
 const s=scanAreas(polys,b[1],b[3],1200);
 assert.equal(s.maxWinding,1,c+' winding > 1 (overlap)');
 assert.ok(s.worst<1e-6,c+' NonZero/EvenOdd differ on a scanline by '+s.worst);
 assert.ok(Math.abs(s.nz-s.eo)<=1e-9*s.nz,c+' NonZero area != EvenOdd area');
 assert.ok(Math.abs(-shoelace-s.nz)/s.nz<2e-3,c+` shoelace ${-shoelace} vs scan ${s.nz}`);
 report[c]={holes,contours:polys.length,area:-shoelace};
 ok();
}
// Counters (genus of the extruded glyph) computed from the data must match the letterforms.
const EXPECTED_HOLES={'0':1,'4':1,'6':1,'8':2,'9':1,A:1,B:2,D:1,O:1,P:1,Q:1,R:1,a:1,b:1,d:1,e:1,g:1,o:1,p:1,q:1,'#':1,'%':2,'&':2,'@':1,'$':0,
 '1':0,'2':0,'3':0,'5':0,'7':0,C:0,E:0,I:0,W:0,c:0,i:0,'!':0,'"':0,"'":0,'(':0,'|':0,'~':0,'=':0,':':0,';':0,'?':0};
if(process.env.GLYPH_DUMP)fs.writeFileSync(process.env.GLYPH_DUMP,JSON.stringify(Object.fromEntries([...EXPECTED_CHARS].map(c=>[c,contours(c).map(s=>flatten(s,2))]))));
if(process.env.GLYPH_DUMP)console.log(Object.entries(report).map(([c,r])=>c+':'+r.holes+'/'+r.contours).join(' '));
for(const [c,h] of Object.entries(EXPECTED_HOLES))assert.equal(report[c].holes,h,`${c} has ${report[c].holes} counters, expected ${h}`);ok();
// Contour counts for multi-part glyphs (dots, accents, stacked marks).
for(const [c,n] of Object.entries({i:2,j:2,'!':2,'"':2,':':2,';':2,'=':2,'%':5,'?':2,'&':3,'8':3,B:3}))assert.equal(report[c].contours,n,c+' contours');ok();
// Areas of the overlap-prone glyphs (Sean's ruling 3) against the ADR's NonZero prototype measurements
// at em size 20 mm (ADR §2.2: B NonZero 105.2 mm² flattened at 0.15 mm, so slightly low; 'a' correct
// volume ≈ 336 mm³ at depth 5).
const mm2=c=>report[c].area*emScale*emScale;
assert.ok(Math.abs(mm2('B')-105.2)<0.6,'B area '+mm2('B'));
assert.ok(Math.abs(mm2('a')*5-336)<4,'a volume '+mm2('a')*5);ok();
const volumes=Object.fromEntries([...OVERLAP_PRONE].map(c=>[c,+(mm2(c)*5).toFixed(2)]));
// Pinned volumes (mm³, 20 mm em, 5 mm deep) for the overlap-prone glyphs: a regenerated data file that
// reintroduces overlaps or reshapes them fails here (±0.5 %, the ADR §5.6 kernel tolerance).
const PINNED={'8':452.45,a:338.07,e:334.4,g:461.75,B:527.55,'%':368.22,'&':483.33,'@':626.7,'$':421.11};
for(const [c,v] of Object.entries(PINNED))assert.ok(Math.abs(volumes[c]-v)/v<5e-3,`${c} volume ${volumes[c]} vs pinned ${v}`);ok();
// Positive control: the overlap detector does flag two overlapping same-direction squares.
{const sq=(x)=>[[x,0],[x,10],[x+10,10],[x+10,0]],s=scanAreas([sq(0),sq(5)],0,10,100);assert.equal(s.maxWinding,2);assert.ok(Math.abs(s.nz-150)<1e-9&&Math.abs(s.eo-100)<1e-9);ok();}

// --- optional Manifold cross-check ------------------------------------------------------
let manifoldNote='Manifold cross-check skipped (set MANIFOLD_MODULES)';
if(process.env.MANIFOLD_MODULES){
 const {default:Module}=await import(path.join(process.env.MANIFOLD_MODULES,'manifold-3d/manifold.js'));const M=await Module();M.setup();
 const size=20,depth=5,k=size/GLYPH_FONT.capHeight;let worstVol=0;
 for(const c of EXPECTED_CHARS){
  for(const tolMM of [0.15,0.005]){
   const loops=contours(c).map(s=>flatten(s,tolMM/k).map(p=>[p[0]*k,p[1]*k]));
   const nz=new M.CrossSection(loops,'NonZero'),eo=new M.CrossSection(loops,'EvenOdd'),solid=M.Manifold.extrude(nz,depth);
   try{
    assert.ok(Math.abs(nz.area()-eo.area())<=1e-9*nz.area(),c+' Manifold NonZero != EvenOdd');
    assert.equal(solid.status(),'NoError',c);
    assert.equal(solid.genus(),report[c].holes-(report[c].contours-report[c].holes)+1,c+' genus');
    if(tolMM===0.005){const rel=Math.abs(solid.volume()-report[c].area*k*k*depth)/solid.volume();worstVol=Math.max(worstVol,rel);assert.ok(rel<5e-3,c+' volume');}
   }finally{nz.delete();eo.delete();solid.delete();}
  }
 }
 ok();manifoldNote=`Manifold 94×2 builds NoError, NonZero=EvenOdd, genus = counters − extra components; worst volume Δ ${(worstVol*100).toFixed(4)} %`;
}
console.log('PASS:',checks,'glyph-data checks: 94 chars, metrics split, OFL headers, integer closed contours, tight bboxes, orientation/nesting, NonZero = EvenOdd on 1200 scanlines per glyph, counters, areas.');
console.log('  overlap-prone volumes at 20 mm em / 5 mm depth (mm³):',JSON.stringify(volumes));
console.log('  '+manifoldNote);
