import { Link } from 'react-router-dom'

import PageHeader from '../components/PageHeader.jsx'
import Icon from '../components/Icon.jsx'

export default function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow="404"
        title="There’s nothing here"
        lede="Which is either a broken link or a page I haven’t written yet. Both are my fault. Here are the ways out."
      />

      <section className="section">
        <div className="shell">
          <div className="actions">
            <Link className="btn btn--primary" to="/">
              <Icon name="arrowLeft" size={18} />
              Back home
            </Link>
            <Link className="btn btn--ghost" to="/work">
              See the work
            </Link>
            <Link className="btn btn--ghost" to="/life">
              Read the timeline
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
