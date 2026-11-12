/**
 * Reads the real colour values out of src/styles/tokens.css and asserts every
 * foreground/background pair the design actually uses clears WCAG AA.
 *
 * This matters more than usual here: the site is near-monochrome, so contrast
 * is the only thing separating one level of the hierarchy from the next. There
 * is one accent and no other hue to fall back on.
 *
 * The palette is light, which inverts the worst case: dark type is hardest to
 * read on the DARKEST surface (--surface-3), not the lightest, so that pair is
 * asserted too.
 *
 * Three checks, because the numeric one alone was not enough:
 *
 *   1. PAIRS      the declared foreground/background pairs, as before.
 *   2. ROLES      every token has declared roles, and component CSS may only
 *                 use it in one of them. This exists because the numeric check
 *                 is structurally blind to misuse: --line-strong was asserted
 *                 only against the 3:1 non-text minimum, then used as a text
 *                 colour (.card__dash) where it measures 3.34:1. No pair in
 *                 the table was wrong; the token was in the wrong slot.
 *   3. LITERALS   no raw colour outside tokens.css. The README claims "there
 *                 are no hard-coded colours in components" and the code did
 *                 not match.
 *
 * Deliberate limits: border and outline declarations are not role-checked
 * (shorthand parsing is not worth the false positives, and borders are covered
 * numerically by the line-strong pairs). Component-local custom properties
 * like --btn-fg are skipped, because they are assigned from real tokens that
 * are themselves checked — that indirection is the correct pattern, not a leak.
 *
 * Run with `npm run check:contrast`. Exits non-zero on failure.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const TOKENS_REL = 'src/styles/tokens.css'
const css = readFileSync(join(ROOT, TOKENS_REL), 'utf8')

const token = (name) => {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))
  if (!m) throw new Error(`token --${name} not found in tokens.css`)
  return m[1]
}

const luminance = (hex) => {
  const [r, g, b] = hex
    .replace('#', '')
    .match(/../g)
    .map((h) => {
      const v = parseInt(h, 16) / 255
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** [foreground, background, label, minimum] */
const PAIRS = [
  // Text, on each surface it can land on.
  ['text', 'bg', 'primary text on the page', 4.5],
  ['text', 'surface', 'primary text on a card', 4.5],
  ['text', 'surface-2', 'primary text on a hovered card', 4.5],
  ['text', 'surface-3', 'primary text on an active pill', 4.5],
  ['text-2', 'bg', 'secondary text on the page', 4.5],
  ['text-2', 'surface', 'secondary text on a card', 4.5],
  ['text-2', 'surface-2', 'secondary text on a hovered card', 4.5],
  ['text-3', 'bg', 'metadata on the page', 4.5],
  ['text-3', 'surface', 'metadata on a card', 4.5],
  ['text-3', 'surface-2', 'metadata on a hovered card', 4.5],
  // The accent is text in several places and must hold up on every surface.
  ['accent', 'bg', 'accent as text on the page', 4.5],
  ['accent', 'surface', 'accent as text on a card', 4.5],
  ['accent', 'accent-dim', 'accent on its own tinted fill', 4.5],
  // Inverted fills: the primary button and the skip link, at rest and hovered.
  ['bg', 'text', 'page colour as text on the primary fill', 4.5],
  ['bg', 'text-deep', 'page colour as text on the deepened primary fill', 4.5],
  ['bg', 'accent', 'page colour as the arrow on an accent fill', 4.5],
  // Non-text, 3:1 (WCAG 1.4.11).
  ['line-strong', 'bg', 'meaningful border on the page', 3.0],
  ['line-strong', 'surface', 'meaningful border on a card', 3.0],
  ['accent', 'surface-2', 'status dot against a hovered card', 3.0],

  // The brain runs inverted, so its pairs are asserted against its own
  // surface rather than the page.
  ['brain-text', 'brain-bg', 'node label in the brain', 4.5],
  ['brain-text-2', 'brain-bg', 'dimmed label and hint in the brain', 4.5],
  ['c-internships', 'brain-bg', 'Internships hub label', 4.5],
  ['c-projects', 'brain-bg', 'Projects hub label', 4.5],
  ['c-usc', 'brain-bg', 'USC hub label', 4.5],
  // Edges are graphical objects needed to understand the graph (WCAG 1.4.11).
  ['brain-line', 'brain-bg', 'ordinary edge in the brain', 3.0],
  ['c-cross', 'brain-bg', 'cross-group edge in the brain', 3.0],
  ['brain-bg', 'bg', 'the inset against the page', 3.0],
  ['brain-bg', 'brain-text', 'inset colour as selected text in the brain', 4.5],
  // The panel below the inset is on the page, so the cluster hues need a
  // second, darker set. Asserted against both surfaces they can land on.
  ['c-internships-ink', 'bg', 'Internships label in the panel', 4.5],
  ['c-internships-ink', 'surface', 'Internships label on a card', 4.5],
  ['c-projects-ink', 'bg', 'Projects label in the panel', 4.5],
  ['c-projects-ink', 'surface', 'Projects label on a card', 4.5],
  ['c-usc-ink', 'bg', 'USC label in the panel', 4.5],
  ['c-usc-ink', 'surface', 'USC label on a card', 4.5],
]

