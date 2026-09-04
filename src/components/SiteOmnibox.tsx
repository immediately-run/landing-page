// The omnibox as this site renders it (R3-530): the package's component with the
// site's data injected — the app-directory candidates, the corpus doc rows with
// host-resolved hrefs, and the provenance chip (a site component over site data
// types, which is why it comes back through `renderChip` rather than moving into
// the package). One wrapper, so the four call sites cannot drift in what they
// feed it.

import { Omnibox, type AppHit } from '@immediately-run/omnibox';
import type { OmniboxProps } from '@immediately-run/omnibox';
import ProvenanceChip from './ProvenanceChip';
import type { Provenance } from '../data/apps';
import { useOmniboxHits } from '../lib/omniboxHits';

type SiteOmniboxProps = Omit<OmniboxProps, 'hits' | 'renderChip'>;

export default function SiteOmnibox(props: SiteOmniboxProps) {
  const hits = useOmniboxHits();
  return (
    <Omnibox
      {...props}
      hits={hits}
      renderChip={(hit: AppHit) => <ProvenanceChip provenance={hit.provenance as Provenance} />}
    />
  );
}
