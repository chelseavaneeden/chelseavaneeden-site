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
    // Concept "Scrapbook": condensed caps serif, clean grotesk, typewriter mono.
    // Headline candidates (timeless serifs with true italics): Playfair Display is applied; see /fonts.
    { name: 'Playfair Display', cssVariable: '--font-playfair', provider: fontProviders.google(), weights: ['400 600'], styles: ['normal', 'italic'] },
    { name: 'EB Garamond', cssVariable: '--font-eb-garamond', provider: fontProviders.google(), weights: ['400 600'], styles: ['normal', 'italic'] },
    { name: 'Cormorant Garamond', cssVariable: '--font-cormorant', provider: fontProviders.google(), weights: ['400', '500', '600'], styles: ['normal', 'italic'] },
    { name: 'Host Grotesk', cssVariable: '--font-host-grotesk', provider: fontProviders.google(), weights: ['300 700'], styles: ['normal', 'italic'] },
    { name: 'Martian Mono', cssVariable: '--font-martian-mono', provider: fontProviders.google(), weights: ['400 500'], styles: ['normal'] },
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
