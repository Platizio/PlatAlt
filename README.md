# Platizio Alternatives

Static marketing and knowledge site for Platizio Alternatives — a PMS and AIF
discovery platform for Indian alternative investments.

Operated by **Platizio Services LLP**.

## Stack

- [Astro](https://astro.build) 4.16 — static output, no SSR adapter
- Tailwind CSS 3.4 via `@astrojs/tailwind`
- Material Symbols Outlined for iconography (ligature names as element text)

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:4321`.

| Script | Does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve the built output |
| `npm run audit` | Static link, SEO and a11y checks over `dist/` |

There is no test, lint or typecheck script, but there are **two automated
gates**: the build, and `npm run audit`, which parses the built `dist/` and
exits non-zero on any failure. See `scripts/audit/README.md` for what each pass
covers. Run both before committing:

```bash
npm run build && npm run audit
```

The build currently reports 76 pages with zero errors. Treat that figure as a
hint, not a gate — it is hand-maintained here and has said 72, 78 and 77 at
various points without the routes being wrong. `npm run audit` is the check
that does not depend on anyone remembering a number.

The build also fails if a route has no entry in `src/data/seo.ts` and passes no
`description` to `BaseLayout`. That is deliberate: it is what stops a new or
renamed page from silently falling back to a shared meta description, which is
how 72 of the then-73 pages ended up with identical descriptions.

## Layout

```
src/
  data/         Fund and AMC datasets (funds.ts, amcs.ts + generated JSON)
  layouts/      BaseLayout — page shell, nav, footer
  components/   Navbar, Footer
  pages/
    knowledge/  AIF Categories I–III, PMS, GIFT City, comparison
    funds/      Strategy pages + [slug] detail route
    amc/        AMC directory + [slug] detail route
public/         Static assets, copied verbatim into dist/
dist/           Built output — tracked in git, rebuild before committing
```

`dist/` is committed. Any change under `src/` or `public/` needs a rebuild in
the same commit, or the published site drifts from the source.

## Content conventions

- **Platizio Alternatives** is the platform and brand.
- **Platizio Services LLP** is the legal entity — use it in legal copy,
  consent language and anywhere a contracting party is named.
- Regulatory figures cite the **Income-tax Act, 2025** (in force 1 April 2026)
  and the **IFSCA (Fund Management) Regulations, 2025**. Do not reintroduce
  1961 Act section numbers.
- Performance figures come from `src/data/funds.generated.json` or they do not
  appear at all. That file carries returns and AUM lifted from regulator and
  industry disclosures — `source` is `apmi`, `sebi_pmr` or `sebi_aif` (`seed`
  means editorial, and is not a disclosure). Never invent, estimate, or hand-type
  a percentage into a page template. Funds with nothing disclosed render
  `Not disclosed`, and that is the correct output, not a gap to fill.
- Wherever a figure is shown it must carry `PERFORMANCE_DISCLAIMER`, the
  `sourceLabel()` for its source, and the `as_of` date — see
  `src/pages/funds/[slug].astro`. A bare percentage with no provenance and no
  past-performance caveat is the thing SEBI's advertisement norms exist to stop,
  so the disclaimer is not decoration around the number; it is the condition on
  which the number is allowed to be there at all.
