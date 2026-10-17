# Install-only dependency stand-ins (WS13, ruling D5)

These empty packages are npm workspaces of the root package. Because their names and versions satisfy the ranges
that our dependencies declare, npm links them instead of downloading the real packages:

| Stand-in | Declared by | Why AvalonCad never needs it |
|---|---|---|
| `@gltf-transform/core`, `extensions`, `functions` (pulls `sharp` and its `@img/*` binaries) | `manifold-3d` (glTF I/O for its `manifold-cad` CLI) | The app only loads `manifold-3d/manifold.js` and `manifold.wasm`. |
| `esbuild-wasm` | `manifold-3d` (peer, for its CLI) | Our build uses native `esbuild` (devDependency). |
| `opentype.js` 1.3.4 | `replicad` | `replicad/dist/replicad.js` already contains its own copy; nothing imports the package. |

`npm ci --omit=dev`: 158.7 MB → 94.6 MB of node_modules. Plain `overrides` with `file:` specs were tried first;
npm 11 writes lock entries for them that `npm ci` rejects, so workspaces are used instead. To undo, remove the
`workspaces` field from package.json, delete this folder and run `npm install`.
