# Changelog

All notable changes to AvalonCad are recorded here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow the app's release numbers. Newest releases are listed first.

## [Unreleased]

### Added
- **New shapes:** Torus and Triangular prism in Primitive Objects; Advanced shapes (Tetrahedron, Octahedron, Decahedron (d10), Dodecahedron, Icosahedron); Letters, numbers & symbols (94 tiles, each adds a letter object such as "Letter A" or "Symbol @" that moves and resizes like any shape; Roboto Bold, SIL OFL 1.1, licence shipped in THIRD_PARTY_NOTICES).

### Compatibility
- Project, backup and prefab files that contain any of the new shapes cannot be opened by AvalonCad 2.7.1 or older; those versions report "Project contains an invalid object." Files without the new shapes are unchanged and still open in older versions.

## [2.7.1] - 2026-10-17

### Fixed
- **Android: modeling engine failed to start.** In the Android app the separate OCCT worker introduced in 2.7.0 never started, so every OCCT job (fillets, rounds and similar) failed with "The modeling engine could not start". The OCCT sidecar worker is turned off for now and OCCT runs in the geometry worker again, as in 2.6.1.

## [2.7.0] - 2026-10-17

### Changed
- **Performance overhaul.** The modeling engine and renderer were reworked for speed while keeping exported STLs, saves and autosaves byte-identical to 2.6.1 (660 export/save jobs and 311 STLs compared).
  - **Faster startup.** On desktop, the time from launch to a ready modeling engine drops from about 2.3 s to about 0.6–0.7 s. Engines start in parallel and the main bundle is split and smaller (main.js about 22 % smaller; app assets about 36 % smaller).
  - **Render on demand.** The 3D view only redraws when something changes, so idle CPU use on desktop drops from about 190 % to under 1 %.
  - **Faster first fillet.** The first fillet after launch on a phone takes about 0.3 s instead of 1.5–2 s.
  - **Responsive editing during fillets.** OCCT modeling now runs in its own worker, so moving a shape while a large fillet is being built shows the result in about 11 ms instead of waiting about 10 s for the fillet.
  - **Lower memory use.** A memory leak in the OCCT engine was fixed (no heap growth over 200 moves, previously more than 1 GB), and desktop memory after load drops from about 830 MB to about 740–780 MB.
  - **Faster undo.** Undo uses shared history: undo on a 20k-triangle import takes about 1.4 ms instead of 8.4 ms.
  - Indexed display meshes, a cached engine, a topology service and a new JavaScript engine reduce the per-edit work. WebAssembly is optimized at build time.
  - **Android export** writes large STL files in chunks.

### Compatibility
- The project format is unchanged. Projects and autosaves from 2.6.1 open as before, and 2.6.1 can open projects saved by this version.

## [2.6.1] - 2026-10-13

### Fixed
- **Desktop help line.** The help line is now styled and placed to the right of the Objects button, so it no longer overlaps the selection bar.

## [2.6.0] - 2026-10-13

### Added
- **Objects panel.** A ☰ button in the corner of the 3D view, showing the object count, opens a list of every shape grouped by layer. Each row shows whether the shape adds or subtracts material and has a show/hide eye and a properties button. Selection stays in sync both ways: tap a row to highlight the shape in 3D, or tap a shape in 3D to highlight and scroll to its row. Opening the panel never rebuilds the model.
- **Multi-select.** Long-press a shape or row (phone), or Ctrl/Shift-click (desktop), to select several shapes at once.
- **Merge.** Join two or more selected visible shapes on the same layer into one physically connected solid. Merged material fills overlapping cutouts by default; **Keep existing holes from overlapping Cutout shapes** keeps those holes. Separated pieces can be bridged with connecting bars of a chosen diameter. Merge is available from the selection bar and the Objects panel.
- **Create Prefab** from the current selection, directly from the Objects panel.
- **Automatic project upgrade.** Projects and autosaves from AvalonCad 2.4 and earlier (project format v1) are converted to the new format (v2) when they are opened, imported or restored. Old Subtract results become regular solids plus Cutout shapes that reproduce the same geometry. Before the old autosave can be overwritten, it is copied to a backup (`tristancad.autosave.v1-backup`). If that copy cannot be made, autosave pauses (an unsaved marker is shown) so the original is never lost. Any startup warnings are shown together.

