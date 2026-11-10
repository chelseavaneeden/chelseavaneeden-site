// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // The site's address: link previews, canonical tags and the sitemap use it (live since launch, 10 Nov 2026).
  site: 'https://www.chelseavaneeden.com',
  // The old Framer address for the terms; Private sessions is now the home page.
  redirects: { '/terms-and-conditions': '/terms', '/private-sessions': '/' },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  fonts: [
    // Libre Baskerville for headings, Jost for labels and body.
    { name: 'Libre Baskerville', cssVariable: '--font-libre-baskerville', provider: fontProviders.google(), weights: ['400 700'], styles: ['normal', 'italic'] },
    { name: 'Jost', cssVariable: '--font-jost', provider: fontProviders.google(), weights: ['300 600'], styles: ['normal', 'italic'] },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
