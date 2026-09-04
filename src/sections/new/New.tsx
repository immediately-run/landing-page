// R3-515 — the /new page (FRONT_DOOR_IA §7.1; APP_ONBOARDING §3.1/§3.4.1).
//
// HAND-OFF: when R3-164 lands, `generate` becomes the host's own flow and step
// 4 ("Then run it") disappears. The route and the records stay — application
// templates are more records, not more page.

import './new.css';
import SiteLink from '../../components/SiteLink';
import { PlatformLink } from '@immediately-run/sdk/platformLink';
import Omnibox from '../../components/Omnibox';
import { TEMPLATES, type TemplateRecord } from '../../data/templates';
import { GITHUB_APP_INSTALL_URL, githubGenerateUrl } from '../../lib/urls';
import { examplePresentPath } from '../../lib/routes';

/** The start button a record's `start` decides. `generate` links GitHub's
 *  template-generate flow (new tab); `unavailable` has NO button — the reason
 *  is stated instead; `run` opens the onboarding app. The start button is this
 *  view's one gradient primary. */
function StartButton({ record }: { record: TemplateRecord }) {
  if (record.start.kind === 'generate') {
    return (
      <a
        className="new-cta new-start"
        href={githubGenerateUrl(record.repo)}
        target="_blank"
        rel="noopener noreferrer"
      >
        Start from this template →
      </a>
    );
  }
  if (record.start.kind === 'run') {
    return (
      <PlatformLink className="new-cta new-start" path={record.start.route}>
        Start →
      </PlatformLink>
    );
  }
  return <p className="new-card-unavailable">Unavailable: {record.start.reason}</p>;
}

function TemplateCard({ record }: { record: TemplateRecord }) {
  return (
    <article className="new-card">
      <span className="new-card-kind">{record.kind === 'blank' ? 'blank' : 'app'}</span>
      <h3 className="new-card-name">{record.name}</h3>
      <p style={{ color: 'var(--ink-2)', fontSize: '14.5px' }}>{record.pitch}</p>
      <ul className="new-card-gives">
        {record.gives.map((g) => (
          <li key={g}>{g}</li>
        ))}
      </ul>
      {record.example && (
        <PlatformLink className="new-cta" path={examplePresentPath(record.example)}>
          Try it live →
        </PlatformLink>
      )}
      <StartButton record={record} />
    </article>
  );
}

export default function New() {
  return (
    <div className="new-root">
      <span className="apps-tag">/NEW</span>
      <h1 className="apps-title">Make an app.</h1>
      <p className="apps-deck">
        Three things and you are live: a GitHub account with the immediately.run app installed,
        a repo generated from a starting point, and a push.
      </p>

      {/* Step zero — the one prerequisite the platform cannot perform for you. */}
      <div className="new-install">
        <span className="new-install-label">BEFORE YOU START</span>
        <p className="new-install-copy">
          Install the immediately.run GitHub App on your account. It lets the platform read your
          repos and open pull requests. Running public apps does not need it; for a private app,
          install it on that repo so the people you allow can run it.
        </p>
        <a className="new-cta" href={GITHUB_APP_INSTALL_URL} target="_blank" rel="noopener noreferrer">
          Install the app →
        </a>
      </div>

      <section aria-labelledby="new-starting">
        <h2 id="new-starting" style={{ font: '800 26px var(--disp)', color: 'var(--ink)' }}>
          Pick a starting point.
        </h2>
        <div className="new-template-cards">
          {TEMPLATES.map((record) => (
            <TemplateCard key={record.slug} record={record} />
          ))}
        </div>
      </section>

      <section className="new-run-step" aria-labelledby="new-run">
        <h2 id="new-run" style={{ font: '800 26px var(--disp)', color: 'var(--ink)' }}>
          Then run it.
        </h2>
        <p className="apps-deck">
          GitHub opens in a new tab and creates your repo. Come back and paste it here to run
          it. Push to main and it updates on the next launch.
        </p>
        <Omnibox variant="new" />
      </section>

      <p className="publish-closing">
        Prefer a walkthrough?{' '}
        <SiteLink to="/tutorials/your-first-app">Tutorial: publish an app by pushing a repo →</SiteLink>
      </p>
    </div>
  );
}
