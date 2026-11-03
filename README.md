# chelseavaneeden.com

Chelsea van Eeden's website, built with Astro and hosted on Cloudflare. There is one site, one version (`main`) and one link:

**Edit:** https://app.pagescms.org/chelseavaneeden/chelseavaneeden-site/main/file/home
**See it:** https://chelseavaneeden-site.chelseavaneeden-site.workers.dev/

Each **Save** in the editor goes to GitHub, and Cloudflare publishes it by itself, usually within 2 minutes. If a save isn't
valid, the site keeps its last good version and GitHub emails Chelsea.

**The live site is still the Framer site at chelseavaneeden.com.** Nothing here touches that domain until Chelsea decides to
launch; until then this address stays out of Google.

Everything else (where each section's words live, the safeguards, the copy rules, the to-do list, launch steps) is in
[docs/SITE.md](docs/SITE.md).

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (first time only) |
| `npm run dev` | Local preview at http://localhost:4321 |
| `npm run build` | Check the design system and the CMS, then build to `dist/` |
| `npm run brand:favicons` | Regenerate favicons from the logo swoosh and brand tokens |

## Design system

- `src/styles/tokens.css` is the single source of truth for colours, type, spacing and shape.
- `src/styles/typography.css` holds the named text styles (`type-display-xl`, `type-body`, …).
- `src/components/ui/` holds the building blocks; `src/components/patterns/` holds the page sections.
- `/styleguide` shows every token and component.
