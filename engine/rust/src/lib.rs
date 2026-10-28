//! Local, allocation-bounded mesh preparation, binary STL and 3MF encoding.
//! The ABI consumes borrowed buffers and writes caller-owned result buffers.
use std::alloc::{alloc_zeroed, dealloc, Layout};
use std::collections::HashMap;
use std::hash::{BuildHasherDefault, Hasher};
use std::slice;
mod threads;
mod three_mf;
mod measure;

#[no_mangle]
pub extern "C" fn engine_version() -> u32 { 7 }

#[no_mangle]
pub unsafe extern "C" fn mesh_alloc(bytes: usize) -> *mut u8 {
    if bytes == 0 { return std::ptr::null_mut(); }
    match Layout::from_size_align(bytes, 16) {
        Ok(layout) => alloc_zeroed(layout),
        Err(_) => std::ptr::null_mut(),
    }
}

/// Frees a byte buffer that an encoder returned (`encode_3mf`): `ptr`/`len` exactly as reported.
#[no_mangle]
pub unsafe extern "C" fn free_bytes(ptr: *mut u8, len: usize) {
    if !ptr.is_null() { drop(Box::from_raw(std::ptr::slice_from_raw_parts_mut(ptr, len))); }
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
    mut emit: impl FnMut(usize, &[f32], [f32; 3], usize, usize),
) -> i32 {
    if vp.is_null() || tp.is_null() { return 1; }
    let v=slice::from_raw_parts(vp,nv);let t=slice::from_raw_parts(tp,nt);
    if !valid(v,t) || (nf!=0 && (flags.is_null() || nf!=nt/3))
        || (ng!=0 && (groups.is_null() || ng!=nt/3)) { return 2; }
    let flat=if nf>0 {slice::from_raw_parts(flags,nf)}else{&[]};
    let smoothing=if ng>0 {slice::from_raw_parts(groups,ng)}else{&[]};
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
    // android-large-mesh-memory (ADR-0001): the weld tables are freed before the face normals are built, so the two
    // never coexist; the normals are the same values in the same order as before (byte-identical output).
    let count=table.len();drop(table);drop(positions);drop(pos_id);drop(memo_group);drop(memo_id);
    let mut faces=Vec::with_capacity(nt/3);
    for f in t.chunks_exact(3) {
        let a=point(v,f[0]);let b=point(v,f[1]);let c=point(v,f[2]);
        faces.push(unit(cross(sub(c,b),sub(a,b))));
    }
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
            emit(f*3+corner,&v[p..p+3],[nn[0] as f32,nn[1] as f32,nn[2] as f32],id,count);
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
    prepare_corners(vp,nv,tp,nt,flags,nf,groups,ng,|corner,p,n,_,_|{
        let at=corner*3;out[at..at+3].copy_from_slice(p);normal_out[at..at+3].copy_from_slice(&n);
    })
}

