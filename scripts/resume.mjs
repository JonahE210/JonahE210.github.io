/**
 * The résumé carries a phone number, so the plaintext PDF is gitignored and
 * only an encrypted copy lives in the repo. CI decrypts it before building.
 *
 *   npm run resume:decrypt   secure/*.enc  -> public/*.pdf
 *   npm run resume:encrypt   public/*.pdf  -> secure/*.enc   (after an update)
 *
 * The key comes from $RESUME_KEY (how CI supplies it) or .resume-key.local
 * (how your machine does). Shelling out to openssl rather than reimplementing
 * its salted PBKDF2 container in node: the format is openssl's, so openssl
 * should own it, and it is present on macOS and on ubuntu-latest runners.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PLAIN = join(ROOT, 'public/Jonah-Escobar.pdf')
const CIPHER = join(ROOT, 'secure/Jonah-Escobar.pdf.enc')
const KEY_FILE = join(ROOT, '.resume-key.local')
const CIPHER_ARGS = ['-aes-256-cbc', '-pbkdf2', '-iter', '200000']

const mode = process.argv[2]
if (mode !== 'encrypt' && mode !== 'decrypt') {
  console.error('usage: node scripts/resume.mjs <encrypt|decrypt>')
  process.exit(1)
}

/** Written to a temp file so the key never appears in the process list. */
let keyFile = KEY_FILE
let temporary = false
if (process.env.RESUME_KEY) {
  keyFile = join(ROOT, '.resume-key.ci')
  writeFileSync(keyFile, process.env.RESUME_KEY, { mode: 0o600 })
  temporary = true
} else if (!existsSync(KEY_FILE)) {
  console.error(
    `\nNo key. Set RESUME_KEY, or put the passphrase in ${KEY_FILE}.\n` +
      `Without it the build has no résumé and check:content will say so.\n`
  )
  process.exit(1)
}

try {
  if (mode === 'decrypt') {
    mkdirSync(dirname(PLAIN), { recursive: true })
    execFileSync('openssl', ['enc', '-d', ...CIPHER_ARGS, '-in', CIPHER, '-out', PLAIN, '-pass', `file:${keyFile}`])
    console.log(`decrypted -> public/Jonah-Escobar.pdf`)
  } else {
    mkdirSync(dirname(CIPHER), { recursive: true })
    execFileSync('openssl', ['enc', ...CIPHER_ARGS, '-salt', '-in', PLAIN, '-out', CIPHER, '-pass', `file:${keyFile}`])
    console.log(`encrypted -> secure/Jonah-Escobar.pdf.enc`)
  }
} catch (error) {
  console.error(`\nopenssl failed: ${error.message}\nA wrong passphrase looks exactly like this.\n`)
  process.exitCode = 1
} finally {
  if (temporary) rmSync(keyFile, { force: true })
}
