# Patched @napi-rs/canvas 0.1.100

This fork builds `@napi-rs/canvas`, originally published from
https://github.com/Brooooooklyn/canvas. It is not the npm `canvas` package.

The base is tag `v0.1.100`, commit `db337893b9b53483050ca7b24c6d306e4da06741`.
The Skia submodule stays at `fe2718df5f53a681087be6f0539045ca1b4b8c09`.
Before syncing Skia dependencies, the build changes only its Brotli pin:

- Original: `6d03dfbedda1615c4cba1211f8d81735575209c8` (1.0.9).
- Patched: `3646606894cd8b8c75d79a569b6c95a33c699d63` (1.0.10).
- Upstream fix: https://github.com/google/brotli/commit/50a9b70a4d5e1443fc40927952276b68fffa83a0
- Vulnerability: CVE-2026-111497.

The `LDT patched canvas` workflow builds Skia and the addon from source.
It does not download upstream precompiled Skia libraries. The builder image
is pinned by digest. It records the source commits, Cargo dependency lockfile,
and final binary checksum. The final addon must contain the new decoder error.

A safe C regression test constructs invalid block-switch states directly,
without decoding an exploit payload. It fails on original Brotli and passes
on 1.0.10. Render tests compare the original npm binary with the replacement,
including TTF/WOFF2 fonts, SVG, PNG, JPEG, WebP, and AVIF. The workflow also runs
upstream rendering tests and smoke tests under patched Node 22 and Node 24.

## Artifact scope

The initial artifact is a self-contained Linux x64 glibc package named
`@napi-rs/canvas`, version `0.1.100-ldt.1`. It includes the matching JavaScript
wrapper and native binary. It intentionally does not fall back to an original
native platform package. Other architectures and musl need separate builds.

Download the `.tgz` from a verified GitHub Release, and pin its exact URL in
your dependency resolution. Keep the resulting package-manager checksum.
A public npm registry or private npm registry is not required.

No application repositories are changed by this build. Updating a Node.js
runtime does not replace the compiled Brotli decoder inside this addon.
