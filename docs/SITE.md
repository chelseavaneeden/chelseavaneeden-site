# The site: how it works and where everything lives

There is **one site, one version and one link**:

```
Pages CMS  →  main on GitHub  →  Cloudflare builds it  →  www.chelseavaneeden.com
```

- Edit: https://app.pagescms.org/chelseavaneeden/chelseavaneeden-site/main/file/home
- See it: https://www.chelseavaneeden.com/ (**live since 10 Nov 2026**, Chelsea's go-ahead). The Framer site is retired.
- chelseavaneeden.com and the old address (chelseavaneeden-site.chelseavaneeden-site.workers.dev) forward every page to
  www for good (301, `worker/index.ts`), so old links and emails still land. `/api/*` answers on all three addresses, so the
  Stripe webhook and the forms keep working wherever they point.
- Google may index the site: `PUBLIC_INDEXABLE=true` in `.env.production`. Every public page has a canonical tag with its
  www address; `/sitemap.xml` lists the public pages (add new ones in `src/pages/sitemap.xml.ts`) and `robots.txt` names it.

## How a change gets published

A save in the CMS, or a code change pushed to `main`, is all it takes. Cloudflare builds and publishes the site
by itself, usually within a few minutes (longer when Cloudflare is busy). There is nothing to upload by hand.

## What stops the site and the CMS drifting apart

| Safeguard | What it does |
|---|---|
| One branch, one link | `main` is the only branch, so the CMS can't open the wrong version. Preview links are switched off (`preview_urls: false` in `wrangler.jsonc`), so no old version can be mistaken for the site. |
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
- **`/retreats-events` is for event organisers and teams.** One action: Request a proposal. Brand rates stay private
  for now (Chelsea, 8 Nov), so the page and its form don't mention brands. This is the link for
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
Order since 8 Nov (Chelsea): header, Hi I'm Chelsea, credentials, logo banner, Perfect for retreats that, Shall we begin?
(one price card), How it works, Request a proposal, Good to know (with a Request a proposal button back to the form). On
phones a quiet "Request a proposal" button stays at the bottom of the screen (`StickyCta.astro`), hidden at the form and
the footer. Research and next steps: `reports/Retreat and brand page layout.md`. She hasn't taught a retreat yet, so
never imply she has.

