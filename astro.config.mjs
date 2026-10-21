// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.chelseavaneeden.com',
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  fonts: [
    // Concept "Studio": Helvetica Neue (system) with Inter Tight as the web fallback.
    { name: 'Inter Tight', cssVariable: '--font-inter-tight', provider: fontProviders.google(), weights: ['300 600'], styles: ['normal', 'italic'] },
    {
      name: 'Satoshi',
      cssVariable: '--font-satoshi',
      provider: fontProviders.fontshare(),
      weights: ['300', '400', '500', '700'],
      styles: ['normal', 'italic'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
