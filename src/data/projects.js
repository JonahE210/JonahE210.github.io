/**
 * Sourced from the master career document, 2026-11-10.
 * Every number here is one that document records as measured. Where it marks a
 * metric unverified or absent, the claim is left out rather than estimated.
 * The shape is the contract the Phase 2 Django serializer must match.
 *
 * @typedef {Object} ProjectLink
 * @property {'repo'|'live'|'writeup'} kind
 * @property {string} href
 *
 * @typedef {Object} Project
 * @property {string} slug          URL segment. Must be unique and stable.
 * @property {string} title
 * @property {string} tagline       One line. This is what gets read on the grid.
 * @property {string} category      Two or three words. Sits next to the project
 *                                  number on the card.
 * @property {string} year
 * @property {string} role
 * @property {'shipped'|'active'|'archived'} status
 * @property {boolean} featured     Featured projects get the large grid cell and appear on the home page.
 * @property {boolean} [collaborative]  Shared work. Switches the detail page's
 *                                  "What I built" heading to "What we built",
 *                                  so the page does not claim sole authorship.
 * @property {string[]} stack
 * @property {string} problem       Why this needed to exist.
 * @property {string} built         What you actually made.
 * @property {string[]} how         How it works. One mechanism per entry.
 * @property {string} outcome       What came of it. Numbers if you have them.
 * @property {ProjectLink[]} links
 */

/** @type {Project[]} */
const projects = [
  {
    slug: 'trojanplanner',
    title: 'TrojanPlanner',
    category: 'Course scheduling',
    tagline:
      'A USC course scheduler that generates conflict-free timetables ranked by professor rating. Co-developed; used by 1,000+ students.',
    year: '2025–present',
    role: 'Co-developed — two-person team',
    status: 'shipped',
    featured: true,
    collaborative: true,
    stack: ['Python', 'Django', 'PostgreSQL', 'React', 'TypeScript'],
    problem:
      'Picking classes at USC means cross-referencing the catalogue, checking section times for collisions by hand, and then looking up each professor separately. Everyone does the same work every semester, and the part that actually matters — which of the valid schedules is the good one — comes last, if at all.',
    built:
      'A full-stack scheduler, built with one other engineer, that takes the courses you need and returns the conflict-free timetables, ranked by Rate My Professors ratings. TrojanCounselor is the in-progress half: it ingests a pasted OASIS transcript and turns it into structured course and grade records.',
    how: [
      'Schedule generation enumerates valid section combinations and discards collisions, then ranks what survives by professor rating rather than returning an unordered list of everything that fits.',
      'Authentication is Google OAuth restricted to @usc.edu addresses, on a custom Django user model with session-based auth and protected routes on the React/TypeScript front end.',
      'The transcript ingest parses pasted OASIS unofficial transcripts into structured course and grade records, which is what feeds the degree-progress and seat-alert features being built on top of it.',
    ],
    outcome:
      'Deployed and in use by more than 1,000 students, who have generated over 5,000 schedules.',
    links: [
      { kind: 'repo', href: 'https://github.com/VincentNguyenCodes/trojan-planner' },
    ],
  },
  {
    slug: 'clawguard',
    title: 'ClawGuard',
    category: 'LLM security',
    tagline:
      'A guardrail proxy for LLM agent traffic: it inspects every prompt, scores session risk, and removes the tools a session is no longer allowed to call.',
    year: '2026',
    role: 'Solo — a fork of a club project, rebuilt',
    status: 'active',
    featured: true,
    stack: ['Go', 'PostgreSQL', 'Llama Guard 3', 'Ollama'],
    problem:
      'An agent with tool access is only as safe as the last prompt it accepted. Most guardrails answer allow or deny, which is the wrong shape: a session that looks slightly suspect should lose capability, not service, and a guard that fails should fail toward less capability rather than more.',
    built:
      'An inline reverse proxy for OpenAI-compatible traffic. Capability is a four-level tier rather than a binary — at tier 2 and above the tools array is stripped from the upstream request entirely, and at tier 3 no upstream connection is opened at all.',
    how: [
      'Two inspection layers run concurrently under one shared two-second deadline, and the joined verdict gates the request rather than being logged after the fact: in-process heuristics (injection rules, Shannon entropy, token-length spike against the conversation’s own baseline) alongside a semantic gate calling a local Llama Guard 3 server.',
      'Everything fails closed. If the semantic gate times out the request is restricted, not allowed — failing open would make the guard bypassable by stopping the inference server. An availability failure applies a request-scoped floor and persists nothing, so a minute of downtime cannot permanently quarantine a legitimate user.',
      'Demotion ratchets within a session and nothing on the request path can raise a tier, but across sessions it is risk that carries forward rather than the tier itself, decayed on a half-life. A reconnect cannot launder a quarantine, and recovery happens as risk decays instead of requiring a manual reset.',
    ],
    outcome:
      'Measured on an M4 Pro, single request rather than under load: the heuristics leg runs at 343µs, and the semantic gate at 70–80ms for a safe verdict against a two-second budget. Measuring also caught a 4.99s cold start that would have blown the budget and quarantined the first user after any idle period — the kind of failure that is invisible when you only read the code. 209 test functions across 267 cases. Still in progress at five of eight phases: load testing, an evaluation corpus, and outbound tool-call interception are not built yet, and the heuristic thresholds are deliberately uncalibrated until there is a labelled corpus to calibrate them against.',
    links: [{ kind: 'repo', href: 'https://github.com/JonahE210/ClawGuard' }],
  },
  {
    slug: 'resume-roaster',
    title: 'Resume Roaster',
    category: 'Document parsing',
    tagline:
      'A PDF resume parser that recovers structure from layout, built against accuracy targets set before the benchmark was run.',
    year: '2026',
    role: 'Solo',
    status: 'archived',
    featured: true,
    stack: ['Python', 'FastAPI', 'pytest'],
    problem:
      'A resume is a structured document pretending to be a flat one. Getting sections, entries and bullets back out of a PDF is mostly a layout problem, and treating it as a text problem loses the attribution of which bullet belongs to which role.',
    built:
      'A seven-stage parsing pipeline — extraction, line reconstruction, section detection, entry grouping, bullet attribution, field extraction, structured assembly — behind a small FastAPI service that returns structured JSON plus layout boxes.',
    how: [
      'A deterministic layer processes PDF word coordinates as bounding boxes before any model is involved, so structure comes from geometry rather than from asking a model to guess it.',
      'Evaluation was designed around three separate measures — section-detection F1, entry-grouping accuracy, bullet-attribution accuracy — because a parser can be good at one and useless at another.',
      'Scope was deliberately cut to single-column, one-page resumes. Multi-column reading order is a genuinely different problem, and supporting it early would have made the parser harder to reason about and harder to evaluate.',
    ],
    outcome:
      'Targets were set before the benchmark ran: 0.92 section-detection F1, 0.90 entry grouping, 0.90 bullet attribution. Measured against 22 anonymised resume PDFs it reached 1.00, 0.96 and 1.00. Setting the bar first is the part worth keeping — it is the difference between an evaluation and a number you happened to get.',
    links: [],
  },
]

export default projects
