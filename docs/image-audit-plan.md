# Image & Banner Remediation Plan — Platizio Alternatives

> **Status:** approved, not yet implemented.
> **Audit date:** 11 August 2026. All measurements below were taken directly from the repo and
> from live HTTP probes — they are measured, not estimated. Re-verify before acting if
> significant time has passed.

---

## 1. Context

The brief was: *"The images and banner in the website, some are blurry and some doesn't match
the aesthetics of the page which they are in."*

Both halves are correct, they are **two separate defects**, and the audit found the root cause
of each.

### Why they're blurry

Seven of the site's nine images are hot-linked from `lh3.googleusercontent.com/aida-public/…`
— Google AI Studio / Stitch scratch assets left behind by the original design export.

**Every one is exactly 512 × 512 pixels.**

Appending Google's own sizing parameters (`=s2048`, `=w1920`) **still returns 512 × 512** — the
origin asset is capped. There is no server-side way to get more pixels. They cannot be
sharpened, only replaced.

> **Critical:** converting these to AVIF/WebP fixes the 2.46 MB of payload. It does **not** add
> a single pixel. A 512 px upscale in AVIF is exactly as blurry as it was in PNG. Do not run a
> conversion script and expect the complaint to go away.

### Why they don't match

Only **5 of 73 pages carry a photograph at all.** The other 68 build their visual interest
entirely from navy `bg-primary-container` blocks, oversized Material Symbols, gradient washes,
rules and serif typography.

That non-photographic print register — 0.125rem corners, Newsreader/Cormorant Garamond,
letterspaced uppercase micro-caps, warm cream and navy — *is* the site. The seven stock photos
are the outlier. Several of them (a glowing hologram laptop, a top-down cartoon lounge, a
cartoon avatar on maroon) belong to an idiom the site never otherwise uses.

### The wordmark, separately

`public/logo.png` is **467 × 54** — pure vector letterforms shipped as a short raster. It
renders at `h-8` (32 px) in the navbar and `h-7` (28 px) in the footer, on all 73 pages, twice
per page. At 2× DPR it needs 64 px of source height and has 54; at 3×, it needs 96. It is soft
on every retina Mac, every phone, and every Windows machine above 100 % display scaling.

This is the most-seen image on the site and the one a viewer is most likely to register as
"blurry".

### Intended outcome

Every remaining image is sharp at 2× DPR, self-hosted, correctly sized and formatted, and
belongs to the same visual language as the 68 pages that currently use no photographs.

---

## 2. Decisions already taken

These were chosen by the site owner. Do not revisit them.

| Question | Decision | Consequence |
|---|---|---|
| Overall direction | **Hybrid** | Keep the two images that genuinely fit the brand (partner hero, fountain pen); replace the other five with visuals native to the design system. |
| Is there a vector logo? | **No — only the PNG exists** | Redraw as SVG, but gated on a measured pixel-diff. Never auto-trace. Never upscale the raster. |
| Founder photo resolution | **640 px is all there is** | 2× sharpness is unreachable. Make the softness invisible through deliberate framing instead. |
| The `/fund` page | **Delete entirely** | Removes the site's worst image and a fabricated CIO in one move. |

---

## 3. Forensic inventory

Upscale = `object-cover` scale from source pixels to the actual CSS box, derived from the
Tailwind grid arithmetic on each page.

| # | Image | File / line | Source | CSS box | @1× | @2× | Weight |
|---|-------|-------------|--------|---------|-----|-----|--------|
| 1 | Home hero banner | `src/pages/index.astro:37` | remote 512² | ~1440×819 | **2.81×** | **5.63×** | 390 KB PNG |
| 2 | Home CTA band | `src/pages/index.astro:189` | remote 512² | ~1440×590 | **2.81×** | **5.63×** | 354 KB PNG |
| 3 | About hero inset | `src/pages/about.astro:18` | remote 512² | 341×256 | 0.67× | 1.33× | 351 KB PNG |
| 4 | Partner hero | `src/pages/partner.astro:33` | remote 512² | 523×654 | 1.28× | **2.56×** | 341 KB PNG |
| 5 | AIF intro visual | `src/pages/knowledge/aif.astro:27` | remote 512² | 792×446 | 1.55× | **3.09×** | 470 KB PNG |
| 6 | AIF FAQ visual | `src/pages/knowledge/aif.astro:162` | remote 512² | 304×304 | 0.59× | 1.19× | 299 KB PNG |
| 7 | Fund-manager avatar | `src/pages/fund.astro:79` | remote 512² | **48×48** | 0.09× | 0.19× | 256 KB PNG |
| 8 | Wordmark | `src/components/Navbar.astro:16`, `src/components/Footer.astro:9` | `/logo.png` 467×54 | 277×32 / 242×28 | 1.0× | **1.19×** / **1.78× @3×** | 15 KB PNG |
| 9 | Founder portrait | `src/pages/about.astro:67` | `/sir.png` 640×640 | 416×520 | 0.81× | **1.63×** | 75 KB PNG |

