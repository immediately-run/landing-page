// The single canonical app dataset. One typed record per app feeds the showcase
// teaser, the full showcase grid, the app directory, and search — adding an app
// is adding an entry, no component changes. Pure data (no React) so component
// files stay HMR-friendly.
//
// Every app is a public repo under the immediately-run org; Open/Fork routes are
// built from `repo` (see ../lib/routes). Star counts are intentionally omitted —
// we print only verified numbers, and these aren't verified yet.

// Provenance is a trust signal, not decoration:
//   'official'            → first-party, immediately-run org
//   { github: 'owner' }   → community app from a verified GitHub identity
export type Provenance = 'official' | { github: string };

export interface AppRecord {
  /** Display name. */
  name: string;
  /** Repo name under the immediately-run org; also the Open/Fork route key. */
  repo: string;
  /** One line, sentence case, concrete — no hype. */
  blurb: string;
  /** Category slug used by chip/facet filters. */
  category: string;
  /** Human label shown on the tile corner. */
  categoryLabel: string;
  provenance: Provenance;
  /** Grid footprint in the showcase: `big` spans 4 columns, `sm` spans 2. */
  span: 'big' | 'sm';
  /** Saturated gradient treatment for the occasional featured tile. */
  variant?: 'accent' | 'blue';
  /** Adds a " · featured" suffix to the corner label. */
  featured?: boolean;
  /** Capabilities the app requests — the directory's "what it can touch" facet. */
  caps: string[];
  /** Entry file, if it isn't the conventional src/App.tsx. */
  entry?: string;
}

// Curated taxonomy / chip-row order. `all` is prepended by the UI.
export const CATEGORIES: { slug: string; label: string }[] = [
  { slug: 'creative', label: 'Creative' },
  { slug: 'writing', label: 'Writing' },
  { slug: 'tools', label: 'Tools' },
  { slug: 'components', label: 'Components' },
  { slug: 'agents', label: 'Agents' },
  { slug: 'meta', label: 'Meta' },
];

// Capability facet vocabulary (mono labels in the directory).
export const CAPABILITIES: { slug: string; label: string }[] = [
  { slug: 'files', label: 'files' },
  { slug: 'network', label: 'network' },
  { slug: 'secrets', label: 'secrets' },
  { slug: 'spaces', label: 'spaces' },
  { slug: 'agent', label: 'agent' },
];

export const APPS: AppRecord[] = [
  {
    name: 'Whiteboard',
    repo: 'whiteboard',
    blurb: 'An infinite canvas for notes and sketches. Open the source while it runs.',
    category: 'creative',
    categoryLabel: 'Creative',
    provenance: 'official',
    span: 'big',
    variant: 'accent',
    featured: true,
    caps: ['files'],
  },
  {
    name: 'Markdown Notebook',
    repo: 'markdown-notebook',
    blurb: 'Write on the left, see it rendered on the right. Nothing leaves your browser.',
    category: 'writing',
    categoryLabel: 'Writing',
    provenance: 'official',
    span: 'sm',
    caps: ['files'],
  },
  {
    name: 'File Commander',
    repo: 'file-commander',
    blurb: 'A dual-pane, keyboard-driven file manager over the folders you mount.',
    category: 'tools',
    categoryLabel: 'Tools',
    provenance: 'official',
    span: 'sm',
    variant: 'blue',
    caps: ['files'],
  },
  {
    name: 'File Explorer',
    repo: 'file-explorer',
    blurb: 'Browse a mounted folder as a tree. Sees only what you grant.',
    category: 'tools',
    categoryLabel: 'Tools',
    provenance: 'official',
    span: 'sm',
    caps: ['files'],
  },
  {
    name: 'Spaces Panel',
    repo: 'spaces-panel',
    blurb: 'Browse and share your spaces. Forkable, like everything else here.',
    category: 'tools',
    categoryLabel: 'Tools',
    provenance: 'official',
    span: 'sm',
    caps: ['spaces'],
  },
  {
    name: 'File Selector',
    repo: 'file-selector',
    blurb: 'A reusable picker for handing one file to another app.',
    category: 'components',
    categoryLabel: 'Components',
    provenance: 'official',
    span: 'sm',
    caps: ['files'],
  },
  {
    name: 'Edit File',
    repo: 'edit-file',
    blurb: 'The platform editor as a task — open exactly one file, read-write.',
    category: 'tools',
    categoryLabel: 'Tools',
    provenance: 'official',
    span: 'sm',
    caps: ['files'],
  },
  {
    name: 'Theme Toggle',
    repo: 'theme-toggle',
    blurb: 'The light/dark switch as a tiny standalone app you can drop in anywhere.',
    category: 'components',
    categoryLabel: 'Components',
    provenance: 'official',
    span: 'sm',
    caps: [],
  },
  {
    name: 'Agent Demo',
    repo: 'agent-demo',
    blurb: 'A coding agent editing a running app — the change-by-asking loop, live.',
    category: 'agents',
    categoryLabel: 'Agents',
    provenance: 'official',
    span: 'sm',
    caps: ['agent', 'network'],
  },
  {
    name: 'Showcase',
    repo: 'showcase',
    blurb: 'The curated grid itself — a forkable storefront for your own apps.',
    category: 'meta',
    categoryLabel: 'Meta',
    provenance: 'official',
    span: 'sm',
    caps: [],
  },
  {
    name: 'Landing page',
    repo: 'landing-page',
    blurb: 'The immediately.run homepage itself — yes, the front page is an app you can fork.',
    category: 'meta',
    categoryLabel: 'Meta',
    provenance: 'official',
    span: 'sm',
    caps: [],
  },
];
