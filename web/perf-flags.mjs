// Build-time kill-switches for the performance overhaul (ADR v2 §7). Setting a flag to false restores the
// previous code path, which is kept until the release after next.
export const OCCT_SCOPE=true; // WS1: scoped disposal of OCCT temporaries in topology extraction
// WS1: OCCT shape-cache capacity (legacy 20). OCCT's own primitive builders (BRepPrimAPI_MakeBox ≈10 KB, MakeCylinder
// ≈1.4 KB per build) leak inside the kernel even when every wrapper is deleted, so with 21-100 distinct objects the
// legacy 20-entry LRU rebuilt every object on every preview and the heap grew without bound. Holding one entry per
// object (100-object project limit, plus headroom) makes a move reuse the cached solids; 20 restores the old path.
export const OCCT_CACHE_ENTRIES=128;
// WS2: topology as a content-addressed service. Topology is cached by geometry hash (32 MB cap) apart from the B-rep
// LRU (64 entries plus a byte cap), parts carry topologyHash, and the worker ships a packed body only for hashes the
// UI has not acknowledged. false restores per-preview structuredClone and the shared OCCT_CACHE_ENTRIES cache.
export const TOPOLOGY_SERVICE=true;
// WS3: persistent render resources. Display, pick, wire, selection and tool materials are created once per parameter
// set and reused (same parameters → same program and pixels), snap/handle spheres share one geometry per radius,
// pick meshes skip vertex normals, and same-length buffers are updated in place. false restores per-edit creation.
export const PERSISTENT_GL=true;
// WS4: render on demand. Frames are drawn only after something changed (controls, scene graph, model, resize,
// visibility) and while OrbitControls damping is still moving the camera; idle costs no rAF and no draws.
// false restores the unconditional setAnimationLoop.
export const RENDER_ON_DEMAND=true;
// WS5: incremental engine. The worker caches each object's local solid by content + tolerance (reused only while
// Manifold run IDs keep full-rebuild order), its placed and floored solid by transform, and per-part mesh data, so an
// edit rebuilds only what changed. Parts, checks and exports are byte-identical to a full rebuild. false restores
// the full rebuild on every job.
export const ENGINE_CACHE=true;
// WS5 sub-flag: how a preview of pairwise-disjoint solids is merged. Ruling by Sean (2026-10-16): 'concat' (fast merge)
// is accepted, with its 1-3 px edge differences on distinct-30@phone and distinct-100@phone (tests/pixels.mjs
// ACCEPTED_DIFFS); 'compose' is 0 px but misses the thread-rod budget. Exports and saves always use the full union.
// 'compose' = Manifold compose (full-union triangle order); 'concat' = JS concatenation of cached part meshes; false = full union.
export const ENGINE_CACHE_MERGE='concat';
