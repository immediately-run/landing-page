import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import './omnibox.css';
import { parseLaunch, PROVIDERS, type Launch } from '../lib/launch';
import { APPS, type Provenance } from '../data/apps';
import { CORPUS_INDEX } from '../data/corpusIndex';
import ProvenanceChip from './ProvenanceChip';
import SiteLink from './SiteLink';
import { usePlatformHref } from '../hooks/useRoute';
import { focusHeroOmnibox, registerOmniboxFocus } from '../lib/omniboxFocus';

// The omnibox (R3-512; FRONT_DOOR_IA §5) — the front door's primary control. It
// does W1 (run a repo by URL or tuple) and W2 (find an app) in one place, as a
// WAI-ARIA list-autocomplete combobox with three result groups of ONE action per
// row. Run and Open rows are real links built with `platformHref` and carry
// `target="_top"`: a platform route navigates the HOST document, and a
// root-relative href inside the sandboxed frame would resolve against the
// sandbox origin and land nowhere.

export type OmniboxVariant = 'hero' | 'nav' | 'new';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false,
  );
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/* ── search over the directory and the corpus ──────────────────────────── */

interface AppHit {
  key: string;
  name: string;
  category: string;
  blurb: string;
  repo: string;
  provenance: Provenance;
}

/** name-prefix > name-substring > repo > blurb > category (FRONT_DOOR_IA §5.3). */
function appScore(hit: AppHit, q: string): number {
  if (hit.name.toLowerCase().startsWith(q)) return 4;
  if (hit.name.toLowerCase().includes(q)) return 3;
  if (hit.repo.toLowerCase().includes(q)) return 2;
  if (hit.blurb.toLowerCase().includes(q)) return 1;
  if (hit.category.toLowerCase().includes(q)) return 0;
  return -1;
}

interface CorpusHit {
  key: string;
  title: string;
  lead: string;
  /** In-site route, e.g. `/docs/start/overview` or `/tutorials/your-first-app`. */
  to: string;
}

