// Tests for the website's server code (worker/), with stand-in replies instead of Stripe, MailerLite, Notion and Resend.
// No real keys are used and nothing is sent. Run: npm run test:worker
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const root = new URL(".."+"/", import.meta.url).pathname.replace(/\/$/, "");
const worker = (await import(`${root}/worker/index.ts`)).default;
const { verifyStripeSignature, payerFrom } = await import(`${root}/worker/stripe.ts`);

const SECRET = 'whsec_test_not_real';
const sign = (body, secret = SECRET, t = Math.floor(Date.now() / 1000)) =>
  `t=${t},v1=${crypto.createHmac('sha256', secret).update(`${t}.${body}`).digest('hex')}`;

let calls = [];
let replies = {};
globalThis.fetch = async (url, init = {}) => {
  const body = init.body && typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
  calls.push({ url: String(url), headers: init.headers, body });
  const host = new URL(url).host;
  const r = replies[host] ?? { status: 200, body: {} };
  return new Response(JSON.stringify(r.body), { status: r.status });
};
const env = {
  ASSETS: { fetch: async () => new Response('asset') },
  RESEND_API_KEY: 're_test', ENQUIRY_TO: 'inbox@example.com',
  MAILERLITE_API_KEY: 'ml_test', MAILERLITE_GROUP_ID: '203474769523246451',
  STRIPE_WEBHOOK_SECRET: SECRET, NOTION_TOKEN: 'ntn_test', NOTION_DATA_SOURCE_ID: 'ds-123',
};
const site = 'https://chelseavaneeden-site.chelseavaneeden-site.workers.dev';
const hook = (event, headers) => worker.fetch(new Request(`${site}/api/stripe-webhook`, { method: 'POST', body: JSON.stringify(event), headers: headers ?? { 'stripe-signature': sign(JSON.stringify(event)) } }), env);
const reset = () => { calls = []; replies = {}; };
const ok = (name) => console.log('✓', name);

