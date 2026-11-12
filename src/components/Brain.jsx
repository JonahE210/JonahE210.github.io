import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import Icon from './Icon.jsx'
import { StackTags } from './StackTag.jsx'
import { useForceLayout } from '../lib/useForceLayout.js'
import './Brain.css'

const CLUSTER_LABEL = {
  // Labelled "Experience", not "Internships": the group holds a Pfizer
  // externship and a university rocketry team alongside two internships, and
  // a heading that misstates two of its four members is worse than a vaguer
  // one. The id stays `internships` because it keys the hue and the anchor.
  internships: 'Experience',
  projects: 'Projects',
  usc: 'USC',
}

/** Below this the graph is cramped past usefulness and the list is better. */
const GRAPH_MIN_WIDTH = 720

/**
 * A small force-directed map of the work and how it connects.
 *
 * Nodes are real buttons in the DOM rather than shapes on a canvas. Canvas
 * would render faster, but at twelve nodes there is nothing to win and a
 * canvas is invisible to a screen reader and unreachable by keyboard — so the
 * edges are SVG and the nodes are focusable controls that happen to be
 * positioned by a physics loop.
 *
 * Three ways in, all showing the same content:
 *   - wide + motion allowed  -> the simulation, animating from a seed
 *   - wide + reduced motion  -> the same solved layout, rendered still
 *   - narrow                 -> a grouped list of disclosures, no simulation
 *
 * @param {{graph: {nodes: any[], edges: any[]}}} props
 */
