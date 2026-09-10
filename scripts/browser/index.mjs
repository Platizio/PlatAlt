/**
 * `npm run audit:browser` — the checks that need a rendered page.
 *
 * `npm run audit` parses dist/ and catches everything a parser can see. These
 * four cannot be seen that way: contrast depends on computed style, horizontal
 * overflow depends on rendered text metrics and on which responsive variant
 * won, and the form state machine and the dialog focus trap are runtime
 * behaviour. Each was verified by hand during the site audit, which is exactly
 * the kind of verification that does not survive the next refactor.
 *
 *   npm run audit:browser
 *   npm run audit:browser -- --only=forms,modal-focus
 *   npm run audit:browser -- --pages=8        sample N routes for contrast
 *
 * Serves dist/, so run `npm run build` first. Nothing reaches the network:
 * the Web3Forms relay is intercepted in-browser.
 */
import { serveDist, launchBrowser, routes, red, green, dim, bold } from './lib.mjs';
import { run as contrast } from './suites/contrast.mjs';
import { run as forms } from './suites/forms.mjs';
import { run as modal } from './suites/modal.mjs';
import { run as viewport } from './suites/viewport.mjs';

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const only = arg('only')?.split(',').map((s) => s.trim());
const sample = Number(arg('pages')) || 0;

const SUITES = [
  { name: 'contrast', run: contrast },
  { name: 'forms', run: forms },
  { name: 'modal-focus', run: modal },
  { name: 'viewport', run: viewport },
];

const server = await serveDist();
const browser = await launchBrowser();
let allRoutes = await routes();
if (sample > 0) {
  const step = Math.max(1, Math.floor(allRoutes.length / sample));
  allRoutes = allRoutes.filter((_, i) => i % step === 0).slice(0, sample);
}

console.log(bold(`Browser checks against ${server.baseUrl} (dist/, ${allRoutes.length} routes)\n`));

let failed = 0;
let passed = 0;

try {
  for (const s of SUITES) {
    if (only && !only.includes(s.name)) continue;
    const started = Date.now();
    let suite;
    try {
      suite = await s.run({ browser, baseUrl: server.baseUrl, routes: allRoutes });
    } catch (err) {
      console.log(`${bold(s.name.toUpperCase())}\n  ${red('ERROR')} ${err.message.split('\n')[0]}\n`);
      failed++;
      continue;
    }
    const bad = suite.results.filter((r) => !r.pass);
    passed += suite.results.length - bad.length;
    failed += bad.length;
    console.log(`${bold(suite.name.toUpperCase())}  ${dim(`${suite.results.length} checks, ${Date.now() - started}ms`)}`);
    for (const r of suite.results) {
      const mark = r.pass ? green('pass') : red('FAIL');
      console.log(`  ${mark} ${r.label}${r.detail ? dim(`  — ${r.detail}`) : ''}`);
    }
    console.log();
  }
} finally {
  await browser.close();
  await server.close();
}

const line = `${passed} passed · ${failed} failed`;
console.log(`${bold('TOTAL')}  ${failed ? red(line) : green(line)}`);
if (failed) {
  console.log(red('\nBrowser checks failed.'));
  process.exit(1);
}
console.log(green('\nBrowser checks passed.'));
