import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { audiences } from '../content.config';

export type Audience = (typeof audiences)[number];
export type Site = CollectionEntry<'settings'>['data'];
export type NavItem = Site['nav'][number];
export type Link = { label: string; href: string };
export type Offer = CollectionEntry<'offers'>['data'];
export type Testimonial = CollectionEntry<'testimonials'>['data'];

export async function getSite(): Promise<Site> {
  const entry = await getEntry('settings', 'site');
  if (!entry) throw new Error('Missing src/content/settings/site.yaml');
  return entry.data;
}

export async function getPage(id: string): Promise<CollectionEntry<'pages'>['data']> {
  const entry = await getEntry('pages', id);
  if (!entry) throw new Error(`Missing src/content/pages/${id}.yaml`);
  return entry.data;
}

export type AudiencePageData = CollectionEntry<'audiencePages'>['data'];

export async function getAudiencePage(audience: Audience): Promise<AudiencePageData> {
  const entry = await getEntry('audiencePages', audience);
  if (!entry) throw new Error(`Missing src/content/audience-pages/${audience}.yaml`);
  return entry.data;
}

/** Published offers for one audience, in the order set in the editor. */
export async function getOffers(audience: Audience): Promise<Offer[]> {
  const all = await getCollection('offers', ({ data }) => data.published && data.audience === audience);
  return all.map((e) => e.data).sort((a, b) => a.order - b.order);
}

/** Testimonials with written permission only; featured ones first, then by order. */
export async function getTestimonials(audience?: Audience): Promise<Testimonial[]> {
  const all = await getCollection(
    'testimonials',
    ({ data }) => data.consent && (!audience || data.audiences.includes(audience)),
  );
  return all.map((e) => e.data).sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order);
}
