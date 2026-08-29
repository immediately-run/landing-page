import './docs.css';
import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import {
  DOC_GROUPS,
  DOC_PAGES,
  CAP_INDEX,
  llmsGroups,
  LLMS_NAV_ITEM,
  pageHref,
  tocFor,
  findPage,
  neighbors,
  pageSourcePath,
} from './data';
import type { DocGroup, DocPage, TocItem } from './data';
import { CORPUS_COMPONENTS } from '../../corpus/components';
import SiteLink from '../../components/SiteLink';
import { LLMS_TXT } from '../../data/corpusIndex';
import { rawUrl, sourceUrl } from '../../lib/routes';

// The /docs section: the technical reference, served to two audiences from one
// source. The same typed records in data.ts render both the human article view
// and the machine surface (llms.txt preview + structured capability index), so
// the two can never drift.
//
// Routing is by the `rest` segments after `docs`:
//   []                  → docs landing (group index)
//   ['agents','llms']   → machine surface
//   [group, slug]       → an article, when it resolves
//   anything else       → an inline 404
//
// One default export per file (lint enforces the Fast Refresh rule); the small
// child components below export nothing.
export default function Docs({ rest }: { rest: string[] }) {
  const [copied, setCopied] = useState<string>('');

  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(key);
        window.setTimeout(() => setCopied((c) => (c === key ? '' : c)), 1600);
      },
      () => undefined,
    );
  }, []);

  const goAnchor = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Resolve the current view before any branching in JSX (hooks already ran).
  const isLlms = rest[0] === 'agents' && rest[1] === 'llms';
  const page = rest.length >= 2 ? findPage(rest[0], rest[1]) : undefined;
  const active = isLlms ? 'agents/llms' : page ? `${page.group}/${page.slug}` : '';

  let main: ReactNode;
  let toc: TocItem[] = [];
  if (isLlms) {
    main = <MachineSurface copied={copied} copy={copy} />;
  } else if (rest.length === 0) {
    main = <DocsIndex />;
  } else if (page) {
    toc = tocFor(page);
    main = <Article page={page} />;
  } else {
    main = <NotFound />;
  }

  return (
    <div className="docs-layout">
      <Sidebar active={active} />
      <article className="docs-article">{main}</article>
      <aside className="docs-toc" aria-label="On this page">
        {toc.length > 0 && <Toc items={toc} go={goAnchor} />}
      </aside>
    </div>
  );
}

