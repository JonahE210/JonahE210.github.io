import { NavLink } from 'react-router-dom'

import Icon from './Icon.jsx'
import './Nav.css'

const ROUTES = [
  { to: '/', label: 'Home' },
  { to: '/work', label: 'Work' },
  { to: '/life', label: 'Life' },
]

/**
 * @param {{resumeUrl?: string}} props
 */
export default function Nav({ resumeUrl = '/Jonah-Escobar.pdf' }) {
  return (
    <header className="nav">
      <div className="nav__pill">
        <nav aria-label="Main">
          <ul className="nav__list">
            {ROUTES.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  viewTransition
                  className={({ isActive }) =>
                    `nav__link${isActive ? ' is-active' : ''}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <span className="nav__rule" aria-hidden="true" />

        <a className="btn btn--primary nav__cta" href={resumeUrl} download>
          <Icon name="download" size={14} />
          Résumé
        </a>
      </div>
    </header>
  )
}
