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
