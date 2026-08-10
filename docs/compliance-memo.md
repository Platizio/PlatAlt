# Compliance review memo — Platizio Alternatives website

**Date:** 10 August 2026
**Prepared by:** development, during the website change programme (merge commit `23fbd97`)
**For:** whoever owns regulatory sign-off for Platizio Services LLP
**Site state:** all items below are live in `main` and served from `dist/`

---

## How to read this

This is a developer's findings log, not legal advice. Nobody involved in producing
it is qualified to give a regulatory opinion, and none is offered.

Every item follows the same shape: **what the site says today**, **what the primary
source says**, and **the question that needs your answer**. Where a statement could
be checked against a published source, it was, and the source is named. Where an
item turns on enforceability, drafting quality or commercial risk appetite, it was
left alone — that judgement is yours, and guessing at it in code would have been
worse than flagging it.

Nothing in Parts A or B has been changed. Part C items are factual errors that can
be corrected on your instruction without a legal decision.

| Part | Items | Nature |
| --- | --- | --- |
| A | 2 | Registration and eligibility statements. Highest exposure. |
| B | 3 | Clause drafting and enforceability. |
| C | 4 | Verified factual defects. Fixable on instruction. |
| D | 6 | Legal copy already changed in this programme, for your awareness. |
| E | 4 | Where the site deviates from the client's own written instruction. |
| F | 1 | Dated — acts on its own timetable. |

---

## Part A — Registration and eligibility

### A1. The site makes three incompatible statements about what the business is

**What the site says.** Three different things, in three places:

| Location | Statement |
| --- | --- |
| `src/components/Footer.astro:12` — every page | "SEBI Registered RIA." No registration number given. |
| `src/pages/regulatory-disclosure.astro:31` | "Platizio Services LLP is a registered Mutual Fund distributor." |
| Site as a whole | 73 pages of AIF and PMS discovery content, fund directories and comparison tools. |

**What the sources say.** Two points were verified:

- **A mutual fund distributor is registered by AMFI, not SEBI.** AMFI issues the ARN.
  So "SEBI Registered" is the wrong descriptor for an MFD, and "RIA" (Registered
  Investment Adviser) is a different regulated capacity again, with different
  obligations. Source: AMFI Master Circular for Mutual Fund Distributors.
- **An ARN authorises distribution of mutual fund units only.** It does not extend
  to AIF or PMS. Distributing PMS requires separate registration with APMI (the
  APRN). Source: APMI, *Criteria for Registration of Distributors*.

**The question for you.** The site is an AIF and PMS platform disclosing only an
MFD registration, while the footer claims an adviser registration on every page
without a number. Which capacity does Platizio Services LLP actually hold, and does
the site's activity fall inside it? The footer line is the one on all 73 pages, so
it is the highest-volume statement of the three.

If the footer claim is to be kept rather than removed, we need the registration
number to display with it. If it is to be corrected to the MFD position, we need the
ARN. Either way this is a one-line change once you decide.

---

### A2. An investor eligibility definition is attributed to a regulation that does not contain it

**What the site says.** `src/pages/terms.astro:22`:

> This platform is intended exclusively for "Sophisticated Investors" as defined
> under SEBI (Alternative Investment Funds) Regulations, 2012 — individuals or
> entities with a minimum net worth of ₹5 Crore or institutional investors.

**What the source says.** The AIF Regulations define **Accredited Investor** —
a person who "fulfils the eligibility criteria as specified by the Board and is
granted a certificate of accreditation by an accreditation agency." No definition of
"Sophisticated Investor" was found in the Regulations, and the ₹5 Crore net-worth
figure does not correspond to an accreditation threshold in them.

**The question for you.** The clause asserts a statutory definition that does not
appear to exist, and uses it as the basis on which access to the platform is
restricted. Should the term be replaced with the defined one, restated as Platizio's
own eligibility policy without the statutory attribution, or removed?

This was deliberately not rewritten. Correcting a false attribution to a named
regulation is drafting, and the replacement wording changes who may lawfully use the
platform.

---

## Part B — Clause drafting and enforceability

These are not factual errors and cannot be resolved by checking a source. They are
noted because they were conspicuous while working on the pages.

### B1. Liability cap

`src/pages/terms.astro:56`:

> Our aggregate liability for any direct damages is limited to ₹10,000. This
> limitation does not apply to fraud or willful misconduct.

