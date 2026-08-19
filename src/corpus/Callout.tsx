// The MDX `<Callout>` — the same markup the typed-block renderer produced, so the
// conversion from `data.ts` to MDX is a change of SOURCE, not of appearance.

import type { ReactNode } from 'react';

export default function Callout({
  tone = 'note',
  title,
  children,
}: {
  tone?: string;
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`docs-callout docs-callout--${tone}`}>
      {title ? <div className="docs-callout-title">{title}</div> : null}
      <div className="docs-callout-body">{children}</div>
    </div>
  );
}
