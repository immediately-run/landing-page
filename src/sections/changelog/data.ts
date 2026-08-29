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
  /** Optional link into the reference, e.g. "/docs/capabilities". */
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
    id: 'tools-activity',
    date: 'aug 28',
    kind: 'feat',
    message: 'typecheck, lint and build problems in one list.',
    detail:
      'The Tools activity runs a typecheck and a lint over the app you have open and lists every problem in one tree, whichever tool reported it. Clicking a row switches activity, opens the file, and puts the caret on the character.',
    bullets: [
      'a run says how it fell short rather than silently truncating.',
      'a run marks itself out of date when a file changes underneath it.',
    ],
  },
  {
    id: 'present-mode-chrome',
    date: 'aug 27',
    kind: 'feat',
    message: 'present mode no longer stacks a second navbar over your app.',
    detail:
      'The pull-down tab now opens a host-owned platform menu — an anchored panel on desktop, a bottom sheet on mobile — and the app dims and insets behind it. Nothing is persisted and the app frame is never resized.',
  },
  {
    id: 'llm-providers',
    date: 'aug 24',
    kind: 'feat',
    message: 'connect a language model by picking a provider, not by naming a secret.',
    detail:
      'Choose a provider, follow a deep link to its key page, and paste the key. The platform sets the credential type and the destination it is bound to; you never see the words api-key or bearer-token. Anthropic, OpenAI, Google Gemini, OpenRouter, and any OpenAI-compatible endpoint.',
    bullets: [
      'the key is sealed with your passkey and used without ever being readable by an app.',
      'errors say out of credit or key rejected, not a generic auth failure.',
    ],
    docHref: '/docs/capabilities/model',
  },
  {
    id: 'editor-as-app',
    date: 'jul 07',
    kind: 'rel',
    message: 'the code editor is an ordinary immediately.run app.',
    detail:
      'The editor is no longer built into the host — it is a repo you can fork and replace like any other part of the interface. The native editor was deleted once the app reached parity.',
    docHref: '/docs/start/overview',
  },
  {
    id: 'space-invitations',
    date: 'jul 02',
    kind: 'feat',
    message: 'sharing a space is an invitation you accept, not a folder that appears.',
    detail:
      'An owner offers access and the recipient accepts from their own invitations list, so nothing joins your account without you agreeing to it. Roles are reader, writer, or owner, and revocation takes effect live.',
    docHref: '/docs/capabilities/identity',
  },
];
