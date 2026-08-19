import './tutorials.css';
import { useCallback } from 'react';
import { TUTORIALS, findTutorial } from './data';
import { CORPUS_COMPONENTS } from '../../corpus/components';
import type { Tutorial } from './data';
import SiteLink from '../../components/SiteLink';

// The tutorials section, bound to #/tutorials (index) and #/tutorials/:slug (a page).
// Static prose plus deep links that open the live platform pre-loaded to the right
// state — "show, then go do it". One default-exported component for the whole section.
export default function Tutorials({ rest }: { rest: string[] }) {
  const slug = rest[0];

  // Copy-to-clipboard moved into the corpus components (<CodeBlock/>, <DeepLink/>), which
  // own the buttons that use it — so the section no longer threads a `copied` key through
  // three levels of props to decide which button says "Copied".
  const goStep = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  if (slug === undefined) {
    return <TutorialIndex />;
  }

  const tut = findTutorial(slug);
  if (!tut) {
    return <NotFound />;
  }

  return <TutorialPage tut={tut} goStep={goStep} />;
}

function TutorialIndex() {
  return (
    <div className="tut tut-fade">
      <header className="tut-head">
        <span className="tag tut-tag">/TUTORIALS</span>
        <h1 className="tut-h1">Do it once, then it's yours.</h1>
        <p className="tut-deck">Three workflows, start to finish. Read a step, then open it live.</p>
      </header>

      <div className="tut-grid">
        {TUTORIALS.map((t) => (
          <SiteLink key={t.slug} className="tut-card" to={`/tutorials/${t.slug}`}>
            <span className="tut-card-num grad-text">{t.num}</span>
            <div className="tut-card-pillar">{t.pillar}</div>
            <h2 className="tut-card-title">{t.title}</h2>
            <p className="tut-card-outcome">{t.outcome}</p>
            <div className="tut-card-meta">
              <span className="tut-pill tut-pill-diff">{t.difficulty}</span>
              {t.tags.map((g) => (
                <span key={g} className="tut-pill">
                  {g}
                </span>
              ))}
              <span className="tut-card-time">{t.time}</span>
            </div>
          </SiteLink>
        ))}
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="tut tut-fade">
      <div className="tut-404">
        <div className="tut-404-title">No such tutorial.</div>
        <p className="tut-404-text">It may have moved. Head back to the index.</p>
        <SiteLink className="tut-404-cta" to="/tutorials">
          All tutorials →
        </SiteLink>
      </div>
    </div>
  );
}

function TutorialPage({ tut, goStep }: { tut: Tutorial; goStep: (id: string) => void }) {
  return (
    <div className="tut tut-fade">
      <div className="tut-layout">
        <article className="tut-article">
          <SiteLink className="tut-back" to="/tutorials">
            ← All tutorials
          </SiteLink>
          <h1 className="tut-page-title">{tut.title}</h1>

          <div className="tut-meta-card">
            <div>
              <div className="tut-meta-label">You'll build</div>
              <div className="tut-meta-val">{tut.outcome}</div>
            </div>
            <div>
              <div className="tut-meta-label">Prerequisites</div>
              <div className="tut-meta-val">{tut.prereqs}</div>
            </div>
            <div>
              <div className="tut-meta-label">Time</div>
              <div className="tut-meta-val">{tut.time}</div>
            </div>
          </div>

          {/* The steps are the MDX body: each `###` heading opens a step, and the
              corpus components (<CodeBlock/>, <Checkpoint/>, <DeepLink/>) render the
              furniture that used to be optional fields on a step record. The numbered
              rail below and the aside both key off the SAME heading ids the remark
              plugin renders, so a step link always lands. */}
          <div className="tut-body">
            <tut.Body components={CORPUS_COMPONENTS} />
          </div>

          <div className="tut-next">
            <div className="tut-next-label">Learn next</div>
            <SiteLink className="tut-next-card" to={`/tutorials/${tut.next.slug}`}>
              <span className="tut-next-title">{tut.next.label}</span>
              <span className="tut-next-arrow">→</span>
            </SiteLink>
          </div>
        </article>

        <aside className="tut-aside">
          <div className="tut-aside-label">Steps</div>
          <div className="tut-aside-list">
            {tut.steps.map((st, i) => (
              <button key={st.id} type="button" className="tut-aside-item" onClick={() => goStep(st.id)}>
                <span className="tut-aside-n">{i + 1}</span>
                <span>{st.title}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
