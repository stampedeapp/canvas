#!/usr/bin/env bash
set -euo pipefail
brotli_root="${1:-skia/third_party/externals/brotli}"
output_path="$(mktemp -d)"
trap 'rm -rf "$output_path"' EXIT
cc -O2 -I "$brotli_root" -I "$brotli_root/c/include" \
  scripts/ldt/brotli-regression.c "$brotli_root"/c/common/*.c \
  "$brotli_root"/c/dec/bit_reader.c "$brotli_root"/c/dec/huffman.c \
  "$brotli_root"/c/dec/state.c -lm -o "$output_path/regression"
"$output_path/regression"
