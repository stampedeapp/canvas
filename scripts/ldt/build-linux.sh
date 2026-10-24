#!/usr/bin/env bash
set -euo pipefail
export PATH="$PWD/depot_tools:$PATH"
node scripts/ldt/pin-brotli.cjs
(cd skia && python3 tools/git-sync-deps)
test "$(git -C skia/third_party/externals/brotli rev-parse HEAD)" = "3646606894cd8b8c75d79a569b6c95a33c699d63"
bash scripts/ldt/test-brotli.sh
export SKIP_SYNC_SK_DEPS=0
node scripts/build-skia.js
rustup toolchain install 1.94.1 --profile minimal
rustup target add x86_64-unknown-linux-gnu
node .yarn/releases/yarn-4.14.1.cjs install --immutable --mode=skip-build
node .yarn/releases/yarn-4.14.1.cjs build --target x86_64-unknown-linux-gnu
# Keep the dependency graph used by Cargo as release evidence.
mkdir -p dist
cp Cargo.lock dist/Cargo.lock
node scripts/ldt/package.cjs