Remote payload total: **~2.46 MB of PNG** for photographic content that should be ~150 KB as AVIF.

### Mapping the complaint onto the images

- **Blurry** → IMG 1 (2.81×) and IMG 8 (the wordmark, seen twice on every page). IMG 5 and IMG 9 join them on any HiDPI screen.
- **Doesn't match** → IMG 2 (broken AI perspective), IMG 3 (crypto render sitting under the words "an editorial lens"), IMG 7 (cartoon, maroon, garbled letterforms), and IMG 9's near-black slab in an airy cream page.
- **IMG 4 is both.** **IMG 6 is neither.**

### What each remote image actually depicts

1. Worm's-eye view of a blue glass curtain-wall tower against a saturated cyan sky. Generic corporate stock idiom; the cool high-chroma blue fights the warm amber/orange brand accent.
2. A **top-down/overhead** view of a lounge — brown tufted leather sofas on near-black plank flooring, a tripod lamp, and a large white canvas bearing an illegible scribble. Broken AI perspective. At `opacity-20` it is mud.
3. A glowing cyan **holographic city projecting out of an open laptop**. 2015-era fintech stock render.
4. Two men in dark suits, backs to camera, at a floor-to-ceiling window at blue hour, city below with warm amber bokeh. **Closest of the seven to the brand palette.**
5. Upward angle on a long building with metal louvre banding and a concrete pier against a flat cyan sky. Note the `alt` text says "brutalist" — it isn't; it's contemporary metal-and-glass.
6. A black lacquer fountain pen with **gold trim and nib** on a printed document, shallow depth of field. Warm gold, black, paper white — **genuinely on-brand and editorial. The best of the seven.**
7. A **flat cartoon vector** of a generic man in a navy suit behind a laptop, on a **maroon background that appears nowhere in the brand palette**, with **garbled AI-generated text baked into the pixels**.

### Cross-cutting defects

- **No `width`/`height` on any of the nine `<img>` tags** → cumulative layout shift on every page.
- **No `loading="lazy"`, no `decoding="async"`, no `fetchpriority`** anywhere on the site.
- **`astro:assets` is entirely unused** — despite Astro 4.16.19 and **`sharp` 0.33.5 already installed** in `node_modules`. The pipeline is present and switched off.
- **Third-party dependency**: `Cache-Control: public, max-age=86400, no-transform`, `ETag: "v0"`, no SLA, not owned by Platizio. If Google rotates these URLs, seven images 404 — and because `dist/` is committed, the URLs are frozen into five published HTML files, so expiry breaks the **deployed artifact** independently of source.
- **Aspect-ratio abuse**: IMG 5 discards ~44 % of its frame (1:1 forced into 16:9); IMG 4 discards ~20 % (1:1 into 4:5).
- **`mix-blend-multiply` on dark sources** (IMG 3, IMG 6): multiplying a near-black photo onto cream `#f3f4f0` produces a muddy near-black rectangle, not a blend.
- **Descriptive `alt` on purely decorative art** — a 40 %-opacity background announces "Modern architectural glass building reflecting a clear blue sky" to a screen reader. Anything kept as decoration needs `alt=""`.

### Two findings beyond the original brief

