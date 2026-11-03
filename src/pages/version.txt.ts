import type { APIRoute } from 'astro';

// Which saved version of the site this is, so anyone can check the website is up to date.
// .github/workflows/check-website-updated.yml compares it with the latest save. Cloudflare sets this
// variable when it builds the site; a build on a computer says "local".
export const GET: APIRoute = () =>
  new Response(`${process.env.WORKERS_CI_COMMIT_SHA ?? 'local'}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
