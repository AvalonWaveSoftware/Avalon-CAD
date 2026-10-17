//! ADR-0001 F2a: 3MF (3D Manufacturing Format, core spec 1.x) writer.
//! One `<object type="model">` with the export mesh exactly as the binary STL gets it (same vertices, same
//! triangles, same grounding arithmetic), `unit="millimeter"`, one build item, no colours or metadata.
//! The package is a plain (non-ZIP64) OPC zip with three DEFLATE parts. The XML is generated in small chunks and
//! streamed through the compressor, so the uncompressed model text is never held in memory.
//! Output is deterministic: fixed part order, fixed 1980-01-01 00:00 timestamps, no extra fields, shortest
//! round-trip f32 decimals.
use miniz_oxide::deflate::core::{compress_to_output, create_comp_flags_from_zip_params, CompressorOxide, TDEFLFlush, TDEFLStatus};

pub const CONTENT_TYPES: &[u8] = b"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"><Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/><Default Extension=\"model\" ContentType=\"application/vnd.ms-package.3dmanufacturing-3dmodel+xml\"/></Types>\n";
pub const RELS: &[u8] = b"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Target=\"/3D/3dmodel.model\" Id=\"rel0\" Type=\"http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel\"/></Relationships>\n";
const MODEL_HEAD: &[u8] = b"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<model unit=\"millimeter\" xmlns=\"http://schemas.microsoft.com/3dmanufacturing/core/2015/02\">\n<resources>\n<object id=\"1\" type=\"model\">\n<mesh>\n<vertices>\n";
const MODEL_MID: &[u8] = b"</vertices>\n<triangles>\n";
const MODEL_TAIL: &[u8] = b"</triangles>\n</mesh>\n</object>\n</resources>\n<build>\n<item objectid=\"1\"/>\n</build>\n</model>\n";

/// Error codes shared with the ABI (`encode_3mf`).
pub const TOO_LARGE: i32 = 4;
const BROKEN: i32 = 5;

// CRC-32 (zip polynomial), slicing-by-8: eight 256-entry tables, 8 bytes per step (about 5x the bytewise speed).
// The 8 KB of tables are built on first use rather than stored in the wasm data section.
fn crc_tables() -> Box<[[u32; 256]; 8]> {
    let mut t = Box::new([[0u32; 256]; 8]);
    let mut i = 0;
    while i < 256 {
        let mut c = i as u32;
        let mut k = 0;
        while k < 8 { c = if c & 1 != 0 { 0xEDB8_8320 ^ (c >> 1) } else { c >> 1 }; k += 1; }
        t[0][i] = c;
        i += 1;
    }
    let mut i = 0;
    while i < 256 {
        let mut j = 1;
        while j < 8 { t[j][i] = (t[j - 1][i] >> 8) ^ t[0][(t[j - 1][i] & 0xFF) as usize]; j += 1; }
        i += 1;
    }
    t
}
static TABLES: std::sync::OnceLock<Box<[[u32; 256]; 8]>> = std::sync::OnceLock::new();
pub fn crc32(crc: u32, data: &[u8]) -> u32 {
    let t: &[[u32; 256]; 8] = TABLES.get_or_init(crc_tables);
    let mut c = !crc;
    let mut blocks = data.chunks_exact(8);
    for b in &mut blocks {
        let lo = c ^ u32::from_le_bytes([b[0], b[1], b[2], b[3]]);
        c = t[7][(lo & 0xFF) as usize] ^ t[6][((lo >> 8) & 0xFF) as usize] ^ t[5][((lo >> 16) & 0xFF) as usize] ^ t[4][(lo >> 24) as usize]
            ^ t[3][b[4] as usize] ^ t[2][b[5] as usize] ^ t[1][b[6] as usize] ^ t[0][b[7] as usize];
    }
    for &x in blocks.remainder() { c = t[0][((c ^ x as u32) & 0xFF) as usize] ^ (c >> 8); }
    !c
}

