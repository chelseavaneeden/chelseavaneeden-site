// Small shared helpers and the settings the worker reads from Cloudflare.

export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  /** Resend → API keys (secret). Sends the question and proposal emails, and Chelsea's intake notices. */
  RESEND_API_KEY?: string;
  /** The inbox those emails go to (secret). */
  ENQUIRY_TO?: string;
  /** Optional sender, e.g. "Chelsea van Eeden <website@send.chelseavaneeden.com>" once verified in Resend. */
  ENQUIRY_FROM?: string;
  /** Cloudflare → Turnstile (secret, optional). Checked when set. */
  TURNSTILE_SECRET_KEY?: string;
  /** MailerLite → Integrations → API (secret). */
  MAILERLITE_API_KEY?: string;
  /** The Private Pilates group in MailerLite (wrangler.jsonc vars). */
  MAILERLITE_GROUP_ID?: string;
  /** Stripe → Developers → Webhooks → the endpoint's signing secret, whsec_… (secret). */
  STRIPE_WEBHOOK_SECRET?: string;
  /** Notion → an internal integration's token (secret). The Client intake database must be connected to it. */
  NOTION_TOKEN?: string;
  /** The Client intake database's data source (wrangler.jsonc vars). */
  NOTION_DATA_SOURCE_ID?: string;
}

export interface Answer {
  /** The field's id (e.g. pain), or a question's short name. */
  key: string;
  label: string;
  value: string;
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
export const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ');
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Today's date as YYYY-MM-DD (UTC), the format MailerLite date fields take. */
export const today = () => new Date().toISOString().slice(0, 10);

/** Sends a plain-text email to Chelsea through Resend. Returns whether Resend accepted it. */
export async function emailChelsea(env: Env, subject: string, body: string, replyTo?: string): Promise<boolean> {
  if (!env.RESEND_API_KEY || !env.ENQUIRY_TO) return false;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.ENQUIRY_FROM || 'Chelsea van Eeden website <onboarding@resend.dev>',
      to: [env.ENQUIRY_TO],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      text: body,
    }),
  });
  return res.ok;
}
