import { SITE_URL } from '../../site.config.mjs';

/**
 * Site-wide constants used by the head, the JSON-LD graph and the sitemap.
 *
 * Everything that needs the origin imports it from here rather than hardcoding
 * it, for the same reason src/data/aif-facts.ts exists: a value copied to 50
 * pages drifts on 50 pages.
 */
export const SITE = {
  url: SITE_URL,
  name: 'Platizio Alternatives',
  /** Legal entity. Named in legal copy and in the Organization node. */
  legalName: 'Platizio Services LLP',
  defaultDescription:
    'PMS and AIF discovery for Indian HNIs, family offices and distributors — SEBI category guides, fund data and GIFT City IFSC routes.',
  locale: 'en_IN',
  lang: 'en-IN',
  youtube: 'https://www.youtube.com/@platizioalternatives',
  email: 'info.alternatives@platizio.com',
  /** src/pages/privacy.astro:88 */
  address: {
    streetAddress: 'One BKC',
    addressLocality: 'Mumbai',
    addressRegion: 'Maharashtra',
    postalCode: '400051',
    addressCountry: 'IN',
  },
} as const;

/**
 * Absolute URL for a route.
 *
 * Astro's directory build format yields pathnames with a trailing slash, while
 * every internal <a href> in Navbar.astro and Footer.astro writes them without.
 * Normalising here means the canonical can never disagree with the links
 * pointing at it. `trailingSlash: 'never'` in astro.config.mjs is the other
 * half of that guarantee.
 */
export function absUrl(pathname: string): string {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return clean === '/' ? SITE.url : `${SITE.url}${clean}`;
}

/** Normalised path, for looking a route up in the SEO map. */
export function routeKey(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}
