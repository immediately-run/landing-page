import SiteLink from './SiteLink';
import PlatformLink from './PlatformLink';
import { editRoute } from '../lib/routes';

// The Remix section (R3-514; FRONT_DOOR_IA §4.5) — M3, the shortest section:
// the consequence of M1's sandbox (modification resets trust), not a separate
// pitch. Fork this page is a platform route (PlatformLink); the contributing
// link targets a stable heading in the docs. The illustration slot is
// decorative — the running app beside its source, one edit reflected in both.

function RemixSection() {
  return (
    <section className="section" aria-labelledby="remix">
      <div className="sec-head">
        <span className="tag">/REMIX</span>
        <h2 id="remix">Every app is yours to fork.</h2>
        <p className="lede">
          Open the source of anything you run, including this page. Change it in the editor;
          edits stay in your copy until you push them back as a commit or a pull request. A
          fork starts with no permissions of its own, so a changed app has to earn them again.
        </p>
      </div>
      <div className="hero-ctas">
        <PlatformLink className="btn-ghost" path={editRoute('landing-page')}>
          Fork this page →
        </PlatformLink>
        <SiteLink className="btn-ghost" to="/docs/start/overview#the-run-edit-contribute-loop">
          How contributing works →
        </SiteLink>
      </div>
      <div className="remix-still" aria-hidden="true">
        <svg viewBox="0 0 360 120" preserveAspectRatio="xMidYMid meet" role="presentation">
          <rect x="8" y="8" width="160" height="104" rx="8" fill="var(--panel)" stroke="var(--line-2)" />
          <path d="M24 90 L60 60 L96 78 L150 34" fill="none" stroke="var(--accent-2)" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="192" y="8" width="160" height="104" rx="8" fill="var(--panel)" stroke="var(--line-2)" />
          <path d="M208 90 L244 60 L280 78 L334 34" fill="none" stroke="var(--accent-3)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 6" />
          <text x="208" y="30" fontFamily="var(--mono)" fontSize="11" fill="var(--ink-3)">one edit → both sides</text>
        </svg>
      </div>
    </section>
  );
}

export default RemixSection;