The platform's stated minimum investor commitment is ₹1 Crore. A cap set four orders
of magnitude below the transaction size may attract an unfairness challenge. The
carve-out for fraud and wilful misconduct is present. Whether the cap survives
scrutiny is a question for you.

### B2. Governing law names two forums

`src/pages/terms.astro:61`:

> Disputes shall be subject to the exclusive jurisdiction of courts in Mumbai,
> Maharashtra. Any arbitration shall be conducted under the Arbitration and
> Conciliation Act, 1996.

The clause confers exclusive court jurisdiction and separately contemplates
arbitration, without stating which governs, whether arbitration is mandatory or
optional, or who elects. Worth resolving so the dispute path is unambiguous.

### B3. The privacy policy makes auditable security commitments

`src/pages/privacy.astro:78`:

> industry-standard encryption (AES-256 at rest, TLS 1.3 in transit), multi-factor
> authentication, and role-based access controls. Our infrastructure undergoes
> annual penetration testing and is ISO 27001 aligned.

Each of these is a specific, checkable claim. If any is not literally true of the
current infrastructure, the exposure is a misstatement in a published policy rather
than a technical shortcoming. The site is a static build with no user accounts and
no server-side data store, which makes "multi-factor authentication" and
"role-based access controls" hard to place. Please confirm each claim against what
actually operates, or have the paragraph softened to what can be evidenced.

---

## Part C — Verified factual defects

These are wrong as a matter of fact, not judgement. Each can be corrected on your
instruction without a legal decision. They are listed here rather than fixed because
they sit on the regulatory pages.

### C1. A regulation is cited under the wrong name

`src/pages/regulatory-disclosure.astro:49` lists:

> SEBI (Prevention of Insider Trading) Regulations, 2015

The instrument is the SEBI (**Prohibition** of Insider Trading) Regulations, 2015.

### C2. The disclosure page cites a superseded tax statute

`src/pages/regulatory-disclosure.astro:51` lists:

> Income Tax Act, 1961 — Tax treatment of AIF investments and distributions

The Income-tax Act, **2025** has been in force since 1 April 2026 and replaces the
1961 Act. The knowledge centre was re-based to the 2025 Act during this programme —
sections 224, 196, 198, 197 and 393 now appear throughout — so the disclosure page
currently contradicts the rest of the site.

C1 and C2 both sit in "4. Applicable Regulations". The client's change list asked to
"correct points 4–5" of this page without saying what was wrong; these two defects
are the most likely referent, and answering that open question is the main reason
they are called out precisely here.

### C3. Return language on private-credit content

Two pages describe an asset class as *delivering predictable yield*:

- `src/pages/knowledge/aif/category-ii/debt.astro:31`
- `src/pages/knowledge/aif/category-ii.astro:103`

> delivering predictable yield of 12–18% p.a. against collateral packages

The numeric ranges are presented elsewhere on the same pages as "gross, indicative",
which is appropriate. The word *predictable* is not — it characterises a private
credit return as dependable. Recommend it be softened; the change is cosmetic and
the ranges can stay.

### C4. Two pages of invented content are published and crawlable

| Route | Content |
| --- | --- |
| `/knowledge/article` | A 177-line article, "Architecture of Resilience: Sovereign Wealth in Volatile Cycles", with invented allocation statistics attributed to a named industry body. |
| `/fund` | A fund detail page for "Global Alpha Opportunities", an invented fund. |

Neither is linked from anywhere on the site, so no visitor will navigate to them —
but both are built into `dist/` and are reachable and indexable by direct URL. They
are the same class of content as the fabricated AMC profile deleted during this
programme; they survived only because the change list did not name them.

Recommend deletion. They were left in place because the design spec explicitly chose
to flag rather than delete anything the client had not raised.

---

## Part D — Legal copy changed during this programme

For awareness, so a reviewer is not comparing against a stale version. Full
reasoning is in commit `1ea2f19`.

1. **Entity naming.** `PlatAlt Management LLP` → **Platizio Services LLP** throughout
   the legal pages. The defined-term scheme in the Terms was reworked so the platform
   and the legal entity are distinct, and downstream references re-pointed. The
   change list named two of five occurrences in the Terms; all five were changed,
   because following it literally would have left one page using both names.
