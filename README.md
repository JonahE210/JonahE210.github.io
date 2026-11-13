# Personal site — Jonah Escobar

React front end for a personal/recruiting site. **Phase 1 (frontend) is done.**
Phase 2 adds a small Django API behind it.

```bash
npm install
npm run resume:decrypt   # unseal the résumé (needs the key, see below)
npm run dev              # http://localhost:5173
npm run check            # content + contrast + seam + production build
```

## Résumé

`public/Jonah-Escobar.pdf` is **gitignored**: it carries a phone number, and
this repo is public, so the plaintext must never enter git history. What is
committed is `secure/Jonah-Escobar.pdf.enc`, an AES-256 container.

- Put the passphrase in `.resume-key.local` (gitignored) and run
  `npm run resume:decrypt`.
- After updating the PDF, run `npm run resume:encrypt` and commit the new
  `.enc`.
- CI gets the same passphrase from the `RESUME_KEY` repository secret.

A fresh clone has no résumé until you decrypt, and `npm run check` will say so
rather than building a site whose biggest button 404s.

## Favicon

The JE monogram is **drawn, not set** — generated geometry rather than a glyph
from whatever font is installed. `scripts/monogram.mjs` simulates a broad nib:
a centreline plus a nib angle, where stroke width follows the angle between
the tangent and the nib, which is where calligraphic thick/thin actually comes
from.

```bash
npm run monogram                      # -> public/favicon.svg
PLAYWRIGHT=<path> node scripts/monogram-png.mjs   # -> the PNG fallbacks
```

Two constraints shaped it, and both killed earlier attempts: at 16px a grid
unit is half a pixel, so every stroke needs a hard minimum width and true
hairline-against-stem contrast simply cannot render; and a chisel terminal is
either a pen lift or a flat edge at the nib angle, never both — applying a cap
width on top of a taper makes the outline spike.

## Deploys

Pushing to `main` runs `.github/workflows/ci.yml`:

1. **Checks** — decrypt the résumé, then `npm run check`: the content guard
   (no placeholder text, no dead outbound links, a real résumé), the contrast
   checker (every token pair, token roles, no raw colour outside `tokens.css`),
   the Phase 2 seam, and a production build.
2. **Deploy** — rebuild and publish `dist/` to GitHub Pages. Only on `main`,
   only after the checks pass, and never cancelling a deploy mid-flight.

Pull requests run the checks and stop there.

`npm run build` also emits a real `index.html` for every route the app has, so
a deep link like `/work/clawguard` answers **200**. Only genuinely unknown
paths fall through to `404.html` and answer 404. The HTML is still the empty
SPA shell, so this fixes status codes, not crawlability — that needs rendering
at build time.

## Swapping in your real content

All copy lives in three files. Change the values, keep the shape — the shape is
the contract the Phase 2 Django serializer has to match.

| File | What's in it |
| --- | --- |
| `src/data/profile.js` | Name, headline, the "who I am" paragraphs, stack, email, social links |
| `src/data/projects.js` | One object per project: category, problem, what you built, how it works, outcome |
| `src/data/timeline.js` | The `/life` entries, newest first. Adding one means appending one object. |
| `secure/Jonah-Escobar.pdf.enc` | The résumé. Encrypted — see **Résumé** below. |

Every field is documented with a JSDoc `@typedef` at the top of its file.

Two things to know while editing:

- **`featured: true`** on a project puts it on the home page. The first project
  in the array also gets the big cell on `/work`, so array order is the ranking —
  and it sets the `01`/`02`/`03` numbering on the cards.
- **`category`** is the two or three words beside the project number. Keep it
  short; it sits on one line next to the number.
- **Use `’`, not `'`**, in prose. The rest of the copy already does.

## Design system

Monochrome and dark. Everything visual comes from `src/styles/tokens.css`;
there are no hard-coded colours or sizes in components.

**The surface scale** goes `--bg` (the page, near-black) → `--surface` (cards)
→ `--surface-2` (hover) → `--surface-3` (pressed, active pill). Depth is carried
by surface lightness and a hairline, not by shadows, which barely read on black.

**The text scale** is three steps — `--text`, `--text-2`, `--text-3` — spaced
far enough apart to read as a hierarchy on their own. With hue removed, these
gaps *are* the hierarchy, which is why `npm run check:contrast` checks every one
of them against every surface it can land on, 17 pairs in total, reading the
real values straight out of `tokens.css`.

**The one accent** (`--accent`, a cold pale blue) is rationed to about five
appearances per page: the availability dot, project numbers, the active-nav
dot, focus rings, milestone markers. If it starts showing up anywhere else,
that is the signal it has stopped meaning anything. Everything that needs to
be loud uses brightness instead — the primary button is a white fill.

Type is Space Grotesk (display), DM Sans (body), JetBrains Mono (metadata and
the wide-tracked uppercase labels).

### Where the reference shows through

Borrowed from the site this was modelled on: the floating pill nav, the fixed
social rail down the left edge, generous corner radii on card surfaces, and
numbered project labels (`01 — CONSTRAINT SOLVER`). Not borrowed: its reliance
on photography, and its emerald accent.

## How Phase 2 plugs in

Nothing outside `src/lib/content.js` imports `src/data/` at runtime. Those
loaders are already `async` and every page already renders loading and error
branches, so Phase 2 is:

1. Replace the four function bodies in `src/lib/content.js` with `fetch` calls.
2. Delete `src/data/`.

No page or component changes. `npm run check:seam` fails the build if anything
starts reaching around that boundary.

Planned endpoints:

```
GET /api/profile
GET /api/projects
GET /api/projects/<slug>
GET /api/timeline
```

Django, no database — content read from JSON or Markdown files on disk, served
with plain `JsonResponse` and `django-cors-headers`.

## Things that were deliberate

- **No UI framework.** Plain CSS with custom properties. A site that looks like
  a template argues against the person who built it.
- **No colour.** Hierarchy comes from type weight, size and surface lightness.
  The surname is set in grey against a white given name for the same reason —
  it is the only way to get a second register without hue.
- **No animation library.** It turned out one `requestAnimationFrame` loop and
  CSS transitions covered everything, so the dependency came back out.
- **Content is never hidden by default.** `.reveal` does not hide anything; only
  `.reveal--armed`, added from JS before paint, does — and there is a 1.2s
  failsafe. A blank section caused by one callback that never fired is a worse
  outcome than no animation.
- **Reduced motion is a real second design**, not a disabled first one. Every
  page was reviewed with it on.
- **Headings are sentence case** and the voice is first person. Both are
  deliberate departures from the house style most guidelines assume.
- **Dates are display strings**, not `Date` objects, so entries like
  "Summer 2024" stay possible.

## The easter eggs

- Open devtools. The console has a note.
- Konami code — `↑ ↑ ↓ ↓ ← → ← →` — cycles the accent hue and bounces the hero
  letters. The cycle is pinned to 74% lightness: a fully saturated hue at low
  lightness drops under 3:1 around blue, and the numbers and status dots would
  vanish partway through. At 74% the worst hue is still 5.76:1. Both eggs are
  disabled under `prefers-reduced-motion`.
