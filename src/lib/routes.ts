// Same-origin platform routes. Every "Open" / "Fork" CTA on the site is a single
// click into the runner/editor — no new tab, no context switch. These build the
// canonical /present and /edit URLs from a repo under the immediately-run org.

const OWNER = 'immediately-run';

/** "Open / Run" — opens the app in the runner. */
export function presentRoute(repo: string, entry = 'src/App.tsx', branch = 'main'): string {
  return `/present/github/${OWNER}/${repo}/${branch}/files/${entry}`;
}

/** "Fork / Tinker" — opens the app in the editor (copy-on-write). */
export function editRoute(repo: string, entry = 'src/App.tsx', branch = 'main'): string {
  return `/edit/github/${OWNER}/${repo}/${branch}/files/${entry}`;
}
