// Root component — immediately.run renders the default export of this file.
// Global CSS is imported HERE (not in main.tsx) because immediately.run's runtime
// never loads main.tsx; anything the rendered tree needs must be reachable
// from App.tsx.
import './index.css';
import './App.css';
import { useEffect, useState } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Safety from './components/Safety';
import ShowcaseTeaser from './components/ShowcaseTeaser';
import BuildersAgents from './components/BuildersAgents';
import WhatsNew from './components/WhatsNew';
import ClosingCta from './components/ClosingCta';
import Footer from './components/Footer';
import Search from './components/Search';

function App() {
  const [searchOpen, setSearchOpen] = useState(false);

  // Global ⌘K / Ctrl+K opens the search palette (owned here so the nav button
  // and the shortcut share one source of truth).
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
      <Nav onOpenSearch={() => setSearchOpen(true)} />
      <main className="home wrap" id="main">
        <Hero />
        <HowItWorks />
        <Safety />
        <ShowcaseTeaser />
        <BuildersAgents />
        <WhatsNew />
        <ClosingCta />
      </main>
      <Footer />
      {searchOpen && <Search onClose={() => setSearchOpen(false)} />}
    </>
  );
}

export default App;
