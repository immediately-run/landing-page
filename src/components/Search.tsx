import { useEffect, useMemo, useRef, useState } from 'react';
import { APPS } from '../data/apps';
import { presentRoute } from '../lib/routes';

interface SearchProps {
  onClose: () => void;
}

interface Entry {
  name: string;
  sub: string;
  slug: string;
  href: string;
}

// One ranked list across apps, docs, and tutorials, grouped by source — owned by
// the shell in the full site; a self-contained version here so the ⌘K button is
// never dead. Section search is intentionally lightweight.
const SECTIONS: Entry[] = [
  { name: 'Showcase', sub: 'Curated apps built with immediately.run', slug: '/SHOWCASE', href: '#/showcase' },
  { name: 'Apps', sub: 'The full, filterable app directory', slug: '/APPS', href: '#/apps' },
  { name: 'Docs', sub: 'API and reference', slug: '/DOCS', href: '#/docs' },
  { name: 'Tutorials', sub: 'Step-by-step workflows', slug: '/TUTORIALS', href: '#/tutorials' },
  { name: "What's new", sub: 'Latest releases and notes', slug: '/NEWS', href: '#/changelog' },
];

const TUTORIALS: Entry[] = [
  { name: 'Your first app', sub: 'Push a repo, no deploy step', slug: '/TUTORIALS', href: '#/tutorials' },
  { name: 'Change an app by asking', sub: 'Drive a coding agent over a running app', slug: '/TUTORIALS', href: '#/tutorials/local-claude-code' },
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
                {g.entries.map((e) => (
                  <a className="search-item" href={e.href} key={e.name + e.href} onClick={onClose}>
                    <span>
                      <span className="si-name">{e.name}</span>
                      <br />
                      <span className="si-sub">{e.sub}</span>
                    </span>
                    <span className="si-slug">{e.slug}</span>
                  </a>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
