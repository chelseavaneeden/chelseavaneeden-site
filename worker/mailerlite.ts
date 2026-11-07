// Adds or updates a client in MailerLite. The two intro-session automations start from these fields:
//   intro_paid  set when a payment arrives (Stripe webhook): "You're booked in" and the reminders
//   intake_done set when the intake form arrives: "Thank you, you're all set", and the reminders stop
// Only name, email, those dates and the Private Pilates group go to MailerLite. Never health answers.
import type { Env } from './lib.ts';

export async function upsertClient(
  env: Env,
  client: { email: string; name?: string; fields: Record<string, string> },
): Promise<boolean> {
  if (!env.MAILERLITE_API_KEY) return false;
  const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.MAILERLITE_API_KEY}`,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      email: client.email,
      fields: { ...(client.name ? { name: client.name } : {}), ...client.fields },
      ...(env.MAILERLITE_GROUP_ID ? { groups: [env.MAILERLITE_GROUP_ID] } : {}),
    }),
  });
  return res.ok;
}
