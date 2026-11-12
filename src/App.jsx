import { useEffect, useLayoutEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import SkipLink from './components/SkipLink.jsx'
import SocialRail from './components/SocialRail.jsx'
import Spinner from './components/Spinner.jsx'
import ErrorState from './components/ErrorState.jsx'


import { getProfile } from './lib/content.js'
import { useAsync } from './lib/useAsync.js'
import { useKonami } from './lib/useKonami.js'
import { useReducedMotion } from './lib/useReducedMotion.js'
import { greet } from './lib/console-egg.js'

/**
 * On a client-side route change the browser does none of the things it would do
 * on a real navigation: the scroll position stays where it was and focus stays
 * on whatever was clicked. Both have to be done by hand or keyboard and screen
 * reader users simply never arrive at the new page.
 */
function useRouteChange() {
  const { pathname } = useLocation()
  const main = useRef(null)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    main.current?.focus()
  }, [pathname])

  return main
}

export default function App() {
  const main = useRouteChange()

  /**
   * The opening sequence runs once, on the first paint of the session — not
   * on every return to the home page, which would make it a tax on
   * navigation rather than a welcome. A layout effect so the class is present
   * before the browser paints; otherwise the hero renders settled and then
   * jumps back to animate.
   */
  useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.add('is-entering')
    const timer = setTimeout(() => root.classList.remove('is-entering'), 1900)
    return () => {
      clearTimeout(timer)
      root.classList.remove('is-entering')
    }
  }, [])
  const reduced = useReducedMotion()
  const { active: konami } = useKonami(!reduced)
  const { data: profile, loading, error } = useAsync(() => getProfile(), [])

  useEffect(() => {
    document.documentElement.classList.toggle('konami', konami)
  }, [konami])

  // Once, after the profile lands. The ref guard stops StrictMode's double
  // effect invocation in development from printing the banner twice.
  const greeted = useRef(false)
  useEffect(() => {
    if (profile && !greeted.current) {
      greeted.current = true
      greet(profile.email)
    }
  }, [profile])

  // The shell itself depends on profile data (wordmark, résumé link, socials),
  // so it has the same three states every page has.
  if (loading) {
    return (
      <div className="shell">
        <Spinner label="Loading…" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="shell section">
        <ErrorState
          title="This site failed to load"
          message="The content behind this page could not be reached. Reloading usually fixes it."
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <>
      <SkipLink />
      <Nav resumeUrl={profile.resumeUrl} />
      <SocialRail profile={profile} />

      <main id="main" ref={main} tabIndex={-1}>
        {/* Routes live in main.jsx now; the profile the shell already
            loaded is handed down rather than fetched twice. */}
        <Outlet context={{ profile }} />
      </main>

      <Footer profile={profile} />
    </>
  )
}
