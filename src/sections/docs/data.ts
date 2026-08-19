// The index over the /docs corpus. A plain .ts module (NOT a component file), so it may
// export data, types, and helpers freely.
//
// One authored source, two renderings: the human article view and the machine surface
// (llms.txt preview + structured capability index) are both derived from the same
// frontmatter — they cannot drift. Since the corpus conversion the PROSE lives in
// `docs/*.mdx` and this module indexes it; only the capability table below is still
// authored here, because it is a table, not an article.

import type { ComponentType } from 'react';
import { CORPUS_ENTRIES, corpusEntries } from '../../data/corpusIndex';
import type { CorpusHeading } from '../../data/corpusIndex';

/* ----------------------------------------------------------------- types -- */

export interface DocParam {
  name: string;
  type: string;
  desc: string;
}

export interface DocRejection {
  code: string;
  meaning: string;
}

export interface DocApi {
  kind: 'api';
  id: string;
  toc: string;
  sig: string;
  cap: string;
  capHref: string;
  params: DocParam[];
  returns: string;
  rejections: DocRejection[];
}

/**
 * A documentation page — now BACKED BY MDX in the `docs/` corpus rather than by a block
 * array here.
 *
 * What moved and why: the prose was 440 lines of `{kind:'p', text:'…'}` records, which meant
 * a typo fix was a code change and `tsc -b` stood between an author and a published
 * sentence. The prose is now an `.mdx` file with frontmatter, and this module is the INDEX
 * over it. What did NOT move is the structured data — an API signature's params and
 * rejection codes are still typed records, passed to `<ApiSignature/>` as JSX props, because
 * they are tabular data with a fixed shape that the machine surface reads too.
 *
 * `Body` is the compiled MDX component; render it with the corpus component map.
 */
export interface DocPage {
  group: string;
  slug: string;
  title: string;
  /** One-line description — reused verbatim in the llms.txt index. */
  lead: string;
  Body: ComponentType<{ components?: Record<string, unknown> }>;
  headings: CorpusHeading[];
}

export interface DocGroup {
  /** Mono uppercase label shown in the sidebar. */
  group: string;
  /** URL segment, e.g. "sdk" → /docs/sdk/<slug>. */
  key: string;
}

export interface CapEntry {
  name: string;
  desc: string;
  consent: string;
  rejects: string;
}

export interface TocItem {
  id: string;
  label: string;
}

/* -------------------------------------------------------------- helpers -- */

/** The repo-relative source of a page — the bytes behind it, in the platform's files space.
 *  The corpus is `.mdx`; the site used to advertise a per-page `.md` that was never generated
 *  in either environment, so every "raw" link 404'd. */
export function pageSourcePath(p: { group: string; slug: string }): string {
  return `docs/${p.group}--${p.slug}.mdx`;
}

export function pageHref(p: { group: string; slug: string }): string {
  return `/docs/${p.group}/${p.slug}`;
}

/** The article's H2s, in document order, as TOC anchors. The ids come from the checker,
 *  which computes them with the same `headingId()` the remark plugin renders — so a TOC link
 *  and its heading cannot disagree. */
export function tocFor(page: DocPage): TocItem[] {
  return page.headings.filter((h) => h.depth === 2).map((h) => ({ id: h.id, label: h.text }));
}

export function findPage(group: string, slug: string): DocPage | undefined {
  return DOC_PAGES.find((p) => p.group === group && p.slug === slug);
}

/** Linear prev/next across the whole reading order (sidebar order). */
export function neighbors(page: DocPage): {
  prev?: DocPage;
  next?: DocPage;
} {
  const i = DOC_PAGES.indexOf(page);
  return {
    prev: i > 0 ? DOC_PAGES[i - 1] : undefined,
    next: i >= 0 && i < DOC_PAGES.length - 1 ? DOC_PAGES[i + 1] : undefined,
  };
}

/* ----------------------------------------------------------------- pages -- */
// Derived from the `docs/` corpus. The file name carries the route:
// `<group>--<slug>.mdx` → `/docs/<group>/<slug>`. Reading order is the frontmatter
// `order`, which the checker requires, so the sidebar cannot silently reorder itself when
// a file is renamed.

export const DOC_PAGES: DocPage[] = corpusEntries('docs').map((e) => {
  const [group, slug] = e.slug.split('--');
  return {
    group,
    slug,
    title: String(e.frontmatter.title),
    lead: String(e.frontmatter.lead),
    Body: CORPUS_ENTRIES[e.path],
    headings: e.headings,
  };
});

/** The sidebar's synthetic entry for the machine surface. It is a ROUTE, not a corpus
 *  entry — there is no `agents/llms.mdx` because the page is generated from the capability
 *  table and the corpus frontmatter, not authored. Declared here so `Docs.tsx` does not have
 *  to fabricate a half-populated `DocPage` to put it in the nav. */
export const LLMS_NAV_ITEM: Pick<DocPage, 'group' | 'slug' | 'title' | 'lead'> = {
  group: 'agents',
  slug: 'llms',
  title: 'Reference, for agents.',
  lead: '',
};

/* ---------------------------------------------------------------- groups -- */

export const DOC_GROUPS: DocGroup[] = [
  { group: 'Getting started', key: 'start' },
  { group: 'SDK', key: 'sdk' },
  { group: 'Capabilities', key: 'capabilities' },
  { group: 'Agents', key: 'agents' },
];

/* -------------------------------------------------- machine surface data -- */
// The structured capability index — the same facts as the prose, as data an
// agent can read without scraping HTML.

export const CAP_INDEX: CapEntry[] = [
  {
    name: 'identity',
    desc: 'A stable, opaque handle for the signed-in user. No token, no secret.',
    consent: 'host session',
    rejects: 'auth-required · forbidden',
  },
  {
    name: 'filesystem',
    desc: 'Read and (if granted) write the mounts the host gave your app.',
    consent: 'per-mount',
    rejects: 'forbidden · EROFS',
  },
  {
    name: 'request-folder',
    desc: 'Ask the user to grant another folder or space through host UI.',
    consent: 'user picks',
    rejects: 'cancelled · forbidden',
  },
  {
    name: 'invoke-task',
    desc: 'Call a declared cross-app task contract, e.g. edit-file.',
    consent: 'declared',
    rejects: 'forbidden · invalid-params',
  },
  {
    name: 'network',
    desc: 'Fetch from explicitly allowed origins; no ambient cross-app reach.',
    consent: 'per-origin',
    rejects: 'forbidden · timeout',
  },
];

/** The llms.txt index — the same pages, grouped, as a link-rich machine index. */
export interface LlmsGroup {
  tag: string;
  items: { title: string; path: string; desc: string }[];
}

export function llmsGroups(): LlmsGroup[] {
  return DOC_GROUPS.map((g) => ({
    tag: g.group,
    items: DOC_PAGES.filter((p) => p.group === g.key).map((p) => ({
      title: p.title.replace(/\.$/, ''),
      path: `/docs/${g.key}/${p.slug}`,
      desc: p.lead,
    })),
  })).filter((g) => g.items.length > 0);
}
