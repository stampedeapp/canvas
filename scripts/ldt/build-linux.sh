#!/usr/bin/env bash
set -euo pipefail
export PATH="$PWD/depot_tools:$PATH"
for directory in /canvas /canvas/skia /canvas/skia/third_party/externals/brotli; do
  git config --global --add safe.directory "$directory"
done
test "$(git -C skia/third_party/externals/brotli rev-parse HEAD)" = "6d03dfbedda1615c4cba1211f8d81735575209c8"
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
