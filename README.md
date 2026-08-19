# immediately.run — website

> **Repo rename pending.** The package is `immediately-run-website`; the GitHub repo is
> still `landing-page` and needs renaming in repo settings (GitHub redirects the old URL, so
> nothing breaks in the meantime). "Landing page" stopped describing this repo a while ago —
> it is the whole public site.

The **entire immediately.run public site**, built as one React + TypeScript + Vite
app and runnable directly on [immediately.run](https://immediately.run).

This repo is the whole site — landing, showcase, app directory, docs/agent
reference, tutorials, and changelog — as **one app**, not a federation of per-section
apps. Fork it and you get the whole site. (The reversal of the earlier federated model is
recorded in the docs repo at `design-briefs/landing-page/SITE_OVERVIEW.md` §5.)

## An app that holds corpora

The site is one app **and** two content corpora, which the platform now supports directly:

```jsonc
"immediately.run": { "content": ["docs", "tutorials"], "render": "app" }
```

`docs/` and `tutorials/` each carry an `immediately.run.json` marker, so each is a real
corpus — independently addressable at `corpus/docs/…`, and dispatchable to a stock wiki
viewer by anyone who wants the bare content. `render: "app"` is what keeps THIS repo
rendering its own shell rather than being dispatched: a repo holding corpora stays an app by
default, and saying so explicitly makes the intent readable.

**The corpora are rendered by the site itself**, not by Grove and not by dispatch. The
entries are MDX with frontmatter, statically imported and rendered with the site's own
components (`src/corpus/`) inside the site's own shell — so navigating from `#/` to
`#/docs/…` is a route change, not an app swap, and the nav, footer and ⌘K search never
unmount. Grove is available if this site ever wants the wiki vocabulary and chrome; it does
not need it to render a corpus.

**What stayed typed data, deliberately:** `src/data/apps.ts` (the app directory records) and
the changelog. Both are uniform, queried-across-the-whole-set records with no body — an MDX
file with nine frontmatter keys and an empty body is a worse spreadsheet than a typed array.
The test is whether the item deserves a page.

## The frontmatter checker

Converting `data.ts` to MDX trades the compiler for nothing unless something replaces it —
frontmatter is open by design and `useMetadataQuery<T>` is a cast, not a check, so a
mistyped key becomes a silently missing card rather than an error. `npm run check:corpora`
is the replacement: it validates every entry against the schema its own corpus marker
declares, catches literal braces in prose (the MDX gotcha whose native error is a micromark
stack trace naming no file), and emits `src/data/corpusIndex.ts`. The generator IS the
validator, so the index can never describe an entry that did not pass.

## Try it instantly

Try this app on [immediately.run](https://immediately.run/present/github/immediately-run/landing-page/main/files/src/App.tsx)

## How it's organized

A persistent shell (nav, footer, theme, ⌘K search) wraps a content region; a tiny
router swaps the active section on **real path routes** — `/showcase`, `/docs/sdk/entry`,
`/tutorials/your-first-app`.

**Not hash routes.** `SANDBOX_ROUTING_SPEC` splits an outer URL into a platform-owned prefix
(`/{mode}/{provider}/{namespace}/{repository}/{ref}`) and an app-owned `sandboxPath`, and the
host mirrors the browser location into the sandbox on every navigation. The old `#/…` router
rested on "no server to resolve sub-paths", which had stopped being true — and it cost a real
thing: a URL has exactly one fragment, the router had taken it, so a heading permalink had
nowhere to point. Now `#the-run-edit-contribute-loop` is free for what fragments are for.

Legacy `#/…` URLs still work: they redirect once, on boot, to the path spelling.

- `src/App.tsx` — root component (immediately.run's entry); imports the global CSS
  and renders the shell + the active section.
- `src/lib/routeSpace.ts` — the pure route space: parse, serialise, the legacy-hash
  translation, and the `sandboxPath` → app-path normalisation. Unit-tested; the rest of the
  router is glue.
- `src/lib/navigation.ts` — the only place that knows whether a host is present. On the
  platform an href is built with the SDK's `constructOuterUrl` and a click calls the SDK's
  `navigate()` (an app may not touch history or postMessage its own channel); locally it is
  `pushState`.
- `src/hooks/useRoute.ts` — the router: `sandboxPath` from the host context, or
  `location.pathname` in `vite dev`.
- `src/components/SiteLink.tsx` — every in-site link. Renders a real href so copy-link and
  open-in-new-tab work, intercepts the plain click so navigation stays in place.
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
npm run dev            # local dev server
npm run check:corpora  # validate corpus frontmatter + regenerate the index
npm run build          # tsc -b && vite build
npm run lint           # eslint (enforces the React Fast Refresh / HMR rule)
npm run verify         # check:corpora + no-index-drift + lint + build
npm run preview        # serve the production build
```
