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
// WS6: cache tessellated fillet / faces-resolution meshes by (geometry key, tolerance) so moves and re-exports skip
// OCCT BRepMesh. false re-tessellates on every build.
export const FILLET_MESH_CACHE=true;
// WS7: model/job assembly in JS (web/js-engine.mjs) instead of Pyodide. Build-time as well: build-web.mjs ships
// app/assets/python only when this is false (ADR: -12.29 MB). false restores the Pyodide engine.
export const JS_ENGINE=true;
// WS8: startup pipeline. The worker compiles Manifold, OCCT and the Rust core concurrently (streaming compile) and
// requests the wasm with the app's ?v= token; the desktop protocol streams files and marks ?v= assets immutable
// (code cache); Android serves them immutable with the WebView cache on (LOAD_DEFAULT) and the APK stores *.wasm and
// *.zip uncompressed. build-web.mjs mirrors this flag into app/assets/perf-flags.json for desktop/main.cjs and
// MainActivity. false restores sequential init, no-store responses, LOAD_NO_CACHE and deflated assets.
export const PARALLEL_INIT=true;
// WS9: bundle split and OCCT off the startup path. The UI imports only UI-safe modules (kernel-ui.mjs), so main.js
// carries no replicad/OCCT glue; the dead 'conjoin' job is gone. The worker starts with Manifold, JS and Rust only and
// begins the OCCT compile after the first frame (or at the first job that needs it); only jobs that can touch OCCT
// wait for it. false restores the single bundle, the conjoin job and OCCT in the startup path (build-web.mjs aliases
// kernel-ui.mjs back to kernel.mjs for the UI).
export const BUNDLE_SPLIT=true;
// WS10 (ADR v2): indexed display mesh. Rust prepare_indexed shares a vertex between corners whose position and normal
// bits are identical (the same crease rule and normals as prepare_mesh); the merged preview's display is assembled from
// per-part displays (unchanged parts reuse theirs exactly); the UI uploads only the changed ranges of the display
// buffers. false restores the per-corner arrays.
export const INDEXED_DISPLAY=true;
// WS11 (ADR v2): Undo/Redo keep structurally shared, frozen project snapshots (web/history.mjs) and restore them without
// re-validating; autosave runs in an idle callback and skips writing an unchanged project. Storage key and JSON are
// unchanged. false restores the JSON-string history and the plain timer autosave.
export const SHARED_HISTORY=true;
// WS12 (ADR v2): Android export hand-off in a few natively encoded chunks (see saveFile in main.mjs). The ADR's
// WebMessagePort ArrayBuffer transfer needs androidx.webkit, which this build does not have; the Java bridge is unchanged.
export const BINARY_EXPORT=true;
// WS13 (ADR v2): build-time only. build-web.mjs ships OCCT (cad-kernel.wasm) and Manifold (manifold.wasm) after
// binaryen wasm-opt -Oz (pinned devDependency; output cached in build/wasm-opt by input hash). Parity and pixel suites
// are identical with either binary. false ships the unmodified npm binaries.
export const WASM_OPT=true;
// WS14 (ADR v2, Sean's ruling 2026-10-17): OCCT runs in a sidecar worker (worker.js started again as a nested worker
// named 'occt'), so a first-time fillet or topology no longer blocks the geometry worker. The geometry worker answers
// OCCT queries from its caches and asks the sidecar on a miss; a preview waiting for a new fillet mesh may first show
// that part without the fillet (display only), then the final result exactly as before. false keeps OCCT in the
// geometry worker.
// ADR occt-sidecar-desktop-web: platform-aware. Off in the Android WebView (2.7.1 behaviour): in the APK the nested
// 'occt' worker never starts (its worker.js load fails in Android System WebView), so every OCCT job would fail with
// 'The modeling engine could not start'. On for Electron desktop and desktop web browsers.
// The Android build marks itself with the Android JavaScript bridge (window.Android) that MainActivity installs before the page loads
// (MainActivity addJavascriptInterface); no user-agent test. Workers have no bridge, so build-web.mjs fixes the flag
// at build time per worker bundle: worker.js is built with OCCT_SIDECAR=false (byte-identical to 2.7.1; the Android
// app starts it) and worker-sidecar.js with true (desktop and web start it, and it starts itself again as the sidecar).
export const OCCT_SIDECAR=!globalThis.Android;

// Android main-thread watchdog; OCCT heap pre-checks are deliberately excluded.
export const OCCT_JOB_BUDGET_MS=20000;
