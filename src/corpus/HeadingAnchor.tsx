// The render target for the autolink anchor `remarkHeadingAnchors` prepends to every
// heading. The plugin sets the heading's own `id` and emits `<HeadingAnchor id="…"/>` as its
// first child, so this component must exist or MDX's missing-reference guard throws — which
// is how it was found: `npm run build` passed and the page threw at render.
//
// **This one is scroll-only, and that is a limitation of the site, not of the plugin.** On
// immediately.run the SDK's `HeadingAnchor` renders a real permalink — an absolute `<a>`
// whose href a reader can copy. It cannot here, because this site is HASH-ROUTED
// (`#/docs/start/overview`): a URL has exactly one fragment, the router already owns it, and
// a heading permalink would need a second. So the anchor scrolls and offers no href to copy.
//
// The fix is not a cleverer anchor — it is retiring the hash router. Real path routing works
// on the platform (the app owns `sandboxPath`, SANDBOX_ROUTING_SPEC), which would free the
// fragment for exactly this and make `#/docs/…` into `/docs/…`. Recorded here because this
// is where the cost is actually paid.

export default function HeadingAnchor({ id }: { id?: string }) {
  if (!id) return null;
  return (
    <button
      type="button"
      className="docs-heading-anchor"
      aria-label="Scroll to this heading"
      onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
    >
      <span aria-hidden="true">#</span>
    </button>
  );
}
