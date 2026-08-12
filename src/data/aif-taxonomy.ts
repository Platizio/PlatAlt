/**
 * The SEBI AIF category tree, as one array.
 *
 * Three consumers today: the DefinedTermSet on /knowledge/aif, the "related
 * strategies" rail on each category child, and the cross-link from a fund
 * detail page back into the knowledge cluster. Before this existed the tree
 * was implicit in the Navbar markup and in 13 separate page templates, so
 * adding a sub-category meant finding every copy.
 *
 * `sub` matches the `sub_strategy` values in funds.generated.json, which is
 * what lets a knowledge page list the real funds that implement it.
 */

export interface AifTerm {
  /** Matches Fund['sub_strategy']. */
  sub: string;
  name: string;
  path: string;
  description: string;
}

export interface AifCategory {
  key: 'category-i' | 'category-ii' | 'category-iii';
  label: string;
  path: string;
  children: AifTerm[];
}

const term = (
  category: string,
  sub: string,
  name: string,
  description: string,
): AifTerm => ({ sub, name, path: `/knowledge/aif/${category}/${sub}`, description });

export const AIF_TAXONOMY: AifCategory[] = [
  {
    key: 'category-i',
    label: 'Category I AIF',
    path: '/knowledge/aif/category-i',
    children: [
      term('category-i', 'venture-capital', 'Venture Capital Funds',
        'Category I AIFs investing in early and growth-stage ventures.'),
      term('category-i', 'angel', 'Angel Funds',
        'A Category I sub-category pooling accredited angel investors, exempt from the ₹20 Crore minimum corpus.'),
      term('category-i', 'infrastructure', 'Infrastructure Funds',
        'Category I AIFs funding roads, power, logistics and urban infrastructure assets.'),
      term('category-i', 'social-venture', 'Social Venture Funds',
        'Category I AIFs pursuing measurable social return alongside financial return.'),
      term('category-i', 'sme', 'SME Funds',
        'Category I AIFs investing in small and medium enterprises and SME-exchange listings.'),
    ],
  },
  {
    key: 'category-ii',
    label: 'Category II AIF',
    path: '/knowledge/aif/category-ii',
    children: [
      term('category-ii', 'private-equity', 'Private Equity Funds',
        'Category II AIFs taking growth and buyout stakes in unlisted companies.'),
      term('category-ii', 'debt', 'Debt Funds',
        'Category II AIFs lending to mid-market and structured-credit borrowers.'),
      term('category-ii', 'real-estate', 'Real Estate Funds',
        'Category II AIFs investing in commercial and residential real estate assets.'),
      term('category-ii', 'distressed-assets', 'Distressed Asset Funds',
        'Category II AIFs acquiring stressed loans and special-situation assets.'),
    ],
  },
  {
    key: 'category-iii',
    label: 'Category III AIF',
    path: '/knowledge/aif/category-iii',
    children: [
      term('category-iii', 'long-only', 'Long Only Funds',
        'Category III AIFs running concentrated, unhedged equity books.'),
      term('category-iii', 'long-short', 'Long Short Funds',
        'Category III AIFs holding both long and short positions, with leverage permitted up to 2× NAV.'),
      term('category-iii', 'multi-strategy', 'Multi-Strategy Funds',
        'Category III AIFs blending equity, credit and arbitrage sleeves in one vehicle.'),
      term('category-iii', 'long-short-market-neutral', 'Market Neutral Funds',
        'Category III AIFs matching long and short books to strip out market direction.'),
    ],
  },
];

/** Flat list, for the DefinedTermSet and for lookups. */
export const ALL_AIF_TERMS: AifTerm[] = AIF_TAXONOMY.flatMap((c) => c.children);

export function categoryOf(sub: string): AifCategory | undefined {
  return AIF_TAXONOMY.find((c) => c.children.some((t) => t.sub === sub));
}

export function termOf(sub: string): AifTerm | undefined {
  return ALL_AIF_TERMS.find((t) => t.sub === sub);
}

/** Fund site_type -> the knowledge page that explains that structure. */
export const KNOWLEDGE_FOR: Record<string, string> = {
  PMS: '/knowledge/pms',
  AIF_CAT1: '/knowledge/aif/category-i',
  AIF_CAT2: '/knowledge/aif/category-ii',
  AIF_CAT3: '/knowledge/aif/category-iii',
  GIFT_CITY: '/gift-city',
};
