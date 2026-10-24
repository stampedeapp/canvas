const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { createRequire } = require('node:module')
const { createHash } = require('node:crypto')
const { execFileSync } = require('node:child_process')
const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'canvas-platform-'))
const tarball = path.resolve('dist/napi-rs-canvas-linux-x64-gnu-0.1.100-ldt.1.tgz')
const provenance = JSON.parse(fs.readFileSync('dist/BUILD-PROVENANCE.json', 'utf8'))
fs.writeFileSync(path.join(workspace, 'package.json'), JSON.stringify({
  private: true,
  dependencies: { '@napi-rs/canvas': '0.1.100' },
  overrides: { '@napi-rs/canvas-linux-x64-gnu': `file:${tarball}` },
}))
execFileSync('npm', ['install', '--prefix', workspace, '--ignore-scripts'], { stdio: 'inherit' })
const wrapperPath = path.join(workspace, 'node_modules/@napi-rs/canvas')
const requireWrapper = createRequire(path.join(wrapperPath, 'index.js'))
const nativePath = requireWrapper.resolve('@napi-rs/canvas-linux-x64-gnu')
if (createHash('sha256').update(fs.readFileSync(nativePath)).digest('hex') !== provenance.binarySha256) {
  throw new Error('Original wrapper did not resolve the patched native package')
}
const output = execFileSync(process.execPath, ['scripts/ldt/render-smoke.cjs', wrapperPath], { encoding: 'utf8' })
fs.writeFileSync('dist/render-platform-package.json', output)
console.log(output)
