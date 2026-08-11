/**
 * FAQ content for the knowledge pages.
 *
 * These arrays feed both the visible <details> markup and the FAQPage JSON-LD.
 * That is the whole point of the file: schema whose answers differ from what
 * the page renders is a structured-data violation, and keeping two copies in
 * sync by hand is the failure this repo already documented in aif-facts.ts.
 *
 * Answers restate figures that are already sourced elsewhere in the codebase —
 * src/data/aif-facts.ts for the SEBI and Income-tax Act numbers, and the body
 * copy of the page each array belongs to. Nothing here introduces a new
 * regulatory claim.
 */

export interface Faq {
  q: string;
  a: string;
}

/** /knowledge/aif — lifted verbatim from the page's own inline array. */
export const AIF_FAQS: Faq[] = [
  {
    q: 'Who can invest in an AIF?',
    a: 'AIFs are intended for sophisticated investors, including Resident Indians, NRIs, and foreign nationals. Institutional investors like banks, pension funds, and insurance companies also participate. The primary requirement is a minimum investment of ₹1 Crore (₹25 Lakhs for employees/directors of the Manager).',
  },
  {
    q: 'What is the taxation structure for AIFs?',
    a: 'Category I and II AIFs enjoy "Pass-Through" status, where income (other than business income) is taxed at the investor level. Category III AIFs are taxed at the fund level as a Determinate Trust at the Maximum Marginal Rate (MMR).',
  },
  {
    q: 'What is the tenure of an AIF?',
    a: 'Category I and II AIFs are close-ended with a minimum tenure of 3 years. Category III AIFs can be either open-ended or close-ended. Extensions are possible with 2/3rd majority approval of investors.',
  },
  {
    q: "What is SEBI's role in regulating AIFs?",
    a: 'SEBI (Securities and Exchange Board of India) is the primary regulatory authority for AIFs in India. All AIFs must be registered with SEBI before commencing operations. SEBI prescribes eligibility criteria, investment conditions, and ongoing compliance requirements.',
  },
  {
    q: 'What is the minimum investment in an AIF?',
    a: 'The minimum commitment is ₹1 Crore per investor for a general AIF, reduced to ₹25 Lakhs for employees and directors of the Manager. A scheme must also reach a minimum corpus of ₹20 Crore, and Angel Funds are exempt from that corpus floor.',
  },
  {
    q: 'How many investors can an AIF scheme have?',
    a: 'A scheme is capped at 1,000 investors across all categories except Angel Funds. The Manager must also maintain skin in the game — 2.5% of the corpus or ₹5 Crore for Categories I and II, and 5% or ₹10 Crore for Category III, whichever is lower.',
  },
];

/** /knowledge/pms — lifted verbatim from the page's three <details> blocks. */
export const PMS_FAQS: Faq[] = [
  {
    q: 'Can I withdraw from a PMS at any time?',
    a: "Most PMS mandates are open-ended in nature, allowing clients to initiate withdrawals at any time. However, the Portfolio Manager typically requires 30–90 days' notice to liquidate positions in an orderly manner without materially impacting portfolio value. Some strategies with illiquid assets may have lock-in provisions — these are disclosed in the Investment Policy Statement at onboarding.",
  },
  {
    q: 'What is the difference between Discretionary and Non-Discretionary PMS?',
    a: "In Discretionary PMS, the Portfolio Manager has full authority to make investment decisions without requiring the client's approval for each transaction. This enables timely execution of strategy. In Non-Discretionary PMS, the Portfolio Manager provides investment advice and recommendations, but the client must approve each trade before it is executed. Advisory PMS goes a step further — the manager only provides recommendations, and the client executes independently.",
  },
  {
    q: 'Are there hidden costs in PMS beyond the stated fees?',
    a: 'SEBI mandates full disclosure of all fees and charges in the PMS Disclosure Document. Apart from management fees (fixed or performance-linked), clients may incur brokerage, custodian charges, audit fees, and Goods & Services Tax on management fees. There are no hidden costs — all charges must be explicitly disclosed, and Portfolio Managers are required to provide a detailed fee statement. Always review the Disclosure Document and Client Agreement before signing.',
  },
  {
    q: 'What is the minimum investment in a PMS?',
    a: 'SEBI mandates a minimum investment of ₹50 Lakhs per client for Portfolio Management Services. That is lower than the ₹1 Crore minimum commitment an Alternative Investment Fund requires, which is one reason PMS is often the first step into managed alternatives for Indian HNIs.',
  },
  {
    q: 'How is a PMS different from a mutual fund?',
    a: 'PMS investors own the underlying securities directly in their own demat account, so holdings are transparent and portfolios can be tailored to the individual. Mutual fund investors own units of a pooled vehicle instead. The minimum investment differs sharply too — ₹50 Lakhs for PMS against a few hundred rupees for a mutual fund.',
  },
];
