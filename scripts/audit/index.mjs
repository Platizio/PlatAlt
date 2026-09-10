/**
 * `npm run audit` — static gate over the built site.
 *
 * The build is the only other automated gate in this repo, and it cannot see a
 * dead link, a duplicated meta description or an unlabelled input. This runs
 * over dist/ and exits non-zero on any FAIL so CI can hold the line.
 *
 *   npm run audit             full report
 *   npm run audit -- --quiet  FAIL lines only
 *
 * Colour contrast is not checked here — it needs computed style from a real
 * browser. See scripts/audit/README.md.
 */
import { statSync } from 'node:fs';
import { join } from 'node:path';
import { loadPages, walk, ROOT, FAIL, WARN, INFO, red, yellow, green, dim, bold } from './lib.mjs';
import { run as links } from './checks/links.mjs';
import { run as seo } from './checks/seo.mjs';
import { run as a11y } from './checks/a11y.mjs';

const quiet = process.argv.includes('--quiet');

/** dist/ is committed, so a source edit without a rebuild silently ships stale HTML. */
function warnIfStale() {
  const newest = (dir) => {
    try {
      return Math.max(...walk(join(ROOT, dir)).map((f) => statSync(f).mtimeMs));
    } catch {
      return 0;
    }
  };
  if (Math.max(newest('src'), newest('public')) > newest('dist')) {
    console.log(yellow('! dist/ is older than src/ or public/ — run `npm run build` first.\n'));
  }
}

const LABEL = { [FAIL]: red('FAIL'), [WARN]: yellow('WARN'), [INFO]: dim('INFO') };

const pages = loadPages();
warnIfStale();
console.log(bold(`Auditing ${pages.length} built pages in dist/`));

const reports = [links(pages), seo(pages), a11y(pages)];
const totals = { [FAIL]: 0, [WARN]: 0, [INFO]: 0 };

for (const report of reports) {
  console.log(`\n${bold(report.check.toUpperCase())}  ${dim(report.summary ?? '')}`);
  const shown = report.found.filter((f) => (quiet ? f.sev === FAIL : true));
  for (const f of report.found) totals[f.sev]++;

  if (!report.found.some((f) => f.sev === FAIL)) console.log(`  ${green('OK')} no failures`);
  const order = { [FAIL]: 0, [WARN]: 1, [INFO]: 2 };
  for (const f of shown.sort((a, b) => order[a.sev] - order[b.sev])) {
    console.log(`  ${LABEL[f.sev]} ${dim(`[${f.code}]`)} ${f.msg}${f.where ? dim(` @ ${f.where}`) : ''}`);
  }
}

const line = `${totals[FAIL]} failing · ${totals[WARN]} warnings · ${totals[INFO]} informational`;
console.log(`\n${bold('TOTAL')}  ${totals[FAIL] ? red(line) : green(line)}`);

if (totals[FAIL]) {
  console.log(red('\nAudit failed.'));
  process.exit(1);
}
console.log(green('\nAudit passed.'));
