import { useReveal } from '../lib/useReveal.js'
import { useReducedMotion } from '../lib/useReducedMotion.js'

/**
 * Wraps content so it fades and lifts into place the first time it scrolls
 * into view. Translate and opacity only, so it never causes layout shift.
 *
 * @param {{
 *   children: React.ReactNode,
 *   as?: React.ElementType,
 *   delay?: number,
 *   className?: string,
 *   [key: string]: unknown
 * }} props
 */
export default function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className = '',
  ...rest
}) {
  const reduced = useReducedMotion()
  const ref = useReveal(!reduced)

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`.trim()}
      style={delay ? { '--reveal-delay': `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}
