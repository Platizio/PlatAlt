/**
 * Shared plumbing for `npm run audit`.
 *
 * The audit reads dist/, not src/ — it checks what actually ships. Run
 * `npm run build` first; the runner refuses to score a stale or missing dist.
 *
 * parse5 is already in the tree as an Astro dependency, so this adds no
 * install step. Everything here is a real HTML parse rather than a regex,
 * because the failures worth catching (unclosed tags relocating content,
 * duplicate ids, controls with no label) are exactly the ones a regex misses.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

export const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export const DIST = join(ROOT, 'dist');

/* ── severities ───────────────────────────────────────────────────────────
   FAIL  breaks a user, a crawler or an assistive technology. Exits non-zero.
   WARN  worth knowing, does not fail the run.
   INFO  recorded so a reviewer can see it was considered.                  */
export const FAIL = 'FAIL';
export const WARN = 'WARN';
export const INFO = 'INFO';

export function createReporter(check) {
  const found = [];
  return {
    check,
    found,
    add: (sev, code, msg, where) => found.push({ sev, code, msg, where }),
  };
}

/* ── fs ── */
export function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

export const distHasFile = (rootRelative) =>
  existsSync(join(DIST, decodeURIComponent(rootRelative).replace(/^\/+/, '').split('?')[0]));

/** dist/foo/index.html -> /foo · dist/index.html -> / · dist/404.html -> /404 */
export function routeOf(file) {
  const r = relative(DIST, file)
    .split(sep)
    .join('/')
    .replace(/index\.html$/, '')
    .replace(/\.html$/, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
  return r === '' ? '/' : `/${r}`;
}

/* ── parse5 helpers ── */
export function attr(node, name) {
  return node.attrs?.find((a) => a.name === name)?.value;
}
export const hasAttr = (node, name) => !!node.attrs?.some((a) => a.name === name);

export function* iter(node) {
  yield node;
  for (const child of node.childNodes || []) yield* iter(child);
}

export function findAll(root, tagName) {
  const out = [];
  for (const n of iter(root)) if (n.tagName === tagName) out.push(n);
  return out;
}

export function text(node) {
  let s = '';
  for (const n of iter(node)) if (n.nodeName === '#text') s += n.value;
  return s.replace(/\s+/g, ' ').trim();
}

/** Tag names of every ancestor, innermost first. */
export function ancestors(node) {
  const out = [];
  for (let p = node.parentNode; p; p = p.parentNode) if (p.tagName) out.push(p.tagName);
  return out;
}

export function metaContent(doc, key) {
  for (const m of findAll(doc, 'meta')) {
    if (attr(m, 'name') === key || attr(m, 'property') === key) return attr(m, 'content');
  }
  return undefined;
}

/**
 * An element hidden from assistive technology is not a labelling failure —
 * the honeypot on every form is the case this exists for.
 */
export function hiddenFromAT(node) {
  for (let n = node; n; n = n.parentNode) {
    if (!n.attrs) continue;
    if (attr(n, 'aria-hidden') === 'true') return true;
    if (hasAttr(n, 'hidden')) return true;
    if (/display:\s*none/i.test(attr(n, 'style') || '')) return true;
  }
  return false;
}

export function loadPages() {
  if (!existsSync(DIST)) {
    console.error('dist/ not found — run `npm run build` first.');
    process.exit(2);
  }
  return walk(DIST)
    .filter((f) => f.endsWith('.html'))
    .map((file) => ({ file, route: routeOf(file), html: readFileSync(file, 'utf8') }))
    .map((p) => ({ ...p, doc: parse(p.html) }))
    .sort((a, b) => a.route.localeCompare(b.route));
}

/* ── output ── */
const paint = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (paint ? `\x1b[${code}m${s}\x1b[0m` : s);
export const red = (s) => c(31, s);
export const yellow = (s) => c(33, s);
export const green = (s) => c(32, s);
export const dim = (s) => c(2, s);
export const bold = (s) => c(1, s);
