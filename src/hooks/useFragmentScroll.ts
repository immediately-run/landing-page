// Land a deep link on its heading.
//
// A permalink is only half a feature if it copies but does not arrive. The browser scrolls
// to a fragment when the document loads, which for a client-rendered app is BEFORE the
// heading exists — so pasting `/docs/start/overview#the-run-edit-contribute-loop` put the
// reader at the top of the page, silently. (Measured: `scrollY` 0 with the heading 385px
// down.) Nothing errors; the link just quietly does not work, which is the worst shape for
// a bug in a documentation site.
//
// So the app scrolls itself, once the target exists — and keeps it there. The retry window
// matters twice over: the element appears on the first paint after the route resolves, and
// content above it can settle afterwards, which moves the heading out from under a scroll
// already performed (measured at 7px on the docs overview — enough to put it back behind the
// sticky nav it had just cleared).
//
// This hook is the DOM half only. Every decision — where to scroll, whether it has arrived,
// whether the reader has taken over, when to give up — is `nextFragmentScrollAction`, so the
// geometry that made two earlier versions of this wrong is unit-tested rather than
// browser-only.

import { useEffect } from 'react';
import { nextFragmentScrollAction, shouldScrollToTopOnGiveUp } from '../lib/fragmentScroll';

/** How long to keep looking for the target, in ms. Long enough for MDX + CSS to settle,
 *  short enough that a bad fragment is not a busy loop. */
const DEADLINE_MS = 1200;

export function useFragmentScroll(fragment: string | undefined, routeKey: string): void {
  useEffect(() => {
    const id = (fragment ?? '').replace(/^#/, '');
    if (!id) return;
    let cancelled = false;
    let appliedScrollY: number | null = null;
    let everFound = false;
    const started = Date.now();
    // Where the reader was when this route arrived, so giving up can tell "never moved" from
    // "moved deliberately" — the loop's own reader-takeover rule cannot, because it is armed
    // by a scroll this path never performs.
    const startScrollY = window.scrollY;

    const tick = () => {
      if (cancelled) return;
      const elapsedMs = Date.now() - started;
      const el = document.getElementById(id);

      if (!el) {
        if (elapsedMs > DEADLINE_MS) {
          // The fragment names nothing on this page — a stale anchor, or a heading since
          // renamed. Without this the reader keeps the PREVIOUS page's scroll offset, because
          // `useRoute` stands down whenever a fragment is named and only this loop knows
          // whether it landed. Arriving at the top of the new page is the ordinary behaviour
          // and the right fallback.
          if (!everFound && shouldScrollToTopOnGiveUp({ scrollY: window.scrollY, startScrollY })) {
            // `instant` for the same reason as the arrival scroll below: bare `scrollTo`
            // resolves to `html { scroll-behavior: smooth }` and animates for the best part
            // of a second, which is precisely what that comment says to avoid.
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
          return;
        }
        requestAnimationFrame(tick);
        return;
      }

      everFound = true;
      const action = nextFragmentScrollAction({
        rectTop: el.getBoundingClientRect().top,
        // The gap that clears the sticky nav, read from the element rather than assumed: it
        // is a measured token (`--nav-h`), so a number here would be a second home for it.
        scrollMarginTop: Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0,
        scrollY: window.scrollY,
        maxScroll: document.documentElement.scrollHeight - document.documentElement.clientHeight,
        elapsedMs,
        deadlineMs: DEADLINE_MS,
        appliedScrollY,
      });

      if (action.kind === 'stop') return;
      if (action.kind === 'scroll') {
        // `instant`, not `auto`: this is arrival, not navigation — a smooth scroll from the
        // top of a long page is a second of the reader watching content fly past. It has to
        // be spelled `instant`, because `auto` resolves to `html { scroll-behavior: smooth }`
        // (index.css) and so asked for exactly what that comment said to avoid. It is also
        // what keeps the next frame's reading meaningful: an animating scroll never matches
        // its target, so a loop comparing against one would never settle.
        window.scrollTo({ top: action.to, behavior: 'instant' });
        appliedScrollY = action.to;
      }
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    return () => {
      cancelled = true;
    };
    // `routeKey` re-arms this on navigation: the same fragment on a different page is a
    // different target.
  }, [fragment, routeKey]);
}
