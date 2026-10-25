/*
 * The site's one bit of server code. Everything is static files, except POST /api/enquire,
 * which turns an enquiry form into an email to Chelsea (sent with Resend).
 *
 * Settings live in Cloudflare, never in this public repo:
 *   RESEND_API_KEY        secret: Resend → API keys
 *   ENQUIRY_TO            secret: the inbox enquiries go to
 *   TURNSTILE_SECRET_KEY  secret (optional): Cloudflare → Turnstile; checked when set
 *   ENQUIRY_FROM          optional sender, e.g. "Chelsea van Eeden <website@send.chelseavaneeden.com>"
 *                         once that domain is verified in Resend. Until then Resend's test sender is
 *                         used, which can only deliver to the Resend account's own address.
 * Without RESEND_API_KEY and ENQUIRY_TO the form answers 503 and shows its "didn't send" message.
 */

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  RESEND_API_KEY?: string;
  ENQUIRY_TO?: string;
  ENQUIRY_FROM?: string;
  TURNSTILE_SECRET_KEY?: string;
}

interface Answer {
  label: string;
  value: string;
}

const TYPES = { question: 'Question', proposal: 'Proposal request', intake: 'Intro pack intake' } as const;
type EnquiryType = keyof typeof TYPES;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ');
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function turnstileOk(token: string, secret: string, ip: string | null): Promise<boolean> {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const result = (await res.json()) as { success?: boolean };
  return result.success === true;
}

async function enquire(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'method' }, 405);

  // Only accept posts from the site itself.
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ error: 'origin' }, 403);

  const raw = await request.text();
  if (raw.length > 20_000) return json({ error: 'size' }, 413);
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw);
  } catch {
    return json({ error: 'json' }, 400);
  }

  // Bots fill in the hidden field; pretend all went well.
  if (text(data.website, 200)) return json({ ok: true });

  const type = text(data.type, 20) as EnquiryType;
  const name = oneLine(text(data.name, 100));
  const email = text(data.email, 200);
  if (!(type in TYPES) || !name || !EMAIL.test(email)) return json({ error: 'fields' }, 400);
  if (type === 'intake' && data.consent !== true) return json({ error: 'consent' }, 400);

  const answers: Answer[] = (Array.isArray(data.answers) ? data.answers : [])
    .slice(0, 20)
    .map((a: { label?: unknown; value?: unknown }) => ({ label: oneLine(text(a?.label, 120)), value: text(a?.value, 3000) }))
    .filter((a) => a.label && a.value);

  if (env.TURNSTILE_SECRET_KEY) {
    const token = text(data.token, 4000);
    if (!token || !(await turnstileOk(token, env.TURNSTILE_SECRET_KEY, request.headers.get('cf-connecting-ip')))) {
      return json({ error: 'spam-check' }, 400);
    }
  }

  if (!env.RESEND_API_KEY || !env.ENQUIRY_TO) return json({ error: 'not-configured' }, 503);

  const lines = [
    `${TYPES[type]} from the website`,
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    ...answers.map((a) => `${a.label}: ${a.value}`),
    ...(type === 'intake' ? ['Consent to use health information: yes'] : []),
    '',
    `Sent from ${text(data.page, 200) || 'the website'}. Reply to this email to answer ${name}.`,
  ];

  const sent = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.ENQUIRY_FROM || 'Chelsea van Eeden website <onboarding@resend.dev>',
      to: [env.ENQUIRY_TO],
      reply_to: email,
      subject: `${TYPES[type]}: ${name}`,
      text: lines.join('\n'),
    }),
  });
  if (!sent.ok) return json({ error: 'send' }, 502);
  return json({ ok: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/enquire') return enquire(request, env);
    return env.ASSETS.fetch(request);
  },
};
