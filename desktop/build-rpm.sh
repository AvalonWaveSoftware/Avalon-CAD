#!/usr/bin/env bash
# Build the Avalon CAD Linux desktop package from the bundled web app.
# TARGET=rpm (default) builds the .rpm; TARGET=pacman builds the Arch .pkg.tar.zst (see build-arch.sh).
# Requires Node.js 22.12+ (Electron 44 tooling), npm, rsvg-convert, plus rpmbuild for the RPM
# (rpm-build / Debian "rpm" package) or bsdtar (libarchive) for the Arch package.
# Usage: desktop/build-rpm.sh [--skip-web]   (--skip-web reuses the existing app/assets)
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$(cd .. && pwd)"
if [ "${1:-}" != "--skip-web" ]; then
  (cd "$ROOT" && ./build-rust.sh && npm run build:web)
fi
for f in index.html main.js worker.js cad-kernel.wasm manifold.wasm mesh-core.wasm python/pyodide.mjs python/pyodide.asm.wasm python/python_stdlib.zip python/model_jobs.py; do
  [ -f "$ROOT/app/assets/$f" ] || { echo "Missing web asset app/assets/$f" >&2; exit 1; }
done
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
