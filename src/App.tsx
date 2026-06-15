// Root component — immediately.run renders the default export of this file.
// Global CSS is imported HERE (not in main.tsx) because immediately.run's runtime
// never loads main.tsx; anything the rendered tree needs must be reachable
// from App.tsx.
//
// The whole public site lives in this one app, routed by hash (see hooks/useRoute):
// home · showcase · apps · docs · tutorials · changelog. The shell (nav + footer)
// is persistent; the active section fills the content region.
import './index.css';
import './App.css';
import { useEffect, useState } from 'react';
import { useRoute } from './hooks/useRoute';
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
