// The site's omnibox data, as injectable hit sources (R3-530).
//
// `@immediately-run/omnibox` owns the component and the launch grammar; it owns no
// data — the package cannot import THIS app's directory records or its generated
// corpus index, or the dependency would run backwards. So the sources live here and
// are handed to the component as props: `apps` returns the raw candidates (the
// package ranks them), `docs` returns matched rows with their hrefs already
// resolved against the host (the package renders a plain anchor, so the href must
// be real — an app-space path would resolve against the sandbox origin on-host).

import type { AppHit, OmniboxHitSources } from '@immediately-run/omnibox';
import { APPS } from '../data/apps';
import { CORPUS_INDEX } from '../data/corpusIndex';
import { hrefFor } from './navigation';
import { useHostLocation } from '../hooks/useRoute';

/** The directory's app records as raw candidates — the package scores them. */
export function appHits(): AppHit[] {
  return APPS.map((a) => ({
    key: a.repo,
    name: a.name,
    category: a.categoryLabel,
    blurb: a.blurb,
    repo: a.repo,
    provenance: a.provenance,
  }));
}

interface CorpusHit {
  key: string;
  title: string;
  lead: string;
  /** In-site route, e.g. `/docs/start/overview` or `/tutorials/your-first-app`. */
  to: string;
}

/** Corpus rows matching the query in title or lead — the package caps nothing, so
 *  the cap stays here where the corpus lives: at most five rows. */
export function corpusHits(q: string): CorpusHit[] {
  const hits: CorpusHit[] = [];
  for (const entry of CORPUS_INDEX) {
    const title = String(entry.frontmatter.title ?? '');
    const lead = String(entry.frontmatter.lead ?? '');
    if (!title.toLowerCase().includes(q) && !lead.toLowerCase().includes(q)) continue;
    let to: string;
    if (entry.path.startsWith('docs/')) {
      const [group, slug] = entry.slug.split('--');
      to = `/docs/${group}/${slug}`;
    } else {
      to = `/${entry.path.replace(/\.mdx$/, '')}`;
    }
    hits.push({ key: entry.path, title, lead, to });
    if (hits.length >= 5) break; // at most five rows
  }
  return hits;
}

/** The sources for `<Omnibox hits={…}>`, with doc hrefs resolved against the
 *  host's outer origin at render time (they are data + location, not constants). */
export function useOmniboxHits(): OmniboxHitSources {
  const loc = useHostLocation();
  return {
    apps: appHits,
    docs: (query) =>
      corpusHits(query).map(({ key, title, lead, to }) => ({ key, title, lead, href: hrefFor(loc, to) })),
  };
}
