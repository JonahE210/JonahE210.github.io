import { useEffect, useState } from 'react'

const SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
]

/**
 * Easter egg #2 — the Konami code cycles the accent hue and makes the hero
 * letters bounce.
 *
 * It only ever changes `--accent-hue` and adds a class, so the whole effect is
 * reversible and cannot leave the page in a broken state. Disabled entirely
 * under reduced motion: a surprise animation is exactly what that setting is
 * asking us not to do.
 *
 * @param {boolean} enabled
 * @returns {{active: boolean, reset: () => void}}
 */
export function useKonami(enabled = true) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let progress = 0

    const onKeyDown = (event) => {
      // Never swallow keys from a field someone is typing in.
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable) {
        return
      }

      if (event.key === SEQUENCE[progress]) {
        progress += 1
        if (progress === SEQUENCE.length) {
          progress = 0
          setActive(true)
        }
      } else {
        // Allow a wrong key to be the start of a fresh attempt.
        progress = event.key === SEQUENCE[0] ? 1 : 0
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled])

  useEffect(() => {
    if (!active) return

    const root = document.documentElement
    let hue = 217
    const id = setInterval(() => {
      hue = (hue + 7) % 360
      // Saturation and lightness are pinned rather than left free. The accent
      // is text on an off-white page in several places, and on a light ground
      // the binding constraint is yellow: at full saturation it cannot reach
      // 4.5:1 against the page at ANY lightness. 70%/26% is the lightest pair
      // where the worst hue still clears 4.5:1 on both the page and a white
      // card. It runs deeper than the resting accent for that reason. (A dark
      // theme pins the opposite way — this was 74% lightness before the page
      // went light.) An easter egg does not get to break the page.
      root.style.setProperty('--accent', `hsl(${hue} 70% 26%)`)
    }, 90)

    return () => {
      clearInterval(id)
      root.style.removeProperty('--accent')
    }
  }, [active])

  return { active, reset: () => setActive(false) }
}
