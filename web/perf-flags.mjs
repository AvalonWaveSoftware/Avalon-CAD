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
