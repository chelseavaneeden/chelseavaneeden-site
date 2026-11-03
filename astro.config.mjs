// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.chelseavaneeden.com',
  // The old Framer address for the terms; Private sessions is now the home page.
  redirects: { '/terms-and-conditions': '/terms', '/private-sessions': '/' },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  fonts: [
    // Cormorant Garamond Italic for headings, Jost for labels and body.
    { name: 'Cormorant Garamond', cssVariable: '--font-cormorant', provider: fontProviders.google(), weights: ['400', '500', '600'], styles: ['normal', 'italic'] },
    { name: 'Jost', cssVariable: '--font-jost', provider: fontProviders.google(), weights: ['300 600'], styles: ['normal', 'italic'] },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
