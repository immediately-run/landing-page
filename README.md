# immediately.run — landing page

The **entire immediately.run public site**, built as one React + TypeScript + Vite
app and runnable directly on [immediately.run](https://immediately.run).

This repo is the whole site — landing, showcase, app directory, docs/agent
reference, tutorials, and changelog — as **one app with hash-routed sections**, not
a federation of per-section apps. Fork the page and you get the whole site. (The
reversal of the earlier federated model is recorded in the docs repo at
`design-briefs/landing-page/SITE_OVERVIEW.md` §5.)

## Try it instantly

Try this app on [immediately.run](https://immediately.run/present/github/immediately-run/landing-page/main/files/src/App.tsx)

## How it's organized

A persistent shell (nav, footer, theme, ⌘K search) wraps a content region; a tiny
hash router swaps the active section. No server is involved — `#/…` routes resolve
entirely in the browser, which is what immediately.run's single-entry runtime needs.

- `src/App.tsx` — root component (immediately.run's entry); imports the global CSS
  and renders the shell + the active section.
- `src/hooks/useRoute.ts` — the hash router: `#/` · `#/showcase` · `#/apps` ·
  `#/docs` · `#/tutorials` · `#/changelog`.
- `src/index.css` — fonts, theme variables, resets. `src/App.css` — shell + home layout.
- `src/components/` — the shell (Nav, Footer, Search) and the home-page sections;
  one default-exported component per file.
- `src/sections/<name>/` — each routed section (showcase, apps, docs, tutorials,
  changelog) as a self-contained component + its own namespaced CSS + typed data.
- `src/data/apps.ts` — the canonical app records; one source feeds the hero
  marquee, the showcase teaser, the showcase grid, the directory, and search.
- `src/hooks/useTheme.ts` — light/dark toggle persisted to `localStorage`.

## Develop

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev      # local dev server
npm run build    # tsc -b && vite build
npm run lint     # eslint (enforces the React Fast Refresh / HMR rule)
npm run preview  # serve the production build
```
