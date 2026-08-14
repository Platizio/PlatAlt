/**
 * Paths kept out of sitemap.xml. Three different reasons, deliberately listed
 * separately so removing one group never silently removes another.
 *
 * .mjs so astro.config.mjs can import it at config-load time.
 */

/**
 * Gated or error surfaces. No search intent either way.
 */
export const NON_INDEXABLE = ['/login', '/404'];

/**
 * Fabricated content — docs/compliance-memo.md, Part C4. Now empty: both pages
 * this group existed for have been deleted rather than merely hidden.
 *
 * /fund invented a fund, with a hardcoded NAV, YTD return and AUM figure beside
 * a fabricated Chief Investment Officer and an invented quote.
 *
 * /knowledge/article carried invented allocation statistics attributed to a
 * named industry body, and bylined them to a real named person under a job
 * title that person does not hold. Deleted 2026-08-13, in the same change that
 * corrected that title everywhere else on the site.
 *
 * Keep the export. It is the documented home for anything of this kind, and an
 * empty list is a clearer signal than a deleted concept.
 */
export const FABRICATED = [];

/**
 * /funds/<strategy> pages that canonicalise to a /knowledge sibling.
 *
 * A URL that names another page as its canonical should not also be advertised
 * in the sitemap — that is a contradictory signal. See CANONICAL_MAP in
 * src/data/seo.ts for the pairing and the evidence behind the direction.
 */
export const CANONICALISED_STRATEGY_PAGES = [
  '/funds/angel',
  '/funds/venture-capital',
  '/funds/sme',
  '/funds/infrastructure',
  '/funds/social-venture',
  '/funds/private-equity',
  '/funds/debt',
  '/funds/real-estate',
  '/funds/distressed',
  '/funds/long-only',
  '/funds/long-short',
  '/funds/multi-strategy',
  '/funds/long-short-market-neutral',
  '/funds/structured-credit',
];

export const EXCLUDE_FROM_SITEMAP = new Set([
  ...NON_INDEXABLE,
  ...FABRICATED,
  ...CANONICALISED_STRATEGY_PAGES,
]);
