import type { ComponentType, MouseEvent } from 'react';
import { useState } from 'react';
import SectionHead from './SectionHead';
import DocArticle from './DocArticle';
import { DOCS } from '../data/docs';
import YourFirstApp from '../content/docs/your-first-app.mdx';

// slug -> written article. Cards whose slug isn't here are still placeholders;
// add an .mdx file under src/content/docs and register it to light one up.
const ARTICLES: Record<string, ComponentType> = {
  'your-first-app': YourFirstApp,
};

function Docs() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const OpenArticle = openSlug ? ARTICLES[openSlug] : null;

  return (
    <>
      <SectionHead id="docs" tag="/docs" title="Build your own" link="Full reference →" />
      <section className="docs">
        {DOCS.map((doc) => {
          const hasArticle = doc.slug in ARTICLES;
          const onClick = hasArticle
            ? (e: MouseEvent) => {
                e.preventDefault();
                setOpenSlug(doc.slug);
              }
            : undefined;
          return (
            <a key={doc.slug} className="docblk" href="#" onClick={onClick}>
              <span className="num">{doc.num}</span>
              <div>
                <h3>{doc.title}</h3>
                <p>{doc.blurb}</p>
                <span className="rt">{doc.readTime}</span>
              </div>
            </a>
          );
        })}
      </section>
      {OpenArticle && <DocArticle Article={OpenArticle} onClose={() => setOpenSlug(null)} />}
    </>
  );
}

export default Docs;