1. **IMG 7 is a credibility problem, not a design one.** It sits beside a byline for *"Julian Vane-Tempest, Chief Investment Officer"* — a fabricated person with an invented quote — alongside a fabricated NAV, "+18.4% / Top Decile" and "$2.3B AUM".
2. **That page is publicly live.** `/fund` has **no inbound links anywhere in `src/`** (the footer's links are all `/funds/*`, a different route), yet it is still built to `dist/fund/index.html`, and there is **no `robots.txt` and no sitemap**. An orphan demo page publishing a fake named CIO and fabricated returns is crawlable — on a domain whose fourteen real funds all carry `returns: null`.

> **Noted, deliberately out of scope:** `src/pages/about.astro:100-104` carries
> "$14B+ Assets Under Consultation / 12 Global Offices / 85+ Strategic Jurisdictions /
> 98% Client Retention" in the same register, and the founder bio claims tenure across
> London, Zurich and Dubai advising sovereign wealth funds. Worth a separate review; not
> part of this image work.

---

## 4. The design system already has the answer

Do not invent a replacement idiom. Two working in-house "hero visual without a photograph"
constructions already exist in the codebase:

- **`src/pages/knowledge/article.astro:47-56`** — the comment literally reads `<!-- Hero Image -->`, and then builds a gradient + oversized Material Symbol + caption instead of using a photo.
- **`src/pages/knowledge/pms.astro:38-45`** — the same construction in an `aspect-square`.

```html
<div class="aspect-[16/7] bg-surface-container relative overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-primary-container/40 to-secondary/20"></div>
  <div class="absolute inset-0 flex items-center justify-center">
    <span class="material-symbols-outlined text-8xl text-white/20">account_balance</span>
    <p class="text-white/30 text-sm uppercase tracking-widest font-bold">Macro Architecture</p>
  </div>
</div>
```

Extract this into a reusable component rather than copy-pasting it a third time.

### Real content sources — both verified to hold usable, non-fabricated data

- **`src/data/aif-facts.ts`** — exports `SECTION`, `RATE`, `LIMIT` and a `STAT` record of `{label, value, sub}` cards covering minimum corpus, investor ticket, max investors, fund structure, minimum tenure, leverage, taxation and skin-in-the-game, each with a statute citation. **Statutory structure is not performance data and cannot be faked.** This is the correct source for the IMG 5 replacement.
- **`src/pages/regulatory-disclosure.astro`** — names **Platizio Services LLP** as a registered Mutual Fund distributor.

> ⚠️ **No actual registration number (ARN / LLPIN / SEBI reg. no.) exists anywhere in the repo.**
> Any "credentials plate" must therefore either use numbers the owner supplies, or make no
> numeric claim at all. **Default to the non-claiming version.** Inventing a registration
> number is the exact failure mode that produced the `/fund` page.

> ⚠️ **Do not build data-derived charts from `funds.generated.json`.** All 14 funds have
> `manager`, `philosophy`, `strategy` and `editorial_aum` null; `aum_cr` is null for 5;
> `category` is null for 9; `benchmark` is null for 11. Any chart either renders blank or
> invites invented numbers.

### Brand tokens

From `tailwind.config.mjs`. These were confirmed to match the logo's own inks, sampled directly
from `logo.png` pixels: `#263040`, `#BA4C12`, `#9A3D1A`.

| Token | Hex | Role |
|---|---|---|
| `primary-container` | `#0f1c2c` | the dominant dark |
| `brand-navy` | `#263040` | the logo's navy |
| `brand-orange` | `#BA4C12` | the "Platizio" wordmark colour |
| `brand-orange-dark` | `#9A3D1A` | wordmark shading |
| `tertiary-fixed` | `#ffdea5` | warm cream-amber accent |
| `tertiary-fixed-dim` | `#e9c176` | gold |
| `surface` | `#f9faf5` | warm off-white page ground |
| `secondary` | `#47607e` | muted slate blue |

`borderRadius.DEFAULT` is `0.125rem` — **near-square corners everywhere.**
Fonts: `headline` Newsreader · `serif` Cormorant Garamond · `body`/`label` Manrope.

---

## 5. The plan

### Phase 0 — Reset the baseline *(do this alone, first, and commit before anything else)*

`dist/` is committed and **verifiably stale**: commit `2d74092` edited `src/pages/about.astro`
with zero `dist/` files in the diff. Until that is fixed, every subsequent image diff is
unreadable.

1. Delete `src/pages/fund.astro` and the `dist/fund/` directory.
2. Run `npm run build`. Confirm zero errors.
3. Commit the source deletion **together with the full regenerated `dist/`**.

One commit does three things: it takes down a crawlable page publishing a fabricated Chief
Investment Officer and fabricated returns; it removes the site's single worst image (IMG 7);
and the mandatory rebuild resets the baseline so every image commit after it produces a
readable diff.

**Touch nothing else until this build is clean.**

### Phase 1 — Stand up the image pipeline

Create `src/assets/` and adopt `astro:assets`. `sharp` 0.33.5 is already installed — **no new
dependencies are needed.** Importing from `src/assets/` rather than `public/` gives automatic
AVIF/WebP conversion, **inferred `width`/`height` (which eliminates the CLS by itself)**, and
content hashing.

```astro
---
import { Image } from 'astro:assets';
import partnerHero from '../assets/partner-hero.jpg';
---
<Image src={partnerHero} alt="" widths={[523, 1046]} formats={['avif', 'webp']}
       loading="lazy" decoding="async" class="w-full h-full object-cover" />
```

### Phase 2 — The four replacements

| # | Action |
|---|---|
| **1** Home hero | Delete the `<img>` **and** its `div.absolute.inset-0.opacity-40` wrapper. Then retune the navy gradient at `index.astro:39` to stand on its own — it was tuned to sit over a photograph, so removing the photo without retuning changes the hero's perceived value. Removes 390 KB, the LCP image and the CLS. |
| **2** CTA band | Delete outright, no replacement. The flat `bg-slate-950` band and the type already carry it. |
| **3** About inset | Delete the photo. Fill the orphaned `md:col-span-4` with a navy plate in the `article.astro` idiom — hairline `tertiary-fixed` rule, Manrope micro-caps, **no numeric claims**. Upgrade to a credentials plate only if the owner supplies a real ARN/LLPIN. |
| **5** AIF intro | Delete the photo. Replace the `aspect-[16/9]` slot with a Category I / II / III comparison strip composed from `STAT` in `src/data/aif-facts.ts`, with a genuine text equivalent for screen readers. The worst geometry on the site (1.55× upscale, 44 % of the frame discarded, 470 KB) becomes real content at zero image bytes. |
| **7** Avatar | Already gone with `/fund` in Phase 0. |

**Re-span the surviving grid children.** Pulling IMG 3 and IMG 5 orphans `md:col-span-4` /
`md:col-span-8` pairs inside 12-column grids. This is not a two-minute delete.

### Phase 3 — The two keepers

Both are currently Google-hosted, unlicensed AI Studio output.

**Stated assumption:** "keep the good ones" means keeping the *art direction*, not the exact
unlicensed file — so both get re-sourced from a properly-licensed origin (free Unsplash/Pexels
commercial licence, or paid stock). **Shortlist candidates and get owner approval before
committing any image.**

| # | Target spec | Art direction |
|---|---|---|
| **4** Partner hero | ≥ 1046 × 1308 (2× of 523×654), **pre-cropped to 4:5 at export** so `object-cover` stops eating 20 % of the frame | Blue-hour interior, figures at a floor-to-ceiling window, navy field with warm amber city bokeh. Duotone toward `#0f1c2c` / `#ffdea5`. Keep the existing `grayscale-[20%] hover:grayscale-0 transition-all duration-700`. |
| **6** FAQ pen | ≥ 608 × 608, deliver at 800² | Black pen with gold nib on a printed document, shallow depth of field. **Drop `mix-blend-multiply`** — it is what muddies the dark upper third against the cream surface. |

Both get `alt=""` (they are decorative), `loading="lazy"`, `decoding="async"`.

### Phase 4 — The wordmark, gated

Only the 467 × 54 PNG exists. The binding constraint: **a subtly wrong wordmark on every page
is worse than a soft one.** And a "3× re-export" is impossible from a 467 px source — that is
the same fallacy as expecting AVIF to add pixels.

**4a — Zero-risk, ship regardless.** Add explicit `width="467" height="54"` to both `<img>`
tags and `fetchpriority="high"` to the navbar one. Removes the CLS immediately without touching
a single letterform.

**4b — SVG redraw, behind a measured gate.**

1. Identify the typeface by overlaying the PNG against Cormorant Garamond and Newsreader (both already loaded by `BaseLayout.astro:33`) at high zoom.
2. Hand-build the SVG. **No auto-trace** — 54 px of serif yields lumpy béziers.
3. Render the candidate to PNG at 467 × 54 with `sharp`; compute alpha-aware per-pixel mean absolute error against `public/logo.png`.
4. **Gate:** ship only if the MAE clears an agreed threshold *and* a 4× side-by-side is indistinguishable to the owner. Present the overlay for explicit sign-off.
5. **If the gate fails: keep `logo.png` untouched** and flag "request the vector from whoever drew it" as a one-message follow-up.

Useful context: the PNG is tightly trimmed (ink bounding box fills the full 467 × 54, no wasted
padding), has real alpha, and is only **16 % ink coverage**. A passing SVG lands around 2–4 KB
and is sharp at every DPR forever.

### Phase 5 — The founder portrait

640 px is the ceiling: the box needs 832 × 1040 at 2× DPR and the source has 640. **There is no
way to make this sharp at 2×.** So make the softness invisible and stop wasting pixels.

- Convert to AVIF/WebP via `astro:assets`, **pre-cropped to 4:5 (512 × 640)**. The discarded side strips are pure black — sampled mean luminance **13.2**, RGB ~8–16 across all edges — so the crop loses no information.
- **Do not cut out or key the subject.** Knocking a person off a black seamless destroys hairline detail.
- Frame the near-black backdrop as deliberate rather than accidental: seat it on a `primary-container` plate with a hairline `tertiary-fixed` rule and a Manrope micro-caps caption, so it reads as an editorial portrait plate rather than a dark hole punched in a cream page.

*Tradeoff, stated:* padding the canvas to 640 × 800 instead of cropping would improve the 2×
ratio from 1.63× to 1.30×, but adds more black to a page whose complaint is already partly
"too much black". Cropping plus framing is the better call — but the pixels are there if the
owner prefers sharpness over composition.

### Phase 6 — Optional, and beyond the literal brief

**There is no favicon, no `og:image`, no `og:title`, no twitter card and no canonical** in
`src/layouts/BaseLayout.astro` — confirmed. The browser tab is blank on all 73 pages, and a
link pasted into WhatsApp (the actual distribution channel for a distributor-facing site)
previews as a bare card. These are images that *don't exist*, and the share card is literally a
banner — but they are an addition to the brief, not a fix to it. Both fall out of the wordmark
for free once Phase 4b passes.

**Drop this phase if scope should stay tight.**

Also noted and deliberately **not** actioned: `BaseLayout.astro:31-36` render-blocks on two
`fonts.googleapis.com` stylesheets plus Material Symbols, and `src/pages/privacy.astro`
discloses no third party while every visitor's IP reaches five Google-owned origins
(`fonts.googleapis.com`, `fonts.gstatic.com`, `lh3.googleusercontent.com`, `youtube.com`,
`youtube-nocookie.com`). Removing the images closes one of those five. Self-hosting the fonts
is a separate job — and note that deleting the hero image does **not** make LCP "instant" while
those stylesheets remain render-blocking.

---

## 6. The governing rule

Adopt this as the actual deliverable, because it resolves all nine images and prevents a tenth:

> **Nothing ships unless it depicts something the firm owns, or is derived from data the firm
> can stand behind.**

---

## 7. Verification

Run after **each** phase, not just at the end.

1. **Build gate** — `npm run build`. Must complete with zero errors and the expected page count. Per `README.md` this is the project's only automated gate; there is no test, lint or typecheck script.
2. **No Google image references remain**
   ```bash
   grep -rc "aida-public" src/ dist/ | grep -v ":0" || echo "clean"
   ```
   Must print `clean`.
3. **Every image carries dimensions**
   ```bash
   grep -rn "<img\|<Image" src/ | grep -v "width=" || echo "all sized"
   ```
4. **Visual confirmation in a browser.** Start the `alternavest-dev` config already defined in `.claude/launch.json` (`npm run dev`, port 4321). For `/`, `/about`, `/partner` and `/knowledge/aif`:
   - resize to 1440 px and to 390 px to check both breakpoints;
   - screenshot each. **IMG 1's removal is the only change that alters a page's character rather than just cleaning it — present the home hero before/after at both widths for sign-off.**
   - read console messages and network requests to confirm no 404s and no `googleusercontent.com` requests remain.
5. **`/fund` is gone** — `curl -o /dev/null -w "%{http_code}" http://localhost:4321/fund` returns 404, and `grep -rc "Vane-Tempest" src/ dist/` finds nothing.
6. **Weight check** — total image bytes across the four pages should fall from ~2.46 MB to under ~150 KB. Confirm via the network panel.
7. **Wordmark gate** — if Phase 4b ships, present the 4× overlay diff against the original PNG for explicit approval **before** committing.
8. **Commit discipline** — every commit touching `src/` or `public/` must include the regenerated `dist/` in the same commit, per `README.md`. `dist/` is tracked in git; if it drifts, the published site drifts from source.
