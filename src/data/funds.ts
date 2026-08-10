// Single source of truth for fund data.
//
// Imports the pipeline-generated canonical JSON (backend/out -> copied here by
// the build/CI step) and exposes typed helpers + display view-models used by
// explore, fund detail, compare and AMC pages. Replaces the hardcoded per-page
// fund arrays. Regenerate the JSON with `python -m app.ingest.run`.

import fundsRaw from './funds.generated.json';

export interface ReturnPoint {
  period: string;
  return_pct: number | null;
  benchmark_return_pct: number | null;
  as_of: string;
  source: string;
}

export interface Fund {
  source: string;
  reg_no: string | null;
  name: string;
  amc: string;
  amc_slug: string;
  product_type: 'pms' | 'aif';
  category: string | null;
  pms_type: string | null;
  sub_strategy: string;
  site_type: 'PMS' | 'AIF_CAT1' | 'AIF_CAT2' | 'AIF_CAT3' | 'GIFT_CITY';
  aum_cr: number | null;
  aum_as_of: string | null;
  aum_source: string | null;
  benchmark: string | null;
  inception_date: string | null;
  returns: ReturnPoint[];
  slug: string;
  description: string;
  min_investment: string | null;
  manager: { name?: string; title?: string; experience?: string; bio?: string } | null;
  philosophy: any | null;
  strategy: any | null;
  fund_details: { label: string; value: string }[];
  editorial_aum: string | null;
  status: string;
  last_synced_at: string | null;
}

const FUNDS = (fundsRaw as Fund[]).filter((f) => f.status === 'active');

// canonical sub_strategy -> explore filter checkbox label (must match exactly)
const SUBTYPE_DISPLAY: Record<string, string> = {
  discretionary: 'Discretionary',
  'non-discretionary': 'Non-Discretionary',
  advisory: 'Advisory',
  'venture-capital': 'Venture Capital Funds',
  angel: 'Angel Funds',
  infrastructure: 'Infrastructure Funds',
  'social-venture': 'Social Venture Funds',
  sme: 'SME Funds',
  'private-equity': 'Private Equity Funds',
  debt: 'Debt Funds',
  'real-estate': 'Real Estate Funds',
  'distressed-assets': 'Distressed Asset Funds',
  'long-only': 'Long Only',
  'long-short': 'Long Short',
  'multi-strategy': 'Multi-Strategy',
  'long-short-market-neutral': 'Long Short — Market Neutral',
  restricted: 'Restricted Schemes',
  retail: 'Retail Schemes',
};

const SUB_SHORT: Record<string, string> = {
  discretionary: 'Discretionary',
  'non-discretionary': 'Non-Discretionary',
  advisory: 'Advisory',
  'venture-capital': 'Venture Capital',
  angel: 'Angel',
  infrastructure: 'Infrastructure',
  'social-venture': 'Social Venture',
  sme: 'SME',
  'private-equity': 'Private Equity',
  debt: 'Debt',
  'real-estate': 'Real Estate',
  'distressed-assets': 'Distressed Assets',
  'long-only': 'Long Only',
  'long-short': 'Long Short',
  'multi-strategy': 'Multi-Strategy',
  'long-short-market-neutral': 'Market Neutral',
  restricted: 'Restricted',
  retail: 'Retail',
};

const CAT_LABEL: Record<string, string> = {
  PMS: 'PMS',
  AIF_CAT1: 'AIF Cat I',
  AIF_CAT2: 'AIF Cat II',
  AIF_CAT3: 'AIF Cat III',
  GIFT_CITY: 'GIFT City',
};

export const NOT_DISCLOSED = 'Not disclosed';

export function subtypeDisplay(f: Fund): string {
  return SUBTYPE_DISPLAY[f.sub_strategy] ?? f.sub_strategy;
}

export function tagFor(f: Fund): string {
  return `${CAT_LABEL[f.site_type]} · ${SUB_SHORT[f.sub_strategy] ?? f.sub_strategy}`;
}

export function aumDisplay(f: Fund): string {
  if (f.aum_cr == null) return f.editorial_aum ?? NOT_DISCLOSED;
  return `₹${Math.round(f.aum_cr).toLocaleString('en-IN')} Cr`;
}

export function inceptionYear(f: Fund): number | null {
  return f.inception_date ? new Date(f.inception_date).getUTCFullYear() : null;
}

// headline metric for cards/detail: prefer 3Y, else Since Inception, else 1Y
export function headlineMetric(f: Fund): { label: string; value: string } {
  const pick = (p: string) => f.returns.find((r) => r.period === p && r.return_pct != null);
  const r = pick('3Y') ?? pick('SI') ?? pick('1Y');
  if (!r) return { label: 'Return', value: NOT_DISCLOSED };
  const label = r.period === 'SI' ? 'Return (SI)' : `Return (${r.period})`;
  return { label, value: `${r.return_pct!.toFixed(1)}% p.a.` };
}

export function returnByPeriod(f: Fund, period: string): ReturnPoint | undefined {
  return f.returns.find((r) => r.period === period);
}

export function sourceLabel(src: string | null): string {
  if (!src) return '';
  return { apmi: 'APMI', sebi_pmr: 'SEBI', sebi_aif: 'SEBI', seed: 'Editorial' }[src] ?? src;
}

export const PERFORMANCE_DISCLAIMER =
  'Past performance is not indicative of future returns. Data sourced from ' +
  'SEBI / APMI / IFSCA / AMC disclosures. Returns are standardized TWRR where available.';

// ── accessors ──────────────────────────────────────────────────────────────
export function getAllFunds(): Fund[] {
  return FUNDS;
}

export function getFund(slug: string): Fund | undefined {
  return FUNDS.find((f) => f.slug === slug);
}

export function getFundsByAmc(amcSlug: string): Fund[] {
  return FUNDS.filter((f) => f.amc_slug === amcSlug);
}

export function uniqueAMCs(): string[] {
  return [...new Set(FUNDS.map((f) => f.amc))].sort();
}

// explore card view-model (matches the data-* attributes the filter JS reads)
export interface ExploreCard {
  id: string;
  type: string;
  subtype: string;
  tag: string;
  name: string;
  amc: string;
  desc: string;
  aum: number;
  aumDisplay: string;
  inception: number | '';
  href: string;
}

export function exploreCards(): ExploreCard[] {
  return FUNDS.map((f) => ({
    id: f.slug,
    type: f.site_type,
    subtype: subtypeDisplay(f),
    tag: tagFor(f),
    name: f.name,
    amc: f.amc,
    desc: f.description,
    aum: f.aum_cr ?? 0,
    aumDisplay: aumDisplay(f),
    inception: inceptionYear(f) ?? '',
    href: `/funds/${f.slug}`,
  }));
}
