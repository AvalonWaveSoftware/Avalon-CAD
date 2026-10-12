# AvalonCad 2.5.0

An offline Android CAD app for dimensioned parts and high-resolution STL export, with touch editing, real edge fillets, center snapping, addition and subtraction. Package: `com.tristan.cad`. Minimum Android version: 9. Android System WebView must support WebGL 2.

## Launch AvalonCad on your M4 MacBook Air

Download **AvalonCad-2.5.0-Mac-AppleSilicon.zip**, double-click the ZIP to extract it, move **AvalonCad.app** to **Applications**, and open it from Applications or Launchpad. You can drag the app to your Dock. This is a complete Apple silicon arm64 app with its runtime bundled; Node, Python, Rust and Xcode do not need to be installed to use it. macOS 13 or later is required. The Android APK remains a separate installer.

This personal build has an **ad-hoc local signature** and is **not Apple-notarized or Developer ID signed**. After attempting to open it, macOS may block it as an unidentified developer. For this specific app, use **System Settings → Privacy & Security → Open Anyway**, then confirm Open. Apple’s instructions are at https://support.apple.com/en-us/102445. Do not change the system-wide Gatekeeper setting. Actual installation and execution on an M4 Mac have not been tested here.

The Mac app retains the current CAD features: Primitive Objects, sketches, prefabs, layered Add/Subtract, roundovers, face resolution, threaded parts with Imperial defaults, bottom-center 0,0,0 placement, the optional Z=0 build-plane constraint and high-resolution STL export. All modeling stays local. The build plane is never exported.

**Mac controls:** left-drag to orbit; Shift-drag, Ctrl/Cmd-drag or right-drag to pan; scroll or pinch to zoom. In Move, Stretch or Round, drag the selected shape to edit it. Click a face or edge to select it, double-click a face to select the whole shape and triple-click an edge for all edges. The controls in the window retain the familiar phone layout with a desktop-sized inspector.

**Keyboard/menu shortcuts:** Cmd+N starts a blank project with the existing replacement confirmation; Cmd+O opens a .tcad/.avprefab/STL; Cmd+S saves a named project on this Mac; Cmd+Shift+S exports an editable .tcad backup; Cmd+E opens STL export; Cmd+Z and Cmd+Shift+Z undo/redo model changes (text fields keep text undo); Cmd+Shift+A opens Primitive Objects; Cmd+0 fits the view; Escape closes a panel or clears selection. When not entering text, A adds a shape, F fits the view and V clears selections.

Export a **.tcad** file on your Samsung, transfer it to your Mac, and open it using File → Open or Cmd+O. For editable assemblies, transfer .avprefab files. STL imports keep their mesh resolution and open as placement drafts that require Apply. Projects and prefabs autosave locally and persist when the .app is replaced. Before the window closes, the current project is saved; an unfinished drag saves its last committed state. Export .tcad/.avprefab backups for portable copies. Mac local projects are stored independently from phone projects.

The Mac app uses bundled Electron 44.7.0 with a standard secure local asset protocol, isolated preload and native file dialogs. Internet requests and new web windows are blocked. The viewer has no Node integration. Save/open handlers accept bounded model bytes and explicit dialog selections, with a 50 MB file limit and atomic file replacement. The Mac build contains no Android signing key.

Desktop validation covers file byte transport and bounds, native-shell protocol/IPC handlers with Electron objects mocked, Mac menu definitions, desktop Chromium UI using a test file bridge, actual local Python/Rust geometry, origin/plane/Imperial settings, mouse and keyboard behavior, saved projects, STL export and blocked Internet fetch. The app's arm64 Mach-O code-page hashes, signed resource seals, bundle identifiers, executable permissions and offline assets are checked. These checks do not substitute for Apple's on-device codesign/Gatekeeper checks or a physical Mac launch test.

To rebuild on a Mac, install Node.js 24+ for development, run **npm ci**, then **npm run build:mac**. It uses the already-bundled Rust geometry module and builds the web assets. The build downloads a pinned Electron runtime and verifies its SHA-256, packages an arm64 .app and applies a local signature using macOS codesign. For cross-platform signing, set AVALON_RCODESIGN to an apple-codesign executable and AVALON_ELECTRON_CACHE to a folder containing the verified runtime ZIP. Official desktop references: https://www.electronjs.org/docs/latest/api/protocol and https://www.electronjs.org/docs/latest/tutorial/security.

## Install the update on your Samsung

Download **AvalonCad-2.5.0.apk**, open it from **My Files → Downloads**, and choose **Update**. Install it over the existing app without uninstalling first. It is also a complete installer for a fresh installation. Uninstalling deletes local projects and settings, so export .tcad backups first if you choose to uninstall. This APK uses the same app identity and signing key, so Android can update the app while keeping its local projects. Export a .tcad backup of important projects from the project menu whenever you want an independent copy.

