# The site: how it works and where everything lives

There is **one site, one version and one link**:

```
Pages CMS  →  main on GitHub  →  Cloudflare builds it  →  chelseavaneeden-site.chelseavaneeden-site.workers.dev
```

- Edit: https://app.pagescms.org/chelseavaneeden/chelseavaneeden-site/main/file/home
- See it: https://chelseavaneeden-site.chelseavaneeden-site.workers.dev/
- chelseavaneeden.com is still the Framer site and stays untouched until Chelsea says launch. Until then every
  page is `noindex` and `robots.txt` blocks crawlers, so this address stays out of Google.

## How a change gets published

A save in the CMS, or a code change pushed to `main`, is all it takes. Cloudflare builds and publishes the site
by itself, usually within a few minutes (longer when Cloudflare is busy). There is nothing to upload by hand.

## What stops the site and the CMS drifting apart

| Safeguard | What it does |
|---|---|
| One branch | `main` is the only working version, and it's the one in the CMS link above. |
| `scripts/check-cms.mjs` (runs in every build) | Everything in `src/content` must be listed in `.pages.yml`. Pages CMS deletes anything it doesn't list when it saves a file, so a missing field stops the build instead of quietly losing content. It also catches required fields left empty and choices the editor doesn't offer. |
| `src/content.config.ts` (runs in every build) | If a save isn't valid, the build stops and the site keeps its last good version. |
| `/version.txt` | Shows which save the website is showing. |
| `.github/workflows/check-website-updated.yml` | After every save, checks `/version.txt` matches. If it doesn't after 20 minutes, it opens an issue assigned to Chelsea, so GitHub emails her instead of a failed publish going unnoticed. |

If you add a field to `src/content.config.ts`, add it to `.pages.yml` too (the build tells you if you forget).

## Trying out a design idea

