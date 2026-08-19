import { useEffect, useMemo, useRef, useState } from 'react';
import { APPS } from '../data/apps';
import { presentRoute } from '../lib/routes';
import { usePlatformHref } from '../hooks/useRoute';
import SiteLink from './SiteLink';

interface SearchProps {
  onClose: () => void;
}

/**
 * A search hit is one of two kinds, and conflating them is what a single `href` field did:
 *
 *   - `to` — an app-space route (`/docs`, `/tutorials/…`). Rendered as a <SiteLink>, so it
 *     routes in place and its href is a real host URL under the platform prefix.
 *   - `href` — a link that LEAVES the app: a platform route (`/present/…`, `/edit/…`) or an
 *     external URL. A plain <a>; routing it in place would be wrong, since the destination
 *     is not this app.
 *
 * Splitting the field makes the distinction checkable instead of a convention — the union
 * means neither can be rendered by the other's element.
 */
type Entry = {
  name: string;
  sub: string;
  slug: string;
} & ({ to: string; href?: never } | { href: string; to?: never });

// One ranked list across apps, docs, and tutorials, grouped by source — owned by
// the shell in the full site; a self-contained version here so the ⌘K button is
// never dead. Section search is intentionally lightweight.
const SECTIONS: Entry[] = [
  { name: 'Showcase', sub: 'Curated apps built with immediately.run', slug: '/SHOWCASE', to: '/showcase' },
  { name: 'Apps', sub: 'The full, filterable app directory', slug: '/APPS', to: '/apps' },
  { name: 'Docs', sub: 'API and reference', slug: '/DOCS', to: '/docs' },
  { name: 'Tutorials', sub: 'Step-by-step workflows', slug: '/TUTORIALS', to: '/tutorials' },
  { name: "What's new", sub: 'Latest releases and notes', slug: '/NEWS', to: '/changelog' },
];

const TUTORIALS: Entry[] = [
  { name: 'Your first app', sub: 'Push a repo, no deploy step', slug: '/TUTORIALS', to: '/tutorials' },
  { name: 'Change an app by asking', sub: 'Drive a coding agent over a running app', slug: '/TUTORIALS', to: '/tutorials/local-claude-code' },
];

const APP_ENTRIES: Entry[] = APPS.map((a) => ({
  name: a.name,
  sub: a.blurb,
  slug: '/SHOWCASE',
  href: presentRoute(a.repo),
}));

const GROUPS: { heading: string; entries: Entry[] }[] = [
  { heading: 'Apps', entries: APP_ENTRIES },
  { heading: 'Sections', entries: SECTIONS },
  { heading: 'Tutorials', entries: TUTORIALS },
];

function Search({ onClose }: SearchProps) {
  const platform = usePlatformHref();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GROUPS;
    return GROUPS.map((g) => ({
      heading: g.heading,
      entries: g.entries.filter(
        (e) => e.name.toLowerCase().includes(q) || e.sub.toLowerCase().includes(q),
      ),
    })).filter((g) => g.entries.length > 0);
  }, [query]);

  const isEmpty = groups.length === 0;

  return (
    <div
      className="search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search apps, docs, and tutorials"
      onClick={onClose}
    >
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          placeholder="Search apps, docs, and tutorials"
          aria-label="Search apps, docs, and tutorials"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isEmpty ? (
          <div className="search-empty">
            Nothing matched. Try an app name, a capability, or a tutorial.
          </div>
        ) : (
          <div className="search-results">
            {groups.map((g) => (
              <div className="search-group" key={g.heading}>
                <div className="gh">{g.heading}</div>
                {g.entries.map((e) => {
                  const body = (
                    <>
                      <span>
                        <span className="si-name">{e.name}</span>
                        <br />
                        <span className="si-sub">{e.sub}</span>
                      </span>
                      <span className="si-slug">{e.slug}</span>
                    </>
                  );
                  const key = e.name + (e.to ?? e.href);
                  return e.to !== undefined ? (
                    <SiteLink className="search-item" to={e.to} key={key} onClick={onClose}>
                      {body}
                    </SiteLink>
                  ) : (
                    <a className="search-item" href={e.href ? platform(e.href) : undefined} key={key} onClick={onClose}>
                      {body}
                    </a>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
