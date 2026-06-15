import './showcase.css';
import { useMemo, useState } from 'react';
import { APPS, CATEGORIES } from '../../data/apps';
import { presentRoute, editRoute } from '../../lib/routes';
import ProvenanceChip from '../../components/ProvenanceChip';

// The curated storefront, bound to #/showcase. Section hero, a one-row category
// filter, an asymmetric 6-col grid of real apps, and a route into the directory.
function Showcase() {
  const [active, setActive] = useState('all');
  const chips = [{ slug: 'all', label: 'All' }, ...CATEGORIES];

  const apps = useMemo(
    () => (active === 'all' ? APPS : APPS.filter((a) => a.category === active)),
    [active],
  );

  return (
    <div className="sc">
      <header className="sc-head">
        <span className="tag">/SHOWCASE</span>
        <h1 className="sc-title grad-text">Built with immediately.run.</h1>
        <p className="sc-lede">Real apps, running from their source. Open one, then take it apart.</p>
      </header>

      <div className="sc-chips" role="group" aria-label="Filter by category">
        {chips.map((c) => (
          <button
            key={c.slug}
            type="button"
            className={`sc-chip${active === c.slug ? ' sc-chip--active' : ''}`}
            aria-pressed={active === c.slug}
            onClick={() => setActive(c.slug)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {apps.length === 0 ? (
        <div className="sc-empty">
          <p className="sc-empty__title">No apps in this category yet.</p>
          <a className="sc-empty__link" href="#/apps">
            Browse all apps →
          </a>
        </div>
      ) : (
        <section className="sc-grid" aria-label="Apps built with immediately.run">
          {apps.map((app) => {
            const saturated = Boolean(app.variant);
            const cls = ['sc-tile', `sc-tile--${app.span}`, app.variant ? `sc-tile--${app.variant}` : '']
              .filter(Boolean)
              .join(' ');
            const corner = app.featured ? `${app.categoryLabel} · featured` : app.categoryLabel;
            return (
              <article className={cls} key={app.repo}>
                <div className="sc-pic">
                  <span className="sc-cat">{corner}</span>
                </div>
                <div className="sc-foot">
                  <h3 className="sc-name">{app.name}</h3>
                  <span className={saturated ? 'sc-prov sc-prov--sat' : 'sc-prov'}>
                    <ProvenanceChip provenance={app.provenance} />
                  </span>
                  <p className="sc-blurb">{app.blurb}</p>
                  <div className="sc-actions">
                    <a className="sc-btn sc-btn--open" href={presentRoute(app.repo, app.entry)}>
                      Open
                    </a>
                    <a className="sc-btn sc-btn--fork" href={editRoute(app.repo, app.entry)}>
                      Fork
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <div className="sc-browse">
        <a className="sc-btn sc-btn--browse" href="#/apps">
          Browse all apps →
        </a>
      </div>
    </div>
  );
}

export default Showcase;
