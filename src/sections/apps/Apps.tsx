import './apps.css';
import { useMemo, useState } from 'react';
import { APPS, CATEGORIES, CAPABILITIES, type AppRecord } from '../../data/apps';
import { presentRoute, editRoute } from '../../lib/routes';
import { usePlatformHref } from '../../hooks/useRoute';

type ProvKey = 'official' | 'community';
type SortKey = 'featured' | 'name' | 'category';
type View = 'rows' | 'grid';

interface Filters {
  cats: Set<string>;
  provs: Set<ProvKey>;
  caps: Set<string>;
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
];

const PROVENANCES: { key: ProvKey; label: string }[] = [
  { key: 'official', label: 'Official' },
  { key: 'community', label: 'Community' },
];

// Dot color per facet group — derived from brand tokens, not hard-coded hex.
const CAT_DOT = 'var(--accent)';
const PROV_DOT = 'var(--accent-2)';
const CAP_DOT = 'var(--accent-3)';

function provKey(app: AppRecord): ProvKey {
  return app.provenance === 'official' ? 'official' : 'community';
}

function matches(app: AppRecord, f: Filters): boolean {
  if (f.cats.size && !f.cats.has(app.category)) return false;
  if (f.provs.size && !f.provs.has(provKey(app))) return false;
  if (f.caps.size) {
    for (const c of f.caps) if (!(app.caps ?? []).includes(c)) return false;
  }
  return true;
}

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function sortApps(apps: AppRecord[], sort: SortKey): AppRecord[] {
  const out = [...apps];
  if (sort === 'name') out.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'category')
    out.sort(
      (a, b) =>
        a.categoryLabel.localeCompare(b.categoryLabel) || a.name.localeCompare(b.name),
    );
  else
    out.sort(
      (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
    );
  return out;
}

function ProvChip({ app, className }: { app: AppRecord; className?: string }) {
  if (app.provenance === 'official') {
    return <span className={`apps-prov ${className ?? ''}`}>official</span>;
  }
  return (
    <span className={`apps-prov apps-prov--community ${className ?? ''}`}>
      {`@github:${app.provenance.github}`}
    </span>
  );
}

function Cta({ app }: { app: AppRecord }) {
  const platform = usePlatformHref();
  return (
    <>
      <a className="apps-open" href={platform(presentRoute(app.repo, app.entry))} target="_top">
        Open
      </a>
      <a className="apps-fork" href={platform(editRoute(app.repo, app.entry))} target="_top">
        Fork
      </a>
    </>
  );
}

