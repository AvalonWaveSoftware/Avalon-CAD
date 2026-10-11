//! Printable, single-start 60-degree threads, with flat crests and roots.
//! Profile knots follow the helix; length clips the ends without changing pitch.
use std::slice;
use std::f64::consts::PI;

struct Mesh { vertices: Vec<f32>, triangles: Vec<u32>, info: [u32;6] }
#[derive(Clone,Copy)]
struct Sample { id:u32, knot:i64 }

fn radius(z:f64, theta:f64, p:&[f64]) -> f64 {
 let q=((z+p[7])/p[2]-p[6]*theta/(2.0*PI)).rem_euclid(1.0);
 let u=q.min(1.0-q);
 let depth=(3.0f64.sqrt()*p[2]*(u-0.0625).max(0.0)).min(3.0f64.sqrt()*p[2]*17.0/48.0);
 if p[0]==0.0 {p[1]/2.0-depth-p[5]}
 else {(p[1]/2.0-depth).max(p[1]/2.0-3.0f64.sqrt()*p[2]*5.0/16.0)+p[5]}
}
fn vertex(v:&mut Vec<f32>,r:f64,theta:f64,z:f64)->u32 {
 let id=(v.len()/3) as u32;v.extend_from_slice(&[(r*theta.cos()) as f32,(r*theta.sin()) as f32,z as f32]);id
}
fn triangle(t:&mut Vec<u32>,a:u32,b:u32,c:u32,reverse:bool){
 if reverse {t.extend_from_slice(&[a,c,b]);}else{t.extend_from_slice(&[a,b,c]);}
}
fn build(p:&[f64])->Result<Mesh,i32>{
 if p.len()!=9 || p.iter().any(|v|!v.is_finite()) || ![0.0,1.0].contains(&p[0])
  || !(0.5..=500.0).contains(&p[1]) || !(0.05..=50.0).contains(&p[2])
  || !(0.05..=5000.0).contains(&p[3]) || !(0.0..=2.0).contains(&p[5])
  || ![-1.0,1.0].contains(&p[6]) || !(0.005..=2.0).contains(&p[8])
  || p[1]/2.0-3.0f64.sqrt()*p[2]*17.0/48.0-p[5]<=0.025
  || (p[0]==1.0 && (p[4]>1000.0 || p[4]/2.0<=p[1]/2.0+p[5]+0.05)) {return Err(2);}
 let turns=p[3]/p[2];if turns>500.0{return Err(3);}
 let max_radius=if p[0]==0.0{p[1]/2.0}else{p[4]/2.0};
 let n=((PI/(1.0-(p[8]/max_radius).min(1.0)).acos()).ceil() as usize).max(48);
 let n=((n+7)/8*8).min(512);
 let knots=if p[0]==0.0{[1.0/16.0,5.0/12.0,7.0/12.0,15.0/16.0]}else{[1.0/16.0,3.0/8.0,5.0/8.0,15.0/16.0]};
 let mut angles=(0..n).map(|i|i as f64/n as f64).collect::<Vec<_>>();
 // Preserve the profile corners where the helix crosses either flat end.
 // This avoids rounding away a partially clipped crest at the end of a part.
 for end in [0.0,p[3]] {for knot in knots {
  let a=(p[6]*((end+p[7])/p[2]-knot)).rem_euclid(1.0);
  angles.push(if a>1.0-1e-7 {0.0}else{a});
 }}
 angles.sort_by(|a,b|a.partial_cmp(b).unwrap());angles.dedup_by(|a,b|(*a-*b).abs()<1e-7);
 let n=angles.len();
 if (turns.ceil() as usize+2)*n*8>800_000{return Err(3);}
 let mut v=Vec::new();let mut t=Vec::new();let mut columns=Vec::with_capacity(n);
 let eps=(p[3]*2e-7).max(1e-8*p[2]);
 for i in 0..n {
  let theta=angles[i]*2.0*PI;
  let bottom=vertex(&mut v,radius(0.0,theta,p),theta,-p[3]/2.0);
  let mut col=vec![Sample{id:bottom,knot:i64::MIN}];
  let shift=p[6]*angles[i]-p[7]/p[2];
  let first=((-shift).floor() as i64-1)*4;let last=((turns-shift).ceil() as i64+1)*4;
  for k in first..=last {
   let z=p[2]*(k.div_euclid(4) as f64+knots[k.rem_euclid(4) as usize]+shift);
   if z>eps && z<p[3]-eps {col.push(Sample{id:vertex(&mut v,radius(z,theta,p),theta,z-p[3]/2.0),knot:k});}
  }
  col.push(Sample{id:vertex(&mut v,radius(p[3],theta,p),theta,p[3]/2.0),knot:i64::MAX});columns.push(col);
 }
 // A tube has a plain outside and a helical bore. The rod has one helical outside.
 let mut outer_bottom=Vec::new();let mut outer_top=Vec::new();
 if p[0]==1.0 {
  for i in 0..n {let theta=angles[i]*2.0*PI;outer_bottom.push(vertex(&mut v,p[4]/2.0,theta,-p[3]/2.0));outer_top.push(vertex(&mut v,p[4]/2.0,theta,p[3]/2.0));}
  for i in 0..n {let j=(i+1)%n;triangle(&mut t,outer_bottom[i],outer_bottom[j],outer_top[j],false);triangle(&mut t,outer_bottom[i],outer_top[j],outer_top[i],false);}
 }
 let outer_end=t.len() as u32;
 for i in 0..n {
  let j=(i+1)%n;let a=&columns[i];let b=&columns[j];let (mut ai,mut bi)=(0,0);
  // Closing the angular seam advances/reverses the helix by one full turn.
  let seam=if j==0{(p[6] as i64)*4}else{0};
  while ai+1<a.len()||bi+1<b.len() {
   let ak=if ai+1<a.len(){a[ai+1].knot}else{i64::MAX};
   let bk=if bi+1<b.len(){let k=b[bi+1].knot;if k==i64::MAX{k}else{k-seam}}else{i64::MAX};
   let reverse=p[0]==1.0;
   if ak==bk && ai+1<a.len() && bi+1<b.len() {
    triangle(&mut t,a[ai].id,b[bi].id,b[bi+1].id,reverse);triangle(&mut t,a[ai].id,b[bi+1].id,a[ai+1].id,reverse);ai+=1;bi+=1;
   }else if ak<bk && ai+1<a.len() {triangle(&mut t,a[ai].id,b[bi].id,a[ai+1].id,reverse);ai+=1;}
   else if bi+1<b.len(){triangle(&mut t,a[ai].id,b[bi].id,b[bi+1].id,reverse);bi+=1;}
   else{triangle(&mut t,a[ai].id,b[bi].id,a[ai+1].id,reverse);ai+=1;}
  }
 }
 let side_end=t.len() as u32;
 let bottom_center=if p[0]==0.0{Some(vertex(&mut v,0.0,0.0,-p[3]/2.0))}else{None};
 let top_center=if p[0]==0.0{Some(vertex(&mut v,0.0,0.0,p[3]/2.0))}else{None};
 for i in 0..n {let j=(i+1)%n;let a=columns[i][0].id;let b=columns[j][0].id;
  if let Some(c)=bottom_center{triangle(&mut t,c,b,a,false);}else{triangle(&mut t,outer_bottom[i],b,outer_bottom[j],false);triangle(&mut t,outer_bottom[i],a,b,false);}
 }
 let bottom_end=t.len() as u32;
 for i in 0..n {let j=(i+1)%n;let a=columns[i].last().unwrap().id;let b=columns[j].last().unwrap().id;
  if let Some(c)=top_center{triangle(&mut t,c,a,b,false);}else{triangle(&mut t,outer_top[i],outer_top[j],b,false);triangle(&mut t,outer_top[i],b,a,false);}
 }
 let info=[v.len() as u32,t.len() as u32,outer_end,side_end,bottom_end,t.len() as u32];
 Ok(Mesh{vertices:v,triangles:t,info})
}

