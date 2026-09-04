import { useState } from 'react';
import { Search } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import type { Section } from '../hooks/useRoute';
import logoMark from '../assets/logo-mark.png';
import SiteLink from './SiteLink';
import SiteOmnibox from './SiteOmnibox';
import Door from './Door';

// The nav (R3-513; FRONT_DOOR_IA §4.1): four items — Apps · Docs · Tutorials ·
// What's new. Showcase is gone (one directory: /showcase redirects to /apps);
// the GitHub org link moved to the footer; "Start building" became "Make an
// app" → /new as a hairline secondary. The right cluster is the omnibox (nav
// variant), Make an app, and the door — no gradient primary in the nav: the
// view's one primary is the omnibox's Run.
//
// Mobile top bar: logo · search icon · the door · burger — the two controls
// outside the burger are the two fastest paths for the majority returning case
// (W1/W2 and W4). The sheet opens with the omnibox row at its top.

// Section links. The whole site lives in this one app, routed by path.
const NAV_ITEMS: { label: string; to: string; section: Section }[] = [
  { label: 'Apps', to: '/apps', section: 'apps' },
  { label: 'Docs', to: '/docs', section: 'docs' },
  { label: 'Tutorials', to: '/tutorials', section: 'tutorials' },
  { label: "What's new", to: '/changelog', section: 'changelog' },
];

interface NavProps {
  active: Section;
}

function Nav({ active }: NavProps) {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLight = theme === 'light';

  const closeMenu = () => setMenuOpen(false);

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
            {/* R3-512: the omnibox in its `nav` variant. On `/` it renders as the
                shortcut that focuses the hero omnibox; elsewhere it is the field. */}
            <span className="nav-omnibox desk-only">
              <SiteOmnibox variant="nav" heroShortcut={active === 'home'} />
            </span>
            {/* Mobile search: opens the sheet, whose first row is the omnibox. */}
            <button
              type="button"
              className="icon-btn nav-search-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Search apps and docs, or paste a repo"
            >
              <Search size={18} aria-hidden="true" />
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
            {/* Make an app: a hairline secondary — /new is an app-owned route
                (R3-515 builds the page; the route resolves to the site root
                until then). NEVER the gradient primary (FRONT_DOOR_IA §1.1). */}
            <SiteLink className="nav-link nav-make desk-only" to="/new">
              Make an app
            </SiteLink>
            {/* The door stays in the top bar at every width — it is one of the
                two controls outside the burger (§4.1), not a desktop extra. */}
            <span className="nav-door">
              <Door />
            </span>
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
              onClick={closeMenu}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>
          {/* The omnibox row comes FIRST in the sheet (§4.1). */}
          <div className="nav-sheet-omnibox">
            <SiteOmnibox variant="nav" heroShortcut={false} />
          </div>
          <div className="nav-sheet-links">
            {NAV_ITEMS.map((item) => (
              <SiteLink
                key={item.to}
                className="nav-sheet-link"
                to={item.to}
                onClick={closeMenu}
              >
                {item.label}
              </SiteLink>
            ))}
            <SiteLink className="nav-sheet-link" to="/new" onClick={closeMenu}>
              Make an app
            </SiteLink>
          </div>
          <div className="nav-sheet-door">
            <Door />
          </div>
          <button
            type="button"
            className="nav-sheet-theme"
            onClick={toggle}
            aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            {isLight ? '☾ Dark' : '☀ Light'}
          </button>
        </div>
      )}
    </>
  );
}

export default Nav;
