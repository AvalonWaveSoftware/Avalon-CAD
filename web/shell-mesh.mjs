// ADR-0001 F8: hollow parts in makeLocalSolid (kernel.mjs). Closed boxes, sketches and glyphs are Manifold-built
// (outer − the 2D-offset profile extruded inset by t; for a glyph with open caps the inset runs through them), so every
// job engine gives the same mesh; the rest comes from the OCCT hollow (cad-solid.mjs → shell-solid.mjs) through
// solidMesh, like a filleted part. Either way the ADR guard runs (shell-rules.mjs hollowGuard) and a failure is the
// hollow error, never the unhollowed part. Android (in-worker OCCT): previews defer an OCCT hollow whose B-rep is not
// cached yet; worker.mjs shows the unhollowed part, then computes it unless a newer preview arrived (cancel on edit).
import {solidMesh,objectTopology,shellReady,hollowTimes} from './cad-solid.mjs';
import {glyphLoops} from './glyph-geometry.mjs';
import {hollowError,hollowGuard,shellStrategy} from './shell-rules.mjs';
import {segments,ccwPoints} from './kernel-ui.mjs';
import {resolutionTolerance,customFaces} from './facets.mjs';
import {PLANAR_TYPES} from './polyhedra.mjs';
let defer=false,pending=[],deferrals=0,preview=false;
// mem-preview (2b): set by local-engine.mjs for each job; true in preview jobs (hollow previews at preview smoothness).
export function previewShells(on){preview=on;}export const shellPreview=()=>preview;
// Waydroid QA (d): one entry per hollow actually built (engine, ms, OCCT phases); worker.mjs logs them to the console
// and the main thread's debug log ('hollow engine=occt|manifold …'), never to the UI.
const built=[];export const takeHollowLog=()=>built.splice(0);
// Waydroid QA D4: the phase times are cleared before every hollow mesh request, so a mesh served from a cache (no OCCT
// offset run) adds no line instead of repeating the phases of an earlier hollow.
const clearTimes=()=>{for(const k in hollowTimes)delete hollowTimes[k];};
export const shellDeferrals=()=>deferrals;
export function deferShells(on){defer=on;pending=[];}
// Hollows the deferred previews need; compute(…) builds each (an error is kept by the caches' re-run as the job error).
export function takeDeferredShells(){const p=pending;pending=[];defer=false;return p;}
const unshelled=o=>({...o,shell:undefined});
const measure=s=>{const b=s.boundingBox();return {volume:s.volume(),area:s.surfaceArea(),box:[...b.min,...b.max]};};
export function shellLocalSolid(K,o,requested,styles,makeLocalSolid){
 const t0=performance.now(),t=o.shell.thickness,M=K.Manifold,tolerance=resolutionTolerance(o,requested),fail=()=>Error(hollowError(t)),keep=[],own=x=>(keep.push(x),x);
 try{let s,tagged=false;
  if(shellStrategy(o)==='manifold'){const p=o.params;let outer,inner;
   if(o.type==='box'){outer=own(M.cube([p.w,p.d,p.h],true));inner=own(M.cube([p.w-2*t,p.d-2*t,p.h-2*t],true));}
   else{let z0,z1,h;
    if(o.type==='glyph'){h=p.depth;z0=-h/2+t;z1=h/2-t;
     if(o.shell.open){const topo=objectTopology(unshelled(o));if(!topo)return makeLocalSolid(K,unshelled(o),requested,styles);
      for(const i of o.shell.open){const n=topo.faces[i]?.normal;if(!n||Math.abs(n[2])<.999)throw fail();if(n[2]>0)z1=h/2+1;else z0=-h/2-1;}}}
    else{h=p.h;z0=-h/2+t;z1=h/2-t;}
    const C=K.CrossSection,cs=own(o.type==='glyph'?new C(glyphLoops(p.char,p.size,tolerance),'NonZero'):new C([ccwPoints(p.points)]));
    outer=own(M.extrude(cs,h,0,0,[1,1],true));const off=own(cs.offset(-t,'Round',2,segments(t,tolerance)));
    inner=off.isEmpty()?null:own(own(M.extrude(off,z1-z0)).translate([0,0,z0]));}
   s=inner?own(outer.subtract(inner)):outer;
   if(s.status()!=='NoError'||!hollowGuard(measure(outer),measure(s),t))throw fail();built.push({engine:'manifold',type:o.type,ms:performance.now()-t0});}
  else{
   if(defer&&!shellReady(o)){pending.push({o,tolerance:requested,display:!!styles,preview});deferrals++;return makeLocalSolid(K,unshelled(o),requested,styles);}
   clearTimes();const fresh=!shellReady(o),m=solidMesh(o,preview?requested:tolerance,!!styles,preview),t1=performance.now();
   // OCCT sidecar: the hollow is still being computed; this stand-in (the unhollowed part) is display-only interim data.
   if(!m)return makeLocalSolid(K,unshelled(o),requested,styles);
   const d={numProp:3,vertProperties:m.vertices,triVerts:m.triangles,tolerance:1e-5};
   if(styles&&m.displayGroups.length){const first=M.reserveIDs(m.displayGroups.length);d.runIndex=new Uint32Array([...m.displayGroups.map(g=>g.start),m.triangles.length]);d.runOriginalID=new Uint32Array(m.displayGroups.map((g,i)=>{styles.set(first+i,g.flat);return first+i;}));tagged=true;}
   const mesh=new K.Mesh(d);mesh.merge();s=own(new M(mesh));if(s.status()!=='NoError')throw fail();
   if(fresh&&hollowTimes.offset!==undefined)built.push({engine:'occt',type:o.type,ms:performance.now()-t0,...hollowTimes,import:performance.now()-t1});}
  if(styles&&!tagged){if(s.originalID()<0)s=own(s.asOriginal());styles.set(s.originalID(),customFaces(o)>0||['box','polygon',...PLANAR_TYPES].includes(o.type));}
  keep.splice(keep.indexOf(s),1);return s;
 } finally {for(const x of keep)x.delete();}
}
// worker.mjs (Android): builds the deferred hollows one by one, yielding between them; false when cancel() says a
// newer preview is waiting.
export async function computeShells(list,cancel){for(const {o,tolerance,display,preview} of list){await new Promise(r=>setTimeout(r,0));if(cancel())return false;
 try{clearTimes();const t=performance.now(),fresh=!shellReady(o);solidMesh(o,tolerance,display,preview);if(fresh&&hollowTimes.offset!==undefined)built.push({engine:'occt',type:o.type,ms:performance.now()-t,...hollowTimes});}catch{}}return true;}
