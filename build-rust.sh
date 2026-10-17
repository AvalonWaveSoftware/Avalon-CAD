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
# ADR-0001 F2a ruling: mesh-core.wasm has a HARD 120 KB (122,880 B) ceiling; the headroom is reserved for F1d/F2b.
size=$(wc -c < build/rust-target/wasm32-unknown-unknown/release/avalon_mesh.wasm)
if [ "$size" -gt 122880 ]; then echo "mesh-core.wasm is $size B, over the 122,880 B hard ceiling (ADR-0001 F2a)" >&2; exit 1; fi
cp build/rust-target/wasm32-unknown-unknown/release/avalon_mesh.wasm app/assets/mesh-core.wasm
