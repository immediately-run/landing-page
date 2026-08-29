// The MDX `<Example>` — a named app with the platform's two standing CTAs.
//
// The two hrefs are PLATFORM paths authored in the corpus (`/present/github/…`, `/edit/github/…`),
// so they are resolved against the host's origin rather than rendered raw: inside the
// sandboxed iframe a root-relative href resolves against `sandbox.<host>`, which serves no
// such page. See `platformHref`.

import { usePlatformHref } from '../hooks/useRoute';

export default function Example({
  name,
  desc,
  presentHref,
  editHref,
}: {
  name?: string;
  desc?: string;
  presentHref?: string;
  editHref?: string;
}) {
  const platform = usePlatformHref();
  return (
    <div className="docs-example">
      <div className="docs-example-meta">
        <div className="docs-example-name">{name}</div>
        <div className="docs-example-desc">{desc}</div>
      </div>
      <div className="docs-example-actions">
        <a className="docs-btn docs-btn--open" href={presentHref ? platform(presentHref) : undefined}>
          Open
        </a>
        <a className="docs-btn docs-btn--fork" href={editHref ? platform(editHref) : undefined}>
          Fork
        </a>
      </div>
    </div>
  );
}
