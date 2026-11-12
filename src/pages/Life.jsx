import PageHeader from '../components/PageHeader.jsx'
import TimelineEntry from '../components/TimelineEntry.jsx'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'

import { getTimeline } from '../lib/content.js'
import { useAsync } from '../lib/useAsync.js'

export default function Life() {
  const { data: entries, loading, error } = useAsync(() => getTimeline(), [])

  return (
    <>
      <PageHeader
        eyebrow="Life"
        title="What I’ve been up to"
        lede="Internships, projects, and the things that went wrong in them. Newest first."
      />

      <section className="section">
        <div className="shell">
          {loading && <Spinner label="Loading timeline…" />}
          {error && (
            <ErrorState
              title="The timeline didn’t load"
              onRetry={() => window.location.reload()}
            />
          )}

          {!loading && !error && entries?.length === 0 && (
            <p className="lede">Nothing here yet — the first entry is coming.</p>
          )}

          {!loading && !error && entries?.length > 0 && (
            <ol className="timeline">
              {entries.map((entry, i) => (
                <TimelineEntry
                  key={entry.id}
                  entry={entry}
                  delay={Math.min(i, 6) * 40}
                  headingLevel={2}
                />
              ))}
            </ol>
          )}
        </div>
      </section>
    </>
  )
}
