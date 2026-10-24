// Keep Skia's exact Brotli snapshot; apply the security backport after syncing.
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const depsPath = resolve(__dirname, '../../skia/DEPS')
const original = '6d03dfbedda1615c4cba1211f8d81735575209c8'
const deps = readFileSync(depsPath, 'utf8')
const line = deps.split('\n').find((value) => value.includes('"third_party/externals/brotli"'))
if (!line || !line.includes(original)) {
  throw new Error('Unexpected Skia Brotli pin. Review the upstream dependency before building.')
}
console.log(`Verified Skia Brotli source pin: ${original}`)