export default function Brain({ graph }) {
  const wrapRef = useRef(null)
  const stageRef = useRef(null)
  const [wrapWidth, setWrapWidth] = useState(0)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [selected, setSelected] = useState(null)
  const [hovered, setHovered] = useState(null)
  const [entered, setEntered] = useState(false)
  /** Live, not latched: idle motion must stop when the brain scrolls away. */
  const [visible, setVisible] = useState(false)
  /** Real label boxes, measured once rendered; the solver needs them to
      keep "NASA RockSat-X" from sitting on top of "FileByte". */
  const [sizes, setSizes] = useState({})
  const nodeRefs = useRef(new Map())

  // Measured on the wrapper, which is always in the layout. Deciding this
  // from the stage's own width cannot work: the stage is not rendered when
  // narrow, so it would report 0 and never qualify as wide.
  const wide = wrapWidth >= GRAPH_MIN_WIDTH
  const { bodies, center } = useForceLayout(graph, size, sizes)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) =>
      setWrapWidth(Math.round(entry.contentRect.width))
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width)
      // Only width drives the layout. Reacting to the height we set ourselves
      // would be a resize loop.
      setSize((prev) =>
        prev.width === width
          ? prev
          : { width, height: Math.max(420, Math.min(560, width * 0.46)) }
      )
    })
    ro.observe(el)
    return () => ro.disconnect()
    // Depends on `wide`: the stage does not exist until the wrapper is wide
    // enough, so an observer attached on mount alone would never find it.
  }, [wide])

  /**
   * The assembly plays when the graph is actually looked at, not when the
   * page loads behind the hero. Same shape as useReveal, and the same
   * priority: nothing is ever hidden waiting on a callback that might not
   * come. Already on screen fires immediately, below the fold waits for the
   * observer, and a 1.2s failsafe covers the case where it never reports.
   */
  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setEntered(true)
      setVisible(true)
      return
    }
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight || document.documentElement.clientHeight
    if (rect.top < vh && rect.bottom > 0) {
      setEntered(true)
      setVisible(true)
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting)
        if (entry.isIntersecting) setEntered(true)
      },
      { rootMargin: '0px 0px -10% 0px' }
    )
    io.observe(el)
    const timer = setTimeout(() => setEntered(true), 1200)
    return () => {
      io.disconnect()
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!wide) return
    let alive = true

    const measure = () => {
      if (!alive) return
      const next = {}
      for (const n of graph.nodes) {
        const el = nodeRefs.current.get(n.id)
        if (!el) return
        next[n.id] = { w: el.offsetWidth, h: el.offsetHeight }
      }
      setSizes((prev) => {
        const same =
          Object.keys(prev).length === Object.keys(next).length &&
          graph.nodes.every((n) => prev[n.id]?.w === next[n.id].w)
        return same ? prev : next
      })
    }

    measure()
    // And again once the webfonts land. Measuring only on mount reads the
    // fallback face's metrics, which understates every label — the solver then
    // packs the graph for labels narrower than the ones that actually render.
    document.fonts?.ready.then(measure).catch(() => {})

    return () => {
      alive = false
    }
  }, [wide, graph, size.width])

  const byId = useMemo(() => {
    const m = new Map()
    for (const b of bodies) m.set(b.id, b)
    return m
  }, [bodies])

  const nodeById = useMemo(() => {
    const m = new Map()
    for (const n of graph.nodes) m.set(n.id, n)
    return m
  }, [graph])

  /** Which node's relationships are currently lit: selection wins over hover. */
  const focusId = selected ?? hovered
  const litEdges = useMemo(() => {
    if (!focusId) return null
    const s = new Set()
    graph.edges.forEach((e, i) => {
      if (e.source === focusId || e.target === focusId) s.add(i)
    })
    return s
  }, [focusId, graph])

  const litNodes = useMemo(() => {
    if (!focusId) return null
    const s = new Set([focusId])
    for (const e of graph.edges) {
      if (e.source === focusId) s.add(e.target)
      if (e.target === focusId) s.add(e.source)
    }
    return s
  }, [focusId, graph])

  const onKeyDown = useCallback((event) => {
    if (event.key === 'Escape') setSelected(null)
  }, [])

  const detail = selected ? nodeById.get(selected) : null
  const connections = useMemo(() => {
    if (!selected) return []
    return graph.edges
      .filter((e) => e.note && (e.source === selected || e.target === selected))
      .map((e) => ({
        other: nodeById.get(e.source === selected ? e.target : e.source),
        note: e.note,
      }))
  }, [selected, graph, nodeById])

  const grouped = useMemo(
    () =>
      Object.keys(CLUSTER_LABEL).map((cluster) => ({
        cluster,
        items: graph.nodes.filter(
          (n) => n.cluster === cluster && n.kind === 'leaf'
        ),
      })),
    [graph]
  )

  return (
    <div className="brain" ref={wrapRef} onKeyDown={onKeyDown}>
      {wide && (
      <div
        className={`brain__stage${entered ? ' is-entered' : ''}${
          visible ? ' is-live' : ''
        }`}
        ref={stageRef}
        style={{ height: size.height || undefined }}
      >
        <svg className="brain__edges" width={size.width} height={size.height}>
          {graph.edges.map((e, i) => {
            const a = byId.get(e.source)
            const b = byId.get(e.target)
            if (!a || !b) return null
            const lit = litEdges?.has(i)
            return (
              <line
                key={`${e.source}-${e.target}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className={`brain__edge ${
                  // A hub edge's source IS its cluster id, so it tints itself.
                  e.note ? 'brain__edge--cross' : `brain__edge--${e.source}`
                }${litEdges ? (lit ? ' is-lit' : ' is-dim') : ''}`}
              />
            )
          })}
        </svg>

        <p className="brain__legend">
          <span className="brain__legend-key" aria-hidden="true" />
          Travelling links cross groups
        </p>

        {graph.nodes.map((n, i) => {
          const body = byId.get(n.id)
          if (!body) return null
          const dim = litNodes && !litNodes.has(n.id)
          return (
            <button
              key={n.id}
              ref={(el) => {
                if (el) nodeRefs.current.set(n.id, el)
                else nodeRefs.current.delete(n.id)
              }}
              type="button"
              className={`brain__node brain__node--${n.kind} brain__node--${
                n.cluster
              }${selected === n.id ? ' is-selected' : ''}${dim ? ' is-dim' : ''}`}
              style={{
                transform: `translate(calc(${body.x}px - 50%), calc(${body.y}px - 50%))`,
                // The keyframe animates FROM the stage centre TO whatever
                // transform the element already has, so the solved position
                // stays the single source of truth for where a node belongs.
                '--cx': `${center.x}px`,
                '--cy': `${center.y}px`,
                '--i': i,
              }}
              onClick={() => setSelected(selected === n.id ? null : n.id)}
              onPointerEnter={() => setHovered(n.id)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(n.id)}
              onBlur={() => setHovered(null)}
              aria-pressed={selected === n.id}
            >
              <span className="brain__dot" aria-hidden="true" />
              <span className="brain__label">{n.label}</span>
            </button>
          )
        })}
      </div>
      )}

      {/* The panel is the graph's output; announce it when it changes. */}
      {wide && (
        <div className="brain__panel" aria-live="polite">
          {!detail && (
            <p className="brain__hint">
              Twelve things I have worked on, grouped and linked. Pick one.
            </p>
          )}
          {detail && (
            <article className={`brain__card brain__card--${detail.cluster}`}>
              <p className="meta">{CLUSTER_LABEL[detail.cluster]}</p>
              <h3 className="brain__title">{detail.label}</h3>
              {detail.meta && <p className="brain__meta">{detail.meta}</p>}
              {detail.summary && <p className="brain__text">{detail.summary}</p>}
              {detail.stack && <StackTags items={detail.stack} />}
              {connections.map((c) => (
                <p className="brain__link-note" key={c.other.id}>
                  <span className="meta">Connected to {c.other.label}</span>
                  {c.note}
                </p>
              ))}
              {detail.href && (
                <Link className="btn btn--ghost brain__open" to={detail.href}>
                  Open
                  <Icon name="arrowUpRight" size={16} />
                </Link>
              )}
            </article>
          )}
        </div>
      )}

      {/* Narrow screens get the same twelve things as a readable list. A graph
          you cannot aim at is worse than a list that says the same thing. */}
      {!wide && (
        <div className="brain__list">
          {grouped.map(({ cluster, items }) => (
            <section className={`brain__group brain__group--${cluster}`} key={cluster}>
              <h3 className="meta brain__group-title">{CLUSTER_LABEL[cluster]}</h3>
              {items.map((n) => (
                <details className="brain__item" key={n.id}>
                  <summary>
                    <span className="brain__mark" aria-hidden="true" />
                    <span className="brain__item-label">{n.label}</span>
                    {n.meta && <span className="brain__item-meta">{n.meta}</span>}
                  </summary>
                  {n.summary && <p className="brain__text">{n.summary}</p>}
                  {n.href && (
                    <Link className="link" to={n.href}>
                      Open {n.label}
                    </Link>
                  )}
                </details>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
