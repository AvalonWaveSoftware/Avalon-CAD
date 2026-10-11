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
cp build/rust-target/wasm32-unknown-unknown/release/avalon_mesh.wasm app/assets/mesh-core.wasm
