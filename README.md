# chelseavaneeden.com (new site, in progress)

Astro rebuild of Chelsea van Eeden's website. **The live site is still the Framer site at chelseavaneeden.com.
Nothing here touches that domain until Chelsea decides to launch.**

## Preview only (for now)

- Deploys go to a Cloudflare preview address: `https://chelseavaneeden-site.<account>.workers.dev`
- `wrangler.jsonc` deliberately has **no custom domain or routes**.
- Every page is marked `noindex` and `robots.txt` blocks crawlers, so the preview stays out of Google.
  At launch, set `PUBLIC_INDEXABLE=true` to switch that off.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (first time only) |
| `npm run dev` | Local preview at http://localhost:4321 |
| `npm run build` | Check the design system, then build to `dist/` |
| `npm run deploy:preview` | Build and publish to the Cloudflare preview address |
| `npm run brand:favicons` | Regenerate favicons from the logo swoosh and brand tokens |

## Design system

- `src/styles/tokens.css` is the single source of truth for colours, type, spacing and shape.
- `src/styles/typography.css` holds the named text styles (`type-display-xl`, `type-body`, …).
- `src/components/ui/` holds the building blocks; `src/components/patterns/` holds the page sections.
- `/styleguide` shows every token and component.
- The build fails if a raw colour or size appears outside the token files (`scripts/check-tokens.mjs`).
