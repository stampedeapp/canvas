// Build a native-only tarball from the already verified self-contained artifact.
const { readFileSync, writeFileSync, mkdirSync, copyFileSync } = require('node:fs')
const { createHash } = require('node:crypto')
const { execFileSync } = require('node:child_process')
const provenance = JSON.parse(readFileSync('dist/package/BUILD-PROVENANCE.json', 'utf8'))
const binary = 'skia.linux-x64-gnu.node'
if (createHash('sha256').update(readFileSync(`dist/package/${binary}`)).digest('hex') !== provenance.binarySha256) {
  throw new Error('Input native binary checksum mismatch')
}
mkdirSync('dist/platform', { recursive: true })
for (const file of [binary, 'LICENSE', 'BUILD-PROVENANCE.json']) copyFileSync(`dist/package/${file}`, `dist/platform/${file}`)
writeFileSync('dist/platform/package.json', JSON.stringify({
  name: '@napi-rs/canvas-linux-x64-gnu', version: '0.1.100-ldt.1',
  main: binary, license: 'MIT', repository: 'github:stampedeapp/canvas',
  os: ['linux'], cpu: ['x64'], libc: ['glibc'], engines: { node: '>=10' },
}, null, 2) + '\n')
execFileSync('npm', ['pack', './dist/platform', '--pack-destination', 'dist', '--ignore-scripts'], { stdio: 'inherit' })
