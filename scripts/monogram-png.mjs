/**
 * PNG fallbacks for the monogram, rendered from public/favicon.svg so the
 * raster and the vector can never drift.
 *
 *   favicon-32.png      rounded tile, for anything that will not take an SVG icon
 *   apple-touch-icon.png  180px, square on purpose — iOS masks it itself, and a
 *                         tile that is already rounded comes out rounded twice
 *
 * Needs a browser, so it is a separate manual step rather than part of the
 * build: `node scripts/monogram-png.mjs`.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
// Dev-only, and not a project dependency — two PNGs a year does not justify
// shipping a browser driver in the lockfile. Point PLAYWRIGHT at an install
// if the bare import cannot resolve.
let chromium
try {
  // playwright-core is CJS, so the namespace may carry it under .default.
  const mod = await import(process.env.PLAYWRIGHT ?? 'playwright-core')
  chromium = mod.chromium ?? mod.default?.chromium
  if (!chromium) throw new Error('no chromium export')
} catch {
  console.error(
    '\nNeeds playwright-core. Either:\n' +
      '  npm i -D playwright-core\n' +
      '  PLAYWRIGHT=/abs/path/to/playwright-core node scripts/monogram-png.mjs\n'
  )
  process.exit(1)
}

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const svg = readFileSync(join(ROOT, 'public/favicon.svg'), 'utf8')

const shots = [
  { out: 'favicon-32.png', size: 32, markup: svg },
  { out: 'apple-touch-icon.png', size: 180, markup: svg.replace('rx="7.5"', 'rx="0"') },
]

const browser = await chromium.launch({ channel: 'chrome' })
for (const { out, size, markup } of shots) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  await page.setContent(
    `<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${markup}`
  )
  writeFileSync(join(ROOT, 'public', out), await page.screenshot({ omitBackground: true }))
  console.log(`public/${out}  ${size}x${size}`)
  await page.close()
}
await browser.close()