Version 2.0.0 rebuilt the processing layer with bundled Python and Rust. Python manages model assembly and Add/Subtract jobs. Rust generates threaded solids, prepares preview geometry and normals and creates binary STL files. Both execute in a background worker on your phone; they do not require Python or Rust to be installed separately. The existing touch interface uses JavaScript, and the Android wrapper uses Java. OpenCascade and Manifold remain bundled solid-geometry libraries for primitives, Boolean operations and roundovers.

All processing stays on your device. The APK includes the Python interpreter, its standard library, Python job code and the compiled Rust module. It has no Internet permission and uses no geometry server, account or runtime downloads. The larger runtime can take longer to start; model limits remain unchanged. Rust mesh preparation moves that work off the screen's main thread. This release does not claim a measured speed improvement on your Samsung.

The update retains triple-tap selection of all sharp edges, double-tap face/whole-shape selection, uniform roundovers, independent object smoothness, matte shading, center snapping, overlap filling, addition/subtraction and high-resolution STL export. The project format and local storage keys are unchanged. Its resource table is checked for uncompressed storage and 4-byte alignment, and its signing certificate matches the previous APK. You confirmed that the original app runs on your S26 Ultra; this rebuild still needs confirmation on that physical phone.

## New in 2.5.0

- **Mac desktop app:** an Apple silicon (arm64) AvalonCad.app for macOS 13+, with native file dialogs, menu shortcuts and mouse controls (see above).
- **Desktop pan:** right-drag (and Shift/Cmd/Ctrl-drag) pans the view in the desktop builds; touch gestures on Android are unchanged.
- **Linux desktop fixes:** the RPM and Arch packages share the updated Electron shell (restored startup, stable local storage location, isolation headers).
- Android version code increases to 18; the APK keeps the same app identity and signing key.

## New in 2.4.0

Every new Primitive Object, duplicated object, imported STL, prefab and custom sketch starts at **X=0, Y=0, Z=0** using the bottom center of its actual geometry. Changing the dimensions or rotation in its placement panel keeps that bottom-center point. Apply first, then move or align it. Selection and Snap On no longer change where a new object starts. Closed drafts still add nothing.

The **Build plane** switch is visible above the editing modes. On prevents enabled solids and cutouts from extending below **Z=0**, including after movement, resizing, rotation or alignment. Z dragging stops at the floor immediately; supported downward face drags stop there too. Geometry is positioned above the plane rather than clipped. Exact dimension edits that would extend below the plane raise the edited object while keeping its requested dimensions. Off permits negative Z. X/Y coordinates remain unrestricted on either side of the origin.

The switch defaults On in a new blank project, persists in autosave, saved projects and .tcad backups, and supports Undo/Redo. Existing projects without the setting open with it Off, preserving their saved geometry. Turning it On raises the entire existing assembly by one common offset if required, preserving relative placement and subtraction alignment. The lowest enabled shape, including a cutout, determines this offset. Turning it Off keeps the current positions.

The displayed plane is a visual reference and a Z=0 constraint, never a model object. It is **never included in STL**, saved assemblies or prefabs. With Build plane On, model geometry exports at or above Z=0 even if the separate “Place the lowest point on Z=0 for printing” export checkbox is unchecked. With it Off, uncheck that export checkbox to retain negative Z in STL. STL still uses millimeters.

New **All-thread screw** and **Threaded tube** drafts default to **Imperial, 1/4-20**. Stored thread objects retain their own units and dimensions; Metric remains available. Local Python and Rust processing and the prior overlap-shading correction are retained.

## New in 2.3.0

- **Apply-only creation:** choosing a Primitive Object, duplicating an object, inserting a prefab or importing an STL opens a draft. Only **Apply & add object** commits it. Close, Cancel, the shaded background and Android Back discard an unapplied draft without changing your project, autosave or Undo history. Applying a new object creates one Undo step.
- **Primitive Objects:** the Add menu uses this name for the premade shapes. It includes a new **Inclined plane** and **Pyramid**, with editable width X, depth Y and height Z. The inclined plane is a solid triangular wedge whose slope rises along local +X. The pyramid has a rectangular base and a centered apex. Both have five planar faces, support stretching and edge roundovers, and work with Add/Subtract and STL export. Smooth resolution keeps these planar faces flat.
- **Prefabs:** save assemblies as reusable shapes in a collection on your device. Retain subtractions or save the positive component shapes. Each insertion is an independent draft, with its own geometry embedded in the project. These new primitive and prefab types require **AvalonCad 2.3.0 or later**.

