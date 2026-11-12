/**
 * Sourced from the master career document, 2026-11-10.
 * The shape here is the contract the Phase 2 Django serializer must match.
 *
 * @typedef {Object} Social
 * @property {string} label
 * @property {string} href
 *
 * @typedef {Object} Profile
 * @property {string} name
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} status        Short availability line for the nav badge.
 * @property {string} location
 * @property {string} graduating
 * @property {string[]} about       One paragraph per entry.
 * @property {string[]} stack       Things you'd actually be happy to be asked about.
 * @property {string[]} askMeAbout
 * @property {string} email
 * @property {string} resumeUrl
 * @property {Social[]} socials
 */

/** @type {Profile} */
const profile = {
  name: 'Jonah Escobar',
  firstName: 'Jonah',
  lastName: 'Escobar',
  status: 'Open to summer 2027 SWE internships',
  location: 'Los Angeles, CA',
  graduating: 'B.S. Computer Science & Business Administration · USC · May 2028',
  about: [
    'I study computer science and business administration at USC, graduating May 2028. Most of what I have built sits where AI systems meet documents that are expensive to get wrong — pharmaceutical certificates of quality for Pfizer, course catalogues at USC, resumes.',
    'The thread through it is measurement. On a Pfizer externship, run through the Extern program, I built the evaluation harness before tuning anything, which is how I know PaddleOCR beat Tesseract at 0.26% character error against 1.27%, and why I shipped fixed chunking over sliding-window despite sliding-window scoring better — the precision gain did not pay for the effort. On Resume Roaster I set the accuracy targets before running the benchmark rather than reporting whatever number came out.',
    'Before that: backend and test work at a casting-materials startup, Lambda and Postgres work at FileByte, and embedded software on a sounding-rocket payload that flew to 100 miles.',
  ],
  stack: [
    'Python',
    'Go',
    'TypeScript',
    'C++',
    'Django',
    'FastAPI',
    'PostgreSQL',
    'Docker',
  ],
  askMeAbout: [
    'zero-value bugs in Go',
    'OCR evaluation (CER/WER)',
    'RAG chunking trade-offs',
  ],
  email: 'jonahesc@usc.edu',
  resumeUrl: '/Jonah-Escobar.pdf',
  socials: [
    { label: 'GitHub', href: 'https://github.com/JonahE210' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jonahescobar/' },
  ],
}

export default profile
