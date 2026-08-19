import { NEWS } from '../data/news';
import SiteLink from './SiteLink';

// The single latest changelog entry as a one-liner, linking to /changelog.
function WhatsNew() {
  const latest = NEWS[0];
  if (!latest) return null;

  return (
    <section className="section" aria-label="What's new">
      <SiteLink className="news-row" to="/changelog">
        <span className="ntag">/NEWS</span>
        <span className={`badge ${latest.badge}`}>{latest.badgeLabel}</span>
        <span className="news-msg">{latest.message}</span>
        <span className="news-date">{latest.date} · full changelog →</span>
      </SiteLink>
    </section>
  );
}

export default WhatsNew;
