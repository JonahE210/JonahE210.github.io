/**
 * ============================================================
 *  THE PHASE 2 SEAM
 * ============================================================
 *  Pages and components must NEVER import from `src/data/`.
 *  Everything goes through this module.
 *
 *  These functions are async *today*, while the data is local,
 *  so that every consumer already handles loading and error
 *  states. Phase 2 replaces the bodies below with `fetch` calls
 *  against the Django API and deletes `src/data/`. Nothing else
 *  in the app changes.
 *
 *  Phase 2 endpoint map:
 *    getProfile()      -> GET /api/profile
 *    getProjects()     -> GET /api/projects
 *    getProject(slug)  -> GET /api/projects/<slug>
 *    getTimeline()     -> GET /api/timeline
 *    getGraph()        -> GET /api/graph
 * ============================================================
 */

import profileData from '../data/profile.js'
import projectsData from '../data/projects.js'
import timelineData from '../data/timeline.js'
import graphData from '../data/graph.js'

/**
 * Resolves on a microtask rather than synchronously, so consumers cannot
 * accidentally depend on data being available during the first render —
 * that would be a bug that only appears in Phase 2.
 * @template T
 * @param {T} value
 * @returns {Promise<T>}
 */
const ok = (value) => Promise.resolve(value)

/** @returns {Promise<import('../data/profile.js').Profile>} */
export const getProfile = () => ok(profileData)

/** @returns {Promise<import('../data/projects.js').Project[]>} */
export const getProjects = () => ok(projectsData)

/**
 * @param {string} slug
 * @returns {Promise<import('../data/projects.js').Project | null>}
 */
export const getProject = (slug) =>
  ok(projectsData.find((p) => p.slug === slug) ?? null)

/** @returns {Promise<import('../data/timeline.js').TimelineEntry[]>} */
export const getTimeline = () => ok(timelineData)

/** @returns {Promise<{nodes: import('../data/graph.js').GraphNode[], edges: import('../data/graph.js').GraphEdge[]}>} */
export const getGraph = () => ok(graphData)

/**
 * Previous/next for the detail page footer, derived from the same ordered
 * list the index uses so the two can never disagree.
 * @param {string} slug
 * @returns {Promise<{prev: import('../data/projects.js').Project | null, next: import('../data/projects.js').Project | null}>}
 */
export const getProjectNeighbours = async (slug) => {
  const all = await getProjects()
  const i = all.findIndex((p) => p.slug === slug)
  if (i === -1) return { prev: null, next: null }
  return { prev: all[i - 1] ?? null, next: all[i + 1] ?? null }
}