2. **Contact address.** `privacy@alternavest.in` → **info.alternatives@platizio.com**
   in both places in the privacy policy, now as clickable links.
3. **Privacy section 4 (Data Sharing)** reformatted from a single paragraph with
   hand-typed (a)(b)(c)(d) labels into a list. Wording unchanged.
4. **Consent copy.** The investor enquiry form asked for consent to contact from
   "Platizio Alternatives Capital", an entity that does not exist. It now names
   **Platizio Services LLP**, matching the controller named in the privacy policy.
   This is consent language, so please confirm the entity is the right one.
   (`public/site-interactive.js`, commit `d9841e1`.)
5. **Risk disclaimer tenure** rewritten — see E1 below.
6. **"Legal" eyebrow** enlarged on all four legal pages for consistency. Cosmetic.

---

## Part E — Where the site deviates from the client's written instruction

Applying these literally would have published something incorrect. Each is flagged
in its commit message. All four are reversible on request.

### E1. Fund tenure — risk disclaimer

*Instructed:* change tenure to "3–7 years".
*Applied:* "a regulatory minimum tenure of three years and no regulatory maximum;
stated tenures of seven to ten years are common in private equity, venture capital,
real estate and infrastructure strategies."

SEBI sets a three-year floor with no ceiling. Capping the stated range at seven
would **understate** lock-up in a risk disclaimer, and would contradict the venture
capital page. Understating lock-up in a risk warning seemed the wrong direction to
err.

### E2. Social Impact Fund minimum investment

*Instructed:* ₹2 Lakh.
*Applied:* headline remains ₹1 Crore; the sub-caption reads "₹1,000 for NPO-only SIFs
on the SSE."

The ₹2 Lakh figure was superseded on 18 April 2026 by a ₹1,000 minimum for NPO-only
Social Impact Funds on the Social Stock Exchange.

### E3. Social Impact Fund minimum corpus

*Instructed:* ₹20 Crore → ₹5 Crore.
*Applied:* unchanged at ₹20 Crore.

₹5 Crore is the minimum corpus figure associated with **angel funds**, not Social
Impact Funds. This looks like two rules being crossed. If there is a source for ₹5
Crore applying to SIFs, it will be applied immediately.

### E4. REIT minimum investment

*Instructed:* "no defined minimum investment".
*Applied:* "₹10,000–15,000 at issue; 1 unit on exchange."

Minimum application value at initial and follow-on issue is ₹10,000–₹15,000, with a
one-unit trading lot after listing (revised with effect from 30 July 2021). "No
minimum" is true only on the secondary market. The figure previously on the site was
the pre-2021 one, so both the old text and the instruction were wrong.

### E5. Angel Fund investor cap

*Instructed:* "no minimum, max 200".
*Applied:* "no maximum for Accredited Investors".

The 2025 amendment removed the investor cap for accredited investors. Noting plainly
that this is a **reversal** of the instruction, not a rewording — please confirm.

---

## Part F — Dated

**Angel Funds become accredited-investor-only from approximately 9 September 2026.**

The Angel Funds content is already written to the post-transition rules, so no edit
is pending. Flagged because it changes who may invest, on a date roughly four weeks
after this memo.

---

## Scope of verification

**Checked against a primary source:** the AMFI/APMI registration scope in A1; the
Accredited Investor definition in A2; the regulation title in C1; the commencement of
the Income-tax Act 2025 in C2; and the figures in E1–E5.

**Not verified, and not verifiable by document search:** everything in Part B. Those
turn on enforceability and on facts about Platizio's own infrastructure and
contracting intent that only you hold.

**Confidence caveat.** Items A1, A2 and E5 were verified in a single research pass
without an independent second check, because the adversarial verification stage of
the audit that produced this memo ran out of its usage budget partway through. In
the portion that did complete, roughly one claim in twelve was overturned on
challenge. Treat those three as well-founded but worth confirming before acting on
them, rather than as settled.

---

## Suggested order

1. **A1** — it is on every page, and the answer determines whether the site's core
   activity is within the registration it discloses.
2. **A2** — it governs who may use the platform.
3. **C1, C2** — factual, cheap, and they answer an open client question.
4. **C4** — deleting two unlinked pages of invented financial content is low-cost
   and removes published material nobody is defending.
5. **B1–B3** — before any material investor volume.
6. **C3, E1–E5** — copy decisions, no deadline.
