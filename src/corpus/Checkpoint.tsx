// The MDX `<Checkpoint>` — a tutorial's "you should now see…" confirmation, with the
// stripe-art placeholder standing in for a screenshot.

import type { ReactNode } from 'react';

export default function Checkpoint({ alt, children }: { alt?: string; children?: ReactNode }) {
  return (
    <div className="tut-check">
      <div className="tut-check-head">
        <span className="tut-check-tag">You should now see…</span>
        <div className="tut-check-text">{children}</div>
      </div>
      <div className="tut-check-art" role="img" aria-label={alt}>
        <span className="tut-check-cap">screenshot · {alt}</span>
      </div>
    </div>
  );
}
