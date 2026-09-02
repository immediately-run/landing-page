import Hero from './Hero';
import RunSection from './RunSection';
import PublishSection from './PublishSection';
import RemixSection from './RemixSection';
import DirectoryTeaser from './DirectoryTeaser';
import WhatsNew from './WhatsNew';
import ClosingCta from './ClosingCta';

// The landing/home route (R3-514): the three product messages in weight order —
// instant safe launch (Run), free controlled publishing (Publish), everything
// remixable (Remix) — then the directory teaser, what's new, and the closing
// doors. The consumer message leads; the author message is the second section,
// not a second hero (product_bet §5, FRONT_DOOR_IA §1.1).

function Home() {
  return (
    <div className="home-fade">
      <Hero />
      <RunSection />
      <PublishSection />
      <RemixSection />
      <DirectoryTeaser />
      <WhatsNew />
      <ClosingCta />
    </div>
  );
}

export default Home;
