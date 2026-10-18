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
const PAIRS: &[u8; 200] = b"00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899";

/// Raw writer into a Vec's spare capacity. The caller guarantees MAX_RECORD bytes of room before each vertex or
/// triangle line (model_stream flushes its chunk first), so the hot loop has no capacity or bounds checks.
struct W { p: *mut u8 }
impl W {
    #[inline(always)] unsafe fn byte(&mut self, b: u8) { *self.p = b; self.p = self.p.add(1); }
    #[inline(always)] unsafe fn bytes(&mut self, b: &[u8]) { core::ptr::copy_nonoverlapping(b.as_ptr(), self.p, b.len()); self.p = self.p.add(b.len()); }
    /// Decimal digits of `v` (no sign, no leading zeros; "0" for 0) using two-digit pairs.
    #[inline(never)] unsafe fn uint(&mut self, mut v: u64) {
        let mut buf = [0u8; 20]; let mut i = 20;
        while v >= 100 { let r = (v % 100) as usize * 2; v /= 100; i -= 2; buf[i] = PAIRS[r]; buf[i + 1] = PAIRS[r + 1]; }
        if v >= 10 { let r = v as usize * 2; i -= 2; buf[i] = PAIRS[r]; buf[i + 1] = PAIRS[r + 1]; } else { i -= 1; buf[i] = b'0' + v as u8; }
        self.bytes(&buf[i..]);
    }
    /// Shortest round-trip decimal of `value` (see the formatter notes above). False only if no candidate up to 17
    /// digits was found, which cannot happen for finite f32.
    #[inline(never)] unsafe fn f32(&mut self, value: f32) -> bool {
        let bits = value.to_bits();
        if bits & 0x7fff_ffff == 0 { self.byte(b'0'); return true; }
        if bits >> 31 != 0 { self.byte(b'-'); }
        let (exp, frac) = ((bits >> 23) & 0xff, (bits & 0x7f_ffff) as u64);
        let (m, e) = if exp == 0 { (frac, -149) } else { (frac | 0x80_0000, exp as i32 - 150) };
        let lower_gap = if frac == 0 && exp > 1 { 1 } else { 2 };
        let even = m % 2 == 0;
        let x = (value as f64).abs();
        // Decimal exponent p with 10^p <= x < 10^(p+1): estimate from the binary exponent, then correct.
        let mut p = ((e + 23) as f64 * core::f64::consts::LOG10_2).floor() as i32;
        let pw = |k: i32| if k >= 0 { POW10[k as usize] } else { 1.0 / POW10[(-k) as usize] };
        while p > -46 && pw(p) > x { p -= 1; }
        while p < 38 && pw(p + 1) <= x { p += 1; }
        // Passing is monotone in the digit count: start at 9 (always enough for f32), jump down past trailing zeros,
        // and step down until a count fails.
        let mut n = 9; let mut best = candidate(x, p, n, m, e, even, lower_gap);
        while best.is_none() && n < 17 { n += 1; best = candidate(x, p, n, m, e, even, lower_gap); }
        let (mut c, mut q) = match best { Some(v) => v, None => return false };
        loop {
            while c >= 10 && c % 10 == 0 { c /= 10; q += 1; n -= 1; }
            if n <= 1 { break; }
            match candidate(x, p, n - 1, m, e, even, lower_gap) { Some(v) => { c = v.0; q = v.1; n -= 1; } None => break }
        }
        let digits = { let mut k = 1; let mut t = c; while t >= 10 { t /= 10; k += 1; } k };
        if q >= 0 { self.uint(c); for _ in 0..q { self.byte(b'0'); } }
        else if -q >= digits {
            self.bytes(b"0."); for _ in 0..(-q - digits) { self.byte(b'0'); } self.uint(c);
        } else {
            let scale = POW10[(-q) as usize] as u64; let (int, fr) = (c / scale, c % scale);
            self.uint(int); self.byte(b'.');
            let mut lead = { let mut k = 1; let mut t = fr; while t >= 10 { t /= 10; k += 1; } -q - k };
            while lead > 0 { self.byte(b'0'); lead -= 1; }
            self.uint(fr);
        }
        true
    }
}
/// Longest vertex or triangle line: 3 numbers of at most 48 characters ("-0." + 44 zeros/digits) plus the markup.
const MAX_RECORD: usize = 3 * 48 + 32;
#[cfg(test)]
fn push_f32(out: &mut Vec<u8>, value: f32) -> bool {
    out.reserve(64);
    unsafe { let mut w = W { p: out.as_mut_ptr().add(out.len()) }; let ok = w.f32(value); let n = w.p.offset_from(out.as_ptr()) as usize; out.set_len(n); ok }
}

