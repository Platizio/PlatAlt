/**
 * Build output that ships but is never requested.
 *
 * `dist/` is committed and served directly, so everything Astro emits into
 * `_astro/` is deployed whether or not a page asks for it. Two things put
 * files there that nothing references:
 *
 *   - importing an image through `astro:assets` emits the untouched original
 *     alongside the responsive variants, even when every `src` and `srcset`
 *     on the site points at a variant. hero-facade's original is 298KB and
 *     no page has ever loaded it.
 *   - the image cache under `.astro/` is reused between builds, so a variant
 *     that a since-edited `widths`/`formats` list no longer asks for is still
 *     copied into the output.
 *
 * 633KB — 30% of the image payload — was in that state when this was written.
 * It is invisible in a browser, invisible in the build log, and invisible to
 * every other pass here, because the defect is precisely that nothing points
 * at it. The `links` pass asks "does this reference resolve?"; this asks the
 * mirror-image question, which is the one no one thinks to ask.
 *
 * `npm run build` prunes as its last step (see scripts/audit/prune.mjs), so
 * this pass is a backstop: if it ever fails, something is emitting orphans by
 * a route the prune step does not cover.
 */
import { readFileSync, statSync, unlinkSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { createReporter, walk, DIST, FAIL } from '../lib.mjs';

const IMAGE = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg']);
/** Every format a reference could be written in. */
const TEXT = new Set(['.html', '.css', '.js', '.mjs', '.xml', '.txt', '.json']);

/** Below this an orphan is not worth acting on. */
const FLOOR = 2048;

export const kb = (n) => `${(n / 1024).toFixed(0)}KB`;

/**
 * Hashed images under _astro/ that no text file in dist/ mentions.
 *
 * public/ assets (favicons, logo, og-image) are referenced by absolute path
 * and are the links pass's business; only hashed build output is in scope.
 */
export function findOrphans() {
  const files = walk(DIST);

  /* One concatenated haystack. Every name in _astro/ carries a content hash,
     so a substring match is exact — no hashed name collides by accident. */
  const haystack = files
    .filter((f) => TEXT.has(extname(f).toLowerCase()))
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');

  return files
    .filter((f) => f.includes('_astro') && IMAGE.has(extname(f).toLowerCase()))
    .map((f) => ({ file: f, name: basename(f), size: statSync(f).size }))
    .filter((o) => o.size >= FLOOR && !haystack.includes(o.name))
    .sort((a, b) => b.size - a.size);
}

export function prune() {
  const orphans = findOrphans();
  for (const o of orphans) unlinkSync(o.file);
  return orphans;
}

export function run() {
  const report = createReporter('assets');
  const orphans = findOrphans();
  const total = orphans.reduce((n, o) => n + o.size, 0);

  report.summary = orphans.length
    ? `${kb(total)} shipped but never requested`
    : 'no unreferenced images in _astro/';
  for (const o of orphans) report.add(FAIL, 'unreferenced-asset', `${kb(o.size)}  ${o.name}`);

  return report;
}
