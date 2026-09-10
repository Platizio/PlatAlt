/**
 * Metadata, structured data and sitemap consistency.
 *
 * The expensive failure this guards against is the one the repo has already
 * had: 72 of 73 pages shipping the same meta description. BaseLayout throws on
 * an unmapped route, which catches a *missing* entry; only a cross-page pass
 * catches a *duplicated* one.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FAIL, WARN, createReporter, DIST, findAll, attr, text, metaContent, distHasFile } from '../lib.mjs';
import { EXCLUDE_FROM_SITEMAP } from '../../../src/data/sitemap-exclusions.mjs';

const ORIGIN = 'https://alternatives.platizio.com';

export function run(pages) {
  const r = createReporter('seo');
  const routes = new Set(pages.map((p) => p.route));
  const titles = new Map();
  const descriptions = new Map();
  const canonicals = new Map();

  for (const p of pages) {
    if (!attr(findAll(p.doc, 'html')[0], 'lang')) r.add(FAIL, 'lang', 'no <html lang>', p.route);

    const viewport = metaContent(p.doc, 'viewport');
    if (!viewport) r.add(FAIL, 'viewport', 'no viewport meta', p.route);
    else if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/.test(viewport))
      r.add(FAIL, 'zoom-blocked', `viewport prevents zoom: ${viewport}`, p.route);

    const titleEl = findAll(p.doc, 'title')[0];
    const title = titleEl ? text(titleEl) : '';
    if (!title) r.add(FAIL, 'title', 'missing or empty <title>', p.route);
    else {
      if (title.length > 60) r.add(WARN, 'title-length', `${title.length} chars (>60)`, p.route);
      if (!titles.has(title)) titles.set(title, []);
      titles.get(title).push(p.route);
    }

    const description = metaContent(p.doc, 'description');
    if (!description) r.add(FAIL, 'description', 'missing meta description', p.route);
    else {
      if (description.length < 140 || description.length > 160)
        r.add(WARN, 'description-length', `${description.length} chars (want 140-160)`, p.route);
      if (!descriptions.has(description)) descriptions.set(description, []);
      descriptions.get(description).push(p.route);
    }

    const canonicalTags = findAll(p.doc, 'link').filter(
      (l) => (attr(l, 'rel') || '').toLowerCase() === 'canonical',
    );
    if (canonicalTags.length !== 1) {
      r.add(FAIL, 'canonical', `${canonicalTags.length} rel=canonical tags (want 1)`, p.route);
    } else {
      const href = attr(canonicalTags[0], 'href') || '';
      canonicals.set(p.route, href);
      if (!href.startsWith('http')) {
        r.add(FAIL, 'canonical', `not absolute: ${href}`, p.route);
      } else {
        const url = new URL(href);
        if (url.origin !== ORIGIN) r.add(FAIL, 'canonical', `wrong origin: ${href}`, p.route);
        if (url.pathname !== '/' && url.pathname.endsWith('/'))
          r.add(FAIL, 'canonical', `trailing slash disagrees with trailingSlash:'never': ${href}`, p.route);
        const path = url.pathname.replace(/\/+$/, '') || '/';
        if (!routes.has(path)) r.add(FAIL, 'canonical', `points at non-existent route ${path}`, p.route);
      }
    }

    if (!metaContent(p.doc, 'robots')) r.add(WARN, 'robots-meta', 'no robots meta', p.route);

    for (const key of ['og:type', 'og:title', 'og:description', 'og:url', 'og:image', 'og:site_name']) {
      if (!metaContent(p.doc, key)) r.add(FAIL, 'open-graph', `missing ${key}`, p.route);
    }
    for (const key of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
      if (!metaContent(p.doc, key)) r.add(FAIL, 'twitter', `missing ${key}`, p.route);
    }
    const ogImage = metaContent(p.doc, 'og:image');
    if (ogImage && !ogImage.startsWith('http'))
      r.add(FAIL, 'open-graph', `og:image must be absolute: ${ogImage}`, p.route);
    const ogUrl = metaContent(p.doc, 'og:url');
    if (ogUrl && canonicals.get(p.route) && ogUrl !== canonicals.get(p.route))
      r.add(WARN, 'open-graph', 'og:url disagrees with canonical', p.route);

    const ldScripts = findAll(p.doc, 'script').filter((s) => attr(s, 'type') === 'application/ld+json');
    if (!ldScripts.length) r.add(WARN, 'json-ld', 'no JSON-LD', p.route);
    for (const script of ldScripts) {
      const raw = (script.childNodes || []).map((n) => n.value || '').join('');
      let data;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        r.add(FAIL, 'json-ld', `does not parse: ${err.message}`, p.route);
        continue;
      }
      for (const node of data['@graph'] || [data]) {
        if (!node || typeof node !== 'object') r.add(FAIL, 'json-ld', 'non-object @graph node', p.route);
        else if (!node['@type']) r.add(FAIL, 'json-ld', '@graph node without @type', p.route);
      }
      /* A url/@id on our own origin must resolve — to a route, or, on an
         ImageObject, to a file. Both are real references Google will follow. */
      (function scan(value) {
        if (!value || typeof value !== 'object') return;
        for (const [key, v] of Object.entries(value)) {
          if (['url', '@id', 'item'].includes(key) && typeof v === 'string' && v.startsWith(ORIGIN)) {
            const path = new URL(v).pathname.replace(/#.*$/, '').replace(/\/+$/, '') || '/';
            if (/\.[a-z0-9]{2,5}$/i.test(path)) {
              if (!distHasFile(path)) r.add(FAIL, 'json-ld', `${key} -> missing asset ${path}`, p.route);
            } else if (!routes.has(path)) {
              r.add(FAIL, 'json-ld', `${key} -> non-existent route ${path}`, p.route);
            }
          }
          if (typeof v === 'object') scan(v);
        }
      })(data);
    }
  }

  for (const [title, where] of titles)
    if (where.length > 1) r.add(FAIL, 'duplicate-title', `${where.length} pages share "${title}": ${where.join(', ')}`);
  for (const [, where] of descriptions)
    if (where.length > 1) r.add(FAIL, 'duplicate-description', `${where.length} pages share one description: ${where.join(', ')}`);

  /* ── sitemap ── */
  const sitemap = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const listedPaths = new Set(listed.map((u) => new URL(u).pathname.replace(/\/+$/, '') || '/'));

  for (const path of listedPaths) {
    if (!routes.has(path)) r.add(FAIL, 'sitemap', `lists non-existent route ${path}`);
    if (EXCLUDE_FROM_SITEMAP.has(path)) r.add(FAIL, 'sitemap', `lists an excluded route ${path}`);
    const canonical = canonicals.get(path);
    if (canonical) {
      const target = new URL(canonical).pathname.replace(/\/+$/, '') || '/';
      if (target !== path) r.add(FAIL, 'sitemap', `lists ${path}, which canonicalises to ${target}`);
    }
  }
  for (const route of routes) {
    if (!listedPaths.has(route) && !EXCLUDE_FROM_SITEMAP.has(route))
      r.add(FAIL, 'sitemap', `route absent from sitemap: ${route}`);
  }

  const robots = readFileSync(join(DIST, 'robots.txt'), 'utf8');
  if (!/^Sitemap:\s*https?:\/\/\S+/m.test(robots)) r.add(FAIL, 'robots', 'robots.txt has no Sitemap: line');
  for (const [, path] of robots.matchAll(/^Disallow:\s*(\S+)/gm)) {
    if (path === '/_astro/') continue;
    if (!routes.has(path.replace(/\/+$/, '') || '/'))
      r.add(WARN, 'robots', `Disallow for a route that does not exist: ${path}`);
  }

  r.summary = `${titles.size} unique titles, ${descriptions.size} unique descriptions, ${listedPaths.size} sitemap URLs`;
  return r;
}