/// One DEFLATE-compressed zip entry being written straight into the package buffer.
struct Part<'a> { out: &'a mut Vec<u8>, deflate: Box<CompressorOxide>, crc: u32, size: u64, limit: usize, failed: i32 }
impl Part<'_> {
    #[inline(never)]
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

struct Entry { name: &'static [u8], offset: usize, crc: u32, compressed: u32, size: u32, gap: usize }
const DOS_TIME: u16 = 0;
const DOS_DATE: u16 = (1 << 5) | 1; // 1980-01-01

fn le16(out: &mut Vec<u8>, v: u16) { out.extend_from_slice(&v.to_le_bytes()); }
fn le32(out: &mut Vec<u8>, v: u32) { out.extend_from_slice(&v.to_le_bytes()); }

/// The body of an entry: appends raw DEFLATE data to `out` and returns the CRC-32 and size of the uncompressed data,
/// plus `gap`, the number of compressed bytes it did NOT append because the caller splices them in afterwards.
type Body<'a> = dyn FnMut(&mut Vec<u8>) -> Result<(u32, u64, usize), i32> + 'a;
/// Writes one entry: local header (CRC and sizes patched afterwards, no data descriptor), then `body`'s data.
#[inline(never)]
fn entry(out: &mut Vec<u8>, name: &'static [u8], body: &mut Body) -> Result<Entry, i32> {
    let offset = out.len();
    le32(out, 0x0403_4b50); le16(out, 20); le16(out, 0); le16(out, 8); le16(out, DOS_TIME); le16(out, DOS_DATE);
    le32(out, 0); le32(out, 0); le32(out, 0); le16(out, name.len() as u16); le16(out, 0);
    out.extend_from_slice(name);
    let start = out.len();
    let (crc, size, gap) = body(out)?;
    let compressed = out.len() - start + gap;
    if size > u32::MAX as u64 - 1 || compressed as u64 > u32::MAX as u64 - 1 { return Err(TOO_LARGE); }
    out[offset + 14..offset + 18].copy_from_slice(&crc.to_le_bytes());
    out[offset + 18..offset + 22].copy_from_slice(&(compressed as u32).to_le_bytes());
    out[offset + 22..offset + 26].copy_from_slice(&(size as u32).to_le_bytes());
    Ok(Entry { name, offset, crc, compressed: compressed as u32, size: size as u32, gap })
}
#[inline(never)]
fn new_part(out: &mut Vec<u8>, level: u8, limit: usize, crc: u32) -> Part<'_> {
    let flags = create_comp_flags_from_zip_params(level as i32, 0, 0);
    Part { out, deflate: Box::new(CompressorOxide::new(flags)), crc, size: 0, limit, failed: 0 }
}
/// A small constant part ([Content_Types].xml, _rels/.rels) as one complete DEFLATE stream.
#[inline(never)]
fn small(out: &mut Vec<u8>, data: &[u8], level: u8, limit: usize) -> Result<(u32, u64), i32> {
    let mut p = new_part(out, level, limit, 0);
    p.feed(data, TDEFLFlush::Finish);
    if p.failed != 0 { Err(p.failed) } else { Ok((p.crc, p.size)) }
}

/// The grounded vertex coordinate exactly as `encode_stl` writes it (f64 subtraction, then f32).
#[inline]
fn coordinate(value: f32, k: usize, min_z: f64) -> f32 { (value as f64 - if k == 2 { min_z } else { 0.0 }) as f32 }

/// Size of the reusable text chunk the model text is generated into before each piece goes to the CRC and the
/// deflater. The full model text is never held: peak memory is the compressed package plus this chunk plus the
/// compressor state.
pub const CHUNK: usize = 256 * 1024;

