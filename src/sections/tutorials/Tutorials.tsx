import './tutorials.css';
import { useCallback, useState } from 'react';
import { TUTORIALS, findTutorial } from './data';
import type { Tutorial } from './data';

// The tutorials section, bound to #/tutorials (index) and #/tutorials/:slug (a page).
// Static prose plus deep links that open the live platform pre-loaded to the right
// state — "show, then go do it". One default-exported component for the whole section.
export default function Tutorials({ rest }: { rest: string[] }) {
  const slug = rest[0];

  const [copied, setCopied] = useState<string>('');

  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(key);
        window.setTimeout(() => setCopied((c) => (c === key ? '' : c)), 1600);
      },
      () => undefined,
    );
  }, []);

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

  return <TutorialPage tut={tut} copied={copied} copy={copy} goStep={goStep} />;
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
          <a key={t.slug} className="tut-card" href={`#/tutorials/${t.slug}`}>
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
          </a>
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
        <a className="tut-404-cta" href="#/tutorials">
          All tutorials →
        </a>
      </div>
    </div>
  );
}

function TutorialPage({
  tut,
  copied,
  copy,
  goStep,
}: {
  tut: Tutorial;
  copied: string;
  copy: (text: string, key: string) => void;
  goStep: (id: string) => void;
}) {
  return (
    <div className="tut tut-fade">
      <div className="tut-layout">
        <article className="tut-article">
          <a className="tut-back" href="#/tutorials">
            ← All tutorials
          </a>
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

          <ol className="tut-steps">
            {tut.steps.map((st, i) => (
              <li key={st.id} id={st.id} className="tut-step">
                <span className="tut-step-n">{i + 1}</span>
                <div className="tut-step-body">
                  <h2 className="tut-step-title">{st.title}</h2>
                  <p className="tut-step-prose">{st.prose}</p>

                  {st.code && (
                    <div className="tut-code">
                      <div className="tut-code-bar">
                        <span className="tut-code-name">{st.code.filename}</span>
                        <button
                          type="button"
                          className="tut-code-copy"
                          onClick={() => copy(st.code!.src, `code:${st.id}`)}
                        >
                          {copied === `code:${st.id}` ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <pre className="tut-code-pre">
                        <code>{st.code.src}</code>
                      </pre>
                    </div>
                  )}

                  {st.check && (
                    <div className="tut-check">
                      <div className="tut-check-head">
                        <span className="tut-check-tag">You should now see…</span>
                        <div className="tut-check-text">{st.check.text}</div>
                      </div>
                      <div className="tut-check-art" role="img" aria-label={st.check.alt}>
                        <span className="tut-check-cap">screenshot · {st.check.alt}</span>
                      </div>
                    </div>
                  )}

                  {st.deep && (
                    <div className="tut-deep">
                      <a
                        className="tut-deep-pill"
                        href={st.deep.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {st.deep.label}
                      </a>
                      <button
                        type="button"
                        className="tut-deep-copy"
                        onClick={() => copy(st.deep!.href, `deep:${st.id}`)}
                      >
                        {copied === `deep:${st.id}` ? 'Link copied' : 'Popup blocked? Copy the link'}
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <div className="tut-next">
            <div className="tut-next-label">Learn next</div>
            <a className="tut-next-card" href={`#/tutorials/${tut.next.slug}`}>
              <span className="tut-next-title">{tut.next.label}</span>
              <span className="tut-next-arrow">→</span>
            </a>
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
