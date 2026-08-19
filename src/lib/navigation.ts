// The one place that knows whether a host is present.
//
// The site runs in two environments and they disagree about who owns the URL:
//
//   • **On immediately.run** the app is in a sandboxed iframe whose document URL is the
//     SANDBOX's, not the one the reader sees. The host owns the address bar. An app must
//     not touch `history` (it would move an invisible URL) and must not postMessage its own
//     channel — every platform interaction goes through the SDK. So a navigation is
//     `navigate(<absolute outer URL>)`, and an href is built with `constructOuterUrl`.
//   • **In local `vite dev`** there is no host and no transport at all: the SDK's
//     `sendMessage` throws. The app owns its own URL, so `history.pushState` is right.
//
// Everything below is the adapter, and nothing above it branches on environment again.
//
// A note on `addFilesPrefix: false`. `constructOuterUrl` prefixes `files/` by default,
// because the SDK's own default route table maps `/files/*` to a file viewer. The site's
// routes are ROUTES, not files — there is no file at `docs/start/overview`; the entry is
// `docs/start--overview.mdx` — and after the two-URL-spaces decision `files/…` means
// filesystem-true. Opting out keeps the two spaces honest and gives a prettier URL. The
// host passes an unrecognised suffix through to the app verbatim, which is exactly what we
// want; `parseRoute` still accepts the `files/` spelling inbound so a link built the default
// way is not a dead end.

// Imported from the NARROW subpaths, never the package root. Importing
// `@immediately-run/sdk` pulls in every channel module, several of which reach for the host
// transport at module load — which throws outright in `vite dev`, where there is no host.
// The failure is total (a blank page, one line in the console) and it looks nothing like
// "you imported too much", so it is worth the two extra import lines to avoid.
import { navigate as sdkNavigate } from '@immediately-run/sdk/routing';
import { constructOuterUrl } from '@immediately-run/sdk/urlUtils';
import type { NavigationState } from '@immediately-run/sdk/TinkerableContext';

/** What the host told us about where we are. Absent (all fields undefined) in `vite dev`. */
export interface HostLocation {
  outerHref?: string;
  navigationState?: NavigationState;
}

/** True when the app is running inside the host — i.e. the context carries a real outer URL.
 *  Checked on the CONTEXT rather than by probing for a transport, because the context is
 *  what the href builder needs and a transport without one would not help. */
export function hasHost(loc: HostLocation): loc is Required<HostLocation> {
  return Boolean(loc.outerHref && loc.navigationState);
}

/**
 * The href to render for an app-space path. On the platform this is an absolute URL in the
 * HOST's space — which is what makes copy-link, middle-click and open-in-new-tab produce
 * something that resolves for another reader. Locally it is the path itself.
 */
export function hrefFor(loc: HostLocation, appPath: string): string {
  if (!hasHost(loc)) return appPath;
  return constructOuterUrl(loc.outerHref, appPath, loc.navigationState, false);
}

/**
 * Navigate to an app-space path. On the platform this asks the HOST to change the URL; the
 * host then pushes the new `sandboxPath` back down, which is what re-renders the app. There
 * is deliberately no local state update on that path — the host's push is the single source
 * of truth, and updating optimistically would let the two disagree.
 *
 * Locally it pushes real history and dispatches `popstate`, so the same subscriber that
 * handles back/forward handles a click too — one code path, not two.
 */
export function navigateTo(loc: HostLocation, appPath: string): void {
  if (hasHost(loc)) {
    sdkNavigate(hrefFor(loc, appPath));
    return;
  }
  if (window.location.pathname === appPath) return;
  window.history.pushState({}, '', appPath);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * Replace the current URL, for the legacy-hash redirect. `replace`, not `push`, so the back
 * button does not bounce between the old spelling and the new one.
 *
 * On the platform there is no replace primitive — `navigate` is a push — so the redirect is
 * a push there. That is the honest trade: one extra history entry on a legacy link, versus
 * an app reaching into a history stack it does not own.
 */
export function redirectTo(loc: HostLocation, appPath: string): void {
  if (hasHost(loc)) {
    sdkNavigate(hrefFor(loc, appPath));
    return;
  }
  window.history.replaceState({}, '', appPath);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
