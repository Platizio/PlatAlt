/**
 * PMS vs Mutual Fund vs AIF, as data.
 *
 * The rows were an inline literal inside the "PMS vs Alternatives" section of
 * /knowledge/pms. They are lifted here so the dedicated comparison page and the
 * PMS hub render the same figures — "PMS vs AIF vs mutual fund" is one of the
 * most contested queries in this niche and it deserves its own URL, but not a
 * second, drifting copy of the numbers.
 *
 * Figures reconcile with src/data/aif-facts.ts: the AIF minimum ticket is
 * LIMIT.minTicket (₹1 Crore) and the Category III fund-level rate is
 * RATE.maximumMarginal (~42.744%).
 */

export interface ComparisonRow {
  feature: string;
  pms: string;
  mutualFund: string;
  aif: string;
}

export const VEHICLE_COMPARISON: ComparisonRow[] = [
  { feature: 'Min Investment', pms: '₹50 Lakhs', mutualFund: '₹500', aif: '₹1 Crore' },
  { feature: 'Ownership', pms: 'Direct (demat)', mutualFund: 'Units of pool', aif: 'Units of pool' },
  { feature: 'Customisation', pms: 'High – bespoke', mutualFund: 'None', aif: 'Limited' },
  { feature: 'Transparency', pms: 'Full holding-level', mutualFund: 'Monthly disclosure', aif: 'Periodic' },
  { feature: 'Leverage', pms: 'Not allowed', mutualFund: 'Not allowed', aif: 'Allowed (Cat III)' },
  { feature: 'Regulation', pms: 'SEBI PMS Regs 2020', mutualFund: 'SEBI MF Regs', aif: 'SEBI AIF Regs 2012' },
  { feature: 'Taxation', pms: 'Investor level', mutualFund: 'Investor level', aif: 'Cat I/II pass-through; Cat III fund level' },
  { feature: 'Liquidity', pms: 'Notice period, typically 30–90 days', mutualFund: 'Open-ended, T+1 to T+3', aif: 'Close-ended, 3-year minimum tenure' },
];
