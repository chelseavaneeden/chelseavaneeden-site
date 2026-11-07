# Pilates booking funnel conversion

Research for Chelsea van Eeden, 7 November 2026. Question: should new clients pay first and book a time afterwards, or
pick a time first and pay as part of booking? And more broadly, what turns more website visitors into paying clients,
then into monthly clients?

## The short answer

**Pick a time first, then pay in the same step.**
- **Nobody has tested it directly.** No study compares the two orders for appointments.
- **The indirect evidence agrees:**
  - Every major booking tool works this way.
  - Commitment fades as the gap between paying and the session grows.
  - "Paid but not booked" clients need chasing, expiry rules and refunds.
  - Paid bookings have the fewest no-shows.

**Chelsea's Google Workspace (Business Standard) can do this.** Her Google Calendar booking page takes payment through
her Stripe, so the client picks a slot and pays in one go.

**Her €55 paid intro fits the evidence.** The biggest lever after booking is what happens at the end of that first
session.

How strong each finding is: *Data* means studies or platform statistics. *Vendor* means claims by software companies,
usually without a method. *Opinion* means practitioners and experts.

## 1. Pay first, or book first?

- **The booking tools all put payment inside the booking step** (Calendly, Acuity, Square, Google appointment schedules).
  - Clients see real availability, then pay, and the payment confirms the slot.
  - Pay-first, schedule-later is how packages and gift cards work (Acuity uses codes).
  - Sources: Calendly payments FAQ; Acuity help centre; Square Appointments.
- **Commitment fades after paying.** *Data*
  - The longer the delay between paying and using what you paid for, the weaker the pull to use it (Gourville and Soman,
    "Payment Depreciation", Journal of Consumer Research, 1998).
  - Paying moments before choosing a slot keeps the commitment fresh. Paying weeks before booking lets it fade.
- **Paying up front means fewer no-shows.** *Data, from restaurants rather than fitness, reported by Tock's founder in
  2017*
  - Under 1% when paid in full.
  - About 3.7% with a deposit.
  - About 8% when free.
  - A fee charged after a missed visit or a card kept on file works less well. Two clinic studies (Switzerland, 2007 and
    2010) found a missed-appointment fee didn't raise attendance.
- **Surprises and hurdles lose people at checkout.** *Data* Baymard surveyed 1,012 US adults (2024):
  - 48% abandoned because of unexpected extra costs;
  - 26% because they had to create an account.

  Showing the full price and what's included before the calendar avoids both.
- **Pay-first creates a group of clients to manage.** *Opinion and examples* Businesses that sell sessions to schedule
  later all need rules for paid clients who never book: reminders, expiry dates and refunds. EU rules on cancelling a
  service bought online may also apply to a paid session that hasn't been booked yet.

## 2. Booking tools that take payment

| | Google (Business Standard) | Calendly | Cal.com | Acuity |
|---|---|---|---|---|
| **Pick a time and pay** | Yes, through Stripe; card, Apple Pay, Google Pay | Yes, Stripe or PayPal, paid plan | Yes, Stripe | Yes, Stripe, Square or PayPal |
| **Extra cost for Chelsea** | None, already included | About $10/month | Free plan includes Stripe | $20–69/month |
| **Packages / monthly** | No | Private beta | Not confirmed | Yes, from Standard |

**What Google's booking page can do:**
- a buffer, minimum notice (4 hours by default) and a daily limit;
- custom questions on the booking form;
- up to 5 reminders;
- Google Meet added automatically;
- an inline embed on a website;
- no Google account needed for clients.

**Its limits:**
- Refunds are done by hand in Stripe.
- The reminder wording can't be changed.
- There's no documented way to send people back to a website after booking.
- Its checkout doesn't collect a billing address, VAT number or discount code.
- It hasn't been updated since July 2023.
- It can't sell monthly plans, so those stay as a Stripe subscription.

Sources: Google Workspace Admin Help and Calendar Help (2026); Google Developer forum (2026); vendor pricing and help pages.

## 3. The first step: paid intro, free call, or credited intro?

**No study compares these for 1-on-1 movement work.** The evidence comes from in-person gyms and studios, mostly
reported by software vendors and business coaches.

