/**
 * Easter egg #1.
 *
 * Anyone seriously evaluating a candidate's site opens devtools at some point.
 * That makes the console the single best-targeted place to leave a note, so
 * there is one here instead of a joke nobody sees.
 *
 * Takes the address as an argument rather than importing the profile module:
 * everything that reads content has to go through `lib/content.js`, or Phase 2
 * would leave this one line still reading a stale local file.
 *
 * Colours are read off :root rather than written here. An earlier version
 * hardcoded them, which meant two separate bugs: they drifted from the palette
 * when the site changed, and the message set a near-black foreground with no
 * background — invisible in a dark devtools console, which is the default for
 * anyone in dark mode. The one line aimed squarely at a hiring engineer was
 * the one line they could not read. Both logs now set a background as well as
 * a colour, so they hold up in either devtools theme.
 *
 * There are deliberately no hardcoded fallbacks: a literal here would be the
 * same drift bug in slower motion. If a token is missing the console styles
 * resolve to empty strings and the message still prints, just unstyled — which
 * is the correct degradation for an easter egg.
 *
 * Deliberately the only console output in the app — verification checks for a
 * clean console, and this is the one allowed exception.
 *
 * @param {string} email
 */
export function greet(email) {
  const root = getComputedStyle(document.documentElement)
  const tok = (name) => root.getPropertyValue(name).trim()

  const ink = tok('--text')
  const paper = tok('--bg')
  const accent = tok('--accent')

  const banner = `
   \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
   \u2502   J O N A H   E S C O B A R      \u2502
   \u2502   \u00b7  \u00b7  \u00b7  \u00b7  \u00b7  \u00b7  \u00b7  \u00b7  \u00b7      \u2502
   \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
`

  console.log(
    `%c${banner}`,
    `color:${accent};background:${ink};font-family:monospace;line-height:1.4;`
  )
  console.log(
    `%cYou opened the console. That is exactly the kind of thing I'd do.\n` +
      `If you're hiring: ${email}\n` +
      `Also \u2014 try the Konami code. \u2191 \u2191 \u2193 \u2193 \u2190 \u2192 \u2190 \u2192`,
    `color:${paper};background:${ink};font-family:monospace;font-size:12px;line-height:1.6;padding:4px 8px;`
  )
}
