import { Link, useViewTransitionState } from 'react-router-dom'

import Icon from './Icon.jsx'
import { StackTags } from './StackTag.jsx'
import './ProjectCard.css'

const STATUS_LABEL = {
  shipped: 'Shipped',
  active: 'In progress',
  archived: 'Archived',
}

/**
 * The heading level is a prop because the same card appears at two depths: on
 * the home page it sits under the "Things I've built" h2, so it is an h3; on
 * /work it is the first thing under the page h1, so it must be an h2. Hard-
 * coding h3 skips a level there, which breaks heading navigation.
 *
 * @param {{
 *   project: import('../data/projects.js').Project,
 *   index?: number,
 *   featured?: boolean,
 *   headingLevel?: 2 | 3
 * }} props
 */
export default function ProjectCard({
  project,
  index = 0,
  featured = false,
  headingLevel = 3,
}) {
  const to = `/work/${project.slug}`
  /* True only while this card's own navigation is in flight, so exactly one
     card on the page claims the shared name and the browser has an
     unambiguous pair to morph between. */
  const morphing = useViewTransitionState(to)
  const status = STATUS_LABEL[project.status] ?? project.status
  const Heading = `h${headingLevel}`
  const number = String(index + 1).padStart(2, '0')

  return (
    <article
      className={`card${featured ? ' card--featured' : ''}`}
      style={morphing ? { viewTransitionName: 'project-surface' } : undefined}
    >
      <p className="card__index">
        <span className="card__num">{number}</span>
        <span className="card__dash" aria-hidden="true">
          —
        </span>
        <span>{project.category}</span>
      </p>

      <div className="card__head">
        <Heading className="card__title">
          <Link className="card__link" to={to} viewTransition>
            {project.title}
          </Link>
        </Heading>
        <span className="card__arrow" aria-hidden="true">
          <Icon name="arrowUpRight" size={16} />
        </span>
      </div>

      <p className="card__tagline">{project.tagline}</p>

      <StackTags items={project.stack} limit={featured ? 6 : 4} />

      <div className="card__foot">
        <p className="meta">{status}</p>
        <p className="meta">{project.year}</p>
      </div>
    </article>
  )
}