### Changed
- The editing modes are now **Select, Move, Stretch and Round**. The dock has **Add, Edit and Export STL**.
- Cutout shapes remain the way to remove material, and their effect stays limited to their own layer.

### Removed
- The **Add / Subtract** mode, including the ordered cutter/target picker, Swap, and "Keep the cutter as a disabled reference shape". Use Merge to join shapes and Cutout shapes to remove material.
- The **Objects** button in the bottom dock, replaced by the Objects panel.

### Compatibility
- Projects saved by this version use project format v2 and need this version or later. Older projects open automatically.

## [2.5.0] - 2026-10-12

### Added
- **Mac desktop app:** an Apple silicon (arm64) AvalonCad.app for macOS 13+, with native file dialogs, menu shortcuts and mouse controls.
- **Desktop pan:** right-drag (and Shift/Cmd/Ctrl-drag) pans the view in the desktop builds; touch gestures on Android are unchanged.
- **Linux desktop packages:** an Electron wrapper packaged as `.rpm` and as an Arch Linux `.pkg.tar.zst` (pacman). Both install to `/opt/Avalon CAD` with an `avalon-cad` launcher, desktop entry and icons, and run fully offline.
- Platform-aware help text for desktop controls.

### Fixed
- **Linux desktop fixes:** the RPM and Arch packages share the updated Electron shell (restored startup, stable local storage location, isolation headers).

### Changed
- Android version code increases to 18; the APK keeps the same app identity and signing key.
- `build-apk.sh` reads the signing password from `AVALONCAD_KEYSTORE_PASS` and refuses to silently generate a new signing key when `tools/signing.p12` is missing (`AVALON_ALLOW_NEW_KEY=1` opts in deliberately).
- The project is licensed under BSD 3-Clause.

### Mac app details (from the 2.5.0 README)

Download **AvalonCad-2.5.0-Mac-AppleSilicon.zip**, double-click the ZIP to extract it, move **AvalonCad.app** to **Applications**, and open it from Applications or Launchpad. You can drag the app to your Dock. This is a complete Apple silicon arm64 app with its runtime bundled; Node, Python, Rust and Xcode do not need to be installed to use it. macOS 13 or later is required. The Android APK remains a separate installer.

This personal build has an **ad-hoc local signature** and is **not Apple-notarized or Developer ID signed**. After attempting to open it, macOS may block it as an unidentified developer. For this specific app, use **System Settings → Privacy & Security → Open Anyway**, then confirm Open. Apple’s instructions are at https://support.apple.com/en-us/102445. Do not change the system-wide Gatekeeper setting. Actual installation and execution on an M4 Mac have not been tested here.

The Mac app retains the current CAD features: Primitive Objects, sketches, prefabs, layered Add/Subtract, roundovers, face resolution, threaded parts with Imperial defaults, bottom-center 0,0,0 placement, the optional Z=0 build-plane constraint and high-resolution STL export. All modeling stays local. The build plane is never exported.

**Mac controls:** left-drag to orbit; Shift-drag, Ctrl/Cmd-drag or right-drag to pan; scroll or pinch to zoom. In Move, Stretch or Round, drag the selected shape to edit it. Click a face or edge to select it, double-click a face to select the whole shape and triple-click an edge for all edges. The controls in the window retain the familiar phone layout with a desktop-sized inspector.

**Keyboard/menu shortcuts:** Cmd+N starts a blank project with the existing replacement confirmation; Cmd+O opens a .tcad/.avprefab/STL; Cmd+S saves a named project on this Mac; Cmd+Shift+S exports an editable .tcad backup; Cmd+E opens STL export; Cmd+Z and Cmd+Shift+Z undo/redo model changes (text fields keep text undo); Cmd+Shift+A opens Primitive Objects; Cmd+0 fits the view; Escape closes a panel or clears selection. When not entering text, A adds a shape, F fits the view and V clears selections.

Export a **.tcad** file on your Samsung, transfer it to your Mac, and open it using File → Open or Cmd+O. For editable assemblies, transfer .avprefab files. STL imports keep their mesh resolution and open as placement drafts that require Apply. Projects and prefabs autosave locally and persist when the .app is replaced. Before the window closes, the current project is saved; an unfinished drag saves its last committed state. Export .tcad/.avprefab backups for portable copies. Mac local projects are stored independently from phone projects.

The Mac app uses bundled Electron 44.7.0 with a standard secure local asset protocol, isolated preload and native file dialogs. Internet requests and new web windows are blocked. The viewer has no Node integration. Save/open handlers accept bounded model bytes and explicit dialog selections, with a 50 MB file limit and atomic file replacement. The Mac build contains no Android signing key.