/// ADR-0001 F2a option A: the model text is split into a FIXED number of parts, independent of how many workers
/// encode them. Parts 0-3 are the vertex list in quarters (part 0 starts with the document head, part 3 ends with
/// `</vertices><triangles>`), parts 4-7 the triangle list in quarters (part 7 ends with the document tail). Each part
/// is an independent raw DEFLATE stream ending in a sync flush (byte-aligned, non-final); only part 7 ends with the
/// final block, so the concatenation is one valid DEFLATE stream. The CRCs combine with crc32_combine. The bytes are
/// therefore the same whether one thread encodes all parts or eight workers encode one each.
/// Architect ruling 3: the part count depends ONLY on the triangle count. Below SPLIT_TRIANGLES triangles the model is
/// ONE part (a single DEFLATE stream, the c60c94c bytes); at or above it, PARTS parts.
pub const PARTS: usize = 8;
pub const SPLIT_TRIANGLES: usize = 65_536;
pub fn parts_for(triangles: usize) -> usize { if triangles < SPLIT_TRIANGLES { 1 } else { PARTS } }
/// Record range [start, end) of part `k` of `n`: with n = 1 the whole mesh (vertices and triangles); with n = PARTS,
/// vertices (points) for k < 4, triangles for k >= 4.
pub fn part_range(points: usize, triangles: usize, k: usize, n: usize) -> ((usize, usize), (usize, usize)) {
    if n == 1 { return ((0, points), (0, triangles)); }
    let q = |m: usize, j: usize| (m * j / 4, m * (j + 1) / 4);
    if k < 4 { (q(points, k), (0, 0)) } else { ((0, 0), q(triangles, k - 4)) }
}

/// Generates one part's text (prefix, vertex lines, triangle lines, suffix) in one pass, handing it to `sink` in
/// pieces of at most CHUNK bytes (no intermediate strings; `chunk` is reused). Triangles whose three indices are not
/// distinct (zero-area by construction; the core spec forbids them) are skipped; Manifold never produces them.
/// `sink` returns false to stop.
#[inline(never)]
pub fn text_stream(v: &[f32], t: &[u32], min_z: f64, prefix: &[u8], suffix: &[u8], chunk: &mut Vec<u8>, sink: &mut dyn FnMut(&[u8]) -> bool) -> Result<(), i32> {
    chunk.clear(); chunk.reserve(CHUNK);
    let cap = chunk.capacity();
    // Flush when less than one record of room is left; the buffer never reallocates.
    let flush = |chunk: &mut Vec<u8>, w: &mut W, sink: &mut dyn FnMut(&[u8]) -> bool, force: bool| -> bool {
        let used = unsafe { w.p.offset_from(chunk.as_ptr()) as usize };
        if !force && cap - used >= MAX_RECORD { return true; }
        unsafe { chunk.set_len(used); }
        let ok = used == 0 || sink(chunk);
        chunk.clear(); w.p = chunk.as_mut_ptr(); ok
    };
    unsafe {
        let mut w = W { p: chunk.as_mut_ptr() };
        w.bytes(prefix);
        for point in v.chunks_exact(3) {
            if !flush(chunk, &mut w, sink, false) { return Ok(()); }
            w.bytes(b"<vertex x=\""); if !w.f32(coordinate(point[0], 0, min_z)) { return Err(BROKEN); }
            w.bytes(b"\" y=\""); if !w.f32(coordinate(point[1], 1, min_z)) { return Err(BROKEN); }
            w.bytes(b"\" z=\""); if !w.f32(coordinate(point[2], 2, min_z)) { return Err(BROKEN); }
            w.bytes(b"\"/>\n");
        }
        for f in t.chunks_exact(3) {
            if f[0] == f[1] || f[1] == f[2] || f[0] == f[2] { continue; }
            if !flush(chunk, &mut w, sink, false) { return Ok(()); }
            w.bytes(b"<triangle v1=\""); w.uint(f[0] as u64);
            w.bytes(b"\" v2=\""); w.uint(f[1] as u64);
            w.bytes(b"\" v3=\""); w.uint(f[2] as u64);
            w.bytes(b"\"/>\n");
        }
        if !flush(chunk, &mut w, sink, false) { return Ok(()); }
        w.bytes(suffix);
        flush(chunk, &mut w, sink, true);
    }
    Ok(())
}

