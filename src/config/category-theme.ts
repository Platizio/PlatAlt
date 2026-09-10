/**
 * Colour per product category, for the AMC directory, AMC profiles and fund
 * detail pages.
 *
 * Why this file exists twice over.
 *
 * The same five-entry map was copied into three templates — amc/index.astro,
 * amc/[slug].astro and funds/[slug].astro — which is the failure mode
 * src/data/aif-facts.ts was created to stop. Three copies is three chances to
 * fix four of them.
 *
 * And every copy was wrong. The map in amc/index.astro carried the comment
 * "(dark-theme)" and rendered on cards whose background is
 * surface-container-lowest, i.e. white. violet-300 text on violet-900 at 40%
 * over white measures 1.02:1. amber-200 on amber-900/40 measures 1.43:1. The
 * chips were, in practice, invisible; so were the fund headline metrics, which
 * drew their colour from the same `accent`.
 *
 * A parser cannot see this — the class names look fine and the ratio depends on
 * a background composited from a translucent layer over an ancestor. It took
 * rendering all 75 routes to surface it. scripts/browser/suites/contrast.mjs is
 * what does that now.
 *
 * The values below are chosen against measurement rather than by eye. Every
 * `accent` and every `badge` pairing clears 4.5:1 against all four grounds these
 * pages actually paint them on: white, the page ground #f9faf5, the -50 tint
 * used by `panel`, and the -100 tint used inside `badge`. The 700 step is the
 * lightest one in Tailwind's palette that does so for all five hues, so it is
 * used uniformly rather than tuned per hue — a rule some future editor can
 * follow, instead of five numbers they have to re-derive.
 *
 *   measured, text on its lightest ground (the -100 tint):
 *     amber-700   4.51    emerald-700 4.84    blue-700   5.49
 *     violet-700  5.98    indigo-700  6.41
 *
 * Not in src/data/: the Tailwind content globs exclude that directory, so class
 * names written there are never emitted. src/config/ is scanned.
 */

export interface CategoryTheme {
  /** Text and icon colour on any light ground this site uses. */
  accent: string;
  /** Tinted panel behind a headline metric. */
  panel: string;
  /** Border for that panel. */
  border: string;
  /** Complete chip: tint, text and edge. */
  badge: string;
}

/**
 * The rule is: accent = {hue}-700, panel = {hue}-50, border = {hue}-200,
 * badge = {hue}-100 tint with {hue}-800 text. Written out rather than built
 * from that rule in a loop, because Tailwind reads this file as text and never
 * runs it — a class assembled at runtime is one it cannot find and will not
 * emit.
 */
export const CATEGORY_THEME: Record<string, CategoryTheme> = {
  PMS: {
    accent: 'text-amber-700',
    panel: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800 border border-amber-200',
  },
  AIF_CAT1: {
    accent: 'text-emerald-700',
    panel: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  },
  AIF_CAT2: {
    accent: 'text-blue-700',
    panel: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800 border border-blue-200',
  },
  AIF_CAT3: {
    accent: 'text-violet-700',
    panel: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-800 border border-violet-200',
  },
  GIFT_CITY: {
    accent: 'text-indigo-700',
    panel: 'bg-indigo-50',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  },
};

/** A negative figure, on the same light grounds. red-400 measured 2.77:1. */
export const NEGATIVE_ACCENT = 'text-red-700';

export function categoryTheme(siteType: string | undefined): CategoryTheme {
  return CATEGORY_THEME[siteType ?? ''] ?? CATEGORY_THEME.PMS;
}

