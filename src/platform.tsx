// The entry immediately.run runs (`package.json` → `main`). NOT the `vite dev`
// entry — that is `src/main.tsx`, reached through `index.html`, and it must stay
// SDK-free (see below).
//
// Why this file has to exist at all. The platform resolves an app's entry from
// `package.json` (`main`/`source`/`module`, then the preset defaults). With none
// of them present, this repo had no entry, so the host fell through to the SDK's
// DEFAULT_ROUTING_SPEC — `/` → `MainContent`, `/files/*` → `FileRouter`, and
// **everything else → ErrorNotFound**. `MainContent` then redirects `/` to
// `/files/src/App.tsx`, so the site rendered as a FILE VIEW of its own root
// component and never owned a path space at all. Every deep link 404'd
// (`No route registered for path /docs/start/overview`), which made the whole
// path-routing design inert in the one environment it was written for.
//
// `boot({ children })` is the fix, and deliberately not `boot({ routingSpec })`:
// given children, the SDK installs CATCH_ALL_ROUTING_SPEC — any `sandboxPath`
// matches — and renders them inside the navigation providers. Dispatch stays
// where it already lives, in `useRoute`/`parseRoute`, rather than being split
// across a host route table and the app's own router that would then have to
// agree with each other.
//
// The `vite dev` split is the reason this is a separate file rather than a
// branch inside `main.tsx`: importing the SDK's `boot` reaches for the host
// transport at module load, which throws outright when there is no host. Keeping
// the two entries apart means neither environment loads the other's imports.
import { boot } from '@immediately-run/sdk/boot';
import App from './App';

boot({ children: <App /> });
