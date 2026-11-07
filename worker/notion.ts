// Saves an intake form as a page in Chelsea's Notion database "Client intake" (Private clients page).
// Key answers fill the columns; every answer is also written in the page itself, so a question added
// later in the CMS still arrives without any change here. The columns are matched by the field ids set
// in Site settings → Enquiry forms → intake (birthday, phone, location, emergency, pain, goals, equipment).
import type { Answer, Env } from './lib.ts';

const NOTION_VERSION = '2025-09-03';

type RichText = { type: 'text'; text: { content: string }; annotations?: { bold: boolean } };

/** Notion text pieces are limited to 2,000 characters each. */
const richText = (content: string, bold = false): RichText[] => {
  const pieces: RichText[] = [];
  for (let i = 0; i < content.length || i === 0; i += 2000) {
    pieces.push({ type: 'text', text: { content: content.slice(i, i + 2000) }, ...(bold ? { annotations: { bold } } : {}) });
  }
  return pieces;
};

/** Tap-to-choose answers arrive as "Neck, Hips"; Notion options can't contain commas. */
const options = (value: string) =>
  value
    .split(', ')
    .map((name) => name.replace(/,/g, ' ').trim().slice(0, 100))
    .filter(Boolean)
    .map((name) => ({ name }));

export function intakeProperties(name: string, email: string, answers: Answer[], consent: boolean, submittedAt: string) {
  const get = (key: string) => answers.find((a) => a.key === key)?.value;
  const props: Record<string, unknown> = {
    Name: { title: richText(name) },
    Status: { select: { name: 'New' } },
    Submitted: { date: { start: submittedAt } },
    Email: { email },
    'Terms accepted': { checkbox: consent },
    'Health consent': { checkbox: consent },
  };
  const birthday = get('birthday');
  if (birthday && /^\d{4}-\d{2}-\d{2}$/.test(birthday)) props['Date of birth'] = { date: { start: birthday } };
  const phone = get('phone');
  if (phone) props.Phone = { phone_number: phone.slice(0, 50) };
  const location = get('location');
  if (location) props['Location & time zone'] = { rich_text: richText(location) };
  const emergency = get('emergency');
  if (emergency) props['Emergency contact'] = { rich_text: richText(emergency) };
  const pain = get('pain');
  if (pain) props['Pain areas'] = { multi_select: options(pain) };
  const goals = get('goals');
  if (goals) props.Goals = { multi_select: options(goals) };
  const equipment = get('equipment');
  if (equipment) props['Mat or Reformer'] = { select: options(equipment)[0] };
  return props;
}

export function intakeBlocks(answers: Answer[], agreed: string[]) {
  const paragraph = (rich_text: RichText[]) => ({ object: 'block', type: 'paragraph', paragraph: { rich_text } });
  return [
    { object: 'block', type: 'heading_3', heading_3: { rich_text: richText('Answers') } },
    ...answers.map((a) => paragraph([...richText(`${a.label}: `, true), ...richText(a.value)])),
    ...(agreed.length ? [paragraph([...richText('Ticked: ', true), ...richText(agreed.join(', '))])] : []),
  ];
}

/** Creates the page. Returns its link, or undefined if Notion isn't set up or refused it. */
export async function saveIntake(
  env: Env,
  intake: { name: string; email: string; answers: Answer[]; consent: boolean; agreed: string[] },
): Promise<string | undefined> {
  if (!env.NOTION_TOKEN || !env.NOTION_DATA_SOURCE_ID) return undefined;
  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.NOTION_TOKEN}`,
      'notion-version': NOTION_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      parent: { type: 'data_source_id', data_source_id: env.NOTION_DATA_SOURCE_ID },
      properties: intakeProperties(intake.name, intake.email, intake.answers, intake.consent, new Date().toISOString()),
      children: intakeBlocks(intake.answers, intake.agreed),
    }),
  });
  if (!res.ok) return undefined;
  const page = (await res.json()) as { url?: string };
  return page.url ?? 'https://www.notion.so';
}
