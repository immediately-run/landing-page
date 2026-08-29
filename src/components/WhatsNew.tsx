import { BADGE_LABEL, CHANGELOG } from '../sections/changelog/data';
import SiteLink from './SiteLink';

// The single latest changelog entry as a one-liner, linking to /changelog.
//
// This reads the CHANGELOG itself rather than a parallel list. It used to read a
// second data module (`data/news.ts`) that carried its own copy of the newest few
// entries — two homes for one fact, which drifted: the two files disagreed about
// what the latest entry even was. One home (ways_of_working §9); the teaser is a
// projection of it.
function WhatsNew() {
  const latest = CHANGELOG[0];
  if (!latest) return null;

  return (
    <section className="section" aria-label="What's new">
      <SiteLink className="news-row" to="/changelog">
        <span className="ntag">/NEWS</span>
        <span className={`badge ${latest.kind}`}>{BADGE_LABEL[latest.kind]}</span>
        <span className="news-msg">{latest.message}</span>
        <span className="news-date">{latest.date} · full changelog →</span>
      </SiteLink>
    </section>
  );
}

export default WhatsNew;