Desktop validation covers file byte transport and bounds, native-shell protocol/IPC handlers with Electron objects mocked, Mac menu definitions, desktop Chromium UI using a test file bridge, actual local Python/Rust geometry, origin/plane/Imperial settings, mouse and keyboard behavior, saved projects, STL export and blocked Internet fetch. The app's arm64 Mach-O code-page hashes, signed resource seals, bundle identifiers, executable permissions and offline assets are checked. These checks do not substitute for Apple's on-device codesign/Gatekeeper checks or a physical Mac launch test.

To rebuild on a Mac, install Node.js 24+ for development, run **npm ci**, then **npm run build:mac**. It uses the already-bundled Rust geometry module and builds the web assets. The build downloads a pinned Electron runtime and verifies its SHA-256, packages an arm64 .app and applies a local signature using macOS codesign. For cross-platform signing, set AVALON_RCODESIGN to an apple-codesign executable and AVALON_ELECTRON_CACHE to a folder containing the verified runtime ZIP. Official desktop references: https://www.electronjs.org/docs/latest/api/protocol and https://www.electronjs.org/docs/latest/tutorial/security.

## [2.4.0]

### Added

Every new Primitive Object, duplicated object, imported STL, prefab and custom sketch starts at **X=0, Y=0, Z=0** using the bottom center of its actual geometry. Changing the dimensions or rotation in its placement panel keeps that bottom-center point. Apply first, then move or align it. Selection and Snap On no longer change where a new object starts. Closed drafts still add nothing.

The **Build plane** switch is visible above the editing modes. On prevents enabled solids and cutouts from extending below **Z=0**, including after movement, resizing, rotation or alignment. Z dragging stops at the floor immediately; supported downward face drags stop there too. Geometry is positioned above the plane rather than clipped. Exact dimension edits that would extend below the plane raise the edited object while keeping its requested dimensions. Off permits negative Z. X/Y coordinates remain unrestricted on either side of the origin.

The switch defaults On in a new blank project, persists in autosave, saved projects and .tcad backups, and supports Undo/Redo. Existing projects without the setting open with it Off, preserving their saved geometry. Turning it On raises the entire existing assembly by one common offset if required, preserving relative placement and subtraction alignment. The lowest enabled shape, including a cutout, determines this offset. Turning it Off keeps the current positions.

The displayed plane is a visual reference and a Z=0 constraint, never a model object. It is **never included in STL**, saved assemblies or prefabs. With Build plane On, model geometry exports at or above Z=0 even if the separate “Place the lowest point on Z=0 for printing” export checkbox is unchecked. With it Off, uncheck that export checkbox to retain negative Z in STL. STL still uses millimeters.

New **All-thread screw** and **Threaded tube** drafts default to **Imperial, 1/4-20**. Stored thread objects retain their own units and dimensions; Metric remains available. Local Python and Rust processing and the prior overlap-shading correction are retained.

### Install notes (from the 2.4/2.5 README)

Download **AvalonCad-2.5.0.apk**, open it from **My Files → Downloads**, and choose **Update**. Install it over the existing app without uninstalling first. It is also a complete installer for a fresh installation. Uninstalling deletes local projects and settings, so export .tcad backups first if you choose to uninstall. This APK uses the same app identity and signing key, so Android can update the app while keeping its local projects. Export a .tcad backup of important projects from the project menu whenever you want an independent copy.

The update retains triple-tap selection of all sharp edges, double-tap face/whole-shape selection, uniform roundovers, independent object smoothness, matte shading, center snapping, overlap filling, addition/subtraction and high-resolution STL export. The project format and local storage keys are unchanged. Its resource table is checked for uncompressed storage and 4-byte alignment, and its signing certificate matches the previous APK. You confirmed that the original app runs on your S26 Ultra; this rebuild still needs confirmation on that physical phone.

### Validation

