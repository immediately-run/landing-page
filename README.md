# TINKER — landing page

The TINKER marketing landing page, built as a React + TypeScript + Vite app and
runnable directly on [tinkerable.site](https://tinkerable.site).

## Try it instantly

Try this app on [tinkerable.site](https://tinkerable.site/present/github/neumark/landing-page/main/files/src/App.tsx)

## How it's organized

This started as a single `index.html` design mockup and was converted to a
Tinkerable-compatible app following
[`tinkerable-docs/specs/DESIGN_TO_TINKERABLE.md`](../tinkerable-docs/specs/DESIGN_TO_TINKERABLE.md):

- `src/App.tsx` — root component (Tinkerable's entry); imports the global CSS.
- `src/index.css` — fonts, theme variables, resets. `src/App.css` — layout/components.
- `src/components/` — one default-exported component per section.
- `src/data/` — showcase / docs / news content as typed arrays.
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
