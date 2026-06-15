import type { Provenance } from '../data/showcase';

interface ProvenanceChipProps {
  provenance: Provenance;
}

// Trust signal, not decoration: first-party apps read "official"; community apps
// show their verified GitHub identity as "by @github:owner".
function ProvenanceChip({ provenance }: ProvenanceChipProps) {
  if (provenance === 'official') {
    return <span className="prov official">official</span>;
  }
  return <span className="prov github">by @github:{provenance.github}</span>;
}

export default ProvenanceChip;
