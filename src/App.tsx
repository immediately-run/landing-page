// Root component — immediately.run renders the default export of this file.
// Global CSS is imported HERE (not in main.tsx) because immediately.run's runtime
// never loads main.tsx; anything the rendered tree needs must be reachable
// from App.tsx.
//
// The whole public site lives in this one app, routed by PATH (see hooks/useRoute):
// `/` · `/showcase` · `/apps` · `/docs/…` · `/tutorials/…` · `/changelog`. The shell (nav +
// footer) is persistent; the active section fills the content region.
//
// The routes used to be hash-based, on the premise that "immediately.run serves a single
// entry with no server to resolve sub-paths". That was already false: SANDBOX_ROUTING_SPEC
// splits an outer URL into a platform-owned prefix and an APP-owned `sandboxPath`, and the
// host mirrors the browser location into the sandbox on every navigation. The hash was
// costing a real thing — a URL has exactly one fragment, the router had taken it, and so a
// heading permalink had nowhere to point.
import './index.css';
import './App.css';
import { useEffect, useState } from 'react';
import { useFragment, useRoute } from './hooks/useRoute';
import { useFragmentScroll } from './hooks/useFragmentScroll';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Search from './components/Search';
import SectionErrorBoundary from './components/SectionErrorBoundary';
import Home from './components/Home';
import Showcase from './sections/showcase/Showcase';
import Apps from './sections/apps/Apps';
import Docs from './sections/docs/Docs';
import Tutorials from './sections/tutorials/Tutorials';
import Changelog from './sections/changelog/Changelog';

function App() {
  const route = useRoute();
  // A deep link with a fragment has to land on its heading, and the browser's own scroll
  // fires before the section renders. See the hook for what that looked like.
  const fragment = useFragment();
  useFragmentScroll(fragment, `${route.section}/${route.rest.join('/')}`);
  const [searchOpen, setSearchOpen] = useState(false);

  // Global ⌘K / Ctrl+K opens the search palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <Nav active={route.section} onOpenSearch={() => setSearchOpen(true)} />
      <main className="wrap site-main" id="main" role="main">
        {/* Keyed by section so a thrown section's error clears when you navigate. */}
        <SectionErrorBoundary key={route.section}>
          {route.section === 'home' && <Home />}
          {route.section === 'showcase' && <Showcase />}
          {route.section === 'apps' && <Apps />}
          {route.section === 'docs' && <Docs rest={route.rest} />}
          {route.section === 'tutorials' && <Tutorials rest={route.rest} />}
          {route.section === 'changelog' && <Changelog />}
        </SectionErrorBoundary>
      </main>
      <Footer />
      {searchOpen && <Search onClose={() => setSearchOpen(false)} />}
    </>
  );
}

export default App;
