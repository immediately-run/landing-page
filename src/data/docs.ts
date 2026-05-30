// Content for the "Build your own" docs blocks.

export interface DocEntry {
  /** Stable id; matches the key in the article registry (see Docs.tsx). */
  slug: string;
  num: string;
  title: string;
  blurb: string;
  readTime: string;
}

export const DOCS: DocEntry[] = [
  {
    slug: 'your-first-app',
    num: '01',
    title: 'Your first app',
    blurb: 'Blank file to a shareable, self-contained app in under fifty lines.',
    readTime: '→ 6 min read',
  },
  {
    slug: 'tweak-protocol',
    num: '02',
    title: 'The Tweak protocol',
    blurb: 'Declare live controls that persist their state across reloads, no wiring.',
    readTime: '→ 9 min read',
  },
  {
    slug: 'persistence',
    num: '03',
    title: 'Persistence',
    blurb: "Keep a user's place with no server, backend, or sign-in required.",
    readTime: '→ 4 min read',
  },
  {
    slug: 'bundling-offline',
    num: '04',
    title: 'Bundling & offline',
    blurb: 'Inline every asset into one offline-ready, self-contained file.',
    readTime: '→ 7 min read',
  },
];