/// info has six u32 values: buffer lengths and surface-group boundaries.
/// With null output buffers only the required sizes are returned.
#[no_mangle]
pub unsafe extern "C" fn thread_mesh(p:*const f64,info:*mut u32,v:*mut f32,nv:usize,t:*mut u32,nt:usize)->i32{
 if p.is_null()||info.is_null(){return 1;}
 let mesh=match build(slice::from_raw_parts(p,9)){Ok(m)=>m,Err(e)=>return e};
 slice::from_raw_parts_mut(info,6).copy_from_slice(&mesh.info);
 if v.is_null()&&t.is_null(){return 0;}
 if v.is_null()||t.is_null()||nv!=mesh.vertices.len()||nt!=mesh.triangles.len(){return 2;}
 slice::from_raw_parts_mut(v,nv).copy_from_slice(&mesh.vertices);slice::from_raw_parts_mut(t,nt).copy_from_slice(&mesh.triangles);0
}

#[cfg(test)]
mod tests {
 use super::*;
 #[test]fn profile_pitch_and_clearance(){let p=[0.0,8.0,1.25,30.0,0.0,0.0,1.0,0.0,0.005];assert!((radius(0.0,0.0,&p)-4.0).abs()<1e-12);assert!((radius(1.25,0.0,&p)-4.0).abs()<1e-12);assert!((radius(0.625,0.0,&p)-(4.0-1.25*3.0f64.sqrt()*17.0/48.0)).abs()<1e-12);let mut f=p;f[0]=1.0;f[4]=14.0;f[5]=0.15;for i in 0..1000{let z=i as f64/100.0;assert!(radius(z,0.0,&f)>=radius(z,0.0,&p)+0.15-1e-12);}}
 #[test]fn closed_oriented_thread_mesh(){use std::collections::HashMap;for kind in [0.0,1.0]{for hand in [-1.0,1.0]{let m=build(&[kind,8.0,1.25,7.3,14.0,0.1,hand,0.31,0.03]).unwrap();let mut edges=HashMap::new();for tri in m.triangles.chunks_exact(3){for (a,b) in [(tri[0],tri[1]),(tri[1],tri[2]),(tri[2],tri[0])]{*edges.entry((a.min(b),a.max(b))).or_insert(0i32)+=if a<b{1}else{-1};}}assert!(edges.values().all(|v|*v==0));}}}
}