/**
 * What each token is allowed to be. A token used outside its roles is a
 * category error — the thing the numeric table cannot see.
 *
 *   text     legal as a `color` value
 *   surface  legal as a `background` value
 *   line     borders, outlines, rules, decoration
 *
 * @type {Record<string, ('text'|'surface'|'line')[]>}
 */
const ROLES = {
  // Near-black is also a foreground: it is the label on the white primary
  // button, the skip link, and ::selection.
  bg: ['surface', 'text'],
  surface: ['surface'],
  'surface-2': ['surface'],
  'surface-3': ['surface'],
  // Both also carry 'surface': a hairline is routinely drawn by painting a
  // 1-2px element's background (.nav__rule, .eyebrow::after, the timeline
  // spine), which is correct. The rule worth enforcing is narrower and is the
  // one that caught a real defect: a line token must never be a text colour.
  line: ['line', 'surface'],
  'line-strong': ['line', 'surface'],
  // On a light page the loudest signal available is maximum darkness, so the
  // primary fill is the text token. That is the design, hence both roles.
  text: ['text', 'surface'],
  // Deeper than --text and only ever a fill (primary button hover).
  'text-deep': ['surface'],
  'text-2': ['text'],
  'text-3': ['text'],
  accent: ['text', 'line', 'surface'],
  'accent-dim': ['surface'],

  // Brain tokens. The cluster hues are a dot fill, a hub label and an edge
  // stroke, so they legitimately hold all three roles.
  // Both roles each, and for the same reason --text/--bg carry both on the
  // page: ::selection inverts them. The inverted pair is asserted below.
  'brain-bg': ['surface', 'text'],
  'brain-text': ['text', 'surface'],
  'brain-text-2': ['text'],
  'brain-line': ['line', 'surface'],
  'c-internships': ['text', 'line', 'surface'],
  'c-projects': ['text', 'line', 'surface'],
  'c-usc': ['text', 'line', 'surface'],
  'c-cross': ['text', 'line', 'surface'],
  'c-internships-ink': ['text', 'line'],
  'c-projects-ink': ['text', 'line'],
  'c-usc-ink': ['text', 'line'],
}

/**
 * Raw colour outside tokens.css. Each entry needs a reason.
 *
 *   hsl(${hue} 70% 26%)  useKonami generates the accent at runtime; that is the
 *                        egg's whole mechanism, and the pinned 70%/26% is
 *                        itself the guard that keeps every hue above 4.5:1 on
 *                        both the page and a white card.
 */
