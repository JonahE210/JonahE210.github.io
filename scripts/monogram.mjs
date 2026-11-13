/**
 * The JE monogram, drawn rather than set.
 *
 * Icons are authored geometry here, not glyphs from whatever font happens to
 * be installed — so the mark is generated from a centreline and a simulated
 * broad nib. Run `npm run monogram` after changing anything below; the PNG
 * fallbacks are regenerated separately (see README > Favicon).
 *
 * Two things this had to survive, both of which killed earlier attempts:
 *
 *  - **16px.** One grid unit is half a pixel there, so `min` is a hard floor
 *    under every stroke. True calligraphic contrast — a hairline against a
 *    heavy stem — simply does not render at tab size, so the thick/thin here
 *    is compressed on purpose.
 *  - **Terminals.** A chisel nib leaves a flat edge at its own angle. Leaning
 *    the cap fully to that angle is honest but leaves a long thin wedge, so
 *    the lean is blended. Caps and tapers are also mutually exclusive: a
 *    terminal is either a pen lift or a flat edge, never both.
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const lerp = (a, b, t) => a + (b - a) * t

/** Point on a cubic bezier. */
function at(p0, p1, p2, p3, t) {
  const u = 1 - t
  return {
    x: u*u*u*p0.x + 3*u*u*t*p1.x + 3*u*t*t*p2.x + t*t*t*p3.x,
    y: u*u*u*p0.y + 3*u*u*t*p1.y + 3*u*t*t*p2.y + t*t*t*p3.y,
  }
}
/** Derivative, for the tangent. */
function deriv(p0, p1, p2, p3, t) {
  const u = 1 - t
  return {
    x: 3*u*u*(p1.x-p0.x) + 6*u*t*(p2.x-p1.x) + 3*t*t*(p3.x-p2.x),
    y: 3*u*u*(p1.y-p0.y) + 6*u*t*(p2.y-p1.y) + 3*t*t*(p3.y-p2.y),
  }
}

/**
 * @param {Array<[number,number]>} pts  flat chain: P0 C1 C2 P1 C1 C2 P2 ...
 * @param {object} o  nib: degrees; w: max half-width; min: hairline half-width;
 *                    enter/exit: 0-1 taper fractions; samples per segment
 */
