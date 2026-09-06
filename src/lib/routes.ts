// Same-origin platform routes. Every "Open" / "Fork" CTA on the site is a single
// click into the runner/editor — no new tab, no context switch. These build the
// canonical /present and /edit URLs from a repo under the immediately-run org.

const OWNER = 'immediately-run';

/** "Open / Run" — opens the app in the runner. */
export function presentRoute(repo: string, entry = 'src/App.tsx', branch = 'main'): string {
  return `/present/github/${OWNER}/${repo}/${branch}/files/${entry}`;
}

/** An example app under the org, opened in the runner — the /new cards' "Try it
 *  live" and the Publish section's demo link. No `files/` segment: the entry
 *  resolves from the app's package.json. */
export function examplePresentPath(example: string, branch = 'main'): string {
  return `/present/github/${OWNER}/${example}/${branch}`;
}

/** The docs wiki running as an app — the footer's wiki link. */
export const WIKI_PRESENT_PATH = `/present/github/${OWNER}/docs/main`;

/** The signed-in home inside the frame — the door hands the visitor here in
 *  both auth states; the host draws its own sign-in posture when signed out. */
export const HOME_PATH = '/home';

/** "Fork / Tinker" — opens the app in the editor (copy-on-write). */
export function editRoute(repo: string, entry = 'src/App.tsx', branch = 'main'): string {
  return `/edit/github/${OWNER}/${repo}/${branch}/files/${entry}`;
}

const REPO = 'landing-page';
const BRANCH = 'main';

/** A repo file on GitHub, for a human to read. */
export function sourceUrl(repoPath: string): string {
  return `https://github.com/${OWNER}/${REPO}/blob/${BRANCH}/${repoPath.replace(/^\/+/, '')}`;
}

/** A repo file as raw bytes — what an AGENT wants: fetchable, stable, no route space involved.
 *
 *  Deliberately NOT the platform's `files/` space. This app now owns its whole path space
 *  (it boots with a catch-all so deep links work), which means `files/…` reaches the app's
 *  router rather than the host's file view — so an in-platform files link renders nothing.
 *  The bytes live in a public repo; GitHub already serves them, on and off the platform. */
export function rawUrl(repoPath: string): string {
  return `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${repoPath.replace(/^\/+/, '')}`;
}
