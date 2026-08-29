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
  /**
   * Capabilities the app DECLARES in its manifest — the directory's "what it can
   * touch" facet. Optional on purpose: several apps declare nothing and acquire
   * access at runtime from a user-driven grant instead, and the honest rendering
   * of "we have not checked this" is an absent facet, not an empty one and
   * certainly not a guess. A guessed capability list is a false trust signal,
   * which is worse than no signal. Absent => the app shows no capability chips
   * and is excluded from capability filtering.
   */
  caps?: string[];
  /** Entry file, if it isn't the conventional src/App.tsx. */
  entry?: string;
}

// Curated taxonomy / chip-row order. `all` is prepended by the UI.
export const CATEGORIES: { slug: string; label: string }[] = [
  { slug: 'creative', label: 'Creative' },
  { slug: 'writing', label: 'Writing' },
  { slug: 'everyday', label: 'Everyday' },
  { slug: 'games', label: 'Games' },
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
    name: 'Landing page',
    repo: 'landing-page',
    blurb: 'The immediately.run homepage itself — yes, the front page is an app you can fork.',
    category: 'meta',
    categoryLabel: 'Meta',
    provenance: 'official',
    span: 'sm',
    caps: [],
  },
  {
    name: 'Todo',
    repo: 'todo',
    blurb: 'Tasks and lists that live in your own files. Keep them private, or share them with your household.',
    category: 'everyday',
    categoryLabel: 'Everyday',
    provenance: 'official',
    span: 'sm',
  },
  {
    name: 'Habit Tracker',
    repo: 'habit-tracker',
    blurb: 'Daily habits, streaks and a year heatmap, stored as files you own.',
    category: 'everyday',
    categoryLabel: 'Everyday',
    provenance: 'official',
    span: 'sm',
  },
  {
    name: 'Kanban Board',
    repo: 'kanban-board',
    blurb: 'A board where every card is a file. Share the space and you share the board.',
    category: 'everyday',
    categoryLabel: 'Everyday',
    provenance: 'official',
    span: 'big',
  },
  {
    name: 'Shared Calendar',
    repo: 'shared-calendar',
    blurb: 'A calendar for a family or a team. Events are files, and a day can hold photos and documents.',
    category: 'everyday',
    categoryLabel: 'Everyday',
    provenance: 'official',
    span: 'sm',
  },
  {
    name: 'Chore Rota',
    repo: 'chore-rota',
    blurb: 'Who takes out the trash, who brings the cookies. Rotations and sign-up sheets for a shared space.',
    category: 'everyday',
    categoryLabel: 'Everyday',
    provenance: 'official',
    span: 'sm',
  },
  {
    name: 'Flashcards',
    repo: 'flashcards',
    blurb: 'Spaced-repetition flashcards. A deck is a folder of cards you can hand to a class.',
    category: 'everyday',
    categoryLabel: 'Everyday',
    provenance: 'official',
    span: 'sm',
  },
  {
    name: 'Expense Tracker',
    repo: 'expense-tracker',
    blurb: 'A household budget where every expense is a file. Split bills with the people you share the space with.',
    category: 'everyday',
    categoryLabel: 'Everyday',
    provenance: 'official',
    span: 'sm',
  },
  {
    name: 'Photo Album',
    repo: 'photo-album',
    blurb: 'Albums that are just folders of pictures. Keep them private, or share a space with family.',
    category: 'everyday',
    categoryLabel: 'Everyday',
    provenance: 'official',
    span: 'sm',
  },
  {
    name: 'Unit Converter',
    repo: 'unit-converter',
    blurb: 'Units, time zones and a world clock. Instant, offline, no account.',
    category: 'tools',
    categoryLabel: 'Tools',
    provenance: 'official',
    span: 'sm',
  },
  {
    name: 'Dev Toolbox',
    repo: 'dev-toolbox',
    blurb: 'JSON, regex, encoders, hashes, diffs and UUIDs in one place. Nothing leaves your tab.',
    category: 'tools',
    categoryLabel: 'Tools',
    provenance: 'official',
    span: 'sm',
  },
  {
    name: 'SQLite Studio',
    repo: 'sqlite-studio',
    blurb: 'Open a SQLite file, explore it, chart it, and ask questions in plain English with your own key.',
    category: 'tools',
    categoryLabel: 'Tools',
    provenance: 'official',
    span: 'big',
  },
  {
    name: 'Chess',
    repo: 'chess',
    blurb: 'Correspondence chess with no server: every move is a file in a shared space. Play a friend, or the engine.',
    category: 'games',
    categoryLabel: 'Games',
    provenance: 'official',
    span: 'sm',
  },
  {
    name: 'Hex Conquest',
    repo: 'hex-conquest',
    blurb: 'A turn-based strategy game on a hex map. Play the computer, or take turns through a shared space.',
    category: 'games',
    categoryLabel: 'Games',
    provenance: 'official',
    span: 'sm',
  },
  {
    name: 'Arcade Classics',
    repo: 'arcade-classics',
    blurb: 'Snake, Tetris, Breakout and 2048 in one cabinet, with high scores in your own files.',
    category: 'games',
    categoryLabel: 'Games',
    provenance: 'official',
    span: 'sm',
  },
  {
    name: 'Puzzle Classics',
    repo: 'puzzle-classics',
    blurb: 'Minesweeper, Sudoku and a daily word game, with streaks in your files and a board for your group.',
    category: 'games',
    categoryLabel: 'Games',
    provenance: 'official',
    span: 'sm',
  },
  {
    name: 'Grove',
    repo: 'grove',
    blurb: 'A wiki engine that renders a repository of MDX as a browsable, themeable site.',
    category: 'writing',
    categoryLabel: 'Writing',
    provenance: 'official',
    span: 'sm',
  },
  {
    name: 'Reckoner',
    repo: 'reckoner',
    blurb: 'A spreadsheet-shaped workbook for models and what-if analysis.',
    category: 'tools',
    categoryLabel: 'Tools',
    provenance: 'official',
    span: 'sm',
  },
  {
    name: 'Space Manager',
    repo: 'space-manager',
    blurb: 'Create spaces, invite people, and manage roles and grants.',
    category: 'components',
    categoryLabel: 'Components',
    provenance: 'official',
    span: 'sm',
  },
  {
    name: 'Editor',
    repo: 'editor',
    blurb: 'The platform code editor, as an ordinary app you can fork and replace.',
    category: 'components',
    categoryLabel: 'Components',
    provenance: 'official',
    span: 'sm',
  },
  {
    name: 'Devtools',
    repo: 'devtools',
    blurb: 'The problems list and tool runner behind the workbench Tools activity.',
    category: 'components',
    categoryLabel: 'Components',
    provenance: 'official',
    span: 'sm',
  },
];
