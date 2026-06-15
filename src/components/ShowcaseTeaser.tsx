import ProvenanceChip from './ProvenanceChip';
import { SHOWCASE } from '../data/showcase';
import { presentRoute, editRoute } from '../lib/routes';

// A trimmed slice of the full showcase grid. The same app record renders here,
// in the directory, and in the machine surface (full grid lives at /showcase).
function ShowcaseTeaser() {
  return (
    <section className="section" aria-labelledby="teaser">
      <div className="sec-head">
        <span className="tag">/SHOWCASE</span>
        <h2 id="teaser">Built with immediately.run.</h2>
        <a className="more" href="/showcase">
          See all apps →
        </a>
      </div>
      <div className="show-grid">
        {SHOWCASE.map((app) => (
          <article className="app-card" key={app.repo}>
            <div className="app-pic">
              {app.stars && <span className="stars">★ {app.stars}</span>}
              <span className="cat">{app.category}</span>
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
