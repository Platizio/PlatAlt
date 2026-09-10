/**
 * Horizontal overflow at phone and small-tablet widths.
 *
 * This is the one class of defect on this site that neither the static audit
 * nor a human sampling two pages will catch. It needs layout: whether a page
 * scrolls sideways depends on rendered text metrics, on which responsive
 * variant won, and on whether a decorative absolute element happened to land
 * inside a clipping ancestor. None of that is in the markup.
 *
 * Nine page/width combinations were overflowing when this suite was written —
 * from a 60px display word with a 48px indent on a 320px screen, to a `md:`
 * row that assumed more than 768px, to an icon-font ligature that never
 * resolved and painted its own name 216px wide. Each was invisible to
 * `npm run audit`, and each is a page a visitor can arrive on from search.
 *
 * The check is deliberately absolute: nothing may exceed the viewport, on any
 * route, at any of the widths below. There is no baseline file — unlike
 * contrast, which had 40 pre-existing pairings to burn down, this one reached
 * zero in a single pass, so a baseline would only be a place for regressions
 * to hide.
 *
 * A failure names the innermost culprit rather than the outermost symptom:
 * the element that escapes while its own parent stays inside is the one whose
 * classes need changing. Reporting the widened <body>, or the `w-full` header
 * stretched by it, sends you to the wrong file.
 */
import { createSuite } from '../lib.mjs';

/* 320 is the narrowest phone still in use; 768 is where `md:` turns on, which
   is where a two-column row first has to fit and most often does not. */
const WIDTHS = [320, 360, 375, 390, 414, 768];

/** Tolerance in CSS px. Sub-pixel rounding routinely puts a full-bleed element
    a fraction over its container, and failing on 0.4px would be noise. */
const SLACK = 1;

export async function run({ browser, baseUrl, routes }) {
  const suite = createSuite('viewport');

  for (const width of WIDTHS) {
    const ctx = await browser.newContext({
      viewport: { width, height: 800 },
      deviceScaleFactor: 2,
      isMobile: width < 768,
      hasTouch: width < 768,
    });
    const page = await ctx.newPage();
    const offenders = [];

    for (const route of routes) {
      await page.goto(baseUrl + route, { waitUntil: 'load' });
      const found = await page.evaluate(
        ({ w, slack }) => {
          const de = document.documentElement;
          const scrollW = Math.max(de.scrollWidth, document.body.scrollWidth);
          if (scrollW <= w + slack) return null;

          const describe = (el) => {
            const cls = (el.getAttribute('class') || '').trim().replace(/\s+/g, ' ');
            return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls ? '.' + cls.slice(0, 90) : ''}`;
          };

          for (const el of document.querySelectorAll('body *')) {
            const b = el.getBoundingClientRect();
            if (b.width === 0 && b.height === 0) continue;
            if (getComputedStyle(el).position === 'fixed') continue;
            const right = b.right + window.scrollX;
            if (right <= w + slack) continue;

            const parent = el.parentElement;
            if (!parent) continue;
            const pcs = getComputedStyle(parent);
            /* A parent that clips is not the culprit and neither is its child:
               the overflow is contained and never reaches the document. */
            if (['hidden', 'clip', 'auto', 'scroll'].includes(pcs.overflowX)) continue;
            const parentRight = parent.getBoundingClientRect().right + window.scrollX;
            if (parentRight > w + slack) continue; /* the parent escapes too — keep walking in */

            return {
              scrollW,
              el: describe(el),
              parent: describe(parent),
              elWidth: Math.round(b.width),
              text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 45),
            };
          }
          return { scrollW, el: null };
        },
        { w: width, slack: SLACK },
      );
      if (found) offenders.push({ route, ...found });
    }

    await ctx.close();

    if (!offenders.length) {
      suite.ok(`nothing exceeds ${width}px`, `${routes.length} routes`);
      continue;
    }
    for (const o of offenders) {
      suite.fail(
        `${o.route} scrolls sideways at ${width}px`,
        o.el
          ? `${o.scrollW}px wide — ${o.el} (${o.elWidth}px${o.text ? `, "${o.text}"` : ''}) escapes ${o.parent}`
          : `${o.scrollW}px wide — no single culprit isolated`,
      );
    }
  }

  return suite;
}
