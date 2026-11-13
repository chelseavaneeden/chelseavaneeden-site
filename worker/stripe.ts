// POST /api/stripe-webhook: Stripe tells the site a payment went through (the intro session, paid in
// Chelsea's Google booking calendar). The client is added to MailerLite with intro_paid = today, which
// starts the "Intro session: next steps" emails.
//
// Set up in Stripe → Developers → Webhooks: this address, the event checkout.session.completed, and the
// endpoint's signing secret as STRIPE_WEBHOOK_SECRET in Cloudflare. Monthly plans (subscriptions) are
// ignored. If MailerLite fails, the answer is an error, so Stripe retries for up to 3 days. A client can
// only go through the welcome emails once (the automation isn't repeatable), so a retry or a second event
// for the same payment sends nothing twice.
//
// A client who once unsubscribed from Chelsea's MailerLite emails can't be added (see mailerlite.ts), so
// MailerLite won't send them anything. Instead Chelsea gets an email with their name, address and the intake
// link to send them herself; replying to it writes to the client. Stripe sends two events for one payment
// (checkout.session.completed and charge.succeeded), so that email is sent once per payment where possible.
import { emailChelsea, json, today, type Env } from './lib.ts';
import { upsertClient } from './mailerlite.ts';

/** The page with the intake form, as linked from the MailerLite emails. */
export const INTAKE_LINK = 'https://www.chelseavaneeden.com/welcome#intake';

const encoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');

/** Compares two strings without leaking where they differ. */
function sameString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Checks Stripe's signature header (t=…,v1=…): an HMAC-SHA256 of "t.body" with the signing secret, made
 * within the last 5 minutes.
 */
export async function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  nowSeconds = Date.now() / 1000,
  toleranceSeconds = 300,
): Promise<boolean> {
  if (!header) return false;
  const parts = header.split(',').map((part) => {
    const i = part.indexOf('=');
    return [part.slice(0, i).trim(), part.slice(i + 1).trim()] as const;
  });
  const timestamp = parts.find(([k]) => k === 't')?.[1];
  const signatures = parts.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!timestamp || signatures.length === 0 || !/^\d+$/.test(timestamp)) return false;
  if (Math.abs(nowSeconds - Number(timestamp)) > toleranceSeconds) return false;
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${payload}`)));
  return signatures.some((signature) => sameString(signature, expected));
}

type StripeEvent = { type?: string; data?: { object?: Record<string, unknown> } };

/** Who paid, for a one-off payment that went through. Anything else (subscriptions, failed payments) is ignored. */
export function payerFrom(event: StripeEvent): { email: string; name?: string } | undefined {
  const o = event.data?.object ?? {};
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
  const details = (o.customer_details ?? o.billing_details ?? {}) as Record<string, unknown>;

  if (event.type === 'checkout.session.completed') {
    if (o.mode !== 'payment' || o.payment_status !== 'paid') return undefined;
    const email = str(details.email) ?? str(o.customer_email);
    return email ? { email, name: str(details.name) } : undefined;
  }
  // A fallback, in case Google's checkout turns out not to create a Checkout Session: subscribe the webhook
  // to charge.succeeded instead. Charges that belong to an invoice (monthly plans) are skipped.
  if (event.type === 'charge.succeeded') {
    if (o.invoice || o.paid !== true) return undefined;
    const email = str(details.email) ?? str(o.receipt_email);
    return email ? { email, name: str(details.name) } : undefined;
  }
  return undefined;
}

export async function stripeWebhook(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'method' }, 405);
  if (!env.STRIPE_WEBHOOK_SECRET) return json({ error: 'not-configured' }, 503);

  const raw = await request.text();
  if (!(await verifyStripeSignature(raw, request.headers.get('stripe-signature'), env.STRIPE_WEBHOOK_SECRET))) {
    return json({ error: 'signature' }, 400);
  }
  let event: StripeEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return json({ error: 'json' }, 400);
  }

  const payer = payerFrom(event);
  if (!payer) return json({ ok: true, ignored: event.type ?? 'unknown' });

  if (!env.MAILERLITE_API_KEY) return json({ error: 'not-configured' }, 503);
  const result = await upsertClient(env, { email: payer.email, name: payer.name, fields: { intro_paid: today() } });
  if (result === 'saved') return json({ ok: true });
  if (result === 'failed') return json({ error: 'mailerlite' }, 502);

  // Not subscribed in MailerLite: tell Chelsea, once per payment.
  const payment = paymentKey(event);
  if (payment && (await noticeSent(payment))) return json({ ok: true, mailerlite: 'not-subscribed', notice: 'already-sent' });
  const who = payer.name ?? payer.email;
  const sent = await emailChelsea(env, `New booking: please send ${who} the intake form`, notSubscribedNotice(payer), payer.email);
  if (!sent) return json({ error: 'notice' }, 502);
  if (payment) await rememberNotice(payment);
  return json({ ok: true, mailerlite: 'not-subscribed', notice: 'sent' });
}

/** Chelsea's email when a paying client can't get the MailerLite booking emails. Name and address only. */
export function notSubscribedNotice(payer: { email: string; name?: string }): string {
  const who = payer.name ? `${payer.name} (${payer.email})` : payer.email;
  const first = payer.name?.split(/\s+/)[0] ?? 'there';
  return [
    `${who} has booked and paid for an intro session.`,
    '',
    `They unsubscribed from your MailerLite emails at some point, so MailerLite can't send them the "You're booked in" email with the intake form, or the reminders. Please send them the form yourself:`,
    '',
    INTAKE_LINK,
    '',
    'Reply to this email to write to them straight away. For example:',
    '',
    `"Hi ${first}, thank you for booking your intro session! Before we meet, please fill in this short form (it takes about 3 minutes), so I can plan your session around you: ${INTAKE_LINK}"`,
  ].join('\n');
}

/** The payment both of Stripe's events share (its PaymentIntent), to send Chelsea's email once. */
function paymentKey(event: StripeEvent): string | undefined {
  const o = event.data?.object ?? {};
  const v = o.payment_intent ?? o.id;
  return typeof v === 'string' && v ? v : undefined;
}

// A short memory of payments Chelsea has already been emailed about, in Cloudflare's cache (best effort: both
// of Stripe's events arrive within seconds, at the same data centre). Without a cache (tests), always send.
const noticeKey = (payment: string) => new Request(`https://www.chelseavaneeden.com/__notice/${encodeURIComponent(payment)}`);
const cache = () => (globalThis as { caches?: { default?: Cache } }).caches?.default;

async function noticeSent(payment: string): Promise<boolean> {
  return Boolean(await cache()?.match(noticeKey(payment)).catch(() => undefined));
}

async function rememberNotice(payment: string): Promise<void> {
  await cache()
    ?.put(noticeKey(payment), new Response('sent', { headers: { 'cache-control': 'max-age=604800' } }))
    .catch(() => undefined);
}
