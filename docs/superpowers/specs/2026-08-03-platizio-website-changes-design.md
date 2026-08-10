# Platizio Alternatives — Website Change Programme

**Date:** 2026-08-03
**Source of requirements:** `Alternatives Website changes.pdf` (client change list, 3 pages, ~39 items)
**Repo:** `alternavest-site` (Astro 4.16 static, Tailwind 3.4), remote `github.com/Platizio/PlatAlt`
**Status:** design approved; implementation plan not yet written

---

## 1. Context

The client supplied a 3-page change list covering the home page, four legal pages, and the
knowledge centre (GIFT City, PMS, AIF Categories I–III). Every item was located in `src/`
before this design was written. Findings that shaped the design:

- The list reads as ~39 small edits, but the AIF figures are copy-pasted across many files.
  One "fix the rate" instruction is 5–15 hand edits.
- The repo does not build from a clean clone: `src/data/` has never been committed, yet five
  pages import it. There are 118 uncommitted changes, 109 of them under `dist/`.
- `dist/` is tracked in git and not ignored — 122 of 230 tracked files.
- Three brand names ship simultaneously: `PlatAlt` (94 in `src/`), `Platizio` (3), `AlternaVest` (2).
- Substantial fabricated financial content is live and indexable.
- The site makes three mutually incompatible regulatory claims about the business.
- There are no tests, no CI, no typecheck, and no lint. `package.json` scripts are
  `dev` / `build` / `preview` only.

## 2. Decisions taken

| # | Decision | Rationale |
|---|---|---|
| D1 | Research and propose corrections; client reviews before ship | Most "verify X" items are checkable facts, not opinions |
| D2 | Apply the MFD wording as instructed; flag the rest for compliance | Doing what was asked without inventing a regulatory position |
| D3 | Keep committing `dist/`; rebuild on every content commit | Safe regardless of where the site is actually hosted |
| D4 | Include all four beyond-PDF cleanups | Renaming `src/` alone leaves older brand generations published |
| D5 | Hybrid facts module — extract only figures duplicated 5+ times | Single source of truth where the correctness risk is |
| D6 | Home "Media outlook" = layout C, video two-thirds with side list | Client selection |
| D7 | Video = channel uploads playlist, auto-latest, `youtube-nocookie` | No code change needed when they publish |
| D8 | Ticker = 14 real fund names + category, no figures | Real returns do not exist in the dataset |
| D9 | Category tiles centred at 14px | 16px wraps two labels and breaks the grid |
| D10 | Long-Short icon → `swap_vert` | Client selection |

## 3. Scope

### In scope

All 39 client items, the global rename, and four cleanups: delete `public/html-reference/`,
remove residual `AlternaVest` strings, remove fabricated financial content, replace `Sovereign`
placeholder copy.

### Out of scope

Palette reconciliation (the site has two competing colour systems — `brand-navy`/`brand-orange`
in the chrome versus `primary-container`/`tertiary-fixed` in page bodies); adding SEO/OG metadata;
introducing tests or CI; refactoring the 13 duplicated knowledge-page templates; the absent
`python -m app.ingest.run` data pipeline. All recorded in §14 as known debt.

## 4. Delivery — three commits

### Commit 1 — Preflight

Resolve the dirty tree before any content work, so later diffs are readable.

1. Commit `src/data/` (`funds.ts`, `amcs.ts`, `funds.generated.json`, `amcs.generated.json`) —
   without these, `origin/main` does not build.
2. Commit the five modified data-consuming pages: `explore.astro`, `compare.astro`,
   `funds/[slug].astro`, `amc/index.astro`, `amc/[slug].astro`.
3. Reconcile `dist/` — the committed build still serves pages for funds that no longer exist
   (`dist/funds/blume-vc-fund`, `chryscapital-pe`, `marcellus-long-only`, `dist/amc/altico-capital`,
   `avendus-capital`) while the 14 real slugs are untracked. Rebuild and commit.
4. `.gitignore`: add `.superpowers/` and `.claude-flow/`. **Done.**
5. Delete the unreferenced root `LOGO.png` (differs from `public/logo.png`, referenced by nothing).

Gate: `npm run build` passes; `git status` clean.

### Commit 2 — Content

The rename, home page, knowledge-centre corrections, cleanups, Market Insights rebuild.

