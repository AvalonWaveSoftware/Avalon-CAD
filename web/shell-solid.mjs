// ADR-0001 F8: the OCCT hollow (cad-solid.mjs cached() calls it for a part with o.shell on the OCCT strategy).
// Order: base → rounds → shell last. Closed: outer − BRepOffsetAPI_MakeOffsetShape(−t) (MakeThickSolid with no face
// removed returns only the inner solid [ADR §1.3]); open: MakeThickSolidByJoin(−t) with the picked faces, as replicad's
// shell(). Picked faces are base-shape faces (like fillet edges); after rounds they are followed through the fillet
// history. Every result passes the ADR guard (BRepCheck valid, volume dropped, bounds kept) or the hollow error is
// thrown, never the silently unshelled solid. 5 s hard limit (checked when OCCT returns; nothing can stop it sooner).
import * as R from 'replicad';
import {hollowError,hollowGuard} from './shell-rules.mjs';
const HARD_MS=5000;
function measure(oc,s,own){const p=own(new oc.GProp_GProps()),q=own(new oc.GProp_GProps()),b=own(new oc.Bnd_Box());
 oc.BRepGProp.VolumeProperties(s.wrapped,p,false,false,false);oc.BRepGProp.SurfaceProperties(s.wrapped,q,false,false);oc.BRepBndLib.AddOptimal(s.wrapped,b,false,false);
 const lo=own(b.CornerMin()),hi=own(b.CornerMax());return {volume:p.Mass(),area:q.Mass(),box:[lo.X(),lo.Y(),lo.Z(),hi.X(),hi.Y(),hi.Z()]};}
// The one solid inside a result (fillet and boolean results come back as compounds), or null.
function oneSolid(oc,shape,own){const E=oc.TopAbs_ShapeEnum,x=own(new oc.TopExp_Explorer(shape,E.TopAbs_SOLID,E.TopAbs_SHAPE)),out=[];
 for(;x.More();x.Next())out.push(own(x.Current()));return out.length===1?own(R.cast(R.downcast(out[0]))):null;}
// The inward offset of a closed solid. OCCT returns a SOLID when the offset surface keeps the solid's own topology
// (box, cylinder, sphere ...) but a bare SHELL for a solid whose faces wrap around a through-hole or a ring (tube,
// torus: the offset faces of a genus-1 solid are built without the solid wrapper). Cutting a shell from a solid gives
// a null shape, which is why a closed tube came back empty. A shell is closed into a solid here (ShapeFix_Solid
// orients it so its volume is positive); anything else (no shell, several shells) gives null: the hollow error.
function closedSolid(oc,shape,own){const E=oc.TopAbs_ShapeEnum;if(shape.ShapeType()===E.TopAbs_SOLID)return shape;
 const x=own(new oc.TopExp_Explorer(shape,E.TopAbs_SHELL,E.TopAbs_SHAPE)),shells=[];for(;x.More();x.Next())shells.push(own(x.Current()));
 return shells.length!==1?null: own(own(new oc.ShapeFix_Solid()).SolidFromShell(oc.TopoDS.Shell(shells[0])));}
export function hollowBrep(base,edges,o,{explore,cut}){
 const oc=R.getOC(),t=o.shell.thickness,list=[],own=x=>(list.push(x),x),t0=performance.now(),fail=()=>Error(hollowError(t));
 try{let solid=base,fb=null;
  const radii=new Map();for(const f of o.fillets||[])if(f.radius>0)for(const i of f.edges)if(edges[i])radii.set(i,f.radius);
  if(radii.size){fb=own(new oc.BRepFilletAPI_MakeFillet(base.wrapped,oc.ChFi3d_FilletShape.ChFi3d_Rational));edges.forEach((e,i)=>{if(radii.has(i))fb.Add(radii.get(i),e.wrapped);});
   try{solid=oneSolid(oc,fb.Shape(),own);}catch{throw Error('That roundover is too large or conflicts with another edge. Reduce the radius.');}if(!solid)throw fail();}
  const before=measure(oc,solid,own),join=oc.GeomAbs_JoinType.GeomAbs_Arc,skin=oc.BRepOffset_Mode.BRepOffset_Skin;let result;
  if(!o.shell.open){const mk=own(new oc.BRepOffsetAPI_MakeOffsetShape());mk.PerformByJoin(solid.wrapped,-t,1e-3,skin,false,false,join,false,own(new oc.Message_ProgressRange()));
   if(!mk.IsDone()||mk.Shape().IsNull())throw fail();const c=closedSolid(oc,mk.Shape(),own);if(!c)throw fail();const inner=own(R.cast(c));result=own(cut(solid,inner));}
  else{const baseFaces=explore(base,'face'),mine=explore(solid,'face');list.push(...baseFaces,...mine);
   const targets=[];for(const i of o.shell.open){const f=baseFaces[i];if(!f)throw Error('Invalid hollow setting.');
    if(fb){const l=own(fb.Modified(f.wrapped));if(l.Size()){const it=own(new oc.NCollection_List_TopoDS_Shape());it.Assign(l);for(;it.Size();it.RemoveFirst())targets.push(own(it.First()));continue;}if(fb.IsDeleted(f.wrapped))throw fail();}
    targets.push(f.wrapped);}
   const faces=own(new oc.NCollection_List_TopoDS_Shape());for(const g of targets){const m=mine.find(x=>x.wrapped.IsSame(g));if(!m)throw fail();faces.Append(m.wrapped);}
   const mk=own(new oc.BRepOffsetAPI_MakeThickSolid());mk.MakeThickSolidByJoin(solid.wrapped,faces,-t,1e-3,skin,false,false,join,false,own(new oc.Message_ProgressRange()));
   if(!mk.IsDone()||mk.Shape().IsNull())throw fail();result=own(R.cast(mk.Shape()));}
  const s=oneSolid(oc,result.wrapped,own);
  if(!s||!own(new oc.BRepCheck_Analyzer(s.wrapped,true,false)).IsValid()||!hollowGuard(before,measure(oc,s,own),t)||performance.now()-t0>HARD_MS)throw fail();
  list.splice(list.indexOf(s),1);return s;}
 catch(e){if(e instanceof Error&&(e.message===hollowError(t)||/^(Invalid hollow|That roundover)/.test(e.message)))throw e;throw fail();}
 finally{for(const x of list.reverse())if(x!==base)try{x.delete();}catch{}}}
