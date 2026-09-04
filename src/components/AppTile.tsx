import type { AppRecord } from '../data/apps';
import { presentRoute, editRoute } from '../lib/routes';
import AppCard from './AppCard';
import { PlatformLink } from '@immediately-run/sdk/platformLink';
import ProvenanceChip from './ProvenanceChip';

// The home page's app card: the shared AppCard skeleton in `/`'s class
// vocabulary, with the chip and the two CTAs this context uses. Open and Fork
// are platform routes, so they go through PlatformLink: host-space href +
// `target="_top"`. Fork lives HERE, on tiles — never in the omnibox panel.

interface AppTileProps {
  app: AppRecord;
}

function AppTile({ app }: AppTileProps) {
  return (
    <AppCard
      app={app}
      variant="home"
      chip={<ProvenanceChip provenance={app.provenance} />}
      actions={
        <>
          <PlatformLink className="open" path={presentRoute(app.repo, app.entry)}>
            Open
          </PlatformLink>
          <PlatformLink className="fork" path={editRoute(app.repo, app.entry)}>
            Fork
          </PlatformLink>
        </>
      }
    />
  );
}

export default AppTile;
