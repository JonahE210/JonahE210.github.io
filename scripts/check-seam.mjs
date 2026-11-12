/**
 * Phase 1 promises that Phase 2 is a one-file change: swap the bodies in
 * src/lib/content.js for fetch calls and delete src/data/.
 *
 * That promise only holds if nothing else imports src/data/ at runtime. This
 * checks it rather than trusting it. JSDoc `import('../data/x.js').Type`
 * annotations are fine — they are the shared type contract and compile away.
 *
 * Run with `npm run check:seam`. Exits non-zero on a leak.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

// fileURLToPath, not URL.pathname — the project directory name contains a
// space, which .pathname hands back percent-encoded.
const SRC = fileURLToPath(new URL('../src', import.meta.url))
const ALLOWED = 'lib/content.js'

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })

const RUNTIME_IMPORT = /^\s*import\s[^'"]*from\s+['"][^'"]*\/data\/[^'"]*['"]/gm

const leaks = []
for (const file of walk(SRC)) {
  if (!/\.(js|jsx)$/.test(file)) continue
  const rel = relative(SRC, file)
  if (rel === ALLOWED) continue

  const source = readFileSync(file, 'utf8')
  for (const match of source.matchAll(RUNTIME_IMPORT)) {
    const line = source.slice(0, match.index).split('\n').length
    leaks.push(`  src/${rel}:${line}  ${match[0].trim()}`)
  }
}

if (leaks.length) {
  console.error(
    `\nPhase 2 seam broken — ${leaks.length} runtime import(s) of src/data/ ` +
      `outside src/${ALLOWED}:\n`
  )
  console.error(leaks.join('\n'))
  console.error(`\nRoute the data through src/${ALLOWED} instead.\n`)
  process.exit(1)
}

console.log(`\nseam intact — only src/${ALLOWED} imports src/data/ at runtime\n`)
