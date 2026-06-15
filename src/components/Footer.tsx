import { editRoute } from '../lib/routes';

function Footer() {
  return (
    <footer className="foot">
      <div className="foot-inner">
        <div className="foot-grid">
          <div className="foot-signoff grad-text">
            Go
            <br />
            build.
          </div>
          <div className="foot-col">
            <div className="h">Product</div>
            <div className="links">
              <a href="/showcase">Showcase</a>
              <a href="/apps">Apps</a>
              <a href="/docs">Docs</a>
              <a href="/tutorials">Tutorials</a>
              <a href="/changelog">Changelog</a>
            </div>
          </div>
          <div className="foot-col">
            <div className="h">Platform</div>
            <div className="links">
              <a href="/edit/new">Open the editor</a>
              <a href="/docs/sdk/entry">SDK</a>
              <a href="https://github.com/immediately-run" target="_blank" rel="noopener">
                GitHub org
              </a>
              <a href="/changelog">Status</a>
            </div>
          </div>
          <div className="foot-col">
            <div className="h">Community</div>
            <div className="links">
              <a href="/changelog">Meetup</a>
              <a href="https://github.com/immediately-run" target="_blank" rel="noopener">
                Discussions
              </a>
              <a href="/docs/agents/llms">For agents</a>
            </div>
          </div>
        </div>
        <div className="foot-bottom">
          <div className="foot-meta">
            immediately.run — MIT licensed · built by the commons, 2024–2026
            <br />
            set in Gabarito &amp; Space Mono
          </div>
          {/* Quiet forkability: this very page is itself a forkable app. */}
          <a className="foot-fork" href={editRoute('landing-page')}>
            view source · fork this page →
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