## Save and use prefabs

Tap **Add → Prefabs → Save an assembly as a prefab**, or select an existing object and use **Edit → Save as prefab**. Name it and choose the selected object, shapes selected in Add/Subtract, the active layer, or the entire model. Disabled components are omitted. When saving one selected solid, its enabled layer cutouts are included so its saved appearance matches the model. Saving a selected Cutout itself saves its positive shape for reuse.

**Include subtractions and cutouts** starts checked. It preserves explicit Subtract operations, cutout objects, roundovers, layer-local cuts and filled-overlap results. Uncheck it to retain the positive component shapes before their Boolean subtractions; native tube bores and thread profiles stay part of their primitives. Compound roundovers are cleared when removing a subtraction changes their edge layout. Saving a prefab leaves the open project unchanged; Apply edits before saving them.

Tap a saved prefab to open its placement draft, then tap **Apply & add object**. Every copy has independent component IDs and parameters. Editing, deleting or replacing a saved collection entry does not change copies already inserted into projects. Move, rotate, snap and combine prefabs like other objects. Prefabs keep their original internal layer rules while the whole prefab belongs to the current outer project layer. Disconnected components are allowed and export as separate closed shells.

Use **Edit → Separate components** to recover editable component shapes. A prefab's internal layers are restored into fresh project layers so its cutouts cannot cut unrelated existing objects. Nested prefabs remain reusable components. Undo an assembly stretch before separating it; separate threaded components before changing their length to keep thread pitch fixed.

Use the export button beside a saved prefab for a portable **.avprefab** file. Import one through **Add → Prefabs → Import .avprefab** or the Open file action. Imports with the same prefab ID replace that collection entry; existing project copies remain independent. Editable **.tcad** backups embed all inserted prefab definitions and open without the collection. Saved prefabs persist across projects and app updates, but clearing app data or uninstalling removes the local collection. Export .avprefab files to keep backups. The limit is 100 saved prefabs, 100 project objects and 100 layers, subject to available device storage and memory.

## New in 2.2.0

- **Layers:** create and rename layers with the layer button at the top. Existing projects open on **Layer 1**. New shapes, sketches and STL imports belong to the active layer. **Edit → Layer** moves an existing object.
- **Local cuts:** Cutout shapes affect every overlapping solid on their own layer, leaving other layers intact. Layer results are added together for the final preview and STL. Layers are groups of shapes, not fixed Z heights; they can overlap anywhere in 3D.
- **Multiple subtraction targets:** choose a cutter first, then any number of parts on that layer. Or select just the cutter and press Subtract to target every enabled solid on the active layer. The confirmation lists all affected parts.
- **Layer selection:** tapping and the Boolean picker use the active layer. Other layers stay visible as references. The Objects list shows each object's layer and activates it when selected.
- Undo/Redo, autosave and .tcad exports preserve layer names, assignments and active layer. Projects with multiple layers require **AvalonCad 2.2.0 or later** for correct cut scope.

## New in 2.1.1

Added **1/2-28** and **5/8-24** to the Imperial common-size presets for both All-thread screw and Threaded tube. Choose **Thread units → Imperial**, then choose the size under **Common size or custom**. The first number is nominal diameter in inches and the second is threads per inch; length remains separately adjustable.

## New in 2.1.0

Movement uses a single opaque solid, rebuilt in the background as you drag. The translucent duplicate preview has been removed. Selection overlays are cleared during dragging so the old outline does not remain in its previous position. Heavy jobs can still make the solid preview lag behind your finger until the worker finishes.

Press **Clear** beside Edit dimensions to deselect every shape, face and edge, clear Add/Subtract selections and remove highlights, center markers, handles and live measurements. It returns to Select mode and keeps the model unchanged. Tapping empty space in Select also clears selection. You can tap a shape or use Objects to select it again. The optional wireframe view has its own toggle.

### All-thread screws and internally threaded tubes

Tap **Add → All-thread screw** for a fully threaded rod without a head. Tap **Add → Threaded tube** for a cylindrical sleeve with a through-bore threaded on the inside. These are actual single-start helical solids, included in STL; they support rotation, movement, center snapping, addition and subtraction.

New threaded objects default to Imperial. In Edit, choose **Metric** for dimensions in millimeters and pitch in millimeters per turn, or **Imperial** for dimensions in inches and **TPI** (threads per inch). Switching units converts the current values without changing the part. You can choose common metric and inch presets, or enter custom nominal diameter, pitch/TPI, length and right-hand or left-hand direction. Imperial dimensions accept decimals or fractions such as 1/4, 3/8 and 1 1/2. Tube parameters also include outer diameter.

