import SectionHead from './SectionHead';
import { NEWS } from '../data/news';

function News() {
  return (
    <>
      <SectionHead id="news" tag="/news" title="What's new" link="Full changelog →" />
      <section className="news">
        {NEWS.map((item, i) => (
          <div className="nrow" key={i}>
            <span className="v">{item.version}</span>
            <span className={`badge ${item.badge}`}>{item.badgeLabel}</span>
            <span className="msg">{item.message}</span>
            <span className="d">{item.date}</span>
          </div>
        ))}
      </section>
    </>
  );
}

export default News;
