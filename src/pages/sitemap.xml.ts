import type { APIRoute } from 'astro';

// The pages Google should know about. Pages that stay out of search (/welcome, /monthly-plans, /styleguide, 404)
// are left out on purpose. Add a new public page here when one is made.
const PAGES = ['/', '/intro-pack/', '/retreats-events/', '/enquire/', '/privacy/', '/terms/'];

export const GET: APIRoute = ({ site }) => {
  const urls = PAGES.map((path) => `  <url><loc>${new URL(path, site).href}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