/// Appends part `k` of `n` (its records `v` / `t`, already sliced with `part_range`) to `out` as raw DEFLATE: sync
/// flush, or the final block for the last part. With n = 1 the part is the whole model in one stream. Returns the
/// part's text CRC-32 (continuing from `crc`) and text size.
#[inline(never)]
pub fn deflate_part(out: &mut Vec<u8>, v: &[f32], t: &[u32], min_z: f64, k: usize, n: usize, level: u8, limit: usize, crc: u32) -> Result<(u32, u64), i32> {
    let mut p = new_part(out, level, limit, crc);
    let mut chunk = Vec::new();
    {
        let mut sink = |text: &[u8]| { p.feed(text, TDEFLFlush::None); p.failed == 0 };
        if n == 1 {
            text_stream(v, &t[..0], min_z, MODEL_HEAD, MODEL_MID, &mut chunk, &mut sink)?;
            text_stream(&v[..0], t, min_z, b"", MODEL_TAIL, &mut chunk, &mut sink)?;
        } else {
            let prefix: &[u8] = if k == 0 { MODEL_HEAD } else { b"" };
            let suffix: &[u8] = match k { 3 => MODEL_MID, 7 => MODEL_TAIL, _ => b"" };
            text_stream(v, t, min_z, prefix, suffix, &mut chunk, &mut sink)?;
        }
    }
    p.feed(&[], if k == n - 1 { TDEFLFlush::Finish } else { TDEFLFlush::Sync });
    if p.failed != 0 { Err(p.failed) } else { Ok((p.crc, p.size)) }
}

// crc32_combine (zlib's x^(2^n) mod P method): CRC of A||B from crc(A), crc(B) and len(B).
const POLY: u32 = 0xEDB8_8320;
fn multmodp(a: u32, mut b: u32) -> u32 {
    let (mut m, mut p) = (1u32 << 31, 0u32);
    loop {
        if a & m != 0 { p ^= b; if a & (m - 1) == 0 { break; } }
        m >>= 1;
        b = if b & 1 != 0 { (b >> 1) ^ POLY } else { b >> 1 };
    }
    p
}
pub fn crc32_combine(crc1: u32, crc2: u32, len2: u64) -> u32 {
    // x^(8*len2) mod P, by squaring x^(2^k) for the set bits of 8*len2.
    let (mut n, mut x2k, mut p) = (len2 << 3, 1u32 << 30, 1u32 << 31);
    while n != 0 { if n & 1 != 0 { p = multmodp(x2k, p); } x2k = multmodp(x2k, x2k); n >>= 1; }
    multmodp(p, crc1) ^ crc2
}

/// The whole package around model data `body` writes (appending raw DEFLATE, returning text CRC and size).
#[inline(never)]
/// The zip around the model: returns the package and `split`, where a model body's `gap` bytes belong (the model is
/// the last local entry, so that is where its central directory starts in the returned bytes).
fn package(level: u8, limit: usize, reserve: usize, body: &mut Body) -> Result<(Vec<u8>, usize), i32> {
    let mut out = Vec::with_capacity(reserve);
    let mut entries = Vec::with_capacity(3);
    entries.push(entry(&mut out, b"[Content_Types].xml", &mut |o| small(o, CONTENT_TYPES, level, limit).map(|(c, n)| (c, n, 0)))?);
    entries.push(entry(&mut out, b"_rels/.rels", &mut |o| small(o, RELS, level, limit).map(|(c, n)| (c, n, 0)))?);
    entries.push(entry(&mut out, b"3D/3dmodel.model", body)?);
    let (split, gap) = (out.len(), entries[2].gap);
    let directory = out.len() + gap;
    for e in &entries {
        le32(&mut out, 0x0201_4b50); le16(&mut out, 20); le16(&mut out, 20); le16(&mut out, 0); le16(&mut out, 8);
        le16(&mut out, DOS_TIME); le16(&mut out, DOS_DATE); le32(&mut out, e.crc); le32(&mut out, e.compressed); le32(&mut out, e.size);
        le16(&mut out, e.name.len() as u16); le16(&mut out, 0); le16(&mut out, 0); le16(&mut out, 0); le16(&mut out, 0);
        le32(&mut out, 0); le32(&mut out, e.offset as u32);
        out.extend_from_slice(e.name);
    }
    let directory_size = out.len() + gap - directory;
    le32(&mut out, 0x0605_4b50); le16(&mut out, 0); le16(&mut out, 0);
    le16(&mut out, entries.len() as u16); le16(&mut out, entries.len() as u16);
    le32(&mut out, directory_size as u32); le32(&mut out, directory as u32); le16(&mut out, 0);
    if out.len() + gap > limit { return Err(TOO_LARGE); }
    Ok((out, split))
}

