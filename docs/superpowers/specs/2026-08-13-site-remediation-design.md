# Site remediation — company facts, working forms, parent linkage

**Date:** 2026-08-13
**Source of requirements:** full-site audit, 13 August 2026 (36 findings), plus owner decisions taken the same day
**Repo:** `alternavest-site` @ `f580af8` (Astro 4.16 static, Tailwind 3.4)
**Site:** `https://alternatives.platizio.com` — live, serving the committed `dist/`
**Status:** design written; not yet approved

---

## 1. Context

The site is live and every finding below is in production. Three classes of problem:

- **It does not work.** All four lead-capture surfaces discard the submission and tell the
  user it succeeded. There is no analytics, so nothing about this was visible.
- **It describes a different company.** The published postal address is a Mumbai building
  the LLP has no presence in; four corporate statistics are invented; the footer calls the
  brand a division of itself.
- **It is an orphan.** The site never links to platizio.com and never states it is part of
  Platizio, in copy or in structured data.

The audit found 8 blockers, 11 serious items, 13 housekeeping items, and 9 things already
done well — chiefly the SEO and structured-data layer, which this work must not damage.

### Scope correction recorded

The audit's first revision listed SIF, Mutual Funds and International Investing as missing
content, reasoning from platizio.com's product navigation. **That was wrong.** Those three
product lines have their own websites. This site covers **PMS, AIF and international
PMS/AIF** only.

platizio.com is the parent site and the authority for **company details** — offices, phone,
entity, leadership — but not for product scope. Both halves of that distinction matter: the
address work below draws on platizio.com, the content work deliberately does not.

## 2. Decisions taken

| # | Decision | Rationale |
|---|---|---|
| D1 | Forms post to an email relay service | No backend exists and none is planned; a static-compatible relay is the shortest path from "discards leads" to "delivers leads". Owner selection. |
| D2 | Delete the four About statistics; **do not** touch the founder biography | Owner will supply the accurate biography. Deleting an unevidenced number is safe; rewriting a person's career history from a third-party page is not. |
| D3 | Registered office is the canonical `address`; both offices appear on `/contact` | The Organization node's address should be the entity's address of record (MCA). The operating office is what a visitor needs, so `/contact` and the footer carry both. |
| D4 | Keep `info.alternatives@platizio.com` as primary; add `vc@platizio.com` on `/contact` only | The alias is arm-specific, already named as the data controller contact in the privacy policy, and was set deliberately in the previous programme. Replacing it site-wide on the strength of a parent-site scrape would be a regression. Flagged in §7. |
| D5 | Fix the *parent-linkage* half of the footer sentence now; leave the *registration* half | Two independent defects in one sentence. The circular phrasing has a known correct answer; "SEBI Registered RIA" does not, and has been open since 10 August. |
| D6 | Delete `/login` and `/knowledge/article` rather than noindex them | Both are already noindexed and sitemap-excluded and still reachable. The prior programme deleted `/fund` and `/amc/profile` on the same reasoning; these two survived only because the change list did not name them. |
| D7 | No analytics in this programme | It is sequenced after working forms, and the platform choice and DPDP consent posture are both unresolved. Recorded in §6. |

## 3. Scope

### In scope

Audit items **A1** (address), **A2** (statistics), **A4** (no contact route), **B1** (parent
linkage), **C1** (forms), **C2** (newsletter), **C3** (`/login`), **D2** (`/knowledge/article`),
**E8** (placeholder phone), and the parent-linkage half of **A5**.

### Out of scope

- **SIF, Mutual Funds, International Investing** — separate Platizio websites (§1).
- **A3** founder biography — blocked on the owner (D2).
- **A5 registration half, D1, D3, D4, D5** — blocked on the owner or on counsel.
- **C4 analytics, D6 consent** — sequenced after this programme (D7).
- **B2 NRI content, B3 dataset, B4 articles** — content programmes, not this one.
- **E1–E7, E9–E12** — accessibility and hardening. Real, cheap, and deliberately held so
  this diff stays reviewable by a non-developer owner checking company facts.

## 4. Delivery — four commits

Each commit rebuilds `dist/` in the same commit, per the standing repo convention.

### Commit 1 — Company facts

The highest-exposure, lowest-risk change, isolated so the owner can verify it against
platizio.com without reading code around it.

1. `src/config/site.ts` — replace the `address` block with the registered office; add
   `telephone`, a second `office` entry for Noida, and `parent` (name + URL).
2. `src/data/seo.ts:72` — the `/about` meta description names "One BKC, Mumbai". Rewrite
   without a location; a meta description is not the place to assert a head office.
