/**
 * GitHub Pages serves static files, and this is a client-rendered SPA, so a
 * deep link like /work/clawguard has nothing to serve and 404s.
 *
 * The usual fix is to copy index.html to 404.html and let Pages fall back to
 * it. That works, but every real page then answers with an HTTP 404 — fine
 * for a human, wrong for a crawler or a link unfurler.
 *
 * So: emit a real index.html at each route the app actually has. Those answer
 * 200. 404.html stays as the catch-all for routes that genuinely do not
 * exist, which is the one case where a 404 status is correct.
 *
 * This does not make the content crawlable — the HTML is still the empty SPA
 * shell. That needs rendering at build time, which is what the planned Astro
 * move is for. This fixes the status codes, not the emptiness.
 */
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import projects from '../src/data/projects.js'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')
const SHELL = join(DIST, 'index.html')

readFileSync(SHELL) // fail loudly if the build did not run

const routes = ['work', 'life', ...projects.map((p) => `work/${p.slug}`)]

for (const route of routes) {
  const dir = join(DIST, route)
  mkdirSync(dir, { recursive: true })
  copyFileSync(SHELL, join(dir, 'index.html'))
}
copyFileSync(SHELL, join(DIST, '404.html'))

console.log(
  `\nroutes — ${routes.length} static shells + 404.html\n` +
    routes.map((r) => `  /${r}`).join('\n') +
    '\n'
)