const ALLOW_LITERAL = new Set(['hsl(${hue} 70% 26%)'])

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) return []
    return entry.isDirectory() ? walk(full) : [full]
  })

// Lookbehind for a hyphen or word char so `border-color`, `background-color`
// and `text-decoration-color` do not read as `color`. This is the exact trap a
// naive grep falls into.
const COLOR_DECL = /(?<![-\w])color\s*:\s*var\(\s*(--[a-z0-9-]+)/gi
const BACKGROUND_DECL = /(?<![-\w])background(?:-color)?\s*:[^;{}]*?var\(\s*(--[a-z0-9-]+)/gi
const LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\([^)]*\)|\bhsla?\([^)]*\)/g

const lineOf = (source, index) => source.slice(0, index).split('\n').length

/** @type {string[]} */
const roleErrors = []
/** @type {string[]} */
const literalErrors = []

const sources = walk(join(ROOT, 'src')).filter((f) => /\.(css|js|jsx)$/.test(f))

for (const file of sources) {
  const rel = relative(ROOT, file)
  const source = readFileSync(file, 'utf8')
  const isTokens = rel === TOKENS_REL

  if (!isTokens && /\.css$/.test(file)) {
    for (const [decl, role] of [
      [COLOR_DECL, 'text'],
      [BACKGROUND_DECL, 'surface'],
    ]) {
      decl.lastIndex = 0
      for (const m of source.matchAll(decl)) {
        const name = m[1].replace(/^--/, '')
        const roles = ROLES[name]
        if (!roles) continue // component-local custom property; see header
        if (!roles.includes(role)) {
          roleErrors.push(
            `      ${rel}:${lineOf(source, m.index)}  --${name} used as ${role}` +
              ` (declared: ${roles.join(', ')})`
          )
        }
      }
    }
  }

  if (!isTokens) {
    for (const m of source.matchAll(LITERAL)) {
      if (ALLOW_LITERAL.has(m[0])) continue
      literalErrors.push(`      ${rel}:${lineOf(source, m.index)}  ${m[0]}`)
    }
  }
}

// ---- 1. Numeric pairs ------------------------------------------------------
let failed = 0
console.log('\ncontrast — src/styles/tokens.css (warm light, one accent)\n')
for (const [fg, bg, label, min] of PAIRS) {
  const r = ratio(token(fg), token(bg))
  const pass = r >= min
  if (!pass) failed++
  console.log(`  ${pass ? 'pass' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${label}`)
}

// Decorative hairline: deliberately faint, recorded so a future change to it
// is a conscious one rather than a silent regression.
console.log(
  `\n  note  ${ratio(token('line'), token('bg')).toFixed(2)}:1  --line on --bg — decorative hairline, no minimum`
)

if (failed) console.error(`\n  ${failed} pair(s) below the minimum`)
else console.log(`\n  all ${PAIRS.length} pairs pass`)

// ---- 2. Token roles --------------------------------------------------------
console.log('\ntoken roles — a token used outside its declared role\n')
if (roleErrors.length) {
  console.error(`  FAIL  ${roleErrors.length} misuse(s)`)
  console.error(roleErrors.join('\n'))
  console.error(
    '\n      A line token rendered as text is not caught by the pair table:' +
      '\n      it is asserted at the 3:1 border minimum, not the 4.5:1 text floor.'
  )
} else {
  console.log('  pass  every token is used only in a role it declares')
}

// ---- 3. Raw colour literals ------------------------------------------------
console.log('\nraw colour — anything outside tokens.css\n')
if (literalErrors.length) {
  console.error(`  FAIL  ${literalErrors.length} literal(s) outside ${TOKENS_REL}`)
  console.error(literalErrors.join('\n'))
  console.error('\n      Promote each to a token, or the pair table cannot see it.')
} else {
  console.log(`  pass  every colour comes from ${TOKENS_REL}`)
}

console.log('')
if (failed || roleErrors.length || literalErrors.length) process.exit(1)
