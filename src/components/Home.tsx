import Hero from './Hero';
import HowItWorks from './HowItWorks';
import DirectoryTeaser from './DirectoryTeaser';
import WhatsNew from './WhatsNew';

// The landing/home route, as the 1a quiet-column redesign draws it: four
// sections down one measure — the hero, the product in three steps, the shelf,
// and the latest change.
//
// It was seven. Run / Publish / Remix were three section-length statements of
// the same three ideas HowItWorks now makes once, and the closing band restated
// the hero's call one screen above a footer that already says "Go build." The
// ordering FRONT_DOOR_IA §1.1 asks for is unchanged: the consumer message leads
// and the author message follows inside the steps, rather than as a second hero.

function Home() {
  return (
    <div className="home-fade">
      <Hero />
      <HowItWorks />
      <DirectoryTeaser />
      <WhatsNew />
    </div>
  );
}

export default Home;
