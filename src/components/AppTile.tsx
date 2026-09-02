import type { AppRecord } from '../data/apps';
import { presentRoute, editRoute } from '../lib/routes';
import PlatformLink from './PlatformLink';
import ProvenanceChip from './ProvenanceChip';

// The shared tile (R3-514): one card used by the Run section and the directory
// teaser on `/` — the same anatomy the /apps directory card uses (name,
// category, one-line blurb, provenance chip, Open + Fork). Open and Fork are
// platform routes, so they go through PlatformLink: host-space href +
// `target="_top"`. Fork lives HERE, on tiles — never in the omnibox panel.

interface AppTileProps {
  app: AppRecord;
}

function AppTile({ app }: AppTileProps) {
  return (
    <article className="app-card">
      <div className="app-pic">
        <span className="cat">{app.categoryLabel}</span>
      </div>
      <div className="app-foot">
        <h3>{app.name}</h3>
        <ProvenanceChip provenance={app.provenance} />
        <p>{app.blurb}</p>
        <div className="app-actions">
          <PlatformLink className="open" path={presentRoute(app.repo, app.entry)}>
            Open
          </PlatformLink>
          <PlatformLink className="fork" path={editRoute(app.repo, app.entry)}>
            Fork
          </PlatformLink>
        </div>
      </div>
    </article>
  );
}

export default AppTile;
