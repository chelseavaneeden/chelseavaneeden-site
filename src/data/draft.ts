/*
 * DRAFT CONTENT for the home page while we write the real copy together.
 * Copy is a starting point to be rewritten together; prices are SAMPLES for layout.
 * In Phase 2 this moves into CMS-editable content collections.
 */
import type { PriceInput } from '../lib/price';

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  children?: NavItem[];
}

export const nav: NavItem[] = [
  { label: 'Private sessions', href: '/private-sessions' },
  {
    label: 'Partnerships',
    href: '/partnerships',
    children: [
      { label: 'Companies', href: '/companies' },
      { label: 'Retreats & hospitality', href: '/retreats-hospitality' },
      { label: 'Studios & clinics', href: '/studios-partners' },
      { label: 'Brands', href: '/brands' },
    ],
  },
  { label: 'On-demand', href: 'https://www.thegoodmood.club', external: true },
  { label: 'About', href: '/about' },
];

export const bookCta = { label: 'Book an intro', href: '/book' };

export const hero = {
  eyebrow: 'Private Pilates · Lisbon & worldwide',
  title: 'Quietly *powerful* Pilates.',
  lede:
    'Specialist 1-on-1 sessions online and in Lisbon, plus bespoke movement programmes for companies, retreats, hotels and studios across Europe.',
  primary: { label: 'Book your intro pack', href: '/private-sessions#investment' },
  secondary: { label: 'Partner with me', href: '/partnerships' },
  meta: ['BASI certified', 'Rehab · Pre & post-natal · Posture'],
};

export interface Door {
  number: string;
  title: string;
  text: string;
  href: string;
}

export const doors: Door[] = [
  {
    number: '01',
    title: 'Private sessions',
    text: '1-on-1, online or in Lisbon. Rehab, pre & post-natal, posture and pain.',
    href: '/private-sessions',
  },
  {
    number: '02',
    title: 'Companies',
    text: 'Workshops, team classes and executive care for desk-based teams.',
    href: '/companies',
  },
  {
    number: '03',
    title: 'Retreats & hospitality',
    text: 'A specialist instructor for retreats, hotels, villas and yachts.',
    href: '/retreats-hospitality',
  },
  {
    number: '04',
    title: 'Studios & clinics',
    text: 'Guest workshops, cover teaching and referral partnerships.',
    href: '/studios-partners',
  },
  {
    number: '05',
    title: 'Brands',
    text: 'UGC, ambassadorships and co-hosted experiences for wellness brands.',
    href: '/brands',
  },
];

export const stats = [
  { value: '5,000+', label: 'private sessions taught' },
  { value: '5+ yrs', label: 'teaching online, worldwide' },
  { value: '9.3K', label: 'YouTube subscribers' },
  { value: 'BASI', label: 'certified instructor' },
];

export interface Offer extends PriceInput {
  eyebrow?: string;
  title: string;
  summary: string;
  includes: string[];
  cta: { label: string; href: string };
  featured?: boolean;
}

export const investment = {
  eyebrow: 'Investment',
  title: 'Begin with an *intro pack*.',
  intro:
    'Three private sessions to assess how you move, ease what hurts and build a plan around your schedule. Then continue monthly, or let’s design something bespoke.',
  note: 'Sample prices for layout only.',
  offers: [
    {
      eyebrow: 'Start here',
      title: 'Intro pack',
      summary: 'Three private sessions, online or in Lisbon.',
      priceDisplay: 'exact',
      price: 270,
      unit: 'pack',
      includes: ['Movement & posture assessment', 'Your personal plan', 'Reformer or mat'],
      cta: { label: 'Book your intro pack', href: '/book' },
      featured: true,
    },
    {
      eyebrow: 'Ongoing',
      title: 'Monthly plans',
      summary: '4 to 12 sessions a month, same time each week.',
      priceDisplay: 'from',
      price: 340,
      unit: 'month',
      includes: ['Programme updated monthly', 'Message support between sessions', 'Online or in Lisbon'],
      cta: { label: 'Book a call', href: '/book' },
    },
    {
      eyebrow: 'Bespoke',
      title: 'In-home, travel & intensives',
      summary: 'Sessions where you are, or focused blocks for an injury or an event.',
      priceDisplay: 'on-request',
      includes: ['Travel with you or meet you there', 'Intensive rehab blocks', 'Pre & post-natal programmes'],
      cta: { label: 'Request a proposal', href: '/enquire?type=private' },
    },
  ] satisfies Offer[],
};

export const testimonial = {
  quote:
    'I absolutely love my 1:1 Reformer sessions with Chelsea. I have seen a huge difference in my mobility and a reduction in shoulder and upper back pain.',
  name: 'Private client',
  context: 'Online Reformer sessions',
};

export const ctaBand = {
  title: 'Not sure where you *fit*?',
  text: 'Tell me what you have in mind: a team, a retreat, a studio collaboration or your own body. I reply personally within two working days.',
  primary: { label: 'Start an enquiry', href: '/enquire' },
  secondary: { label: 'Book an intro', href: '/book' },
};

export const footer = {
  tagline: 'Specialist Pilates from Lisbon, for people, teams and places worldwide.',
  location: 'Lisbon, Portugal · Teaching worldwide',
  socials: [
    { label: 'YouTube', href: 'https://www.youtube.com/@chelseavaneeden' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/chelseavaneeden/' },
    { label: 'The Good Mood Club', href: 'https://www.thegoodmood.club' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cancellation policy', href: '/cancellation' },
  ],
};
