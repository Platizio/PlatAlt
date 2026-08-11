/**
 * Per-route titles and meta descriptions.
 *
 * Why this is a central map rather than 51 edits to the page templates: the
 * same reason src/data/aif-facts.ts exists. That file's header records how ₹1
 * Crore was hand-copied to 14 pages and drifted. Meta descriptions had the
 * identical failure and were already showing it — before this file, 72 of the
 * 73 built pages shipped the same string, because BaseLayout's default was the
 * only description anyone had written.
 *
 * A route map has one real weakness: nothing ties a key to a file, so renaming
 * a page silently orphans its entry. BaseLayout closes that by throwing when a
 * route resolves to neither a map entry nor an explicit prop. `astro build` is
 * the only automated gate in this repo, so an unmapped route has to fail it.
 *
 * Conventions:
 *   - titles       <= 60 characters
 *   - descriptions 140-160 characters
 *   - every figure quoted here comes from src/data/aif-facts.ts or the page it
 *     describes. No performance figures: every `returns` in the dataset is
 *     empty and the README forbids inventing them.
 */
import type { Fund } from './funds';
import type { AmcCard } from './amcs';
import { absUrl } from '../config/site';
import { NON_INDEXABLE, FABRICATED } from './sitemap-exclusions.mjs';

export interface SeoEntry {
  title: string;
  description: string;
  /** Absolute URL. Set only where a page defers to another — see CANONICAL_MAP. */
  canonical?: string;
  noindex?: boolean;
}