Look first at PNG mock-ups (Chelsea's preference for "just for fun" looks), or at the dev server in the app's
browser pane. Those change nothing. Keep design trials off `main` until she has chosen. If a trial really has to
be on a branch, delete it afterwards, and say clearly that the CMS doesn't edit it.

## How the site is split

Two audiences, two pages, so neither reads the other's offer:

- **`/` is for 1-on-1 clients only.** One action: Book your Session.
- **`/retreats-events` is for organisers, teams and brands.** One action: Request a proposal. This is the link for
  outreach emails. Its header button is its own (Request a proposal), not the intro session.

### Home page (1-on-1)

Everything is under **Home page** in the CMS, in the order it appears on the page, unless noted.

| Order | Section | CMS section |
|---|---|---|
| 1 | Top: availability badge, headline, intro, **Book your Session**, "Questions first? Ask me", trust line, teaching video | Top of the page. Badge: Site settings → Availability. Trust line: Site settings → Trust line |
| 2 | You're in the right place *if you…* | You're in the right place if you… |
| 3 | Shall we *begin?*: one card with the sunrise glow (one session, €55) and a line on the ongoing price | Intro session section. The card itself: Offers & prices → Intro session |
| 4 | What clients *notice* | Reviews heading. The quotes: Testimonials |
| 5 | Hi, I'm *Chelsea* | Meet Chelsea |
| 6 | What you can expect *from me* (home page only) | What you can expect from me |
| 7 | Logo banner | Logo banner |
| 8 | Good to *know* | Questions |
| 9 | Ready when *you* are: a card with the sunrise glow | Closing band |

Menu: Site settings → Menu. `/private-sessions` redirects to `/`.

### Retreats & events (`/retreats-events`)

Uses `src/layouts/AudiencePage.astro` with `src/content/audience-pages/hospitality.yaml` (CMS: **Retreats & events page**).
Hi, I'm Chelsea and the logo banner are shared with the home page, so they are edited in one place (Home page).

### The intro session path

The first step is a single **Intro Session at €55** (since 3 Nov). The page's address is still `/intro-pack`.

1. Every **Book your Session** goes to **`/intro-pack`**, on the home header's sunrise glow: the intro-only Stripe table,
   then three short numbered steps. Words and table ID: Site settings → Intro session page.
2. After paying, Stripe should send people to **`/welcome`** (set in Stripe on the pricing table). It shows the booking
   link (Site settings → Welcome page; a fallback line until it's set) and the intake form.
3. **`/monthly-plans`** is for existing clients only: noindex, linked from nowhere. It needs a second pricing table with the
   monthly plans; until its ID is set it shows a message with ways to get in touch.

## Forms (email, not WhatsApp)

- Three forms, words in Site settings → Enquiry forms: **question** (pop-up from every `/enquire` link, and the `/enquire`
  page), **proposal** (Retreats & events) and **intake** (`/welcome`, with a consent tick for health information).
- They post to **`/api/enquire`**, handled by `worker/index.ts` (the only server code). It checks the site, a hidden spam
  trap and Turnstile (when set), then emails the answers through **Resend** with reply-to set to the sender.
- Keys are Cloudflare **secrets**, never in this public repo: `npx wrangler secret put RESEND_API_KEY`, `ENQUIRY_TO` (the
  inbox), optional `TURNSTILE_SECRET_KEY` and `ENQUIRY_FROM`.
- **None are set yet (checked 3 Nov), so forms can't send.** They show their "didn't send" message with the WhatsApp link.
- Until a sending domain is verified in Resend, its test sender only delivers to the Resend account's own email address.
  Verifying `send.chelseavaneeden.com` needs DNS records: wait for Chelsea's go-ahead.

## Analytics (Umami, cookieless)

- Loads only when Site settings → Analytics → Umami website ID is set; respects Do Not Track.
- One click tracker in `Base.astro` records what a click does: `book_intro`, `enquiry_open`, `organiser_page`,
  `whatsapp_click`, `reviews_click`, each with `from`. Forms record `enquiry_submit`. `/welcome` records `intro_purchase`.
  Funnel to watch: visit → book_intro → intro_purchase.
- The Privacy page has an on/off switch for analytics in that browser.

## The look

From Chelsea's Forest & Amber mood board: "sunrise in a forest sipping coffee". Warm linen with grain, soft honey light,
sections that melt into each other, slow and quiet movement. Never clinical, blocky or digital. No orbs, bubbles, strong
glows, dark bands or tilting on hover.

- **Fonts:** Cormorant Garamond Italic for headings, Jost for labels and body.
- **Colours:** page Linen `#F8F3EA`, words Coffee Bean `#3B2A1E`, emphasised heading words Amber `#9A5A1C`, buttons Wild
  Honey `#E2B866` (Coffee Bean with Butter words in the header), highlighted words Butter `#EFD9A0`, moss green words on
  tinted sections. All of them live in `src/styles/tokens.css`.
- **Sunrise glow:** `Sunlight.astro`, on the page headers and on `Card variant="sunrise"`.
- **Button hover:** just the colour change and a gentle glow.
- **Footer:** no links to Google reviews, YouTube or LinkedIn: Chelsea doesn't want to send people away from the site.
- **Line breaks:** pressing Enter in a CMS text field starts a new line on the page.
- **Design system:** `/styleguide` shows every token and component. The build fails if a raw colour or size appears outside
  the token files (`scripts/check-tokens.mjs`).

## Copy rules (from Chelsea)

- Never use an em dash anywhere in the site copy.
- Headings never end with a full stop (commas and ellipses are fine). An ellipsis goes inside the emphasis, so it takes the
  same amber: You're in the right place *if you…*
- Chelsea is **South African, living in Lisbon**. Never write "from Lisbon". On the 1-on-1 page, location is left out (online,
  worldwide); the organiser page says "Based in Lisbon, available across Europe and South Africa".
- She is a **BASI Comprehensive** Pilates instructor; positioning is movement for mental health.
- Keep her wording; adapt capitalisation and fix clear typos, then tell her what changed.
- Never build on assumptions about her business: ask first.

## Chelsea's to-do list (needed before launch)

1. **Stripe**: on the intro pricing table, after payment redirect to `/welcome`; set its background to the page colour
   `#F8F3EA` (it was still `#F4EEE3` on 3 Nov, so it shows as a faint box); turn off Adaptive Pricing (so checkout stays in
   euros); make a second pricing table with the monthly plans and paste its ID in Site settings; deactivate the old €300
   intro Payment Link.
2. **Booking link** for clients to pick times: Site settings → Welcome page.
3. **Resend** account (free) and an API key; **Turnstile** widget in Cloudflare (hostname: the workers.dev address, later the
   real domain); **Umami Cloud** account (free). Then set the secrets and IDs above.
4. **Google**: rating and number of reviews (Site settings → Trust line), a `g.page/r/…` review link, and permission from 3–6
   reviewers to quote them by first name.
5. **Named client quotes** (first name + city or situation) with permission.
6. Facts for the organiser page: insurance, what she brings (mats, props), group sizes, travel terms.
7. Rollover (1 or 2 sessions), personal line in About, Instagram link, business details for the privacy policy, Livro de
   Reclamações registration.
8. **Group/outdoor photos or a 30–60s teaching clip** for the organiser page.
9. **Lawyer check** of Terms and Privacy: "non-refundable" vs the EU 14-day withdrawal right, South African governing law
   while living in Portugal, retention periods.

## Open decisions (ask Chelsea)

1. **Rollover**: the terms (clause 2.3) say one unused session rolls over; the FAQ says up to 2. Clause 2.2 says packages are
   billed monthly and last one calendar month, which does not describe the single intro session: add a line for it.
2. **Monthly price**: the site says from €260 a month.
3. **Draft copy to approve**: the About rewrite, How it works, the whole organiser page, the forms, Privacy.
4. **Reply promises**: forms say "within one working day"; the organiser page promises a proposal within 48 hours.
5. **Credentials**: "5+ years" vs 6; permission for the logos in the banner.
6. **Web address**: the payment page is still `/intro-pack`.

## At launch (only on Chelsea's go-ahead)

The pipeline stays exactly the same; only the address at the end changes.

1. Add the domain to `wrangler.jsonc` and move the domain's DNS from Framer to Cloudflare.
2. Set `PUBLIC_INDEXABLE=true` in Cloudflare's build variables, so Google can see the site.
3. Change `SITE_URL` in `.github/workflows/check-website-updated.yml`.
4. Point Stripe's redirect, Turnstile's hostname and Resend's sending domain at the real domain.
5. The domain's renewal date was 17 Dec 2026 when last noted (GoDaddy): check it won't lapse.

## Older versions

Earlier designs are kept as tags in git (`archive/…`), so nothing is lost: `git tag --list 'archive/*'`.

## Testing tips

- The in-app browser pane pauses transitions and smooth scrolling when hidden. Test with `scroll-behavior: auto` or
  `transition: none` before trusting a "not moving" result.
- If the dev server shows old content (or "Missing site.yaml" after a schema change), delete `.astro/data-store.json` and
  restart it.
- Forms locally: the `worker-dev` launch configuration runs `wrangler dev` on port 8787.