// 1. Signature check
{
  const body = '{"a":1}';
  assert.equal(await verifyStripeSignature(body, sign(body), SECRET), true); ok('valid signature accepted');
  assert.equal(await verifyStripeSignature(body, sign(body, 'whsec_wrong'), SECRET), false); ok('wrong secret rejected');
  assert.equal(await verifyStripeSignature(body, sign(body, SECRET, Math.floor(Date.now() / 1000) - 600), SECRET), false); ok('old timestamp rejected');
  assert.equal(await verifyStripeSignature(body, null, SECRET), false); ok('missing header rejected');
  assert.equal(await verifyStripeSignature(body + ' ', sign(body), SECRET), false); ok('changed body rejected');
}
// 2. Paid intro (Checkout Session) → MailerLite
const paid = { type: 'checkout.session.completed', data: { object: { mode: 'payment', payment_status: 'paid', customer_details: { email: 'client@example.com', name: 'Ana Silva' } } } };
{
  reset();
  const res = await hook(paid);
  assert.equal(res.status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://connect.mailerlite.com/api/subscribers');
  assert.equal(calls[0].body.email, 'client@example.com');
  assert.equal(calls[0].body.fields.name, 'Ana Silva');
  assert.match(calls[0].body.fields.intro_paid, /^\d{4}-\d{2}-\d{2}$/);
  assert.deepEqual(calls[0].body.groups, ['203474769523246451']);
  ok('paid intro → MailerLite with intro_paid and Private Pilates group');
}
// 3. Unsigned / wrongly signed → 400, nothing sent
{
  reset();
  assert.equal((await hook(paid, { 'stripe-signature': sign(JSON.stringify(paid), 'whsec_wrong') })).status, 400);
  assert.equal((await hook(paid, {})).status, 400);
  assert.equal(calls.length, 0); ok('unsigned or wrongly signed events rejected, nothing sent');
}
// 4. Subscriptions and unpaid sessions ignored
{
  reset();
  const sub = structuredClone(paid); sub.data.object.mode = 'subscription';
  const unpaid = structuredClone(paid); unpaid.data.object.payment_status = 'unpaid';
  assert.equal((await hook(sub)).status, 200);
  assert.equal((await hook(unpaid)).status, 200);
  assert.equal(calls.length, 0); ok('monthly subscriptions and unpaid sessions ignored');
}
// 5. charge.succeeded fallback shape
{
  assert.deepEqual(payerFrom({ type: 'charge.succeeded', data: { object: { paid: true, billing_details: { email: 'c@example.com', name: 'C' } } } }), { email: 'c@example.com', name: 'C' });
  assert.equal(payerFrom({ type: 'charge.succeeded', data: { object: { paid: true, invoice: 'in_1', billing_details: { email: 'c@example.com' } } } }), undefined);
  assert.equal(payerFrom({ type: 'payment_intent.created', data: { object: {} } }), undefined);
  ok('charge.succeeded handled; invoice (monthly) charges skipped; other events ignored');
}
// 6. Same payment twice → both succeed (MailerLite's automation only runs once per person)
{
  reset();
  assert.equal((await hook(paid)).status, 200); assert.equal((await hook(paid)).status, 200);
  assert.equal(calls.length, 2); ok('repeat delivery is harmless (same values written again)');
}
// 7. MailerLite down → 502 so Stripe retries
{
  reset(); replies['connect.mailerlite.com'] = { status: 500, body: {} };
  assert.equal((await hook(paid)).status, 502); ok('MailerLite failure returns an error so Stripe retries');
}
// 8. Not configured → 503
{
  reset();
  const res = await worker.fetch(new Request(`${site}/api/stripe-webhook`, { method: 'POST', body: '{}' }), { ...env, STRIPE_WEBHOOK_SECRET: undefined });
  assert.equal(res.status, 503); ok('no webhook secret yet → 503');
}

// Intake form
const intake = {
  type: 'intake', name: 'Ana Silva', email: 'client@example.com', consent: true, agreed: ['Terms', 'Health consent'], page: '/welcome/', website: '', token: '',
  answers: [
    { key: 'birthday', label: 'Date of birth', value: '1990-04-12' },
    { key: 'phone', label: 'Phone', value: '+351 912 345 678' },
    { key: 'location', label: 'Where are you?', value: 'Lisbon, Portugal time' },
    { key: 'emergency', label: 'Emergency contact', value: 'Rui, +351 900 000 000' },
    { key: 'pain', label: 'Any pain?', value: 'Lower back, Hips' },
    { key: 'health', label: 'Injuries, surgeries…', value: 'Herniated disc 2019' },
    { key: 'goals', label: 'Your goals', value: 'Strength, Rehabilitation' },
    { key: 'equipment', label: 'Equipment, tap all that apply', value: 'Mat, Other' },
    { key: 'equipment-other', label: 'Equipment (other)', value: 'Pilates chair' },
  ],
};
const form = (body, e = env) => worker.fetch(new Request(`${site}/api/enquire`, { method: 'POST', body: JSON.stringify(body), headers: { origin: site } }), e);
{
  reset(); replies['api.notion.com'] = { status: 200, body: { url: 'https://www.notion.so/page-1' } };
  const res = await form(intake);
  assert.equal(res.status, 200);
  const [notion, ml, resend] = calls;
  assert.equal(notion.url, 'https://api.notion.com/v1/pages');
  assert.equal(notion.headers['notion-version'], '2025-09-03');
  assert.deepEqual(notion.body.parent, { type: 'data_source_id', data_source_id: 'ds-123' });
  const p = notion.body.properties;
  assert.equal(p.Name.title[0].text.content, 'Ana Silva');
  assert.equal(p['Date of birth'].date.start, '1990-04-12');
  assert.deepEqual(p['Pain areas'].multi_select, [{ name: 'Lower back' }, { name: 'Hips' }]);
  assert.deepEqual(p.Goals.multi_select, [{ name: 'Strength' }, { name: 'Rehabilitation' }]);
  assert.deepEqual(p.Equipment.multi_select, [{ name: 'Mat' }, { name: 'Other' }]);
  assert.equal(p['Health consent'].checkbox, true);
  assert.ok(JSON.stringify(notion.body.children).includes('Herniated disc 2019'));
  ok('intake → Notion page with columns and every answer in the page');
  assert.equal(ml.url, 'https://connect.mailerlite.com/api/subscribers');
  assert.match(ml.body.fields.intake_done, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(!JSON.stringify(ml.body).includes('Herniated'));
  ok('intake → MailerLite intake_done, no health answers sent to MailerLite');
  assert.equal(resend.url, 'https://api.resend.com/emails');
  assert.ok(resend.body.text.includes('https://www.notion.so/page-1'));
  assert.ok(!resend.body.text.includes('Herniated'));
  assert.equal(resend.body.reply_to, 'client@example.com');
  ok("intake → Chelsea's notice links Notion, no health answers in the email");
}
{
  reset(); replies['api.notion.com'] = { status: 500, body: {} };
  const res = await form(intake);
  assert.equal(res.status, 200);
  const resend = calls.find((c) => c.url.includes('resend'));
  assert.ok(resend.body.text.includes('Herniated disc 2019'));
  ok('Notion down → full answers emailed instead, nothing lost');
}
{
  reset(); replies['api.notion.com'] = { status: 500, body: {} }; replies['api.resend.com'] = { status: 500, body: {} };
  assert.equal((await form(intake)).status, 502); ok('Notion and email both down → the client sees the error');
}
{
  reset(); assert.equal((await form({ ...intake, consent: false })).status, 400); assert.equal(calls.length, 0); ok('intake without the ticks rejected');
}
{
  reset(); replies['api.notion.com'] = { status: 200, body: { url: 'https://www.notion.so/p' } }; replies['connect.mailerlite.com'] = { status: 500, body: {} };
  assert.equal((await form(intake)).status, 200); ok('MailerLite down does not fail the intake form');
}
{
  reset();
  const res = await form({ type: 'question', name: 'Sam', email: 'sam@example.com', answers: [{ key: 'message', label: 'Your question', value: 'Is it right for me?' }], consent: false, page: '/' });
  assert.equal(res.status, 200); assert.equal(calls.length, 1);
  assert.ok(calls[0].body.text.includes('Your question: Is it right for me?')); assert.equal(calls[0].body.subject, 'Question: Sam');
  ok('question form still emails Chelsea as before');
}
{
  reset(); assert.equal((await form({ ...intake, website: 'spam' })).status, 200); assert.equal(calls.length, 0); ok('spam trap still works');
}
{
  reset(); const res = await worker.fetch(new Request(`${site}/api/enquire`, { method: 'POST', body: JSON.stringify(intake), headers: { origin: 'https://evil.example' } }), env);
  assert.equal(res.status, 403); ok('posts from other sites rejected');
}
{
  reset(); const res = await form(intake, { ASSETS: env.ASSETS }); assert.equal(res.status, 503); ok('nothing configured yet → 503 (form shows "didn\'t send")');
}
console.log('\nAll worker tests passed.');