- **A consultation that ends with a prescribed plan closes far better than a "try a workout" trial.** *Opinion* Gyms
  coached by Two-Brain report:
  - 70–80% close rates for consults, against under 30% for free trials (2025);
  - clients from consults staying about 23 months, against 8 for free trials.
- **Free bookings lose many people.** *Opinion* Up to half of free consult bookings don't show, especially from cold
  traffic (Two-Brain, 2023).
- **Paid intros convert better than free trials.** *Vendor*
  - Studios convert 30–40% of intro clients to membership.
  - Multi-visit intros do better than single ones. Clients average about 5 visits before converting, and retention is
    above 90% after visit 5 (Mariana Tek, 2025).
  - Mindbody reports better 90-day retention for clients who came through an intro offer (2026).
- **Real examples** (12 Pilates businesses). Most small studios offer a free 15-minute call, then a starter bundle or a
  monthly plan, and all show their prices. None credited the intro fee towards a package.
- **Pricing.** €260 a month sits right next to a comparable UK studio's £269 a month for once a week.

**What this means for Chelsea:**
- The €55 assessment that ends with a plan fits the evidence.
- Its weak spot is that it's a single visit. So the monthly offer belongs at the end of the session, then in a follow-up
  email.
- "Intro credited if you start within 7 days" is worth trying, but there is no data on it.

## 4. What else turns visitors into clients

Ranked by likely impact.

1. **Reviews people can check, right beside the button.** *Data*
   - Five reviews raise purchase likelihood by 270% against none, and more for higher-priced items.
   - The benefit flattens after about five reviews.
   - Ratings around 4.0 to 4.7 convert best (Spiegel Research Center).
   - In practice: show Google stars and the review count near "Book your Session", and first-name quotes with context
     (with permission).
   - EU rules (the Omnibus Directive) ask businesses that show reviews to say how they check them.
2. **Fast replies to questions.** *Data, from business-to-business sales, 2011* Leads answered within an hour were about 7
   times more likely to go ahead (HBR). Saying the reply time next to WhatsApp sets the expectation.
3. **Fewer steps and wallet payments.** *Data*
   - Offering Apple Pay lifted conversion 10–22% in Stripe's tests.
   - Google's booking checkout supports Apple Pay and Google Pay. They need to be switched on in Stripe.
4. **Show the price.** *Data* People see hidden prices as evasive and leave for competitors (NN/g). The site already shows
   €55 and what's included, plus what monthly costs.
5. **Show real availability.** *Vendor* Online booking is claimed to lift bookings. The size of the lift isn't proven, but
   the direction is consistent.
6. **A reschedule line under the button.** *Opinion* Low risk. No hard data.
7. **Avoid fake urgency.** EU rules ban false "limited time" or "only 2 left" claims (Unfair Commercial Practices
   Directive). The Commission found manipulation on 148 of 399 shops in 2023.
8. **Follow up with people who aren't ready.**
   - Stripe's abandoned-checkout emails only work for US businesses.
   - The realistic route is an email signup with opt-in, such as a free YouTube starter series, then a short MailerLite
     series.

**Benchmark.** *Data* The median landing-page conversion across industries is 6.6% (Unbounce, 2024). That counts any form
or click, so paid bookings from a whole site will be much lower. There's no published benchmark for those.

## 5. What to measure

Traffic is too small for A/B tests. Detecting a lift from 2% to 3% bookings needs about 7,800 visitors. So:
- Track one funnel in Umami each month: visits → "Book your Session" clicks → "See available times" → paid bookings
  (Stripe or MailerLite) → intake forms sent.
- Change one thing at a time and compare 4-week periods.
- Ask each new client what nearly stopped them.

## What was built from this (7 Nov)

1. The intro page shows the price and what's included, then **See available times**, which opens Chelsea's Google booking
   calendar on the page. The client picks a time and pays in the same step.
2. A paid booking adds the client to MailerLite (Private Pilates). That sends "You're booked in" with a link to the intake
   form, and gentle reminders only if it isn't sent.
3. The shorter intake form is saved in Notion, followed by an "All set" email with how to prepare.
4. The gaps found here (named reviews and Google stars, the monthly offer at the end of the intro, an email signup for
   people who aren't ready) are next steps, not part of this build.
