# `src/vendor/omnibox` — a TEMPORARY copy of `@immediately-run/omnibox@0.4.0`

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

`src/` of `@immediately-run/omnibox`, **verbatim** — deliberately not adapted, not
tidied, not merged into `src/components/`. Byte-identical to the package makes the
un-vendoring a `git rm -r` plus reverting one commit, and makes "has it drifted?"
answerable with `diff`.

**Tracking `0.4.0`, not `0.3.0` (2026-09-09, R3-570).** Two changes landed here and
upstream as the same edit, in the same shape, so `diff -rq omnibox/src
landing-page/src/vendor/omnibox` reports only the upstream test files and this README:

- the accessibility fix for the unnamed submit button (R3-570 — the reason for the bump);
- the stylesheet-injector's warning one-shot, which this copy had carried alone since
  `e95c692` and which upstream lacked. Un-vendoring before that went upstream would have
  reverted it, which is exactly the drift the byte-identity rule exists to catch — the
  rule is being honoured here, not excepted.

Un-vendor against **0.4.0 or later**; against 0.3.x you would reintroduce both.

Its only external needs are `react` and `@immediately-run/sdk/*` subpaths, both of which
this app already depends on and both of which the CDN resolves.

## Undoing it

1. Confirm the CDN resolves it: the `/package/` endpoint returns 200 for
   `@immediately-run/omnibox@<version>` (see R3-566 for the exact probe), and that the
   version is **≥ 0.4.0** — see the note above.
2. Restore `"@immediately-run/omnibox"` in `package.json`.
3. `git rm -r src/vendor/omnibox`, and point the **six** import sites back at the package.
   Five were changed in one commit, so `git revert` does those; the sixth,
   `src/components/SiteOmnibox.test.tsx`, arrived later (R3-570) and the revert does not
   reach it. It imports from this barrel like the other five, so it is a one-line edit —
   `RUN_LABEL` is exported from `index.ts` precisely so that no site has to deep-import a
   module the package's `exports` map does not publish.