// ---- f32 -> decimal -------------------------------------------------------------------------------------------
// core's float formatting adds ~29 KB of wasm, so the writer has its own: a candidate with n significant digits is
// made with f64 arithmetic, then checked EXACTLY (small bignum) to lie in the interval of reals that round to the
// f32 (ties-to-even bounds). The shortest passing n is found by bisection (passing is monotone in n). Every written
// number therefore parses back to the identical f32 bits. Output is plain decimal (no exponent; never a bare '.'),
// matching the core `ST_Number` pattern; -0 is written as 0.
const POW10: [f64; 65] = [1e0, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13, 1e14, 1e15, 1e16, 1e17, 1e18, 1e19, 1e20, 1e21, 1e22, 1e23, 1e24, 1e25, 1e26, 1e27, 1e28, 1e29, 1e30, 1e31, 1e32, 1e33, 1e34, 1e35, 1e36, 1e37, 1e38, 1e39, 1e40, 1e41, 1e42, 1e43, 1e44, 1e45, 1e46, 1e47, 1e48, 1e49, 1e50, 1e51, 1e52, 1e53, 1e54, 1e55, 1e56, 1e57, 1e58, 1e59, 1e60, 1e61, 1e62, 1e63, 1e64];
const LIMBS: usize = 10;
#[derive(Clone, Copy, PartialEq, Eq)]
struct Big([u32; LIMBS]);
impl Big {
    fn new(v: u64) -> Big { let mut b = [0u32; LIMBS]; b[0] = v as u32; b[1] = (v >> 32) as u32; Big(b) }
    fn mul(&mut self, k: u32) { let mut carry = 0u64; for x in self.0.iter_mut() { let t = *x as u64 * k as u64 + carry; *x = t as u32; carry = t >> 32; } }
    fn pow5(&mut self, mut n: u32) { while n >= 13 { self.mul(1_220_703_125); n -= 13; } if n > 0 { self.mul(5u32.pow(n)); } }
    fn shl(&mut self, n: u32) {
        let (words, bits) = ((n / 32) as usize, n % 32);
        for i in (0..LIMBS).rev() {
            let hi = if i >= words { self.0[i - words] } else { 0 };
            let lo = if bits > 0 && i > words { self.0[i - words - 1] >> (32 - bits) } else { 0 };
            self.0[i] = if bits > 0 { (hi << bits) | lo } else { hi };
        }
    }
    fn cmp(&self, o: &Big) -> core::cmp::Ordering { for i in (0..LIMBS).rev() { if self.0[i] != o.0[i] { return self.0[i].cmp(&o.0[i]); } } core::cmp::Ordering::Equal }
}
/// Exact comparison of c*10^q with mm*2^g.
fn compare(c: u64, q: i32, mm: u64, g: i32) -> core::cmp::Ordering {
    let (a, b) = ((-q).max(0), (-g).max(0));
    let (mut fl, mut fr) = (q + a, a);
    let (mut tl, mut tr) = (q + a + b, g + a + b);
    let f = fl.min(fr); fl -= f; fr -= f;
    let t = tl.min(tr); tl -= t; tr -= t;
    let mut left = Big::new(c); left.pow5(fl as u32); left.shl(tl as u32);
    let mut right = Big::new(mm); right.pow5(fr as u32); right.shl(tr as u32);
    left.cmp(&right)
}
/// The n-significant-digit candidate (c, q) for |x| = value with decimal exponent p, or None if it does not round to
/// the f32 (m * 2^e, interval bounds lo/hi in units of 2^(e-2), inclusive when `even`).
fn candidate(value: f64, p: i32, n: i32, m: u64, e: i32, even: bool, lower_gap: u64) -> Option<(u64, i32)> {
    let s = n - 1 - p;
    let scaled = if s >= 0 { value * POW10[s as usize] } else { value / POW10[(-s) as usize] };
    let c = (scaled + 0.5) as u64;
    let q = -s;
    // Fast decision in f64: the candidate's distance to the f32 is computed with an error of a few 2^-53 of |x|
    // (bounded here by 1e-15 |x|), far below the half-gap (>= 2^-25 |x|), so only candidates within that band around a
    // bound (in practice: exactly on one) need the exact comparison.
    let decimal = if q >= 0 { c as f64 * POW10[q as usize] } else { c as f64 / POW10[(-q) as usize] };
    let gap = pow2(e - 1);
    let (dist, half) = if decimal >= value { (decimal - value, gap) } else { (value - decimal, gap * lower_gap as f64 / 2.0) };
    let err = value * 1e-15;
    if dist < half - err { return Some((c, q)); }
    if dist > half + err { return None; }
    let g = e - 2;
    let low = compare(c, q, 4 * m - lower_gap, g);
    let high = compare(c, q, 4 * m + 2, g);
    use core::cmp::Ordering::*;
    let ok = if even { low != Less && high != Greater } else { low == Greater && high == Less };
    if ok { Some((c, q)) } else { None }
}
/// 2^k as f64 for the f32 exponent range (k in -150..=104), exact.
fn pow2(k: i32) -> f64 { f64::from_bits(((k + 1023) as u64) << 52) }
fn push_f32(out: &mut Vec<u8>, value: f32) -> bool {
    let bits = value.to_bits();
    if bits & 0x7fff_ffff == 0 { out.push(b'0'); return true; }
    if bits >> 31 != 0 { out.push(b'-'); }
    let (exp, frac) = ((bits >> 23) & 0xff, (bits & 0x7f_ffff) as u64);
    let (m, e) = if exp == 0 { (frac, -149) } else { (frac | 0x80_0000, exp as i32 - 150) };
    let lower_gap = if frac == 0 && exp > 1 { 1 } else { 2 };
    let even = m % 2 == 0;
    let x = (value as f64).abs();
    let mut p = 0i32;
    if x >= 1.0 { while p + 1 < 39 && POW10[(p + 1) as usize] <= x { p += 1; } }
    else { while p < 46 && x * POW10[p as usize] < 1.0 { p += 1; } p = -p; }
    // Bisection on n: hi always passes (9 digits suffice for f32; a little slack covers a misestimated p).
    let mut hi = 10; let mut best = None;
    while best.is_none() && hi <= 17 { best = candidate(x, p, hi, m, e, even, lower_gap); if best.is_none() { hi += 1; } }
    let (mut c, mut q) = match best { Some(v) => v, None => return false };
    let mut lo = 1;
    while lo < hi {
        let mid = (lo + hi) / 2;
        match candidate(x, p, mid, m, e, even, lower_gap) { Some(v) => { hi = mid; c = v.0; q = v.1; } None => lo = mid + 1 }
    }
    while c > 0 && c % 10 == 0 { c /= 10; q += 1; }
    let mut digits = [0u8; 20]; let mut n = 0;
    while c > 0 { digits[n] = b'0' + (c % 10) as u8; c /= 10; n += 1; }
    let n = n as i32;
    if q >= 0 { for i in (0..n).rev() { out.push(digits[i as usize]); } for _ in 0..q { out.push(b'0'); } }
    else if -q >= n { out.extend_from_slice(b"0."); for _ in 0..(-q - n) { out.push(b'0'); } for i in (0..n).rev() { out.push(digits[i as usize]); } }
    else { for i in (0..n).rev() { if i == -q - 1 { out.push(b'.'); } out.push(digits[i as usize]); } }
    true
}
fn push_u32(out: &mut Vec<u8>, mut value: u32) {
    let mut digits = [0u8; 10];
    let mut n = 0;
    loop { digits[n] = b'0' + (value % 10) as u8; n += 1; value /= 10; if value == 0 { break; } }
    while n > 0 { n -= 1; out.push(digits[n]); }
}

