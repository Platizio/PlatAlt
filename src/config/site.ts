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
  telephone: '+91 92055 23100',
  /** Digits only, for tel: and wa.me hrefs. */
  telephoneHref: '+919205523100',
  /**
   * Parent. This site is the PMS and AIF arm; SIF, mutual funds and
   * international investing are separate Platizio properties. Asserted in the
   * footer and in Organization.parentOrganization so the relationship is
   * visible to a reader and to a crawler.
   */
  parent: {
    name: 'Platizio',
    legalName: 'Platizio Services LLP',
    url: 'https://www.platizio.com',
  },
  /** Companies Act identifier. Registrar of Companies, Delhi. */
  llpin: 'AAQ-9558',
  /**
   * Where the four forms deliver.
   *
   * `accessKey` is a Web3Forms client-side form key, not a secret — it is meant
   * to ship in the page, which is why it lives here rather than in an env var.
   * Its only powers are "deliver to the mailbox this key was issued for" and
   * nothing else, and the honeypot plus Web3Forms' own rate limiting cover the
   * abuse case.
   *
   * public/site-interactive.js cannot import this file — public/ is copied
   * verbatim and never sees Astro — so BaseLayout emits both values as <meta>
   * tags and the script reads them from there. That keeps one config home
   * instead of two.
   *
   * submitForm() still refuses to POST if this is ever reset to the sentinel
   * string, and takes the failure path instead. A form that silently posts to a
   * dead key is worse than the bug this whole change exists to fix.
   *
   * Because the key ships in the page, anyone can read it and post to it.
   * Mitigations: the honeypot on all four forms, Web3Forms' own rate limiting,
   * and the domain allow-list in the Web3Forms dashboard — worth turning on and
   * restricting to alternatives.platizio.com.
   */
  form: {
    endpoint: 'https://api.web3forms.com/submit',
    accessKey: 'd93c98a8-9357-40e3-b5c7-ddfec64fd0df',
  },
  /**
   * Principal place of business, and the address carried in JSON-LD.
   *
   * Until 2026-08-13 this read "One BKC, Mumbai 400051", which is not an
   * address Platizio Services LLP holds — it went to Google as a
   * machine-readable PostalAddress on every page. Both addresses below are the
   * ones the company publishes at platizio.com/contact.
   */
  address: {
    streetAddress: 'Unit No. 415, Tower-B, KLJ Noida One, Plot B-8, Sector-62',
    addressLocality: 'Noida',
    addressRegion: 'Uttar Pradesh',
    postalCode: '201309',
    addressCountry: 'IN',
  },
  /**
   * Registered office of the LLP, per the MCA record for LLPIN AAQ-9558.
   * Legal correspondence goes here, so it — not the head office — is the
   * address named in the privacy policy. See src/pages/privacy.astro.
   */
  registeredAddress: {
    streetAddress: 'Unit DGL-229, Second Floor, DLF Galleria Mall, Mayur Vihar Phase-1',
    addressLocality: 'Delhi',
    addressRegion: 'Delhi',
    postalCode: '110092',
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
