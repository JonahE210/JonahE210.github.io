/**
 * Content guard.
 *
 * The frontend shipped with every outbound link pointing at a bare domain
 * (https://github.com/), two pointing at example.com, and a résumé PDF whose
 * body text read "PLACEHOLDER RESUME". None of that is a styling mistake — it
 * is the one class of defect that makes the site argue against its author, and
 * it is trivially machine-detectable. check:seam already proves an
 * architectural invariant this way; this does the same for content truth.
 *
 * The rules are deliberately shaped to keep working as content is replaced,
 * rather than blocklisting today's three bad URLs:
 *
 *   reserved-domain  example.com/.net/.org and localhost never resolve for a
 *                    visitor, whatever path they carry.
 *   bare-origin      a profile or repository URL always has a path. An http(s)
 *                    href with an empty path is a domain someone meant to
 *                    finish. (index.html is NOT scanned — preconnect hints are
 *                    legitimately bare origins and live there.)
 *   dead-href        '#', '', or anything carrying TODO/FIXME/CHANGEME.
 *   placeholder-text the literal PLACEHOLDER as a word, anywhere in content.
 *   resume-stub      the résumé is missing, implausibly small, or still says
 *                    PLACEHOLDER.
 *
 * Run with `npm run check:content`. Exits non-zero on any finding.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))

/** Scanned for hrefs and placeholder text. Add src/content/ after the Astro move. */
const CONTENT_ROOTS = ['src']
/** Extensions worth scanning inside those roots. */
const SCANNED = /\.(js|jsx|ts|tsx|astro|md|mdx|json)$/
/** Smallest plausible real résumé. The placeholder stub it replaced was 836 bytes. */
const MIN_RESUME_BYTES = 5_000
const RESUME = 'public/Jonah-Escobar.pdf'

/**
 * Origins that are legitimately bare. Empty on purpose: if something lands here
 * it should be because a reviewer decided it belongs, not by default.
 * @type {Set<string>}
 */
const ALLOW_BARE_ORIGIN = new Set()

const RESERVED_HOST =
  /^(.+\.)?(example\.(com|net|org)|localhost|invalid|test)$/i
const DEAD_HREF = /^(#|)$|TODO|FIXME|CHANGEME/i
/** Word-boundary so a sentence about placeholders does not trip it.
 *  Two copies on purpose: matchAll requires /g, and a /g regex carries
 *  lastIndex between .test() calls, which silently skips every other hit. */
const PLACEHOLDER_ALL = /\bPLACEHOLDER\b/g
const PLACEHOLDER_ONE = /\bPLACEHOLDER\b/

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) return []
    return entry.isDirectory() ? walk(full) : [full]
  })

/** @type {{rule: string, where: string, detail: string}[]} */
const findings = []
const add = (rule, where, detail) => findings.push({ rule, where, detail })

const lineOf = (source, index) => source.slice(0, index).split('\n').length

for (const root of CONTENT_ROOTS) {
  let files
  try {
    files = walk(join(ROOT, root))
  } catch {
    continue // root does not exist yet (e.g. src/content/ before the migration)
  }

  for (const file of files) {
    if (!SCANNED.test(file)) continue
    const rel = relative(ROOT, file)
    const source = readFileSync(file, 'utf8')

    for (const match of source.matchAll(PLACEHOLDER_ALL)) {
      add('placeholder-text', `${rel}:${lineOf(source, match.index)}`, match[0])
    }

    // Quoted string literals that look like absolute URLs or hrefs.
    for (const match of source.matchAll(/['"`]([^'"`\n]*)['"`]/g)) {
      const value = match[1]
      const at = `${rel}:${lineOf(source, match.index)}`

      if (/^https?:\/\//i.test(value)) {
        let url
        try {
          url = new URL(value)
        } catch {
          add('dead-href', at, value)
          continue
        }
        if (RESERVED_HOST.test(url.hostname)) {
          add('reserved-domain', at, value)
        } else if (
          (url.pathname === '/' || url.pathname === '') &&
          !url.search &&
          !url.hash &&
          !ALLOW_BARE_ORIGIN.has(url.origin)
        ) {
          add('bare-origin', at, value)
        }
      } else if (/TODO|FIXME|CHANGEME/i.test(value) && /^[#/]/.test(value)) {
        add('dead-href', at, value)
      }
    }
  }
}

// ---- The résumé ------------------------------------------------------------
const resumePath = join(ROOT, RESUME)
try {
  const { size } = statSync(resumePath)
  if (size < MIN_RESUME_BYTES) {
    add('resume-stub', RESUME, `${size} bytes — under the ${MIN_RESUME_BYTES} byte floor`)
  }
  // PDF text may be deflated; this catches the uncompressed stub we shipped.
  const bytes = readFileSync(resumePath, 'latin1')
  if (PLACEHOLDER_ONE.test(bytes)) {
    add('resume-stub', RESUME, 'contains the literal PLACEHOLDER')
  }
} catch {
  add(
    'resume-stub',
    RESUME,
    'missing — run `npm run resume:decrypt` (the plaintext is gitignored)'
  )
}

// ---- Report ----------------------------------------------------------------
console.log('\ncontent guard — outbound links, placeholder markers, résumé\n')

if (!findings.length) {
  console.log('  all clear — no placeholder content, no dead outbound links\n')
  process.exit(0)
}

const byRule = new Map()
for (const f of findings) {
  if (!byRule.has(f.rule)) byRule.set(f.rule, [])
  byRule.get(f.rule).push(f)
}

const EXPLAIN = {
  'reserved-domain': 'reserved or local hosts never resolve for a visitor',
  'bare-origin': 'a profile or repository URL has a path; this is an unfinished domain',
  'dead-href': 'empty, placeholder, or unparseable href',
  'placeholder-text': 'scaffolding text still present in content',
  'resume-stub': 'the most-clicked artefact on the site',
}

for (const [rule, items] of byRule) {
  console.error(`  ${rule} (${items.length}) — ${EXPLAIN[rule] ?? ''}`)
  for (const { where, detail } of items) {
    console.error(`      ${where}  ${detail}`)
  }
  console.error('')
}

console.error(
  `${findings.length} finding(s). Real content and real URLs, or remove the ` +
    `affordance — a missing button is survivable, a dead one is not.\n`
)
process.exit(1)
