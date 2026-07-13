// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.aabienes.com',
  // Listados unificados en /buscar — las URLs viejas siguen vivas como redirect
  redirects: {
    '/propiedades': '/buscar',
    '/lotificaciones': '/buscar?type=lotificadora',
  },
  integrations: [
    react(),
    sitemap({
      // Páginas privadas, redirects o sin valor SEO fuera del sitemap
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/login') &&
        !page.includes('/acceder') &&
        !page.includes('/favoritos') &&
        !page.includes('/mis-propiedades') &&
        !page.includes('/propiedades') &&
        !page.includes('/lotificaciones'),
    }),
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});