Build-plane checks exercise origin placement for every rotated primitive, odd-sided facets, offset STL meshes and subtracted prefab assemblies, floor-constrained and unrestricted geometry/STL, preserved volumes and whole-assembly offsets, Imperial defaults, selection-independent drafts, floor-aware moves and resizing, toggles, legacy projects, Undo/Redo and persistence. The plane adds no model triangles to STL. The APK compiles against Android API 35. Its signature, ZIP alignment, required runtime assets and Android resource-table packaging verify. Its signing certificate matches the previous APK and its version code increases to 18. Seventeen focused overlap checks reproduce the bent-face shading and verify isolated surface normals, exact position matching across thin gaps, flat/faceted faces, smooth curves, movement, Addition/Subtraction, identical/angled overlaps, fillets, prefabs, layers, unchanged vertex coordinates and exact Maximum STL parity. New primitive/prefab checks verify exact planar volumes, face and edge topology, closed oriented meshes, real roundovers, high-quality STL, independent copies, optional subtractions, layer-preserving assemblies, portable files and native tube bores. UI checks cover Apply-only creation and all cancellation paths, one-step Undo/Redo, duplicate/STL/prefab drafts, collection saving, import/export and safe component separation. Layer geometry checks verify legacy migration, overlapping layer protection, multiple subtraction targets, partial/complete target removal, per-target cutout exclusions, closed meshes and Python/Rust STL output. Layer interaction checks cover creation, rename, moving objects, active-layer creation, selection isolation, multi-target/all-layer subtraction, Undo/Redo and editable backups. Regression tests cover 107 existing geometry cases and 34 local runtime cases, plus seven Rust unit tests. Thirty thread cases verify closed oriented meshes, internal through-bores, metric/inch equivalence, both thread hands, mating clearance, fixed pitch and phase at both stretched ends, Maximum-quality surface deviation, Add/Subtract, validation and editable backups. The new checks run the actual bundled CPython 3.13.2 and Rust WebAssembly: they verify geometry parity, per-object normals, mixed smooth/faceted parts, all-edge fillets, cuts, overlap fills, invalid inputs and repeated jobs. Rust STL output matches the previous exporter byte for byte at the same quality, including grounded exports.

Interaction tests now send all model jobs through Python and Rust. They exercise ray selection, face and whole-shape highlighting, triple-tap selection of all twelve box edges, uniform roundovers, dragging with measurements, center snapping, Add/Subtract, hidden sphere selection, overlapping cuts and fills, independent same-type object settings, Undo, project backups/imports, native STL chunks and autosave. Their screen drawing is stubbed. A separate mobile-sized Chromium 153 integration check uses actual WebGL, the restrictive app CSP and the bundled module worker. It successfully starts Python/Rust, selects a face, triple-taps all box edges, applies a real roundover, exports Rust STL and loads the mounting-plate template. All app asset requests stayed local, with external requests blocked. The browser also checks layer creation, layer-local subtraction of multiple parts, active-layer ray selection and protected geometry, plus the screw/tube panels, imperial presets and fractional dimensions, fixed-pitch tube stretching, threaded STL, one opaque solid during movement and complete deselection. The browser also verifies draft cancellation, inclined-plane and pyramid face counts, prefab saving/export/insertion, Undo/Redo, collection and project persistence after reload, and Maximum-quality assembly STL. The overlap case also passes in actual WebGL before and after Addition, with planar face normals, volume and primitive dimensions preserved. The browser also verifies origin drafts, both build-plane switch states, plane-free STL, Imperial defaults and custom-sketch placement at 0,0,0. Physical Samsung testing remains outstanding.

## [2.3.0]

### Added

- **Apply-only creation:** choosing a Primitive Object, duplicating an object, inserting a prefab or importing an STL opens a draft. Only **Apply & add object** commits it. Close, Cancel, the shaded background and Android Back discard an unapplied draft without changing your project, autosave or Undo history. Applying a new object creates one Undo step.
- **Primitive Objects:** the Add menu uses this name for the premade shapes. It includes a new **Inclined plane** and **Pyramid**, with editable width X, depth Y and height Z. The inclined plane is a solid triangular wedge whose slope rises along local +X. The pyramid has a rectangular base and a centered apex. Both have five planar faces, support stretching and edge roundovers, and work with Add/Subtract and STL export. Smooth resolution keeps these planar faces flat.
- **Prefabs:** save assemblies as reusable shapes in a collection on your device. Retain subtractions or save the positive component shapes. Each insertion is an independent draft, with its own geometry embedded in the project. These new primitive and prefab types require **AvalonCad 2.3.0 or later**.

#### Save and use prefabs

