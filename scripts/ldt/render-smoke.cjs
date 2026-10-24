const assert = require('node:assert/strict')
const { createHash } = require('node:crypto')
const path = require('node:path')
process.env.DISABLE_SYSTEM_FONTS_LOAD = '1'
const { createCanvas, loadImage, GlobalFonts } = require(path.resolve(process.argv[2] || '.'))
const digest = (buffer) => createHash('sha256').update(buffer).digest('hex')

async function main() {
  const results = {}
  // All fixtures come from the upstream canvas repository.
  for (const [file, family] of [
    ['SourceSerifPro-Regular.ttf', 'LdtSerif'],
    ['Lato-Regular.ttf', 'LdtSans'],
    ['Cascadia.woff2', 'LdtWoff'],
  ]) {
    assert.ok(GlobalFonts.registerFromPath(path.resolve('__test__/fonts', file), family), file)
  }
  const canvas = createCanvas(640, 360)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 640, 360)
  const gradient = ctx.createLinearGradient(0, 0, 640, 0)
  gradient.addColorStop(0, '#1967d2')
  gradient.addColorStop(1, '#34a853')
  ctx.fillStyle = gradient
  ctx.fillRect(20, 20, 600, 80)
  for (const [index, family] of ['LdtSerif', 'LdtSans', 'LdtWoff'].entries()) {
    ctx.font = `24px ${family}`
    ctx.fillStyle = '#112233'
    ctx.fillText('Ticket 123 — Café / Chart £42', 20, 145 + index * 45)
    results[family] = ctx.measureText('Ticket 123 — Café / Chart £42').width
  }
  const svg = await loadImage(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="18" fill="#ff0000"/></svg>'))
  ctx.drawImage(svg, 550, 280)
  for (const format of ['png', 'jpeg', 'webp', 'avif']) {
    const encoded = await canvas.encode(format)
    assert.ok(encoded.length > 100, format)
    const decoded = await loadImage(encoded)
    assert.equal(decoded.width, 640)
    assert.equal(decoded.height, 360)
    results[format] = digest(encoded)
  }
  const pixels = ctx.getImageData(0, 0, 640, 360).data
  assert.deepEqual(Array.from(pixels.slice(0, 4)), [255, 255, 255, 255])
  results.pixels = digest(pixels)
  console.log(JSON.stringify(results, null, 2))
}
main().catch((error) => { console.error(error); process.exitCode = 1 })