**Where I've taught** was taken off the page (Chelsea, 8 Nov). The section still exists in the CMS (Retreats & events
page → Where I've taught) and shows again as soon as it has at least one card. Its last wording, if she wants it back:
Arc Movement Studio, Cape Town (full-time Pilates instructor, 2021 to 2023); Hourglass Pilates, Cape Town (guest
instructor in 2025, teaching the owner's group and private Reformer classes); Private online Pilates, worldwide
(full-time Pilates instructor, 2021 to present). Rates exclude travel and accommodation (the organiser pays); the venue
provides mats and props.

**One price card only** (Chelsea, 8 Nov): no visible title (hidden title "Pilates for your event"), the line "For events,
retreats and corporate teams.", **From €150 / session**, and "Workshops, longer days and retreats are quoted to your plan."
Research (8 Nov, kept on her Mac) found every comparable listing prices one class per session; "/ day" would read as a whole
day for €150. Events are personalised and rates are discussed, so the detailed formats and rates live only in her
one-page PDF, never in this public repo. The card is Offers & prices → Pilates for your event (Who it's for = Retreats &
Events, highlighted so it gets the sunrise glow and the yellow button); its heading is the same "Shall we begin?" as the
home page (Retreats & events page → Prices section). A single card without a photo uses the wide layout from tablets up:
what's included on the left, the line, price and button on the right (swapped, Chelsea 8 Nov); on phones the line
and price come first and the button last.

**How it works** (8 Nov): no intro line (Chelsea removed it), and four steps that each say what the organiser
gets and when: Tell me about your event (a short free call if easier), Your proposal (within 2 working days, one clear
price), Your plan for the day (a one-page plan with timings, space, mats and props, a health note, an indoor option),
On the day, and after (arrive early, every level, take-home moves). Chelsea approved these promises; keep the reply time
identical in the steps, the form intro and the FAQ. `StepList.astro` shows them as a calm timeline: large amber 01 to 04
numerals on a fine line with a small amber point.

Hi, I'm Chelsea and the logo banner are shared with the home page, so they are edited in one place (Home page).

### When fully booked (waitlist)

Untick **Site settings → Availability → Accepting new clients** (Chelsea, 14 Nov): the badge shows the waitlist message,
and every **Book your Session** button (menu, home page, offer card, closing card, phone button, footer link) and **See
available times** on the booking page become **Join waitlist** (the label is in the same place). They link to
`/waitlist`, which opens the waitlist form as a pop-up (`EnquiryDialog.astro`, alongside the question form; the
`/waitlist` page is the fallback, not in search). The form: Name, Email, WhatsApp and Country / state (both optional), in
**Enquiry forms → Waitlist form**. It emails Chelsea "Waitlist sign-up: name" (reply goes to the person). One rule does the
buttons: `Button.astro` swaps any button that links to the Book button's address; `BookingButton.astro` and the footer
do the same.

### The intro session path

The first step is a single **Intro Session at €55** (since 3 Nov). The page's address is still `/intro-pack`.

Chosen on 7 Nov after research (`reports/Pilates booking funnel conversion.md`): **pick a time first, then pay in the same
step**, in Chelsea's Google Calendar booking page (Business Standard includes paid bookings through her Stripe).

1. Every **Book your Session** goes to **`/intro-pack`**: the heading, then the €55 card with what's included and a big
   **See available times** button inside it (`BookingButton.astro`), which opens her Google booking page in a **pop-up
   window** over the site (Chelsea's choice, 13 Nov; `openBookingWindow()` in `src/lib/booking.ts`). Picking a time and
   paying both happen in that window, and closing it shows the site again; phones open it as a new tab with the site
   behind. If the browser blocks the pop-up, the button opens Google's page in the same tab. It can't be embedded in
   the page: with payments on, Google moved embedded bookings to a new tab where people had to pick their time again
   (tested 11 Nov), and only a booking system of our own could take payment on the site itself. Then the short-form line and the
   three steps. No trust line on
   this page (Chelsea, 8 Nov). Words and the booking page link: Site settings → Intro session page. Until the link is set,
   the old intro-only Stripe table shows instead.
2. The client picks a time, pays (Stripe inside Google) and gets Google's confirmation with the Meet link.
3. Stripe tells the site (**`/api/stripe-webhook`**, `worker/stripe.ts`), which adds the client to MailerLite: group
   **Private Pilates**, field `intro_paid` = today. That starts the automation **"Intro session: next steps"**: "You're
   booked in" with a button to the intake form, then a reminder after 12 hours and "Can I help?" 36 hours later, each only
   if `intake_done` is still empty. Existing subscribers (e.g. Good Mood Club members) go through it like anyone else.
   **Someone who once unsubscribed** (or bounced) can't be added: MailerLite refuses without re-subscribing them, which
   we never do, since it would send them newsletters again (Chelsea, 13 Nov). Instead Chelsea gets an email with their
   name, address and the intake link to send herself (reply goes to the client), and her intake notice later reminds her to
   send the preparation details too. Found with Chelsea's own test booking, whose Gmail was unsubscribed.
4. **`/welcome`** is the intake page (noindex) the email links to (`/welcome#intake`). The form is saved as a page in
   Notion (**Private clients → Client intake**), MailerLite gets `intake_done` = today (automation **"Intro session: all
   set"** sends the preparation email, and the reminders stop), and Chelsea gets a short email with the Notion link, never
   the health answers. If Notion fails, that email carries the answers instead.
5. **`/monthly-plans`** is for existing clients only: noindex, linked from nowhere. It needs a second pricing table with the
   monthly plans; until its ID is set it shows a message with ways to get in touch.

## Forms (email, not WhatsApp)

- Three forms, words in Site settings → Enquiry forms: **question** (pop-up from every `/enquire` link, and the `/enquire`
  page), **proposal** (Retreats & events) and **intake** (`/welcome`, with a consent tick for health information).
- The send button is always active. If something is missing it says so beside the button ("Still needed: Email · …"),
  turns those questions brick red and moves to the first one. Never go back to a disabled button with no explanation.
- A tap-to-choose question can be optional ("Must be answered" in the CMS). "When?" and "Group size" on the proposal form
  are, so organisers who don't know yet can still send. Unanswered ones are left out of the email.
- Fields come in order after name and email and can be one line, several lines, a date, a phone number or tap-to-choose
  buttons (one answer, or several with "Can tap more than one"). Required tick boxes take a link written as [Terms](/terms).
- The intake field ids (birthday, phone, location, emergency, pain, goals, equipment) decide which Notion column an answer
  fills (`worker/notion.ts`). Every answer also goes in the Notion page, so new questions arrive without code changes.
  Equipment is "tap all that apply" (Mat, Reformer, Other) since 10 Nov; its Notion column is the multi-select
  "Equipment" (the empty "Mat or Reformer (old)" column can be deleted by Chelsea).
- **"Other" opens a box** (10 Nov): in a tap-to-choose question, an option called Other opens a "Tell me more" box
  (wording: Site settings → Enquiry forms → Label for the box under Other). What they type is sent as its own answer,
  e.g. "Your goals (other)", so it lands in the Notion page and not as a new option in the columns.
- The intake form has no WhatsApp line and no reply-time or privacy line under its button (Chelsea, 10 Nov); the
  question and proposal forms keep both.
- **After sending, only the thank-you shows** (Chelsea, 10 Nov): the form and its heading and intro are hidden on every
  form. A page marks the heading block with `data-form-intro` inside a `data-form-scope`; the pop-up's own title has it
  too, and the pop-up brings everything back when it closes.
- They post to **`/api/enquire`** (`worker/enquire.ts`). It checks the site, a hidden spam trap and Turnstile (when set).
  Question and proposal answers are emailed through **Resend** with reply-to set to the sender; intake goes to Notion.
- Keys are Cloudflare **secrets**, never in this public repo (Cloudflare → Workers → chelseavaneeden-site → Settings →
  Variables and secrets): `RESEND_API_KEY`, `ENQUIRY_TO` (the inbox), `MAILERLITE_API_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `NOTION_TOKEN`, optional `TURNSTILE_SECRET_KEY` and `ENQUIRY_FROM`. The MailerLite group and Notion database IDs are
  plain `vars` in `wrangler.jsonc`.
- **All set (8 Nov):** `STRIPE_WEBHOOK_SECRET`, `MAILERLITE_API_KEY`, `NOTION_TOKEN`, `RESEND_API_KEY`, `ENQUIRY_TO`, all
  as Secrets ("Value encrypted"). Never add a key as a plain Variable, and never paste one into `wrangler.jsonc` (the code
  is public), whatever Cloudflare's yellow "update your Wrangler configuration" banner suggests.
- **Accounts:** Resend is a separate free account under chelsea@chelseavaneeden.com (her other Resend account is The Good
  Mood Club's). Without a verified domain, Resend only delivers to that account's own address, which is `ENQUIRY_TO`.
- The server code has tests with stand-in replies (signature check, paid and ignored payments, intake to Notion, fallbacks):
  `npm run test:worker` after any change to `worker/`.
- **MailerLite only sends from an authenticated domain.** The account's default sender is a Gmail address (sender name
  "The Good Mood Club", domain thegoodmood.club is authenticated for her other emails). chelseavaneeden.com was added as a
  second sending domain on 7 Nov and authenticated the same day; the intro emails send from chelsea@chelseavaneeden.com.
- **Only one SPF line** on chelseavaneeden.com (`v=spf1 include:_spf.mlsend.com include:dc-aa8e722993._spfm… ~all`). Never
  add a second one: edit that line. The `dc-aa8e722993._spfm` record holds Google's part; keep it.
- Until a sending domain is verified in Resend, its test sender only delivers to the Resend account's own email address.
  Verifying `send.chelseavaneeden.com` needs DNS records: wait for Chelsea's go-ahead.

## Analytics (Umami, cookieless)

- Loads only when Site settings → Analytics → Umami website ID is set; respects Do Not Track.
- One click tracker in `Base.astro` records what a click does: `book_intro`, `enquiry_open`, `organiser_page`,
  `whatsapp_click`, `reviews_click`, each with `from`. Forms record `enquiry_submit`. The booking button records
  `see_times`; `/welcome` records `intake_open`. Paid bookings show in Stripe and MailerLite (Private Pilates).
  Funnel to watch each month: visits → `book_intro` → `see_times` → paid → `enquiry_submit` (intake). Traffic is too
  small for A/B tests: change one thing at a time and compare 4-week periods.
- The Privacy page has an on/off switch for analytics in that browser.

## The look

From Chelsea's Forest & Amber mood board: "sunrise in a forest sipping coffee". Warm linen with grain, soft honey light,
sections that melt into each other, slow and quiet movement. Never clinical, blocky or digital. No orbs, bubbles, strong
glows, dark bands or tilting on hover.

- **Fonts:** Libre Baskerville at weight 450 for headings, upright with italic only for the amber words, and Jost for
  labels and body. Chelsea chose it on 3 Nov for legibility: the old Cormorant Garamond Italic had short lowercase letters
  and an "&" that read like an E. Don't set whole headings in its italic, because that "&" is ornate and harder to read.
  It's a variable font, so the weight can be changed in `tokens.css` (`--display-weight`, 400 to 700).
- **Colours:** page Linen `#F8F3EA`, words Coffee Bean `#3B2A1E`, emphasised heading words Amber `#9A5A1C`, buttons Wild
  Honey `#E2B866` (Coffee Bean with Butter words in the header), highlighted words with a see-through honey highlighter
  stroke, soft on every edge (`--highlighter`), moss green words on tinted sections. All of them live in
  `src/styles/tokens.css`.
- **Sunrise glow:** `Sunlight.astro`, on the page headers (butter and honey from the top right, a soft honey glow in the
  lower left; no green in the headers, Chelsea 13 Nov) and on `Card variant="sunrise"`. Made more vibrant on 12 Nov at Chelsea's request, as were the
  golden and sage section washes; the film grain went from 0.16 to 0.12 so the colours read cleaner.
- **Button hover:** just the colour change and a gentle glow.
- **Footer:** no links to Google reviews, YouTube or LinkedIn: Chelsea doesn't want to send people away from the site.
- **Keep people on the site (Chelsea, 8 Nov):** open things in a pop-up on the page wherever possible, never a needless new
  tab. The question form (`EnquiryDialog.astro`, every link to /enquire) and the Google reviews (`ReviewsDialog.astro`, every
  link to the address in Site settings → Google reviews pop-up, once at least one review is added) open as pop-ups; the
  booking page opens in a pop-up window over the site (it can't sit inside the site, see the intro session path). Only links that have to leave the site open a new tab (WhatsApp, Instagram,
  the complaints book), so the site stays open behind them. One rule decides this for every component: `newTabRule()` in
  `src/lib/content.ts`. The reviews in the pop-up are pasted in by Chelsea, exactly as written on Google.
- **Line breaks:** pressing Enter in a CMS text field starts a new line on the page.
- **Legibility floor (audit, 4 Nov):** no text under 14px; form field and choice outlines use `--line-control` (about
  4:1, the guideline is 3:1); phone tap targets reach 44px, using the invisible `tap-area` utility where the look must stay
  the same. Tap areas on the footer links apply on phones only. Inline links in running text are exempt.
- **Forms on paper:** every form sits on `Card variant="paper"`: warm paper `#FFFDF9` (`--surface-paper`) lifted above the
  film grain (`--z-paper`), with the header above it (`--z-header`), so the words read crisply (Chelsea, 7 Nov). Fields
  and chips use the same paper. A paper card only clears the grain if nothing around it makes its own layer.
- **No single word on its own line** (Chelsea, 8 Nov: "never, ever on the website"). `src/middleware.ts` runs
  `src/lib/no-orphans.ts` on every page as it's built: it joins the last three words of every piece of text with
  non-breaking spaces (two in big headings, fewer when the words are long), so CMS wording is covered too. Headings use
  `text-wrap: balance` and body text `pretty` as well. Under every form, the WhatsApp line comes first, then the reply
  promise and privacy line.
- **Pausing motion:** `MotionToggle.astro`, a small button on the hero video and the logo band. Either one pauses the video,
  the logos and the sun rays, and the choice carries across pages in that browser. It's hidden when the device asks for
  reduced motion, since nothing moves then. New looping animations need `data-ambient` so the button stops them too.
- **Link previews:** `Base.astro` adds them to every page. The picture is Site settings → Picture for shared links, cropped
  to 1200×630.
- **Videos:** keep hero videos around 2 Mbit/s and 720p, about 1 to 1.5 MB. Visitors with data saver on get the poster only.
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

1. ~~**Google Calendar** intro booking page~~: done 7 Nov ("Intro 1-on-1 Session", 55 min, €55, Meet); its link is in
   Site settings → Intro session page.
2. **Stripe**: intro bookings are paid into a **separate Stripe account Google created** ("Chelsea van Eeden · Google
   Calendar"), not her main one. ~~Webhook~~ done 7 Nov in that account (events `checkout.session.completed` and
   `charge.succeeded`, secret in Cloudflare). ~~Receipts on, branding (logo-email.png, icon-square.png, brand
   #F8F3EA, accent #E2B866), Adaptive Pricing off~~ done 8 Nov in that account. In the main account: a second pricing table with the monthly
   plans (paste its ID in Site settings); deactivate the old €300 intro Payment Link.
3. **MailerLite**: ~~domain, sender, emails, API key~~ done 7–8 Nov (chelseavaneeden.com authenticated; the four intro
   emails send as Chelsea van Eeden <chelsea@chelseavaneeden.com>, designed by Chelsea). ~~Switch on "Intro session: next
   steps" and "Intro session: all set"~~ done 10 Nov, after Chelsea fixed the email copy and button colours.
4. ~~**Notion**~~ done 8 Nov: connection "Website intake" (API token, read + insert content), token refreshed and in
   Cloudflare as a Secret, connected to the Private clients page.
5. ~~**Resend**~~ done 8 Nov: a separate free account under chelsea@chelseavaneeden.com (no domain needed, notices go to
   that inbox), `RESEND_API_KEY` and `ENQUIRY_TO` in Cloudflare. The intake path was tested end to end on 8 Nov (Notion
   page, MailerLite intake_done, notice email all arrived; test records deleted). Still to do: a real test booking (pay
   and refund) to confirm the Stripe → MailerLite step. Also: **Turnstile** widget in Cloudflare (hostnames: the workers.dev address and both
   chelseavaneeden.com addresses). Order matters: the site key goes into Site settings first and is published, then
   `TURNSTILE_SECRET_KEY` goes into Cloudflare, because with only the secret set every form would be refused.
   ~~Done 10 Nov~~ (widget "Website forms", Managed, three hostnames; site key in Site settings; secret in Cloudflare).
   The check is at least 300px wide, so on narrow cards `EnquiryForm.astro` scales it down to fit.
   ~~**Umami Cloud**~~ done 10 Nov (website ID in Site settings, visits arriving).
6. **Google**: rating and number of reviews (Site settings → Trust line), a `g.page/r/…` review link, and permission from 3–6
   reviewers to quote them by first name.
7. **Named client quotes** (first name + city or situation) with permission.
8. Facts for the organiser page: insurance, what she brings (mats, props), group sizes, travel terms.
9. Rollover (1 or 2 sessions), personal line in About, Instagram link, business details for the privacy policy, Livro de
   Reclamações registration (Chelsea took the footer link off on 10 Nov; add it back under Site settings → Legal links
   once she's registered).
10. **Group/outdoor photos or a 30–60s teaching clip** for the organiser page.
11. **Lawyer check** of Terms and Privacy: "non-refundable" vs the EU 14-day withdrawal right, South African governing law
   while living in Portugal, retention periods.

## Open decisions (ask Chelsea)

1. **Rollover**: the terms (clause 2.3) say one unused session rolls over; the FAQ says up to 2. Clause 2.2 says packages are
   billed monthly and last one calendar month, which does not describe the single intro session: add a line for it.
2. **Monthly price**: the site says from €260 a month.
3. **Draft copy to approve**: the About rewrite, How it works, the whole organiser page, the forms, Privacy.
4. **Reply promises**: forms say "within one working day"; the organiser page promises a proposal within 2 working days.
5. **Credentials**: "5+ years" vs 6; permission for the logos in the banner.
   The BASI logo is their official artwork with the Graduate badge traced from Chelsea's old PNG (BASI may have its own
   Graduate file). Insight Timer is their official SVG. Datchet and Elf are tracings of her old PNGs: an official file for
   Elf needs its website, and the Datchet logo says "Osteopath" while the clinic's site says "Osteopathic".
6. **Web address**: the payment page is still `/intro-pack`.

## Launch (10 Nov 2026) and what's left

Done: both addresses on the Worker (`wrangler.jsonc` routes, custom domains), Framer's DNS records for the root and www
removed (email records untouched), forwarding to www, `site` in `astro.config.mjs`, `SITE_URL` in the update check,
canonical tags, sitemap, Google allowed in. Turnstile already lists both domains.

Left for Chelsea (none of it is urgent, old addresses keep working):
1. Stripe (the Google Calendar account): change the webhook URL to `https://www.chelseavaneeden.com/api/stripe-webhook`
   (the signing secret stays the same).
2. MailerLite: the buttons in the intro emails can point to `https://www.chelseavaneeden.com/welcome#intake`.
3. Google Search Console: add the domain, submit `https://www.chelseavaneeden.com/sitemap.xml`.
4. Google Business Profile, Instagram, YouTube, email signature: link to the new site.
5. Framer: remove the custom domain from the project and unpublish; cancel the plan after a week or two.
6. Domain renewal (last noted 17 Dec 2026): check auto-renew is on.

## Older versions

Earlier designs are kept as tags in git, so nothing is lost. The CMS doesn't list them and they have no links.

| Tag | What it is |
|---|---|
| `archive/scrapbook` | The Scrapbook design |
| `archive/studio` | The Studio design |
| `archive/old-main-20-oct` | The site's main version before Forest (direction B, 20 Oct) |
| `archive/forest-exploration` | The Forest branch at the moment it became `main` |
| `archive/topography-sample` | A friend's hand-drawn topography behind the header (not chosen) |

To look at one again, ask Claude to run it on the dev server in the browser pane: it changes nothing on the site.

## Testing tips

- The in-app browser pane pauses transitions and smooth scrolling when hidden. Test with `scroll-behavior: auto` or
  `transition: none` before trusting a "not moving" result.
- If the dev server shows old content (or "Missing site.yaml" after a schema change), delete `.astro/data-store.json` and
  restart it.
- Forms locally: the `worker-dev` launch configuration runs `wrangler dev` on port 8787.
