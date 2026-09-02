import SiteLink from './SiteLink';
import PlatformLink from './PlatformLink';
import { focusHeroOmnibox } from '../lib/omniboxFocus';

// The Publish section (R3-514; FRONT_DOOR_IA §4.4) — M2, the author message,
// second in weight. The lede is verbatim from the brief because it carries the
// TWO conditions of the private-repo claim: the reader must sign in, and the
// GitHub App must be installed on the repo. The install row is dashed with a
// mono GITHUB APP label. The one agent-mentioning sentence on `/` is this
// section's closing line, and it points at a tutorial, not at an agent.

const INSTALL_URL = 'https://github.com/apps/immediately-run/installations/new';
const GROVE_EXAMPLE = '/present/github/immediately-run/grove/main';

function PublishSection() {
  return (
    <section className="section" aria-labelledby="publish">
      <div className="sec-head">
        <span className="tag">/PUBLISH</span>
        <h2 id="publish">Publish by pushing. Keep the keys.</h2>
        <p className="lede">
          An app is a React and TypeScript repo. Push it and it is live. There is no build to
          host and no server to run, so publishing is free. Who can run it is who can read the
          repo: make it private and it runs only for people who can read it on GitHub, once
          they sign in.
        </p>
      </div>

      <div className="publish-cards">
        <div className="cap">
          <div className="t">Blank app</div>
          <p>A minimal React and TypeScript repo with nothing to delete first.</p>
          <SiteLink className="btn-ghost publish-cta" to="/new">
            Start from blank →
          </SiteLink>
        </div>
        <div className="cap">
          <div className="t">Wiki, on Grove</div>
          <p>A wiki that is a folder of markdown files, rendered by Grove.</p>
          <PlatformLink className="btn-ghost publish-cta" path={GROVE_EXAMPLE}>
            Try it live →
          </PlatformLink>
        </div>
        <div className="cap">
          <div className="t">Run what you have</div>
          <p>Conventional React and TypeScript runs unmodified — paste a repo and go.</p>
          <button
            type="button"
            className="btn-ghost publish-cta"
            onClick={() => {
              document.querySelector('.omnibox-outer--hero')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              focusHeroOmnibox();
            }}
          >
            Paste a repo →
          </button>
        </div>
      </div>

      <div className="publish-install">
        <span className="publish-install-label">GITHUB APP</span>
        <p className="publish-install-copy">
          Install the immediately.run GitHub App to create and publish. Running public apps
          needs no install.
        </p>
        <a className="btn-ghost publish-cta" href={INSTALL_URL} target="_blank" rel="noopener noreferrer">
          Install the app →
        </a>
      </div>

      <p className="publish-closing">
        Made something with a coding agent? This is where it goes live.{' '}
        <SiteLink to="/tutorials/your-first-app">Publish an app by pushing a repo →</SiteLink>
      </p>
    </section>
  );
}

export default PublishSection;
