/**
 * Link, fragment and asset integrity.
 *
 * Every internal href must resolve to a route that exists in dist/, every
 * "#fragment" to an id that exists on the page it points at, and every
 * src/href/srcset to a file on disk. A static site can only fail these at
 * build time or never, which is exactly what makes them worth gating on.
 */
import { FAIL, WARN, createReporter, findAll, attr, text, iter, distHasFile } from '../lib.mjs';
import { EXCLUDE_FROM_SITEMAP } from '../../../src/data/sitemap-exclusions.mjs';

const ORIGIN_HOST = 'alternatives.platizio.com';

export function run(pages) {
  const r = createReporter('links');
  const routes = new Set(pages.map((p) => p.route));

  const idsByRoute = new Map(
    pages.map((p) => {
      const ids = new Set();
      for (const n of iter(p.doc)) {
        const id = attr(n, 'id');
        if (id) ids.add(id);
        if (n.tagName === 'a') {
          const name = attr(n, 'name');
          if (name) ids.add(name);
        }
      }
      return [p.route, ids];
    }),
  );

  const inbound = new Map([...routes].map((route) => [route, 0]));
  let anchors = 0;

  for (const p of pages) {
    for (const a of findAll(p.doc, 'a')) {
      anchors++;
      const raw = attr(a, 'href');
      if (raw === undefined) {
        r.add(WARN, 'no-href', '<a> without href', p.route);
        continue;
      }
      const href = raw.trim();
      if (!href) {
        r.add(FAIL, 'empty-href', '<a href=""> is a focusable dead end', p.route);
        continue;
      }

      const name =
        attr(a, 'aria-label') ||
        text(a) ||
        attr(a, 'title') ||
        findAll(a, 'img').map((i) => attr(i, 'alt')).filter(Boolean).join(' ');
      if (!name.trim()) r.add(FAIL, 'link-no-name', `link has no accessible name -> ${href}`, p.route);

      if (/^javascript:/i.test(href)) {
        r.add(WARN, 'javascript-href', 'javascript: href', p.route);
        continue;
      }
      if (/^(mailto:|tel:|data:)/i.test(href)) continue;

      if (href.startsWith('#')) {
        const frag = decodeURIComponent(href.slice(1));
        if (frag && !idsByRoute.get(p.route).has(frag)) {
          r.add(FAIL, 'dead-fragment', `#${frag} matches no id on this page`, p.route);
        }
        continue;
      }

      if (/^https?:\/\//i.test(href)) {
        const url = new URL(href);
        if (url.hostname === ORIGIN_HOST) {
          const path = url.pathname.replace(/\/+$/, '') || '/';
          if (!routes.has(path)) r.add(FAIL, 'dead-link', `absolute self-link to missing ${path}`, p.route);
          continue;
        }
        const rel = (attr(a, 'rel') || '').toLowerCase();
        if (attr(a, 'target') === '_blank' && !rel.includes('noopener')) {
          r.add(FAIL, 'tabnabbing', `target=_blank without rel=noopener -> ${href}`, p.route);
        }
        continue;
      }

      if (href.startsWith('//')) {
        r.add(WARN, 'protocol-relative', href, p.route);
        continue;
      }
      if (!href.startsWith('/')) {
        r.add(WARN, 'relative-href', `"${href}" — this site links root-relative`, p.route);
        continue;
      }

      const [pathPart, frag] = href.split('#');
      const path = (pathPart || p.route).replace(/\/+$/, '') || '/';

      if (/\.[a-z0-9]{2,5}$/i.test(path)) {
        if (!distHasFile(path)) r.add(FAIL, 'missing-asset', `link to missing file ${path}`, p.route);
        continue;
      }
      if (!routes.has(path)) {
        r.add(FAIL, 'dead-link', `internal link to non-existent route ${path}`, p.route);
        continue;
      }
      inbound.set(path, inbound.get(path) + 1);
      if (frag && !idsByRoute.get(path).has(decodeURIComponent(frag))) {
        r.add(FAIL, 'dead-fragment', `${path}#${frag} matches no id on that page`, p.route);
      }
    }

    for (const tag of ['img', 'script', 'source', 'link', 'iframe', 'video']) {
      for (const node of findAll(p.doc, tag)) {
        for (const name of ['src', 'href', 'srcset']) {
          const value = attr(node, name);
          if (!value) continue;
          const urls =
            name === 'srcset'
              ? value.split(',').map((s) => s.trim().split(/\s+/)[0]).filter(Boolean)
              : [value];
          for (const u of urls) {
            if (!u.startsWith('/') || u.startsWith('//')) continue;
            if (!distHasFile(u)) r.add(FAIL, 'missing-asset', `<${tag} ${name}> -> ${u}`, p.route);
          }
        }
      }
    }
  }

  /**
   * Orphans. The /funds/<strategy> pages that canonicalise to a /knowledge
   * sibling are deliberately unlinked, so they are read from the same list the
   * sitemap filter uses rather than duplicated here — one home for the fact.
   */
  for (const [route, count] of inbound) {
    if (count > 0 || route === '/') continue;
    if (EXCLUDE_FROM_SITEMAP.has(route)) continue;
    r.add(WARN, 'orphan', 'route has no inbound internal link', route);
  }

  r.summary = `${anchors} links across ${pages.length} pages`;
  return r;
}