3. `src/pages/privacy.astro:88` — Data Protection Office address. This is the address a
   data subject is told to write to, so it must be the registered office.
4. `src/data/schema.ts` — add `telephone` to `contactPoint`; add `parentOrganization`; add
   platizio.com to `sameAs`.
5. `src/pages/partner.astro:131` and `public/site-interactive.js:69,131` — replace the
   `+91 98765 43210` placeholder. Placeholders should not look like real numbers; use
   `+91 XXXXX XXXXX`.

**Gate:** every address and phone string in `src/` matches platizio.com or is a visibly
non-real placeholder.

### Commit 2 — Contact route

6. New `src/pages/contact.astro` — both offices, phone (`tel:` link), email, WhatsApp
   (`wa.me` deep link), and the entity's LLPIN. Needs an entry in `src/data/seo.ts` or the
   build throws, which is the intended behaviour.
7. `src/components/Footer.astro` — add the phone and a Contact link to the Company column.
   The two icon buttons at lines 16–21 currently look like social links and point at
   `/partner` and `/media`; the mail icon becomes a real `mailto:`, the share icon becomes
   the YouTube channel.
8. `src/components/Navbar.astro` and `MobileNav.astro` — Contact in both.
9. `src/pages/about.astro:141` — "Contact Private Office" points at `/partner`, the
   distributor form. Re-point at `/contact`.

**Gate:** `/contact` builds, is in the sitemap, and every phone/email on it is a live link.

### Commit 3 — Working forms

10. `public/site-interactive.js` — `handleInvestorSubmit`, `handleConsultationSubmit` and
    the partner handler each `POST` a `FormData` to the relay endpoint. The success modal
    fires **on resolve**, not before the request. Failure shows a real error naming the
    phone number as the fallback route.
11. New `initNewsletterForm()` — `src/pages/media.astro:124` has no `action`, no `method`
    and no handler, so it currently GETs the subscriber's address into the URL. Give the
    form an id, bind a handler, `preventDefault()`, POST.
12. Endpoint lives in one place — a `FORM_ENDPOINT` constant at the top of
    `site-interactive.js`, mirroring why `site.config.mjs` exists.
13. Storage calls wrapped in `try/catch` (**E1**). Pulled forward from the hardening set
    because this commit is where the modals get touched, and an unguarded
    `localStorage.getItem` at line 350 takes the whole modal down in a
    cookies-blocked browser — including the newly-working form inside it.

**Gate:** a real submission arrives at the relay from each of the four surfaces; a forced
network failure shows the error path, not the success modal.

### Commit 4 — Deletions and parent linkage

14. Delete `src/pages/login.astro`. Remove `/login` from `NON_INDEXABLE` in
    `sitemap-exclusions.mjs` and from `robots.txt.ts` — a `Disallow` for a route that no
    longer exists is stale config that outlives the reason for it.
15. Delete `src/pages/knowledge/article.astro`. Remove from `FABRICATED` and from
    `robots.txt.ts`, per the instruction written into `sitemap-exclusions.mjs:27`:
    *"Remove this entry when the page is deleted, not before."*
16. `src/components/Footer.astro:12-14` — rewrite the circular sentence. Proposed:
    *"Platizio Alternatives is the PMS and AIF arm of Platizio Services LLP, serving family
    offices, HNIs and distributors."* The trailing "SEBI Registered RIA." is **removed, not
    rewritten** — an unnumbered registration claim is worse than none while A5 is open.
17. Footer gains a link to platizio.com.

**Gate:** grep for `PlatAlt`, `AlternaVest`, `Meridian`, `Sovereign Ledger`, `SEBI Registered RIA`
returns zero in `src/` **and** `dist/`. Deleted routes 404. No internal link points at either.

## 5. Company facts of record

Everything in commit 1 traces to one of these. Recorded here so a reviewer checks the table,
not the diff.

| Field | Value | Source |
|---|---|---|
| Legal entity | Platizio Services LLP | MCA |
| LLPIN | AAQ-9558 | MCA |
| Incorporated | 5 November 2019, RoC-Delhi I | MCA |
| Registered office | Unit DGL-229, Second Floor, DLF Galleria Mall, Mayur Vihar Phase-1, Delhi 110092 | MCA + platizio.com/contact |
| Operating office | Unit No. 415, Tower-B, KLJ Noida One, Plot B-8, Sector-62, Noida, UP 201309 | platizio.com/contact |
| Phone | +91 92055 23100 | platizio.com/contact |
| Parent site | https://www.platizio.com | owner |
| Designated Partners | Vividh Chaturvedi (DIN 08602281), Akash Chaturvedi (DIN 07250777) | MCA |