function corpusHits(q: string): CorpusHit[] {
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

/* ── the component ──────────────────────────────────────────────────────── */

interface OmniboxProps {
  variant: OmniboxVariant;
  /** Nav variant only: true while the hero omnibox is mounted (`/`), so the
   *  nav field renders as the shortcut that focuses it. Derived by the caller
   *  from the route — render-time data, not an effect. */
  heroShortcut?: boolean;
}

function Omnibox({ variant, heroShortcut = false }: OmniboxProps) {
  const platformHref = usePlatformHref();
  const isMobile = useMediaQuery('(max-width: 720px)');
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const inputId = `${listId}-input`;
  const helperId = useId();
  const noticeId = useId();

  const parsed: Launch = useMemo(() => parseLaunch(query), [query]);
  const runnable = parsed.kind === 'location' || parsed.kind === 'platform-url';
  const runHref =
    parsed.kind === 'location'
      ? platformHref(parsed.presentPath)
      : parsed.kind === 'platform-url'
        ? platformHref(parsed.path)
        : undefined;

  const panelOpen = query.trim() !== '';

  // Adjusting state during render (the sanctioned pattern): the highlight must
  // not survive the option set changing under it, and an effect would cascade.
  const [prevQuery, setPrevQuery] = useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    setHighlight(-1);
  }

  // Unknown provider → the notice replaces the helper line's text and is
  // announced through the live region.
  const notice =
    parsed.kind === 'unknown-provider'
      ? `${parsed.provider.charAt(0).toUpperCase()}${parsed.provider.slice(1)} is not supported yet. GitHub works today.`
      : '';

  const helper =
    variant === 'new' ? 'the repo you just created' : 'Accepts provider:namespace/repository@ref · GitHub is the first provider';

  const appHits = useMemo(() => {
    if (!panelOpen) return [];
    const q = query.trim().toLowerCase();
    return APPS.map((a) => ({
      key: a.repo,
      name: a.name,
      category: a.categoryLabel,
      blurb: a.blurb,
      repo: a.repo,
      provenance: a.provenance,
    }))
      .map((hit) => ({ hit, score: appScore(hit, q) }))
      .filter(({ score }) => score >= 0)
      .sort((a, b) => b.score - a.score)
      .map(({ hit }) => hit);
  }, [panelOpen, query]);

  const docHits = useMemo(() => (panelOpen ? corpusHits(query.trim().toLowerCase()) : []), [panelOpen, query]);

  const locationRow = parsed.kind === 'location' ? parsed : undefined;
  const hasResults = Boolean(locationRow) || appHits.length > 0 || docHits.length > 0;

  // Flattened options, in group order — the arrow-key walk and the highlight id
  // both read this list.
  const options = useMemo(() => {
    const list: { id: string; label: string }[] = [];
    if (locationRow) list.push({ id: `${listId}-opt-location`, label: locationRow.display });
    for (const hit of appHits) list.push({ id: `${listId}-opt-${hit.key}`, label: hit.name });
    for (const hit of docHits) list.push({ id: `${listId}-opt-doc-${hit.key}`, label: hit.title });
    return list;
  }, [locationRow, appHits, docHits, listId]);

  // Register with the focus registry (⌘K and the nav shortcut both land here).
  useEffect(() => registerOmniboxFocus(variant === 'hero' ? 'hero' : 'nav', () => inputRef.current?.focus()), [variant]);

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!panelOpen || options.length === 0) return;
        e.preventDefault();
        setHighlight((h) => {
          if (h === -1) return e.key === 'ArrowDown' ? 0 : options.length - 1;
          return (h + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        });
        return;
      }
      if (e.key === 'Enter') {
        if (highlight >= 0 && highlight < options.length) {
          e.preventDefault();
          document.getElementById(options[highlight].id)?.click();
          return;
        }
        if (runnable) {
          e.preventDefault();
          document.getElementById(`${listId}-run`)?.click();
        }
        return;
      }
      if (e.key === 'Escape') {
        // Close the panel, then clear the highlight, then blur — in that order.
        setQuery('');
        setHighlight(-1);
        inputRef.current?.blur();
      }
    },
    [panelOpen, options, highlight, runnable, listId],
  );

  const chip = (
    <span className="omnibox-chip" aria-hidden={Object.keys(PROVIDERS).length === 1 || undefined}>
      {Object.keys(PROVIDERS).length === 1 ? (
        // One provider: a static label with no caret — NOT a dropdown of
        // providers that do not exist.
        <span className="omnibox-chip-label">github</span>
      ) : (
        <select className="omnibox-chip-select" aria-label="Provider">
          {Object.keys(PROVIDERS).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      )}
    </span>
  );

  const run = runnable ? (
    <a
      id={`${listId}-run`}
      className="omnibox-run"
      href={runHref}
      target="_top"
      aria-label="Run"
    >
      <span className="omnibox-run-label">Run</span>
      <span className="omnibox-run-arrow" aria-hidden="true">
        →
      </span>
    </a>
  ) : (
    <button
      id={`${listId}-run`}
      type="button"
      className="omnibox-run"
      aria-disabled="true"
      aria-describedby={`${helperId} ${noticeId}`}
      onClick={(e) => e.preventDefault()}
    >
      <span className="omnibox-run-label">Run</span>
      <span className="omnibox-run-arrow" aria-hidden="true">
        →
      </span>
    </button>
  );

  const field = (
    <div className={`omnibox omnibox--${variant}`}>
      <div className="omnibox-row">
        {chip}
        <input
          ref={inputRef}
          id={inputId}
          className="omnibox-input"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={panelOpen}
          aria-controls={panelOpen ? listId : undefined}
          aria-activedescendant={highlight >= 0 ? options[highlight]?.id : undefined}
          aria-describedby={`${helperId} ${noticeId}`}
          aria-invalid={notice ? true : undefined}
          placeholder={isMobile ? 'Paste a repo or an app name' : 'owner/repo@branch, a GitHub URL, or an app name'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
        {run}
      </div>
      <p className="omnibox-helper" id={helperId}>
        {notice || helper}
      </p>
      {/* The live region announces the notice; empty in the common case. */}
      <p className="omnibox-visually-hidden" id={noticeId} aria-live="polite">
        {notice}
      </p>
      {panelOpen && (
        <div className="omnibox-panel" id={listId} role="listbox" aria-label="Results">
          {hasResults ? (
            <>
              {locationRow && (
                <div className="omnibox-group" role="group" aria-label="Run from source">
                  <a
                    id={`${listId}-opt-location`}
                    className="omnibox-option"
                    role="option"
                    aria-selected={highlight === 0}
                    href={runHref}
                    target="_top"
                  >
                    <span className="omnibox-option-name">{locationRow.display}</span>
                    <span className="omnibox-option-action">Run</span>
                  </a>
                </div>
              )}
              {appHits.length > 0 && (
                <div className="omnibox-group" role="group" aria-label="Apps in the directory">
                  {appHits.map((hit) => {
                    const idx = options.findIndex((o) => o.id === `${listId}-opt-${hit.key}`);
                    return (
                      <a
                        key={hit.key}
                        id={`${listId}-opt-${hit.key}`}
                        className="omnibox-option"
                        role="option"
                        aria-selected={highlight === idx}
                        href={platformHref(`/present/github/immediately-run/${hit.repo}/main/files/src/App.tsx`)}
                        target="_top"
                      >
                        <span className="omnibox-option-name">{hit.name}</span>
                        <span className="omnibox-option-cat">{hit.category}</span>
                        <span className="omnibox-option-blurb">{hit.blurb}</span>
                        <ProvenanceChip provenance={hit.provenance} />
                      </a>
                    );
                  })}
                </div>
              )}
              {docHits.length > 0 && (
                <div className="omnibox-group" role="group" aria-label="Docs and tutorials">
                  {docHits.map((hit) => {
                    const idx = options.findIndex((o) => o.id === `${listId}-opt-doc-${hit.key}`);
                    return (
                      <SiteLink
                        key={hit.key}
                        id={`${listId}-opt-doc-${hit.key}`}
                        className="omnibox-option"
                        role="option"
                        aria-selected={highlight === idx}
                        to={hit.to}
                      >
                        <span className="omnibox-option-name">{hit.title}</span>
                        <span className="omnibox-option-blurb">{hit.lead}</span>
                      </SiteLink>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="omnibox-empty">Nothing matched. Try an app name, or paste a repo.</div>
          )}
        </div>
      )}
    </div>
  );

  // The nav variant collapses to a shortcut button while the hero omnibox is
  // mounted (on `/`): activating it focuses the hero field. On every other
  // route the field expands in place.
  if (variant === 'nav' && heroShortcut) {
    return (
      <button
        type="button"
        className="omnibox-nav-button"
        onClick={() => focusHeroOmnibox()}
        aria-label="Search apps and docs, or paste a repo"
      >
        <span className="omnibox-nav-button-label">Search</span>
        <span className="kbd">⌘K</span>
      </button>
    );
  }

  return (
    <div className={`omnibox-outer omnibox-outer--${variant}`}>
      <label className="omnibox-visually-hidden" htmlFor={inputId}>
        Paste a repo, or search apps and docs
      </label>
      {field}
    </div>
  );
}

export default Omnibox;
