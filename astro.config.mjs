import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://zes-z.github.io',
  base: '/kimura',

  compressHTML: true,
  devToolbar: { enabled: false },

  build: {
    inlineStylesheets: 'auto',
  },
});
