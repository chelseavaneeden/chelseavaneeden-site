# chelseavaneeden.com (new site, in progress)

Astro rebuild of Chelsea van Eeden's website. **The live site is still the Framer site at chelseavaneeden.com.
Nothing here touches that domain until Chelsea decides to launch.**

## Preview only (for now)

- Deploys go to a Cloudflare preview address: `https://chelseavaneeden-site.<account>.workers.dev`
- `wrangler.jsonc` deliberately has **no custom domain or routes**.
- Every page is marked `noindex` and `robots.txt` blocks crawlers, so the preview stays out of Google.
  At launch, set `PUBLIC_INDEXABLE=true` to switch that off.

## Editing content (no code needed)

- Editor: **https://app.pagescms.org**. Sign in with GitHub and open `chelseavaneeden/chelseavaneeden-site`.
- Sections: Home page, Service pages, Offers & prices, Testimonials, Site settings.
- Each **Save** is stored on GitHub, and Cloudflare rebuilds the preview automatically (about 1–2 minutes).
- If an edit is invalid (e.g. a "From" price with no number), the build stops and the preview keeps the last good version.
- Content files live in `src/content/`; the editor's fields are configured in `.pages.yml`.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (first time only) |
| `npm run dev` | Local preview at http://localhost:4321 |
| `npm run build` | Check the design system, then build to `dist/` |
| `npm run deploy:preview` | Build and publish to the preview by hand (normally automatic on every push to `main`) |
| `npm run brand:favicons` | Regenerate favicons from the logo swoosh and brand tokens |

## Design system

- `src/styles/tokens.css` is the single source of truth for colours, type, spacing and shape.
- `src/styles/typography.css` holds the named text styles (`type-display-xl`, `type-body`, …).
- `src/components/ui/` holds the building blocks; `src/components/patterns/` holds the page sections.
- `/styleguide` shows every token and component.
- The build fails if a raw colour or size appears outside the token files (`scripts/check-tokens.mjs`).