### Commit 3 — Legal

The four legal pages plus the compliance memo, isolated for a single-diff review.

## 5. Global rename

`PlatAlt` → **Platizio Alternatives** (platform/product) · `PlatAlt Management LLP` →
**Platizio Services LLP** (legal entity). The client states this is "an overall change for the
website … in global scope", so all occurrences are in scope, not only those named.

| Class | Count | Target |
|---|---|---|
| Page `<title>` suffix | 53 | Platizio Alternatives |
| Visible body copy | 35 across 24 files | Platizio Alternatives |
| Legal-entity name | 6 across 3 legal pages | Platizio Services LLP |
| `BaseLayout.astro` title default | 1 | Platizio Alternatives |
| Residual `AlternaVest` | 2 (`data/amcs.ts:36`, `amc/[slug].astro`) | Platizio Alternatives |

**Gap the PDF leaves:** `terms.astro` has five `PlatAlt` occurrences (lines 4, 17, 32, 56, 66); the
list names only lines 17 and 32. Followed literally, the page reads "Platizio Services LLP" in
section 4 and "PlatAlt" in sections 6 and 8, with a tab titled "Terms of Service | PlatAlt".
All five change.

**Also fix at `data/amcs.ts:36`:** the tagline template renders `2 strategyies`
(`strategy${n===1?'':'ies'}`).

### Blocked on client input

- **Email domain.** `privacy@alternavest.in` is hardcoded in `privacy.astro`. No `platizio.*`
  address exists anywhere in the repo.
- **Defined short term.** The ToS defines one term `("PlatAlt", "we", "us", or "our")` and reuses
  it in sections 6 and 8. Splitting into platform + entity means choosing the new short term and
  re-pointing every downstream reference to the correct one of the two.

## 6. Home page — `src/pages/index.astro`

| ID | Change | Location |
|---|---|---|
| H1 | Ticker dividers: `<span class="text-outline mx-4">\|</span>` → `<span class="block w-[2px] h-6 bg-outline/70 mx-6">`. All 8 occurrences (4 visible + 4 in the `aria-hidden` duplicate track) must match or the marquee desyncs | 39, 41, 43, 45, 50, 52, 54, 56 |
| H1b | Ticker content → 14 real fund names + category label, no figures | 38–57 |
| H2 | `icon: 'account_balance'` → `icon: 'balance'` (Portfolio Balancing) | 110 |
| H3 | Category tiles: `items-start` → `items-center` + `text-center`; label `text-xs` → `text-sm` | 87, 89 |
| H3b | `{ label: 'Long Short', … icon: 'trending_up' }` → `icon: 'swap_vert'` | 81 |
| H4 | "alternative asset classes" → "alternative investments" | 102 |
| H5 | Delete "Institutional Intelligence" eyebrow; "Research & Insights" → "Media outlook" | 131, 132 |
| H6 | Rebuild section per layout C | 126–184 |
| H7 | CTA → "Invest with Greater Clarity" + new body copy | 192–195 |

**H1b — why no percentages.** All five ticker funds and all five percentages are invented. The
real dataset has 14 funds and **every `returns` value is `null`**; AUM exists for only the 9 PMS
entries. There is no performance data to substitute, so the ticker carries names and categories only.

**H5 capitalisation.** Client wrote "Media outlook" (lowercase o). Every other heading on the page
is Title Case. Rendering as `Media` (roman) + `outlook` (italic), matching the existing
`<span class="italic">` treatment. Flag for confirmation.

**H6 structure.** Centred heading → video at `md:col-span-8` → article list at `md:col-span-4` →
"View All Insights" retained. Video is an `<iframe>` against
`youtube-nocookie.com/embed/videoseries?list=UUriQiBtwCdiNAvNdJBqYcyw`, derived from channel
`UCriQiBtwCdiNAvNdJBqYcyw` (`@PlatizioAlternatives`, 7 videos). The dead
`Articles / Videos / Outlook` tabs (135–137) are deleted — they have no handlers.

This adds the first third-party iframe to a site that currently loads only Google Fonts and
`lh3.googleusercontent.com` images. `youtube-nocookie` plus `loading="lazy"` mitigates.

**H7 treatment.** "Invest with" white italic serif; "Greater Clarity" gold (`text-tertiary-fixed`)
upright — mirroring the `Elevate your capital's / potential.` split it replaces.

