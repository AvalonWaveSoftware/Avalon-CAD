#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
# Toolchain (QA issue 3): rust-toolchain.toml at the repo root (tracked; this script runs from the repo root, so rustup
# picks it up) pins channel, profile and the wasm32 target. Use, in order: an in-repo tools/rust-toolchain (optional,
# git-excluded), else rustup's cargo ($CARGO_HOME/bin or ~/.cargo/bin), which honours the pin. A plain system cargo
# (e.g. /usr/bin/cargo 1.85.1 on the box) ignores the pin and is refused below.
if [ -x tools/rust-toolchain/cargo/bin/cargo ]; then
 export RUSTUP_HOME="$PWD/tools/rust-toolchain/rustup"
 export CARGO_HOME="$PWD/tools/rust-toolchain/cargo"
 export PATH="$CARGO_HOME/bin:$PATH"
elif [ -x "${CARGO_HOME:-$HOME/.cargo}/bin/rustup" ]; then
 export PATH="${CARGO_HOME:-$HOME/.cargo}/bin:$PATH"
fi
# Reproducible build (QA M6 / mirror R1): the same source must give the same mesh-core.wasm bytes in every worktree.
# 1. Pinned toolchain only: refuse any rustc other than rust-toolchain.toml's channel.
want=$(sed -n 's/^channel *= *"\(.*\)"/\1/p' rust-toolchain.toml)
install_msg="Install the pinned Rust toolchain, then rerun ./build-rust.sh:
  rustup toolchain install $want --profile minimal --target wasm32-unknown-unknown
(no rustup yet: https://rustup.rs, then the command above; a distro/system rustc cannot be used)"
command -v rustc >/dev/null || { echo "rustc not found. $install_msg" >&2; exit 1; }
have=$(rustc --version 2>/dev/null | cut -d' ' -f2) || have=none
[ "$have" = "$want" ] || { echo "rustc ${have:-none} is not the pinned $want (rust-toolchain.toml). $install_msg" >&2; exit 1; }
rustc --print sysroot >/dev/null && [ -d "$(rustc --print sysroot)/lib/rustlib/wasm32-unknown-unknown" ] || { echo "Rust $want lacks the wasm32-unknown-unknown target. Run: rustup target add wasm32-unknown-unknown --toolchain $want" >&2; exit 1; }
# 2. Paths: panic Location strings embed the absolute path of the vendored crates
#    (/workspace/avalon-cad/<worktree>/engine/rust/vendor/...), so every worktree produced different bytes. Remap the
#    checkout root (and CARGO_HOME) to fixed prefixes. CARGO_ENCODED_RUSTFLAGS (0x1f-separated) survives spaces in paths.
# 3. Timestamps: rustc/wasm-opt embed none in wasm; SOURCE_DATE_EPOCH is pinned anyway. codegen-units=1, lto and
#    strip are already fixed in Cargo.toml; wasm-opt is the pinned node_modules/binaryen (version checked here, before cargo, so a stale
#    node_modules fails fast instead of after a full Rust build).
[ -f node_modules/binaryen/bin/wasm-opt ] || { echo "binaryen missing: run npm ci (node_modules/binaryen)" >&2; exit 1; }
bv=$(node -p "require('./node_modules/binaryen/package.json').version") pv=$(node -p "require('./package.json').devDependencies.binaryen.replace(/^[=^~]/,'')")
[ "$bv" = "$pv" ] || { echo "node_modules/binaryen $bv is not the pinned $pv: run npm ci" >&2; exit 1; }
export SOURCE_DATE_EPOCH=0
export CARGO_ENCODED_RUSTFLAGS="--remap-path-prefix=$PWD=/avalon-cad"$'\x1f'"--remap-path-prefix=${CARGO_HOME:-$HOME/.cargo}=/cargo"
unset RUSTFLAGS
cargo build --locked --offline --manifest-path engine/rust/Cargo.toml --target wasm32-unknown-unknown --release --target-dir build/rust-target
mkdir -p app/assets
# wasm-opt -Oz after the opt-level 3 build (size ruling 2026-10-24: 126,257 B -> 111,290 B on the combined F2a + memory-fix
# + measure trial, byte-identical output). binaryen is the pinned devDependency (node_modules/binaryen, `npm ci`), so the
# step runs offline.
raw=build/rust-target/wasm32-unknown-unknown/release/avalon_mesh.wasm opt=build/rust-target/mesh-core.opt.wasm
node node_modules/binaryen/bin/wasm-opt -Oz --enable-bulk-memory --enable-nontrapping-float-to-int --enable-sign-ext --enable-mutable-globals "$raw" -o "$opt"
# ADR-0001 F2a ruling: mesh-core.wasm has a HARD 120 KB (120,000 B) ceiling; the headroom is reserved for F1d/F2b.
size=$(wc -c < "$opt")
if [ "$size" -gt 120000 ]; then echo "mesh-core.wasm is $size B, over the 120,000 B hard ceiling (ADR-0001 F2a)" >&2; exit 1; fi
cp "$opt" app/assets/mesh-core.wasm
