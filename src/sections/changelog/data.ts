// Reverse-chronological changelog — newest first.
// Adding an entry = adding a record (agent-writable). This same data can feed
// the landing-page teaser (latest 1) and the RSS/Atom feed.

export type BadgeKind = 'feat' | 'rel' | 'note';

export interface ChangelogEntry {
  /** Stable anchor id, used for /changelog#<id> deep links. */
  id: string;
  /** Mono short date, e.g. "may 26". */
  date: string;
  kind: BadgeKind;
  /** Optional version/tag, e.g. "v2.4". */
  version?: string;
  /** One-line message in sentence case. */
  message: string;
  /** Optional expandable detail paragraph. */
  detail?: string;
  /** Optional bullet list shown inside the expanded detail. */
  bullets?: string[];
  /** Optional link into the reference, e.g. "#/docs/capabilities". */
  docHref?: string;
}

export const BADGE_LABEL: Record<BadgeKind, string> = {
  feat: 'feature',
  rel: 'release',
  note: 'note',
};

export type FilterKind = 'all' | BadgeKind;

export interface FilterChip {
  key: FilterKind;
  label: string;
}

export const FILTER_CHIPS: FilterChip[] = [
  { key: 'all', label: 'all' },
  { key: 'feat', label: 'feature' },
  { key: 'rel', label: 'release' },
  { key: 'note', label: 'note' },
];

export const CHANGELOG: ChangelogEntry[] = [
  {
    id: 'v2-4',
    date: 'jun 09',
    kind: 'rel',
    version: 'v2.4',
    message: 'consent receipts and a tighter capability ladder.',
    detail:
      'Every grant a user approves now writes a signed receipt your app can read back, so the host and the app agree on exactly what was allowed. The capability ladder narrows by default — apps start with their own spaces and ask for anything more.',
    bullets: [
      'receipts list the mount, the mode (ro / rw), and when the grant expires.',
      'a downgraded role now fires onMountsChange so affordances can hide themselves.',
      'forbidden is returned as policy, never as a retryable error.',
    ],
    docHref: '#/docs/capabilities',
  },
  {
    id: 'mcp-bridge',
    date: 'may 28',
    kind: 'feat',
    message: 'agents reach your app through the MCP bridge.',
    detail:
      'An embedded agent now uses the SDK method catalog as its tool list — pre-filtered to the grants your app holds, so the agent can never exceed what the app may do. No hand-rolled tools, no shelling around the SDK.',
    bullets: [
      'the catalog updates live as grants change.',
      'each tool call carries the same typed-error contract as a direct SDK call.',
      'cross-app tasks you invoke must be declared under "invokes".',
    ],
    docHref: '#/docs/agents',
  },
  {
    id: 'push-to-github',
    date: 'may 26',
    kind: 'feat',
    message: 'push your work straight back to github.',
    detail:
      'Edits made in a fork can now be committed and pushed without leaving the runtime. Sign-in stays host-driven — you never see the token — and the push is gated on the signed-in auth state.',
    bullets: [
      'commits land on a branch you name; the host opens the pull request.',
      'read-only mounts stay read-only — writes there fail with EROFS.',
    ],
    docHref: '#/docs/push',
  },
  {
    id: 'spaces',
    date: 'may 14',
    kind: 'rel',
    version: 'v2.3',
    message: 'spaces — per-app storage that travels with a fork.',
    docHref: '#/docs/spaces',
  },
  {
    id: 'offline-cache',
    date: 'apr 30',
    kind: 'feat',
    message: 'offline zip cache loads apps without a round trip.',
    detail:
      'Each push to main publishes a pre-cached zip to the repo\'s own pages, discovered by convention, so an app loads fast and within anonymous rate limits — and keeps working offline.',
    bullets: [
      'requireLatest picks the freshness mode: stale_ok, optimistic, or strict.',
      'the default serves the cache, then checks in the background.',
    ],
  },
  {
    id: 'opaque-origin',
    date: 'apr 18',
    kind: 'note',
    message: 'every app now runs in a sandboxed iframe with an opaque origin.',
  },
  {
    id: 'consent-ui',
    date: 'apr 02',
    kind: 'feat',
    version: 'v2.2',
    message: 'the host draws consent — apps never imitate it.',
    detail:
      'Sign-in prompts, consent dialogs, and the platform seam are all host chrome. Apps request access through the SDK and the user picks in host UI; an imitation reads as spoofing.',
    bullets: [
      'requests resolve to { ok: false, code: "cancelled" | "forbidden" } when declined.',
      'degrade the feature on cancellation — never block the app.',
    ],
    docHref: '#/docs/consent',
  },
];
