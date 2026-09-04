import type { ReactNode } from 'react';
import type { AppRecord } from '../data/apps';

// The one app card. Three places render the same anatomy — the tiles on `/`, the
// featured band at the top of /apps, and the /apps grid — and until now each
// carried its own copy of it, which is how the three drifted apart in the first
// place. The skeleton lives here once; the two contexts differ only in their
// stylesheet's class vocabulary and in the chip and actions they hand in, so
// neither one's appearance changes.
//
// `chip` and `actions` are slots rather than props on the record: /apps spells
// its own chip copy, while `/` uses ProvenanceChip; both render their links
// through PlatformLink. A card is a layout, not a link policy.

/** Which stylesheet's class vocabulary to render in: `/`'s App.css or /apps's apps.css. */
export type AppCardVariant = 'home' | 'directory';

const CLASSES: Record<AppCardVariant, Record<string, string | undefined>> = {
  home: {
    card: 'app-card',
    art: 'app-pic',
    cat: 'cat',
    body: 'app-foot',
    name: undefined,
    blurb: undefined,
    cta: 'app-actions',
  },
  directory: {
    card: 'apps-card',
    art: 'apps-card-art',
    cat: 'apps-card-cat',
    body: 'apps-card-body',
    name: 'apps-card-name',
    blurb: 'apps-card-blurb',
    cta: 'apps-card-cta',
  },
};

interface AppCardProps {
  app: AppRecord;
  variant: AppCardVariant;
  /** The provenance chip, in the calling context's own spelling. */
  chip: ReactNode;
  /** Open and Fork, built by the calling context's link component. */
  actions: ReactNode;
}

function AppCard({ app, variant, chip, actions }: AppCardProps) {
  const c = CLASSES[variant];
  return (
    <article className={c.card}>
      <div className={c.art}>
        <span className={c.cat}>{app.categoryLabel}</span>
      </div>
      <div className={c.body}>
        <h3 className={c.name}>{app.name}</h3>
        {chip}
        <p className={c.blurb}>{app.blurb}</p>
        <div className={c.cta}>{actions}</div>
      </div>
    </article>
  );
}

export default AppCard;
