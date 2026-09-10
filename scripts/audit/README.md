# Audit harness

`npm run audit` — a static gate over `dist/`, run after `npm run build`.

`astro build` is the repo's only other automated gate, and it cannot see a dead
link, a duplicated meta description or an input with no label. This closes that
gap. It exits non-zero on any **FAIL**, so it works in CI.

```bash
npm run build && npm run audit
npm run audit -- --quiet     # FAIL lines only
```

## What it checks

| Pass | Covers |
| --- | --- |
| `links` | Internal hrefs resolve to real routes · `#fragments` resolve to real ids · every `src`/`href`/`srcset` exists on disk · `target="_blank"` carries `rel="noopener"` · links have an accessible name · orphan routes |
| `seo` | `<title>` and meta description present, sized **and unique** · single absolute canonical pointing at a real route · Open Graph and Twitter completeness · JSON-LD parses and its `url`/`@id` values resolve · sitemap ↔ routes ↔ canonicals ↔ exclusions agree · `robots.txt` |
| `a11y` | Landmarks, skip link, heading order, one `<h1>` · duplicate ids · `alt` and dimensions on images · form controls have labels · buttons have names · Material Symbols icons are `aria-hidden` · tabindex, autofocus, iframe titles, table headers |
| `assets` | Hashed images under `_astro/` that no HTML, CSS, JS or XML in `dist/` references |

Severity is declared per finding kind at the top of each check module, so
changing what gates the build is a one-line edit in a readable place.

## Deliberate omissions

**Colour contrast.** It depends on computed style — inherited backgrounds,
opacity, and whatever the font actually renders at — so it needs a real
browser, not a parse of the HTML. Check it against a running dev server. The
tokens most likely to regress are `outline`, `outline-variant` and the
`slate-*` steps used for small text; see `tailwind.config.mjs`, where those
values carry their measured ratios in comments.

**Unreferenced build output.** `assets` asks the mirror image of the `links`
question. `links` asks whether every reference resolves; `assets` asks whether
every emitted file is referenced. Astro emits each imported image's untouched
original beside its responsive variants, and copies cached variants that the
current `widths`/`formats` no longer request — 633KB of it, none ever loaded,
all of it committed and served because `dist/` is. `npm run build` prunes as
its last step (`scripts/audit/prune.mjs`), so this pass is a backstop: a
failure means something is emitting orphans by a route the prune misses.

**Orphan routes.** The `/funds/<strategy>` pages are deliberately unlinked —
they canonicalise to a `/knowledge` sibling. The allowlist is read from
`EXCLUDE_FROM_SITEMAP` in `src/data/sitemap-exclusions.mjs` rather than
duplicated here, so adding a page to that list keeps one home for the fact.

## Adding a check

Add a module under `checks/` exporting `run(pages)` that returns a reporter
from `createReporter(name)`, then register it in `index.mjs`. `pages` is
`{ file, route, html, doc }` with `doc` already parsed by parse5; `lib.mjs`
has the DOM helpers (`findAll`, `attr`, `text`, `iter`, `hiddenFromAT`).

`hiddenFromAT` is the one worth knowing about: it is why the form honeypots do
not register as unlabelled inputs.
