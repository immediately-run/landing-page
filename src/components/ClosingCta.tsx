import { presentRoute } from '../lib/routes';

function ClosingCta() {
  return (
    <section className="closing">
      <h2 className="grad-text">Run it. Fork it. Keep it.</h2>
      <p>
        Open the file, use it, and when you want it different, ask a coding agent to change it for
        you. The whole platform is apps you can reshape — including this page.
      </p>
      <div className="hero-ctas">
        <a className="btn" href={presentRoute('whiteboard')}>
          Run an app →
        </a>
        <a className="btn-ghost" href="/tutorials">
          Build your own →
        </a>
      </div>
    </section>
  );
}

export default ClosingCta;
