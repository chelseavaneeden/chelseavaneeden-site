# Scrapbook concept: handover notes

The `concept-scrapbook` branch is Chelsea's chosen direction for the new site. It is **not** on `main`
and **not** live: the Framer site at chelseavaneeden.com is untouched until Chelsea says launch.

- Preview (always up to date): https://concept-chelseavaneeden-site.chelseavaneeden-site.workers.dev/
- Every page is `noindex`; the preview stays out of Google.
- Last updated: 25 Oct 2026.

## Publishing a change to the preview

`main` deploys automatically through Workers Builds. This branch does **not**, so publish it by hand:

```bash
npm run build
npx wrangler versions upload --preview-alias concept
```

`versions upload` never touches production. Each upload also prints a frozen "Version Preview URL"
that keeps that exact version, which is handy for sharing a snapshot.

House habits: commit and push after every change, and leave the local checkout on `main` afterwards.
Never merge into `main`, and never add routes or custom domains, until Chelsea says so.

## The home page (a one-pager, following the old Framer page's structure)

| Order | Section | Where the words live (editor → file) |
|---|---|---|
| 1 | Header: "Accepting new clients" badge, headline, intro, **Book your intro pack** and **Retreats & Collaborations ↗** (both scroll to #investment), teaching video on the right | Home page → Top of the page (`src/content/pages/home.yaml` → `hero`) |
| 2 | Credentials banner | Site settings → Credentials banner (`site.yaml` → `stats`) |
| 3 | My services, *How we work together*: two cards with photos (Monthly plans, Retreats, Events & Collaborations) | Home page → Prices section; cards in Offers & prices (`src/content/offers/`) |
| 4 | Client words, *What clients notice*, plus a **Read my Google reviews** button | Heading: Service pages → Private sessions → Testimonials heading. Quotes: Testimonials. Button: Site settings → Reviews button |
| 5 | Meet your instructor: bio left, sticky note and polaroids right | Home page → Meet Chelsea (`about`, including `about.note` for the sticky note) |
| 6 | Perfect for *those who*… : four ticks | Home page → Perfect for those who… (`perfectFor`) |
| 7 | Good to know (questions) | Service pages → Private sessions → Questions (shared with that page) |

The menu links jump to sections: Services `/#investment`, Client Reviews `/#reviews`, About Chelsea `/#about`, FAQ `/#faq`.

## Other pages

- `/monthly-plans`: the Stripe pricing table. The **Book your intro pack** button on the Monthly plans card goes here.
  Table settings: Site settings → Monthly plans (pricing table ID and publishable `pk_` key only, never a secret key).
- `/terms`: Terms & Conditions (Legal pages → Terms & Conditions, `src/content/legal/terms.md`).
  `/terms-and-conditions` (the old Framer address) redirects here.
- `/private-sessions`: still built, but no longer in the menu.
- `/styleguide` and `/fonts`: internal reference pages.

## Site-wide pieces

- **WhatsApp**: every link to the WhatsApp link in Site settings opens the **proposal form** pop-up instead
  (`ProposalDialog`). That covers the round button bottom-right, Request a proposal and Message me on WhatsApp.
  The form builds a ready-to-send wa.me message to `contact.whatsappNumber`. Questions and wording:
  Site settings → Proposal form. Without JavaScript the links still open WhatsApp directly.
- **Logo**: the swoosh only, debossed in the colour of whatever it sits on (`Logo` default variant `deboss`).
  The full signature is kept as `variant="signature"`. Square swoosh artwork: `public/brand/logo-mark-square.svg`.
- **Footer**: "Based in Europe · Teaching worldwide" under the logo; © 2021 (Site settings → Copyright year).

## Design system additions on this branch

- Fonts: Playfair Display (headings), Host Grotesk (body), Martian Mono (labels).
- Tokens: butter CTA, WhatsApp green (`--whatsapp-500`, only for WhatsApp UI), deboss filter, logo sizes.
- Text styles: `type-note` (small sticky-note headline on phones), `type-longform` (Markdown pages).
- Patterns: `Checklist`, `ProposalDialog`, `WhatsAppFloat`, `StickyNote`, `PhotoCollage`, `BgVideo`;
  `OfferCard` supports a side photo; `TestimonialGrid` has a reviews link and `cardTone`; `Hero` split layout supports video.

## Copy rules (from Chelsea)

- Never use an em dash anywhere in the site copy.
- Chelsea is **South African, living in Lisbon**. Never write "from Lisbon".
- She is a **BASI Comprehensive** Pilates instructor; positioning is movement for mental health.
- Keep her wording; adapt capitalisation and fix clear typos, then tell her what changed.
- Never build on assumptions about her business: ask first.

## Open decisions (ask Chelsea)

1. **Prices**: the Monthly plans card says *from €280/month*. The Stripe table (last checked 24 Oct) shows
   4 sessions €260/month, 8 sessions €472/month and the Intro Package €260. INTRO40 is a private €40 promo code.
2. **Rollover**: the terms (clause 2.3) say one unused session rolls over; the FAQ says up to 2.
3. **Terms**: there is no section 13 (it jumps from 12 to 14). Governing law is South Africa/POPIA while she lives
   in Portugal with EU clients, so suggest she checks with a lawyer.
4. **Privacy policy**: the footer Privacy link goes nowhere yet; one is likely needed before launch (GDPR).
5. **Google reviews link** is a long search URL; a Google Business Profile share link (g.page/r/…) would last longer.
6. **Proposal form**: "Where?" offers Africa (cards say South Africa); title is "Request a proposal" even for 1-on-1 enquiries.
7. **Pricing page** still has the small label "MONTHLY PLANS" above "Choose your plan".
8. The header and menu **Book your intro pack** buttons scroll to the cards; only the card button opens the pricing table.

## Testing tips

- The in-app browser pane pauses transitions and smooth scrolling when hidden. Test with
  `scroll-behavior: auto` or `transition: none` before trusting a "not moving" result.
- If the dev server shows old content, delete `.astro/data-store.json` and restart it.
- For pixel detail, test at the mobile preset: screenshots there are at 2× resolution.
