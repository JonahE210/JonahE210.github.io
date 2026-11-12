import { useReveal } from '../lib/useReveal.js'
import { useReducedMotion } from '../lib/useReducedMotion.js'
import './TimelineEntry.css'

/**
 * One milestone on the life timeline.
 *
 * This component owns its own scroll reveal rather than being wrapped in
 * `<Reveal>`, because a wrapper div between `<ol>` and `<li>` is invalid markup
 * and breaks the list semantics screen readers rely on to announce "item 3 of 7".
 *
 * The date appears twice in the markup: in its own column on wide screens, and
 * inline above the title on narrow ones. Exactly one is ever rendered — the
 * other is `display: none`, so it is not announced twice.
 *
 * @param {{
 *   entry: import('../data/timeline.js').TimelineEntry,
 *   delay?: number,
 *   headingLevel?: 2 | 3
 * }} props
 */
export default function TimelineEntry({ entry, delay = 0, headingLevel = 3 }) {
  const Heading = `h${headingLevel}`
  const reduced = useReducedMotion()
  const ref = useReveal(!reduced)

  return (
    <li
      ref={ref}
      className={`entry reveal${entry.milestone ? ' entry--milestone' : ''}`}
      style={delay ? { '--reveal-delay': `${delay}ms` } : undefined}
    >
      <p className="meta entry__date-col">{entry.date}</p>
      <span className="entry__marker" aria-hidden="true" />

      <div className="entry__body">
        <p className="meta entry__date-inline">{entry.date}</p>
        <div className="entry__top">
          <Heading className="entry__title">{entry.title}</Heading>
          {entry.tag && <span className="entry__tag">{entry.tag}</span>}
        </div>
        <p className="entry__text">{entry.body}</p>
      </div>
    </li>
  )
}
