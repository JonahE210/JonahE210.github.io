import { Link, useParams } from 'react-router-dom'

import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'
import Icon from '../components/Icon.jsx'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'
import { StackTags } from '../components/StackTag.jsx'

import { getProject, getProjectNeighbours } from '../lib/content.js'
import { useAsync } from '../lib/useAsync.js'
import './ProjectDetail.css'

const LINK_LABEL = {
  repo: 'Source',
  live: 'Live site',
  writeup: 'Write-up',
}

const STATUS_LABEL = {
  shipped: 'Shipped',
  active: 'In progress',
  archived: 'Archived',
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const { data: project, loading, error } = useAsync(() => getProject(slug), [slug])
  const { data: neighbours } = useAsync(() => getProjectNeighbours(slug), [slug])

  if (loading) {
    return (
      <div className="shell">
        <Spinner label="Loading project…" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="shell section">
        <ErrorState
          title="This project didn’t load"
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  // An unknown slug is a normal outcome, not a crash.
  if (!project) {
    return (
      <>
        <PageHeader
          eyebrow="404"
          title="No project by that name"
          lede="This link points at something that doesn’t exist — it may have been renamed. The full list is one click away."
        />
        <section className="section">
          <div className="shell">
            <Link className="btn btn--ghost" to="/work">
              <Icon name="arrowLeft" size={18} />
              See all projects
            </Link>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <header className="detail__head">
        <div className="shell">
          <Link className="detail__back" to="/work" viewTransition>
            <Icon name="arrowLeft" size={16} />
            All work
          </Link>

          <h1 className="h1">{project.title}</h1>
          <p className="detail__tagline">{project.tagline}</p>

          <dl className="detail__facts">
            <div className="detail__fact">
              <dt className="meta">Year</dt>
              <dd>{project.year}</dd>
            </div>
            <div className="detail__fact">
              <dt className="meta">Role</dt>
              <dd>{project.role}</dd>
            </div>
            <div className="detail__fact">
              <dt className="meta">Status</dt>
              <dd>{STATUS_LABEL[project.status] ?? project.status}</dd>
            </div>
          </dl>

          {project.links.length > 0 && (
          <div className="detail__actions">
            {project.links.map((link) => (
              <a
                key={link.kind}
                className="btn btn--ghost"
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                {LINK_LABEL[link.kind] ?? link.kind}
                <Icon name="arrowUpRight" size={16} />
              </a>
            ))}
          </div>
          )}
        </div>
      </header>

      <section className="section">
        <div className="shell detail__body">
          <Reveal className="detail__block">
            <h2 className="eyebrow">The problem</h2>
            <p>{project.problem}</p>
          </Reveal>

          <Reveal className="detail__block">
            <h2 className="eyebrow">
              {project.collaborative ? 'What we built' : 'What I built'}
            </h2>
            <p>{project.built}</p>
          </Reveal>

          <Reveal className="detail__block">
            <h2 className="eyebrow">How it works</h2>
            <ol className="detail__how">
              {project.how.map((step, i) => (
                <li key={i}>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal className="detail__block">
            <h2 className="eyebrow">Stack</h2>
            <StackTags items={project.stack} />
          </Reveal>

          <Reveal className="detail__block detail__outcome">
            <h2 className="eyebrow">What came of it</h2>
            <p>{project.outcome}</p>
          </Reveal>

          {(neighbours?.prev || neighbours?.next) && (
            <nav className="detail__nav" aria-label="Other projects">
              {neighbours.prev && (
                <Link
                  className="detail__nav-link detail__nav-link--prev"
                  to={`/work/${neighbours.prev.slug}`}
                  viewTransition
                >
                  <span className="meta">Previous</span>
                  <span className="detail__nav-title">
                    {neighbours.prev.title}
                  </span>
                </Link>
              )}
              {neighbours.next && (
                <Link
                  className="detail__nav-link detail__nav-link--next"
                  to={`/work/${neighbours.next.slug}`}
                  viewTransition
                >
                  <span className="meta">Next</span>
                  <span className="detail__nav-title">
                    {neighbours.next.title}
                  </span>
                </Link>
              )}
            </nav>
          )}
        </div>
      </section>
    </>
  )
}