/// One DEFLATE-compressed zip entry being written straight into the package buffer.
struct Part<'a> { out: &'a mut Vec<u8>, deflate: Box<CompressorOxide>, crc: u32, size: u64, limit: usize, failed: i32 }
impl Part<'_> {
    fn feed(&mut self, data: &[u8], flush: TDEFLFlush) {
        if self.failed != 0 { return; }
        self.crc = crc32(self.crc, data);
        self.size += data.len() as u64;
        let (out, limit) = (&mut *self.out, self.limit);
        let mut over = false;
        let (status, used) = compress_to_output(&mut self.deflate, data, flush, |bytes| {
            if out.len() + bytes.len() > limit { over = true; return false; }
            out.extend_from_slice(bytes);
            true
        });
        if over { self.failed = TOO_LARGE; }
        else if used != data.len() || !matches!(status, TDEFLStatus::Okay | TDEFLStatus::Done) { self.failed = BROKEN; }
    }
}

struct Entry { name: &'static [u8], offset: usize, crc: u32, compressed: u32, size: u32 }
const DOS_TIME: u16 = 0;
const DOS_DATE: u16 = (1 << 5) | 1; // 1980-01-01

fn le16(out: &mut Vec<u8>, v: u16) { out.extend_from_slice(&v.to_le_bytes()); }
fn le32(out: &mut Vec<u8>, v: u32) { out.extend_from_slice(&v.to_le_bytes()); }

/// Writes one deflated entry: local header (sizes patched afterwards, no data descriptor), then the data that
/// `write` produces through `Part::feed`.
fn entry(out: &mut Vec<u8>, name: &'static [u8], level: u8, limit: usize, write: impl FnOnce(&mut Part)) -> Result<Entry, i32> {
    let offset = out.len();
    le32(out, 0x0403_4b50); le16(out, 20); le16(out, 0); le16(out, 8); le16(out, DOS_TIME); le16(out, DOS_DATE);
    le32(out, 0); le32(out, 0); le32(out, 0); le16(out, name.len() as u16); le16(out, 0);
    out.extend_from_slice(name);
    let start = out.len();
    let flags = create_comp_flags_from_zip_params(level as i32, 0, 0);
    let mut part = Part { out, deflate: Box::new(CompressorOxide::new(flags)), crc: 0, size: 0, limit, failed: 0 };
    write(&mut part);
    part.feed(&[], TDEFLFlush::Finish);
    let (crc, size, failed) = (part.crc, part.size, part.failed);
    if failed != 0 { return Err(failed); }
    let compressed = out.len() - start;
    if size > u32::MAX as u64 - 1 || compressed as u64 > u32::MAX as u64 - 1 { return Err(TOO_LARGE); }
    out[offset + 14..offset + 18].copy_from_slice(&crc.to_le_bytes());
    out[offset + 18..offset + 22].copy_from_slice(&(compressed as u32).to_le_bytes());
    out[offset + 22..offset + 26].copy_from_slice(&(size as u32).to_le_bytes());
    Ok(Entry { name, offset, crc, compressed: compressed as u32, size: size as u32 })
}

/// The grounded vertex coordinate exactly as `encode_stl` writes it (f64 subtraction, then f32).
#[inline]
fn coordinate(value: f32, k: usize, min_z: f64) -> f32 { (value as f64 - if k == 2 { min_z } else { 0.0 }) as f32 }

/// Builds the whole 3MF package. `v`/`t` must already be validated. Triangles whose three indices are not distinct
/// (zero-area by construction; the core spec forbids them) are skipped; Manifold never produces them.
pub fn encode(v: &[f32], t: &[u32], ground: bool, level: u8, limit: usize) -> Result<Vec<u8>, i32> {
    let min_z = if ground { v.chunks_exact(3).map(|p| p[2] as f64).fold(f64::INFINITY, f64::min) } else { 0.0 };
    let mut out = Vec::with_capacity(t.len() * 4 + 1024);
    let mut entries = Vec::with_capacity(3);
    entries.push(entry(&mut out, b"[Content_Types].xml", level, limit, |p| p.feed(CONTENT_TYPES, TDEFLFlush::None))?);
    entries.push(entry(&mut out, b"_rels/.rels", level, limit, |p| p.feed(RELS, TDEFLFlush::None))?);
    entries.push(entry(&mut out, b"3D/3dmodel.model", level, limit, |p| {
        let mut chunk: Vec<u8> = Vec::with_capacity(1 << 16);
        p.feed(MODEL_HEAD, TDEFLFlush::None);
        for point in v.chunks_exact(3) {
            let mut ok = true;
            chunk.extend_from_slice(b"<vertex x=\""); ok &= push_f32(&mut chunk, coordinate(point[0], 0, min_z));
            chunk.extend_from_slice(b"\" y=\""); ok &= push_f32(&mut chunk, coordinate(point[1], 1, min_z));
            chunk.extend_from_slice(b"\" z=\""); ok &= push_f32(&mut chunk, coordinate(point[2], 2, min_z));
            chunk.extend_from_slice(b"\"/>\n");
            if !ok { p.failed = BROKEN; return; }
            if chunk.len() > (1 << 16) - 128 { p.feed(&chunk, TDEFLFlush::None); chunk.clear(); if p.failed != 0 { return; } }
        }
        chunk.extend_from_slice(MODEL_MID);
        for f in t.chunks_exact(3) {
            if f[0] == f[1] || f[1] == f[2] || f[0] == f[2] { continue; }
            chunk.extend_from_slice(b"<triangle v1=\""); push_u32(&mut chunk, f[0]);
            chunk.extend_from_slice(b"\" v2=\""); push_u32(&mut chunk, f[1]);
            chunk.extend_from_slice(b"\" v3=\""); push_u32(&mut chunk, f[2]);
            chunk.extend_from_slice(b"\"/>\n");
            if chunk.len() > (1 << 16) - 128 { p.feed(&chunk, TDEFLFlush::None); chunk.clear(); if p.failed != 0 { return; } }
        }
        chunk.extend_from_slice(MODEL_TAIL);
        p.feed(&chunk, TDEFLFlush::None);
    })?);
    let directory = out.len();
    for e in &entries {
        le32(&mut out, 0x0201_4b50); le16(&mut out, 20); le16(&mut out, 20); le16(&mut out, 0); le16(&mut out, 8);
        le16(&mut out, DOS_TIME); le16(&mut out, DOS_DATE); le32(&mut out, e.crc); le32(&mut out, e.compressed); le32(&mut out, e.size);
        le16(&mut out, e.name.len() as u16); le16(&mut out, 0); le16(&mut out, 0); le16(&mut out, 0); le16(&mut out, 0);
        le32(&mut out, 0); le32(&mut out, e.offset as u32);
        out.extend_from_slice(e.name);
    }
    let directory_size = out.len() - directory;
    le32(&mut out, 0x0605_4b50); le16(&mut out, 0); le16(&mut out, 0);
    le16(&mut out, entries.len() as u16); le16(&mut out, entries.len() as u16);
    le32(&mut out, directory_size as u32); le32(&mut out, directory as u32); le16(&mut out, 0);
    if out.len() > limit { return Err(TOO_LARGE); }
    Ok(out)
}

/// ADR-0001 F2a speed gate: stage-by-stage timing hooks (feature `profile`, never shipped).
#[cfg(feature = "profile")]
pub mod profile {
    use super::*;
    static mut XML: Vec<u8> = Vec::new();
    #[allow(static_mut_refs)]
    fn xml() -> &'static mut Vec<u8> { unsafe { &mut XML } }
    /// 0: min_z only; 1: vertices text; 2: triangles text; 3: whole model XML into one buffer (kept for 4/5).
    #[no_mangle] pub unsafe extern "C" fn prof_xml(vp: *const f32, nv: usize, tp: *const u32, nt: usize, stage: u32) -> usize {
        let v = core::slice::from_raw_parts(vp, nv); let t = core::slice::from_raw_parts(tp, nt);
        let min_z = v.chunks_exact(3).map(|p| p[2] as f64).fold(f64::INFINITY, f64::min);
        if stage == 0 { return min_z as usize; }
        let out = xml(); out.clear(); out.reserve(nv * 12 + nt * 12 + 1024);
        if stage == 1 || stage == 3 { out.extend_from_slice(MODEL_HEAD); for point in v.chunks_exact(3) {
            out.extend_from_slice(b"<vertex x=\""); push_f32(out, coordinate(point[0], 0, min_z));
            out.extend_from_slice(b"\" y=\""); push_f32(out, coordinate(point[1], 1, min_z));
            out.extend_from_slice(b"\" z=\""); push_f32(out, coordinate(point[2], 2, min_z));
            out.extend_from_slice(b"\"/>\n"); } out.extend_from_slice(MODEL_MID); }
        if stage == 2 || stage == 3 { for f in t.chunks_exact(3) {
            out.extend_from_slice(b"<triangle v1=\""); push_u32(out, f[0]);
            out.extend_from_slice(b"\" v2=\""); push_u32(out, f[1]);
            out.extend_from_slice(b"\" v3=\""); push_u32(out, f[2]);
            out.extend_from_slice(b"\"/>\n"); } out.extend_from_slice(MODEL_TAIL); }
        out.len()
    }
    #[no_mangle] pub extern "C" fn prof_crc() -> u32 { crc32(0, xml()) }
    /// DEFLATE the kept XML at `level` in one call; returns the compressed size.
    #[no_mangle] pub extern "C" fn prof_deflate(level: u32) -> usize { miniz_oxide::deflate::compress_to_vec(xml(), level as u8).len() }
    /// DEFLATE the kept XML through the streaming path encode() uses (64 KB feeds).
    #[no_mangle] pub extern "C" fn prof_deflate_stream(level: u32) -> usize {
        let mut out = Vec::with_capacity(xml().len() / 4);
        let flags = create_comp_flags_from_zip_params(level as i32, 0, 0);
        let mut d = Box::new(CompressorOxide::new(flags));
        for c in xml().chunks(1 << 16) { compress_to_output(&mut d, c, TDEFLFlush::None, |b| { out.extend_from_slice(b); true }); }
        compress_to_output(&mut d, &[], TDEFLFlush::Finish, |b| { out.extend_from_slice(b); true });
        out.len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn text(value: f32) -> String { let mut out = Vec::new(); assert!(push_f32(&mut out, value)); String::from_utf8(out).unwrap() }
    fn st_number(s: &str) -> bool {
        let b = s.strip_prefix('-').unwrap_or(s);
        let mut parts = b.splitn(2, '.');
        let int = parts.next().unwrap();
        !int.is_empty() && int.bytes().all(|c| c.is_ascii_digit())
            && parts.next().map_or(true, |f| !f.is_empty() && f.bytes().all(|c| c.is_ascii_digit()))
    }
    #[test] fn decimals_round_trip_and_are_shortest() {
        let mut values = vec![0.0f32, -0.0, 1.0, -1.0, 0.1, 0.5, 2.5, 10.0, 100.0, 1e-7, 1e-30, 16777216.0, 16777217.0, 3.4028235e38,
            f32::MIN_POSITIVE, 1.4e-45, -1.4e-45, 7.006e-46_f32.max(1.4e-45), 123456.79, 0.3, 1.0 / 3.0, 9.999999, 99999.99];
        let mut state = 0x2545_f491_4f6c_dd1du64;
        for _ in 0..200_000 {
            state ^= state << 13; state ^= state >> 7; state ^= state << 17;
            let bits = state as u32;
            let v = f32::from_bits(bits);
            if v.is_finite() { values.push(v); }
            // CAD-range coordinates too.
            values.push(((state >> 32) as u32 as f32 / u32::MAX as f32 - 0.5) * 2000.0);
        }
        let mut longer = 0;
        for v in values {
            let s = text(v);
            assert!(st_number(&s), "{s}");
            let back: f32 = s.parse().unwrap();
            assert_eq!(back.to_bits(), if v == 0.0 { 0 } else { v.to_bits() }, "{v:e} -> {s}");
            let digits = |t: &str| t.trim_start_matches('-').replace('.', "").trim_start_matches('0').trim_end_matches('0').len();
            if digits(&s) > digits(&format!("{}", v)) { longer += 1; }
        }
        assert_eq!(longer, 0, "outputs longer than the shortest representation");
        assert_eq!(text(-0.0), "0"); assert_eq!(text(10.0), "10"); assert_eq!(text(0.1), "0.1"); assert_eq!(text(-2.5), "-2.5");
    }
    #[test] fn crc_matches_reference() {
        assert_eq!(crc32(0, b"123456789"), 0xCBF4_3926);
        let data: Vec<u8> = (0..1000u32).map(|i| (i * 7 + i / 13) as u8).collect();
        let bytewise = |data: &[u8]| { let mut c = !0u32; for &b in data { c ^= b as u32; for _ in 0..8 { c = if c & 1 != 0 { 0xEDB8_8320 ^ (c >> 1) } else { c >> 1 }; } } !c };
        for len in [0, 1, 7, 8, 9, 63, 1000] { assert_eq!(crc32(0, &data[..len]), bytewise(&data[..len])); }
        assert_eq!(crc32(crc32(0, &data[..333]), &data[333..]), bytewise(&data), "streaming");
    }

    pub struct Zip { pub names: Vec<String>, pub data: Vec<Vec<u8>> }
    fn u16at(b: &[u8], i: usize) -> usize { u16::from_le_bytes([b[i], b[i + 1]]) as usize }
    fn u32at(b: &[u8], i: usize) -> usize { u32::from_le_bytes(b[i..i + 4].try_into().unwrap()) as usize }
    pub fn unzip(b: &[u8]) -> Zip {
        let end = b.len() - 22;
        assert_eq!(u32at(b, end), 0x0605_4b50);
        let (count, size, start) = (u16at(b, end + 10), u32at(b, end + 12), u32at(b, end + 16));
        assert_eq!(start + size, end);
        let (mut at, mut names, mut data) = (start, vec![], vec![]);
        for _ in 0..count {
            assert_eq!(u32at(b, at), 0x0201_4b50);
            let (method, crc, csize, usize_, nlen, offset) = (u16at(b, at + 10), u32at(b, at + 16), u32at(b, at + 20), u32at(b, at + 24), u16at(b, at + 28), u32at(b, at + 42));
            assert_eq!(method, 8); assert_eq!(u16at(b, at + 8), 0, "no flags (no data descriptor, no encryption)");
            let name = String::from_utf8(b[at + 46..at + 46 + nlen].to_vec()).unwrap();
            assert_eq!(u32at(b, offset), 0x0403_4b50);
            assert_eq!(&b[offset + 14..offset + 26], &b[at + 16..at + 28], "local header matches central directory");
            let body = &b[offset + 30 + nlen..offset + 30 + nlen + csize];
            let raw = miniz_oxide::inflate::decompress_to_vec(body).unwrap();
            assert_eq!(raw.len(), usize_); assert_eq!(crc32(0, &raw) as usize, crc);
            names.push(name); data.push(raw);
            at += 46 + nlen;
        }
        assert_eq!(at, end);
        Zip { names, data }
    }
    fn cube() -> (Vec<f32>, Vec<u32>) {
        let v = vec![0.,0.,-1., 2.,0.,-1., 2.,3.,-1., 0.,3.,-1., 0.,0.,4., 2.,0.,4., 2.,3.,4., 0.,3.,4.];
        let t = vec![0,2,1, 0,3,2, 4,5,6, 4,6,7, 0,1,5, 0,5,4, 1,2,6, 1,6,5, 2,3,7, 2,7,6, 3,0,4, 3,4,7];
        (v, t)
    }
    #[test] fn package_is_valid_deterministic_and_grounded() {
        let (v, t) = cube();
        let a = encode(&v, &t, true, 6, usize::MAX).unwrap();
        assert_eq!(a, encode(&v, &t, true, 6, usize::MAX).unwrap(), "same input, same bytes");
        let zip = unzip(&a);
        assert_eq!(zip.names, ["[Content_Types].xml", "_rels/.rels", "3D/3dmodel.model"]);
        assert_eq!(zip.data[0], CONTENT_TYPES); assert_eq!(zip.data[1], RELS);
        let model = String::from_utf8(zip.data[2].clone()).unwrap();
        assert!(model.contains("unit=\"millimeter\"") && model.contains("<object id=\"1\" type=\"model\">") && model.contains("<item objectid=\"1\"/>"));
        assert_eq!(model.matches("<vertex ").count(), 8); assert_eq!(model.matches("<triangle ").count(), 12);
        assert!(model.contains("<vertex x=\"2\" y=\"3\" z=\"5\"/>"), "grounded like the STL");
        let ungrounded = String::from_utf8(unzip(&encode(&v, &t, false, 6, usize::MAX).unwrap()).data[2].clone()).unwrap();
        assert!(ungrounded.contains("<vertex x=\"0\" y=\"0\" z=\"-1\"/>"));
        assert!(model.contains("<triangle v1=\"0\" v2=\"2\" v3=\"1\"/>"));
    }
    #[test] fn degenerate_index_triangles_are_skipped_and_limit_is_enforced() {
        let (v, mut t) = cube(); t.extend_from_slice(&[1, 1, 2]);
        let model = String::from_utf8(unzip(&encode(&v, &t, true, 6, usize::MAX).unwrap()).data[2].clone()).unwrap();
        assert_eq!(model.matches("<triangle ").count(), 12);
        assert_eq!(encode(&v, &t, true, 6, 200).unwrap_err(), TOO_LARGE);
    }
}
