import { useMemo } from 'react'

/**
 * A force-directed layout for the brain, solved to convergence once rather
 * than animated live.
 *
 * The first version ran the integrator on screen every frame. It looked
 * right until the labels were measured: separation (keeping "ActivePitch"
 * off "RockSat-X") and the springs pull in opposite directions, so the system
 * oscillated instead of settling and the graph never stopped twitching.
 *
 * Solving offline fixes that and costs nothing — twelve nodes over a few
 * hundred iterations is well under a millisecond — and it buys three things a
 * live loop could not:
 *
 *  - **It cannot oscillate on screen.** Convergence is checked, and a final
 *    separation-only pass guarantees no two labels overlap before anything
 *    renders.
 *  - **No rAF loop at all**, so nothing runs for a section nobody is reading.
 *  - **The entrance becomes a CSS transition** from the centre to a known
 *    position: composited, staggered, and switched off by reduced motion
 *    without touching the layout it animates to.
 *
 * Written rather than imported because the maths is smaller than a dependency.
 */

const REPULSION = 1500
/** Repulsion goes as 1/d²; without a ceiling a near-collision launches a node. */
const MAX_REPULSION = 2.2
const SPRING_HUB = 0.05
const SPRING_CROSS = 0.004
const REST_HUB = 132
const REST_CROSS = 220
/* Low on purpose: the hub spring sets the ring a cluster sits on, and this
   only decides where that ring lives. Raising it collapses the ring. */
const CLUSTER_PULL = 0.011
const DAMPING = 0.82
const COLLIDE_GAP = 12
const SOLVE_STEPS = 900
const POLISH_STEPS = 60
const SETTLED = 0.04
/** Used only until the real label boxes have been measured. */
const FALLBACK = { w: 104, h: 44 }

/** Cluster anchors in normalised stage space. */
export const ANCHORS = {
  internships: { x: 0.23, y: 0.34 },
  projects: { x: 0.5, y: 0.73 },
  usc: { x: 0.79, y: 0.31 },
}

/**
 * Push apart any two label boxes that overlap, as a position correction.
 * Repulsion cannot do this: it acts on centres and knows nothing about how
 * wide "NASA RockSat-X" is beside "FileByte", so a cluster correctly spaced
 * by distance can still be unreadable. Resolving along the axis of least
 * penetration keeps each nudge small. Returns the total correction applied.
 */
function separate(bodies, passes) {
  let corrected = 0
  for (let pass = 0; pass < passes; pass += 1) {
    for (let i = 0; i < bodies.length; i += 1) {
      const a = bodies[i]
      for (let j = i + 1; j < bodies.length; j += 1) {
        const b = bodies[j]
        const ox = a.hw + b.hw + COLLIDE_GAP - Math.abs(b.x - a.x)
        const oy = a.hh + b.hh + COLLIDE_GAP - Math.abs(b.y - a.y)
        if (ox <= 0 || oy <= 0) continue
        corrected += Math.min(ox, oy)
        if (ox < oy) {
          const push = (ox / 2) * (b.x - a.x < 0 ? -1 : 1)
          a.x -= push
          b.x += push
        } else {
          const push = (oy / 2) * (b.y - a.y < 0 ? -1 : 1)
          a.y -= push
          b.y += push
        }
      }
    }
  }
  return corrected
}

function clamp(bodies, w, h) {
  for (const b of bodies) {
    b.x = Math.max(b.hw, Math.min(w - b.hw, b.x))
    b.y = Math.max(b.hh, Math.min(h - b.hh, b.y))
  }
}

