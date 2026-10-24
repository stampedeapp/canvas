# Patched @napi-rs/canvas 0.1.100

This fork builds `@napi-rs/canvas`, originally published from
https://github.com/Brooooooklyn/canvas. It is not the npm `canvas` package.

The base is tag `v0.1.100`, commit `db337893b9b53483050ca7b24c6d306e4da06741`.
The Skia submodule stays at `fe2718df5f53a681087be6f0539045ca1b4b8c09`.
The Brotli dependency stays at `6d03dfbedda1615c4cba1211f8d81735575209c8`.
Its version label is 1.0.9, but this snapshot contains APIs absent from the
1.0.9 and 1.0.10 release tags. Replacing it with 1.0.10 breaks the Skia build.
Instead, the build applies only the upstream decoder security changes:

- Decoder source: Google's 1.0 branch backport
  https://github.com/google/brotli/commit/50a9b70a4d5e1443fc40927952276b68fffa83a0
- Decoder error enum: Google's original fix
  https://github.com/google/brotli/commit/0ed4268a4401abcb4472096340477cf4af7d1a2b
- The local patch contains those changes with context matching Skia's snapshot.
- Vulnerability: CVE-2026-111497.
- The package verifies exact hashes of both patched source files.

The `LDT patched canvas` workflow builds Skia and the addon from source.
It does not download upstream precompiled Skia libraries. The builder image
is pinned by digest. It records the source commits, Cargo dependency lockfile,
and final binary checksum. It links and runs a test against the compiled Brotli archive to verify the new
error code, compares that decoder object with the copy embedded in Skia, and
records the final addon link map. The unused decoder error-string function is
removed from the final addon by dead-code elimination, so scanning the addon
for the `BLOCK_SWITCH` text is not a valid verification check.

A safe C regression test constructs invalid block-switch states directly,
without decoding an exploit payload. It fails on original Brotli and passes
after the security backport. Render tests compare the original npm binary with the replacement,
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

## Native-only dependency override

The artifact test workflow also packages the same verified binary as
`@napi-rs/canvas-linux-x64-gnu@0.1.100-ldt.1`. This tarball can replace only
that platform dependency while retaining the original `@napi-rs/canvas`
JavaScript wrapper. The integration test installs the original wrapper from
npm, overrides its Linux x64 native dependency, verifies which binary it
actually resolves, and repeats the rendering comparison.

This option preserves other platforms' existing resolution. It does not patch
those other platforms; each needs its own native rebuild to claim remediation.

## Rust binding compatibility

A floating rebuild selected napi 3.15.0 and napi-derive 3.6.13. Its new
native borrow checks rejected synchronous SVG image callbacks used by
the unchanged 0.1.100 wrapper. The fork pins napi 3.8.5 and napi-derive
3.5.4, the latest releases available when 0.1.100 shipped (April 26, 2026).
The Cargo lockfile also pins their release-era binding backend and support
crates. Upstream CI logs have expired, so these versions are reconstructed
from publication dates, not a recovered original lockfile. Rendering and
upstream tests must pass before publishing the rebuilt artifact.
