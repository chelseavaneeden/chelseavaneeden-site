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
    // Concept "Scrapbook": condensed caps serif, clean grotesk, typewriter mono.
    { name: 'Oranienbaum', cssVariable: '--font-oranienbaum', provider: fontProviders.google(), weights: ['400'], styles: ['normal'] },
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
