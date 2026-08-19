import './changelog.css';
import { useState } from 'react';
import {
  CHANGELOG,
  FILTER_CHIPS,
  BADGE_LABEL,
  type FilterKind,
  type ChangelogEntry,
} from './data';
import SiteLink from '../../components/SiteLink';

export default function Changelog() {
  const [filter, setFilter] = useState<FilterKind>('all');
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const entries =
    filter === 'all'
      ? CHANGELOG
      : CHANGELOG.filter((e) => e.kind === filter);

  const toggle = (id: string) =>
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <section className="cl-section" aria-labelledby="cl-title">
      <span className="cl-tag">/NEWS</span>
      <h1 id="cl-title" className="cl-title">
        What&apos;s new.
      </h1>
      <p className="cl-deck">Releases, features, and notes — newest first.</p>

      <div className="cl-chips" role="group" aria-label="Filter changelog by kind">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.key}
            type="button"
            className="cl-chip"
            aria-pressed={filter === chip.key}
            onClick={() => setFilter(chip.key)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="cl-empty">
          <div className="cl-empty-title">Nothing shipped yet.</div>
          <p className="cl-empty-sub">Follow along.</p>
        </div>
      ) : (
        <>
          <ol className="cl-timeline">
            {entries.map((entry) => (
              <Entry
                key={entry.id}
                entry={entry}
                isOpen={!!open[entry.id]}
                onToggle={() => toggle(entry.id)}
              />
            ))}
          </ol>
          {/* The RSS/Atom link is gone rather than repointed: no feed is generated in either
              environment, so it 404'd everywhere, and a dead link on a "polling for changes"
              affordance is worse than no affordance. Bring it back WITH a generated feed —
              `check-corpora.mjs` is where that would be emitted, next to `public/llms.txt`. */}
        </>
      )}
    </section>
  );
}

function Entry({
  entry,
  isOpen,
  onToggle,
}: {
  entry: ChangelogEntry;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const hasDetail = !!entry.detail;
  const detailId = `cl-detail-${entry.id}`;

  return (
    <li id={entry.id} className="cl-entry">
      <div className="cl-meta">
        <span className="cl-date">{entry.date}</span>
        <span className={`cl-badge cl-badge--${entry.kind}`}>
          {BADGE_LABEL[entry.kind]}
        </span>
        {entry.version && <span className="cl-version">{entry.version}</span>}
      </div>

      <div className="cl-msg">{entry.message}</div>

      {(hasDetail || entry.docHref) && (
        <div className="cl-actions">
          {hasDetail && (
            <button
              type="button"
              className="cl-toggle"
              aria-expanded={isOpen}
              aria-controls={detailId}
              onClick={onToggle}
            >
              {isOpen ? 'less ↑' : 'details →'}
            </button>
          )}
          {entry.docHref && (
            <SiteLink className="cl-doc" to={entry.docHref}>
              documented in →
            </SiteLink>
          )}
        </div>
      )}

      {hasDetail && isOpen && (
        <div id={detailId} className="cl-detail">
          <p className="cl-detail-p">{entry.detail}</p>
          {entry.bullets && entry.bullets.length > 0 && (
            <ul className="cl-detail-list">
              {entry.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}
