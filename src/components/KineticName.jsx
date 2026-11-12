import { useCallback, useEffect, useMemo, useRef } from 'react'

import { usePointerRef, useAnimationFrame } from '../lib/usePointer.js'
import { useReducedMotion, useFinePointer } from '../lib/useReducedMotion.js'
import './KineticName.css'

/** How far from a letter the pointer still has an effect, in px. */
const RADIUS = 300
/** Variable-font weight at rest and at full attention.
 *  Rest sits high enough that the name reads confident before the visitor
 *  moves the pointer at all, and close enough to the static fallback that the
 *  two versions of the page look like the same design. */
const WEIGHT_REST = 545
const WEIGHT_PEAK = 700
/** Peak lean, in degrees, and peak lift, in px. */
const SKEW_MAX = 9
const LIFT_MAX = 6
/** Per-frame easing. Lower is heavier; this lands around 120ms to settle. */
const SMOOTHING = 0.16

/**
 * The name, set enormous, where each letter thickens and leans toward the
 * cursor.
 *
 * Three things make this cheap enough to run every frame:
 *  1. Letter positions are measured once and cached, so the loop only writes
 *     styles and never reads layout — no forced synchronous reflow.
 *  2. Per-letter state lives in a ref, not React state, so a pointer move
 *     never triggers a render.
 *  3. Only `transform` and `font-variation-settings` change, both of which
 *     are composited and do not reflow the line.
 *
 * @param {{
 *   lines: string[],
 *   dimLine?: number,
 *   className?: string
 * }} props
 */
export default function KineticName({ lines, dimLine = 1, className = '' }) {
  const reduced = useReducedMotion()
  const fine = useFinePointer()
  const animate = !reduced && fine

  const rootRef = useRef(null)
  const charsRef = useRef([])
  /** Cached letter centres, refreshed on resize and font load. */
  const centresRef = useRef([])
  /** Per-letter eased attention value, 0 → 1. */
  const levelsRef = useRef([])

  const pointer = usePointerRef(animate)

  // Give every letter a stable index so the bounce can stagger and the loop
  // can line up centres, levels and nodes by position.
  const letters = useMemo(() => {
    let index = 0
    return lines.map((line) =>
      [...line].map((char) => ({ char, index: index++ }))
    )
  }, [lines])

  const total = useMemo(
    () => letters.reduce((n, line) => n + line.length, 0),
    [letters]
  )

  const measure = useCallback(() => {
    centresRef.current = charsRef.current.map((node) => {
      if (!node) return null
      const r = node.getBoundingClientRect()
      return {
        // Stored in document space so page scroll does not invalidate them.
        x: r.left + r.width / 2 + window.scrollX,
        y: r.top + r.height / 2 + window.scrollY,
      }
    })
  }, [])

  useEffect(() => {
    levelsRef.current = new Array(total).fill(0)
  }, [total])

  // Measure after layout, after webfonts land (Space Grotesk changes every
  // letter's width, so measuring before it loads caches wrong positions), and
  // on resize.
  useEffect(() => {
    if (!animate) return

    measure()

    const onResize = () => measure()
    window.addEventListener('resize', onResize)

    const observer = new ResizeObserver(measure)
    if (rootRef.current) observer.observe(rootRef.current)

    document.fonts?.ready.then(measure).catch(() => {})

    return () => {
      window.removeEventListener('resize', onResize)
      observer.disconnect()
    }
  }, [animate, measure])

  // Reset to rest when the effect is switched off mid-session, e.g. the
  // visitor turns on Reduce Motion while the page is open.
  useEffect(() => {
    if (animate) return
    for (const node of charsRef.current) {
      if (!node) continue
      node.style.removeProperty('--w')
      node.style.removeProperty('--sk')
      node.style.removeProperty('--ty')
      node.style.removeProperty('--sc')
    }
  }, [animate])

  useAnimationFrame(() => {
    const { x, y, active } = pointer.current
    const centres = centresRef.current
    const levels = levelsRef.current
    const px = x + window.scrollX
    const py = y + window.scrollY

    for (let i = 0; i < charsRef.current.length; i += 1) {
      const node = charsRef.current[i]
      const centre = centres[i]
      if (!node || !centre) continue

      const dx = px - centre.x
      const dy = py - centre.y

      // Vertical distance is weighted up so the effect reads as a horizontal
      // sweep along the line rather than a circular blob.
      const distance = Math.hypot(dx, dy * 1.6)
      const target = active ? Math.max(0, 1 - distance / RADIUS) : 0
      // Smoothstep: a linear falloff looks like a hard edge in motion.
      const eased = target * target * (3 - 2 * target)

      const level = levels[i] + (eased - levels[i]) * SMOOTHING
      levels[i] = level

      // Below this the style write is invisible; skipping it keeps the loop
      // from touching every letter on every frame once things settle.
      if (level < 0.002) {
        if (node.style.getPropertyValue('--w') !== '') {
          node.style.removeProperty('--w')
          node.style.removeProperty('--sk')
          node.style.removeProperty('--ty')
          node.style.removeProperty('--sc')
        }
        continue
      }

      const lean = Math.max(-1, Math.min(1, dx / RADIUS))

      node.style.setProperty(
        '--w',
        String(Math.round(WEIGHT_REST + (WEIGHT_PEAK - WEIGHT_REST) * level))
      )
      node.style.setProperty('--sk', `${(-lean * level * SKEW_MAX).toFixed(2)}deg`)
      node.style.setProperty('--ty', `${(-level * LIFT_MAX).toFixed(2)}px`)
      node.style.setProperty('--sc', (1 + level * 0.035).toFixed(4))
    }
  }, animate)

  const label = lines.join(' ')

  return (
    <span
      ref={rootRef}
      className={`kinetic ${animate ? '' : 'kinetic--static'} ${className}`.trim()}
    >
      {/* Screen readers get the name once, as a name — not as 12 letters. */}
      <span className="sr-only">{label}</span>

      <span aria-hidden="true">
        {letters.map((line, lineIndex) => (
          <span
            key={lineIndex}
            className={`kinetic__line${
              lineIndex === dimLine ? ' kinetic__line--dim' : ''
            }`}
          >
            {line.map(({ char, index }) => (
              <span
                key={index}
                ref={(node) => {
                  charsRef.current[index] = node
                }}
                className="kinetic__char"
                style={{ '--i': index }}
              >
                {char}
              </span>
            ))}
          </span>
        ))}
      </span>
    </span>
  )
}
