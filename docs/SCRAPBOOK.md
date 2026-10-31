# Scrapbook concept: handover notes

The `concept-scrapbook` branch is Chelsea's chosen direction for the new site. It is **not** on `main`
and **not** live: the Framer site at chelseavaneeden.com is untouched until Chelsea says launch.

- Preview (always up to date): https://concept-chelseavaneeden-site.chelseavaneeden-site.workers.dev/
- Every page is `noindex`; the preview stays out of Google.
- Last updated: 25 Oct 2026, after the QA of a client's feedback (plan:
  `~/.claude/plans/pasted-content-id-5b0d-okay-so-composed-glade.md`).

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

## How the site is split (since 25 Oct)

Two audiences, two pages, so neither reads the other's offer:

- **`/` is for 1-on-1 clients only.** One action: Book your intro pack.
- **`/retreats-events` is for organisers, teams and brands.** One action: Request a proposal. This is
  the link for outreach emails. Its header button is its own (Request a proposal), not the intro pack.

### Home page (1-on-1)

| Order | Section | Where the words live (editor → file) |
|---|---|---|
| 1 | Top: availability badge, headline, intro, **Book your intro pack**, "Questions first? Ask me", trust line (Google rating when set, BASI, YouTube), teaching video | Home page → Top of the page (`home.yaml` → `hero`); trust line: Site settings → Trust line |
| 2 | Perfect for *those who*… | Home page → Perfect for those who… |
| 3 | Start with your *intro pack*: one card (€260, 4 sessions, use within 2 months) and a line on the ongoing price | Home page → Intro pack section; the card: Offers & prices → Intro pack |
| 4 | How it *works*: four steps | Home page → How it works |
| 5 | What clients *notice* (with Google rating when set) and All reviews on Google | Heading: Service pages → Private sessions → Testimonials heading. Quotes: Testimonials |
| 6 | Hi, I'm *Chelsea*: teaching first, polaroids (no sticky note or tape) | Home page → Meet Chelsea |
| 7 | Good to *know* (questions) | Service pages → Private sessions → Questions |
| 8 | Closing band: Book your intro pack / Ask a question | Home page → Closing band |

Menu: Reviews · About · FAQ · Retreats & events, plus the Book button. `/private-sessions` redirects to `/`.

### Retreats & events (`/retreats-events`)

Uses `AudiencePage` with `src/content/audience-pages/hospitality.yaml`: top of the page (portrait for now;
swap for a group or outdoor photo), who I work with, how it works, questions, and the proposal form.

### The intro pack path

1. Every **Book your intro pack** goes to **`/intro-pack`**: three short steps and the **intro-only** Stripe
   pricing table (Site settings → Intro pack page).