export const SEO: Record<string, SeoEntry> = {
  /* ── top level ────────────────────────────────────────────────────────── */
  '/': {
    title: 'PMS & AIF Discovery for Indian HNIs | Platizio',
    description:
      'Compare SEBI-registered PMS and AIF strategies in one place. Fund data, category guides and GIFT City IFSC routes for HNIs, family offices and distributors.',
  },
  '/explore': {
    title: 'Explore PMS & AIF Funds in India | Fund Screener',
    description:
      'Screen SEBI and IFSCA registered PMS, AIF and GIFT City strategies by category, manager and minimum ticket. Registration-verified data, no performance claims.',
  },
  '/compare': {
    title: 'Compare PMS & AIF Funds Side by Side | Platizio',
    description:
      'Put two Indian PMS or AIF strategies side by side — category, manager, SEBI registration, inception and minimum investment, drawn from regulator disclosures.',
  },
  '/amc': {
    title: 'AIF & PMS Fund Managers in India: AMC Directory',
    description:
      'Directory of SEBI and IFSCA registered managers running PMS, AIF and GIFT City strategies — 2Point2, 360 ONE, HDFC, ICICI Prudential, Kotak, Marcellus and more.',
  },
  '/gift-city': {
    title: 'GIFT City IFSC: AIF & Fund Routes for NRIs (2026)',
    description:
      'GIFT City IFSC lets NRIs and foreign investors reach Indian strategies in USD under IFSCA rules. Restricted schemes, retail schemes and tax treatment explained.',
  },
  '/about': {
    title: 'About Platizio Alternatives | Platizio Services LLP',
    description:
      'Platizio Alternatives is the PMS and AIF discovery platform operated by Platizio Services LLP from One BKC, Mumbai, for HNIs, family offices and distributors.',
  },
  '/partner': {
    title: 'Distributor Partnerships: PMS & AIF | Platizio',
    description:
      'Partner with Platizio Alternatives to bring SEBI-registered PMS and AIF strategies to your HNI and family-office clients. Register as a distributor today.',
  },
  '/media': {
    title: 'Market Insights on AIF & PMS Investing | Platizio',
    description:
      'Video explainers and knowledge guides on Indian alternative investments — AIF categories, PMS mandates, GIFT City IFSC routes and how allocators evaluate them.',
  },

  /* ── knowledge: AIF ───────────────────────────────────────────────────── */
  '/knowledge/aif': {
    title: 'What is an AIF? SEBI Categories I, II & III Explained',
    description:
      'An AIF is a privately pooled vehicle registered with SEBI. Minimum ticket ₹1 Crore, minimum corpus ₹20 Crore, capped at 1,000 investors per scheme. Full guide.',
  },
  '/knowledge/aif-comparison': {
    title: 'AIF Category I vs II vs III: Full Comparison Table',
    description:
      'Compare SEBI AIF Categories I, II and III on tenure, leverage and taxation. Manager contribution is 2.5%/₹5 Cr for Cat I and II, 5%/₹10 Cr for Category III.',
  },
  '/knowledge/aif/category-i': {
    title: 'Category I AIF: VC, Angel, SME & Infrastructure Funds',
    description:
      'Category I AIFs back start-ups, SMEs, infrastructure and social ventures. Close-ended, 3-year minimum tenure, pass-through taxed under Sec. 224, IT Act 2025.',
  },
  '/knowledge/aif/category-ii': {
    title: 'Category II AIF: PE, Debt, Real Estate & Distressed',
    description:
      'Category II AIFs cover private equity, private credit, real estate and distressed assets. Pass-through taxed, no leverage, ₹1 Crore ticket, ₹20 Crore corpus.',
  },
  '/knowledge/aif/category-iii': {
    title: 'Category III AIF: Taxation, Leverage & Strategies',
    description:
      'Category III AIFs are taxed at fund level at the maximum marginal rate of ~42.744% and may lever up to 2× NAV. The minimum investor ticket is ₹1 Crore.',
  },

  /* ── knowledge: AIF Category I children ───────────────────────────────── */
  '/knowledge/aif/category-i/venture-capital': {
    title: 'Venture Capital Funds in India: Category I AIF Guide',
    description:
      'Venture capital funds are Category I AIFs backing early and growth-stage ventures. Close-ended, 3-year minimum tenure, ₹20 Crore corpus, ₹1 Crore per investor.',
  },
  '/knowledge/aif/category-i/angel': {
    title: 'Angel Funds in India: SEBI Rules & Investor Criteria',
    description:
      'Angel Funds are a Category I AIF sub-category for accredited investors. They are exempt from the ₹20 Crore minimum corpus that applies to every other scheme.',
  },
  '/knowledge/aif/category-i/infrastructure': {
    title: 'Infrastructure Funds in India: Category I AIF Guide',
    description:
      'Infrastructure AIFs fund roads, power and logistics assets as a Category I vehicle. Close-ended with a 3-year minimum tenure, pass-through taxed under Sec. 224.',
  },
  '/knowledge/aif/category-i/social-venture': {
    title: 'Social Venture Funds: Category I AIF in India',
    description:
      'Social Venture Funds are Category I AIFs pursuing measurable social return alongside financial return. Close-ended, ₹1 Crore ticket, ₹20 Crore minimum corpus.',
  },
  '/knowledge/aif/category-i/sme': {
    title: 'SME Funds in India: Category I AIF Explained',
    description:
      'SME Funds are Category I AIFs investing in small and medium enterprises and SME-exchange listings. Close-ended, 3-year tenure, ₹1 Crore minimum per investor.',
  },

  /* ── knowledge: AIF Category II children ──────────────────────────────── */
  '/knowledge/aif/category-ii/private-equity': {
    title: 'Private Equity AIF in India: Structure & Taxation',
    description:
      'Private equity funds are Category II AIFs — close-ended, 3-year minimum tenure, ₹1 Crore ticket, pass-through taxed on all income other than business income.',
  },
  '/knowledge/aif/category-ii/debt': {
    title: 'Debt AIF & Private Credit in India: Category II',
    description:
      'Category II debt AIFs lend to mid-market and structured-credit borrowers. Pass-through taxed with 10% TDS on resident distributions under Sec. 393, IT Act 2025.',
  },
  '/knowledge/aif/category-ii/real-estate': {
    title: 'Real Estate AIF in India: Category II Fund Guide',
    description:
      'Real estate AIFs are Category II vehicles investing in commercial and residential assets. Close-ended, ₹1 Crore minimum ticket, pass-through taxed to investors.',
  },
  '/knowledge/aif/category-ii/distressed-assets': {
    title: 'Distressed Asset Funds in India: Category II AIF',
    description:
      'Distressed asset AIFs buy stressed loans and special situations as Category II vehicles. Close-ended, 3-year minimum tenure, ₹1 Crore minimum per investor.',
  },

  /* ── knowledge: AIF Category III children ─────────────────────────────── */
  '/knowledge/aif/category-iii/long-only': {
    title: 'Long Only AIF India: Category III Equity Strategy',
    description:
      'Long only Category III AIFs run concentrated unhedged equity books. Taxed at the fund at ~42.744% MMR, with leverage permitted up to 2× NAV but rarely used.',
  },
  '/knowledge/aif/category-iii/long-short': {
    title: 'Long Short AIF India: Category III Hedge Strategy',
    description:
      'Long short Category III AIFs may lever up to 2× NAV under Master Circular para 7.2.3, and are taxed at the fund at the maximum marginal rate of ~42.744%.',
  },
  '/knowledge/aif/category-iii/multi-strategy': {
    title: 'Multi-Strategy AIF India: Category III Explained',
    description:
      'Multi-strategy Category III AIFs blend equity, credit and arbitrage sleeves. Fund-level tax at ~42.744% MMR, leverage up to 2× NAV, ₹1 Crore minimum ticket.',
  },
  '/knowledge/aif/category-iii/long-short-market-neutral': {
    title: 'Market Neutral AIF India: Category III Strategy',
    description:
      'Market neutral Category III AIFs hold matched long and short books to strip out market direction. Fund-level tax at ~42.744% MMR, leverage up to 2× NAV.',
  },

  /* ── knowledge: PMS ───────────────────────────────────────────────────── */
  '/knowledge/pms': {
    title: 'What is PMS? Portfolio Management Services in India',
    description:
      'PMS is a SEBI-regulated managed account with a ₹50 Lakh minimum. Compare discretionary, non-discretionary and advisory mandates, fees, taxation and reporting.',
  },

  /* ── fund strategy pages ──────────────────────────────────────────────────
   * These canonicalise to their /knowledge sibling (see CANONICAL_MAP), so
   * their titles are written for the commercial intent they will own once the
   * dataset is deep enough to drop the canonical: funds you can actually see.
   */
  '/funds/venture-capital': {
    title: 'Venture Capital AIFs in India: Funds & Managers',
    description:
      'Venture capital AIF strategies on Platizio Alternatives, with SEBI registration number, manager and minimum investment for each. Category I AIF vehicles.',
  },
  '/funds/angel': {
    title: 'Angel Funds in India: Registered Funds & Managers',
    description:
      'Angel Fund strategies listed on Platizio Alternatives, with SEBI registration number, manager and minimum investment for each. Category I AIF sub-category.',
  },
  '/funds/infrastructure': {
    title: 'Infrastructure AIFs in India: Funds & Managers',
    description:
      'Infrastructure AIF strategies on Platizio Alternatives, with SEBI registration number, manager and minimum investment for each. Category I AIF vehicles.',
  },
  '/funds/social-venture': {
    title: 'Social Venture Funds in India: Funds & Managers',
    description:
      'Social Venture Fund strategies on Platizio Alternatives, with SEBI registration number, manager and minimum investment for each. Category I AIF vehicles.',
  },
  '/funds/sme': {
    title: 'SME Funds in India: Registered Funds & Managers',
    description:
      'SME Fund strategies listed on Platizio Alternatives, with SEBI registration number, manager and minimum investment for each. Category I AIF vehicles.',
  },
  '/funds/private-equity': {
    title: 'Private Equity AIFs in India: Funds & Managers',
    description:
      'Private equity AIF strategies on Platizio Alternatives, with SEBI registration number, manager and minimum investment for each. Category II AIF vehicles.',
  },
  '/funds/debt': {
    title: 'Debt AIFs in India: Private Credit Funds & Managers',
    description:
      'Debt and private credit AIF strategies on Platizio Alternatives, with SEBI registration number, manager and minimum investment. Category II AIF vehicles.',
  },
  '/funds/real-estate': {
    title: 'Real Estate AIFs in India: Funds & Managers',
    description:
      'Real estate AIF strategies on Platizio Alternatives, with SEBI registration number, manager and minimum investment for each. Category II AIF vehicles.',
  },
  '/funds/distressed': {
    title: 'Distressed Asset Funds in India: Funds & Managers',
    description:
      'Distressed asset AIF strategies on Platizio Alternatives, with SEBI registration number, manager and minimum investment. Category II AIF vehicles.',
  },
  '/funds/structured-credit': {
    title: 'Structured Credit Funds in India: Funds & Managers',
    description:
      'Structured credit strategies on Platizio Alternatives, with SEBI registration number, manager and minimum investment. Structured credit sits in Category II.',
  },
  '/funds/long-only': {
    title: 'Long Only AIFs in India: Funds & Managers',
    description:
      'Long only Category III AIF strategies on Platizio Alternatives, with SEBI registration number, manager and minimum investment for each strategy listed.',
  },
  '/funds/long-short': {
    title: 'Long Short AIFs in India: Funds & Managers',
    description:
      'Long short Category III AIF strategies on Platizio Alternatives, with SEBI registration number, manager and minimum investment for each strategy listed.',
  },
  '/funds/multi-strategy': {
    title: 'Multi-Strategy AIFs in India: Funds & Managers',
    description:
      'Multi-strategy Category III AIF strategies on Platizio Alternatives, with SEBI registration number, manager and minimum investment for each fund listed.',
  },
  '/funds/long-short-market-neutral': {
    title: 'Market Neutral AIFs in India: Funds & Managers',
    description:
      'Market neutral Category III AIF strategies on Platizio Alternatives, with SEBI registration number, manager and minimum investment for each fund listed.',
  },

  /* ── legal ────────────────────────────────────────────────────────────── */
  '/terms': {
    title: 'Terms of Use | Platizio Alternatives',
    description:
      'Terms governing use of the Platizio Alternatives PMS and AIF discovery platform, operated by Platizio Services LLP. Jurisdiction: courts in Mumbai, Maharashtra.',
  },
  '/privacy': {
    title: 'Privacy Policy | Platizio Alternatives',
    description:
      'How Platizio Services LLP collects, uses and protects personal data submitted through the Platizio Alternatives PMS and AIF discovery platform.',
  },
  '/regulatory-disclosure': {
    title: 'Regulatory Disclosure | Platizio Alternatives',
    description:
      'Regulatory status and disclosures for Platizio Alternatives, an information and discovery platform for Alternative Investment Funds registered with SEBI.',
  },
  '/risk-disclaimer': {
    title: 'Risk Disclaimer | Platizio Alternatives',
    description:
      'Alternative investments carry risk of capital loss and limited liquidity. Read the risk disclaimer before evaluating any AIF or PMS strategy listed here.',
  },

  /* ── excluded from search ─────────────────────────────────────────────── */
  '/login': {
    title: 'Sign In | Platizio Alternatives',
    description: 'Sign in to the Platizio Alternatives platform.',
    noindex: true,
  },
  '/404': {
    title: 'Page Not Found | Platizio Alternatives',
    description:
      'That page does not exist. Browse AIF categories, PMS guides, the fund explorer or the AMC directory on Platizio Alternatives.',
    noindex: true,
  },
  // Fabricated content — docs/compliance-memo.md Part C4. Noindexed rather than
  // deleted so the exposure stops now without moving the build page count.
  '/fund': {
    title: 'Fund Detail | Platizio Alternatives',
    description: 'Sample fund detail layout. Not a live fund and not an offer.',
    noindex: true,
  },
  '/knowledge/article': {
    title: 'Insight | Platizio Alternatives',
    description: 'Editorial insight from Platizio Alternatives.',
    noindex: true,
  },
};

