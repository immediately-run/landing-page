import { APPS } from '../data/apps';
import SiteOmnibox from './SiteOmnibox';

// The hero (FRONT_DOOR_IA §4.2, restyled to the 1a quiet column): eyebrow,
// headline, one deck, the omnibox, the proof line. Centred at every width.
//
// The door row and the desktop still are gone. The doors duplicated navigation
// the nav already carries at every scroll position, and the still was decoration
// under the one control the section exists to deliver you to — both were height
// between the headline and the omnibox, which is the only thing here that acts.
//
// The app count is COMPUTED, never typed: a hero that claims a number the
// directory disagrees with is worse than a hero with no number.

function Hero() {
  return (
    <header className="hero">
      <div className="hero-inner">
        <span className="eyebrow">/RUN · FORK · PUSH</span>
        {/* The break is deliberate: one sentence per line. Left to wrap, the
            measure splits it at "Run", which reads as a line that starts with a
            verb belonging to the line above. */}
        <h1 className="grad-text">
          Paste a repo.
          <br />
          Run the app.
        </h1>
        <p className="deck">
          React and TypeScript, straight from the source, in your browser. No install, no
          deploy, no account.
        </p>
        <SiteOmnibox variant="hero" />
        <div className="proof">
          <span>0 installs</span>
          <span aria-hidden="true">·</span>
          <span>sandboxed by default</span>
          <span aria-hidden="true">·</span>
          <span>{APPS.length} apps to try</span>
        </div>
      </div>
    </header>
  );
}

export default Hero;
