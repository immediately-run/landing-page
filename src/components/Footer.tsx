import { editRoute } from '../lib/routes';
import { usePlatformHref } from '../hooks/useRoute';
import SiteLink from './SiteLink';

function Footer() {
  const platform = usePlatformHref();
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
              <SiteLink to="/showcase">Showcase</SiteLink>
              <SiteLink to="/apps">Apps</SiteLink>
              <SiteLink to="/docs">Docs</SiteLink>
              <SiteLink to="/tutorials">Tutorials</SiteLink>
              <SiteLink to="/changelog">Changelog</SiteLink>
            </div>
          </div>
          <div className="foot-col">
            <div className="h">Platform</div>
            <div className="links">
              <a href={platform('/edit/new')}>Open the editor</a>
              <SiteLink to="/docs/sdk/entry">SDK</SiteLink>
              <a href="https://github.com/immediately-run" target="_blank" rel="noopener">
                GitHub org
              </a>
              <SiteLink to="/changelog">Status</SiteLink>
            </div>
          </div>
          <div className="foot-col">
            <div className="h">Community</div>
            <div className="links">
              <SiteLink to="/changelog">Meetup</SiteLink>
              <a href="https://github.com/immediately-run" target="_blank" rel="noopener">
                Discussions
              </a>
              <SiteLink to="/docs/agents/llms">For agents</SiteLink>
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
          <a className="foot-fork" href={platform(editRoute('landing-page'))}>
            view source · fork this page →
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
