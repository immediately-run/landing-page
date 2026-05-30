// Words that scroll in the marquee strip. Module-local (not exported) so this
// file still only *exports* a component, keeping React Fast Refresh happy.
const MARQUEE = [
  'SYNTH PAD',
  'CSV LENS',
  'POMODORO GARDEN',
  'PIXEL PAD',
  'HABIT DOTS',
  'MARKDOWN SCRATCHPAD',
];

function Hero() {
  return (
    <header className="hero wrap">
      <h1>
        Apps you
        <br />
        can take <span className="o">apart.</span>
      </h1>
      <div className="sub-row">
        <p className="deck">
          One HTML file. No build step. Open it, use it, then <b>pop the hood</b> and
          rewire it while it runs.
        </p>
        <div className="stats">
          <div>
            <span className="n">142</span>example apps
          </div>
          <div>
            <span className="n">3.1kb</span>runtime, gzipped
          </div>
          <div>
            <span className="n">0</span>dependencies
          </div>
        </div>
      </div>

      <div className="marquee" aria-hidden="true">
        {/* Doubled so the -50% scroll animation loops seamlessly. */}
        <div className="track">
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