/**
 * /funds/<strategy> -> the /knowledge page that owns the topic.
 *
 * Direction of every pair was decided on evidence, not preference. The
 * knowledge page is longer in all 13 comparable pairs, carries 2-3 internal
 * inbound links against 0-1, and is the only side that imports aif-facts.ts —
 * so it is both the deeper page and the regulator-grounded one.
 *
 * Canonical rather than noindex: noindex would remove these pages for the
 * users arriving from the footer, and a noindexed page's canonical is
 * eventually discarded, so the consolidation never happens. A 301 would be
 * better still for link equity, but a static build cannot emit one — that
 * needs host config, which is a hosting decision nobody has made yet.
 *
 * Drop a row here when its /funds page has enough live funds to stand on its
 * own commercial intent; the title and description above are already written
 * for that day.
 */
export const CANONICAL_MAP: Record<string, string> = {
  '/funds/angel': '/knowledge/aif/category-i/angel',
  '/funds/venture-capital': '/knowledge/aif/category-i/venture-capital',
  '/funds/sme': '/knowledge/aif/category-i/sme',
  '/funds/infrastructure': '/knowledge/aif/category-i/infrastructure',
  '/funds/social-venture': '/knowledge/aif/category-i/social-venture',
  '/funds/private-equity': '/knowledge/aif/category-ii/private-equity',
  '/funds/debt': '/knowledge/aif/category-ii/debt',
  '/funds/real-estate': '/knowledge/aif/category-ii/real-estate',
  '/funds/distressed': '/knowledge/aif/category-ii/distressed-assets',
  '/funds/long-only': '/knowledge/aif/category-iii/long-only',
  '/funds/long-short': '/knowledge/aif/category-iii/long-short',
  '/funds/multi-strategy': '/knowledge/aif/category-iii/multi-strategy',
  '/funds/long-short-market-neutral': '/knowledge/aif/category-iii/long-short-market-neutral',
  // Structured credit is not a SEBI sub-category — it sits inside Category II
  // debt, and this is the thinnest page on the site at 248 words.
  '/funds/structured-credit': '/knowledge/aif/category-ii/debt',
};