The metric presets run from M3 × 0.5 to M20 × 2.5. Inch presets include #6-32, #8-32, #10-24/32, 1/4-20/28, 5/16-18, 3/8-16/24, 1/2-13/20/28, 5/8-11/24 and 3/4-10. Custom values are not restricted to those sizes. For example, a 1/4-20 screw that is 2 inches long has a 6.35 mm nominal diameter, 1.27 mm pitch and 40 turns. Thread-unit settings belong to each object independently. The rest of the workspace, positions and STL continue to use millimeters.

**Radial fit clearance** decreases the screw radius or increases the threaded bore radius by the specified amount. The screw starts at zero; the tube starts at 0.15 mm. Zero preserves the nominal profile. The tube's outer diameter must leave material outside the largest bore radius, including clearance. Printed fit depends on your printer and material; adjust the clearance using a small fit sample.

Choose Stretch and pull an **end face**, or select an end face and use **Set size**. Threaded parts stretch only along their local Z/length axis. Their diameter, direction and pitch stay fixed as turns are added or removed. The opposite end stays in place. Length changes from either end preserve the phase of the existing overlapping threads. Live measurements show length, turn count and pitch/TPI. Set size uses the threaded object's chosen units. Change diameter or pitch in Edit.

After Add/Subtract, the object is a combined solid. **Separate components** before changing a threaded component's length. Scaling a combined object containing threads is blocked to preserve pitch. These threaded surfaces use mesh geometry rather than the CAD edge-fillet kernel; their edges cannot use Round. Saved .tcad files retain thread parameters and regenerate the geometry on load/export. Version 2.1.0 or later is required for projects containing the new thread objects.