Tap **Add → Prefabs → Save an assembly as a prefab**, or select an existing object and use **Edit → Save as prefab**. Name it and choose the selected object, shapes selected in Add/Subtract, the active layer, or the entire model. Disabled components are omitted. When saving one selected solid, its enabled layer cutouts are included so its saved appearance matches the model. Saving a selected Cutout itself saves its positive shape for reuse.

**Include subtractions and cutouts** starts checked. It preserves explicit Subtract operations, cutout objects, roundovers, layer-local cuts and filled-overlap results. Uncheck it to retain the positive component shapes before their Boolean subtractions; native tube bores and thread profiles stay part of their primitives. Compound roundovers are cleared when removing a subtraction changes their edge layout. Saving a prefab leaves the open project unchanged; Apply edits before saving them.

Tap a saved prefab to open its placement draft, then tap **Apply & add object**. Every copy has independent component IDs and parameters. Editing, deleting or replacing a saved collection entry does not change copies already inserted into projects. Move, rotate, snap and combine prefabs like other objects. Prefabs keep their original internal layer rules while the whole prefab belongs to the current outer project layer. Disconnected components are allowed and export as separate closed shells.

Use **Edit → Separate components** to recover editable component shapes. A prefab's internal layers are restored into fresh project layers so its cutouts cannot cut unrelated existing objects. Nested prefabs remain reusable components. Undo an assembly stretch before separating it; separate threaded components before changing their length to keep thread pitch fixed.

Use the export button beside a saved prefab for a portable **.avprefab** file. Import one through **Add → Prefabs → Import .avprefab** or the Open file action. Imports with the same prefab ID replace that collection entry; existing project copies remain independent. Editable **.tcad** backups embed all inserted prefab definitions and open without the collection. Saved prefabs persist across projects and app updates, but clearing app data or uninstalling removes the local collection. Export .avprefab files to keep backups. The limit is 100 saved prefabs, 100 project objects and 100 layers, subject to available device storage and memory.

## [2.2.0]

### Added

- **Layers:** create and rename layers with the layer button at the top. Existing projects open on **Layer 1**. New shapes, sketches and STL imports belong to the active layer. **Edit → Layer** moves an existing object.
- **Local cuts:** Cutout shapes affect every overlapping solid on their own layer, leaving other layers intact. Layer results are added together for the final preview and STL. Layers are groups of shapes, not fixed Z heights; they can overlap anywhere in 3D.
- **Multiple subtraction targets:** choose a cutter first, then any number of parts on that layer. Or select just the cutter and press Subtract to target every enabled solid on the active layer. The confirmation lists all affected parts.
- **Layer selection:** tapping and the Boolean picker use the active layer. Other layers stay visible as references. The Objects list shows each object's layer and activates it when selected.
- Undo/Redo, autosave and .tcad exports preserve layer names, assignments and active layer. Projects with multiple layers require **AvalonCad 2.2.0 or later** for correct cut scope.

## [2.1.1]

### Added

Added **1/2-28** and **5/8-24** to the Imperial common-size presets for both All-thread screw and Threaded tube. Choose **Thread units → Imperial**, then choose the size under **Common size or custom**. The first number is nominal diameter in inches and the second is threads per inch; length remains separately adjustable.

## [2.1.0]

### Changed

Movement uses a single opaque solid, rebuilt in the background as you drag. The translucent duplicate preview has been removed. Selection overlays are cleared during dragging so the old outline does not remain in its previous position. Heavy jobs can still make the solid preview lag behind your finger until the worker finishes.

Press **Clear** beside Edit dimensions to deselect every shape, face and edge, clear Add/Subtract selections and remove highlights, center markers, handles and live measurements. It returns to Select mode and keeps the model unchanged. Tapping empty space in Select also clears selection. You can tap a shape or use Objects to select it again. The optional wireframe view has its own toggle.

### Added

#### All-thread screws and internally threaded tubes

Tap **Add → All-thread screw** for a fully threaded rod without a head. Tap **Add → Threaded tube** for a cylindrical sleeve with a through-bore threaded on the inside. These are actual single-start helical solids, included in STL; they support rotation, movement, center snapping, addition and subtraction.

New threaded objects default to Imperial. In Edit, choose **Metric** for dimensions in millimeters and pitch in millimeters per turn, or **Imperial** for dimensions in inches and **TPI** (threads per inch). Switching units converts the current values without changing the part. You can choose common metric and inch presets, or enter custom nominal diameter, pitch/TPI, length and right-hand or left-hand direction. Imperial dimensions accept decimals or fractions such as 1/4, 3/8 and 1 1/2. Tube parameters also include outer diameter.

