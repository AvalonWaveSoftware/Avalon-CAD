//! Local, allocation-bounded mesh preparation and binary STL encoding.
//! The ABI consumes borrowed buffers and writes caller-owned result buffers.
use std::alloc::{alloc_zeroed, dealloc, Layout};
use std::collections::HashMap;
use std::slice;
mod threads;

#[no_mangle]
pub extern "C" fn engine_version() -> u32 { 3 }

#[no_mangle]
pub unsafe extern "C" fn mesh_alloc(bytes: usize) -> *mut u8 {
    if bytes == 0 { return std::ptr::null_mut(); }
    match Layout::from_size_align(bytes, 16) {
        Ok(layout) => alloc_zeroed(layout),
        Err(_) => std::ptr::null_mut(),
    }
}

#[no_mangle]
pub unsafe extern "C" fn mesh_free(ptr: *mut u8, bytes: usize) {
    if !ptr.is_null() && bytes > 0 {
        if let Ok(layout) = Layout::from_size_align(bytes, 16) { dealloc(ptr, layout); }
    }
}

fn valid(vertices: &[f32], triangles: &[u32]) -> bool {
    vertices.len() % 3 == 0 && triangles.len() % 3 == 0
        && vertices.iter().all(|v| v.is_finite())
        && triangles.iter().all(|i| (*i as usize) < vertices.len() / 3)
}
fn point(vertices: &[f32], index: u32) -> [f64; 3] {
    let i = index as usize * 3;
    [vertices[i] as f64, vertices[i + 1] as f64, vertices[i + 2] as f64]
}
fn sub(a: [f64; 3], b: [f64; 3]) -> [f64; 3] { [a[0]-b[0],a[1]-b[1],a[2]-b[2]] }
fn cross(a: [f64; 3], b: [f64; 3]) -> [f64; 3] {
    [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
}
fn length(n: [f64; 3]) -> f64 { (n[0]*n[0]+n[1]*n[1]+n[2]*n[2]).sqrt() }
fn unit(n: [f64; 3]) -> [f64; 3] {
    let len=length(n);let inv=1.0/if len==0.0 {1.0}else{len};
    [n[0]*inv,n[1]*inv,n[2]*inv]
}

#[no_mangle]
pub unsafe extern "C" fn prepare_mesh(
    vp: *const f32, nv: usize, tp: *const u32, nt: usize,
    flags: *const u8, nf: usize, groups: *const u32, ng: usize,
    positions: *mut f32, normals: *mut f32,
) -> i32 {
    if nt == 0 { return 0; }
    if vp.is_null() || tp.is_null() || positions.is_null() || normals.is_null() { return 1; }
    let v=slice::from_raw_parts(vp,nv);let t=slice::from_raw_parts(tp,nt);
    if !valid(v,t) || (nf!=0 && (flags.is_null() || nf!=nt/3))
        || (ng!=0 && (groups.is_null() || ng!=nt/3)) { return 2; }
    let flat=if nf>0 {slice::from_raw_parts(flags,nf)}else{&[]};
    let smoothing=if ng>0 {slice::from_raw_parts(groups,ng)}else{&[]};
    let out=slice::from_raw_parts_mut(positions,nt*3);
    let normal_out=slice::from_raw_parts_mut(normals,nt*3);
    let mut faces=Vec::with_capacity(nt/3);
    for f in t.chunks_exact(3) {
        let a=point(v,f[0]);let b=point(v,f[1]);let c=point(v,f[2]);
        faces.push(unit(cross(sub(c,b),sub(a,b))));
    }
    // Weld only identical positions from the same source surface instance.
    // Boolean seams and nearby thin faces must not borrow each other's normals.
    let mut ids=Vec::with_capacity(nt);
    let mut table=HashMap::with_capacity(nv/3);
    for (corner,&vertex) in t.iter().enumerate() {
        let p=vertex as usize*3;
        let bits=|value:f32|if value==0.0 {0}else{value.to_bits()};
        let key=(bits(v[p]),bits(v[p+1]),bits(v[p+2]),smoothing.get(corner/3).copied().unwrap_or(0));
        let next=table.len();let id=*table.entry(key).or_insert(next);ids.push(id);
    }
    let mut offsets=vec![0usize;table.len()+1];
    for &id in &ids {offsets[id+1]+=1;}
    for i in 0..table.len() {offsets[i+1]+=offsets[i];}
    let mut buckets=vec![0usize;nt];let mut cursors=offsets[..table.len()].to_vec();
    for (i,&id) in ids.iter().enumerate() {buckets[cursors[id]]=i/3;cursors[id]+=1;}
    let crease=(std::f64::consts::PI/6.0).cos();
    for (f,tri) in t.chunks_exact(3).enumerate() {
        let n=faces[f];
        let fixed=if flat.get(f)==Some(&1) {
            Some(unit(cross(sub(point(v,tri[1]),point(v,tri[0])),sub(point(v,tri[2]),point(v,tri[0])))))
        }else{None};
        for (corner,&vertex) in tri.iter().enumerate() {
            let at=f*9+corner*3;let p=vertex as usize*3;
            out[at..at+3].copy_from_slice(&v[p..p+3]);
            let nn=if let Some(fixed)=fixed {fixed}else{
                let id=ids[f*3+corner];let mut sum=[0.0;3];
                for &adjacent in &buckets[offsets[id]..offsets[id+1]] {
                    let other=faces[adjacent];
                    if n[0]*other[0]+n[1]*other[1]+n[2]*other[2]>crease {
                        for k in 0..3 {sum[k]+=other[k];}
                    }
                }
                unit(sum)
            };
            for k in 0..3 {normal_out[at+k]=nn[k] as f32;}
        }
    }
    0
}

#[no_mangle]
pub unsafe extern "C" fn encode_stl(
    vp: *const f32, nv: usize, tp: *const u32, nt: usize,
    ground: u32, output: *mut u8, output_len: usize,
) -> i32 {
    if nt==0 {return 3;}
    if vp.is_null() || tp.is_null() || output.is_null() {return 1;}
    let v=slice::from_raw_parts(vp,nv);let t=slice::from_raw_parts(tp,nt);
    if !valid(v,t) || output_len!=84+nt/3*50 {return 2;}
    let out=slice::from_raw_parts_mut(output,output_len);out.fill(0);
    let label=b"AvalonCad | millimeters | binary STL";out[..label.len()].copy_from_slice(label);
    out[80..84].copy_from_slice(&(nt as u32/3).to_le_bytes());
    let min_z=if ground!=0 {v.chunks_exact(3).map(|p|p[2] as f64).fold(f64::INFINITY,f64::min)}else{0.0};
    for (i,f) in t.chunks_exact(3).enumerate() {
        let a=point(v,f[0]);let b=point(v,f[1]);let c=point(v,f[2]);
        let n=cross(sub(b,a),sub(c,a));let len=length(n);let len=if len==0.0 {1.0}else{len};
        let mut at=84+i*50;
        for value in n {out[at..at+4].copy_from_slice(&((value/len) as f32).to_le_bytes());at+=4;}
        for p in [a,b,c] {for k in 0..3 {
            let value=p[k]-if k==2 {min_z}else{0.0};
            out[at..at+4].copy_from_slice(&(value as f32).to_le_bytes());at+=4;
        }}
    }
    0
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test] fn rejects_invalid_indices_and_nonfinite_vertices() {
        assert!(!valid(&[0.,0.,0.],&[0,1,0]));
        assert!(!valid(&[f32::NAN,0.,0.],&[0,0,0]));
    }
    #[test] fn stl_grounding_and_orientation() {
        let v=[0.,0.,5.,1.,0.,5.,0.,1.,5.];let t=[0,1,2];let mut out=vec![0;134];
        assert_eq!(unsafe{encode_stl(v.as_ptr(),v.len(),t.as_ptr(),t.len(),1,out.as_mut_ptr(),out.len())},0);
        assert_eq!(u32::from_le_bytes(out[80..84].try_into().unwrap()),1);
        assert_eq!(f32::from_le_bytes(out[92..96].try_into().unwrap()),1.);
        assert_eq!(f32::from_le_bytes(out[104..108].try_into().unwrap()),0.);
    }
    fn preview(v:&[f32],t:&[u32],groups:&[u32])->Vec<f32> {
        let mut positions=vec![0.;t.len()*3];let mut normals=positions.clone();
        assert_eq!(unsafe{prepare_mesh(v.as_ptr(),v.len(),t.as_ptr(),t.len(),std::ptr::null(),0,
            groups.as_ptr(),groups.len(),positions.as_mut_ptr(),normals.as_mut_ptr())},0);
        for (i,&vertex) in t.iter().enumerate(){assert_eq!(&positions[i*3..i*3+3],&v[vertex as usize*3..vertex as usize*3+3]);}
        normals
    }
    #[test] fn source_groups_keep_overlapping_surfaces_separate() {
        let angle=20_f32.to_radians();let v=[0.,0.,0.,1.,0.,0.,0.,1.,0.,0.,angle.cos(),-angle.sin()];let t=[0,1,2,0,1,3];
        let isolated=preview(&v,&t,&[1,2]);assert!(isolated[1].abs()<1e-6);assert!((isolated[2]-1.).abs()<1e-6);
        assert!((isolated[10]-angle.sin()).abs()<1e-6);
        let merged=preview(&v,&t,&[]);assert!(merged[1]>0.1);
    }
    #[test] fn thin_gaps_do_not_weld_distinct_vertices() {
        let angle=20_f32.to_radians();let v=[0.,0.,0.,1.,0.,0.,0.,1.,0.,0.,0.,0.002,1.,0.,0.002,0.,angle.cos(),0.002-angle.sin()];
        let normals=preview(&v,&[0,1,2,3,4,5],&[1,1]);assert!(normals[1].abs()<1e-6);assert!((normals[10]-angle.sin()).abs()<1e-6);
    }
    #[test] fn rejects_invalid_smoothing_group_length() {
        let v=[0.,0.,0.,1.,0.,0.,0.,1.,0.];let t=[0,1,2];let groups=[1,2];let mut positions=[0.;9];let mut normals=[0.;9];
        assert_eq!(unsafe{prepare_mesh(v.as_ptr(),v.len(),t.as_ptr(),t.len(),std::ptr::null(),0,
            groups.as_ptr(),groups.len(),positions.as_mut_ptr(),normals.as_mut_ptr())},2);
    }
}
