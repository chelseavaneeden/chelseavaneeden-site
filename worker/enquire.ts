// POST /api/enquire: the site's forms.
//   question and proposal: an email to Chelsea (Resend), reply-to the sender.
//   intake: saved in Notion, the client's MailerLite record gets intake_done = today (which sends "you're all
//   set" and stops the reminders), and Chelsea gets a short notice with the Notion link, no health details.
//   If Notion fails, her email carries the full answers instead, so nothing is lost.
import { EMAIL, emailChelsea, json, oneLine, text, today, type Answer, type Env } from './lib.ts';
import { upsertClient } from './mailerlite.ts';
import { saveIntake } from './notion.ts';

const TYPES = { question: 'Question', proposal: 'Proposal request', intake: 'Intro session intake' } as const;
type EnquiryType = keyof typeof TYPES;

async function turnstileOk(token: string, secret: string, ip: string | null): Promise<boolean> {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const result = (await res.json()) as { success?: boolean };
  return result.success === true;
}

export async function enquire(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'method' }, 405);

  // Only accept posts from the site itself.
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ error: 'origin' }, 403);

  const raw = await request.text();
  if (raw.length > 30_000) return json({ error: 'size' }, 413);
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
  const consent = data.consent === true;
  if (type === 'intake' && !consent) return json({ error: 'consent' }, 400);

  const answers: Answer[] = (Array.isArray(data.answers) ? data.answers : [])
    .slice(0, 30)
    .map((a: { key?: unknown; label?: unknown; value?: unknown }) => ({
      key: text(a?.key, 60),
      label: oneLine(text(a?.label, 160)),
      value: text(a?.value, 3000),
    }))
    .filter((a) => a.label && a.value);
  const agreed = (Array.isArray(data.agreed) ? data.agreed : []).map((v) => oneLine(text(v, 200))).filter(Boolean).slice(0, 5);

  if (env.TURNSTILE_SECRET_KEY) {
    const token = text(data.token, 4000);
    if (!token || !(await turnstileOk(token, env.TURNSTILE_SECRET_KEY, request.headers.get('cf-connecting-ip')))) {
      return json({ error: 'spam-check' }, 400);
    }
  }

  const page = text(data.page, 200) || 'the website';
  const fullAnswers = [`Name: ${name}`, `Email: ${email}`, ...answers.map((a) => `${a.label}: ${a.value}`)];

  if (type === 'intake') {
    if (!env.NOTION_TOKEN && !(env.RESEND_API_KEY && env.ENQUIRY_TO)) return json({ error: 'not-configured' }, 503);
    const notionUrl = await saveIntake(env, { name, email, answers, consent, agreed });
    // Stops the reminders and sends "you're all set". A MailerLite hiccup doesn't fail the form.
    await upsertClient(env, { email, name, fields: { intake_done: today() } }).catch(() => false);
    const noticed = notionUrl
      ? await emailChelsea(env, `New intake form: ${name}`, `${name} sent their intake form.\n\nOpen it in Notion: ${notionUrl}\n\nReply to this email to answer ${name}.`, email)
      : await emailChelsea(
          env,
          `Intake form (not saved in Notion): ${name}`,
          [`${name} sent their intake form, but Notion didn't save it, so here are the answers.`, '', ...fullAnswers, `Ticked: ${agreed.join(', ') || 'all required boxes'}`].join('\n'),
          email,
        );
    return notionUrl || noticed ? json({ ok: true }) : json({ error: 'send' }, 502);
  }

  if (!env.RESEND_API_KEY || !env.ENQUIRY_TO) return json({ error: 'not-configured' }, 503);
  const sent = await emailChelsea(
    env,
    `${TYPES[type]}: ${name}`,
    [`${TYPES[type]} from the website`, '', ...fullAnswers, '', `Sent from ${page}. Reply to this email to answer ${name}.`].join('\n'),
    email,
  );
  return sent ? json({ ok: true }) : json({ error: 'send' }, 502);
}