**Not used, deliberately.** The "AMFI Registered · SEBI Compliant" line on platizio.com is
*not* carried across. It is the parent's disclosure for a parent that distributes mutual
funds and SIFs; this site distributes neither. Reproducing it here would add a fourth
incompatible registration statement to the three A1 already records.

## 6. Blocked, and on whom

| Item | Blocked on | Effect while open |
|---|---|---|
| A3 founder biography | Owner | Two published biographies of the same person disagree |
| A5 registration | Owner — capacity held, and the ARN/APRN number | After commit 4 the footer makes no registration claim. `regulatory-disclosure.astro:31` still says "registered Mutual Fund distributor", so the site is not claim-free — it has stopped making the unnumbered, contradictory claim on every page and kept the single considered one on the disclosure page. Three incompatible statements become two. |
| D4 grievance route | Follows A5 | No published route for a complaint against Platizio itself |
| D1 "Sophisticated Investors" | Counsel | Access restricted on a definition the cited regulation lacks |
| D3 security claims | Counsel + infrastructure truth | Six auditable claims about a static site |
| D4 cap and dual forum | Counsel | ₹10,000 cap against ₹1 Cr tickets; two dispute forums named |
| D5 "predictable yield" | Owner sign-off | Copy change, no deadline |
| C4 analytics | Owner — platform choice | This programme's effect is unmeasurable |
| Form relay endpoint | **Owner — needed before commit 3 can ship** | Commits 1, 2 and 4 are unblocked and can land first |

The relay endpoint is the only hard dependency inside this programme. Commits 1, 2 and 4
ship without it.

## 7. Open questions

1. **Email.** Is `info.alternatives@platizio.com` a live mailbox? D4 keeps it as primary on
   that assumption. If it is not, it is currently the data-controller contact in a published
   privacy policy and needs replacing everywhere, not just on `/contact`.
2. **Relay.** Formspree, Web3Forms, or something already in use? Needs an endpoint URL or key.
3. **Parent wording.** Is "the PMS and AIF arm of Platizio Services LLP" accurate? Commit 4
   puts it on every page of the site.
4. **Sibling sites.** Should the footer link the SIF / Mutual Fund / International Investing
   sites too, or only platizio.com?
5. **WhatsApp.** Is +91 92055 23100 WhatsApp-reachable, or is there a separate number?
6. **Consultation booking.** The modal collects date, time and mode. Is a human working those,
   or should it become a plain callback request until a calendar exists?

## 8. Verification

The build is still the only automated gate, so verification stays explicit.

1. `npm run build` passes on every commit. The counter goes **77 → 76** at commit 2
   (`/contact` added) and **76 → 74** at commit 4 (two routes deleted). The count includes
   `robots.txt`, which is a `.ts` endpoint, so it runs one ahead of the `index.html` count.
2. **Facts gate:** every value changed in commit 1 checked against the §5 table.
3. **Grep gate:** zero `One BKC`, `98765 43210`, `SEBI Registered RIA`, `specialized division of
   Platizio Alternatives` in `src/` **and** `dist/`.
4. **Link check** across all built pages — commit 4 deletes two routes.
5. **Form check:** one real submission per surface lands at the relay; one forced failure per
   surface shows the error path.
6. **JSON-LD check:** the `/` and `/about` graphs validate, carry the correct `address`,
   `telephone` and `parentOrganization`, and still carry **no** registration claim.
7. **Visual pass** on `/contact`, `/about` and the home page — light and dark, mobile and
   desktop. Note `/about` loses a full-width section; check the CTA below it does not now
   collide with the founder block.
8. `dist/` rebuilt and committed with each commit; `git status` clean at the end.

## 9. What this does not fix

Recorded so the next reader does not assume a clean site. All are in the audit with
reproduction detail: no analytics; no skip link (WCAG 2.4.1 Level A); dropdowns without
`aria-expanded` or Escape; icon-only buttons without accessible names; no `noscript` on
`/compare`, which renders empty without JavaScript; no security response headers; two
render-blocking Google Fonts requests including the full Material Symbols variable axis;
dead `darkMode: 'class'` config with three orphan variants; no test, lint or typecheck; 13
duplicated knowledge templates; 14 funds behind a "thousands of strategies" claim; residual
"ledger" and "global elite" voice on `/about` and `/404`; and no deployment configuration
anywhere in the repo despite the site being live.
