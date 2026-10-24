#!/usr/bin/env bash
set -euo pipefail
brotli_root="${1:-skia/third_party/externals/brotli}"
patch_path="$(pwd)/scripts/ldt/brotli-block-switch.patch"
test "$(git -C "$brotli_root" rev-parse HEAD)" = "6d03dfbedda1615c4cba1211f8d81735575209c8"
git -C "$brotli_root" apply --check "$patch_path"
git -C "$brotli_root" apply "$patch_path"
echo 'Applied upstream Brotli block-switch fix to exact Skia source snapshot'
