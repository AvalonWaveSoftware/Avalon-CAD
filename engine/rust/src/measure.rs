//! F1e mesh minimum distance with a bounded working set (ADR-0002).
//! The caller (web/rust-mesh.mjs) streams each mesh through fixed-size chunk slots: a slot holds up to CHUNK unindexed
//! triangles (9 f32 each) plus a node array for a median AABB tree built in place over that slot. Nothing here
//! allocates; every buffer is caller-owned and reused for the whole query, then freed. Index resolution happens in JS
//! with a bounds check, so no u32→usize index arithmetic is done here (the old `t[i] as usize*3` could wrap on wasm32).
//! Geometry is never changed.
type V=[f64;3];
type Tri=[f32;9];
fn sub(a:V,b:V)->V{[a[0]-b[0],a[1]-b[1],a[2]-b[2]]}
fn add(a:V,b:V)->V{[a[0]+b[0],a[1]+b[1],a[2]+b[2]]}
fn mul(a:V,b:f64)->V{[a[0]*b,a[1]*b,a[2]*b]}
fn dot(a:V,b:V)->f64{a[0]*b[0]+a[1]*b[1]+a[2]*b[2]}
fn cross(a:V,b:V)->V{[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
fn seg(p:V,q:V,a:V,b:V)->f64{
 let u=sub(q,p);let v=sub(b,a);let w=sub(p,a);let aa=dot(u,u);let bb=dot(u,v);let cc=dot(v,v);let d=dot(u,w);let e=dot(v,w);
 let den=aa*cc-bb*bb;let mut s=if den>1e-30{((bb*e-cc*d)/den).clamp(0.,1.)}else{0.};
 let t=if cc>0.{((bb*s+e)/cc).clamp(0.,1.)}else{0.};
 if aa>0.{s=((bb*t-d)/aa).clamp(0.,1.);}
 let x=sub(add(p,mul(u,s)),add(a,mul(v,t)));dot(x,x)
}
fn point(p:V,t:&[V;3])->f64{
 let a=t[0];let b=t[1];let c=t[2];let ab=sub(b,a);let ac=sub(c,a);let ap=sub(p,a);let n=cross(ab,ac);let nn=dot(n,n);
 if nn>1e-30{let q=sub(p,mul(n,dot(ap,n)/nn));let v=sub(q,a);let d00=dot(ab,ab);let d01=dot(ab,ac);let d11=dot(ac,ac);let d20=dot(v,ab);let d21=dot(v,ac);let den=d00*d11-d01*d01;
 if den>0.{let u=(d11*d20-d01*d21)/den;let v=(d00*d21-d01*d20)/den;if u>=0.&&v>=0.&&u+v<=1.{return dot(ap,n).powi(2)/nn;}}}
 let _=c;(0..3).map(|i|seg(p,p,t[i],t[(i+1)%3])).fold(f64::INFINITY,f64::min)
}
fn pierces(p:V,q:V,t:&[V;3])->bool{
 let d=sub(q,p);let e=sub(t[1],t[0]);let f=sub(t[2],t[0]);let h=cross(d,f);let det=dot(e,h);if det.abs()<1e-20{return false;}let s=sub(p,t[0]);let u=dot(s,h)/det;if !(0. ..=1.).contains(&u){return false;}let k=cross(s,e);let v=dot(d,k)/det;let r=dot(f,k)/det;v>=0.&&u+v<=1.&&r>=0.&&r<=1.
}
fn wide(t:&Tri)->[V;3]{[[t[0] as f64,t[1] as f64,t[2] as f64],[t[3] as f64,t[4] as f64,t[5] as f64],[t[6] as f64,t[7] as f64,t[8] as f64]]}
/// Squared distance between two triangles (0 when they intersect).
fn triangles(a:&[V;3],b:&[V;3])->f64{
 let mut best=f64::INFINITY;for i in 0..3{if pierces(a[i],a[(i+1)%3],b)||pierces(b[i],b[(i+1)%3],a){return 0.;}best=best.min(point(a[i],b)).min(point(b[i],a));for j in 0..3{best=best.min(seg(a[i],a[(i+1)%3],b[j],b[(j+1)%3]));}}best
}
/// Tree node, 40 bytes, C layout (the JS side sizes node buffers with NODE_BYTES).
#[repr(C)] #[derive(Clone,Copy)] pub struct Node{lo:[f32;3],hi:[f32;3],start:u32,end:u32,left:u32,right:u32}
pub const NODE_BYTES:usize=40;
const LEAF:usize=8;
/// Leaves split only above LEAF triangles into halves of at least LEAF/2, so a tree over n triangles has at most
/// max(1, n/4) leaves and 2·leaves−1 nodes.
pub fn node_capacity(n:usize)->usize{n/2+2}
fn build(ts:&mut [Tri],offset:usize,nodes:&mut [Node],count:&mut usize)->Option<usize>{
 let mut lo=[f32::INFINITY;3];let mut hi=[f32::NEG_INFINITY;3];for t in ts.iter(){for p in 0..3{for k in 0..3{lo[k]=lo[k].min(t[p*3+k]);hi[k]=hi[k].max(t[p*3+k]);}}}
 let index=*count;if index>=nodes.len(){return None;}*count+=1;
 nodes[index]=Node{lo,hi,start:offset as u32,end:(offset+ts.len()) as u32,left:u32::MAX,right:u32::MAX};
 if ts.len()>LEAF{let axis=(0..3).max_by(|&i,&j|(hi[i]-lo[i]).total_cmp(&(hi[j]-lo[j]))).unwrap();let mid=ts.len()/2;
  ts.select_nth_unstable_by(mid,|a,b|{let c=|t:&Tri|t[axis]+t[3+axis]+t[6+axis];c(a).total_cmp(&c(b))});
  let (a,b)=ts.split_at_mut(mid);let l=build(a,offset,nodes,count)?;let r=build(b,offset+mid,nodes,count)?;nodes[index].left=l as u32;nodes[index].right=r as u32;}
 Some(index)
}
fn bounds(a:&Node,b:&Node)->f64{(0..3).map(|k|((a.lo[k]-b.hi[k]) as f64).max((b.lo[k]-a.hi[k]) as f64).max(0.).powi(2)).sum()}
fn kids(n:&Node)->Option<(usize,usize)>{if n.left==u32::MAX{None}else{Some((n.left as usize,n.right as usize))}}
fn visit(a:usize,b:usize,an:&[Node],bn:&[Node],at:&[Tri],bt:&[Tri],best:&mut f64){
 let x=&an[a];let y=&bn[b];if bounds(x,y)>=*best{return;}
 let pairs=if let Some((l,r))=kids(x){if kids(y).is_none()||x.end-x.start>=y.end-y.start{Some([(l,b),(r,b)])}else{let (l,r)=kids(y).unwrap();Some([(a,l),(a,r)])}}else{kids(y).map(|(l,r)|[(a,l),(a,r)])};
 if let Some(mut p)=pairs{if bounds(&an[p[0].0],&bn[p[0].1])>bounds(&an[p[1].0],&bn[p[1].1]){p.swap(0,1);}for (i,j) in p{visit(i,j,an,bn,at,bt,best);if *best==0.{return;}}}
 else{for t in &at[x.start as usize..x.end as usize]{let t=wide(t);for u in &bt[y.start as usize..y.end as usize]{*best=best.min(triangles(&t,&wide(u)));if *best==0.{return;}}}}
}
/// Builds the tree over `ts` in place (reorders the slot). Returns the node count, or None for non-finite input or a
/// node buffer that is too small.
pub fn build_tree(ts:&mut [Tri],nodes:&mut [Node])->Option<usize>{
 if ts.is_empty()||ts.iter().any(|t|t.iter().any(|v|!v.is_finite())){return None;}let mut count=0;build(ts,0,nodes,&mut count)?;Some(count)
}
/// Squared minimum distance between two built slots, never above `best` (pass the running best for pruning).
pub fn slot_distance(at:&[Tri],an:&[Node],bt:&[Tri],bn:&[Node],best:f64)->f64{let mut best=best;visit(0,0,an,bn,at,bt,&mut best);best}

#[no_mangle]
pub extern "C" fn measure_node_bytes(n:usize)->usize{node_capacity(n).saturating_mul(NODE_BYTES)}
/// tris: n·9 f32 (16-byte aligned, from mesh_alloc); nodes: node_bytes bytes. Returns the node count, 0 on error.
#[no_mangle]
pub unsafe extern "C" fn measure_build(tris:*mut f32,n:usize,nodes:*mut u8,node_bytes:usize)->u32{
 if tris.is_null()||nodes.is_null()||n==0||n>u32::MAX as usize/2{return 0;}
 let ts=std::slice::from_raw_parts_mut(tris as *mut Tri,n);let ns=std::slice::from_raw_parts_mut(nodes as *mut Node,node_bytes/NODE_BYTES);
 build_tree(ts,ns).map_or(0,|c|c as u32)
}
/// Squared distance between two slots built by measure_build; returns min(best, distance²). NaN on bad arguments.
#[no_mangle]
pub unsafe extern "C" fn measure_slots(a:*const f32,na:usize,an:*const u8,acount:u32,b:*const f32,nb:usize,bn:*const u8,bcount:u32,best:f64)->f64{
 if a.is_null()||b.is_null()||an.is_null()||bn.is_null()||na==0||nb==0||acount==0||bcount==0{return f64::NAN;}
 slot_distance(std::slice::from_raw_parts(a as *const Tri,na),std::slice::from_raw_parts(an as *const Node,acount as usize),std::slice::from_raw_parts(b as *const Tri,nb),std::slice::from_raw_parts(bn as *const Node,bcount as usize),best)
}

#[cfg(test)] mod tests{use super::*;
 #[test]fn triangle_cases(){let a=[[0.,0.,0.],[2.,0.,0.],[0.,2.,0.]];let b=a.map(|p|add(p,[0.,0.,3.]));assert_eq!(triangles(&a,&b).sqrt(),3.);let c=[[0.5,0.5,-1.],[0.5,0.5,1.],[2.,2.,0.]];assert_eq!(triangles(&a,&c),0.);assert_eq!(point([1.,0.,0.],&[[0.;3];3]),1.);}
 fn grid(n:usize,z:f32,shift:f32)->Vec<Tri>{(0..n).map(|i|{let x=(i%37) as f32*1.3+shift;let y=(i/37) as f32*0.9;[x,y,z,x+0.8,y+0.1,z+0.05*(i%3) as f32,x+0.1,y+0.7,z]}).collect()}
 fn brute(a:&[Tri],b:&[Tri])->f64{let mut best=f64::INFINITY;for t in a{for u in b{best=best.min(triangles(&wide(t),&wide(u)));}}best}
 #[test]fn tree_matches_brute_force_and_fits_capacity(){for &(n,m) in &[(1usize,1usize),(5,9),(9,8),(300,211),(1000,17)]{
  let a0=grid(n,0.,0.);let b0=grid(m,2.5,7.);let (mut a,mut b)=(a0.clone(),b0.clone());
  let mut an=vec![Node{lo:[0.;3],hi:[0.;3],start:0,end:0,left:0,right:0};node_capacity(n)];let mut bn=an.clone();bn.resize(node_capacity(m),an[0]);
  let ca=build_tree(&mut a,&mut an).expect("capacity a");let cb=build_tree(&mut b,&mut bn).expect("capacity b");
  let d=slot_distance(&a,&an[..ca],&b,&bn[..cb],f64::INFINITY);assert!((d-brute(&a0,&b0)).abs()<1e-9,"{n}x{m}: {d}");
  assert_eq!(slot_distance(&a,&an[..ca],&b,&bn[..cb],d*0.5),d*0.5,"best passes through when nothing is closer");}}
 #[test]fn rejects_non_finite(){let mut a=grid(4,0.,0.);a[2][4]=f32::NAN;let mut n=vec![Node{lo:[0.;3],hi:[0.;3],start:0,end:0,left:0,right:0};node_capacity(4)];assert!(build_tree(&mut a,&mut n).is_none());}
}
