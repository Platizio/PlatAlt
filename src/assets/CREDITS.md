# Image provenance

Every file in this directory is self-hosted. Nothing here is hot-linked, and nothing is
AI Studio / Stitch scratch output.

> ⚠️ **`hero-facade.jpg` has no licence recorded.** It is the one file in this directory
> whose rights are unverified — see its entry below. Everything else is Pexels-licensed or
> owned by the firm.

The seven images this replaced were hot-linked `lh3.googleusercontent.com` scratch URLs left
behind by the original design export — unlicensed, third-party-hosted, and every one hard
capped at 512 × 512 at the origin.

(The literal URL token is deliberately not repeated here, so that the project's own
verification grep for it across `src/` and `dist/` keeps returning clean.)

## partner-hero.jpg — 1046 × 1308

- **Source:** Pexels photo `7256463` — <https://www.pexels.com/photo/men-doing-a-handshake-7256463/>
- **Licence:** [Pexels License](https://www.pexels.com/license/) — free for commercial use,
  modification permitted, attribution not required.
- **Original:** 5687 × 3791.
- **Processing:** centre-cropped to 4:5 and exported at 1046 × 1308, i.e. 2× the 523 × 654
  CSS box, so `object-cover` discards nothing at render time. Then duotoned — greyscale
  mapped through a smoothstep curve onto `#0f1c2c` (shadows) → `#ffdea5` (highlights), the
  brand's own two inks. The image it replaced was a cool high-chroma blue that fought the
  warm amber accent; a duotone built from the palette cannot clash with it.

## faq-pen.jpg — 800 × 800

- **Source:** Pexels photo `8730987` — <https://www.pexels.com/photo/a-person-signing-a-document-in-close-up-shot-8730987/>
- **Licence:** [Pexels License](https://www.pexels.com/license/) — as above.
- **Original:** 3197 × 4789.
- **Processing:** centre-cropped to 1:1 at 800 × 800. No duotone — the gold pen, navy suit
  sleeve and paper white are already on-palette, and the navy picks up `brand-navy`.
  `mix-blend-multiply` was dropped at the call site; multiplying a dark photograph onto the
  cream `#f9faf5` ground produced a muddy rectangle rather than a blend.

## founder-portrait.jpg — 512 × 640

- **Source:** `public/sir.png`, owned by the firm. Despite the extension the file is
  actually a JPEG (640 × 640, 74 KB).
- **Processing:** cropped to 4:5 at `left=128, width=512`, **not** a centre crop. The
  remediation plan assumed the discarded side strips were both pure black; measurement
  shows that is true of the left strip (mean luminance 11.4, max 17) but false of the
  right (mean 42.9, **max 255**). The subject occupies x159–639, so a centre crop would
  have cut 64 px off the subject while keeping 95 px of empty black. Cropping from x=128
  discards only black.
- 640 px is the ceiling, so 2× sharpness in the 416 × 520 box is unreachable. Rather than
  upscale, the plate frames the black seamless as deliberate. The subject is **not** keyed
  or cut out — that would destroy hairline detail.

## hero-facade.jpg — 2880 × 1620

- **Source:** supplied by the site owner. The file arrived as
  `rijn-tower-arnhem-netherlands-gelderland-glass-building-3840x2160-2875.jpg`, which
  depicts the Rijn Tower in Arnhem, Netherlands. Original 3840 × 2160.
- **Licence: NOT VERIFIED.** No licence, photographer or source URL was supplied, and the
  filename pattern (`…-3840x2160-2875.jpg`) is characteristic of a wallpaper aggregator
  rather than a stock library with a commercial licence. **This needs confirming before
  the site is treated as cleared**, because it is the most prominent image on a commercial
  financial-services site. If it cannot be cleared, the Pexels route used for
  `partner-hero.jpg` will find an equivalent facade in minutes.
- **Processing:** resized to 2880 × 1620 — 2× the ~1440 × 819 hero box. 16:9 matches the
  source aspect exactly, so `object-cover` discards nothing at export. No duotone; see
  below.
- **On the palette.** The audit's objection to the *previous* hero photograph was twofold:
  it was a 512 px source stretched 2.81×, and its cool high-chroma blue fought the warm
  amber accent. The first objection is fully answered — this source is 3840 px and is
  sharp at 2×. The second is not, on the file itself: sampled at 80 × 45, it is 96 %
  cool-dominant and 0 % warm-dominant. It is reconciled in the composition instead, by the
  navy scrim in front of it, which is why the rendered hero reads navy rather than cyan. A
  duotone onto `#0f1c2c` / `#ffdea5` — the treatment used on `partner-hero.jpg` — remains
  available if the raw blue is ever judged too loud.

## Rule

Per the remediation plan: **nothing ships unless it depicts something the firm owns, or is
derived from data the firm can stand behind.** A photograph must additionally carry a
licence recorded here before it enters this directory.
