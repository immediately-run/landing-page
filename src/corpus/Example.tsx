// The MDX `<Example>` — a named app with the platform's two standing CTAs.

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
        <a className="docs-btn docs-btn--open" href={presentHref}>
          Open
        </a>
        <a className="docs-btn docs-btn--fork" href={editHref}>
          Fork
        </a>
      </div>
    </div>
  );
}