export default function Apps() {
  const [filters, setFilters] = useState<Filters>({
    cats: new Set(),
    provs: new Set(),
    caps: new Set(),
  });
  const [sort, setSort] = useState<SortKey>('featured');
  const [view, setView] = useState<View>('rows');
  const [sheetOpen, setSheetOpen] = useState(false);

  // Counts are computed from the FULL dataset per facet (independent of state).
  const catCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of APPS) m.set(a.category, (m.get(a.category) ?? 0) + 1);
    return m;
  }, []);
  const provCounts = useMemo(() => {
    const m = new Map<ProvKey, number>();
    for (const a of APPS) {
      const k = provKey(a);
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  }, []);
  const capCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of APPS) for (const c of a.caps ?? []) m.set(c, (m.get(c) ?? 0) + 1);
    return m;
  }, []);

  const results = useMemo(
    () => sortApps(APPS.filter((a) => matches(a, filters)), sort),
    [filters, sort],
  );

  const activeCount = filters.cats.size + filters.provs.size + filters.caps.size;
  const empty = results.length === 0;

  const clear = () =>
    setFilters({ cats: new Set(), provs: new Set(), caps: new Set() });

  const toggleCat = (slug: string) =>
    setFilters((f) => ({ ...f, cats: toggle(f.cats, slug) }));
  const toggleProv = (key: ProvKey) =>
    setFilters((f) => ({ ...f, provs: toggle(f.provs, key) }));
  const toggleCap = (slug: string) =>
    setFilters((f) => ({ ...f, caps: toggle(f.caps, slug) }));

  // R3-513 — one directory: the former showcase grid is a featured band at the
  // top of /apps, rendered with the SAME card the directory grid uses.
  const featured = useMemo(() => APPS.filter((a) => a.featured), []);

  return (
    <div className="apps-root">
      <span className="apps-tag">/APPS</span>
      <h1 className="apps-title">Apps built on immediately.run.</h1>
      <p className="apps-deck">
        Browse by category, author, or what an app is allowed to touch.
      </p>

      {featured.length > 0 && (
        <section className="apps-featured" aria-label="Featured apps">
          <div className="apps-grid">
            {featured.map((a) => (
              <article className="apps-card" key={a.repo}>
                <div className="apps-card-art">
                  <span className="apps-card-cat">{a.categoryLabel}</span>
                </div>
                <div className="apps-card-body">
                  <h3 className="apps-card-name">{a.name}</h3>
                  <ProvChip app={a} className="apps-card-prov" />
                  <p className="apps-card-blurb">{a.blurb}</p>
                  <div className="apps-card-cta">
                    <Cta app={a} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="apps-layout">
        <aside className="apps-rail">
          <div>
            <div className="apps-facet-head">Category</div>
            <div className="apps-facet-list">
              {CATEGORIES.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  className="apps-facet-row"
                  aria-pressed={filters.cats.has(c.slug)}
                  onClick={() => toggleCat(c.slug)}
                >
                  <span
                    className="apps-facet-dot"
                    style={{ background: CAT_DOT }}
                  />
                  <span className="apps-facet-label">{c.label}</span>
                  <span className="apps-facet-count">
                    {catCounts.get(c.slug) ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="apps-facet-head">Provenance</div>
            <div className="apps-facet-list">
              {PROVENANCES.filter((p) => (provCounts.get(p.key) ?? 0) > 0).length ===
              0 ? (
                <span className="apps-facet-empty">No authors yet.</span>
              ) : (
                PROVENANCES.map((p) => {
                  const n = provCounts.get(p.key) ?? 0;
                  if (n === 0) return null;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      className="apps-facet-row"
                      aria-pressed={filters.provs.has(p.key)}
                      onClick={() => toggleProv(p.key)}
                    >
                      <span
                        className="apps-facet-dot"
                        style={{ background: PROV_DOT }}
                      />
                      <span className="apps-facet-label">{p.label}</span>
                      <span className="apps-facet-count">{n}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <div className="apps-facet-head apps-facet-head--tight">Capability</div>
            <p className="apps-facet-help">Filter by what an app requests.</p>
            <div className="apps-facet-list">
              {CAPABILITIES.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  className="apps-facet-row apps-facet-row--mono"
                  aria-pressed={filters.caps.has(c.slug)}
                  onClick={() => toggleCap(c.slug)}
                >
                  <span
                    className="apps-facet-dot"
                    style={{ background: CAP_DOT }}
                  />
                  <span className="apps-facet-label">{c.label}</span>
                  <span className="apps-facet-count">
                    {capCounts.get(c.slug) ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="apps-results-bar">
            <span className="apps-count">{results.length} apps</span>
            <button
              type="button"
              className="apps-filters-btn"
              onClick={() => setSheetOpen(true)}
            >
              Filters {activeCount}
            </button>
            <div className="apps-controls">
              <div className="apps-pillgroup" role="group" aria-label="Sort">
                {SORTS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    className="apps-pill"
                    aria-pressed={sort === s.key}
                    onClick={() => setSort(s.key)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="apps-pillgroup" role="group" aria-label="View">
                <button
                  type="button"
                  className="apps-pill apps-pill--view"
                  aria-pressed={view === 'rows'}
                  aria-label="List view"
                  onClick={() => setView('rows')}
                >
                  Rows
                </button>
                <button
                  type="button"
                  className="apps-pill apps-pill--view"
                  aria-pressed={view === 'grid'}
                  aria-label="Grid view"
                  onClick={() => setView('grid')}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>

          {empty ? (
            <div className="apps-empty">
              <div className="apps-empty-title">No apps match these filters.</div>
              <button type="button" className="apps-empty-btn" onClick={clear}>
                Clear filters →
              </button>
            </div>
          ) : view === 'rows' ? (
            <ul className="apps-rows" aria-label="Apps">
              {results.map((a) => (
                <li className="apps-row" key={a.repo}>
                  <div className="apps-row-main">
                    <div className="apps-row-title">
                      <span className="apps-row-name">{a.name}</span>
                      <ProvChip app={a} />
                    </div>
                    <div className="apps-row-blurb">{a.blurb}</div>
                  </div>
                  <div className="apps-row-tags">
                    <span className="apps-tag-chip">{a.categoryLabel}</span>
                    {(a.caps ?? []).map((c) => (
                      <span className="apps-tag-chip apps-tag-chip--cap" key={c}>
                        {c}
                      </span>
                    ))}
                  </div>
                  <Cta app={a} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="apps-grid">
              {results.map((a) => (
                <article className="apps-card" key={a.repo}>
                  <div className="apps-card-art">
                    <span className="apps-card-cat">{a.categoryLabel}</span>
                  </div>
                  <div className="apps-card-body">
                    <h3 className="apps-card-name">{a.name}</h3>
                    <ProvChip app={a} className="apps-card-prov" />
                    <p className="apps-card-blurb">{a.blurb}</p>
                    <div className="apps-card-cta">
                      <Cta app={a} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {sheetOpen && (
        <div
          className="apps-sheet-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          onClick={() => setSheetOpen(false)}
        >
          <div className="apps-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="apps-sheet-head">
              <span className="apps-sheet-title">Filters</span>
              <button
                type="button"
                className="apps-sheet-close"
                aria-label="Close filters"
                onClick={() => setSheetOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="apps-sheet-group">Sort</div>
            <div className="apps-sheet-chips">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className="apps-sheet-chip"
                  aria-pressed={sort === s.key}
                  onClick={() => setSort(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="apps-sheet-group">Category</div>
            <div className="apps-sheet-chips">
              {CATEGORIES.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  className="apps-sheet-chip"
                  aria-pressed={filters.cats.has(c.slug)}
                  onClick={() => toggleCat(c.slug)}
                >
                  {c.label} {catCounts.get(c.slug) ?? 0}
                </button>
              ))}
            </div>

            <div className="apps-sheet-group">Provenance</div>
            {PROVENANCES.filter((p) => (provCounts.get(p.key) ?? 0) > 0).length ===
            0 ? (
              <div className="apps-sheet-empty">No authors yet.</div>
            ) : (
              <div className="apps-sheet-chips">
                {PROVENANCES.map((p) => {
                  const n = provCounts.get(p.key) ?? 0;
                  if (n === 0) return null;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      className="apps-sheet-chip"
                      aria-pressed={filters.provs.has(p.key)}
                      onClick={() => toggleProv(p.key)}
                    >
                      {p.label} {n}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="apps-sheet-group">Capability</div>
            <div className="apps-sheet-chips">
              {CAPABILITIES.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  className="apps-sheet-chip apps-sheet-chip--mono"
                  aria-pressed={filters.caps.has(c.slug)}
                  onClick={() => toggleCap(c.slug)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="apps-sheet-show"
              onClick={() => setSheetOpen(false)}
            >
              Show {results.length} apps
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
