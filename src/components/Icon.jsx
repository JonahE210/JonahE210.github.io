/**
 * Inline SVG icons. One family, one 1.75px stroke weight, 24px grid — no emoji
 * anywhere in the UI, since emoji render differently per platform and cannot
 * be themed.
 *
 * The brand marks (GitHub, LinkedIn) are filled official glyph shapes and are
 * the only exception to the stroke rule, because recolouring a brand outline
 * would misrepresent it.
 */

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const PATHS = {
  download: (
    <g {...STROKE}>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M4 20h16" />
    </g>
  ),
  arrowRight: (
    <g {...STROKE}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </g>
  ),
  arrowLeft: (
    <g {...STROKE}>
      <path d="M20 12H5" />
      <path d="m11 6-6 6 6 6" />
    </g>
  ),
  arrowUpRight: (
    <g {...STROKE}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </g>
  ),
  mail: (
    <g {...STROKE}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7.5 8.5 6 8.5-6" />
    </g>
  ),
  github: (
    <path
      fill="currentColor"
      d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5.01 0c1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.86l-.01 2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
    />
  ),
  linkedin: (
    <path
      fill="currentColor"
      d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM2.4 21h5.16V10.1H2.4V21Zm7.9 0h5.15v-5.95c0-1.57.3-3.09 2.24-3.09 1.92 0 1.95 1.8 1.95 3.19V21H24.8v-6.9c0-4.03-.87-6.4-5.1-6.4-2.03 0-3.4 1.12-3.95 2.18h-.07V10.1h-5.4V21Z"
      transform="translate(-0.8 0)"
    />
  ),
}

/**
 * @param {{name: keyof typeof PATHS, size?: number, className?: string}} props
 */
export default function Icon({ name, size = 20, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}
