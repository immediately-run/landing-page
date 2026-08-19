// The router: path-based, host-aware.
//
// Two sources of truth, one per environment, and the hook's whole job is to pick the right
// one and subscribe to it:
//
//   • on immediately.run, `navigationState.sandboxPath` — the host pushes it on every
//     navigation, so React re-renders through the context and there is nothing to listen to;
//   • in `vite dev`, `window.location.pathname` plus a `popstate` subscription, which
//     `navigateTo` also dispatches so a click and a back button take the same path.
//
// It replaces a `hashchange` listener. The premise for that hash — "immediately.run serves a
// single entry with no server to resolve sub-paths" — was already false: the app owns
// `sandboxPath` and the host mirrors the location into the sandbox. The cost of keeping it
// was that a URL has one fragment and the router had taken it, so heading permalinks had
// nowhere to point.

import { use, useEffect, useRef, useSyncExternalStore } from 'react';
import { TinkerableContext } from '@immediately-run/sdk/TinkerableContext';
import { appPathFromSandboxPath, legacyHashPath, parseRoute } from '../lib/routeSpace';
import type { Route } from '../lib/routeSpace';
// Re-exported so the many components that only need the section type keep one import site.
export type { Route, Section } from '../lib/routeSpace';
import { hasHost, platformHref, redirectTo } from '../lib/navigation';
import type { HostLocation } from '../lib/navigation';

const subscribeToHistory = (onChange: () => void): (() => void) => {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
};

const currentLocalPath = (): string => window.location.pathname;
// `useSyncExternalStore` needs a stable server snapshot; the site is client-rendered, so the
// root is the only sensible one.
const serverPath = (): string => '/';
const currentLocalHash = (): string => window.location.hash;

/** The host context, narrowed to what navigation needs. Empty in `vite dev`. */
export function useHostLocation(): HostLocation {
  const ctx = use(TinkerableContext);
  return { outerHref: ctx?.outerHref, navigationState: ctx?.navigationState };
}

/** The fragment of the current URL (`#the-loop` → `the-loop`), from the host's navigation
 *  state on the platform and from `location` locally. Empty for a legacy `#/route` hash,
 *  which is a route rather than a fragment and is redirected away by `useRoute`. */
export function useFragment(): string {
  const loc = useHostLocation();
  const localHash = useSyncExternalStore(subscribeToHistory, currentLocalHash, () => '');
  const raw = hasHost(loc) ? (loc.navigationState.hash ?? '') : localHash;
  return legacyHashPath(raw) === null ? raw.replace(/^#/, '') : '';
}

export function useRoute(): Route {
  const loc = useHostLocation();
  const localPath = useSyncExternalStore(subscribeToHistory, currentLocalPath, serverPath);
  const appPath = hasHost(loc)
    ? appPathFromSandboxPath(loc.navigationState.sandboxPath)
    : localPath;

  // Legacy `#/docs/…` links — every URL this site published before path routing — redirect
  // once to the new spelling. Runs after paint rather than during render because it is a
  // side effect on the URL; a bare `#fragment` is untouched, which is the point of freeing
  // the fragment in the first place.
  const hash = typeof window === 'undefined' ? '' : window.location.hash;
  useEffect(() => {
    const legacy = legacyHashPath(hash);
    if (legacy === null) return;
    redirectTo(loc, legacy);
    // Clear the hash locally so the effect cannot re-fire on the redirected URL. On the
    // platform the host owns the address bar and the push already dropped it.
    if (!hasHost(loc)) {
      window.history.replaceState({}, '', legacy);
    }
  }, [hash, loc]);

  const route = parseRoute(appPath);

  // Scrolling to the top belongs to a SECTION change, not to every route change: moving
  // between two docs pages should land at the top, but re-rendering the same section (a
  // fragment scroll, a redirect) must not yank the reader.
  //
  // A ref, not state: the previous section is bookkeeping the render does not read, and
  // holding it in state would set state from an effect — a cascading render for a value
  // nothing displays (`react-hooks/set-state-in-effect`, which caught exactly this).
  const lastSection = useRef(route.section);
  useEffect(() => {
    if (route.section === lastSection.current) return;
    lastSection.current = route.section;
    window.scrollTo({ top: 0 });
  }, [route.section]);

  return route;
}

/** Build a PLATFORM-space href (`/present/…`, `/edit/new`) in the host's URL space.
 *  See `platformHref` for why these cannot stay root-relative on the platform. */
export function usePlatformHref(): (path: string) => string {
  const loc = useHostLocation();
  return (path: string) => platformHref(loc, path);
}
