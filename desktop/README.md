# Avalon CAD for Linux desktop (.rpm, Arch .pkg.tar.zst)

An Electron wrapper around the same bundled web app the Android APK ships (`app/assets`).
It runs fully offline: the UI, Pyodide (CPython 3.13.2), the Rust mesh engine, OpenCascade
and Manifold WASM are all packaged inside the RPM.

* The web bundle is served from a private `app://avalon-cad` origin registered as a
  standard, secure scheme (no TCP port is opened). Responses carry correct MIME types
  (`application/wasm` for WASM) plus COOP/COEP headers, so the page is cross-origin isolated.
* Every request outside that origin is cancelled; new windows and navigation are blocked.
* Projects, settings and prefabs live in Chromium localStorage under
  `~/.config/Avalon CAD/`, which persists across launches and updates.
* WebGL 2 is required. The GPU blocklist is ignored so software/VM drivers still work;
  run with `AVALON_SOFTWARE_GL=1` to force SwiftShader if a GPU driver misbehaves.

## Build

Requirements: Node.js 22.12+, npm, `rsvg-convert` (librsvg) and `rpmbuild`, plus the
Rust toolchain from the main README (unless you pass `--skip-web` to reuse `app/assets`).

```bash
desktop/build-rpm.sh            # rebuilds Rust + web bundle, then packages
desktop/build-rpm.sh --skip-web # package the existing app/assets
```

```bash
desktop/build-arch.sh --skip-web   # Arch Linux package (electron-builder pacman target)
```

Packages are written to `../deliverables/`: `avalon-cad-<version>.x86_64.rpm` and
`avalon-cad-<version>-1-x86_64.pkg.tar.zst`. Both install the app to `/opt/Avalon CAD`, a
`/usr/bin/avalon-cad` launcher (created by the install script), `avalon-cad.desktop` and
hicolor icons. Install on Arch with `sudo pacman -U avalon-cad-<version>-1-x86_64.pkg.tar.zst`;
pacman pulls the declared Electron runtime dependencies (gtk3, nss, alsa-lib, libxss, ...).

## Smoke test

```bash
xvfb-run -a desktop/dist/linux-unpacked/avalon-cad --no-sandbox --smoke-test=/tmp/avalon.png
```

Waits for the Python/Rust engines, adds a box through the UI, saves a screenshot and exits
non-zero on console errors, external requests or engine start failure.
