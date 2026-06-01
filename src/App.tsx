// Root component — immediately.run renders the default export of this file.
// Global CSS is imported HERE (not in main.tsx) because immediately.run's runtime
// never loads main.tsx; anything the rendered tree needs must be reachable
// from App.tsx.
import './index.css';
import './App.css';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Showcase from './components/Showcase';
import Docs from './components/Docs';
import News from './components/News';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Nav />
      <Hero />
      <main className="wrap">
        <Showcase />
        <Docs />
        <News />
        <Footer />
      </main>
    </>
  );
}

export default App;
