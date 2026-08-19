import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { usePlatformHref } from '../hooks/useRoute';
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
  const platform = usePlatformHref();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLight = theme === 'light';

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
            <a
              className="gh-link desk-only"
              href="https://github.com/immediately-run"
              target="_blank"
              rel="noopener"
            >
              ★ GitHub
            </a>
            <a className="btn nav-cta desk-only" href={platform('/edit/new')}>
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
          </div>
          <a className="btn" href={platform('/edit/new')}>
            Start building →
          </a>
        </div>
      )}
    </>
  );
}

export default Nav;
