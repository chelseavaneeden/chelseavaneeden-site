// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // The address used in link previews. Change to https://www.chelseavaneeden.com at launch.
  site: 'https://chelseavaneeden-site.chelseavaneeden-site.workers.dev',
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
