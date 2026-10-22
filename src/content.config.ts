/*
 * CONTENT SCHEMAS: what each editable piece of content must look like.
 *
 * Chelsea edits these files through Pages CMS (.pages.yml mirrors these fields).
 * If an edit doesn't match the schema, the build fails and the preview keeps the last
 * good version, so a typo can never break the live page.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// The CMS writes empty fields as "" or null; treat both as "not set".
const blankToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v);
const optionalText = z.preprocess(blankToUndefined, z.string().optional());
const optionalNumber = z.preprocess(blankToUndefined, z.number().positive().optional());
const list = <T extends z.ZodType>(item: T) => z.preprocess((v) => v ?? [], z.array(item));

const link = z.object({ label: z.string(), href: z.string() });
const optionalLink = z.preprocess(
  (v) => (v && typeof v === 'object' && (v as { label?: string }).label ? v : undefined),
  link.optional(),
);

export const audiences = ['private', 'companies', 'hospitality', 'studios', 'brands'] as const;

// Shared building blocks for page sections.
const sectionHead = { eyebrow: optionalText, title: z.string(), intro: optionalText };
const titledItems = list(z.object({ title: z.string(), text: z.string() }));
const ctaBand = z.object({
  title: z.string(),
  text: optionalText,
  primary: link,
  secondary: optionalLink,
});
// A section the editor can leave empty: no items means the section is hidden.
const optionalSection = <T extends z.ZodRawShape>(shape: T) =>
  z.preprocess(
    (v) => (v && typeof v === 'object' && Array.isArray((v as { items?: unknown[] }).items) && (v as { items: unknown[] }).items.length ? v : undefined),
    z.object(shape).optional(),
  );

const yamlIn = (dir: string) => glob({ pattern: '*.{yaml,yml}', base: `./src/content/${dir}` });

const settings = defineCollection({
  loader: yamlIn('settings'),
  schema: z.object({
    nav: list(
      z.object({
        label: z.string(),
        href: z.string(),
        external: z.boolean().default(false),
        children: list(link),
      }),
    ),
    bookCta: link,
    availability: z
      .object({
        open: z.boolean().default(true),
        openLabel: z.string().default('Accepting new clients'),
        closedLabel: z.string().default('Fully booked · Join the waitlist'),
        href: z.string().default('/private-sessions#investment'),
        closedHref: z.string().default('/enquire?type=private'),
      })
      .default({
        open: true,
        openLabel: 'Accepting new clients',
        closedLabel: 'Fully booked · Join the waitlist',
        href: '/private-sessions#investment',
        closedHref: '/enquire?type=private',
      }),
    contact: z
      .object({
        whatsappHref: optionalText,
        whatsappLead: z.string().default('Not sure which option suits you?'),
        whatsappLabel: z.string().default('Message me on WhatsApp'),
      })
      .default({ whatsappLead: 'Not sure which option suits you?', whatsappLabel: 'Message me on WhatsApp' }),
    tagline: z.string(),
    location: z.string(),
    stats: list(z.object({ value: z.string(), label: z.string() })),
    socials: list(link),
    legal: list(link),
  }),
});

const pages = defineCollection({
  loader: yamlIn('pages'),
  schema: ({ image }) =>
    z.object({
      seo: z.object({ title: z.string(), description: z.string() }),
      hero: z.object({
        eyebrow: z.string(),
        title: z.string(),
        lede: z.string(),
        primary: link,
        secondary: optionalLink,
        meta: list(z.string()),
        image: image(),
        imageAlt: z.string(),
        imageFocus: z.enum(['center', 'top', 'upper', 'lower', 'bottom', 'left', 'right']).default('center'),
        video: z.preprocess(
          blankToUndefined,
          z.object({ src: z.string(), poster: z.string(), speed: z.number().min(0.25).max(2).default(1) }).optional(),
        ),
      }),
      doors: z.object({
        eyebrow: optionalText,
        title: z.string(),
        items: list(z.object({ title: z.string(), text: z.string(), href: z.string() })),
      }),
      about: z.object({
        eyebrow: optionalText,
        title: z.string(),
        paragraphs: list(z.string()),
        image: image(),
        imageAlt: z.string(),
        cta: optionalLink,
      }),
      investment: z.object({
        eyebrow: optionalText,
        title: z.string(),
        intro: optionalText,
        note: optionalText,
      }),
      ctaBand,
    }),
});

// The five audience pages (private sessions, companies, hospitality, studios, brands)
// all share one layout: src/layouts/AudiencePage.astro.
const audiencePages = defineCollection({
  loader: yamlIn('audience-pages'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      audience: z.enum(audiences),
      seo: z.object({ title: z.string(), description: z.string() }),
      hero: z.object({
        eyebrow: z.string(),
        title: z.string(),
        lede: z.string(),
        primary: link,
        secondary: optionalLink,
        image: image(),
        imageAlt: z.string(),
        imageFocus: z.enum(['center', 'top', 'upper', 'lower', 'bottom', 'left', 'right']).default('center'),
        video: z.preprocess(
          blankToUndefined,
          z.object({ src: z.string(), poster: z.string(), speed: z.number().min(0.25).max(2).default(1) }).optional(),
        ),
        layout: z.enum(['split', 'overlay']).default('split'),
        textPosition: z.enum(['center', 'left']).default('left'),
      }),
      whoFor: z.object({ ...sectionHead, items: titledItems }),
      formats: optionalSection({ ...sectionHead, items: titledItems }),
      steps: optionalSection({ ...sectionHead, items: titledItems }),
      investment: z.object({ ...sectionHead, note: optionalText }),
      proof: z.object({ eyebrow: optionalText, title: z.string() }),
      faq: optionalSection({
        ...sectionHead,
        items: list(z.object({ question: z.string(), answer: z.string() })),
      }),
      ctaBand,
    }),
});

const offers = defineCollection({
  loader: yamlIn('offers'),
  schema: z
    .object({
      title: z.string(),
      audience: z.enum(audiences),
      eyebrow: optionalText,
      summary: z.string().max(240),
      priceDisplay: z.enum(['exact', 'from', 'on-request']),
      price: optionalNumber,
      currency: z.enum(['EUR', 'GBP', 'USD']).default('EUR'),
      unit: z.preprocess(
        blankToUndefined,
        z.enum(['session', 'pack', 'month', 'programme', 'workshop', 'day', 'person']).optional(),
      ),
      priceVisibility: z.enum(['web', 'media-kit', 'hidden']).default('web'),
      priceNote: optionalText,
      /** Short call-out shown as a pill on the card, e.g. "Continue & save €40". */
      highlight: optionalText,
      includes: list(z.string()),
      cta: link,
      featured: z.boolean().default(false),
      order: z.number().default(50),
      published: z.boolean().default(true),
    })
    .refine((o) => o.priceDisplay === 'on-request' || o.price !== undefined, {
      message: 'Add a price, or choose "Tailored proposal" under How to show the price.',
      path: ['price'],
    }),
});

const testimonials = defineCollection({
  loader: yamlIn('testimonials'),
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    context: optionalText,
    audiences: list(z.enum(audiences)),
    /** Only testimonials with written permission are ever shown. */
    consent: z.boolean().default(false),
    featured: z.boolean().default(false),
    order: z.number().default(50),
  }),
});

export const collections = { settings, pages, audiencePages, offers, testimonials };
