import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import type { Section } from '../hooks/useRoute';
import logoMark from '../assets/logo-mark.png';

// Section links. The whole site lives in this one app, routed by hash.
const NAV_ITEMS: { label: string; href: string; section: Section }[] = [
  { label: 'Showcase', href: '#/showcase', section: 'showcase' },
  { label: 'Apps', href: '#/apps', section: 'apps' },
  { label: 'Docs', href: '#/docs', section: 'docs' },
  { label: 'Tutorials', href: '#/tutorials', section: 'tutorials' },
  { label: "What's new", href: '#/changelog', section: 'changelog' },
];

interface NavProps {
  active: Section;
  onOpenSearch: () => void;
}

function Nav({ active, onOpenSearch }: NavProps) {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLight = theme === 'light';

  return (
    <>
      <nav className="nav" aria-label="Primary">
        <div className="nav-inner">
          <a className="logo" href="#/">
            <img className="logo-mark" src={logoMark} alt="" width={27} height={27} />
            immediately.run
          </a>
          <div className="nav-links">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                className={`nav-link${active === item.section ? ' nav-link--active' : ''}`}
                href={item.href}
                aria-current={active === item.section ? 'page' : undefined}
              >
                {item.label}
              </a>
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
            <a className="btn nav-cta desk-only" href="/edit/new">
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
              <a
                key={item.href}
                className="nav-sheet-link"
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
          <a className="btn" href="/edit/new">
            Start building →
          </a>
        </div>
      )}
    </>
  );
}

export default Nav;
