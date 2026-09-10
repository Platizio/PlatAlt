/**
 * Last step of `npm run build`.
 *
 * Astro emits every imported image's untouched original into `_astro/`
 * alongside the responsive variants, and copies cached variants that the
 * current `widths`/`formats` no longer ask for. `dist/` is committed and
 * served directly here, so all of that is deployed. It was 633KB — 30% of the
 * image payload — none of it ever requested.
 *
 * This runs inside the build rather than inside the audit so that a rebuild
 * always leaves dist/ clean. The audit keeps an `assets` pass as a backstop;
 * if that ever fails, something is emitting orphans by a route this does not
 * cover, and the report will name it.
 */
import { prune, kb } from './checks/assets.mjs';
import { dim, green } from './lib.mjs';

const orphans = prune();
const total = orphans.reduce((n, o) => n + o.size, 0);

if (!orphans.length) {
  console.log(dim('prune: nothing unreferenced in dist/_astro'));
} else {
  console.log(green(`prune: removed ${orphans.length} unreferenced file(s), ${kb(total)}`));
  for (const o of orphans) console.log(dim(`  ${kb(o.size).padStart(6)}  ${o.name}`));
}
