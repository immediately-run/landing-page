import { useAuth } from '@immediately-run/sdk';
import SiteLink from './SiteLink';
import SiteOmnibox from './SiteOmnibox';
import Door from './Door';

// The hero (R3-514; FRONT_DOOR_IA §4.2) — the headline doubles as the omnibox
// instruction; one deck for every breakpoint; the door row under the omnibox;
// the proof line carries only verified facts. Desktop gets a STILL of the
// first Run tile's app (the whiteboard) in present mode, aria-hidden —
// deliberately not a live iframe, which would render the host inside its own
// sandboxed app frame. The marquee and the fake browser-chrome preview are
// gone.

function Hero() {
  // The door row prepends Home only when signed in; the gate is
  // `status === 'signed-in'`, never `user` (§2/§6).
  const { status } = useAuth();
  return (
    <header className="hero">
      <div className="hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">/RUN · FIND · MAKE</span>
          <h1 className="grad-text">Paste a repo. Run the app.</h1>
          <p className="deck">
            immediately.run launches applications straight from their source, in your browser.
            Nothing to install, no account to make, and an app reaches nothing of yours unless
            you hand it over.
          </p>
          <SiteOmnibox variant="hero" />
          <div className="hero-doors">
            {status === 'signed-in' && (
              <Door className="btn-ghost hero-door" />
            )}
            <SiteLink className="btn-ghost hero-door" to="/apps">
              Browse apps →
            </SiteLink>
            <SiteLink className="btn-ghost hero-door" to="/new">
              Make an app →
            </SiteLink>
          </div>
          <div className="proof">
            <span>0 installs</span>
            <span aria-hidden="true">·</span>
            <span>runs in your browser</span>
            <span aria-hidden="true">·</span>
            <span>sandboxed by default</span>
          </div>
        </div>

        {/* A still of the first Run tile's app in present mode — decoration, not
            a control; nothing in it is live or interactive. */}
        <div className="hero-still" aria-hidden="true">
          <svg viewBox="0 0 320 260" preserveAspectRatio="xMidYMid meet" role="presentation">
            <rect x="8" y="8" width="304" height="244" rx="10" fill="var(--panel)" stroke="var(--line-2)" />
            <path
              d="M60 150 C110 90, 170 190, 250 100"
              fill="none"
              stroke="var(--accent-2)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="60" cy="150" r="6" fill="var(--accent)" />
            <circle cx="250" cy="100" r="6" fill="var(--accent-3)" />
            <text x="24" y="232" fontFamily="var(--mono)" fontSize="12" fill="var(--ink-3)">
              whiteboard · /present
            </text>
          </svg>
        </div>
      </div>
    </header>
  );
}

export default Hero;
