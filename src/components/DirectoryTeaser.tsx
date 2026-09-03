import { APPS, appsByRepo, TEASER_REPOS } from '../data/apps';
import SiteLink from './SiteLink';
import AppTile from './AppTile';

// The directory teaser (R3-514; FRONT_DOOR_IA §4.6, renamed from
// ShowcaseTeaser): the one directory's shop window on `/`. The count is
// COMPUTED from APPS.length — never typed — and the four tiles are distinct
// from the Run section's four (§4.3). Fork lives on the tiles (AppTile).

const TEASER = appsByRepo(TEASER_REPOS);

function DirectoryTeaser() {
  return (
    <section className="section" aria-labelledby="teaser">
      <div className="sec-head">
        <span className="tag">/APPS</span>
        <h2 id="teaser">Built on immediately.run.</h2>
        <SiteLink className="more" to="/apps">
          See all {APPS.length} apps →
        </SiteLink>
      </div>
      <div className="show-grid">
        {TEASER.map((app) => (
          <AppTile key={app.repo} app={app} />
        ))}
      </div>
    </section>
  );
}

export default DirectoryTeaser;
