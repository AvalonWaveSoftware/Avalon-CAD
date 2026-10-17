#!/usr/bin/env bash
# Build the Avalon CAD Linux desktop package from the bundled web app.
# TARGET=rpm (default) builds the .rpm; TARGET=pacman builds the Arch .pkg.tar.zst (see build-arch.sh).
# Requires Node.js 22.12+ (Electron 44 tooling), npm, rsvg-convert, plus rpmbuild for the RPM
# (rpm-build / Debian "rpm" package) or bsdtar (libarchive) for the Arch package.
# Usage: desktop/build-rpm.sh [--skip-web]   (--skip-web reuses the existing app/assets; it must match the current
# sources per build/web-stamp.json, else the build stops; AVALON_ALLOW_STALE_WEB=1 overrides with a warning)
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$(cd .. && pwd)"
if [ "${1:-}" != "--skip-web" ]; then
  (cd "$ROOT" && ./build-rust.sh && npm run build:web)
fi
# WS7: the Pyodide assets ship only when web/perf-flags.mjs has JS_ENGINE=false.
# WS13 (D6): app/assets is not tracked; this list matches desktop/stage.mjs REQUIRED_ASSETS.
ASSETS="index.html style.css main.js worker.js cad-kernel.wasm manifold.wasm mesh-core.wasm perf-flags.json THIRD_PARTY_NOTICES.txt"
grep -q "JS_ENGINE=false" "$ROOT/web/perf-flags.mjs" && ASSETS="$ASSETS python/pyodide.mjs python/pyodide.asm.wasm python/python_stdlib.zip python/model_jobs.py"
for f in $ASSETS; do
  [ -f "$ROOT/app/assets/$f" ] || { echo "Missing web asset app/assets/$f" >&2; exit 1; }
done
# --skip-web must not ship assets built from older sources (tools/web-stamp.mjs compares content hashes).
# AVALON_ALLOW_STALE_WEB=1 packages anyway, with a warning.
if ! (cd "$ROOT" && node tools/web-stamp.mjs check); then
  if [ "${AVALON_ALLOW_STALE_WEB:-}" = "1" ]; then
    echo "WARNING: packaging STALE app/assets because AVALON_ALLOW_STALE_WEB=1" >&2
  else
    echo "Refusing to package stale app/assets. Run without --skip-web, or set AVALON_ALLOW_STALE_WEB=1 to override." >&2; exit 1
  fi
fi
rm -rf build/web build/icons dist
mkdir -p build/icons
cp -r "$ROOT/app/assets" build/web
for s in 16 24 32 48 64 128 256 512; do rsvg-convert -w $s -h $s icon.svg -o build/icons/${s}x${s}.png; done
npm ci --no-audit --no-fund
TARGET="${TARGET:-rpm}"
npx electron-builder --linux "$TARGET" --x64 --publish never
mkdir -p "$ROOT/../deliverables"
case "$TARGET" in rpm) PATTERN="dist/*.rpm";; pacman) PATTERN="dist/*.pkg.tar.zst";; *) PATTERN="dist/*.$TARGET";; esac
OUT=$(ls $PATTERN | head -1)
cp "$OUT" "$ROOT/../deliverables/"
echo "Package ready: $ROOT/../deliverables/$(basename "$OUT")"
