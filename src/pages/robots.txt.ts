import type { APIRoute } from 'astro';

// Same launch switch as Base.astro: the preview blocks all crawlers until PUBLIC_INDEXABLE=true.
const indexable = import.meta.env.PUBLIC_INDEXABLE === 'true';

export const GET: APIRoute = ({ site }) =>
  new Response(indexable ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n` : 'User-agent: *\nDisallow: /\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
