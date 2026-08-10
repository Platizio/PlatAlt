/**
 * Single source of truth for the SEBI AIF figures that appear on more than one
 * knowledge-centre page.
 *
 * Why this exists: before it, the ₹1 Crore minimum ticket was hand-copied to 14
 * pages and the maximum marginal rate to 15. A rate change meant finding every
 * copy, and one that got missed sat on the comparison page stating "30%+" while
 * five other pages said ~42.744%.
 *
 * Scope is deliberately narrow. Only figures shared across pages live here.
 * Page-specific numbers — target IRR, per-investee ticket bands, strategy
 * tenures — stay inline in their own template, because centralising a value
 * with one call site only makes it harder to find.
 *
 * Sources, current as at August 2026:
 *   - SEBI (Alternative Investment Funds) Regulations, 2012, as amended by the
 *     Second Amendment Regulations, 2025
 *   - SEBI Master Circular for AIFs (leverage limit at para 7.2.3)
 *   - Income-tax Act, 2025, in force 1 April 2026. Section numbers below are
 *     the 2025 Act's; the 1961 Act equivalents are noted for reference only.
 */

/* ---------------------------------------------------------------- statute --
 * Income-tax Act, 2025 sections. Predecessors in the 1961 Act, for anyone
 * cross-checking against older material:
 *   224 <- 115UB   196 <- 111A   198 <- 112A   197 <- 112   393 <- 194LBB
 */
export const SECTION = {
  passThrough: '224',
  stcgListed: '196',
  ltcgListed: '198',
  ltcgOther: '197',
  tdsOnDistribution: '393',
} as const;

/* ------------------------------------------------------------------ rates --
 * Transfers on or after 23 July 2024. Indexation was withdrawn for listed
 * equity; the section 198 exemption threshold rose from ₹1 Lakh to ₹1.25 Lakh.
 */
export const RATE = {
  /** Short-term capital gains, listed equity. Was 15% before 23 July 2024. */
  stcgListed: '20%',
  /** Long-term capital gains, listed equity. Was 10% before 23 July 2024. */
  ltcgListed: '12.5%',
  /** Annual exemption on listed-equity LTCG. Was ₹1 Lakh. */
  ltcgExemption: '₹1.25 Lakh',
  /** Long-term capital gains, unlisted. Indexation no longer available. */
  ltcgUnlisted: '12.5%',
  /** Holding period after which unlisted gains are long-term. Unchanged. */
  unlistedHoldingPeriod: '24 months',
  /**
   * Maximum marginal rate at the highest slab, including surcharge and cess.
   * Applies at fund level to Category III, and to business income in any
   * category. The bare "30%" is the slab rate and is not the figure to quote.
   */
  maximumMarginal: '~42.744%',
  /** Withholding on distributions to resident unit holders, Cat I and II. */
  tdsResident: '10%',
} as const;

/* --------------------------------------------------------------- structure -- */
export const LIMIT = {
  /** Minimum scheme corpus. Angel Funds are exempt — they have no minimum. */
  minCorpus: '₹20 Crore',
  /** Minimum commitment per investor for a general AIF. */
  minTicket: '₹1 Crore',
  /** Reduced minimum for employees and directors of the manager. */
  minTicketEmployee: '₹25L',
  /** Maximum investors per scheme, all categories except Angel Funds. */
  maxInvestors: '1,000',
  /** Minimum tenure for a close-ended scheme, from final close. */
  minTenure: '3 Years',
  /** Manager contribution, Categories I and II. */
  skinInGameCat12: '2.5% / ₹5 Cr',
  /** Manager contribution, Category III. */
  skinInGameCat3: '5% / ₹10 Cr',
  /** Category III leverage ceiling, per Master Circular para 7.2.3. */
  maxLeverageCat3: 'Up to 2× NAV',
} as const;

/* ------------------------------------------------------------- stat cards --
 * The "Key Characteristics at a Glance" grids are inline array literals in each
 * template, mixing shared cards with page-specific ones. These are the shared
 * cards, so a page composes its grid as [STAT.minCorpus, STAT.minTicket, …]
 * plus whatever is unique to it.
 */
export interface StatCard {
  label: string;
  value: string;
  sub: string;
}

export const STAT = {
  minCorpus: {
    label: 'Minimum Corpus',
    value: LIMIT.minCorpus,
    sub: 'per scheme',
  },
  minTicket: {
    label: 'Min. Investor Ticket',
    value: LIMIT.minTicket,
    sub: `${LIMIT.minTicketEmployee} for employees`,
  },
  maxInvestors: {
    label: 'Max. Investors',
    value: LIMIT.maxInvestors,
    sub: 'per scheme',
  },
  closeEnded: {
    label: 'Fund Structure',
    value: 'Close-Ended',
    sub: 'mandatory',
  },
  openOrClosed: {
    label: 'Fund Structure',
    value: 'Open / Closed',
    sub: 'as per PPM',
  },
  minTenure: {
    label: 'Minimum Tenure',
    value: LIMIT.minTenure,
    sub: 'from final close',
  },
  /**
   * Categories I and II. No leverage to invest; short-term borrowing only, for
   * up to 30 days at a time, four times a year, capped at 10% of investable
   * funds. The sub-caption carries the exception because a bare "Not Permitted"
   * overstates the prohibition.
   */
  noLeverage: {
    label: 'Leverage',
    value: 'Not Permitted',
    sub: 'except short-term borrowing',
  },
  /** Category III, per Master Circular para 7.2.3. */
  leverageCat3: {
    label: 'Leverage',
    value: LIMIT.maxLeverageCat3,
    sub: 'SEBI circular 2021',
  },
  /** Categories I and II — taxed in the investor's hands, not the fund's. */
  passThrough: {
    label: 'Taxation',
    value: 'Pass-Through',
    sub: `Sec. ${SECTION.passThrough}, IT Act 2025`,
  },
  /** Category III — taxed at fund level, no pass-through. */
  fundLevelMmr: {
    label: 'Taxation',
    value: 'Fund Level',
    sub: `MMR ${RATE.maximumMarginal}`,
  },
  skinInGameCat12: {
    label: 'Skin-in-the-Game',
    value: LIMIT.skinInGameCat12,
    sub: 'whichever is lower',
  },
  skinInGameCat3: {
    label: 'Skin-in-the-Game',
    value: LIMIT.skinInGameCat3,
    sub: 'whichever is lower',
  },
} as const satisfies Record<string, StatCard>;
