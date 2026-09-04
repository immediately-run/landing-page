// The MDX `<Example>` — a named app with the platform's two standing CTAs.
//
// The two hrefs are PLATFORM paths authored in the corpus (`/present/github/…`, `/edit/github/…`),
// so they render through `PlatformLink`, which resolves them against the host's origin and
// escapes the frame: inside the sandboxed iframe a root-relative href resolves against
// `sandbox.<host>`, which serves no such page.

import { PlatformLink } from "@immediately-run/sdk/platformLink";

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
  return (
    <div className="docs-example">
      <div className="docs-example-meta">
        <div className="docs-example-name">{name}</div>
        <div className="docs-example-desc">{desc}</div>
      </div>
      <div className="docs-example-actions">
        {presentHref ? (
          <PlatformLink className="docs-btn docs-btn--open" path={presentHref}>
            Open
          </PlatformLink>
        ) : (
          <a className="docs-btn docs-btn--open">Open</a>
        )}
        {editHref ? (
          <PlatformLink className="docs-btn docs-btn--fork" path={editHref}>
            Fork
          </PlatformLink>
        ) : (
          <a className="docs-btn docs-btn--fork">Fork</a>
        )}
      </div>
    </div>
  );
}
