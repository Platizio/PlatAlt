/** @type {import('tailwindcss').Config} */
export default {
  // src/data holds datasets and shared facts, never markup. Scanning it made
  // Tailwind emit utilities for ordinary English words in comments and copy —
  // "inline" in a code comment produced .inline{display:inline}, which changed
  // the content-hashed CSS filename and so every page that links it.
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md}', '!./src/data/**'],

  /*
   * public/site-interactive.js builds the consultation modal out of HTML
   * strings, and three of them are <label class="sr-only"> for its name, email
   * and phone fields. public/ is copied verbatim into dist/ and is not in the
   * content globs above — Tailwind never sees a class that exists only there,
   * so .sr-only gets emitted only as a side effect of some file under src/
   * happening to use it.
   *
   * Three do today: pages/index.astro, pages/media.astro and
   * pages/knowledge/aif.astro. Delete the last of those usages and .sr-only
   * stops being emitted, at which point three labels written to be heard and
   * not seen turn into visible text stacked over the modal's inputs — with no
   * build error, no failing test, and nothing connecting the cause to the
   * effect. Safelisting is what makes that impossible rather than lucky.
   */
  safelist: ['sr-only'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /*
         * Muted text. Two tiers, both of which clear WCAG AA (4.5:1) against
         * every ground this site paints them on — surface #f9faf5, the four
         * surface-container steps, white, and slate-50 in the footer.
         *
         * They exist because `outline` and `outline-variant` were doing double
         * duty as border colours *and* text colours. As borders they are fine;
         * as text they measured 4.28:1 and 1.63:1, the latter on the visible
         * label of the AUM slider. Darkening the shared token would have
         * dragged every border with it, so text moved to its own pair and the
         * outline tokens stayed where they were.
         *
         * Measured worst case across those grounds:
         *   muted        #55575c  6.94:1
         *   muted-subtle #5f6166  4.81:1
         * Re-measure with a browser if you change them — contrast depends on
         * the ground, which a static check cannot see. See scripts/audit.
         */
        'muted': '#55575c',
        'muted-subtle': '#5f6166',

        'on-tertiary': '#ffffff',
        'primary-fixed': '#d6e4f9',
        'error-container': '#ffdad6',
        'secondary-fixed': '#d1e4ff',
        'on-primary-fixed': '#0f1c2c',
        'surface-container': '#edeeea',
        'surface-container-highest': '#e2e3df',
        'outline-variant': '#c4c6cc',
        'on-tertiary-container': '#8a6a28',
        'error': '#ba1a1a',
        'on-primary': '#ffffff',
        'on-secondary-container': '#48617e',
        'on-tertiary-fixed-variant': '#5d4201',
        'on-background': '#1a1c1a',
        'background': '#f9faf5',
        'on-surface-variant': '#44474c',
        'on-secondary-fixed': '#001d36',
        'outline': '#74777d',
        'on-error': '#ffffff',
        'on-tertiary-fixed': '#261900',
        'on-error-container': '#93000a',
        'secondary-fixed-dim': '#afc9ea',
        'surface-variant': '#e2e3df',
        'on-secondary': '#ffffff',
        'surface-dim': '#d9dad6',
        'surface-bright': '#f9faf5',
        'surface-container-lowest': '#ffffff',
        'inverse-surface': '#2f312e',
        'tertiary-container': '#261900',
        'on-secondary-fixed-variant': '#2f4865',
        'on-primary-container': '#778598',
        'primary-fixed-dim': '#bac8dc',
        'inverse-on-surface': '#f0f1ed',
        'secondary-container': '#c2dcff',
        'tertiary': '#000000',
        'surface-container-low': '#f3f4f0',
        'secondary': '#47607e',
        'surface-container-high': '#e8e8e4',
        'surface': '#f9faf5',
        'on-surface': '#1a1c1a',
        'primary-container': '#0f1c2c',
        'on-primary-fixed-variant': '#3a4859',
        'tertiary-fixed-dim': '#e9c176',
        'brand-navy': '#263040',
        'brand-navy-light': '#344050',
        'brand-orange': '#BA4C12',
        'brand-orange-dark': '#9A3D1A',
        'primary': '#000000',
        'surface-tint': '#525f71',
        'tertiary-fixed': '#ffdea5',
        'inverse-primary': '#bac8dc',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
      fontFamily: {
        headline: ['Newsreader', 'serif'],
        serif: ['Cormorant Garamond', 'serif'],
        body: ['Manrope', 'sans-serif'],
        label: ['Manrope', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
