// Keep the Skia revision and API unchanged; take Google's 1.0.10 security backport.
const { readFileSync, writeFileSync } = require('node:fs')
const { resolve } = require('node:path')
const depsPath = resolve(__dirname, '../../skia/DEPS')
const original = '6d03dfbedda1615c4cba1211f8d81735575209c8'
const fixed = '3646606894cd8b8c75d79a569b6c95a33c699d63'
const deps = readFileSync(depsPath, 'utf8')
const line = deps.split('\n').find((value) => value.includes('"third_party/externals/brotli"'))
if (!line || (!line.includes(original) && !line.includes(fixed))) {
  throw new Error('Unexpected Skia Brotli pin. Review the upstream dependency before building.')
}
writeFileSync(depsPath, deps.replace(original, fixed))
console.log(`Skia Brotli pinned to v1.0.10 (${fixed})`)
