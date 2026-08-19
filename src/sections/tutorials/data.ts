// The index over the /tutorials corpus. A data module, not a component file — it exports
// records and types only.
//
// Deep-link routes are still data rather than buried in prose, so they stay agent-writable
// and easy to verify — they are now `<DeepLink href="…"/>` in the MDX, which is the same
// property with the prose around it in markdown instead of in a string literal.

import type { ComponentType } from 'react';
import { CORPUS_ENTRIES, corpusEntries } from '../../data/corpusIndex';
import type { CorpusHeading } from '../../data/corpusIndex';

/**
 * A tutorial — now BACKED BY MDX in the `tutorials/` corpus.
 *
 * The steps used to be `TutorialStep` records with a `prose` string; a step's prose is
 * exactly the kind of thing markdown is for and TypeScript is not. What stays typed is the
 * metadata a reader scans before committing to a tutorial (outcome, prereqs, time,
 * difficulty) — that is frontmatter now, and the checker requires every field, so a missing
 * `time:` is a build failure rather than a blank cell.
 *
 * `steps` is derived from the entry's `###` headings, whose ids come from the same
 * `headingId()` the remark plugin renders — so the step rail and the anchors it scrolls to
 * cannot disagree.
 */
export interface TutorialStep {
  id: string;
  title: string;
}

export interface Tutorial {
  slug: string;
  num: string;
  pillar: string;
  title: string;
  /** One-line outcome — what you'll have built. */
  outcome: string;
  prereqs: string;
  time: string;
  difficulty: string;
  tags: string[];
  steps: TutorialStep[];
  Body: ComponentType<{ components?: Record<string, unknown> }>;
  /** Where "learn next" points. */
  next: { slug: string; label: string };
}

export const TUTORIALS: Tutorial[] = corpusEntries('tutorials').map((e) => ({
  slug: e.slug,
  num: String(e.frontmatter.num),
  pillar: String(e.frontmatter.pillar),
  title: String(e.frontmatter.title),
  outcome: String(e.frontmatter.outcome),
  prereqs: String(e.frontmatter.prereqs),
  time: String(e.frontmatter.time),
  difficulty: String(e.frontmatter.difficulty),
  tags: (e.frontmatter.tags as string[]) ?? [],
  steps: e.headings
    .filter((h: CorpusHeading) => h.depth === 3)
    .map((h: CorpusHeading) => ({ id: h.id, title: h.text })),
  Body: CORPUS_ENTRIES[e.path],
  next: {
    slug: String(e.frontmatter.nextSlug ?? ''),
    label: String(e.frontmatter.nextLabel ?? ''),
  },
}));

/** One tutorial by slug, or undefined. */
export function findTutorial(slug: string): Tutorial | undefined {
  return TUTORIALS.find((t) => t.slug === slug);
}