/// WS10: the same corners as `prepare_mesh`, indexed. Corners whose position and normal bits are both identical share
/// one vertex (only within one weld id, i.e. same position key and smoothing group), numbered in first-corner order.
/// `index` needs room for `nt` entries. android-large-mesh-memory (ADR-0001): the vertex arrays are sized exactly
/// (Rust-owned, grown from the weld-id count) instead of `nt*3` floats each from the caller; on success
/// `result` = [positions ptr, normals ptr, vertex count, positions capacity, normals capacity] (capacities in floats); the
/// caller copies `count*3` floats from each and frees each with `free_floats(ptr, capacity)`. Expanding `index` gives `prepare_mesh` exactly.
#[no_mangle]
pub unsafe extern "C" fn prepare_indexed(
    vp: *const f32, nv: usize, tp: *const u32, nt: usize,
    flags: *const u8, nf: usize, groups: *const u32, ng: usize,
    index: *mut u32, result: *mut usize,
) -> i32 {
    if result.is_null() { return 1; }
    let result=slice::from_raw_parts_mut(result,5);result.fill(0);
    if nt == 0 { return 0; }
    if index.is_null() { return 1; }
    let index_out=slice::from_raw_parts_mut(index,nt);
    // ADR-0001 06:50 (prepare_indexed regression): the 6892eb7-shaped hot path. The outputs, heads and chain are allocated
    // once (zeroed, sized to the weld-id count) at the first corner and written by index; nothing grows inside the
    // per-corner loop except on the cold path where one weld id has several normals beyond that count.
    let (mut out,mut normal_out)=(Vec::<f32>::new(),Vec::<f32>::new());
    let mut heads:Vec<u32>=Vec::new();let mut chain:Vec<u32>=Vec::new();let mut n_out=0usize;
    #[cold] #[inline(never)]
    fn grow(out:&mut Vec<f32>,normal_out:&mut Vec<f32>,chain:&mut Vec<u32>){
        let n=(chain.len()*2).max(16);out.resize(n*3,0.0);normal_out.resize(n*3,0.0);chain.resize(n,0);
    }
    let code=prepare_corners(vp,nv,tp,nt,flags,nf,groups,ng,|corner,p,n,id,count|{
        if heads.is_empty() {heads=vec![u32::MAX;count];chain=vec![0u32;count];out=vec![0.0f32;count*3];normal_out=vec![0.0f32;count*3];}
        let same=|a:&[f32],b:&[f32]|a.iter().zip(b).all(|(x,y)|x.to_bits()==y.to_bits());
        let mut at=heads[id];
        while at!=u32::MAX {
            let i=at as usize*3;
            if same(&out[i..i+3],p) && same(&normal_out[i..i+3],&n) {break;}
            at=chain[at as usize];
        }
        if at==u32::MAX {
            if n_out==chain.len() {grow(&mut out,&mut normal_out,&mut chain);}
            at=n_out as u32;let i=n_out*3;
            out[i..i+3].copy_from_slice(p);normal_out[i..i+3].copy_from_slice(&n);
            chain[n_out]=heads[id];heads[id]=at;n_out+=1;
        }
        index_out[corner]=at;
    });
    drop(heads);drop(chain);
    if code!=0 {return code;}
    let count=n_out;
    let (mut out,mut normal_out)=(std::mem::ManuallyDrop::new(out),std::mem::ManuallyDrop::new(normal_out));
    result[0]=out.as_mut_ptr() as usize;result[1]=normal_out.as_mut_ptr() as usize;result[2]=count;
    result[3]=out.capacity();result[4]=normal_out.capacity();
    0
}

/// Frees a float array that `prepare_indexed` handed out (`capacity` in floats, as returned).
#[no_mangle]
pub unsafe extern "C" fn free_floats(ptr: *mut f32, capacity: usize) {
    if !ptr.is_null() && capacity > 0 { drop(Vec::from_raw_parts(ptr, 0, capacity)); }
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
/// pointer to the package and `result[1]` its length; the caller frees it with `free_bytes`.
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
            // The package buffer itself goes to JS (no second copy); JS frees it with free_bytes.
            let bytes=std::mem::ManuallyDrop::new(bytes.into_boxed_slice());
            result[0]=bytes.as_ptr() as usize;result[1]=bytes.len();0
        }
        Err(code) => code,
    }
}

/// ADR-0001 F2a option A, step 1 (on the geometry worker): validates the export mesh exactly as `encode_3mf` does and
/// writes the grounding offset (min Z, or 0 when `ground` is 0) the parts are encoded with. Codes as `encode_3mf`.
#[no_mangle]
pub unsafe extern "C" fn prepare_3mf(vp: *const f32, nv: usize, tp: *const u32, nt: usize, ground: u32, min_z: *mut f64) -> i32 {
    if min_z.is_null() {return 1;}
    if nt==0 {return 3;}
    if vp.is_null() || tp.is_null() {return 1;}
    let v=slice::from_raw_parts(vp,nv);let t=slice::from_raw_parts(tp,nt);
    if !valid(v,t) {return 2;}
    *min_z=three_mf::min_z(v,ground!=0);0
}

