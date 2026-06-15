function Safety() {
  return (
    <section className="section" aria-labelledby="safe">
      <div className="safety">
        <div className="safety-head">
          <span className="tag">/SAFE TO FORK</span>
          <h2 id="safe">
            Apps start with <span className="grad-text">nothing.</span>
          </h2>
          <p className="lede">
            No credentials, no network, no files. Untrusted code runs in a sandboxed iframe with
            zero ambient access. It gets exactly what you grant — and nothing else.
          </p>
        </div>
        <div className="cap-grid">
          <div className="cap">
            <div className="k">filesystem</div>
            <div className="t">Mount, don't roam</div>
            <p>An app sees only the folder you mount — never the rest of your disk.</p>
          </div>
          <div className="cap">
            <div className="k">network</div>
            <div className="t">Ask before reaching out</div>
            <p>Every fetch to a new origin is a capability you consent to, once.</p>
          </div>
          <div className="cap">
            <div className="k">secrets</div>
            <div className="t">Use a key, never read it</div>
            <p>
              An app can <b className="key">use</b> your API key to make a call — but can never see
              its value.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Safety;