2. After paying, Stripe should send people to **`/welcome`** (set in Stripe on the pricing table). It shows
   the booking link (Site settings → Welcome page → booking link; a fallback line until it's set) and the intake form.
3. **`/monthly-plans`** is for existing clients only: noindex, linked from nowhere. It needs a **second**
   pricing table with the monthly plans; until its ID is set it shows a message with ways to get in touch.

## Forms (email, not WhatsApp)

- Three forms, words in Site settings → Enquiry forms: **question** (pop-up from every `/enquire` link,
  and the `/enquire` page), **proposal** (Retreats & events) and **intake** (`/welcome`, with a consent tick
  for health information).
- They post to **`/api/enquire`**, handled by `worker/index.ts` (the only server code; `wrangler.jsonc`
  runs it for `/api/*` only). It checks the site, a hidden spam trap and Turnstile (when set), then emails
  the answers through **Resend** with reply-to set to the sender.
- Keys are Cloudflare **secrets**, never in this public repo:
  `npx wrangler secret put RESEND_API_KEY`, `ENQUIRY_TO` (the inbox), optional `TURNSTILE_SECRET_KEY` and
  `ENQUIRY_FROM`. Without the first two, forms show their "didn't send" message with the WhatsApp link.
- Until a sending domain is verified in Resend, its test sender only delivers to the Resend account's own
  email address. Verifying `send.chelseavaneeden.com` needs DNS records: **wait for Chelsea's go-ahead**.
- WhatsApp is now only a small "Prefer WhatsApp?" link under each form; the floating bubble is gone.
- Local test: the `worker-dev` launch configuration runs `wrangler dev` on port 8787 (forms included).

## Analytics (Umami, cookieless)

- Loads only when Site settings → Analytics → Umami website ID is set; respects Do Not Track.
- One click tracker in `Base.astro` records what a click does, wherever it is: `book_intro`,
  `enquiry_open`, `organiser_page`, `whatsapp_click`, `reviews_click`, each with `from` (hero, menu, footer,
  offer_card…, from the button's `data-track`). Forms record `enquiry_submit` (type). `/welcome` records
  `intro_purchase`. Funnel to watch: visit → book_intro → intro_purchase.
- The Privacy page has an on/off switch for analytics in that browser.

## Site-wide pieces

- **Logo**: the `signature` variant (swoosh + script) in the header and footer, so the name reads.
  The debossed swoosh (`deboss`) is still available.
- **Colours** (brand style guide, 29 Oct): on Warm Cream `#F5EDE0` sections every word is Dark Chocolate
  `#3B2620`; on Soft Oat `#E8DCC8` sections and the footer every word is Deep Forest Green `#213926`.
  Green is also the logo, the ticks and the dark bands (intro card, closing band, with cream words).
  Mustard Yellow `#FFD751` for buttons, highlights and review quotation marks; the "Perfect for" lists
  use a yellow ✺ (`#FFD230`, the `burst` icon) instead of ticks.
- **About**: "Hi, I'm Chelsea." is one forest green line stretched across the page (`type-display-stretch`),
  above the words and photos. Each page's "Section colour"
  is Soft oat (default) or Soft mustard; both pages use oat.
- **Footer**: two rows of links, Book your intro pack and Ask a question (the form pop-up), then WhatsApp and
  Instagram (both open a new tab), then Privacy, Terms, Cancellation policy, Livro de Reclamações and the current year.
  No links to Google reviews, YouTube or LinkedIn: Chelsea doesn't want to send people away from the site.
- **Line breaks**: pressing Enter in an editor text field starts a new line on the page (e.g. the closing
  band always breaks after "first.").
- **Legal**: `/privacy` (draft, see below) and `/terms` (sections now numbered 1–14).

## Design system additions on this branch

- Fonts: Playfair Display (headings), Host Grotesk (body), Martian Mono (labels).
- Tokens: the style-guide palette, a `heading` colour (green) separate from `ink` (chocolate copy), mustard CTA
  with hover, note (mustard), WhatsApp green (unused now), deboss filter, logo sizes.
- Text styles: `type-note` (small sticky-note headline on phones), `type-longform` (Markdown pages).
- Patterns: `Checklist`, `EnquiryForm`, `EnquiryDialog`, `TrustLine`, `NumberedList`, `AnalyticsOptOut`,
  `StickyNote` (unused now), `PhotoCollage`, `BgVideo`; `OfferCard` supports a side photo and a single card
  spans the full width; `TestimonialGrid` has a reviews link, a rating line and `cardTone`; `Hero` split
  layout supports video and a `trust` slot. Icons: `star`, `play` added.

## Copy rules (from Chelsea)

- Never use an em dash anywhere in the site copy.
- Headings never end with a full stop (commas and ellipses are fine). An ellipsis goes inside the
  emphasis, so it takes the same amber: Perfect for *those who…*
- Chelsea is **South African, living in Lisbon**. Never write "from Lisbon". On the 1-on-1 page, location
  is left out (online, worldwide); the organiser page says "Based in Lisbon, available across Europe and South Africa".
- She is a **BASI Comprehensive** Pilates instructor; positioning is movement for mental health.
- Keep her wording; adapt capitalisation and fix clear typos, then tell her what changed.
- Never build on assumptions about her business: ask first.

## Chelsea's to-do list (needed before launch)

1. **Stripe**: on the intro pricing table, after payment redirect to `/welcome`; turn off Adaptive Pricing
   (so checkout stays in euros); tidy the intro subtitle ("1 or 2 private sessions weekly…" describes the
   monthly plans); make a second pricing table with the monthly plans and paste its ID in Site settings;
   deactivate the old €300 intro Payment Link. Optional: match the table's button colour to the site.
2. **Booking link** for clients to pick times: Site settings → Welcome page.
3. **Resend** account (free) and an API key; **Turnstile** widget in Cloudflare (hostname: the preview address,
   later the real domain); **Umami Cloud** account (free). Then set the secrets and IDs above.
4. **Google**: rating and number of reviews (Site settings → Trust line), a `g.page/r/…` review link, and
   permission from 3–6 reviewers to quote them by first name.
5. **Named client quotes** (first name + city or situation) with permission.
6. Facts for the organiser page: insurance, what she brings (mats, props), group sizes, travel terms.
7. Rollover (1 or 2 sessions), personal line in About, Instagram link, business details for the privacy
   policy, Livro de Reclamações registration.
8. **Group/outdoor photos or a 30–60s teaching clip** for the organiser page. The Retreats & events header now plays Chelsea's own clip (`public/media/retreats-teaching.mp4`, sent 28 Oct as "Retreat Page_ Placeholder Video"); the Pexels stock clip is gone.
9. **Lawyer check** of Terms and Privacy: "non-refundable" vs the EU 14-day withdrawal right, South African
   governing law while living in Portugal, retention periods.

## Open decisions (ask Chelsea)

1. **Rollover**: the terms (clause 2.3) say one unused session rolls over; the FAQ says up to 2.
2. **Draft copy to approve**: home intro line, two new "Perfect for" ticks (pregnancy, stress), the About
   rewrite and its one personal line, How it works, the whole organiser page, the forms, Privacy.
3. **Reply promises**: forms say "within one working day"; the organiser page promises a proposal within 48 hours.
4. **Mustard buttons on cream** stand out by colour more than by lightness (1.2:1 against the cream); the
   green text inside them is very clear. Forest green buttons are a one-line token change if wanted.
5. **Google reviews link** is a long search URL; a Business Profile link (g.page/r/…) would last longer.

## Testing tips

- The in-app browser pane pauses transitions and smooth scrolling when hidden. Test with
  `scroll-behavior: auto` or `transition: none` before trusting a "not moving" result.
- If the dev server shows old content (or "Missing site.yaml" after a schema change), delete
  `.astro/data-store.json` and restart it.
- For pixel detail, test at the mobile preset: screenshots there are at 2× resolution.
