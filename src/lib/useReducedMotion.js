import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * True when the visitor has asked their OS to reduce motion.
 *
 * CSS handles transitions and animations on its own (see reset.css), but the
 * pointer-driven hero and the Konami bounce run in JS and cannot be switched
 * off from a stylesheet — they have to ask.
 *
 * Starts as `true` on the server / before hydration so that the quiet version
 * is the default and motion is opted into, never the reverse.
 *
 * @returns {boolean}
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => !window.matchMedia || window.matchMedia(QUERY).matches
  )

  useEffect(() => {
    if (!window.matchMedia) return
    const mq = window.matchMedia(QUERY)
    const onChange = () => setReduced(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/**
 * True only for devices with a real hover-capable, precise pointer. Touch
 * devices get the static treatment: a cursor-driven effect they cannot trigger
 * is just a slower page.
 *
 * @returns {boolean}
 */
export function useFinePointer() {
  const [fine, setFine] = useState(false)

  useEffect(() => {
    if (!window.matchMedia) return
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const onChange = () => setFine(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return fine
}
