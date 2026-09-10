/**
 * WCAG 1.4.3 contrast, measured against rendered pixels on every built page.
 *
 * This cannot be done by parsing HTML: the ratio depends on the effective
 * background (which may be inherited through several transparent ancestors),
 * on opacity — both the alpha inside `color` and the element's own `opacity`
 * property — and on the size and weight the text actually renders at, which
 * decides whether 4.5:1 or 3:1 applies.
 *
 * The tokens most likely to regress are the muted text pair in
 * tailwind.config.mjs. They were chosen to clear 4.5:1 against every ground
 * this site paints them on; this is what proves they still do.
 */
import { createSuite } from '../lib.mjs';

/** Runs inside the page. Returns every element whose own text fails. */
const COLLECT = () => {
  const toLinear = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const luminance = ([r, g, b]) => 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  const parse = (value) => {
    const m = value.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(',').map((n) => parseFloat(n));
    return { rgb: [parts[0], parts[1], parts[2]], a: parts.length > 3 ? parts[3] : 1 };
  };
  const over = (fg, bg) => fg.rgb.map((c, i) => c * fg.a + bg[i] * (1 - fg.a));

  /* The `opacity` property is not part of `color`, so a colour read straight
     from computed style overstates the contrast of anything faded that way.
     `opacity-80` on a paragraph is a real reduction and has to be counted, or
     the check passes text that is genuinely too faint.

     The element's OWN opacity only — deliberately not accumulated up the
     tree. Two things on this site put a 0 on an ancestor without meaning the
     text is invisible: .page-transition runs a 0.3s fade from opacity 0 on
     every <main>, and [data-reveal] sits at opacity 0 until the scroll
     observer adds .is-visible, which for below-the-fold content is never.
     Multiplying those in reported every page as 1.01:1, black text on white
     included. Authored fades are on the text itself; an ancestor's zero here
     is animation state, and the `opacity < 0.1` skip below already drops
     anything genuinely hidden that way. */
  const ownFade = (el) => parseFloat(getComputedStyle(el).opacity) || 1;

  /* Walk up until something paints an opaque background; blend the
     translucent layers passed on the way. */
  const backgroundOf = (el) => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0.95) return bg.rgb;
      if (bg && bg.a > 0) return over(bg, backgroundOf(n.parentElement || document.body));
    }
    const root = parse(getComputedStyle(document.documentElement).backgroundColor);
    return root && root.a > 0.95 ? root.rgb : [255, 255, 255];
  };

  const ratio = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  /* 1.4.3 governs text. An icon-font glyph is an image drawn by a font, and
     every one on this site is aria-hidden and decorative — the control beside
     it carries the name. Judging "support_agent" as if it were a word reports
     a failure that does not exist and buries the ones that do. Anything hidden
     from assistive technology is skipped for the same reason. */
  const decorative = (el) => el.closest('[aria-hidden="true"]') !== null;

  const failures = [];
  let checked = 0;

  for (const el of document.querySelectorAll('body *')) {
    const style = getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') continue;
    if (el.offsetParent === null && style.position !== 'fixed') continue;
    if (parseFloat(style.opacity) < 0.1) continue;
    if (decorative(el)) continue;

    /* Only text this element owns — otherwise a wrapper is judged on its
       children's colour and every failure is reported N times. */
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
    if (!own) continue;

    const fg = parse(style.color);
    if (!fg) continue;
    fg.a *= ownFade(el);
    const bg = backgroundOf(el);
    const value = ratio(over(fg, bg), bg);

    const px = parseFloat(style.fontSize);
    const weight = parseInt(style.fontWeight, 10) || 400;
    const isLarge = px >= 24 || (px >= 18.66 && weight >= 700);
    const required = isLarge ? 3 : 4.5;
    checked++;

    if (value < required) {
      failures.push({
        text: own.slice(0, 44),
        selector: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).trim().split(/\s+/).slice(0, 3).join('.') : ''),
        color: style.color,
        background: `rgb(${bg.map(Math.round).join(',')})`,
        size: `${px}px/${weight}`,
        ratio: Number(value.toFixed(2)),
        required,
      });
    }
  }
  return { checked, failures };
};

/**
 * Known, pre-existing failures.
 *
 * The site had 30 distinct failing colour pairings when this check was first
 * run — most of them dark-theme utility classes rendering on light cards, which
 * no amount of HTML parsing would ever have surfaced. Fixing them is a set of
 * brand-colour decisions, not a mechanical edit, so they are recorded here
 * rather than quietly tolerated or bulk-changed.
 *
 * The file is a burn-down list, not an exemption list. Anything not in it fails
 * the run immediately, and an entry that stops occurring is reported as stale
 * so the list cannot rot in the other direction.
 *
 *   npm run audit:browser -- --update-baseline
 */
const BASELINE_PATH = new URL('../contrast-baseline.json', import.meta.url);

async function loadBaseline() {
  const { readFile } = await import('node:fs/promises');
  try {
    return new Set(JSON.parse(await readFile(BASELINE_PATH, 'utf8')).known.map((k) => k.key));
  } catch {
    return new Set();
  }
}

export async function run({ browser, baseUrl, routes }) {
  const suite = createSuite('contrast');
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  let totalChecked = 0;
  const offenders = new Map(); // dedupe by colour+background+size across pages

  for (const route of routes) {
    await page.goto(baseUrl + route, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const { checked, failures } = await page.evaluate(COLLECT);
    totalChecked += checked;
    for (const f of failures) {
      const key = `${f.color} on ${f.background} @ ${f.size}`;
      if (!offenders.has(key)) offenders.set(key, { key, ...f, routes: [] });
      offenders.get(key).routes.push(route);
    }
  }
  await page.close();

  const found = [...offenders.values()].sort((a, b) => a.ratio - b.ratio);

  if (process.argv.includes('--update-baseline')) {
    const { writeFile } = await import('node:fs/promises');
    await writeFile(BASELINE_PATH, JSON.stringify({
      note: 'Pre-existing contrast failures. A burn-down list — fix and remove, do not add to.',
      generated: new Date().toISOString().slice(0, 10),
      known: found.map((f) => ({
        key: f.key, ratio: f.ratio, required: f.required,
        sample: f.text, selector: f.selector, pages: f.routes.length,
      })),
    }, null, 2) + '\n', 'utf8');
    suite.ok(`baseline rewritten with ${found.length} known pairings`, 'contrast-baseline.json');
    return suite;
  }

  const baseline = await loadBaseline();
  const regressions = found.filter((f) => !baseline.has(f.key));
  const stillKnown = found.filter((f) => baseline.has(f.key));

  for (const o of regressions) {
    suite.fail(
      `${o.ratio}:1 (needs ${o.required}:1) — ${o.selector}`,
      `"${o.text}" · ${o.key} · ${o.routes.length} page(s), e.g. ${o.routes[0]}`,
    );
  }
  if (!regressions.length) {
    suite.ok('no new contrast failures', `${totalChecked} text nodes across ${routes.length} pages`);
  }

  /* An entry that no longer occurs has been fixed; leaving it listed would let
     the same failure reappear later without anyone noticing. */
  for (const key of baseline) {
    if (!offenders.has(key)) {
      suite.fail('stale baseline entry — fixed, so remove it', `${key}  (--update-baseline)`);
    }
  }

  if (stillKnown.length) {
    suite.ok(`${stillKnown.length} known pairings still outstanding`, 'see scripts/browser/contrast-baseline.json');
  }
  return suite;
}
