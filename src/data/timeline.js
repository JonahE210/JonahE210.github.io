/**
 * Sourced from the master career document, 2026-11-10. Newest first.
 * Adding an entry means appending one object to the top.
 *
 * Dates stay display strings, not Date objects, so ranges like "Jun–Aug 2026"
 * remain possible.
 *
 * @typedef {Object} TimelineEntry
 * @property {string} id            Stable key. Any unique string.
 * @property {string} date          Display string, e.g. "Oct 2025".
 * @property {string} title
 * @property {string} body
 * @property {string} [tag]         Optional category shown as a pill.
 * @property {boolean} [milestone]  Renders the marker filled instead of hollow.
 */

/** @type {TimelineEntry[]} */
const timeline = [
  {
    id: '2026-11-clawguard',
    date: 'Nov 2026',
    title: 'Rebuilt a club project into something that runs',
    body: 'Forked a guardrail system I had worked on in a club, deleted the half that consumed data from a producer another team never finished, and rebuilt the rest as an inline enforcement proxy. Same starting repo, different system, built alone. Measuring it caught a five-second cold start that would have quarantined the first user after any idle period — I would not have found that by reading the code.',
    tag: 'clawguard',
    milestone: true,
  },
  {
    id: '2026-09-roaster',
    date: 'Sep 2026',
    title: 'Ran the resume parser against a labelled set',
    body: 'Twenty-two anonymised resume PDFs, scored on section detection, entry grouping and bullet attribution. The targets were written down before the benchmark ran, which turned out to matter more than the results did — it is the difference between an evaluation and whatever number you happened to get.',
    tag: 'resume roaster',
  },
  {
    id: '2026-06-pfizer',
    date: 'Jun–Aug 2026',
    title: 'Built an extraction pipeline on a Pfizer externship',
    body: 'A remote externship with Pfizer, run through the Extern program. OCR and retrieval over pharmaceutical vendor documents — certificates of quality, product specifications — across roughly 200 pages. I built the evaluation harness first, which is how the decisions got made: PaddleOCR over Tesseract on a 0.26% character error rate against 1.27%, Qwen over Phi-2 and Mistral because the documents were messy enough to need the longer context and table parsing, and fixed chunking over sliding-window even though sliding-window scored better, because the precision it bought did not pay for the effort. The work shipped.',
    tag: 'extern · pfizer',
    milestone: true,
  },
  {
    id: '2025-06-activepitch',
    date: 'Jun–Sep 2025',
    title: 'Found the bug I still tell people about',
    body: 'Backend and test work at a startup handling casting materials. A client would finish uploading to S3 and then the follow-up call that recorded it would fail — leaving the file in storage with nothing in the database pointing at it. I found it by forcing the failure deliberately rather than waiting for it, and the fix was a pending-uploads table that made registration idempotent and let the orphans be reconciled afterwards.',
    tag: 'activepitch',
  },
  {
    id: '2025-01-rocksat',
    date: 'Jan–Jun 2025',
    title: 'Wrote embedded software for a payload that flew',
    body: 'C++ and Python on Arduino for inter-subsystem communication, on a team of about twenty through College of the Canyons. The payload launched and reached 100 miles.',
    tag: 'nasa rocksat-x',
    milestone: true,
  },
  {
    id: '2024-10-filebyte',
    date: 'Oct–Dec 2024',
    title: 'First internship, and a deprecation deadline',
    body: 'Part-time through the fall semester. AWS had ended Lambda support for Python 3.7, so two functions had to be rewritten — one that validated and archived uploaded documents, one that kept Postgres in step with what was actually in the bucket. I also designed the index metadata schema behind it and wrote the tests that proved the new timestamp columns populated on a real insert.',
    tag: 'filebyte',
  },
]

export default timeline
