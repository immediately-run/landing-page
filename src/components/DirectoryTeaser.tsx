import { APPS, appsByRepo, TEASER_REPOS } from '../data/apps';
import SiteLink from './SiteLink';
import AppTile from './AppTile';

// The directory teaser (FRONT_DOOR_IA §4.10): the one directory's shop window on
// `/`. The count is COMPUTED from APPS.length — never typed — and the heading
// names what the shelf is rather than what it is built on, because by this point
// in the page the reader has been told what it is built on twice.

const TEASER = appsByRepo(TEASER_REPOS);

function DirectoryTeaser() {
  return (
    <section className="section" aria-labelledby="teaser">
      <div className="sec-head">
        <div className="sec-head-row">
          <h2 id="teaser">Things people made.</h2>
          <SiteLink className="more" to="/apps">
            See all {APPS.length} →
          </SiteLink>
        </div>
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