The metric presets run from M3 × 0.5 to M20 × 2.5. Inch presets include #6-32, #8-32, #10-24/32, 1/4-20/28, 5/16-18, 3/8-16/24, 1/2-13/20/28, 5/8-11/24 and 3/4-10. Custom values are not restricted to those sizes. For example, a 1/4-20 screw that is 2 inches long has a 6.35 mm nominal diameter, 1.27 mm pitch and 40 turns. Thread-unit settings belong to each object independently. The rest of the workspace, positions and STL continue to use millimeters.

**Radial fit clearance** decreases the screw radius or increases the threaded bore radius by the specified amount. The screw starts at zero; the tube starts at 0.15 mm. Zero preserves the nominal profile. The tube's outer diameter must leave material outside the largest bore radius, including clearance. Printed fit depends on your printer and material; adjust the clearance using a small fit sample.

Choose Stretch and pull an **end face**, or select an end face and use **Set size**. Threaded parts stretch only along their local Z/length axis. Their diameter, direction and pitch stay fixed as turns are added or removed. The opposite end stays in place. Length changes from either end preserve the phase of the existing overlapping threads. Live measurements show length, turn count and pitch/TPI. Set size uses the threaded object's chosen units. Change diameter or pitch in Edit.

After Add/Subtract, the object is a combined solid. **Separate components** before changing a threaded component's length. Scaling a combined object containing threads is blocked to preserve pitch. These threaded surfaces use mesh geometry rather than the CAD edge-fillet kernel; their edges cannot use Round. Saved .tcad files retain thread parameters and regenerate the geometry on load/export. Version 2.1.0 or later is required for projects containing the new thread objects.

Threads use a printable 60-degree profile with flat crests and roots, with separate internal crest truncation. They do not implement certified ISO/ASME fit classes, tapered pipe threads, multi-start threads, screw heads or lead-in chamfers. The geometry uses common metric/Unified-style proportions; inch input does not mean that the STL contains inch units. Profile references: [Bossard metric profile](https://www.bossard.com/in-en/knowledge-hub/resources/online-calculators-and-converters/metric-thread-profile-calculator/) and [NIST screw-thread standards](https://nvlpubs.nist.gov/nistpubs/Legacy/hb/nbshandbook28supp1957pt1.pdf).

Thread limits: nominal diameter 0.5–500 mm, pitch 0.05–50 mm, length 0.05–5,000 mm, clearance 0–2 mm and at most 500 turns. Diameter must leave a positive core and tubes need a positive wall. Large dense thread meshes can hit the 800,000-triangle generation bound sooner. Angular sampling uses up to 512 regular divisions plus exact profile corners at the flat ends. The curve setting controls tessellation, never pitch; smooth presets and Maximum STL use 0.005 mm. Very large custom threads can reach the angular cap and exceed the target deviation.

## [2.0.0]

### Changed

Version 2.0.0 rebuilt the processing layer with bundled Python and Rust. Python manages model assembly and Add/Subtract jobs. Rust generates threaded solids, prepares preview geometry and normals and creates binary STL files. Both execute in a background worker on your phone; they do not require Python or Rust to be installed separately. The existing touch interface uses JavaScript, and the Android wrapper uses Java. OpenCascade and Manifold remain bundled solid-geometry libraries for primitives, Boolean operations and roundovers.

All processing stays on your device. The APK includes the Python interpreter, its standard library, Python job code and the compiled Rust module. It has no Internet permission and uses no geometry server, account or runtime downloads. The larger runtime can take longer to start; model limits remain unchanged. Rust mesh preparation moves that work off the screen's main thread. This release does not claim a measured speed improvement on your Samsung.

### Viewport appearance (undated)

Models use a matte finish with soft, neutral shading to make faces and curves visible. Glossy highlights, metallic reflections and the colored rim light have been removed. This display change does not affect model dimensions or STL geometry.

## Earlier versions

Details of 1.x releases were not kept; these compatibility notes come from earlier READMEs.


- **1.4:** Add/overlap fill results (cutout ordering and exclusions). Use version 1.4 or later to reopen those results correctly.
- **1.2:** per-shape **Face resolution** (smooth custom deviation or fixed faceted counts). Use version 1.2 or later to reopen these features correctly; older versions ignore the resolution setting.
- Version 2.0 and later can take longer than 1.0 for initial loading and complex fillet operations.