/// Step 2 (on a pool worker): part `k` of `parts` (= three_mf::parts_for(total triangles): 1 or PARTS), given only its
/// own records (sliced with `three_mf::part_range`, from a mesh `prepare_3mf` accepted). On success
/// `result` = [pointer, length, text CRC-32, text size]; free the bytes with `free_bytes`.
#[no_mangle]
pub unsafe extern "C" fn encode_3mf_part(vp: *const f32, nv: usize, tp: *const u32, nt: usize, min_z: f64, k: u32, parts: u32, level: u32, result: *mut usize) -> i32 {
    if result.is_null() {return 1;}
    let result=slice::from_raw_parts_mut(result,4);result.fill(0);
    if (nv>0 && vp.is_null()) || (nt>0 && tp.is_null()) {return 1;}
    let (k,n)=(k as usize,parts as usize);
    if (n!=1 && n!=three_mf::PARTS) || k>=n || level>10 || nv%3!=0 || nt%3!=0 || (n>1 && ((k<4 && nt>0) || (k>=4 && nv>0))) || !min_z.is_finite() {return 2;}
    let v=if nv>0 {slice::from_raw_parts(vp,nv)} else {&[]};let t=if nt>0 {slice::from_raw_parts(tp,nt)} else {&[]};
    if v.iter().any(|x|!x.is_finite()) {return 2;}
    let mut out=Vec::with_capacity(nv*8+nt*4+64);
    match three_mf::deflate_part(&mut out,v,t,min_z,k,n,level as u8,usize::MAX,0) {
        Ok((crc,size)) => {
            if size>u32::MAX as u64 {return three_mf::TOO_LARGE;}
            let bytes=std::mem::ManuallyDrop::new(out.into_boxed_slice());
            result[0]=bytes.as_ptr() as usize;result[1]=bytes.len();result[2]=crc as usize;result[3]=size as usize;0
        }
        Err(code) => code,
    }
}

