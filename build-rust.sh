#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [ -x tools/rust-toolchain/cargo/bin/cargo ]; then
 export RUSTUP_HOME="$PWD/tools/rust-toolchain/rustup"
 export CARGO_HOME="$PWD/tools/rust-toolchain/cargo"
 export PATH="$CARGO_HOME/bin:$PATH"
fi
# Reproducible build (QA M6 / mirror R1): the same source must give the same mesh-core.wasm bytes in every worktree.
# 1. Pinned toolchain only: refuse any rustc other than rust-toolchain.toml's channel (a system /usr/bin/rustc 1.85 is
#    on PATH on the box and would silently produce different code).
want=$(sed -n 's/^channel *= *"\(.*\)"/\1/p' rust-toolchain.toml)
have=$(rustc --version | cut -d' ' -f2)
[ "$have" = "$want" ] || { echo "rustc $have is not the pinned $want (rust-toolchain.toml); install it in tools/rust-toolchain" >&2; exit 1; }
# 2. Paths: panic Location strings embed the absolute path of the vendored crates
#    (/workspace/avalon-cad/<worktree>/engine/rust/vendor/...), so every worktree produced different bytes. Remap the
#    checkout root (and CARGO_HOME) to fixed prefixes. CARGO_ENCODED_RUSTFLAGS (0x1f-separated) survives spaces in paths.
# 3. Timestamps: rustc/wasm-opt embed none in wasm; SOURCE_DATE_EPOCH is pinned anyway. codegen-units=1, lto and
#    strip are already fixed in Cargo.toml; wasm-opt is the pinned node_modules/binaryen (version checked below).
export SOURCE_DATE_EPOCH=0
export CARGO_ENCODED_RUSTFLAGS="--remap-path-prefix=$PWD=/avalon-cad"$'\x1f'"--remap-path-prefix=${CARGO_HOME:-$HOME/.cargo}=/cargo"
unset RUSTFLAGS
cargo build --locked --offline --manifest-path engine/rust/Cargo.toml --target wasm32-unknown-unknown --release --target-dir build/rust-target
mkdir -p app/assets
# wasm-opt -Oz after the opt-level 3 build (size ruling 2026-10-24: 126,257 B -> 111,290 B on the combined F2a + memory-fix
# + measure trial, byte-identical output). binaryen is the pinned devDependency (node_modules/binaryen, `npm ci`), so the
# step runs offline.
raw=build/rust-target/wasm32-unknown-unknown/release/avalon_mesh.wasm opt=build/rust-target/mesh-core.opt.wasm
[ -f node_modules/binaryen/bin/wasm-opt ] || { echo "binaryen missing: run npm ci (node_modules/binaryen)" >&2; exit 1; }
bv=$(node -p "require('./node_modules/binaryen/package.json').version") pv=$(node -p "require('./package.json').devDependencies.binaryen.replace(/^[=^~]/,'')")
[ "$bv" = "$pv" ] || { echo "node_modules/binaryen $bv is not the pinned $pv: run npm ci" >&2; exit 1; }
node node_modules/binaryen/bin/wasm-opt -Oz --enable-bulk-memory --enable-nontrapping-float-to-int --enable-sign-ext --enable-mutable-globals "$raw" -o "$opt"
# ADR-0001 F2a ruling: mesh-core.wasm has a HARD 120 KB (120,000 B) ceiling; the headroom is reserved for F1d/F2b.
size=$(wc -c < "$opt")
if [ "$size" -gt 120000 ]; then echo "mesh-core.wasm is $size B, over the 120,000 B hard ceiling (ADR-0001 F2a)" >&2; exit 1; fi
cp "$opt" app/assets/mesh-core.wasm
