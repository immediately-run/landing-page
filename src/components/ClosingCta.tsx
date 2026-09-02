import { presentRoute } from '../lib/routes';
import { usePlatformHref } from '../hooks/useRoute';
import SiteLink from './SiteLink';

function ClosingCta() {
  const platform = usePlatformHref();
  return (
    <section className="closing">
      <h2 className="grad-text">Run it. Fork it. Keep it.</h2>
      <p>
        Open the file, use it, and when you want it different, ask a coding agent to change it for
        you. The whole platform is apps you can reshape — including this page.
      </p>
      <div className="hero-ctas">
        <a className="btn" href={platform(presentRoute('whiteboard'))} target="_top">
          Run an app →
        </a>
        <SiteLink className="btn-ghost" to="/tutorials">
          Build your own →
        </SiteLink>
      </div>
    </section>
  );
}

export default ClosingCta;
