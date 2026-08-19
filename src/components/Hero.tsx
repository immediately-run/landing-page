import { APPS } from '../data/apps';
import { presentRoute } from '../lib/routes';
import { usePlatformHref } from '../hooks/useRoute';
import SiteLink from './SiteLink';

// The hero "Run an app" CTA opens the strongest, mobile-friendly showcase app.
const HERO_APP = 'whiteboard';

// App names that scroll in the marquee strip. Module-local (not exported) so
// this file still only *exports* a component, keeping Fast Refresh happy.
const MARQUEE = APPS.map((a) => a.name.toUpperCase());

function Hero() {
  const platform = usePlatformHref();
  return (
    <header className="hero">
      <div className="hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">/ RUN · FORK · KEEP</span>
          <h1 className="grad-text">Apps you can take apart.</h1>
          <p className="deck">
            Run any app straight from its source, in your browser. Want it different?{' '}
            <b className="mark">Ask a coding agent</b> — it rewires the running app for you. No
            source-diving required.
          </p>
          <div className="hero-ctas">
            <a className="btn" href={platform(presentRoute(HERO_APP))}>
              Run an app →
            </a>
            <SiteLink className="btn-ghost" to="/tutorials">
              Build your own →
            </SiteLink>
          </div>
          <div className="proof">
            <span>0 deploys</span>
            <span aria-hidden="true">·</span>
            <span>runs in-browser</span>
            <span aria-hidden="true">·</span>
            <span>safe to fork</span>
          </div>
        </div>

        <div className="preview" aria-hidden="true">
          <div className="preview-bar">
            <span className="dot a" />
            <span className="dot b" />
            <span className="dot c" />
            <span className="route">whiteboard · /present</span>
            <span className="live">live</span>
          </div>
          <div className="preview-canvas">
            <svg viewBox="0 0 320 300" preserveAspectRatio="none">
              <path
                d="M86 96 C120 130,150 150,196 120"
                fill="none"
                stroke="var(--accent-2)"
                strokeWidth="2"
                strokeDasharray="4 5"
                opacity=".7"
              />
              <path
                d="M120 200 C160 180,180 170,206 196"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeDasharray="4 5"
                opacity=".7"
              />
            </svg>
            <div className="pv-card pv-1">
              <div className="l1" />
              <div className="l2" />
            </div>
            <div className="pv-card pv-2">
              <div className="l1" />
              <div className="l2" />
              <div className="l3" />
            </div>
            <div className="pv-card pv-3">
              <div className="row">
                <div className="sq" />
                <div style={{ flex: 1 }}>
                  <div className="l1" />
                  <div className="l2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="marquee" aria-hidden="true">
        {/* Doubled so the -50% scroll loops seamlessly. */}
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i}>
              {item} <span className="dot">●</span>
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}

export default Hero;
