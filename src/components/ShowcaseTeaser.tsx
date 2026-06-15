import ProvenanceChip from './ProvenanceChip';
import { APPS } from '../data/apps';
import { presentRoute, editRoute } from '../lib/routes';

// A trimmed slice of the full showcase grid. The same app record renders here,
// in the showcase, in the directory, and in search (full grid lives at #/showcase).
const TEASER = APPS.slice(0, 4);

function ShowcaseTeaser() {
  return (
    <section className="section" aria-labelledby="teaser">
      <div className="sec-head">
        <span className="tag">/SHOWCASE</span>
        <h2 id="teaser">Built with immediately.run.</h2>
        <a className="more" href="#/showcase">
          See all apps →
        </a>
      </div>
      <div className="show-grid">
        {TEASER.map((app) => (
          <article className="app-card" key={app.repo}>
            <div className="app-pic">
              <span className="cat">{app.categoryLabel}</span>
            </div>
            <div className="app-foot">
              <h3>{app.name}</h3>
              <ProvenanceChip provenance={app.provenance} />
              <p>{app.blurb}</p>
              <div className="app-actions">
                <a className="open" href={presentRoute(app.repo)}>
                  Open
                </a>
                <a className="fork" href={editRoute(app.repo)}>
                  Fork
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ShowcaseTeaser;
