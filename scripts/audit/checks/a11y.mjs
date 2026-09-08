/**
 * Accessibility and HTML validity.
 *
 * Findings are aggregated by kind rather than listed per page: almost
 * everything here comes from a shared layout or component, so "76/76 pages"
 * plus a couple of examples points at the one file to edit, where 76
 * near-identical lines would not.
 *
 * Not covered here, and deliberately: colour contrast. It depends on computed
 * style, so it needs a browser. See scripts/audit/README.md.
 */
import { FAIL, WARN, INFO, createReporter, findAll, attr, hasAttr, text, iter, ancestors, hiddenFromAT } from '../lib.mjs';

const HEADINGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

/* Severity per finding kind, so the gate is declared in one readable place. */
const SEVERITY = {
  'no-main': FAIL,
  'multiple-main': FAIL,
  'no-h1': FAIL,
  'multiple-h1': FAIL,
  'empty-heading': FAIL,
  'duplicate-id': FAIL,
  'img-no-alt': FAIL,
  'control-no-label': FAIL,
  'button-no-name': FAIL,
  'icon-is-only-name': FAIL,
  'iframe-no-title': FAIL,
  'malformed-body': FAIL,
  'no-skip-link': FAIL,
  'icon-not-hidden': FAIL,

  'heading-skip': WARN,
  'img-no-dimensions': WARN,
  'button-no-type': WARN,
  'positive-tabindex': WARN,
  'autofocus': WARN,
  'table-no-th': WARN,
  'img-filename-alt': WARN,

  'table-no-caption': INFO,
};

export function run(pages) {
  const r = createReporter('a11y');
  const agg = new Map();
  const note = (code, route, detail) => {
    if (!agg.has(code)) agg.set(code, { routes: new Set(), samples: [] });
    const entry = agg.get(code);
    entry.routes.add(route);
    if (detail && entry.samples.length < 3) entry.samples.push(`${route}: ${detail}`);
  };

  let icons = 0;
  let iconsHidden = 0;

  for (const p of pages) {
    const mains = findAll(p.doc, 'main');
    if (!mains.length) note('no-main', p.route);
    if (mains.length > 1) note('multiple-main', p.route, `${mains.length} <main>`);
    if (findAll(p.doc, 'body').length !== 1) note('malformed-body', p.route);

    /* A skip link has to be among the first focusable things on the page or it
       is not a bypass mechanism. */
    const links = findAll(p.doc, 'a');
    if (!links.slice(0, 3).some((a) => (attr(a, 'href') || '').startsWith('#'))) {
      note('no-skip-link', p.route);
    }

    const headings = [...iter(p.doc)].filter((n) => HEADINGS.includes(n.tagName));
    const h1s = headings.filter((h) => h.tagName === 'h1');
    if (!h1s.length) note('no-h1', p.route);
    if (h1s.length > 1) note('multiple-h1', p.route, `${h1s.length} <h1>`);
    let previous = 0;
    for (const h of headings) {
      const level = Number(h.tagName[1]);
      if (previous && level > previous + 1)
        note('heading-skip', p.route, `h${previous} -> h${level} ("${text(h).slice(0, 32)}")`);
      if (!text(h)) note('empty-heading', p.route, `<${h.tagName}> is empty`);
      previous = level;
    }

    const idCounts = new Map();
    for (const n of iter(p.doc)) {
      const id = attr(n, 'id');
      if (id) idCounts.set(id, (idCounts.get(id) || 0) + 1);
    }
    for (const [id, count] of idCounts)
      if (count > 1) note('duplicate-id', p.route, `id="${id}" appears ${count}x`);

    for (const img of findAll(p.doc, 'img')) {
      const alt = attr(img, 'alt');
      const src = attr(img, 'src') || '';
      if (alt === undefined) note('img-no-alt', p.route, src);
      if (!hasAttr(img, 'width') || !hasAttr(img, 'height')) note('img-no-dimensions', p.route, src);
      if (alt && /\.(jpe?g|png|webp|avif|gif|svg)$/i.test(alt.trim()))
        note('img-filename-alt', p.route, alt);
    }

    /* Material Symbols render as ligature text, so an un-hidden icon is read
       aloud by its identifier: "searchFund Explorer". */
    for (const n of iter(p.doc)) {
      if (!/\bmaterial-symbols-outlined\b/.test(attr(n, 'class') || '')) continue;
      icons++;
      if (attr(n, 'aria-hidden') === 'true') {
        iconsHidden++;
        continue;
      }
      let host = n.parentNode;
      while (host && host.tagName !== 'a' && host.tagName !== 'button') host = host.parentNode;
      const ligature = text(n);
      if (host && !attr(host, 'aria-label') && !attr(host, 'title')) {
        const rest = text(host).replace(ligature, '').trim();
        note(rest ? 'icon-not-hidden' : 'icon-is-only-name', p.route, `<${host.tagName}> "${text(host).slice(0, 40)}"`);
      } else {
        note('icon-not-hidden', p.route, `"${ligature}"`);
      }
    }

    const labelledIds = new Set(findAll(p.doc, 'label').map((l) => attr(l, 'for')).filter(Boolean));
    for (const tag of ['input', 'select', 'textarea']) {
      for (const control of findAll(p.doc, tag)) {
        const type = (attr(control, 'type') || '').toLowerCase();
        if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) continue;
        if (hiddenFromAT(control)) continue; // honeypots are meant to be invisible
        const id = attr(control, 'id');
        const named =
          attr(control, 'aria-label') ||
          attr(control, 'aria-labelledby') ||
          (id && labelledIds.has(id)) ||
          ancestors(control).includes('label');
        if (!named) note('control-no-label', p.route, `<${tag}${type ? ` type=${type}` : ''}> id=${id ?? '-'}`);
      }
    }

    for (const button of findAll(p.doc, 'button')) {
      if (!(attr(button, 'aria-label') || text(button) || attr(button, 'title')))
        note('button-no-name', p.route, (attr(button, 'class') || '').slice(0, 36));
      if (!hasAttr(button, 'type')) note('button-no-type', p.route, `"${text(button).slice(0, 26)}"`);
    }

    for (const n of iter(p.doc)) {
      const tabindex = attr(n, 'tabindex');
      if (tabindex && Number(tabindex) > 0) note('positive-tabindex', p.route, `<${n.tagName} tabindex=${tabindex}>`);
      if (hasAttr(n, 'autofocus')) note('autofocus', p.route, `<${n.tagName}>`);
    }
    for (const frame of findAll(p.doc, 'iframe')) if (!attr(frame, 'title')) note('iframe-no-title', p.route);
    for (const table of findAll(p.doc, 'table')) {
      if (!findAll(table, 'th').length) note('table-no-th', p.route);
      if (!findAll(table, 'caption').length) note('table-no-caption', p.route);
    }
  }

  for (const [code, entry] of [...agg].sort((a, b) => b[1].routes.size - a[1].routes.size)) {
    r.add(
      SEVERITY[code] ?? WARN,
      code,
      `${entry.routes.size}/${pages.length} pages` +
        (entry.samples.length ? ` — e.g. ${entry.samples.join(' | ')}` : ''),
    );
  }

  const pct = icons ? ((100 * iconsHidden) / icons).toFixed(1) : '100.0';
  r.summary = `${icons} icons, ${iconsHidden} aria-hidden (${pct}%)`;
  return r;
}
