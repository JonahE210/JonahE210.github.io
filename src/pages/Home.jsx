import { Link, useOutletContext } from 'react-router-dom'

import KineticName from '../components/KineticName.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import Brain from '../components/Brain.jsx'
import Reveal from '../components/Reveal.jsx'
import Icon from '../components/Icon.jsx'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'
import { StackTags } from '../components/StackTag.jsx'

import { getProjects, getGraph } from '../lib/content.js'
import { useAsync } from '../lib/useAsync.js'
import './Home.css'

const SOCIAL_ICON = { GitHub: 'github', LinkedIn: 'linkedin' }

/**
 * Order is deliberate: the name, then the map, then the work, then the prose.
 * The map is the first interactive thing a visitor meets and doubles as a way
 * into every page — so the page opens with something to do, not something to
 * read.
 *
 */
export default function Home() {
  /** @type {{profile: import('../data/profile.js').Profile}} */
  const { profile } = useOutletContext()
  const { data: projects, loading, error } = useAsync(() => getProjects(), [])
  const { data: graph, loading: graphLoading, error: graphError } = useAsync(
    () => getGraph(),
    []
  )

  const featured = (projects ?? []).filter((p) => p.featured)

  return (
    <>
      <section className="hero">
        <div className="shell hero__inner">
          {/* The page's single h1. The component renders the plain name for
              screen readers and the split letters for everyone else. */}
          <h1 className="hero__name">
            <KineticName lines={[profile.firstName, profile.lastName]} />
          </h1>

          <p className="hero__sub">
            {profile.graduating} · {profile.location}
          </p>

          <div className="hero__actions">
            <a className="btn btn--primary" href={profile.resumeUrl} download>
              <Icon name="download" size={18} />
              Download résumé
            </a>
            {profile.socials.map((social) => (
              <a
                key={social.label}
                className="btn btn--ghost"
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Icon name={SOCIAL_ICON[social.label] ?? 'arrowUpRight'} size={18} />
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="brain-heading">
        <div className="shell">
          <div className="featured__head">
            <h2 className="h2" id="brain-heading">
              How it connects
            </h2>
          </div>

          {graphLoading && <Spinner label="Loading the map…" />}
          {graphError && (
            <ErrorState
              title="The map didn’t load"
              message="Everything it points at is still reachable from the navigation above."
            />
          )}
          {!graphLoading && !graphError && graph && <Brain graph={graph} />}
        </div>
      </section>

      <section className="section" aria-labelledby="featured-heading">
        <div className="shell">
          <div className="featured__head">
            <h2 className="h2" id="featured-heading">
              Things I&rsquo;ve built
            </h2>
            <Link className="link link--target" to="/work" viewTransition>
              All work
            </Link>
          </div>

          {loading && <Spinner label="Loading projects…" />}
          {error && <ErrorState title="Projects didn’t load" />}

          {!loading && !error && (
            <div className="featured__grid">
              {featured.map((project, i) => (
                <Reveal key={project.slug} delay={i * 40}>
                  <ProjectCard project={project} index={i} featured />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="about-heading">
        <div className="shell about">
          <div>
            <Reveal as="p" className="eyebrow" id="about-heading">
              Who I am
            </Reveal>
            <Reveal className="about__body measure" delay={60}>
              {profile.about.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </Reveal>
          </div>

          <Reveal className="about__aside" delay={120}>
            <div className="about__group">
              <p className="eyebrow">What I reach for</p>
              <StackTags items={profile.stack} />
            </div>
            <div className="about__group">
              <p className="eyebrow">Ask me about</p>
              <StackTags items={profile.askMeAbout} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
