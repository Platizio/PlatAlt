# Image provenance

Every file in this directory is self-hosted and licensed. Nothing here is hot-linked,
and nothing is AI Studio / Stitch scratch output.

The seven images this replaced were hot-linked `lh3.googleusercontent.com` scratch URLs left
behind by the original design export — unlicensed, third-party-hosted, and every one hard
capped at 512 × 512 at the origin.

(The literal URL token is deliberately not repeated here, so that the project's own
verification grep for it across `src/` and `dist/` keeps returning clean.)

## partner-hero.jpg — 1046 × 1308

- **Source:** Pexels photo `16585160` — <https://www.pexels.com/photo/two-women-and-man-sitting-at-a-table-in-a-lobby-16585160/>
- **Licence:** [Pexels License](https://www.pexels.com/license/) — free for commercial use,
  modification permitted, attribution not required.
- **Original:** 5068 × 3379.
- **Processing:** centre-cropped to 4:5 and exported at 1046 × 1308, i.e. 2× the 523 × 654
  CSS box, so `object-cover` discards nothing at render time. Then duotoned — greyscale
  mapped through a smoothstep curve onto `#0f1c2c` (shadows) → `#ffdea5` (highlights), the
  brand's own two inks. The image it replaced was a cool high-chroma blue that fought the
  warm amber accent; a duotone built from the palette cannot clash with it.

## faq-pen.jpg — 800 × 800

- **Source:** Pexels photo `1090680` — <https://www.pexels.com/photo/selective-focus-photography-of-fountain-pen-on-white-surface-1090680/>
- **Licence:** [Pexels License](https://www.pexels.com/license/) — as above.
- **Original:** 5184 × 3456.
- **Processing:** centre-cropped to 1:1 at 800 × 800. No duotone — black barrel, gold nib
  and paper white are already on-palette. `mix-blend-multiply` was dropped at the call site;
  multiplying a dark photograph onto the cream `#f9faf5` ground produced a muddy rectangle
  rather than a blend.

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

## Rule

Per the remediation plan: **nothing ships unless it depicts something the firm owns, or is
derived from data the firm can stand behind.** A photograph must additionally carry a
licence recorded here before it enters this directory.
