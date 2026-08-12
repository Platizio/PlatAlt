/**
 * JSON-LD node builders.
 *
 * Every node is @id-addressable so pages cross-reference rather than repeat —
 * the Organization is defined once and referenced by @id everywhere else.
 *
 * Two standing constraints, both from docs/compliance-memo.md:
 *
 *  1. No credential or registration claim about Platizio. Memo Part A1 records
 *     three incompatible statements about what this entity is registered as —
 *     Footer.astro:12 says "SEBI Registered RIA" with no number, while
 *     regulatory-disclosure.astro:31 says "registered Mutual Fund distributor",
 *     and an MFD is registered by AMFI, not SEBI. Putting an unresolved
 *     contradiction into JSON-LD hands it to Google as a machine-readable
 *     assertion. Identity, location and contact only, until A1 is answered.
 *
 *  2. No performance figures anywhere. Every `returns` in funds.generated.json
 *     is empty and every `aum_cr` is null; the README forbids adding them.
 *
 * A fund's own reg_no is different in kind and is safe: it is a fact about a
 * third party published by the regulator, not a claim about Platizio.
 */
import { SITE, absUrl } from '../config/site';
import type { Fund } from './funds';
import { tagFor } from './funds';
import type { AmcCard } from './amcs';

type Node = Record<string, unknown>;

/**
 * Organization, deliberately not FinancialService.
 *
 * FinancialService is schema.org's type for a regulated provider and invites
 * `hasCredential` / `serviceType`. See constraint 1 above.
 *
 * When memo A1 is resolved, the upgrade is: change @type to FinancialService
 * and add hasCredential with the real credentialCategory and identifier.
 * Nothing else about this node needs to change.
 */
export const organizationNode = (): Node => ({
  '@type': 'Organization',
  '@id': `${SITE.url}/#organization`,
  name: SITE.name,
  legalName: SITE.legalName,
  url: SITE.url,
  logo: {
    '@type': 'ImageObject',
    '@id': `${SITE.url}/#logo`,
    url: `${SITE.url}/logo.png`,
    contentUrl: `${SITE.url}/logo.png`,
  },
  address: { '@type': 'PostalAddress', ...SITE.address },
  areaServed: [
    { '@type': 'Country', name: 'India' },
    { '@type': 'Place', name: 'GIFT City IFSC, Gandhinagar' },
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: SITE.email,
    areaServed: 'IN',
    availableLanguage: ['en', 'hi'],
  },
  sameAs: [SITE.youtube],
});

export const websiteNode = (): Node => ({
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  url: SITE.url,
  name: SITE.name,
  publisher: { '@id': `${SITE.url}/#organization` },
  inLanguage: SITE.lang,
});

/** Last crumb carries no `item`, per the BreadcrumbList spec. */
export const breadcrumbNode = (crumbs: { name: string; item?: string }[]): Node => ({
  '@type': 'BreadcrumbList',
  '@id': '#breadcrumb',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    ...(c.item ? { item: absUrl(c.item) } : {}),
  })),
});

/**
 * Answers must be the ones the page actually renders — feed this the same
 * array the markup maps over, never a second copy.
 */
export const faqPageNode = (faqs: { q: string; a: string }[]): Node => ({
  '@type': 'FAQPage',
  '@id': '#faq',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

export const definedTermNode = (name: string, path: string, description: string): Node => ({
  '@type': 'DefinedTerm',
  '@id': `${SITE.url}${path}#term`,
  name,
  description,
  url: absUrl(path),
  inDefinedTermSet: { '@id': `${SITE.url}/knowledge/aif#termset` },
});

export const definedTermSetNode = (
  terms: { name: string; path: string; description: string }[],
): Node => ({
  '@type': 'DefinedTermSet',
  '@id': `${SITE.url}/knowledge/aif#termset`,
  name: 'SEBI Alternative Investment Fund categories and sub-categories',
  hasDefinedTerm: terms.map((t) => ({
    '@type': 'DefinedTerm',
    '@id': `${SITE.url}${t.path}#term`,
    name: t.name,
    description: t.description,
    url: absUrl(t.path),
  })),
});

/** Knowledge pages are 600-2,400 word editorial explainers. */
export const articleNode = (o: {
  path: string;
  headline: string;
  description: string;
}): Node => ({
  '@type': 'Article',
  '@id': `${SITE.url}${o.path}#article`,
  headline: o.headline.slice(0, 110),
  description: o.description,
  mainEntityOfPage: { '@id': absUrl(o.path) },
  isPartOf: { '@id': `${SITE.url}/#website` },
  author: { '@id': `${SITE.url}/#organization` },
  publisher: { '@id': `${SITE.url}/#organization` },
  inLanguage: SITE.lang,
});

/**
 * InvestmentFund is FinancialProduct -> InvestmentOrDeposit -> InvestmentFund,
 * the correct semantic type for a fund.
 *
 * Deliberately absent: interestRate, annualPercentageRate, yield, assets,
 * aggregateRating, review, feesAndCommissionsSpecification. The dataset holds
 * no returns, no AUM and no fee data, and inventing them is forbidden.
 */
export const fundNode = (f: Fund): Node => {
  const path = `/funds/${f.slug}`;
  const isIfsca = f.site_type === 'GIFT_CITY';
  return {
    '@type': 'InvestmentFund',
    '@id': `${SITE.url}${path}#fund`,
    name: f.name,
    url: absUrl(path),
    description: f.description,
    category: tagFor(f),
    provider: {
      '@type': 'Organization',
      '@id': `${SITE.url}/amc/${f.amc_slug}#organization`,
      name: f.amc,
      url: absUrl(`/amc/${f.amc_slug}`),
    },
    ...(f.reg_no
      ? {
          identifier: {
            '@type': 'PropertyValue',
            propertyID: isIfsca ? 'IFSCA Registration Number' : 'SEBI Registration Number',
            value: f.reg_no,
          },
        }
      : {}),
    ...(f.inception_date ? { startDate: f.inception_date } : {}),
    ...(f.min_investment
      ? {
          // Free text ("₹1 Crore", "USD 150,000"). Kept as-is rather than parsed
          // into a MonetaryAmount, which would risk a wrong currency or magnitude.
          additionalProperty: {
            '@type': 'PropertyValue',
            name: 'Minimum investment',
            value: f.min_investment,
          },
        }
      : {}),
    areaServed: { '@type': 'Country', name: 'India' },
    isPartOf: { '@id': `${SITE.url}/#website` },
  };
};

/**
 * No "SEBI-registered" descriptor, even though amcs.ts:36 builds that string
 * for its visible tagline: two managers in the dataset are IFSCA-registered,
 * not SEBI. No `assets` — every aum_cr is null.
 */
export const amcNode = (a: AmcCard, funds: { name: string; href: string }[]): Node => ({
  '@type': 'Organization',
  '@id': `${SITE.url}/amc/${a.slug}#organization`,
  name: a.name,
  url: absUrl(`/amc/${a.slug}`),
  subjectOf: funds.map((f) => ({
    '@type': 'InvestmentFund',
    name: f.name,
    url: absUrl(f.href),
  })),
});

export const itemListNode = (name: string, items: { name: string; path: string }[]): Node => ({
  '@type': 'ItemList',
  '@id': '#itemlist',
  name,
  numberOfItems: items.length,
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    url: absUrl(it.path),
  })),
});
