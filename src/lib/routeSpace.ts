// The site's route space — pure, so the parsing and the platform-prefix arithmetic can be
// tested without a browser or a host.
//
// **The platform owns the URL prefix; the app owns the suffix.** `SANDBOX_ROUTING_SPEC` is
// explicit about that split: an outer URL is
// `/{mode}/{provider}/{namespace}/{repository}/{ref}/{sandboxPath}`, and everything from
// `sandboxPath` on is ours. So the site's routes are ordinary paths — `/docs/start/overview`
// — that happen to be mounted under a prefix on immediately.run and at the origin root in
// local `vite dev`. Nothing here needs to know which.
//
// This replaces a hash router whose stated justification ("no server to resolve sub-paths")
// stopped being true: the host mirrors the browser location into the sandbox on every
// navigation, which is the same machinery the `corpus/…` grammar rides on. The concrete cost
// of the hash was that a URL has exactly one fragment and the router owned it, so a heading
// permalink had nowhere to go.

export type Section = 'home' | 'apps' | 'new' | 'docs' | 'tutorials' | 'changelog';

export interface Route {
  section: Section;
  /** Path segments after the section: `/docs/agents/llms` → `['agents','llms']`. */
  rest: string[];
}

const SECTIONS: Section[] = ['home', 'apps', 'new', 'docs', 'tutorials', 'changelog'];

/** Split a path into clean segments, tolerating leading/trailing/duplicate slashes. */
const segmentsOf = (path: string): string[] => path.split('/').filter(Boolean);

/**
 * R3-513 — one directory: `/showcase` redirects to `/apps`, the way legacy hash
 * routes redirect (once, with `replace` semantics). `showcase` is deliberately
 * NOT in `SECTIONS` — it is not a route any more, only a redirect, so old links
 * keep working while the nav and the site map carry exactly one directory.
 * Returns null when the path needs no redirect.
 */
export function redirectForPath(appPath: string): string | null {
  const first = segmentsOf(appPath)[0];
  if (first === 'showcase') return '/apps';
  return null;
}

/**
 * Parse an app-space path into a route. Unknown first segments resolve to `home` rather
 * than to a 404 section — the site has always behaved that way, and a mistyped URL landing
 * on the homepage is friendlier than a dead end.
 */
export function parseRoute(appPath: string): Route {
  const segs = segmentsOf(appPath);
  const first = segs[0] ?? '';
  if (first === '') return { section: 'home', rest: [] };
  const section = (SECTIONS as string[]).includes(first) ? (first as Section) : 'home';
  return { section, rest: section === 'home' && first !== 'home' ? [] : segs.slice(1) };
}

/** The app-space path for a route. `home` is the root, not `/home`. */
export function routePath(route: Route): string {
  if (route.section === 'home' && route.rest.length === 0) return '/';
  return `/${[route.section, ...route.rest].join('/')}`;
}

/**
 * Translate a legacy `#/…` hash URL into its app-space path, or null when the hash is not a
 * legacy route.
 *
 * Every link the site published for its whole life so far was `#/docs/…`, and those live in
 * other people's bookmarks, other people's posts, and the changelog's own `docHref` records.
 * Dropping them would make retiring the hash a user-visible breakage rather than an
 * internal change, so the boot path redirects instead — once, with `replace`, so the back
 * button does not bounce between the two spellings.
 *
 * A BARE fragment (`#the-loop`, what a heading permalink now produces) is deliberately NOT a
 * legacy route: it addresses a section of the current page, which is the whole point of
 * freeing the fragment.
 */
export function legacyHashPath(hash: string): string | null {
  if (!hash.startsWith('#/')) return null;
  const segs = segmentsOf(hash.slice(2));
  return segs.length === 0 ? '/' : `/${segs.join('/')}`;
}

/**
 * Where the app's route space begins inside an outer URL.
 *
 * On immediately.run the outer pathname carries five platform segments before ours
 * (`/present/github/ns/repo/main/…`), and the host may or may not have left a trailing
 * slash. Locally there is no prefix at all. Rather than reimplement the platform's URL
 * grammar — which has real subtleties (encoded refs, an absent sandboxPath) the SDK's
 * `parsePath` already handles — the caller passes the sandboxPath the host gave it and this
 * only normalises it.
 *
 * `files/…` is accepted and stripped: the SDK's own link builder prefixes it by default, so
 * a link built without opting out arrives that way, and silently 404ing on the difference
 * would be a trap. It is a filesystem-space spelling of the same route, not a second space.
 */
export function appPathFromSandboxPath(sandboxPath: string | undefined | null): string {
  if (!sandboxPath) return '/';
  const segs = segmentsOf(sandboxPath);
  if (segs[0] === 'files' || segs[0] === 'corpus') segs.shift();
  return segs.length === 0 ? '/' : `/${segs.join('/')}`;
}