/** One integration step. Returns total kinetic energy. */
function integrate(bodies, edges, w, h) {
  for (let i = 0; i < bodies.length; i += 1) {
    const a = bodies[i]
    for (let j = i + 1; j < bodies.length; j += 1) {
      const b = bodies[j]
      let dx = b.x - a.x
      let dy = b.y - a.y
      let d2 = dx * dx + dy * dy
      if (d2 < 1) {
        dx = 0.1
        dy = 0.1
        d2 = 0.02
      }
      const d = Math.sqrt(d2)
      const strength = Math.min(
        MAX_REPULSION,
        (REPULSION * (a.hub || b.hub ? 1.8 : 1)) / d2
      )
      a.vx -= (dx / d) * strength
      a.vy -= (dy / d) * strength
      b.vx += (dx / d) * strength
      b.vy += (dy / d) * strength
    }
  }

  for (const e of edges) {
    const a = bodies[e.a]
    const b = bodies[e.b]
    if (!a || !b) continue
    const dx = b.x - a.x
    const dy = b.y - a.y
    const d = Math.hypot(dx, dy) || 0.01
    const f = (d - (e.cross ? REST_CROSS : REST_HUB)) * (e.cross ? SPRING_CROSS : SPRING_HUB)
    a.vx += (dx / d) * f
    a.vy += (dy / d) * f
    b.vx -= (dx / d) * f
    b.vy -= (dy / d) * f
  }

  let energy = 0
  for (const body of bodies) {
    const anchor = ANCHORS[body.cluster]
    const pull = CLUSTER_PULL * (body.hub ? 2.4 : 1)
    body.vx += (anchor.x * w - body.x) * pull
    body.vy += (anchor.y * h - body.y) * pull
    body.vx *= DAMPING
    body.vy *= DAMPING
    body.x += body.vx
    body.y += body.vy
    energy += Math.abs(body.vx) + Math.abs(body.vy)
  }

  separate(bodies, 2)
  clamp(bodies, w, h)
  return energy
}

/**
 * Deterministic seed: each cluster's leaves evenly around their hub, on a
 * radius wide enough for their own labels. Starting near a good answer is why
 * the solver converges instead of wandering — and it makes the result stable
 * across reloads, which a random seed would not be.
 */
function seed(nodes, w, h, sizes) {
  const byCluster = new Map()
  for (const n of nodes) {
    if (n.kind !== 'leaf') continue
    if (!byCluster.has(n.cluster)) byCluster.set(n.cluster, [])
    byCluster.get(n.cluster).push(n)
  }

  return nodes.map((n) => {
    const anchor = ANCHORS[n.cluster]
    const size = sizes[n.id] ?? FALLBACK
    const base = {
      id: n.id,
      cluster: n.cluster,
      hub: n.kind === 'hub',
      hw: size.w / 2,
      hh: size.h / 2,
      vx: 0,
      vy: 0,
    }
    if (n.kind === 'hub') {
      return { ...base, x: anchor.x * w, y: anchor.y * h }
    }
    const peers = byCluster.get(n.cluster)
    const i = peers.indexOf(n)
    // Enough radius that neighbours on the ring cannot touch.
    const widest = Math.max(...peers.map((p) => (sizes[p.id] ?? FALLBACK).w))
    const needed = ((widest + COLLIDE_GAP) * peers.length) / (2 * Math.PI)
    const r = Math.max(REST_HUB, needed)
    // Offset per cluster so the three rings do not line up with each other.
    const turn = (i / peers.length) * Math.PI * 2 + (anchor.x + anchor.y) * 3
    return {
      ...base,
      x: anchor.x * w + Math.cos(turn) * r,
      y: anchor.y * h + Math.sin(turn) * r * 0.74,
    }
  })
}

/**
 * @param {{nodes: any[], edges: any[]}} graph
 * @param {{width: number, height: number}} size
 * @param {Record<string, {w: number, h: number}>} sizes  Measured label boxes.
 * @returns {{bodies: any[], center: {x: number, y: number}}}
 */
export function useForceLayout(graph, size, sizes = {}) {
  const { width: w, height: h } = size

  return useMemo(() => {
    if (!w || !h) return { bodies: [], center: { x: 0, y: 0 } }

    const index = new Map(graph.nodes.map((n, i) => [n.id, i]))
    const edges = graph.edges.map((e) => ({
      a: index.get(e.source),
      b: index.get(e.target),
      cross: Boolean(e.note),
    }))

    const bodies = seed(graph.nodes, w, h, sizes)
    for (let i = 0; i < SOLVE_STEPS; i += 1) {
      if (integrate(bodies, edges, w, h) < SETTLED) break
    }
    // Separation only: the springs are done, so nothing can re-overlap what
    // this fixes. Without it the solver can settle with two labels touching.
    for (let i = 0; i < POLISH_STEPS; i += 1) {
      if (separate(bodies, 4) === 0) break
      clamp(bodies, w, h)
    }

    return { bodies, center: { x: w / 2, y: h / 2 } }
  }, [graph, w, h, sizes])
}
