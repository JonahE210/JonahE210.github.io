/**
 * A single technology pill. Exists as a component so the markup and the
 * `.tag` class never drift apart across the four places stacks are listed.
 *
 * @param {{children: React.ReactNode}} props
 */
export default function StackTag({ children }) {
  return <li className="tag">{children}</li>
}

/**
 * @param {{items: string[], limit?: number}} props
 */
export function StackTags({ items, limit }) {
  const shown = limit ? items.slice(0, limit) : items
  const hidden = items.length - shown.length

  return (
    <ul className="tag-row">
      {shown.map((item) => (
        <StackTag key={item}>{item}</StackTag>
      ))}
      {hidden > 0 && <StackTag>+{hidden}</StackTag>}
    </ul>
  )
}
