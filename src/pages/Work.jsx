import ProjectCard from '../components/ProjectCard.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'

import { getProjects } from '../lib/content.js'
import { useAsync } from '../lib/useAsync.js'
import './Work.css'

export default function Work() {
  const { data: projects, loading, error } = useAsync(() => getProjects(), [])

  return (
    <>
      <PageHeader
        eyebrow="Work"
        title="Things I’ve built and what they taught me"
        lede="A small number of projects I can actually talk about in depth, rather than a long list I’d have to look up. Each one has a problem it exists to solve and a part that went wrong."
      />

      <section className="section">
        <div className="shell">
          {loading && <Spinner label="Loading projects…" />}
          {error && (
            <ErrorState
              title="Projects didn’t load"
              onRetry={() => window.location.reload()}
            />
          )}

          {!loading && !error && projects?.length === 0 && (
            <p className="lede">No projects here yet. Check back shortly.</p>
          )}

          {!loading && !error && projects?.length > 0 && (
            <div className="work__grid">
              {projects.map((project, i) => (
                <Reveal
                  key={project.slug}
                  delay={i * 40}
                  className={i === 0 ? 'work__cell--wide' : undefined}
                >
                  <ProjectCard
                    project={project}
                    index={i}
                    featured={i === 0}
                    headingLevel={2}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
