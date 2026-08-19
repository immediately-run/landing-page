// Land a deep link on its heading.
//
// A permalink is only half a feature if it copies but does not arrive. The browser scrolls
// to a fragment when the document loads, which for a client-rendered app is BEFORE the
// heading exists — so pasting `/docs/start/overview#the-run-edit-contribute-loop` put the
// reader at the top of the page, silently. (Measured: `scrollY` 0 with the heading 385px
// down.) Nothing errors; the link just quietly does not work, which is the worst shape for
// a bug in a documentation site.
//
// So the app scrolls itself, once the target exists. The retry window matters: the element
// appears on the first paint after the route resolves, but an image or a late layout can
// shift it, so this re-checks over a few frames and stops as soon as it lands — bounded, so
// a fragment naming nothing gives up quietly instead of spinning.

import { useEffect } from 'react';

/** How long to keep looking for the target, in ms. Long enough for MDX + CSS to settle,
 *  short enough that a bad fragment is not a busy loop. */
const DEADLINE_MS = 1200;

export function useFragmentScroll(fragment: string | undefined, routeKey: string): void {
  useEffect(() => {
    const id = (fragment ?? '').replace(/^#/, '');
    if (!id) return;
    let done = false;
    const started = Date.now();
    const tick = () => {
      if (done) return;
      const el = document.getElementById(id);
      if (el) {
        // `auto`, not `smooth`: this is arrival, not navigation. A smooth scroll from the
        // top of a long page is a second of the reader watching content fly past.
        el.scrollIntoView({ behavior: 'auto', block: 'start' });
        done = true;
        return;
      }
      if (Date.now() - started > DEADLINE_MS) return;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => {
      done = true;
    };
    // `routeKey` re-arms this on navigation: the same fragment on a different page is a
    // different target.
  }, [fragment, routeKey]);
}
