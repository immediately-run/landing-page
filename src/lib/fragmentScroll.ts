// What a fragment scroll should do on any given frame (R3-571).
//
// The item asks for this as a pure function — "the corpus route's anchor handling is testable
// without a browser if the scroll target is computed in a pure function; extract it if it is
// not" — and the reason is visible in the two defects this shape exists to make impossible,
// both of which shipped in a version where the decision lived inline in the hook:
//
//   * a target that CANNOT reach its `scroll-margin-top` (it is nearer the bottom of the page
//     than one viewport) leaves the drift permanently non-zero, so a loop comparing against
//     the ideal position re-scrolls every frame for the whole window and snaps the reader
//     back within ~100ms of any manual scroll;
//   * a reader who scrolls during that window is fighting a loop that cannot see them.
//
// Both are geometry, and geometry is exactly what a unit test can drive. The hook keeps only
// the DOM reads and the rAF.

/** Where the scroll should come to rest, in document coordinates, given where the target is
 *  now. Clamped to what the page can actually scroll to: asking for more is how the
 *  re-scroll storm started. */
export function desiredScrollY(input: {
  /** `getBoundingClientRect().top` of the target. */
  rectTop: number;
  /** The target's computed `scroll-margin-top` — the gap that clears the sticky nav. */
  scrollMarginTop: number;
  /** Current `window.scrollY`. */
  scrollY: number;
  /** `scrollHeight - clientHeight`; the furthest the document can scroll. */
  maxScroll: number;
}): number {
  const ideal = input.scrollY + input.rectTop - input.scrollMarginTop;
  return Math.max(0, Math.min(ideal, Math.max(0, input.maxScroll)));
}

export type FragmentScrollAction =
  /** Scroll to `to`, then keep watching. */
  | { kind: 'scroll'; to: number }
  /** In position; keep watching for late drift without touching the scroll. */
  | { kind: 'wait' }
  /** Stop: either the reader took over, or the deadline passed. */
  | { kind: 'stop'; reason: 'reader-scrolled' | 'deadline' };

/** How close counts as arrived. One pixel, because fractional layout is normal and a
 *  sub-pixel difference is not a reader-visible defect — while treating it as drift is the
 *  loop that never terminates. */
const TOLERANCE_PX = 1;

/**
 * The next action for one frame.
 *
 * Deliberately keeps watching until the deadline once in position, rather than stopping after
 * N stable frames: the drift this exists to catch — content above the heading settling and
 * pushing the target out from under a completed scroll — was measured arriving up to ~330ms
 * in, and a short stability window simply ends before it. Watching is a rect read; only a
 * genuine drift costs a scroll.
 */
export function nextFragmentScrollAction(input: {
  rectTop: number;
  scrollMarginTop: number;
  scrollY: number;
  maxScroll: number;
  elapsedMs: number;
  deadlineMs: number;
  /** The position this loop last scrolled to, or `null` if it has not scrolled yet. */
  appliedScrollY: number | null;
}): FragmentScrollAction {
  // The reader moved the page out from under us. Never fight them: a deep link's job is to
  // deliver you once, not to hold you there.
  if (input.appliedScrollY !== null && Math.abs(input.scrollY - input.appliedScrollY) > TOLERANCE_PX) {
    return { kind: 'stop', reason: 'reader-scrolled' };
  }
  if (input.elapsedMs > input.deadlineMs) return { kind: 'stop', reason: 'deadline' };

  const desired = desiredScrollY(input);
  // Already there — including the case where `desired` is the bottom of the page, so the
  // scroll is SHORTER than the ideal and the heading comes to rest further down the viewport
  // than its margin asked for. It is still fully clear of the nav (the clamp can only scroll
  // less, never more), so the deep link has delivered; that is the page's limit rather than a
  // failure to scroll, and treating it as drift is what produced 74 scrolls in one window.
  if (Math.abs(input.scrollY - desired) <= TOLERANCE_PX) return { kind: 'wait' };

  return { kind: 'scroll', to: desired };
}

/**
 * Whether giving up on a fragment should send the reader to the top of the page.
 *
 * Yes when they have not moved since the route changed — the fragment named nothing, so the
 * ordinary arrival is the top, and without this they keep the PREVIOUS page's offset because
 * `useRoute` stood down on the strength of a fragment being present.
 *
 * No the moment they have scrolled. The reader-takeover rule in `nextFragmentScrollAction`
 * cannot cover this path: it is armed by `appliedScrollY`, and on the never-found path
 * nothing was ever applied. So a reader who scrolls within the deadline of a stale-anchor
 * arrival was pulled to the top — a scroll they did not ask for, undoing one they did.
 */
export function shouldScrollToTopOnGiveUp(input: { scrollY: number; startScrollY: number }): boolean {
  return Math.abs(input.scrollY - input.startScrollY) <= TOLERANCE_PX;
}
