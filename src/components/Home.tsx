import Hero from './Hero';
import HowItWorks from './HowItWorks';
import Safety from './Safety';
import ShowcaseTeaser from './ShowcaseTeaser';
import BuildersAgents from './BuildersAgents';
import WhatsNew from './WhatsNew';
import ClosingCta from './ClosingCta';

// The landing/home route: convince, then route into the rest of the site.
function Home() {
  return (
    <div className="home-fade">
      <Hero />
      <HowItWorks />
      <Safety />
      <ShowcaseTeaser />
      <BuildersAgents />
      <WhatsNew />
      <ClosingCta />
    </div>
  );
}

export default Home;
