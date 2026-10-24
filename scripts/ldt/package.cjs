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
  brotliVersion: '1.0.10',
  brotliCommit: execFileSync('git', ['-C', 'skia/third_party/externals/brotli', 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  binarySha256: createHash('sha256').update(readFileSync(binary)).digest('hex'),
}
if (provenance.brotliCommit !== '3646606894cd8b8c75d79a569b6c95a33c699d63') throw new Error('Wrong Brotli source')
if (!readFileSync(binary).includes(Buffer.from('BLOCK_SWITCH'))) throw new Error('Patched decoder error string absent from addon')
writeFileSync('dist/package/BUILD-PROVENANCE.json', JSON.stringify(provenance, null, 2) + '\n')
writeFileSync('dist/BUILD-PROVENANCE.json', JSON.stringify(provenance, null, 2) + '\n')
execFileSync('npm', ['pack', './dist/package', '--pack-destination', 'dist', '--ignore-scripts'], { stdio: 'inherit' })
console.log(JSON.stringify(provenance, null, 2))
