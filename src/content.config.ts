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

// One enquiry form: tap-to-choose questions, extra fields and an optional required tick box.
// Name and email are always asked.
const enquiryForm = z.object({
  title: z.string(),
  intro: optionalText,
  questions: list(z.object({ label: z.string(), short: z.string(), options: list(z.string()) })),
  fields: list(
    z.object({
      name: z.string().regex(/^[a-z][a-z0-9-]*$/, 'Lower-case letters, numbers and dashes only, e.g. message.'),
      label: z.string(),
      type: z.enum(['text', 'textarea']).default('textarea'),
      required: z.boolean().default(false),
      placeholder: optionalText,
    }),
  ),
  /** A tick box people must tick before sending, e.g. consent to use health information. */
  consent: optionalText,
  button: z.string(),
});

// A block the editor can leave empty: without a title it is treated as not set (and hidden).
const optionalBlock = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (v) => (v && typeof v === 'object' && (v as { title?: unknown }).title ? v : undefined),
    schema.optional(),
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
    /** Stripe's publishable key (starts with pk_). It is designed to be public; never paste a secret key here. */
    stripePublishableKey: z.string().startsWith('pk_', 'Use the publishable key (starts with pk_), never a secret key.'),
    /** The intro pack page (/intro-pack): every "Book your intro pack" button leads here. */
    introPack: z.object({
      eyebrow: optionalText,
      title: z.string(),
      intro: optionalText,
      /** Short numbered lines on what happens after paying. */
      points: list(z.string()),
      /** Stripe → Pricing tables → the intro-only table's ID (prctbl_…). */
      stripePricingTableId: z.string().startsWith('prctbl_', 'Paste the pricing table ID, starting with prctbl_.'),
    }),
    /**
     * The monthly plans page (/monthly-plans) for clients continuing after their intro pack.
     * It is linked from nowhere on the site: send the link to clients yourself.
     */
    monthlyPlans: z.object({
      eyebrow: optionalText,
      title: z.string(),
      intro: optionalText,
      /** A second Stripe pricing table with the monthly plans. Empty shows the message below instead. */
      stripePricingTableId: z.preprocess(blankToUndefined, z.string().startsWith('prctbl_').optional()),
      noTableText: z.string(),
    }),
    /** The thank-you page Stripe sends people to after they pay for the intro pack (/welcome). */
    welcome: z.object({
      title: z.string(),
      intro: optionalText,
      bookingTitle: z.string(),
      bookingText: optionalText,
      /** Your booking link (Google Calendar booking page, Calendly…). Empty shows bookingFallback instead. */
      bookingHref: optionalText,
      bookingLabel: z.string(),
      bookingFallback: z.string(),
      intakeTitle: z.string(),
      intakeText: optionalText,
    }),
    contact: z
      .object({
        /** Your WhatsApp link. It opens WhatsApp directly, as a small "Prefer WhatsApp?" link. */
        whatsappHref: optionalText,
        whatsappLabel: z.string().default('Message me on WhatsApp'),
      })
      .default({ whatsappLabel: 'Message me on WhatsApp' }),
    /**
     * The enquiry forms. Answers arrive in your inbox by email (sent by the site's /api/enquire).
     * question: "Ask me" from the 1-on-1 pages (a pop-up, and /enquire). proposal: the Retreats & events
     * page. intake: the welcome page after paying.
     */
    enquiry: z.object({
      nameLabel: z.string().default('Name'),
      emailLabel: z.string().default('Email'),
      /** Shown under every send button, e.g. "I reply personally within one working day." */
      replyPromise: optionalText,
      /** Short line next to the privacy policy link under the send button. */
      privacyNote: optionalText,
      success: z.string(),
      error: z.string(),
      /** Cloudflare Turnstile site key (the spam check). Empty: forms send without it. */
      turnstileSiteKey: optionalText,
      forms: z.object({ question: enquiryForm, proposal: enquiryForm, intake: enquiryForm }),
    }),
    /** Umami Cloud website ID (cookieless analytics). Empty: no analytics. */
    analytics: z.object({ umamiWebsiteId: optionalText }).default({}),
    tagline: z.string(),
    /** Optional extra after the copyright line, e.g. a city. */
    location: optionalText,
    /** Year shown in the footer copyright line. Empty shows the current year. */
    copyrightYear: z.preprocess(blankToUndefined, z.number().int().optional()),
    /**
     * The short proof line under the main buttons: a Google rating (shown only when both numbers
     * are filled in) and a few facts, each with an optional link.
     */
    trust: z
      .object({
        googleRating: z.preprocess(blankToUndefined, z.number().min(1).max(5).optional()),
        googleReviewCount: optionalNumber,
        items: list(z.object({ label: z.string(), href: optionalText })),
      })
      .default({ items: [] }),
    /** Footer links to real pages (the menu's jump links are left out on purpose). */
    footerLinks: list(link),
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
        eyebrow: optionalText,
        title: z.string(),
        lede: z.string(),
        primary: link,
        extra: optionalLink,
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
      about: z.object({
        eyebrow: optionalText,
        title: z.string(),
        paragraphs: list(z.string()),
        image: image(),
        imageAlt: z.string(),
        cta: optionalLink,
      }),
      /** The intro pack section: heading above the offer card, note under it (e.g. the ongoing price). */
      investment: z.object({
        eyebrow: optionalText,
        title: z.string(),
        intro: optionalText,
        note: optionalText,
      }),
      /** "Perfect for those who…": a ticked list under the top of the page. Empty list hides it. */
      perfectFor: optionalSection({ ...sectionHead, items: list(z.string()) }),
      /** "How it works": numbered steps. Empty list hides it. */
      steps: optionalSection({ ...sectionHead, items: titledItems }),
      /** The closing band at the bottom of the page. */
      ctaBand: optionalBlock(ctaBand),
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
        eyebrow: optionalText,
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
      /** Heading above the offer cards; only shown when this audience has published offers. */
      investment: optionalBlock(z.object({ ...sectionHead, note: optionalText })),
      proof: z.object({ eyebrow: optionalText, title: z.string() }),
      faq: optionalSection({
        ...sectionHead,
        items: list(z.object({ question: z.string(), answer: z.string() })),
        /** Link under the questions, e.g. Another question? Ask me (/enquire opens the pop-up). */
        link: optionalLink,
      }),
      /** The enquiry form near the bottom of the page (organisers: the proposal form). */
      enquiry: optionalBlock(z.object(sectionHead)),
      ctaBand: optionalBlock(ctaBand),
    }),
});

const offers = defineCollection({
  loader: yamlIn('offers'),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        /** Show the title on the card. Untick to hide it (screen readers still hear it). */
        showTitle: z.boolean().default(true),
        audience: z.enum(audiences),
        eyebrow: optionalText,
        summary: z.preprocess(blankToUndefined, z.string().max(240).optional()),
        /** Optional photo, shown on the side of the card (on top on phones). */
        image: z.preprocess(blankToUndefined, image().optional()),
        imageAlt: optionalText,
        imageFocus: z.enum(['center', 'top', 'upper', 'lower', 'bottom', 'left', 'right', 'top-left']).default('center'),
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
      })
      .refine((o) => !o.image || o.imageAlt, {
        message: 'Add a photo description so people using screen readers know what it shows.',
        path: ['imageAlt'],
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

// Legal pages (terms, privacy…): one Markdown file each in src/content/legal, published at /<file name>.
const legal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    /** Legal name of the business, shown under the title. */
    business: optionalText,
    /** e.g. "1 May 2026" */
    effective: optionalText,
    description: optionalText,
  }),
});

export const collections = { settings, pages, audiencePages, offers, testimonials, legal };
