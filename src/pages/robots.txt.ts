import type { APIRoute } from 'astro';
import { SITE_URL } from '../../site.config.mjs';
import { NON_INDEXABLE, FABRICATED } from '../data/sitemap-exclusions.mjs';

/**
 * An endpoint rather than public/robots.txt, so the origin is written once —
 * same reasoning as src/data/aif-facts.ts. Costs one route in the build page
 * count, which is why the README gate moved from 73 to 74.
 */
const body = `# ${SITE_URL}/robots.txt
User-agent: *
Allow: /

# Error surface. No search value.
${NON_INDEXABLE.map((p) => `Disallow: ${p}`).join('\n')}

${
  /*
   * Emitted only while the group is non-empty. Both pages it covered have been
   * deleted, so the block now disappears rather than leaving a comment header
   * over nothing — and a Disallow for a route that no longer exists is stale
   * config that would outlive the reason for it.
   */
  FABRICATED.length
    ? `# Fabricated content pending deletion (docs/compliance-memo.md, Part C4).
# Remove these lines when the pages are deleted, not before.
${FABRICATED.map((p) => `Disallow: ${p}`).join('\n')}

`
    : ''
}# Build artefacts.
Disallow: /_astro/

# Large-model crawlers, allowed deliberately: this is a discovery platform
# whose upside is being cited in answers about Indian AIF and PMS rules.
# Flip to Disallow only on an explicit business decision.
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

Sitemap: ${SITE_URL}/sitemap-index.xml
`;

export const GET: APIRoute = () =>
  new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
