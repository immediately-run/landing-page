// The render target for the autolink anchor `remarkHeadingAnchors` prepends to every
// heading. The plugin sets the heading's own `id` and emits `<HeadingAnchor id="…"/>` as its
// first child, so this component must exist or MDX's missing-reference guard throws at
// RENDER — which is how it was found, on a clean build.
//
// **This is a real permalink now.** It used to be scroll-only, because the site was
// hash-routed: a URL has exactly one fragment and the router had taken it, so there was no
// href a reader could copy. Retiring the hash router gave the fragment back, and this is
// the first thing to spend it on — a heading a reader can link someone else to, which is
// most of what a documentation URL is for.
//
// The two halves pull in opposite directions and both have to be right (the same reasoning
// the SDK's own `HeadingAnchor` records):
//
//   • the HREF must be absolute in the HOST's space, so copy-link, middle-click and
//     open-in-new-tab all produce a URL that resolves for someone else. Inside the sandbox
//     a bare `#id` resolves against the SANDBOX's document URL, and "copy link address"
//     then yields a sandbox-internal URL that means nothing to anyone;
//   • the CLICK must not navigate to it — that is a full page load to the page you are
//     already on. It scrolls, and the address bar the host owns is left alone.

import { useCallback } from 'react';
import type { MouseEvent } from 'react';
import { useHostLocation } from '../hooks/useRoute';
import { hrefFor } from '../lib/navigation';
import { useRoute } from '../hooks/useRoute';
import { routePath } from '../lib/routeSpace';

export default function HeadingAnchor({ id }: { id?: string }) {
  const loc = useHostLocation();
  const route = useRoute();

  const onClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      // A modified click MEANS "open the permalink", and the href is exactly right for it.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [id],
  );

  // Defensive: the plugin always supplies an id. Render nothing rather than a dead `#`.
  if (!id) return null;
  const href = `${hrefFor(loc, routePath(route))}#${id}`;

  return (
    <a
      className="docs-heading-anchor"
      href={href}
      onClick={onClick}
      aria-label="Permalink to this heading"
    >
      <span aria-hidden="true">#</span>
    </a>
  );
}
