import { useEffect, useRef } from 'react'

/**
 * Tracks the pointer in a ref rather than in state, deliberately.
 *
 * Pointer position changes dozens of times a second; putting it in state would
 * re-render the whole subtree on every move. Consumers read `ref.current`
 * inside an animation frame instead, so React never re-renders for a mouse move.
 *
 * @param {boolean} enabled
 * @returns {React.MutableRefObject<{x: number, y: number, active: boolean}>}
 */
export function usePointerRef(enabled = true) {
  const pointer = useRef({ x: 0, y: 0, active: false })

  useEffect(() => {
    if (!enabled) return

    const onMove = (event) => {
      pointer.current.x = event.clientX
      pointer.current.y = event.clientY
      pointer.current.active = true
    }
    const onOut = (event) => {
      // relatedTarget is null when the pointer genuinely leaves the window.
      if (event.relatedTarget === null) pointer.current.active = false
    }
    const onBlur = () => {
      pointer.current.active = false
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerout', onOut)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onOut)
      window.removeEventListener('blur', onBlur)
      pointer.current.active = false
    }
  }, [enabled])

  return pointer
}

/**
 * Runs `callback` once per animation frame while `enabled`.
 *
 * The callback is held in a ref so that changing it does not tear down and
 * restart the loop — otherwise every parent re-render would drop a frame.
 *
 * @param {(time: number) => void} callback
 * @param {boolean} enabled
 */
export function useAnimationFrame(callback, enabled = true) {
  const latest = useRef(callback)
  latest.current = callback

  useEffect(() => {
    if (!enabled) return
    let frame = 0
    const tick = (time) => {
      latest.current(time)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [enabled])
}
