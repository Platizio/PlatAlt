/**
 * The three SEBI PMS mandate types, as data.
 *
 * Why this exists: /knowledge/pms carried all three as <h3> sections inside one
 * 2,400-word page, so "discretionary PMS" and "non-discretionary PMS" — two
 * distinct queries — competed inside a single URL that could only rank for one
 * of them. The AIF side already had a hub with 13 spokes; PMS had none.
 *
 * Copy is lifted from the "Types of PMS" section of /knowledge/pms rather than
 * rewritten, so the hub and the spokes cannot state different things. `key`
 * matches the `pms_type` values in funds.generated.json, which lets each spoke
 * list the real funds that run that mandate.
 */

export interface PmsMandate {
  /** Matches Fund['pms_type'] where one exists. */
  key: 'discretionary' | 'non-discretionary' | 'advisory';
  name: string;
  /** Title-cased for headings, with the accent word rendered in italic. */
  headingLead: string;
  headingAccent: string;
  summary: string;
  points: string[];
  bestFor: string;
  /** Whether funds.generated.json carries a matching pms_type. */
  hasFunds: boolean;
}

export const PMS_MANDATES: PmsMandate[] = [
  {
    key: 'discretionary',
    name: 'Discretionary PMS',
    headingLead: 'Discretionary',
    headingAccent: 'PMS',
    summary:
      'The Portfolio Manager exercises full investment discretion on behalf of the client. Buy, sell, and rebalancing decisions are made and executed without requiring prior client approval for each transaction — enabling timely, strategy-driven portfolio management.',
    points: [
      'Manager has complete authority over trade execution',
      'No client sign-off required per transaction',
      'Fastest and most efficient strategy implementation',
      'Manager is accountable for all investment decisions',
      'Most common form of PMS in India',
    ],
    bestFor:
      'Investors who prefer to delegate fully and want a hands-off approach with professional mandate execution.',
    hasFunds: true,
  },
  {
    key: 'non-discretionary',
    name: 'Non-Discretionary PMS',
    headingLead: 'Non-Discretionary',
    headingAccent: 'PMS',
    summary:
      'The Portfolio Manager provides investment recommendations and a proposed course of action, but each trade requires explicit client approval before execution. The client remains actively involved in all portfolio decisions, while the manager acts as a research and advisory engine.',
    points: [
      'Client approves every buy/sell instruction',
      'Manager provides detailed rationale for each trade',
      'Client retains full decision-making authority',
      'Ideal for involved investors who want oversight',
      'Slower execution — suitable for low-turnover strategies',
    ],
    bestFor:
      'Investors who want professional research and recommendations but wish to retain final control over all transactions.',
    hasFunds: true,
  },
  {
    key: 'advisory',
    name: 'Advisory PMS',
    headingLead: 'Advisory',
    headingAccent: 'PMS',
    summary:
      'The Portfolio Manager solely provides investment advice and research recommendations. The client evaluates the advice independently and is responsible for executing all trades in their own account. The manager has no transactional authority whatsoever.',
    points: [
      'Manager offers research, ideas, and recommendations only',
      'Client independently evaluates and executes all trades',
      'Manager has zero transactional authority',
      'Lowest cost structure — advice fee only',
      'Maximum client control and self-directed execution',
    ],
    bestFor:
      'Sophisticated, self-directed investors who want institutional research but prefer to make and execute all decisions themselves.',
    hasFunds: false,
  },
];

export function mandate(key: string): PmsMandate | undefined {
  return PMS_MANDATES.find((m) => m.key === key);
}

/** SEBI minimum investment for PMS. Stated on /knowledge/pms. */
export const PMS_MIN_INVESTMENT = '₹50 Lakhs';
