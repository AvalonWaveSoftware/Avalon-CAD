#!/usr/bin/env bash
# Build the Avalon CAD Arch Linux package (.pkg.tar.zst) from the bundled web app.
# Same Electron wrapper and layout as the RPM (/opt/Avalon CAD, /usr/bin/avalon-cad,
# avalon-cad.desktop, hicolor icons). Requires Node.js 22.12+, npm, rsvg-convert and
# bsdtar (libarchive); electron-builder fetches fpm, which writes the pacman package.
# Usage: desktop/build-arch.sh [--skip-web]   (--skip-web reuses the existing app/assets)
set -euo pipefail
cd "$(dirname "$0")"
TARGET=pacman ./build-rpm.sh "$@"
