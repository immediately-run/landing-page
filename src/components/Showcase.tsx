import SectionHead from './SectionHead';
import { SHOWCASE } from '../data/showcase';

function Showcase() {
  return (
    <>
      <SectionHead id="showcase" tag="/showcase" title="Built with Tinker" link="All 142 →" />
      <section className="show">
        {SHOWCASE.map((tile) => {
          const className = ['tile', tile.size, tile.variant].filter(Boolean).join(' ');
          const label = tile.featured ? `${tile.slug} · featured` : tile.slug;
          return (
            <article key={tile.slug} className={className}>
              <div className="pic">
                {tile.stars && <span className="fav">★ {tile.stars}</span>}
                <span className="lab">{label}</span>
              </div>
              <div className="foot">
                <h3>{tile.name}</h3>
                <p>{tile.blurb}</p>
                <span className="k">{tile.tag}</span>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}

export default Showcase;
