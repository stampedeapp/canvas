const { readFileSync, writeFileSync, copyFileSync, mkdirSync } = require('node:fs')
const { execFileSync } = require('node:child_process')
const { createHash } = require('node:crypto')
const metadata = JSON.parse(readFileSync('package.json', 'utf8'))
const binary = 'skia.linux-x64-gnu.node'
mkdirSync('dist/package', { recursive: true })
for (const file of [...metadata.files, 'LICENSE', binary]) copyFileSync(file, `dist/package/${file}`)
const manifest = {
  name: metadata.name, version: '0.1.100-ldt.1', description: metadata.description,
  main: metadata.main, types: 'index.d.ts', license: metadata.license,
  repository: 'github:stampedeapp/canvas', engines: metadata.engines,
  os: ['linux'], cpu: ['x64'], libc: ['glibc'],
}
writeFileSync('dist/package/package.json', JSON.stringify(manifest, null, 2) + '\n')
const provenance = {
  canvasVersion: metadata.version,
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  skiaCommit: execFileSync('git', ['-C', 'skia', 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  brotliVersion: '1.0.9-snapshot+block-switch-security-backport',
  securityFix: 'CVE-2026-111497',
  patchSha256: createHash('sha256').update(readFileSync('scripts/ldt/brotli-block-switch.patch')).digest('hex'),
  decoderSourceSha256: createHash('sha256').update(readFileSync('skia/third_party/externals/brotli/c/dec/decode.c')).digest('hex'),
  decoderHeaderSha256: createHash('sha256').update(readFileSync('skia/third_party/externals/brotli/c/include/brotli/decode.h')).digest('hex'),
  brotliCommit: execFileSync('git', ['-C', 'skia/third_party/externals/brotli', 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  binarySha256: createHash('sha256').update(readFileSync(binary)).digest('hex'),
}
if (provenance.brotliCommit !== '6d03dfbedda1615c4cba1211f8d81735575209c8') throw new Error('Wrong Brotli source')
if (provenance.decoderSourceSha256 !== '80ed02b1ceac94a3110872b522c9943c00f10b02763a688d11ec6cf4c6256ef5') throw new Error('Wrong patched decoder source')
if (provenance.decoderHeaderSha256 !== 'bf1d06a63b3c2e834b3f36d51b86584e11873568d3d514c9a2269c81ea1705a7') throw new Error('Wrong patched decoder header')
if (!readFileSync(binary).includes(Buffer.from('BLOCK_SWITCH'))) throw new Error('Patched decoder error string absent from addon')
writeFileSync('dist/package/BUILD-PROVENANCE.json', JSON.stringify(provenance, null, 2) + '\n')
writeFileSync('dist/BUILD-PROVENANCE.json', JSON.stringify(provenance, null, 2) + '\n')
execFileSync('npm', ['pack', './dist/package', '--pack-destination', 'dist', '--ignore-scripts'], { stdio: 'inherit' })
console.log(JSON.stringify(provenance, null, 2))
