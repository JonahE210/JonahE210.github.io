import { useEffect, useState } from 'react'

/**
 * Runs an async loader and reports loading / error / data.
 *
 * This exists in Phase 1, where the loader always resolves immediately from a
 * local module, so that every page already has real loading and error branches
 * before Phase 2 points the same loaders at the network. Adding those branches
 * later would mean touching every page.
 *
 * @template T
 * @param {() => Promise<T>} loader
 * @param {unknown[]} deps  Re-runs when these change, like useEffect.
 * @returns {{data: T | null, loading: boolean, error: Error | null}}
 */
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })

  useEffect(() => {
    let live = true
    setState((s) => ({ ...s, loading: true, error: null }))

    loader()
      .then((data) => {
        if (live) setState({ data, loading: false, error: null })
      })
      .catch((error) => {
        if (live) setState({ data: null, loading: false, error })
      })

    // Ignoring `loader` itself is intentional: callers pass an inline arrow,
    // which is a new function every render. `deps` is the real dependency set.
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