/* ── dynamic routes ─────────────────────────────────────────────────────── */

const CAT_NAME: Record<Fund['site_type'], string> = {
  PMS: 'PMS',
  AIF_CAT1: 'Category I AIF',
  AIF_CAT2: 'Category II AIF',
  AIF_CAT3: 'Category III AIF',
  GIFT_CITY: 'GIFT City IFSC fund',
};

const clamp = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1).trimEnd()}…`);

/**
 * Registration and structure only. No returns, no AUM: every `returns` in the
 * dataset is empty and every aum_cr is null.
 */
export function seoForFund(f: Fund): SeoEntry {
  const cat = CAT_NAME[f.site_type] ?? 'fund';
  const reg = f.reg_no ? ` Reg. no. ${f.reg_no}.` : '';
  const min = f.min_investment ? ` Minimum investment ${f.min_investment}.` : '';
  return {
    title: clamp(`${f.name} — ${cat}`, 60),
    description: clamp(
      `${f.name} is a ${cat.toLowerCase()} managed by ${f.amc}.${reg}${min} ` +
        'Structure and registration detail on Platizio Alternatives.',
      160,
    ),
  };
}

export function seoForAmc(a: AmcCard): SeoEntry {
  const n = a.strategies;
  return {
    title: clamp(`${a.name}: PMS & AIF Strategies`, 60),
    description: clamp(
      `${a.name} runs ${n} ${n === 1 ? 'strategy' : 'strategies'} listed on Platizio ` +
        `Alternatives — ${a.categoryLabel}. Registration number, minimum investment ` +
        'and structure for each.',
      160,
    ),
  };
}

/** Routes that must never carry index,follow, regardless of map entry. */
const FORCED_NOINDEX = new Set([...NON_INDEXABLE, ...FABRICATED]);

export function resolveSeo(path: string): SeoEntry | undefined {
  const base = SEO[path];
  if (!base) return undefined;
  const canonicalTo = CANONICAL_MAP[path];
  return {
    ...base,
    ...(canonicalTo ? { canonical: absUrl(canonicalTo) } : {}),
    ...(FORCED_NOINDEX.has(path) ? { noindex: true } : {}),
  };
}
