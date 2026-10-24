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
mkdir -p dist
# Preserve expensive patched archives for diagnosis or Rust-only rebuilds.
tar -czf dist/patched-skia-archives.tar.gz skia/out/Static/*.a
clang -O2 -I skia/third_party/externals/brotli/c/include \
  scripts/ldt/compiled-brotli-test.c skia/out/Static/libbrotli.a \
  -o /tmp/ldt-compiled-brotli-test
/tmp/ldt-compiled-brotli-test
# The complete Skia archive must embed the very same compiled decoder object.
ar p skia/out/Static/libbrotli.a libbrotli.decode.o > /tmp/ldt-brotli-object.o
ar p skia/out/Static/libskia.a libbrotli.decode.o > /tmp/ldt-skia-brotli-object.o
test -s /tmp/ldt-brotli-object.o
cmp /tmp/ldt-brotli-object.o /tmp/ldt-skia-brotli-object.o
sha256sum /tmp/ldt-brotli-object.o > dist/compiled-brotli-object.sha256
ninja -C skia/out/Static -t commands libbrotli.a > dist/brotli-build-commands.txt
rustup toolchain install 1.94.1 --profile minimal
rustup target add x86_64-unknown-linux-gnu
node .yarn/releases/yarn-4.14.1.cjs install --immutable --mode=skip-build
# Preserve the existing nodelete target flag while recording a final link map.
export RUSTFLAGS="-C link-args=-Wl,-z,nodelete -C link-arg=-Wl,-Map,$PWD/dist/addon-link.map"
node .yarn/releases/yarn-4.14.1.cjs build --target x86_64-unknown-linux-gnu -- --locked
grep 'BrotliDecoderDecompressStream' dist/addon-link.map > dist/brotli-link-proof.txt
# Keep the dependency graph used by Cargo as release evidence.
mkdir -p dist
cp Cargo.lock dist/Cargo.lock
node scripts/ldt/package.cjs
