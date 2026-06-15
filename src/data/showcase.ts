// One typed record per app — the single source that feeds the showcase teaser
// (and, in the full site, the directory and the machine-readable index). Pure
// data, no React, so component files stay HMR-friendly.

// Provenance is a trust signal, not decoration:
//   official              → first-party, immediately-run org
//   { github: 'owner' }   → community app from a verified GitHub identity
export type Provenance = 'official' | { github: string };

export interface AppRecord {
  /** Display name. */
  name: string;
  /** Repo name under the immediately-run org; also the Open/Fork route key. */
  repo: string;
  /** One-line, sentence-case, no period needed. */
  blurb: string;
  /** Category label shown on the tile corner and as a chip. */
  category: string;
  provenance: Provenance;
  /** Star count rendered as "★ {stars}". Omit to hide the badge. */
  stars?: string;
}

export const SHOWCASE: AppRecord[] = [
  {
    name: 'Whiteboard',
    repo: 'whiteboard',
    blurb: 'An infinite canvas for notes and sketches. Open the source while it runs.',
    category: 'Creative',
    provenance: 'official',
    stars: '2.1k',
  },
  {
    name: 'Markdown Notebook',
    repo: 'markdown-notebook',
    blurb: 'Write and run notebooks in Markdown. Nothing leaves your browser.',
    category: 'Writing',
    provenance: 'official',
    stars: '1.8k',
  },
  {
    name: 'File Commander',
    repo: 'file-commander',
    blurb: 'A two-pane file manager over the folders you mount — and nothing else.',
    category: 'Tools',
    provenance: 'official',
    stars: '1.3k',
  },
  {
    name: 'Spaces Panel',
    repo: 'spaces-panel',
    blurb: 'Browse and share your spaces. Forkable, like everything else here.',
    category: 'Tools',
    provenance: 'official',
  },
];
