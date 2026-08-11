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

There is no test, lint or typecheck script — **the build is the only automated
gate**. Run `npm run build` before committing and check it reports 72 pages
with zero errors.

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
- Do not add performance figures that are not in `src/data/`. Every `returns`
  value in the dataset is currently `null`.