function Sidebar({ active }: { active: string }) {
  return (
    <aside className="docs-aside" aria-label="Documentation navigation">
      <span className="docs-tag">/DOCS</span>
      {DOC_GROUPS.map((g: DocGroup) => {
        const pages = DOC_PAGES.filter((p) => p.group === g.key);
        const items: Pick<DocPage, 'group' | 'slug' | 'title'>[] =
          g.key === 'agents' ? [...pages, LLMS_NAV_ITEM] : pages;
        if (items.length === 0) return null;
        return (
          <div key={g.key}>
            <div className="docs-navgroup-label">{g.group}</div>
            <nav className="docs-navlinks">
              {items.map((p) => {
                const href = pageHref(p);
                const isActive = active === `${p.group}/${p.slug}`;
                return (
                  <SiteLink
                    key={p.slug}
                    to={href}
                    className={`docs-navlink${isActive ? ' docs-navlink--active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {p.title.replace(/\.$/, '')}
                  </SiteLink>
                );
              })}
            </nav>
          </div>
        );
      })}
    </aside>
  );
}

function Toc({ items, go }: { items: TocItem[]; go: (id: string) => void }) {
  return (
    <>
      <div className="docs-toc-label">On this page</div>
      <div className="docs-toc-links">
        {items.map((t) => (
          <button
            key={t.id}
            type="button"
            className="docs-toc-link"
            onClick={() => go(t.id)}
          >
            {t.label.replace(/\.$/, '')}
          </button>
        ))}
      </div>
    </>
  );
}

function DocsIndex() {
  return (
    <div>
      <span className="docs-machine-tag">/DOCS</span>
      <h1 className="docs-machine-h1">Reference, for humans and agents.</h1>
      <p className="docs-machine-lead">
        The SDK, the capability model, providers, spaces, and agents — one source, two views.
      </p>
      <div className="docs-index-grid">
        {DOC_GROUPS.map((g) => {
          const pages = DOC_PAGES.filter((p) => p.group === g.key);
          const first = g.key === 'agents' ? undefined : pages[0];
          const href = first ? pageHref(first) : '/docs/agents/llms';
          const lead = first ? first.lead : 'The machine surface — llms.txt, raw markdown, and a structured capability index.';
          const name = first ? first.title : 'Reference, for agents.';
          return (
            <SiteLink key={g.key} className="docs-index-card" to={href}>
              <div className="docs-navgroup-label">{g.group}</div>
              <div className="docs-index-name">{name.replace(/\.$/, '')}</div>
              <p className="docs-index-lead">{lead}</p>
            </SiteLink>
          );
        })}
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="docs-404">
      <div className="docs-404-title">This page didn't load.</div>
      <p className="docs-404-body">Try another topic from the sidebar, or head back to the docs index.</p>
      <SiteLink className="docs-btn docs-btn--open" to="/docs">
        All docs →
      </SiteLink>
    </div>
  );
}

function MachineSurface({
  copied,
  copy,
}: {
  copied: string;
  copy: (text: string, key: string) => void;
}) {
  const groups = llmsGroups();
  // The generated bytes, not a second rendering of them: `LLMS_TXT` is emitted by
  // `check-corpora.mjs` alongside `public/llms.txt`, so Copy hands over exactly what
  // the file contains and the two cannot drift.
  const raw = LLMS_TXT;

  return (
    <div>
      <span className="docs-machine-tag">/DOCS · MACHINE SURFACE</span>
      <h1 className="docs-machine-h1">Reference, for agents.</h1>
      <p className="docs-machine-lead">
        A curated, link-rich index in the llms.txt convention — the platform definition, every
        reference page with a stable URL, and the repo path of the source behind it. For the
        SDK's own surface, go to its generated reference: it is produced by TypeDoc from the
        published package on every release, so unlike this page it cannot drift from the code.
      </p>
      <div className="docs-pills">
        {/* The SDK's llms.txt / api.json / HTML reference are GENERATED (typedoc + gen-llms
            in the SDK's release CI) and published to its own Pages origin. This site used to
            link none of them and hand-authored a couple of signatures instead — which is how
            a `requestFolder()` that never existed survived in the reference for months.
            Point at the generated artifact; do not restate it here. */}
        <a
          className="docs-pill docs-pill--primary"
          href="https://immediately-run.github.io/immediately-run-sdk/llms.txt"
          target="_blank"
          rel="noopener"
        >
          SDK llms.txt
        </a>
        <a
          className="docs-pill"
          href="https://immediately-run.github.io/immediately-run-sdk/"
          target="_blank"
          rel="noopener"
        >
          SDK API reference
        </a>
        {/* One real URL. Both of these used to be root-relative paths to a file that was
            generated in neither environment — and inside the sandboxed iframe a root-relative
            href resolves against `sandbox.<host>` on top of that. It is now a repo file,
            served from the platform's files space. */}
        <a className="docs-pill docs-pill--primary" href={rawUrl('public/llms.txt')}>
          llms.txt
        </a>
      </div>

      <div className="docs-llms">
        <div className="docs-llms-bar">
          <span className="docs-llms-name">llms.txt</span>
          <button
            type="button"
            className="docs-copy"
            onClick={() => copy(raw, 'llms')}
            aria-label="Copy llms.txt"
          >
            {copied === 'llms' ? 'Copied' : 'Copy'}
          </button>
          <span className="docs-llms-mime">text/plain</span>
        </div>
        <div className="docs-llms-body">
          <div className="docs-llms-h1"># immediately.run</div>
          <div>
            &gt; Apps you can take apart. Run any React/TS app from its source, in the browser. Fork
            and contribute back from the page itself.
          </div>
          <div className="docs-llms-spacer" />
          {groups.map((g) => (
            <div key={g.tag}>
              <div className="docs-llms-tag">## {g.tag}</div>
              {g.items.map((it) => (
                <div key={it.path}>
                  - [{it.title}]({it.path}): {it.desc}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <h2 className="docs-h2" id="capability-index">
        Structured capability index
      </h2>
      <p className="docs-p">
        The capability surface as machine data — so an agent can discover what it can ask for, and
        how, without scraping HTML.
      </p>
      <div className="docs-capwrap" role="table" aria-label="Capability index">
        <div className="docs-caprow docs-caprow--head" role="row">
          <span role="columnheader">name</span>
          <span role="columnheader">description</span>
          <span role="columnheader">consent</span>
          <span role="columnheader">rejections</span>
        </div>
        {CAP_INDEX.map((c) => (
          <div className="docs-caprow" role="row" key={c.name}>
            <span className="docs-cap-name" role="cell">
              {c.name}
            </span>
            <span className="docs-cap-desc" role="cell">
              {c.desc}
            </span>
            <span className="docs-cap-mono" role="cell">
              {c.consent}
            </span>
            <span className="docs-cap-mono" role="cell">
              {c.rejects}
            </span>
          </div>
        ))}
      </div>
      <p className="docs-md-note">
        {/* This claimed a `.md` suffix that was never generated. The real bytes are the
            corpus `.mdx`, which the platform already serves from its files space. */}
        Every page links to its own source — the corpus{' '}
        <span className="docs-md-suffix">.mdx</span>, free of site chrome.
      </p>
    </div>
  );
}

function Article({ page }: { page: DocPage }) {
  const { prev, next } = neighbors(page);
  const mdSource = pageSourcePath(page);

  return (
    <>
      <h1 className="docs-h1">{page.title}</h1>
      <p className="docs-lead">{page.lead}</p>
      <page.Body components={CORPUS_COMPONENTS} />

      <nav className="docs-nav" aria-label="Pagination">
        {prev ? (
          <SiteLink className="docs-navcard" to={pageHref(prev)}>
            <div className="docs-navcard-dir">← Previous</div>
            <div className="docs-navcard-label">{prev.title.replace(/\.$/, '')}</div>
          </SiteLink>
        ) : (
          <span className="docs-navcard docs-navcard--ghost" aria-hidden="true" />
        )}
        {next ? (
          <SiteLink className="docs-navcard docs-navcard--next" to={pageHref(next)}>
            <div className="docs-navcard-dir">Next →</div>
            <div className="docs-navcard-label">{next.title.replace(/\.$/, '')}</div>
          </SiteLink>
        ) : (
          <span className="docs-navcard docs-navcard--ghost" aria-hidden="true" />
        )}
      </nav>

      <div className="docs-footnote">
        Reading this as an agent? Start at{' '}
        <SiteLink to="/docs/agents/llms">/llms.txt</SiteLink> · source:{' '}
        <a href={sourceUrl(mdSource)}>{mdSource}</a>
      </div>
    </>
  );
}
