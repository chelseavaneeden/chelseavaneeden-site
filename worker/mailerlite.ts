// Adds or updates a client in MailerLite. The two intro-session automations start from these fields:
//   intro_paid  set when a payment arrives (Stripe webhook): "You're booked in" and the reminders
//   intake_done set when the intake form arrives: "Thank you, you're all set", and the reminders stop
// Only name, email, those dates and the Private Pilates group go to MailerLite. Never health answers.
//
// Someone already in MailerLite who once unsubscribed (or whose address bounced or was marked junk) can't be
// updated unless the request re-subscribes them: MailerLite answers 422. We never re-subscribe anyone, since that
// would send them Chelsea's newsletters again against their choice (Chelsea, 13 Nov 2026). The caller is told
// 'not-subscribed' instead, so Chelsea can send that client the booking emails herself.
import type { Env } from './lib.ts';

export type UpsertResult = 'saved' | 'not-subscribed' | 'failed';

const API = 'https://connect.mailerlite.com/api/subscribers';
const NOT_SUBSCRIBED = new Set(['unsubscribed', 'bounced', 'junk']);

const headers = (env: Env) => ({
  authorization: `Bearer ${env.MAILERLITE_API_KEY}`,
  'content-type': 'application/json',
  accept: 'application/json',
});

/** The subscriber's status in MailerLite (active, unsubscribed…), or undefined if they aren't there. */
async function subscriberStatus(env: Env, email: string): Promise<string | undefined> {
  const res = await fetch(`${API}/${encodeURIComponent(email)}`, { headers: headers(env) });
  if (!res.ok) return undefined;
  const body = (await res.json().catch(() => ({}))) as { data?: { status?: unknown } };
  return typeof body.data?.status === 'string' ? body.data.status : undefined;
}

export async function upsertClient(
  env: Env,
  client: { email: string; name?: string; fields: Record<string, string> },
): Promise<UpsertResult> {
  if (!env.MAILERLITE_API_KEY) return 'failed';
  const res = await fetch(API, {
    method: 'POST',
    headers: headers(env),
    body: JSON.stringify({
      email: client.email,
      fields: { ...(client.name ? { name: client.name } : {}), ...client.fields },
      ...(env.MAILERLITE_GROUP_ID ? { groups: [env.MAILERLITE_GROUP_ID] } : {}),
    }),
  });
  if (res.ok) return 'saved';
  if (res.status === 422) {
    const status = await subscriberStatus(env, client.email);
    if (status && NOT_SUBSCRIBED.has(status)) return 'not-subscribed';
  }
  return 'failed';
}