pub fn min_z(v: &[f32], ground: bool) -> f64 { if ground { v.chunks_exact(3).map(|p| p[2] as f64).fold(f64::INFINITY, f64::min) } else { 0.0 } }

/// Builds the whole 3MF package on this thread: all parts_for(triangles) parts in order straight into the package buffer (the reference
/// bytes; also the fallback when workers are unavailable). `v`/`t` must already be validated.
pub fn encode(v: &[f32], t: &[u32], ground: bool, level: u8, limit: usize) -> Result<Vec<u8>, i32> {
    let mz = min_z(v, ground);
    let (points, tris) = (v.len() / 3, t.len() / 3);
    // The package is about 0.28x the binary STL (50 B per triangle) on typical meshes; reserve a bit more than that
    // so the output buffer normally never reallocates (a doubling would briefly need 3x its size).
    package(level, limit, tris * 16 + 4096, &mut |out| {
        let (mut crc, mut size, n) = (0u32, 0u64, parts_for(tris));
        for k in 0..n {
            let ((va, vb), (ta, tb)) = part_range(points, tris, k, n);
            let (c, m) = deflate_part(out, &v[va * 3..vb * 3], &t[ta * 3..tb * 3], mz, k, n, level, limit, crc)?;
            crc = c; size += m;
        }
        Ok((crc, size, 0))
    }).map(|(out, _)| out)
}

/// The package for PARTS parts encoded elsewhere, WITHOUT their data: `data_len` is the length of their raw DEFLATE
/// concatenated in order, `parts` their (text CRC-32, text size). Returns the frame (about 1 KB) and `split`: the
/// package is frame[..split] + the parts' data + frame[split..], identical bytes to `encode` for the same parts. So
/// the joining worker never holds the parts and the package together in wasm memory.
pub fn frame(data_len: usize, parts: &[(u32, u64)], level: u8, limit: usize) -> Result<(Vec<u8>, usize), i32> {
    if parts.len() != 1 && parts.len() != PARTS { return Err(BROKEN); }
    package(level, limit, 1024, &mut |_| {
        let (c, n) = parts.iter().fold((0u32, 0u64), |(c, n), &(pc, pn)| (crc32_combine(c, pc, pn), n + pn));
        Ok((c, n, data_len))
    })
}
/// `frame` with the data spliced in (tests).
#[cfg(test)]
pub fn assemble(data: &[u8], parts: &[(u32, u64)], level: u8, limit: usize) -> Result<Vec<u8>, i32> {
    let (f, split) = frame(data.len(), parts, level, limit)?;
    Ok([&f[..split], data, &f[split..]].concat())
}

