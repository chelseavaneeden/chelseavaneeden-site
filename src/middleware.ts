// Runs on every page as it is built (and in the dev server). It keeps at least three words together on the last
// line of every piece of text, so one word never wraps onto a line of its own. See src/lib/no-orphans.ts.
import { defineMiddleware } from 'astro:middleware';
import { noOrphans } from './lib/no-orphans';

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (!response.headers.get('content-type')?.includes('text/html')) return response;
  const html = noOrphans(await response.text());
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
});