Threads use a printable 60-degree profile with flat crests and roots, with separate internal crest truncation. They do not implement certified ISO/ASME fit classes, tapered pipe threads, multi-start threads, screw heads or lead-in chamfers. The geometry uses common metric/Unified-style proportions; inch input does not mean that the STL contains inch units. Profile references: [Bossard metric profile](https://www.bossard.com/in-en/knowledge-hub/resources/online-calculators-and-converters/metric-thread-profile-calculator/) and [NIST screw-thread standards](https://nvlpubs.nist.gov/nistpubs/Legacy/hb/nbshandbook28supp1957pt1.pdf).

Thread limits: nominal diameter 0.5–500 mm, pitch 0.05–50 mm, length 0.05–5,000 mm, clearance 0–2 mm and at most 500 turns. Diameter must leave a positive core and tubes need a positive wall. Large dense thread meshes can hit the 800,000-triangle generation bound sooner. Angular sampling uses up to 512 regular divisions plus exact profile corners at the flat ends. The curve setting controls tessellation, never pitch; smooth presets and Maximum STL use 0.005 mm. Very large custom threads can reach the angular cap and exceed the target deviation.

## Viewport appearance

Models use a matte finish with soft, neutral shading to make faces and curves visible. Glossy highlights, metallic reflections and the colored rim light have been removed. This display change does not affect model dimensions or STL geometry.

## Smooth shapes before adding

Tap **Add**, then check **Smooth shape · high resolution** before choosing a shape. It starts checked and remembers your choice. Spheres, cones, cylinders, tubes and rounded boxes use **0.005 mm** curve resolution in both preview and STL export. Spheres remain sphere primitives, rather than fixed-face approximations. Flat box faces and sharp edges keep their geometry; this checkbox does not round a box into another shape. Tubes retain their intended hollow center.

Uncheck the box to use the normal automatic resolution, controlled by STL export quality. You can change any curved shape later in Edit → Face resolution, including choosing a fixed number of flat faces. The viewer shades curved surfaces smoothly while preserving sharp corners. Each faceted object's chosen flat faces remain visible alongside smooth objects.

Each shape has its own settings. The creation checkbox applies only to the new shape you are adding; its remembered value is a preference for future shapes. Adding or editing another sphere, cylinder or other shape leaves existing shapes' stored resolution and display settings unchanged. You can mix smooth and faceted shapes in one project, including Add / Subtract results. A .tcad backup preserves each object's settings independently. Existing saved projects also use the corrected per-object display after updating.

CAD curves are stored as editable shape parameters. The viewer and STL represent those curves with triangles, so a finite STL cannot be a mathematically perfect smooth surface. The preset uses the highest existing resolution setting, subject to the segment limit described below.

## Face resolution and number of faces

Add or select a shape, tap **Edit**, and scroll to **Face resolution**.

- **Smooth · use STL export quality** keeps the original behavior. Preview uses a lighter mesh and export uses Draft, Fine, Ultra or Maximum.
- **Smooth · custom face resolution** sets the shape's maximum curve deviation from 0.005 to 2 mm. Lower values make a denser, smoother mesh. This setting overrides global quality for that shape, in both preview and export.
- **Faceted** sets a number of flat faces or sides. Preset buttons give quick choices, and the number field accepts other whole numbers in the supported range. Apply changes to rebuild the shape.

For a **sphere**, choose **Faceted · set number of faces** and enter **6**. It becomes a cube-like, six-flat-face approximation of a sphere. Four gives a tetrahedron, eight an octahedron, twelve a dodecahedron, and twenty an icosahedron. Other counts from **4 to 512**, including odd counts, give convex sphere approximations with that exact number of planar faces. Increasing the count makes the shape generally rounder; low-count regular shapes have different proportions. In faceted mode the Diameter field specifies the largest overall axis width, and the shape's bounding box is centered on its position.

For **cylinders, cones and tubes**, choose **3 to 512 sides** around the shape. End faces are additional: a six-sided cylinder has eight polygon faces in total; a six-sided tube has fourteen. Diameter remains the diameter through the polygon vertices, so an odd-sided cross-section can have a smaller width and an offset bounding-box center.

For **rounded boxes**, choose **1 to 128 segments per corner**. This controls the flat segments around each rounded XY corner. Straight side faces and top/bottom faces are additional.

The selected-object label and Edit panel show **surface/flat faces** and **mesh triangles** separately. For example, the six-face sphere has six square faces, represented by twelve triangles in STL. A smooth CAD sphere has one curved surface but many mesh triangles. These counts describe the individual shape before global cutouts; adding cutouts, addition, subtraction and roundovers can change its surface count. Imported STL shapes show their triangle-face count.

Fixed facets remain fixed when exporting at Ultra or Maximum. The STL quality setting does not turn a six-face object back into a smooth sphere. Roundovers add curved surfaces and use the export quality unless the shape has a custom smooth deviation setting. Native faceted shapes still support edge roundovers, touch editing, snapping, Add and Subtract.

Changing between smooth/faceted modes or changing a fixed face/side count changes the edge layout. Existing roundovers on that shape are cleared to avoid applying their saved edge selections to different edges. Undo restores the previous shape and roundovers. A .tcad backup preserves the resolution setting. Use version 1.2 or later to reopen these features correctly; older versions ignore the new resolution setting.

## Tap to select and move with X/Y/Z handles

In **Select**, tap the interior of a face to select and highlight that face in orange. **Double-tap the same face** to select and highlight the whole shape in green. This selects one complete object for Move or Edit; it does not deform all faces at once. A smooth sphere has one curved face. On an imported STL, a single face is one mesh triangle, and double-tapping selects the full mesh. Tapping near a sharp edge enters Round mode instead.

After selecting a face, tap **Stretch** to keep that face selected for pulling or an exact dimension. Double-tapping a face in Stretch mode returns to whole-shape selection. Selection alone leaves the model's geometry unchanged.

Tap **Move**, then drag the selected object or a colored handle. The axis row offers **X**, **Y**, **Z** and **XY**. X/Y/Z constrain motion to that world axis; XY moves along the horizontal plane. Use TOP view for the clearest XY dragging. Coordinates appear live while dragging.

Choose Free, 0.1 mm or 1 mm drag precision. **Snap on** enables center and face-center markers. Nearby matching points snap together while moving, respecting the chosen axis constraint. Use **Align centers** for exact center-to-center or face-to-face placement, including the option to match the target's rotation.

In Select mode, drag to orbit. In editing modes, drag empty space to orbit. Pinch to zoom and use two fingers to pan. TOP, FRONT, RIGHT, 3D and the fit button reset the camera.

## Pull and stretch a face

Select a shape, choose **Stretch**, then tap and drag a face along its displayed local X, Y or Z direction. The dimension appears live while you drag. The opposite side stays in place. **Set size** enters an exact dimension without dragging.

Boxes, rounded boxes, inclined planes and pyramids change their width, depth or height. Circular primitives retain a circular section: pulling a cylinder's side changes its diameter, and pulling an end changes its height. Spheres change diameter. Sketch extrusions stretch the outline or extrusion height. Imported meshes, joined objects and prefabs scale along the selected local axis; this changes the whole object's dimension along that axis. It does not perform arbitrary vertex/face deformation.

When dragging, one opaque model preview is rebuilt in the background; selection overlays are cleared while the object moves. On release, the change is checked before it is committed. Invalid roundovers or solids restore the previous shape. One drag produces one Undo step, and accepted changes autosave.

## Round an edge by dragging

Choose **Round** and tap a sharp edge. Drag up to increase the roundover radius or down to reduce it. The radius appears live in millimeters. Use **Radius** to enter an exact value or remove the selected roundovers.

**Double-tap an edge** to select the whole boundary loop around its adjacent face. For a box, this selects the four edges around that face. **Face perimeter** provides the same selection explicitly. A face with holes has separate loops: choosing an outer edge selects its outer boundary, while choosing a hole edge selects that hole's boundary.

**Triple-tap the same edge** to select every sharp CAD edge on that shape. A box selects all twelve edges. **All edges** provides the same selection explicitly in Round mode. Drag up/down or use **Radius** to apply one shared roundover radius to the entire selection, making the shape uniform. Other objects retain their own roundovers. Tap the same edge quickly without dragging between taps. Changing the edge or shape, changing modes, pausing, dragging, cancelling or using two fingers starts a new tap sequence.

These are actual solid edge fillets, included in STL export. Thin walls, tight corners and intersecting roundovers can limit the radius; the app rejects an invalid operation and keeps the previous geometry. Sharp construction-edge guides remain visible in Round mode so an existing roundover can be selected and adjusted again.

Fillets work on native parametric shapes and joined parametric solids. STL triangle edges are not CAD edges and cannot use this tool. A sphere has no sharp edges to round. Nonuniformly stretched compound objects use mesh editing; round their original components before joining or stretching. Existing roundovers scale with a mesh/compound stretch.

## Place and snap shapes

New objects always start with their bottom center at 0,0,0. After Apply, use Move → Align centers or drag snapping to position them against another shape. Exact face attachment can include a 0.02 mm overlap to help adjoining pieces become one printable solid with Add. Build plane On prevents a bottom-face attachment from passing below Z=0.

Markers show object bounding-box centers and planar face centers. These are geometric alignment references, not material centers of mass. Align centers supports exact center-to-center and top, bottom, X or Y face placement between shapes. Drag snapping respects the selected movement axis; a dedicated center alignment can move all three coordinates.

## Add or subtract overlapping shapes

Choose **Add / Subtract**, then select shapes by tapping them or pressing **Choose parts**. The **Objects** button also opens the ordered selection list while this tool is active. The list includes spheres, Cutout shapes and shapes completely hidden inside another part on the active layer. Use the layer button at the top to switch or create layers. Shapes from different layers cannot be combined by a Boolean operation; move them to one layer through Edit first. Disabled shapes must first be enabled from Select → Objects.

Selections are numbered in the order you choose them. The first shape has an orange fill and all following selected shapes have a teal fill. Smooth spheres have a filled selection highlight even though they have no sharp edges. When shapes overlap on screen, tapping through an already selected front shape can select an unselected shape behind it; use Choose parts to choose the exact shape by name. **Clear selection** starts again, and **Swap 1 ↔ 2** reverses two selected shapes.

### Subtract: one cutter, multiple parts on one layer

Select **the cutter first**, then **every part to keep** on the active layer. Press **Subtract** and review the list before confirming. With only the cutter selected, Subtract automatically chooses every other enabled Solid object on that layer. Choose parts also offers **Keep first as cutter · select all layer solids**. The two-shape case still offers Swap cutter and part to keep.

The cutter removes overlapping material from the selected parts together. It affects only their layer; unselected parts and all other layers are kept. Existing applicable Cutout shapes are baked into each target, respecting that target's previous filled-hole exclusions. The original selected shapes are replaced by one editable result that can contain several separate pieces; STL exports these as closed shells. A target can be completely removed if another selected target retains material. A cutter that overlaps none of the selected material or removes all selected material is rejected.

**Keep the cutter as a disabled reference shape** retains the cutter without filling the hole in the preview or STL. Enable it later from Select → Objects if needed. Undo restores every original selected shape in one step.

### Add: join selected pieces

Select the **existing part first**, then the shape or shapes on the same layer that supply new material. **Select all layer solids for Add** selects all enabled solids on the active layer. Press **Add**, then **Add selected shapes**. The app merges overlapping material and checks that the result is one physically connected solid. Selected shapes add material regardless of their previous Solid/Cutout setting. Smooth and faceted spheres can both be added to other parts.

By default, added material fills holes and cavities wherever it overlaps the first part. Existing holes outside the added material remain. Other Cutout shapes cannot punch the same hole back through the new material afterward. If a Cutout is shared with another part, that other part keeps its cutout. New Cutout shapes added later on the same layer still cut the combined result. Cutouts on other layers cannot reopen those holes. This applies to both the preview and STL. Undo restores the original shapes and cutouts.

If pieces are separated, the dialog can add connecting bars of a chosen diameter. The bars add real material between the selected pieces; the result is checked again. Increase their diameter or move the pieces if a bridge does not reach every piece.

**Keep existing holes from overlapping Cutout shapes** applies the old cutouts after merging, preserving holes even through added material. Leave it off for the new fill behavior. Remaining hole/cavity edges are available for Round mode. You can also Add just one solid with Keep existing holes on to bake its cutouts into that solid. Cutouts used by other solids remain available to those objects; other incorporated cutouts are removed from the object list because their geometry is stored in the combined solid.

### Edit or restore the components

Move, rotate or stretch a combined result as one object. Its stored original shapes preserve their dimensions, face resolution and individual roundovers so STL export can rebuild the Boolean result at the requested quality. **Edit → Separate components** restores its stored components and their original Solid/Cutout settings; roundovers applied to the combined result do not transfer to individual components. Undo a combined object's nonuniform stretch before separating it. The current limit is 100 objects, including stored children.

## Exact dimensions, sketches and STL import

Add boxes, rounded boxes, cylinders, cones, spheres, tubes or a custom sketch extrusion. Dimensions use millimeters; rotation uses degrees. New shapes use bottom-center placement: 0,0,0 puts their bottom on the build plane. The engine stores transforms at the original local origin, preserving project compatibility. Existing objects without the new placement reference retain center-coordinate fields; a centered 10 mm tall box sits on the plane at center Z=5 mm. Sketch outlines retain their relative point coordinates and are placed by their bounding-box bottom center.

Enabled Solid objects add material and merge at export. Cutout objects normally remove material from every enabled solid they overlap. Add stores its existing cutouts inside the result so they cannot reopen filled material, while other parts keep their own cuts. Tap Objects to choose or enable/disable an object. Sketch points may be tapped on the XY grid or entered numerically; outlines must not cross, and either clockwise or counterclockwise drawing order is accepted.

STL import keeps the original mesh resolution and requires a closed solid for Boolean operations. Imported meshes can be moved, rotated, stretched, snapped, added and subtracted. The app does not implement automatic mesh repair.

## STL quality

Export STL regenerates supported parametric curves at the selected resolution:

| Quality | Target chord deviation |
| --- | --- |
| Draft | 0.15 mm |
| Fine | 0.03 mm |
| Ultra | 0.01 mm |
| Maximum | 0.005 mm |

Ultra is a practical default for printing. Maximum increases curved-surface detail. Basic circular tessellation is capped at 1,024 segments, so extremely large curves can exceed the target deviation. The exact CAD fillet engine meshes its surfaces to the selected tolerance. Raising export quality does not reconstruct curvature missing from an imported STL.

Binary STL includes the solid geometry, cutouts, Add/Subtract results, roundovers and outward-facing normals. STL has no explicit unit field; import it into your slicer as **millimeters**. Place the lowest point on Z = 0 moves the whole export onto the build plane. Disconnected objects can be exported together as separate closed shells; Add provides an explicit physically connected object.

## Save projects and backups

Work autosaves on your phone. The project menu supports named saved projects and portable .tcad exports. A .tcad file preserves editable shapes and features; STL preserves a mesh. Clearing app data or uninstalling removes local projects. Earlier .tcad files remain readable in version 2.4. Build-plane constraints and bottom-center placement metadata require version 2.4 or later for matching editing behavior. Use version 1.4 or later to reopen the new overlap-fill results correctly; older versions do not understand their cutout ordering and exclusions.

Limits include 100 objects per project, 300 points per sketch, 1 million triangles per imported STL and 50 MB native file transfers. Large models can exceed phone memory before those limits. Constraint solving, arbitrary mesh topology editing, assembly constraints, chamfers and STEP files are not implemented.

## Validation

Build-plane checks exercise origin placement for every rotated primitive, odd-sided facets, offset STL meshes and subtracted prefab assemblies, floor-constrained and unrestricted geometry/STL, preserved volumes and whole-assembly offsets, Imperial defaults, selection-independent drafts, floor-aware moves and resizing, toggles, legacy projects, Undo/Redo and persistence. The plane adds no model triangles to STL. The APK compiles against Android API 35. Its signature, ZIP alignment, required runtime assets and Android resource-table packaging verify. Its signing certificate matches the previous APK and its version code increases to 18. Seventeen focused overlap checks reproduce the bent-face shading and verify isolated surface normals, exact position matching across thin gaps, flat/faceted faces, smooth curves, movement, Addition/Subtraction, identical/angled overlaps, fillets, prefabs, layers, unchanged vertex coordinates and exact Maximum STL parity. New primitive/prefab checks verify exact planar volumes, face and edge topology, closed oriented meshes, real roundovers, high-quality STL, independent copies, optional subtractions, layer-preserving assemblies, portable files and native tube bores. UI checks cover Apply-only creation and all cancellation paths, one-step Undo/Redo, duplicate/STL/prefab drafts, collection saving, import/export and safe component separation. Layer geometry checks verify legacy migration, overlapping layer protection, multiple subtraction targets, partial/complete target removal, per-target cutout exclusions, closed meshes and Python/Rust STL output. Layer interaction checks cover creation, rename, moving objects, active-layer creation, selection isolation, multi-target/all-layer subtraction, Undo/Redo and editable backups. Regression tests cover 107 existing geometry cases and 34 local runtime cases, plus seven Rust unit tests. Thirty thread cases verify closed oriented meshes, internal through-bores, metric/inch equivalence, both thread hands, mating clearance, fixed pitch and phase at both stretched ends, Maximum-quality surface deviation, Add/Subtract, validation and editable backups. The new checks run the actual bundled CPython 3.13.2 and Rust WebAssembly: they verify geometry parity, per-object normals, mixed smooth/faceted parts, all-edge fillets, cuts, overlap fills, invalid inputs and repeated jobs. Rust STL output matches the previous exporter byte for byte at the same quality, including grounded exports.

Interaction tests now send all model jobs through Python and Rust. They exercise ray selection, face and whole-shape highlighting, triple-tap selection of all twelve box edges, uniform roundovers, dragging with measurements, center snapping, Add/Subtract, hidden sphere selection, overlapping cuts and fills, independent same-type object settings, Undo, project backups/imports, native STL chunks and autosave. Their screen drawing is stubbed. A separate mobile-sized Chromium 153 integration check uses actual WebGL, the restrictive app CSP and the bundled module worker. It successfully starts Python/Rust, selects a face, triple-taps all box edges, applies a real roundover, exports Rust STL and loads the mounting-plate template. All app asset requests stayed local, with external requests blocked. The browser also checks layer creation, layer-local subtraction of multiple parts, active-layer ray selection and protected geometry, plus the screw/tube panels, imperial presets and fractional dimensions, fixed-pitch tube stretching, threaded STL, one opaque solid during movement and complete deselection. The browser also verifies draft cancellation, inclined-plane and pyramid face counts, prefab saving/export/insertion, Undo/Redo, collection and project persistence after reload, and Maximum-quality assembly STL. The overlap case also passes in actual WebGL before and after Addition, with planar face normals, volume and primitive dimensions preserved. The browser also verifies origin drafts, both build-plane switch states, plane-free STL, Imperial defaults and custom-sketch placement at 0,0,0. Physical Samsung testing remains outstanding.

## Source build

The source archive includes Python and Rust engine source, web and Android code, bundled runtime assets, tests, dependency lockfiles and your signing key for compatible future updates. Keep the source backup private to retain control of that key. Third-party license notices identify the unchanged component packages and their source repositories. The CAD kernel is supplied as a separate WASM asset that can be replaced and rebuilt from its upstream source.

On Linux, install Node.js 20 or later, a Java 17 JDK and Rust 1.90.0 with its wasm32-unknown-unknown target. Install Android command-line tools into tools/android-sdk/cmdline-tools/latest, or set TRISTANCAD_SDK to your SDK. Install platforms;android-35 and build-tools;35.0.0 with sdkmanager, accepting the SDK license when prompted. Then run:

```bash
rustup toolchain install 1.90.0 --profile minimal --target wasm32-unknown-unknown
npm ci
./build-rust.sh
cargo test --locked --offline --manifest-path engine/rust/Cargo.toml --target-dir build/rust-target
npm test
./build-apk.sh
```

The APK is written into a sibling deliverables directory as AvalonCad-2.5.0.apk. The dependency-free Rust crate builds offline once its pinned compiler and target are installed. Python source lives in engine/python/model_jobs.py and Rust source in engine/rust/src/lib.rs. The build pins Pyodide 0.29.3 (CPython 3.13.2) and bundles its unmodified runtime with complete license notices. The private signing key is tools/signing.p12; set its password in the AVALONCAD_KEYSTORE_PASS environment variable before running build-apk.sh (it is not stored in the repository). Retain the existing key for compatible updates.

An optional browser integration test is available as npm run test:browser. Install Playwright separately and set AVALON_CHROMIUM to a local Chromium executable; the test serves bundled assets from localhost only and blocks all external requests. This test server is development tooling and is not part of the installed app.

The APK has no network permission, accounts, advertisements or analytics. The modeling engines and viewer are bundled for offline use. Initial loading and complex fillet operations can take longer than in version 1.0.
