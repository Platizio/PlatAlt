import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  // Required for absolute canonical / og:url / og:image. Social scrapers —
  // WhatsApp in particular, which is the actual distribution channel for a
  // distributor-facing site — will not resolve a relative og:image.
  site: 'https://alternatives.platizio.com',
  integrations: [tailwind()],
  output: 'static',
});
