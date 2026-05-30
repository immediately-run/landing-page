import type { ComponentType } from 'react';
import { useEffect } from 'react';

interface DocArticleProps {
  /** The compiled .mdx article to render. */
  Article: ComponentType;
  onClose: () => void;
}

// Renders a doc article (an MDX module) in a dismissible overlay. The prose
// styling lives under `.doc-article` in App.css and targets the plain
// h1/h2/p/pre/code that MDX emits.
function DocArticle({ Article, onClose }: DocArticleProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="doc-overlay" onClick={onClose}>
      <article className="doc-article" onClick={(e) => e.stopPropagation()}>
        <button className="doc-close" type="button" onClick={onClose} aria-label="Close">
          ×
        </button>
        <Article />
      </article>
    </div>
  );
}

export default DocArticle;
