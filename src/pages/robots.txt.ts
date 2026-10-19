import type { APIRoute } from 'astro';

// Same launch switch as Base.astro: the preview blocks all crawlers until PUBLIC_INDEXABLE=true.
const indexable = import.meta.env.PUBLIC_INDEXABLE === 'true';

export const GET: APIRoute = () =>
  new Response(indexable ? 'User-agent: *\nAllow: /\n' : 'User-agent: *\nDisallow: /\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
