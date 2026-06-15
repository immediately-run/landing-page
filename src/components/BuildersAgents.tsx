function BuildersAgents() {
  return (
    <section className="section" aria-label="For builders and agents">
      <div className="panels-2">
        <div className="panel">
          <div className="k">/CHANGE BY ASKING</div>
          <h3>Just say what you want.</h3>
          <p>
            Point a coding agent at any app — or at a piece of the immediately.run UI itself — and
            describe the change. It rewrites the running app for you. Editing source by hand is the
            exception, not the rule.
          </p>
          <a className="link" href="#/tutorials/local-claude-code">
            See how it works →
          </a>
        </div>
        <div className="panel">
          <div className="k">/FOR AGENTS</div>
          <h3>Agents are first-class.</h3>
          <p>
            Plain files, conventional React. An MCP bridge and a machine-readable reference at{' '}
            <span className="mono-inline">/llms.txt</span>.
          </p>
          <a className="link" href="#/docs/agents/llms">
            See the agent surface →
          </a>
        </div>
      </div>
    </section>
  );
}

export default BuildersAgents;
