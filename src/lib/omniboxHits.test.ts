import { describe, expect, it } from 'vitest';
import { CORPUS_INDEX } from '../data/corpusIndex';
import { appHits, corpusHits } from './omniboxHits';

// The sources, not the component: the component's behavior (ranking, the grammar,
// degradation) is the package's suite. Here: the REAL data feeds the sources — the
// directory records and the generated corpus index — so a data change that would
// break the omnibox's rows surfaces in this repo, where the data lives.

describe('appHits (the app-directory source)', () => {
  it('returns every directory record as a candidate carrying its provenance', () => {
    const hits = appHits();
    expect(hits.length).toBeGreaterThan(0);
    const whiteboard = hits.find((h) => h.repo === 'whiteboard');
    expect(whiteboard).toBeTruthy();
    expect(whiteboard!.name).toBe('Whiteboard');
    expect(whiteboard!.provenance).toBeTruthy();
  });
});

describe('corpusHits (the docs source)', () => {
  it('returns at most five rows, with keys that are corpus paths', () => {
    const hits = corpusHits('the');
    expect(hits.length).toBeLessThanOrEqual(5);
    for (const hit of hits) expect(hit.to).toMatch(/^\//);
  });

  it('finds a real corpus entry by a word of its title, case-insensitively', () => {
    // Data-driven: pick an entry from the real generated index and query a word of
    // its title, so the test cannot drift from the corpus it runs against.
    const entry = CORPUS_INDEX.find((e) => String(e.frontmatter.title ?? '').trim().length > 3);
    expect(entry).toBeTruthy();
    const word = String(entry!.frontmatter.title).split(/\s+/)[0].toLowerCase();
    const hits = corpusHits(word);
    expect(hits.some((h) => h.key === entry!.path)).toBe(true);
  });

  it('maps docs corpus entries to /docs/<group>/<slug> routes', () => {
    const docEntry = CORPUS_INDEX.find((e) => e.path.startsWith('docs/'));
    if (!docEntry) return; // no docs corpus in this build — nothing to assert
    const word = String(docEntry.frontmatter.title).split(/\s+/)[0].toLowerCase();
    const doc = corpusHits(word).find((h) => h.key === docEntry.path);
    expect(doc).toBeTruthy();
    expect(doc!.to).toMatch(/^\/docs\/[^/]+\/[^/]+$/);
  });
});
