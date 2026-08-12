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
 * /fund is gone: src/pages/fund.astro was deleted rather than noindexed, so its
 * entry is removed here per the instruction below. It invented a fund and
 * hardcoded a NAV of $4,281.92, a YTD return of +18.4% and $2.3B of AUM, beside
 * a fabricated Chief Investment Officer with an invented quote.
 *
 * /knowledge/article remains. It carries invented statistics attributed to a
 * named industry body. Every real fund in funds.generated.json has
 * `returns: []` and the README forbids adding performance figures, so this is
 * now the only remaining unreal performance claim on the site.
 *
 * Submitting it to Google is the one thing that would make that exposure worse.
 * Remove this entry when the page is deleted, not before.
 */
export const FABRICATED = ['/knowledge/article'];

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
