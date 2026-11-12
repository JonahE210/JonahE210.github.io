/**
 * The brain: a small graph of what I have worked on and how the pieces connect.
 * Sourced from the master career document, 2026-11-11.
 *
 * Rule for edges, and the reason this is worth building rather than decorating:
 * every edge is a connection I can explain out loud. Three of them cross
 * clusters, and those are the interesting ones — a graph whose links are
 * arbitrary is just a busy picture.
 *
 * @typedef {'internships'|'projects'|'usc'} Cluster
 *
 * @typedef {Object} GraphNode
 * @property {string} id
 * @property {string} label
 * @property {Cluster} cluster
 * @property {'hub'|'leaf'} kind    Hubs are the three cluster centres.
 * @property {string} [meta]        Role and dates, shown under the title.
 * @property {string} [summary]     One or two sentences. No claim that is not in master.md.
 * @property {string[]} [stack]
 * @property {string} [href]        Internal route this node opens, when one exists.
 *
 * @typedef {Object} GraphEdge
 * @property {string} source
 * @property {string} target
 * @property {string} [note]        Why these two are connected. Only on cross-cluster edges.
 */

/** @type {GraphNode[]} */
const nodes = [
  { id: 'internships', label: 'Experience', cluster: 'internships', kind: 'hub' },
  { id: 'projects', label: 'Projects', cluster: 'projects', kind: 'hub' },
  { id: 'usc', label: 'USC', cluster: 'usc', kind: 'hub' },

  {
    id: 'pfizer',
    label: 'Pfizer',
    cluster: 'internships',
    kind: 'leaf',
    meta: 'Externship via Extern · Jun–Aug 2026',
    summary:
      'A remote externship with Pfizer, run through the Extern program. OCR and retrieval over pharmaceutical vendor documents. I built the evaluation harness before tuning anything, which is how the decisions got made: PaddleOCR over Tesseract on a 0.26% character error rate against 1.27%, and fixed chunking over sliding-window because the precision it bought did not pay for the effort.',
    stack: ['Python', 'PaddleOCR', 'LlamaIndex', 'Qwen'],
    href: '/life',
  },
  {
    id: 'activepitch',
    label: 'ActivePitch',
    cluster: 'internships',
    kind: 'leaf',
    meta: 'SWE Intern · Jun–Sep 2025',
    summary:
      'Backend and test work at a startup handling casting materials. Found a bug where a file finished uploading to S3 but the call that recorded it failed, leaving storage and the database out of step — by forcing the failure deliberately rather than waiting for it.',
    stack: ['Python', 'MySQL', 'S3', 'Docker'],
    href: '/life',
  },
  {
    id: 'rocksat',
    label: 'RockSat-X',
    cluster: 'internships',
    kind: 'leaf',
    meta: 'Software · Jan–Jun 2025',
    summary:
      'C++ and Python on Arduino for inter-subsystem communication, on a team of about twenty through College of the Canyons. The payload launched and reached 100 miles.',
    stack: ['C++', 'Python', 'Arduino'],
    href: '/life',
  },
  {
    id: 'filebyte',
    label: 'FileByte',
    cluster: 'internships',
    kind: 'leaf',
    meta: 'SWE Intern · Oct–Dec 2024',
    summary:
      'First internship, part-time through the fall. AWS had ended Lambda support for Python 3.7, so two functions had to be rewritten — one validating and archiving uploads, one keeping Postgres in step with the bucket.',
    stack: ['Python', 'Django', 'PostgreSQL', 'Lambda'],
    href: '/life',
  },

  {
    id: 'trojanplanner',
    label: 'TrojanPlanner',
    cluster: 'projects',
    kind: 'leaf',
    meta: 'Co-developed · 1,000+ students',
    summary:
      'A USC course scheduler that returns conflict-free timetables ranked by professor rating. Deployed, and used to generate over 5,000 schedules.',
    stack: ['Django', 'PostgreSQL', 'React', 'TypeScript'],
    href: '/work/trojanplanner',
  },
  {
    id: 'clawguard',
    label: 'ClawGuard',
    cluster: 'projects',
    kind: 'leaf',
    meta: 'Solo · in progress',
    summary:
      'A guardrail proxy for LLM agent traffic. Capability is a four-level tier rather than allow-or-deny, and everything fails closed — if the inspection layer times out the request is restricted, not allowed.',
    stack: ['Go', 'PostgreSQL', 'Llama Guard 3'],
    href: '/work/clawguard',
  },
  {
    id: 'resume-roaster',
    label: 'Resume Roaster',
    cluster: 'projects',
    kind: 'leaf',
    meta: 'Solo · archived',
    summary:
      'A PDF resume parser that recovers structure from layout. Targets were set before the benchmark ran — 0.92 section-detection F1, 0.90 entry grouping, 0.90 bullet attribution — and it measured 1.00, 0.96 and 1.00 against 22 resumes.',
    stack: ['Python', 'FastAPI', 'pytest'],
    href: '/work/resume-roaster',
  },

  {
    id: 'blockchainsc',
    label: 'BlockchainSC',
    cluster: 'usc',
    kind: 'leaf',
    meta: 'Engineering team · one year',
    summary:
      'A USC club building decentralised applications. I was on the engineering team, working in Go and Solidity. The guardrail system we started here is where ClawGuard came from — though the club version was never finished, and what I kept is a different system.',
    stack: ['Go', 'Solidity'],
  },
  {
    id: 'coursework',
    label: 'Coursework',
    cluster: 'usc',
    kind: 'leaf',
    meta: 'B.S. CSBA · May 2028',
    summary:
      'Computer science and business administration. CSCI 103 and 104 for object-oriented programming and data structures in C++, 170 for discrete methods, 201 for software development in Java, 270 for advanced algorithms.',
    stack: ['C++', 'Java'],
  },
]

/**
 * Hub-to-leaf edges are generated; only the cross-cluster ones are written by
 * hand, because those are the ones that carry information.
 * @type {GraphEdge[]}
 */
const crossEdges = [
  {
    source: 'blockchainsc',
    target: 'clawguard',
    note: 'ClawGuard is a solo fork of the club’s guardrail project — same starting repo, rebuilt as a different system.',
  },
  {
    source: 'pfizer',
    target: 'trojanplanner',
    note: 'The same problem shape: pulling structure out of documents nobody designed to be parsed.',
  },
  {
    source: 'usc',
    target: 'trojanplanner',
    note: 'Built for USC course registration, and authenticated against @usc.edu accounts.',
  },
]

const hubEdges = nodes
  .filter((n) => n.kind === 'leaf')
  .map((n) => ({ source: n.cluster, target: n.id }))

/** @type {{nodes: GraphNode[], edges: GraphEdge[]}} */
const graph = { nodes, edges: [...hubEdges, ...crossEdges] }

export default graph