## 7. Knowledge centre

### 7.1 Facts module

New `src/data/aif-facts.ts` for the five figures duplicated 5+ times:

| Fact | Occurrences |
|---|---|
| Pass-through / Sec. 115UB | 14 |
| Category I tax-treatment block | 15 |
| Minimum investor ticket ₹1 Crore | 10 |
| STCG rate | 5 (incl. `knowledge/pms.astro`) |
| LTCG rate | 5 |

Everything else is edited in place. Stat cards are inline `{ label, value, sub }` array literals in
the template body — the module exports the values those arrays reference.

### 7.2 Verified corrections

Confirmed against primary sources. These ship in commit 2.

**SEBI AIF fees** — [SEBI AIF registration FAQ, Jan 2025](https://www.sebi.gov.in/sebi_data/faqfiles/jan-2025/1737459880769.pdf)

| Item | Correct | Site says |
|---|---|---|
| Application fee, any category | ₹1,00,000 + 18% GST | ₹5 Lakh ✗ |
| Category I (except Angel) registration | ₹5,00,000 + 18% GST | — |
| **Category II registration** | **₹10,00,000 + 18% GST** | ₹5L + ₹15L ✗ |
| Category III registration | ₹15,00,000 + 18% GST | ✓ |
| Angel Fund registration | ₹2,00,000 + 18% GST | absent |

Registration fee is payable on receipt of SEBI approval, not at application. Present on all three
category index pages (`category-i.astro`, `category-ii.astro`, `category-iii.astro`) — wrong on all three.

**Client gap:** no Category II figure was supplied. It is ₹10 Lakh.
**Unsupported claim:** `category-ii.astro:140` asserts a "₹1 Lakh p.a." annual fee. No recurring
fee appears in SEBI's schedule. Recommend removal; flagged for confirmation.

**Capital gains** — [CBDT FAQs](https://incometaxindia.gov.in/Lists/Latest%20News/Attachments/673/FAQs%20-New-Capital-Gains-Taxation-regime.pdf) · [s.111A](https://www.incometaxindia.gov.in/w/section-111a-22) · [s.112](https://www.incometaxindia.gov.in/w/section-112-103) · [PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2036604&reg=48&lang=2)

| Item | Correct (transfers on/after 23 Jul 2024) | Client asserted | Verdict |
|---|---|---|---|
| STCG, s.111A listed equity | 15% → **20%** | "STCG is 20%" | correct |
| LTCG, s.112A listed equity | 10% → **12.5%** | "12.5%" | correct |
| s.112A exemption threshold | ₹1 Lakh → **₹1.25 Lakh** | *not mentioned* | **client gap** |
| LTCG, s.112 unlisted | **12.5%, indexation removed** | "12.5% without indexation" | correct |
| Unlisted holding period | **24 months** (unchanged) | — | site correct |

`category-ii.astro:221` still states the ₹1 Lakh exemption; it becomes ₹1.25 Lakh.

### 7.3 Page-specific — must NOT propagate

The mapping established these are carve-outs, not general AIF rules. ₹1 Crore remains correct for
general AIFs; applying ₹2 Lakh site-wide would be factually wrong.

| Change | Applies only to |
|---|---|
| Minimum corpus ₹20 Cr → ₹5 Cr | `category-i/social-venture.astro:105` |
| Minimum ticket → ₹2 Lakh (₹1,000 for ZCZP) | `category-i/social-venture.astro:106` |
| Investors: no minimum, max 200 | `category-i/angel.astro` (+ the angel card at `category-i.astro:91`) |
| Startup eligibility → 10 years | `category-i/angel.astro` (2 occurrences) |

### 7.4 Other in-place edits

- `knowledge/pms.astro` — "Portfolio Management Intelligence" → "Portfolio Management Services".
  The literal phrase does not grep because a `<span>` splits it.
- Skin-in-the-game — reword per client. Substance is unchanged; the only difference is naming the
  obligated party. Prose does not fit the `text-xl` stat card at `category-i.astro:224`, so it goes
  in the sub-caption. **Note:** client says "Fund manager"; verify whether the obligation sits with
  the Manager or the Sponsor (§8).
- Leverage — client's replacement is two sentences; no prose leverage block exists on the Cat I
  pages, only stat cards and one-line bullets. Needs a new paragraph slot.
- REIT minimum — `category-ii/real-estate.astro`, single occurrence.

## 8. Legal

Applied as instructed:

- `terms.astro` — "Legal" eyebrow enlarged from `text-[10px]`. The identical eyebrow appears on all
  four legal pages; changing one alone makes the set inconsistent, so all four move together.
- Section 1 Acceptance of Terms, section 4 Intellectual Property, and the three unnamed occurrences.
- `privacy.astro` point 1 entity name.
- `regulatory-disclosure.astro` — "Platizio Services LLP is a registered Mutual Fund distributor".
- `risk-disclaimer.astro` point 2 — tenure to 3–7. **Note:** the client said the current figure is
  "7-10 years"; it is actually **3–10** (en dash, U+2013). No `7-10` string exists on that page.
- Privacy section 4 (Data Sharing) — currently one unbroken prose paragraph with hand-typed `(a)`
  `(b)` `(c)` `(d)` labels, inconsistent with every other list on the site. Converted to a proper
  `<ul>`. This is the most defensible reading of "correct arrangement".

Flagged, not changed — compliance memo:

1. **Three incompatible positions.** `Footer.astro:12` asserts "SEBI Registered RIA." on every page
   with no registration number; `regulatory-disclosure.astro` says the entity is *not* a registered
   Investment Adviser; the client now wants "registered Mutual Fund distributor". An MFD is an
   AMFI/ARN registration and does not cover AIF or PMS distribution, yet the entire site is an
   AIF/PMS discovery platform.
2. **Eligibility clause** cites `"Sophisticated Investors" as defined under SEBI (AIF) Regulations,
   2012`. The AIF Regulations do not define that term.
3. **Liability cap** of ₹10,000 against investors committing ₹1 Crore+.
4. **Governing law** names both arbitration under the Arbitration and Conciliation Act 1996 *and*
   exclusive jurisdiction of Mumbai courts.
5. **Privacy points 5–7** — client says "correct" but not what is wrong. Point 5 (Data Security)
   makes hard auditable claims (AES-256 at rest, TLS 1.3, annual penetration testing) that are
   legally risky if untrue. Needs owner confirmation, not a developer guess.
6. **Disclosure points 4–5** — statute list to be verified once research resumes.

## 9. Market Insights rebuild — `src/pages/media.astro`

The client says "complete page change" without a target. This page holds the densest concentration
of fabricated content in the repo: three invented "Masterclass" episodes, three invented articles, a
"Market Pulse" panel with fake breaking news and a hardcoded `EST 14:32:01 • TOKYO OPEN`, and
"Join 12,000+ high-net-worth professionals … Respecting privacy since 1994".

| Section | Action |
|---|---|
| Hero (7–30) | Heading → "Market Insights", matching the nav label. Factual subhead. Dead "Explore Archives" button removed |
| Masterclass Series (32–81) | → **Video library**: embedded uploads playlist, all 7 real videos, auto-updating |
| The Journal (83–106) | → links to real knowledge-centre pages, replacing three invented articles |
| Market Pulse (108–137) | **Deleted.** No data source exists; it can only ever be fiction |
| Newsletter (139–151) | Form retained, fabricated social proof removed. **Blocked:** the form posts nowhere — needs an endpoint or should open the existing consult modal |

`M1` resolved: "Meridian Insights" / "Strategic foresight for the sovereign investor…" is the
**current** text (`media.astro:16–19`), not the desired replacement. The PDF says to change it but
never says to what; "Market Insights" is proposed for consistency with the nav and footer.

## 10. Cleanups

1. **Delete `public/html-reference/`** — 36 files, 652 KB. Anything in `public/` is copied verbatim
   into `dist/`, so these are live at `/html-reference/*.html`: crawlable, unlinked, and carrying
   `AlternaVest` ×15, `Sovereign` ×110, `Meridian` ×22 plus fabricated data.
2. **Residual `AlternaVest`** — `data/amcs.ts:36`, `amc/[slug].astro`.
3. **Fabricated financial content** — `amc/profile.astro` (156 lines, invented firm "Meridian Prime
   Partners", 22 occurrences, fabricated 18.7% IRR / ₹12,400 Cr / 14.2% IRR) and the home ticker.
   `amc/profile.astro` is superseded by the data-driven `amc/[slug].astro`; delete the route rather
   than populate it with real data. Same reasoning applies to `fund.astro` (superseded by
   `funds/[slug].astro`) — flagged, not deleted, as the client did not raise it.
4. **`Sovereign` placeholder copy** — 16 occurrences. The significant ones:
   - `login.astro:29` — the login page `<h1>` is literally **"Sovereign Ledger"**, i.e. a whole page
     is still branded with a superseded name. `login.astro:9` repeats it.
   - `index.astro:108` — "within the Sovereign ecosystem" (Discovery Session step copy).
   - `amc/index.astro:48` — "curated from funds featured in the Sovereign Ledger".

## 11. Verification

No automated safety net exists, so verification is explicit:

1. `npm run build` passes on every commit.
2. **Grep gate:** zero `PlatAlt`, `AlternaVest`, `Sovereign`, `Meridian Prime` in `src/` **and**
   `dist/`. Baselines: `src/` 94/2/16/22, `dist/` 187/45/—/—.
3. **Link check** across all built pages — the rebuild deletes routes (`/amc/profile`,
   `/html-reference/*`) that `Navbar`, `Footer` or body copy may reference.
4. **Visual pass** via the browser preview on the home page, Market Insights, and one page per AIF
   category; light and dark, desktop and mobile widths.
5. **Figures diff:** every regulatory number changed is checked against §7.2 and the research
   output, with its source URL, before commit.
6. `dist/` rebuilt and committed with each content commit; `git status` clean at the end.

## 12. Blocked — no regulatory figure ships unverified

A 6-domain research workflow (`wf_20163c20-d8a`) died on a session token limit. Capital gains and
AIF fees were subsequently verified inline (§7.2). Outstanding:

| Domain | Covers |
|---|---|
| AIF TDS | s.194LBB scope and rates; whether Cat III genuinely has no TDS; the "Finance Act 2023" attribution (s.194LBB dates from 2015); Cat II TDS prose; whether the Cat III card is deleted or replaced |
| Angel + Social Impact | Angel investor min/max and the 2025 amendment; startup age (SEBI investee test vs DPIIT recognition — the site may conflate them); SIF corpus / ticket / ZCZP / grant floors and current sub-category name |
| GIFT IFSC | Current IFSCA Fund Management regime and scheme taxonomy; whether AIF Cat I/II/III language still applies; Restricted Scheme minimum and its currency; whether Special Situation Funds belongs; FME registration types; statutory regulator name |
| Legal + MFD | Accredited vs "Sophisticated" Investor; ₹10,000 cap enforceability; hybrid arbitration clause; AMFI/ARN scope vs AIF distribution; adviser/distributor separation; REIT minimum |

The workflow is resumable and cached:
`Workflow({scriptPath: '…/verify-platizio-regulatory-facts-wf_20163c20-d8a.js', resumeFromRunId: 'wf_20163c20-d8a'})`

## 13. Open questions for the client

1. New email domain for `privacy@alternavest.in`.
2. Defined short term in legal copy — "Platizio", "Platizio Alternatives", or "Platizio Services"?
3. "Media outlook" or "Media Outlook"?
4. Are there real articles? `/knowledge/article` is one hardcoded page.
5. Newsletter form endpoint, or point it at the consult modal?
6. Confirm the ₹1 Lakh p.a. AIF fee on `category-ii.astro:140` should be removed.
7. What is actually wrong with privacy points 5–7 and disclosure points 4–5?
8. Which GIFT City fund types are wrong, and what is the intended list?
9. Where is the site deployed from? No CI, host config, or `gh-pages` branch exists.
10. AMFI ARN number, if the footer's regulatory claim is to be corrected rather than removed.

## 14. Known debt, not addressed

Two competing colour systems; `global.css` (652 lines) hardcodes the palette ~40× with no CSS
variables; no OG/Twitter/canonical/favicon/JSON-LD and no `site:` in `astro.config.mjs`; 13
near-identical knowledge templates with no shared component; 26 KB of untyped
`public/site-interactive.js` holding user-facing form copy outside `src/`; `run.bat` hardcodes an
absolute Windows path; `darkMode: 'class'` is dead config; `rounded-full` is 0.75rem, not a circle;
`fontFamily.serif` (Cormorant Garamond) is fetched on every page but unused.
