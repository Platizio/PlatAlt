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
 * Fabricated content, pending deletion — docs/compliance-memo.md, Part C4.
 *
 * /fund invents a fund and hardcodes a NAV of $4,281.92, a YTD return of
 * +18.4% and $2.3B of AUM (src/pages/fund.astro:25-28). /knowledge/article
 * carries invented statistics attributed to a named industry body. Every real
 * fund in funds.generated.json has `returns: []` and the README forbids adding
 * performance figures, so these two pages are the only performance claims on
 * the site and they are not real.
 *
 * Submitting them to Google is the one thing that would make that exposure
 * worse. Remove these entries when the pages are deleted, not before.
 */
export const FABRICATED = ['/fund', '/knowledge/article'];

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
