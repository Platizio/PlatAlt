/**
 * Shared plumbing for `npm run audit:browser`.
 *
 * These checks exist because three things the audit cares about cannot be seen
 * by parsing HTML:
 *
 *   contrast  depends on computed style — inherited backgrounds, opacity, and
 *             what the font actually renders at
 *   forms     is a state machine over fetch, not markup
 *   modals    focus order and `inert` are runtime behaviour
 *
 * All three were verified by hand once. Hand-verification does not survive the
 * next refactor, which is the whole reason this file exists.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

export const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export const DIST = join(ROOT, 'dist');

/* ── static server ────────────────────────────────────────────────────────
   Serving dist/ in-process rather than spawning `astro preview`: no child
   process to orphan on Windows, no port race with a dev server someone left
   running, and the route mapping is explicit rather than inherited.        */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

async function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '');
  const direct = join(DIST, clean);
  for (const candidate of [direct, join(direct, 'index.html'), `${direct}.html`]) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch { /* try the next shape */ }
  }
  return null;
}

export async function serveDist() {
  const server = createServer(async (req, res) => {
    const file = await resolveFile(req.url === '/' ? '/index.html' : req.url);
    if (!file) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(await readFile(join(DIST, '404.html')).catch(() => 'Not found'));
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return { baseUrl: `http://127.0.0.1:${port}`, close: () => new Promise((r) => server.close(r)) };
}

/* ── browser ──────────────────────────────────────────────────────────────
   playwright-core drives a browser already on the machine, so the repo does
   not carry a ~150 MB download for a site this size. Any Chromium build will
   do; the checks read computed style and dispatch real input, neither of
   which is engine-specific.                                                */
export async function launchBrowser() {
  const attempts = [{ channel: 'chrome' }, { channel: 'msedge' }, {}];
  const failures = [];
  for (const opts of attempts) {
    try {
      return await chromium.launch({ headless: true, ...opts });
    } catch (err) {
      failures.push(`${opts.channel ?? 'bundled chromium'}: ${err.message.split('\n')[0]}`);
    }
  }
  console.error(
    'Could not start a browser. Tried:\n  ' + failures.join('\n  ') +
    '\n\nInstall Chrome or Edge, or run `npx playwright install chromium`.',
  );
  process.exit(2);
}

/** Routes to exercise, read from the built output so it cannot drift. */
export async function routes() {
  const { readdirSync, statSync } = await import('node:fs');
  const out = [];
  (function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      if (statSync(p).isDirectory()) walk(p);
      else if (entry === 'index.html') {
        const r = '/' + p.slice(DIST.length + 1).replace(/index\.html$/, '').replace(/\\/g, '/').replace(/\/$/, '');
        out.push(r || '/');
      }
    }
  })(DIST);
  return out.sort();
}

/* ── assertions ── */
export function createSuite(name) {
  const results = [];
  return {
    name,
    results,
    ok: (label, detail) => results.push({ label, pass: true, detail }),
    fail: (label, detail) => results.push({ label, pass: false, detail }),
    check(label, condition, detail) {
      results.push({ label, pass: !!condition, detail });
      return !!condition;
    },
  };
}

const paint = process.stdout.isTTY && !process.env.NO_COLOR;
export const red = (s) => (paint ? `\x1b[31m${s}\x1b[0m` : s);
export const green = (s) => (paint ? `\x1b[32m${s}\x1b[0m` : s);
export const dim = (s) => (paint ? `\x1b[2m${s}\x1b[0m` : s);
export const bold = (s) => (paint ? `\x1b[1m${s}\x1b[0m` : s);