function nibStroke(pts, o = {}) {
  const nib = ((o.nib ?? 32) * Math.PI) / 180
  const W = o.w ?? 2.6
  const MIN = o.min ?? 0.42
  // A terminal is either a pen lift (taper to nothing) or a flat chisel edge.
  // It cannot be both: applying a cap width on top of a taper makes the
  // outline jump, which is exactly the spike this produced the first time.
  const capStart = o.capStart ?? false
  const capEnd = o.capEnd ?? false
  const enter = capStart ? 0 : (o.enter ?? 0.1)
  const exit = capEnd ? 0 : (o.exit ?? 0.14)
  const N = o.samples ?? 14

  const segs = []
  for (let i = 0; i + 3 < pts.length; i += 3) {
    segs.push(pts.slice(i, i + 4).map(([x, y]) => ({ x, y })))
  }

  const left = []
  const right = []
  const total = segs.length * N
  // A chisel nib does not leave a rounded or square-on cap: it leaves a flat
  // edge at the nib's own angle. Offsetting the terminals along the nib axis
  // instead of the stroke normal is what removes the little spike the taper
  // was producing at the top of the J.
  // How far the terminal leans toward the nib angle. Full lean is
  // geometrically honest but leaves a long thin wedge where the flat edge
  // meets the stroke side; leaning part-way keeps the chisel read without
  // the spike.
  const lean = o.capLean ?? 0.55

  segs.forEach((s, si) => {
    for (let k = 0; k <= N; k += 1) {
      if (si > 0 && k === 0) continue // seam
      const t = k / N
      const p = at(s[0], s[1], s[2], s[3], t)
      const v = deriv(s[0], s[1], s[2], s[3], t)
      const len = Math.hypot(v.x, v.y) || 1e-6
      const theta = Math.atan2(v.y, v.x)

      // The pen: wide across the nib, hairline along it.
      let half = Math.max(MIN, W * Math.abs(Math.sin(theta - nib)))

      // Pen lifts at the ends, so the stroke enters and leaves on a taper.
      const g = (si * N + k) / total
      if (g < enter) half = lerp(MIN * 0.55, half, g / enter)
      if (g > 1 - exit) half = lerp(MIN * 0.55, half, (1 - g) / exit)

      // At a chisel terminal the offset runs along the nib axis, not the
      // stroke normal — same width, rotated — so the edge lands flat.
      const atStart = si === 0 && k === 0
      const atEnd = si === segs.length - 1 && k === N
      const isCap = (capStart && atStart) || (capEnd && atEnd)
      let nx = -v.y / len
      let ny = v.x / len
      if (isCap) {
        const bx = nx * (1 - lean) + Math.cos(nib) * lean
        const by = ny * (1 - lean) + Math.sin(nib) * lean
        const bl = Math.hypot(bx, by) || 1
        nx = bx / bl
        ny = by / bl
      }
      left.push([p.x + nx * half, p.y + ny * half])
      right.push([p.x - nx * half, p.y - ny * half])
    }
  })

  // 2dp is well under a tenth of a pixel at 180px and roughly quarters the file.
  const f = (n) => Math.round(n * 100) / 100
  const path = [
    `M${f(left[0][0])} ${f(left[0][1])}`,
    ...left.slice(1).map(([x, y]) => `L${f(x)} ${f(y)}`),
    ...right.reverse().map(([x, y]) => `L${f(x)} ${f(y)}`),
    'Z',
  ].join('')
  return path
}

const INK='#1f1d1a', PAPER='#f7f4ef'
const fill=(d)=>`<path d="${d}" fill="${PAPER}"/>`
const svg=(b)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="JE"><rect width="32" height="32" rx="7.5" fill="${INK}"/><path d="${b}" fill="${PAPER}"/></svg>`

// The J: one descending stroke, swelling through the middle, hooking left.
// Flat cap at the crown, tapered flick at the tail.
const J = nibStroke(
  [[12.4,5.2],[12.9,10],[12.9,15],[12.6,19.2],
   [12.3,22.9],[10.1,26.2],[6.9,26.0],
   [5.1,25.9],[4.0,24.6],[4.0,22.9]],
  { nib:36, w:3.0, min:1.14, capStart:true, exit:.22, samples:16 }
)
// The E: an uncial bowl, open right, with its bar. Round rather than square
// because a square E beside a curved J reads as two unrelated objects.
const Ebowl = nibStroke(
  [[26.4,10.9],[23.8,8.7],[19.1,9.5],[18.1,12.7],
   [17.3,15.5],[19.5,18.1],[23.6,17.9],
   [25.2,17.8],[26.2,17.2],[26.6,16.5]],
  { nib:38, w:2.5, min:1.06, capStart:true, exit:.2, samples:16 }
)
const Ebar = nibStroke(
  [[18.4,13.9],[20.8,13.4],[23.2,13.3],[25.0,13.4]],
  { nib:26, w:1.72, min:1.0, capStart:true, capEnd:true, samples:12 }
)

const mark = [J, Ebowl, Ebar].join(' ')
// The rounded tile is the favicon. scripts/monogram-png.mjs derives the
// full-bleed variant for apple-touch-icon from this same path data, because
// iOS applies its own mask and a pre-rounded tile gets rounded twice.
const ROOT = fileURLToPath(new URL('..', import.meta.url))
const rounded = svg(mark)
writeFileSync(join(ROOT, 'public/favicon.svg'), rounded)
console.log(`public/favicon.svg   ${rounded.length} bytes`)
