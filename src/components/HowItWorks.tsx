function HowItWorks() {
  return (
    <section className="section" aria-labelledby="hiw">
      <div className="sec-head">
        <span className="tag">/HOW IT WORKS</span>
        <h2 id="hiw">Three steps, no ceremony.</h2>
      </div>
      <div className="cards-3">
        <article className="step-card">
          <span className="step-num">01</span>
          <h3>Open</h3>
          <p>
            Paste a repo URL or pick one from the showcase. It <b className="key">runs</b> straight
            from its source — no backend, no build step, no deploy.
          </p>
        </article>
        <article className="step-card">
          <span className="step-num">02</span>
          <h3>Ask</h3>
          <p>
            Describe the change and a <b className="key">coding agent</b> edits the running app for
            you — most people never open the source. Prefer hands-on? The built-in editor is right
            there. Either way, edits are copy-on-write, so upstream stays untouched.
          </p>
        </article>
        <article className="step-card">
          <span className="step-num">03</span>
          <h3>Contribute</h3>
          <p>
            Push back to GitHub as a commit or a pull request — from the browser. The file you ran{' '}
            <b className="key">is</b> the app you share.
          </p>
        </article>
      </div>
    </section>
  );
}

export default HowItWorks;
