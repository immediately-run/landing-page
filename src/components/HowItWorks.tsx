// The one middle section of the front door (the 1a quiet-column redesign): the
// product in three steps, replacing the separate Run / Publish / Remix bands.
//
// Those three said the same three things at section length; the redesign says
// them once, in weight order, as 01 · 02 · 03. The consumer message still leads
// (Open), the author message is still second-and-not-a-second-hero (Tinker, then
// Push) — the ordering FRONT_DOOR_IA §1.1 asks for, at a third of the height.
//
// The steps are DATA, not three copies of the same JSX: the numeral, the title
// and the line differ, nothing else does, and a third spelling of one card is
// how the three bands this replaces drifted apart in the first place.

const STEPS = [
  {
    n: '01',
    title: 'Open',
    body: 'Paste a repo or pick one from the shelf. It runs in a sandbox that starts with nothing of yours.',
  },
  {
    n: '02',
    title: 'Tinker',
    body: 'Pop the hood while it runs. Edits land instantly and stay in your copy.',
  },
  {
    n: '03',
    title: 'Push',
    body: 'Send it back to GitHub as a commit or a pull request. Pushing is publishing.',
  },
] as const;

// WORKBENCH_MODES_SPEC §4 "Taught once" — the front door teaches the mode cue in
// the product's voice, in these two sentences, exactly once on the page (owner-
// confirmed 2026-09-02). It lived in the Run section this component replaces; the
// section went, the obligation did not, so it lands here rather than nowhere.
export const TAB_SENTENCE = 'The pull-down tab means you are looking at an app someone published.';
export const PLATFORM_SENTENCE =
  'Platform surfaces carry the immediately.run name and open the platform menu.';

function HowItWorks() {
  return (
    <section className="section how" aria-labelledby="how">
      {/* The mono eyebrow IS this section's heading — it is the only title the
          section has, so it carries the h2 rather than a hidden duplicate of
          itself. The slash is decoration and is not announced. */}
      <h2 id="how" className="tag tag--label how-tag">
        <span aria-hidden="true">/</span>HOW IT WORKS
      </h2>
      <div className="how-grid">
        {STEPS.map((step) => (
          <div className="how-step" key={step.n}>
            <div className="how-num grad-text" aria-hidden="true">
              {step.n}
            </div>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </div>
        ))}
      </div>
      <p className="how-cue">
        {TAB_SENTENCE} {PLATFORM_SENTENCE}
      </p>
    </section>
  );
}

export default HowItWorks;
