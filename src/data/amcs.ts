// AMC directory derived from the real fund data + generated AMC index.
import { getAllFunds, getFundsByAmc, aumDisplay, tagFor, NOT_DISCLOSED, type Fund } from './funds';
import amcsRaw from './amcs.generated.json';

interface AmcRow { slug: string; name: string; fund_count: number; fund_slugs: string[]; }

const CAT_LABEL: Record<string, string> = {
  PMS: 'PMS', AIF_CAT1: 'AIF Category I', AIF_CAT2: 'AIF Category II',
  AIF_CAT3: 'AIF Category III', GIFT_CITY: 'GIFT City IFSC',
};
const ICON: Record<string, string> = {
  PMS: 'account_balance', AIF_CAT1: 'rocket_launch', AIF_CAT2: 'corporate_fare',
  AIF_CAT3: 'analytics', GIFT_CITY: 'language',
};

export interface AmcCard {
  slug: string; name: string; tagline: string; icon: string; aum: string;
  strategies: number; categoryType: string; categoryLabel: string;
}

function amcAum(funds: Fund[]): string {
  const vals = funds.map((f) => f.aum_cr).filter((v): v is number => v != null);
  if (vals.length === 0) return NOT_DISCLOSED;
  const sum = vals.reduce((a, b) => a + b, 0);
  return `₹${Math.round(sum).toLocaleString('en-IN')} Cr`;
}

function cardFor(a: AmcRow): AmcCard {
  const funds = getFundsByAmc(a.slug);
  const types = [...new Set(funds.map((f) => f.site_type))];
  const categoryType = types[0] ?? 'PMS';
  const categoryLabel = types.map((t) => CAT_LABEL[t]).join(' · ');
  return {
    slug: a.slug,
    name: a.name,
    tagline: `SEBI-registered manager with ${a.fund_count} ${a.fund_count === 1 ? 'strategy' : 'strategies'} featured on Platizio Alternatives.`,
    icon: ICON[categoryType] ?? 'account_balance',
    aum: amcAum(funds),
    strategies: a.fund_count,
    categoryType,
    categoryLabel,
  };
}

export function getAmcCards(): AmcCard[] {
  return (amcsRaw as AmcRow[]).map(cardFor);
}

export function getAmc(slug: string): AmcCard | undefined {
  const row = (amcsRaw as AmcRow[]).find((a) => a.slug === slug);
  return row ? cardFor(row) : undefined;
}

export function getAmcSlugs(): string[] {
  return (amcsRaw as AmcRow[]).map((a) => a.slug);
}

// funds belonging to an AMC, shaped for the detail page table
export function amcFunds(slug: string) {
  return getFundsByAmc(slug).map((f) => ({
    name: f.name,
    category: tagFor(f),
    aum: aumDisplay(f),
    href: `/funds/${f.slug}`,
  }));
}
