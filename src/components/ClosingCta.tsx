import SiteLink from './SiteLink';
import PlatformLink from './PlatformLink';
import Door from './Door';
import { revealHeroOmnibox } from '../lib/omniboxFocus';

// The closing band (R3-514; FRONT_DOOR_IA §4.8): the headline and one row of
// doors. "Run a repo" is the band's gradient primary and it scrolls to and
// focuses the omnibox — the VIEW's one gradient primary is still the omnibox's
// Run; only one of them is on screen at any scroll position. Everything else
// here is hairline.

function ClosingCta() {
  return (
    <section className="closing" aria-labelledby="closing">
      <h2 id="closing" className="grad-text">
        Run it. Find it. Make it.
      </h2>
      <div className="hero-ctas">
        <button
          type="button"
          className="btn closing-run"
          onClick={revealHeroOmnibox}
        >
          Run a repo →
        </button>
        <SiteLink className="btn-ghost" to="/apps">
          Browse apps
        </SiteLink>
        <SiteLink className="btn-ghost" to="/new">
          Make an app
        </SiteLink>
        <Door className="btn-ghost" />
      </div>
      {/* The fork line lives in the footer (PlatformLink there); the platform
          route link below exists for readers who land here directly. */}
      <p className="closing-fork">
        <PlatformLink path="/edit/github/immediately-run/landing-page/main">
          view source · fork this page →
        </PlatformLink>
      </p>
    </section>
  );
}

export default ClosingCta;
