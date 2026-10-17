//! Local, allocation-bounded mesh preparation, binary STL and 3MF encoding.
//! The ABI consumes borrowed buffers and writes caller-owned result buffers.
use std::alloc::{alloc_zeroed, dealloc, Layout};
use std::collections::HashMap;
use std::hash::{BuildHasherDefault, Hasher};
use std::slice;
mod threads;
mod three_mf;

#[no_mangle]
pub extern "C" fn engine_version() -> u32 { 4 }

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

// WS10 (Architect note): the corner weld used std's SipHash HashMap. FxHash gives the same ids (ids are assigned in corner
// order on first insertion, independent of the hasher), so the output is byte-identical, only faster.
#[derive(Default, Clone, Copy)]
struct Fx(u64);
impl Hasher for Fx {
    fn finish(&self) -> u64 { self.0 }
    fn write(&mut self, bytes: &[u8]) { for &b in bytes { self.add(b as u64); } }
    fn write_u32(&mut self, x: u32) { self.add(x as u64); }
    fn write_u64(&mut self, x: u64) { self.add(x); }
    fn write_usize(&mut self, x: usize) { self.add(x as u64); }
}
impl Fx { #[inline] fn add(&mut self, x: u64) { self.0 = (self.0.rotate_left(5) ^ x).wrapping_mul(0x51_7c_c1_b7_27_22_0a_95); } }
type FxMap<K, V> = HashMap<K, V, BuildHasherDefault<Fx>>;

/// Shared display preparation: calls `emit(corner, position, normal)` for every triangle corner in order.
unsafe fn prepare_corners(
    vp: *const f32, nv: usize, tp: *const u32, nt: usize,
    flags: *const u8, nf: usize, groups: *const u32, ng: usize,
    mut emit: impl FnMut(usize, &[f32], [f32; 3], usize),
) -> i32 {
    if vp.is_null() || tp.is_null() { return 1; }
    let v=slice::from_raw_parts(vp,nv);let t=slice::from_raw_parts(tp,nt);
    if !valid(v,t) || (nf!=0 && (flags.is_null() || nf!=nt/3))
        || (ng!=0 && (groups.is_null() || ng!=nt/3)) { return 2; }
    let flat=if nf>0 {slice::from_raw_parts(flags,nf)}else{&[]};
    let smoothing=if ng>0 {slice::from_raw_parts(groups,ng)}else{&[]};
    let mut faces=Vec::with_capacity(nt/3);
    for f in t.chunks_exact(3) {
        let a=point(v,f[0]);let b=point(v,f[1]);let c=point(v,f[2]);
        faces.push(unit(cross(sub(c,b),sub(a,b))));
    }
    // Weld only identical positions from the same source surface instance.
    // Boolean seams and nearby thin faces must not borrow each other's normals.
    // The weld key of a corner is (position bits with -0 as 0, smoothing group); ids are numbered in corner order on first
    // appearance. Positions are hashed once per input vertex, and a vertex remembers its last (group, id), so most
    // corners skip the hash; the ids are the same as hashing every corner's full key.
    let mut ids=Vec::with_capacity(nt);
    let bits=|value:f32|if value==0.0 {0}else{value.to_bits()};
    let mut positions:FxMap<(u32,u32,u32),u32>=FxMap::with_capacity_and_hasher(nv/3,Default::default());
    let mut table:FxMap<u64,usize>=FxMap::with_capacity_and_hasher(nv/3,Default::default());
    let (mut pos_id,mut memo_group,mut memo_id)=(vec![u32::MAX;nv/3],vec![0u32;nv/3],vec![usize::MAX;nv/3]);
    for (corner,&vertex) in t.iter().enumerate() {
        let vi=vertex as usize;let group=smoothing.get(corner/3).copied().unwrap_or(0);
        if memo_id[vi]!=usize::MAX && memo_group[vi]==group {ids.push(memo_id[vi]);continue;}
        if pos_id[vi]==u32::MAX {
            let p=vi*3;let next=positions.len() as u32;
            pos_id[vi]=*positions.entry((bits(v[p]),bits(v[p+1]),bits(v[p+2]))).or_insert(next);
        }
        let next=table.len();let id=*table.entry(((group as u64)<<32)|pos_id[vi] as u64).or_insert(next);
        memo_group[vi]=group;memo_id[vi]=id;ids.push(id);
    }
    let count=table.len();drop(table);drop(positions);
    let mut offsets=vec![0usize;count+1];
    for &id in &ids {offsets[id+1]+=1;}
    for i in 0..count {offsets[i+1]+=offsets[i];}
    let mut buckets=vec![0usize;nt];let mut cursors=offsets[..count].to_vec();
    for (i,&id) in ids.iter().enumerate() {buckets[cursors[id]]=i/3;cursors[id]+=1;}
    let crease=(std::f64::consts::PI/6.0).cos();
    for (f,tri) in t.chunks_exact(3).enumerate() {
        let n=faces[f];
        let fixed=if flat.get(f)==Some(&1) {
            Some(unit(cross(sub(point(v,tri[1]),point(v,tri[0])),sub(point(v,tri[2]),point(v,tri[0])))))
        }else{None};
        for (corner,&vertex) in tri.iter().enumerate() {
            let p=vertex as usize*3;let id=ids[f*3+corner];
            let nn=if let Some(fixed)=fixed {fixed}else{
                let mut sum=[0.0;3];
                for &adjacent in &buckets[offsets[id]..offsets[id+1]] {
                    let other=faces[adjacent];
                    if n[0]*other[0]+n[1]*other[1]+n[2]*other[2]>crease {
                        for k in 0..3 {sum[k]+=other[k];}
                    }
                }
                unit(sum)
            };
            emit(f*3+corner,&v[p..p+3],[nn[0] as f32,nn[1] as f32,nn[2] as f32],id);
        }
    }
    0
}

#[no_mangle]
pub unsafe extern "C" fn prepare_mesh(
    vp: *const f32, nv: usize, tp: *const u32, nt: usize,
    flags: *const u8, nf: usize, groups: *const u32, ng: usize,
    positions: *mut f32, normals: *mut f32,
) -> i32 {
    if nt == 0 { return 0; }
    if positions.is_null() || normals.is_null() { return 1; }
    let out=slice::from_raw_parts_mut(positions,nt*3);
    let normal_out=slice::from_raw_parts_mut(normals,nt*3);
    prepare_corners(vp,nv,tp,nt,flags,nf,groups,ng,|corner,p,n,_|{
        let at=corner*3;out[at..at+3].copy_from_slice(p);normal_out[at..at+3].copy_from_slice(&n);
    })
}

/// WS10: the same corners as `prepare_mesh`, indexed. Corners whose position and normal bits are both identical share
/// one vertex (only within one weld id, i.e. same position key and smoothing group), numbered in first-corner order.
/// `positions`/`normals` need room for `nt*3` floats, `index` for `nt` entries; `count` receives the vertex
/// count. Expanding `index` gives `prepare_mesh` exactly.
#[no_mangle]
pub unsafe extern "C" fn prepare_indexed(
    vp: *const f32, nv: usize, tp: *const u32, nt: usize,
    flags: *const u8, nf: usize, groups: *const u32, ng: usize,
    positions: *mut f32, normals: *mut f32, index: *mut u32, count: *mut u32,
) -> i32 {
    if count.is_null() { return 1; }
    *count=0;
    if nt == 0 { return 0; }
    if positions.is_null() || normals.is_null() || index.is_null() { return 1; }
    let out=slice::from_raw_parts_mut(positions,nt*3);let normal_out=slice::from_raw_parts_mut(normals,nt*3);
    let index_out=slice::from_raw_parts_mut(index,nt);
    let mut heads:Vec<u32>=Vec::new();let mut chain:Vec<u32>=Vec::with_capacity(nt/2);let mut n_out=0usize;
    let code=prepare_corners(vp,nv,tp,nt,flags,nf,groups,ng,|corner,p,n,id|{
        if id>=heads.len() {heads.resize(id+1,u32::MAX);}
        let same=|a:&[f32],b:&[f32]|a.iter().zip(b).all(|(x,y)|x.to_bits()==y.to_bits());
        let mut at=heads[id];
        while at!=u32::MAX {
            let i=at as usize*3;
            if same(&out[i..i+3],p) && same(&normal_out[i..i+3],&n) {break;}
            at=chain[at as usize];
        }
        if at==u32::MAX {
            at=n_out as u32;let i=n_out*3;
            out[i..i+3].copy_from_slice(p);normal_out[i..i+3].copy_from_slice(&n);
            chain.push(heads[id]);heads[id]=at;n_out+=1;
        }
        index_out[corner]=at;
    });
    if code==0 {*count=n_out as u32;}
    code
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

/// ADR-0001 F2a (ABI v4): the 3MF package of the same mesh `encode_stl` writes (same vertices and grounding).
/// `level` is the DEFLATE level (0-10); `limit` caps the package size in bytes. On success `result[0]` is a
/// `mesh_alloc` pointer to the package and `result[1]` its length; the caller frees it with `mesh_free`.
/// Codes: 1 null pointer, 2 invalid mesh, 3 no triangles, 4 larger than `limit`, 5 compressor or memory failure.
#[no_mangle]
pub unsafe extern "C" fn encode_3mf(
    vp: *const f32, nv: usize, tp: *const u32, nt: usize,
    ground: u32, level: u32, limit: usize, result: *mut usize,
) -> i32 {
    if result.is_null() {return 1;}
    let result=slice::from_raw_parts_mut(result,2);result[0]=0;result[1]=0;
    if nt==0 {return 3;}
    if vp.is_null() || tp.is_null() {return 1;}
    let v=slice::from_raw_parts(vp,nv);let t=slice::from_raw_parts(tp,nt);
    if !valid(v,t) || level>10 {return 2;}
    match three_mf::encode(v,t,ground!=0,level as u8,limit) {
        Ok(bytes) => {
            let ptr=mesh_alloc(bytes.len());if ptr.is_null() {return 5;}
            slice::from_raw_parts_mut(ptr,bytes.len()).copy_from_slice(&bytes);
            result[0]=ptr as usize;result[1]=bytes.len();0
        }
        Err(code) => code,
    }
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
    #[test] fn indexed_expands_to_prepare_mesh() {
        let angle=20_f32.to_radians();let v=[0.,0.,0.,1.,0.,0.,0.,1.,0.,0.,angle.cos(),-angle.sin(),-0.,1.,0.];let t=[0,1,2,0,1,3,4,2,0];
        for groups in [&[][..],&[1,1,2][..]] {
            let mut positions=vec![0.;t.len()*3];let mut normals=positions.clone();
            assert_eq!(unsafe{prepare_mesh(v.as_ptr(),v.len(),t.as_ptr(),t.len(),std::ptr::null(),0,groups.as_ptr(),groups.len(),positions.as_mut_ptr(),normals.as_mut_ptr())},0);
            let (mut p,mut n,mut i,mut c)=(vec![0f32;t.len()*3],vec![0f32;t.len()*3],vec![0u32;t.len()],0u32);
            assert_eq!(unsafe{prepare_indexed(v.as_ptr(),v.len(),t.as_ptr(),t.len(),std::ptr::null(),0,groups.as_ptr(),groups.len(),p.as_mut_ptr(),n.as_mut_ptr(),i.as_mut_ptr(),&mut c)},0);
            assert!((c as usize)<t.len());
            for k in 0..t.len() {let x=i[k] as usize;for j in 0..3 {
                assert_eq!(p[x*3+j].to_bits(),positions[k*3+j].to_bits());assert_eq!(n[x*3+j].to_bits(),normals[k*3+j].to_bits());
}}
        }
    }
    #[test] fn rejects_invalid_smoothing_group_length() {
        let v=[0.,0.,0.,1.,0.,0.,0.,1.,0.];let t=[0,1,2];let groups=[1,2];let mut positions=[0.;9];let mut normals=[0.;9];
        assert_eq!(unsafe{prepare_mesh(v.as_ptr(),v.len(),t.as_ptr(),t.len(),std::ptr::null(),0,
            groups.as_ptr(),groups.len(),positions.as_mut_ptr(),normals.as_mut_ptr())},2);
    }
}