/// ADR-0001 F2a speed gate: stage-by-stage timing hooks (feature `profile`, never shipped).
#[cfg(feature = "profile")]
pub mod profile {
    use super::*;
    static mut XML: Vec<u8> = Vec::new();
    #[allow(static_mut_refs)]
    fn xml() -> &'static mut Vec<u8> { unsafe { &mut XML } }
    /// 0: min_z only; 1: vertices text; 2: triangles text; 3: whole model XML, collected into one buffer (kept for the
    /// CRC/deflate hooks; the encoder itself streams).
    #[no_mangle] pub unsafe extern "C" fn prof_xml(vp: *const f32, nv: usize, tp: *const u32, nt: usize, stage: u32) -> usize {
        let v = core::slice::from_raw_parts(vp, nv); let t = core::slice::from_raw_parts(tp, nt);
        let min_z = v.chunks_exact(3).map(|p| p[2] as f64).fold(f64::INFINITY, f64::min);
        if stage == 0 { return min_z as usize; }
        let (v, t) = match stage { 1 => (v, &t[..0]), 2 => (&v[..0], t), _ => (v, t) };
        let mut all = Vec::new(); let mut chunk = Vec::new();
        let _ = text_stream(v, &t[..0], min_z, MODEL_HEAD, MODEL_MID, &mut chunk, &mut |text| { all.extend_from_slice(text); true });
        let _ = text_stream(&v[..0], t, min_z, b"", MODEL_TAIL, &mut chunk, &mut |text| { all.extend_from_slice(text); true });
        *xml() = all;
        xml().len()
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
    #[test] fn crc_combine_matches_direct() {
        let data: Vec<u8> = (0..5000u32).map(|i| (i * 31 + i / 7) as u8).collect();
        for cut in [0, 1, 7, 100, 2500, 4999, 5000] {
            assert_eq!(crc32_combine(crc32(0, &data[..cut]), crc32(0, &data[cut..]), (data.len() - cut) as u64), crc32(0, &data));
        }
    }
    fn sphere_like(n: usize) -> (Vec<f32>, Vec<u32>) {
        // A closed fan: n rim points plus two poles (valid indices, varied decimals).
        let mut v = vec![0., 0., 1.37, 0., 0., -2.11];
        for i in 0..n { let a = i as f32 * 0.7310; v.extend_from_slice(&[a.cos() * 3.3, a.sin() * 3.3, (i % 5) as f32 * 0.013]); }
        let mut t = vec![];
        for i in 0..n as u32 { let (a, b) = (2 + i, 2 + (i + 1) % n as u32); t.extend_from_slice(&[0, a, b, 1, b, a]); }
        (v, t)
    }
    #[test] fn parts_assembled_elsewhere_give_identical_bytes() {
        for n in [3usize, 5, 9, 32_767, 32_768, 40_000] {
            let (v, t) = sphere_like(n);
            for ground in [true, false] {
                let reference = encode(&v, &t, ground, 2, usize::MAX).unwrap();
                let mz = min_z(&v, ground);
                let (mut data, mut meta) = (vec![], vec![]);
                let parts = parts_for(t.len() / 3);
                assert_eq!(parts, if 2 * n < 65_536 { 1 } else { 8 });
                for k in 0..parts {
                    let ((va, vb), (ta, tb)) = part_range(v.len() / 3, t.len() / 3, k, parts);
                    let mut out = vec![];
                    meta.push(deflate_part(&mut out, &v[va * 3..vb * 3], &t[ta * 3..tb * 3], mz, k, parts, 2, usize::MAX, 0).unwrap());
                    data.extend_from_slice(&out);
                }
                assert_eq!(assemble(&data, &meta, 2, usize::MAX).unwrap(), reference, "n {n} ground {ground}");
                let zip = unzip(&reference);
                let model = String::from_utf8(zip.data[2].clone()).unwrap();
                assert_eq!(model.matches("<vertex ").count(), n + 2); assert_eq!(model.matches("<triangle ").count(), 2 * n);
                assert!(model.starts_with("<?xml") && model.ends_with("</model>\n") && model.contains("</vertices>\n<triangles>\n<triangle "));
            }
        }
    }
    /// Below 65,536 triangles: one part, the same bytes as a single uninterrupted DEFLATE stream of the whole model
    /// (the c60c94c encoder); 65,535 -> 1 part, 65,536 -> 8 parts.
    #[test] fn split_threshold_and_single_stream_bytes() {
        assert_eq!((parts_for(0), parts_for(65_535), parts_for(65_536), parts_for(1 << 20)), (1, 1, 8, 8));
        for extra in [false, true] {
            let (v, mut t) = sphere_like(32_767); // 65,534 triangles
            t.extend_from_slice(&[0, 2, 3]); if extra { t.extend_from_slice(&[1, 3, 2]); }
            let pkg = encode(&v, &t, true, 2, usize::MAX).unwrap();
            let model = unzip(&pkg).data[2].clone();
            let mut d = CompressorOxide::new(create_comp_flags_from_zip_params(2, 0, 0)); let mut raw = vec![];
            compress_to_output(&mut d, &model, TDEFLFlush::Finish, |b| { raw.extend_from_slice(b); true });
            let found = pkg.windows(raw.len()).any(|w| w == &raw[..]);
            assert_eq!(found, !extra, "65,535 triangles is one stream; 65,536 is split");
        }
    }
    #[test] fn degenerate_index_triangles_are_skipped_and_limit_is_enforced() {
        let (v, mut t) = cube(); t.extend_from_slice(&[1, 1, 2]);
        let model = String::from_utf8(unzip(&encode(&v, &t, true, 6, usize::MAX).unwrap()).data[2].clone()).unwrap();
        assert_eq!(model.matches("<triangle ").count(), 12);
        assert_eq!(encode(&v, &t, true, 6, 200).unwrap_err(), TOO_LARGE);
    }
}
