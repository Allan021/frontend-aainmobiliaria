// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.aabienes.com',
  integrations: [
    react(),
    sitemap({
      // Páginas privadas o sin valor SEO fuera del sitemap
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/login') &&
        !page.includes('/acceder') &&
        !page.includes('/favoritos') &&
        !page.includes('/mis-propiedades'),
    }),
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});