/// Step 3: the zip frame for `parts` parts (1 or PARTS), `dlen` = their byte lengths summed, `meta` = `parts` pairs of
/// (text CRC-32, text size). frame[..split] + the parts' bytes in order + frame[split..] = the same bytes as `encode_3mf`.
/// `result` = [pointer, length, split]; free with `free_bytes`.
#[no_mangle]
pub unsafe extern "C" fn package_3mf(dlen: usize, meta: *const u32, parts: u32, level: u32, limit: usize, result: *mut usize) -> i32 {
    if result.is_null() || meta.is_null() {return 1;}
    let result=slice::from_raw_parts_mut(result,3);result[0]=0;result[1]=0;result[2]=0;
    if level>10 || (parts!=1 && parts as usize!=three_mf::PARTS) {return 2;}
    let m=slice::from_raw_parts(meta,2*parts as usize);
    let parts:Vec<(u32,u64)>=m.chunks_exact(2).map(|p|(p[0],p[1] as u64)).collect();
    match three_mf::frame(dlen,&parts,level as u8,limit) {
        Ok((bytes,split)) => {let bytes=std::mem::ManuallyDrop::new(bytes.into_boxed_slice());result[0]=bytes.as_ptr() as usize;result[1]=bytes.len();result[2]=split;0}
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
            let (mut i,mut r)=(vec![0u32;t.len()],[0usize;5]);
            assert_eq!(unsafe{prepare_indexed(v.as_ptr(),v.len(),t.as_ptr(),t.len(),std::ptr::null(),0,groups.as_ptr(),groups.len(),i.as_mut_ptr(),r.as_mut_ptr())},0);
            let c=r[2];assert!(c<t.len()&&c>0&&r[3]>=c*3&&r[4]>=c*3);
            let (p,n)=unsafe{(slice::from_raw_parts(r[0] as *const f32,c*3).to_vec(),slice::from_raw_parts(r[1] as *const f32,c*3).to_vec())};
            unsafe{free_floats(r[0] as *mut f32,r[3]);free_floats(r[1] as *mut f32,r[4]);}
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

/// Export-mesh downward area in mm² and triangle count. Faces on the build plate (all three vertices at the
/// plate's z: the lowest z of a grounded export, else z = 0) rest on the bed and are left out (QA addendum
/// 2026-10-27); a raised face counts.
/// Output is two f64 values, allocated once by the caller; inputs are borrowed.
#[no_mangle]
pub unsafe extern "C" fn overhang_stats(vp: *const f32, nv: usize, tp: *const u32, nt: usize,
    threshold: f64, ground: u32, out: *mut f64) -> u32 {
    if nv % 3 != 0 || nt % 3 != 0 || !threshold.is_finite() || !(0.0..=1.0).contains(&threshold)
        || out.is_null() || (nv > 0 && vp.is_null()) || (nt > 0 && tp.is_null()) { return 1; }
    let v = if nv == 0 { &[] } else { slice::from_raw_parts(vp, nv) };
    let t = if nt == 0 { &[] } else { slice::from_raw_parts(tp, nt) };
    let mut area = 0.0; let mut count = 0u32;
    // ground != 0: the export is grounded, so the build plate is the lowest z; otherwise it is z = 0.
    let bed = if ground != 0 { v.iter().skip(2).step_by(3).fold(f32::INFINITY, |m, &z| m.min(z)) } else { 0.0 };
    for tri in t.chunks_exact(3) {
        if tri.iter().any(|&i| i as usize >= nv / 3) { return 1; }
        let a = tri[0] as usize * 3; let b = tri[1] as usize * 3; let c = tri[2] as usize * 3;
        let mut u = [0.0; 3]; let mut w = [0.0; 3];
        for k in 0..3 {
            if !v[a+k].is_finite() || !v[b+k].is_finite() || !v[c+k].is_finite() { return 1; }
            u[k] = v[b+k] as f64 - v[a+k] as f64;
            w[k] = v[c+k] as f64 - v[a+k] as f64;
        }
        if v[a+2] == bed && v[b+2] == bed && v[c+2] == bed { continue; }
        let x = u[1]*w[2]-u[2]*w[1]; let y = u[2]*w[0]-u[0]*w[2]; let z = u[0]*w[1]-u[1]*w[0];
        let length = (x*x+y*y+z*z).sqrt();
        if z < -threshold * length { area += length * 0.5; count += 1; }
    }
    *out = area; *out.add(1) = count as f64; 0
}

#[cfg(test)]
mod overhang_tests {
    use super::overhang_stats;
    fn stats(v: &[f32], t: &[u32], threshold: f64) -> (u32, [f64; 2]) {
        let mut out = [0.0; 2];
        let code = unsafe { overhang_stats(v.as_ptr(), v.len(), t.as_ptr(), t.len(), threshold, 1, out.as_mut_ptr()) };
        (code, out)
    }
    #[test]
    fn wedge_and_winding() {
        let v = [0.,0.,0., 0.,4.,0., 3.,0.,1.];
        let (code, out) = stats(&v, &[0,1,2], std::f64::consts::FRAC_1_SQRT_2);
        assert_eq!(code, 0); assert!((out[0] - 2.0*10.0f64.sqrt()).abs() < 1e-12); assert_eq!(out[1], 1.);
        assert_eq!(stats(&v, &[0,2,1], 0.0).1, [0.,0.]);
    }
    #[test]
    fn bottom_ceiling_degenerate_and_boundary() {
        // vertex 3 is lower, so the z=0 faces are not on the build plate here
        let v = [0.,0.,0., 0.,2.,0., 3.,0.,0., 0.,0.,-1.];
        assert_eq!(stats(&v, &[0,1,2,0,1,2,0,0,0], 0.7), (0,[6.,2.]));
        assert_eq!(stats(&v, &[0,1,2], 1.0), (0,[0.,0.]));
        assert_eq!(stats(&[], &[], 0.7), (0,[0.,0.]));
    }
    #[test]
    fn build_plate_faces_left_out() {
        // a down face at the lowest z rests on the bed; the same face lifted above a lower vertex counts
        let v = [0.,0.,0., 0.,2.,0., 3.,0.,0.];
        assert_eq!(stats(&v, &[0,1,2], 0.7), (0,[0.,0.]));
        let lifted = [0.,0.,1., 0.,2.,1., 3.,0.,1., 0.,0.,0.];
        assert_eq!(stats(&lifted, &[0,1,2], 0.7), (0,[3.,1.]));
        // not grounded: the plate is z = 0, so a face raised to z = 1 counts even when it is the lowest
        let raised = [0.,0.,1., 0.,2.,1., 3.,0.,1.];
        let mut out = [0.0; 2];
        assert_eq!(unsafe { overhang_stats(raised.as_ptr(), 9, [0u32,1,2].as_ptr(), 3, 0.7, 0, out.as_mut_ptr()) }, 0);
        assert_eq!(out, [3.,1.]);
        assert_eq!(unsafe { overhang_stats(v.as_ptr(), 9, [0u32,1,2].as_ptr(), 3, 0.7, 0, out.as_mut_ptr()) }, 0);
        assert_eq!(out, [0.,0.]);
    }
    #[test]
    fn rejects_invalid() {
        assert_eq!(stats(&[0.,0.,0.], &[0,1,2], 0.7).0, 1);
        assert_eq!(stats(&[], &[], f64::NAN).0, 1);
        assert_eq!(stats(&[f32::NAN,0.,0.], &[0,0,0], 0.7).0, 1);
    }
}

// Compact caller-owned buffers in place. Keys retain signed zero; no tolerance.
// The remap is sized once, and output never exceeds the input allocation.
#[no_mangle]
pub unsafe extern "C" fn weld_exact(vp: *mut f32, vn: usize, tp: *mut u32, tn: usize, count: *mut u32) -> u32 {
    if vp.is_null() || tp.is_null() || count.is_null() || vn == 0 || tn == 0 { return 1; }
    let vertices = slice::from_raw_parts_mut(vp, vn);
    let triangles = slice::from_raw_parts_mut(tp, tn);
    if !valid(vertices, triangles) { return 1; }
    let mut seen: FxMap<[u32; 3], u32> = FxMap::default();
    let mut remap = vec![0u32; vn / 3];
    let mut used = 0usize;
    for i in 0..vn / 3 {
        let p = [vertices[i*3], vertices[i*3+1], vertices[i*3+2]];
        let key = [p[0].to_bits(), p[1].to_bits(), p[2].to_bits()];
        let index = *seen.entry(key).or_insert_with(|| {
            let index = used as u32;
            vertices[used*3..used*3+3].copy_from_slice(&p);
            used += 1;
            index
        });
        remap[i] = index;
    }
    for t in triangles { *t = remap[*t as usize]; }
    *count = (used * 3) as u32;
    0
}

#[cfg(test)]
mod weld_tests {
    use super::*;
    #[test]
    fn exact_stable_signed_zero() {
        let mut v = vec![0., 1., 2., -0., 1., 2., 0., 1., 2., f32::from_bits(1), 1., 2.];
        let mut t = vec![2, 1, 0, 3, 2, 1];
        let mut n = 0;
        assert_eq!(unsafe { weld_exact(v.as_mut_ptr(), v.len(), t.as_mut_ptr(), t.len(), &mut n) }, 0);
        assert_eq!(n, 9);
        assert_eq!(v[3].to_bits(), (-0.0f32).to_bits());
        assert_eq!(v[6].to_bits(), 1);
        assert_eq!(t, vec![0, 1, 0, 2, 0, 1]);
    }
    #[test]
    fn invalid_does_not_mutate() {
        for value in [f32::NAN, f32::INFINITY] {
            let mut v = vec![value, 0., 0.]; let mut t = vec![0,0,0]; let mut n = 99;
            assert_eq!(unsafe { weld_exact(v.as_mut_ptr(), 3, t.as_mut_ptr(), 3, &mut n) }, 1);
            assert_eq!(n,99);
        }
        let mut v = vec![0.,0.,0.]; let mut t = vec![0,1,0]; let mut n = 0;
        assert_eq!(unsafe { weld_exact(v.as_mut_ptr(), 3, t.as_mut_ptr(), 3, &mut n) }, 1);
        assert_eq!(t,vec![0,1,0]);
    }
}
