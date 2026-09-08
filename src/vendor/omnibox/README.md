# `src/vendor/omnibox` — a TEMPORARY copy of `@immediately-run/omnibox@0.3.0`

**Delete this directory the moment the package resolves again.** It exists to end a
production outage, not to un-do R3-530.

## Why it is here

`@immediately-run/omnibox@0.2.0` shipped `dist/Omnibox.js` with `import "./omnibox.css"`.
The platform's sandbox bundler follows such a specifier out of the resolved package,
fetches the stylesheet and **evaluates it as JavaScript** — so immediately.run's front
door rendered `SyntaxError: Unexpected token '.'` and nothing else from 2026-09-06.

`0.3.0` fixes that (the stylesheet ships as a baked JS string) and is published. But the
sandbox resolves every third-party dependency through one CDN
(`sandpack-cdn-staging.blazingly.io`), whose npm mirror had not picked up `0.3.0` hours
after publish — it answers `500 "Package version not found"` while npm serves it as
`latest`. There is no second path: the cached zip carries this repo's own source and its
pre-transpiled artifacts but **no `node_modules`**, and the lockset that would let the
runtime skip live resolution is itself built by asking that same CDN, so `cache-zip`
fail-softs to `lockset: omitted`. That is [[R3-566]].

So the fix was correct, published, merged and deployed — and the door stayed shut. This
copy removes the dependency from the critical path entirely.

## What it is

`src/` of `@immediately-run/omnibox@0.3.0`, **verbatim** — deliberately not adapted, not
tidied, not merged into `src/components/`. Byte-identical to the package makes the
un-vendoring a `git rm -r` plus reverting one commit, and makes "has it drifted?"
answerable with `diff`.

Its only external needs are `react` and `@immediately-run/sdk/*` subpaths, both of which
this app already depends on and both of which the CDN resolves.

## Undoing it

1. Confirm the CDN resolves it: the `/package/` endpoint returns 200 for
   `@immediately-run/omnibox@<version>` (see R3-566 for the exact probe).
2. Restore `"@immediately-run/omnibox"` in `package.json`.
3. `git rm -r src/vendor/omnibox`, and point the five import sites back at the package —
   they were changed in exactly one commit, so `git revert` does it.
