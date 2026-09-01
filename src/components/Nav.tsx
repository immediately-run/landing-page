import { useState } from 'react';
import { useAuth } from '@immediately-run/sdk';
import { useTheme } from '../hooks/useTheme';
import type { Section } from '../hooks/useRoute';
import logoMark from '../assets/logo-mark.png';
import SiteLink from './SiteLink';

// Section links. The whole site lives in this one app, routed by hash.
const NAV_ITEMS: { label: string; to: string; section: Section }[] = [
  { label: 'Showcase', to: '/showcase', section: 'showcase' },
  { label: 'Apps', to: '/apps', section: 'apps' },
  { label: 'Docs', to: '/docs', section: 'docs' },
  { label: 'Tutorials', to: '/tutorials', section: 'tutorials' },
  { label: "What's new", to: '/changelog', section: 'changelog' },
];

interface NavProps {
  active: Section;
  onOpenSearch: () => void;
}

function Nav({ active, onOpenSearch }: NavProps) {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLight = theme === 'light';
  // R3-486 (OSO §4.1 R-OSO-17): `/` stays the front door for everyone; when the
  // user is signed in it gains a route to /home. The auth read degrades
  // gracefully — unresolved or signed-out renders exactly the signed-out nav
  // (no flash of a broken link): `useAuth()` outside the platform sandbox
  // resolves null, so the static/standalone render is unchanged.
  const { user } = useAuth();
  const signedIn = Boolean(user);

  return (
    <>
      <nav className="nav" aria-label="Primary">
        <div className="nav-inner">
          <SiteLink className="logo" to="/">
            <img className="logo-mark" src={logoMark} alt="" width={27} height={27} />
            immediately.run
          </SiteLink>
          <div className="nav-links">
            {NAV_ITEMS.map((item) => (
              <SiteLink
                key={item.to}
                className={`nav-link${active === item.section ? ' nav-link--active' : ''}`}
                to={item.to}
                aria-current={active === item.section ? 'page' : undefined}
              >
                {item.label}
              </SiteLink>
            ))}
          </div>
          <div className="nav-right">
            <button
              type="button"
              className="icon-btn search-btn"
              onClick={onOpenSearch}
              aria-label="Search apps, docs, and tutorials"
            >
              <span className="desk-only">Search</span>
              <span className="kbd">⌘K</span>
            </button>
            <button
              type="button"
              className="icon-btn theme-btn"
              onClick={toggle}
              aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
            >
              <span className="ic">{isLight ? '☾' : '☀'}</span>
              <span className="desk-only">{isLight ? 'Dark' : 'Light'}</span>
            </button>
            {/* `target="_top"`: the sandboxed landing navigates the HOST
                document to /home, not its own iframe. */}
            {signedIn && (
              <a className="gh-link desk-only" href="/home" target="_top">
                ★ Home
              </a>
            )}
            <a
              className="gh-link desk-only"
              href="https://github.com/immediately-run"
              target="_blank"
              rel="noopener"
            >
              ★ GitHub
            </a>
            {/* `/edit/new` is not a route — in-product app creation is the
                APP_ONBOARDING_SPEC funnel and is not built yet (R3-164). Until it
                lands, this points at the transport that funnel's v1 default path
                actually uses (§3.4.1): GitHub's own template-generate flow. A
                broken CTA is worse than an honest off-platform one. */}
            <a
              className="btn nav-cta desk-only"
              href="https://github.com/immediately-run/new-project-template/generate"
              target="_blank"
              rel="noopener"
            >
              Start building →
            </a>
            <button
              type="button"
              className="burger"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              ≡
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="nav-sheet">
          <div className="nav-sheet-top">
            <span>immediately.run</span>
            <button
              type="button"
              className="sheet-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>
          <div className="nav-sheet-links">
            {NAV_ITEMS.map((item) => (
              <SiteLink
                key={item.to}
                className="nav-sheet-link"
                to={item.to}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </SiteLink>
            ))}
            {/* R3-486 — the SAME signed-in route to /home the desktop nav offers.
                It has to be repeated here because the desktop link carries
                `desk-only`, which `@media(max-width:900px)` sets to
                `display:none!important` — so without this a signed-in phone user
                had no route to Home from `/` at all. Product value 8: mobile is
                not an afterthought, and ~25% of sessions are phones. */}
            {signedIn && (
              <a className="nav-sheet-link" href="/home" target="_top" onClick={() => setMenuOpen(false)}>
                ★ Home
              </a>
            )}
          </div>
          <a
            className="btn"
            href="https://github.com/immediately-run/new-project-template/generate"
            target="_blank"
            rel="noopener"
          >
            Start building →
          </a>
        </div>
      )}
    </>
  );
}

export default Nav;
