/*
 * The site's only server code. Everything is static files, except:
 *   POST /api/enquire         the forms (enquire.ts)
 *   POST /api/stripe-webhook  a paid intro session starts the MailerLite emails (stripe.ts)
 *
 * Settings live in Cloudflare, never in this public repo (see Env in lib.ts):
 *   secrets  RESEND_API_KEY, ENQUIRY_TO, ENQUIRY_FROM (optional), TURNSTILE_SECRET_KEY (optional),
 *            MAILERLITE_API_KEY, STRIPE_WEBHOOK_SECRET, NOTION_TOKEN
 *   vars     MAILERLITE_GROUP_ID, NOTION_DATA_SOURCE_ID (in wrangler.jsonc; they aren't secret)
 * Anything not set yet answers 503, and the form shows its "didn't send" message.
 *
 * One address (since launch, 10 Nov 2026): https://www.chelseavaneeden.com. Pages asked for on chelseavaneeden.com or
 * the old workers.dev address are forwarded there for good (301), so old links and emails still land. /api/* answers on
 * every address, so the Stripe webhook and the forms keep working wherever they point.
 */
import { enquire } from './enquire.ts';
import type { Env } from './lib.ts';
import { stripeWebhook } from './stripe.ts';

export const MAIN_HOST = 'www.chelseavaneeden.com';
const FORWARDED_HOSTS = new Set(['chelseavaneeden.com', 'chelseavaneeden-site.chelseavaneeden-site.workers.dev']);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/enquire') return enquire(request, env);
    if (url.pathname === '/api/stripe-webhook') return stripeWebhook(request, env);
    if (FORWARDED_HOSTS.has(url.hostname)) {
      url.protocol = 'https:';
      url.hostname = MAIN_HOST;
      url.port = '';
      return Response.redirect(url.href, 301);
    }
    return env.ASSETS.fetch(request);
  },
};
