/**
 * The production origin. One string, two consumers.
 *
 * astro.config.mjs needs it as `site:` — that is what makes `Astro.site` and
 * @astrojs/sitemap work at all. src/config/site.ts needs it for canonicals, OG
 * URLs and JSON-LD @ids. Plain .mjs because astro.config.mjs cannot import a
 * .ts module during config load.
 *
 * No trailing slash. Moving hosts is a one-line edit here plus a rebuild.
 */
export const SITE_URL = 'https://alternatives.platizio.com';
