import { editRoute } from "../lib/routes";
import { GITHUB_APP_INSTALL_URL, SDK_REFERENCE_URL } from "../lib/urls";
import SiteLink from "./SiteLink";
import { PlatformLink } from "@immediately-run/sdk/platformLink";

// The footer (R3-513; FRONT_DOOR_IA §4.9): columns by AUDIENCE, not by section.
// Product → readers; Build → creators; Contributors → the people inside the
// platform. The engineering wiki lives ONLY here (never on /docs); the GitHub
// org link lives only here since the nav dropped it.

// The wiki is the docs repo rendered by Grove — a platform route, so it goes
// through PlatformLink (host-space href, frame-escaping navigation).
const WIKI_PATH = "/present/github/immediately-run/docs/main";

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
              <SiteLink to="/apps">Apps</SiteLink>
              <SiteLink to="/docs">Docs</SiteLink>
              <SiteLink to="/tutorials">Tutorials</SiteLink>
              <SiteLink to="/changelog">What's new</SiteLink>
            </div>
          </div>
          <div className="foot-col">
            <div className="h">Build</div>
            <div className="links">
              <SiteLink to="/new">Make an app</SiteLink>
              <a
                href={GITHUB_APP_INSTALL_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Install the GitHub App
              </a>
              <a
                href={SDK_REFERENCE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                API reference (generated)
              </a>
              <a
                href="https://www.npmjs.com/package/@immediately-run/sdk"
                target="_blank"
                rel="noopener noreferrer"
              >
                SDK on npm
              </a>
            </div>
          </div>
          <div className="foot-col">
            <div className="h">Contributors</div>
            <div className="links">
              <PlatformLink path={WIKI_PATH}>Engineering wiki</PlatformLink>
              <a
                href="https://github.com/immediately-run"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub org
              </a>
              <SiteLink to="/docs/agents/llms">The machine surface</SiteLink>
            </div>
          </div>
        </div>
        <div className="foot-bottom">
          <div className="foot-meta">
            immediately.run — this site is Apache-2.0 and forkable · 2025–2026
            <br />
            set in Gabarito &amp; Space Mono
          </div>
          {/* Quiet forkability: this very page is itself a forkable app.
              a platform route navigates the HOST document. */}
          <PlatformLink className="foot-fork" path={editRoute("landing-page")}>
            view source · fork this page →
          </PlatformLink>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
