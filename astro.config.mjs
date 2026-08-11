import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { SITE_URL } from './site.config.mjs';
import { EXCLUDE_FROM_SITEMAP } from './src/data/sitemap-exclusions.mjs';

export default defineConfig({
  site: SITE_URL,
  // Without this, Astro's directory build format hands BaseLayout a pathname
  // with a trailing slash, and canonicals end up disagreeing with the internal
  // links that point at them.
  trailingSlash: 'never',
  integrations: [
    tailwind(),
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\/+$/, '') || '/';
        return !EXCLUDE_FROM_SITEMAP.has(path);
      },
      serialize: (item) => {
        const path = new URL(item.url).pathname.replace(/\/+$/, '') || '/';
        item.changefreq = 'monthly';
        if (path === '/') item.priority = 1.0;
        else if (path.startsWith('/knowledge')) item.priority = 0.9;
        else if (path === '/explore' || path === '/gift-city') item.priority = 0.9;
        else if (path.startsWith('/funds/') || path.startsWith('/amc/')) item.priority = 0.7;
        else if (['/terms', '/privacy', '/regulatory-disclosure', '/risk-disclaimer'].includes(path))
          item.priority = 0.2;
        else item.priority = 0.6;
        return item;
      },
    }),
  ],
  output: 'static',
});
