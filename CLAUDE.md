# Working on this site

Read [docs/SITE.md](docs/SITE.md) first. It has where every section's words live, the copy rules and the to-do list.

## One site, one version, one link

CMS (Pages CMS) → `main` on GitHub → Cloudflare builds it → https://www.chelseavaneeden.com/ (live since 10 Nov 2026)

chelseavaneeden.com and the old workers.dev address forward pages to www (`worker/index.ts`); `/api/*` answers on all three.

This is the rule Chelsea asked for after the CMS and her preview link showed two different sites (3 Nov 2026). Keep to it:

- **Work on `main`, and pull first.** Her CMS saves land on `main`, so run `git pull --ff-only` before changing anything. Git
  refuses a push that would overwrite her saves; if that happens, pull and try again, never force.
- **Publishing is pushing to `main`.** Cloudflare does the rest. Commit and push once the change is checked. Confirm it with
  `curl <link>/version.txt`, which should show the commit you pushed.
- **Never publish by hand and never create preview links:** no `wrangler deploy`, no `wrangler versions upload`, no
  `--preview-alias`, and `preview_urls` stays `false` in `wrangler.jsonc`. A second link is how the mismatch started.
- **Don't keep work on other branches.** A short-lived branch is fine for a risky change as long as it's merged or deleted the
  same day, and Chelsea knows the CMS doesn't edit it.
- **New design ideas:** PNG mock-ups or the dev server in the browser pane, not a second version of the site.
- **New content:** add it to `src/content.config.ts` and `.pages.yml` together. The build stops if they disagree. Wording on the
  site belongs in the CMS, not in a page's code, so she can always change it herself.

## Design skills

General design skills are switched on for this project only, by links in `.claude/skills` to `../skills` (on this Mac, not
in the public code). They're someone else's general guidance, so they never override this project. When they disagree,
follow in this order: Chelsea's own words, this file and `docs/SITE.md`, the design system (`src/styles/tokens.css`), then
the skill. Never let a skill change her fonts, colours, layout or copy unless she asks. Left off on purpose:
`client-update` (carries another studio's branding), `framer-marketplace` and `design-to-react` (don't apply to this site).

## Don't touch without her go-ahead

- chelseavaneeden.com's DNS (never touch the email records: MX, SPF, DKIM, MailerLite), the domain routes in
  `wrangler.jsonc`, or Framer.
- `PUBLIC_INDEXABLE` in `.env.production` (true since launch; false hides the site from Google).
- Her Stripe account.

## Copy

No em dashes. Headings never end in a full stop. Keep her wording, and ask rather than assume anything about her business.
