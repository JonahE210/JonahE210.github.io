import { useLayoutEffect, useRef } from 'react'

/** Give up waiting for the observer after this long and just show the content. */
const FAILSAFE_MS = 1200

/**
 * Fades and lifts an element into place the first time it scrolls into view.
 *
 * The important property here is that content is never hidden unless this hook
 * has actively hidden it. An earlier version hid every `.reveal` in CSS and
 * relied on an IntersectionObserver callback to show it again, which meant any
 * failure — no JS, a delayed callback, an observer that never fires — left a
 * blank section with no error. For a page whose whole job is to be read, that
 * is the worst possible failure mode.
 *
 * So, in order:
 *  1. No JS or no IntersectionObserver → the element was never hidden. Done.
 *  2. Already on screen at mount → show immediately, never hide it at all.
 *  3. Below the fold → hide it (before paint, so there is no flash), observe,
 *     and reveal on intersection.
 *  4. Observer never reports within FAILSAFE_MS → reveal anyway.
 *
 * @param {boolean} enabled  False under reduced motion: nothing is hidden and
 *                           nothing animates.
 */
export function useReveal(enabled = true) {
  const ref = useRef(null)

  // Layout effect, not effect: arming happens before the browser paints, so
  // the element never flashes in at full opacity and then disappears.
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return

    if (!enabled || typeof IntersectionObserver === 'undefined') {
      node.classList.add('is-in')
      return
    }

    const rect = node.getBoundingClientRect()
    const viewport = window.innerHeight || document.documentElement.clientHeight
    if (rect.top < viewport && rect.bottom > 0) {
      node.classList.add('is-in')
      return
    }

    node.classList.add('reveal--armed')

    let observer = null
    let timer = 0
    let done = false

    const show = () => {
      if (done) return
      done = true
      node.classList.add('is-in')
      observer?.disconnect()
      clearTimeout(timer)
    }

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) show()
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.1 }
    )
    observer.observe(node)
    timer = setTimeout(show, FAILSAFE_MS)

    return () => {
      observer?.disconnect()
      clearTimeout(timer)
    }
  }, [enabled])

  return ref
}
