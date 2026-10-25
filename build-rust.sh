#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [ -x tools/rust-toolchain/cargo/bin/cargo ]; then
 export RUSTUP_HOME="$PWD/tools/rust-toolchain/rustup"
 export CARGO_HOME="$PWD/tools/rust-toolchain/cargo"
 export PATH="$CARGO_HOME/bin:$PATH"
fi
cargo build --locked --offline --manifest-path engine/rust/Cargo.toml --target wasm32-unknown-unknown --release --target-dir build/rust-target
mkdir -p app/assets
# wasm-opt -Oz after the opt-level 3 build (size ruling 2026-10-24: 126,257 B -> 111,290 B on the combined F2a + memory-fix
# + measure trial, byte-identical output). binaryen is the pinned devDependency (node_modules/binaryen, `npm ci`), so the
# step runs offline.
raw=build/rust-target/wasm32-unknown-unknown/release/avalon_mesh.wasm opt=build/rust-target/mesh-core.opt.wasm
[ -f node_modules/binaryen/bin/wasm-opt ] || { echo "binaryen missing: run npm ci (node_modules/binaryen)" >&2; exit 1; }
node node_modules/binaryen/bin/wasm-opt -Oz --enable-bulk-memory --enable-nontrapping-float-to-int --enable-sign-ext --enable-mutable-globals "$raw" -o "$opt"
# ADR-0001 F2a ruling: mesh-core.wasm has a HARD 120 KB (120,000 B) ceiling; the headroom is reserved for F1d/F2b.
size=$(wc -c < "$opt")
if [ "$size" -gt 120000 ]; then echo "mesh-core.wasm is $size B, over the 120,000 B hard ceiling (ADR-0001 F2a)" >&2; exit 1; fi
cp "$opt" app/assets/mesh-core.wasm
