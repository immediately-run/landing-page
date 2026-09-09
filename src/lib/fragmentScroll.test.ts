import { describe, expect, it } from 'vitest';
import {
  desiredScrollY,
  nextFragmentScrollAction,
  shouldScrollToTopOnGiveUp,
  type FragmentScrollAction,
} from './fragmentScroll';

// R3-571. Every case here is a geometry the browser can present and the hook must survive.
// The two that matter most are the ones a version of this shipped without: a target that
// cannot reach its margin, and a reader who scrolls mid-window.

const at = (over: Partial<Parameters<typeof nextFragmentScrollAction>[0]> = {}) =>
  nextFragmentScrollAction({
    rectTop: 500,
    scrollMarginTop: 98,
    scrollY: 0,
    maxScroll: 2000,
    elapsedMs: 0,
    deadlineMs: 1200,
    appliedScrollY: null,
    ...over,
  });

describe('desiredScrollY', () => {
  it('puts the target its own scroll-margin below the viewport top', () => {
    expect(desiredScrollY({ rectTop: 500, scrollMarginTop: 98, scrollY: 0, maxScroll: 2000 })).toBe(402);
    // From a scrolled position the arithmetic is the same, in document coordinates.
    expect(desiredScrollY({ rectTop: 100, scrollMarginTop: 98, scrollY: 900, maxScroll: 2000 })).toBe(902);
  });

  it('clamps to what the page can actually scroll to', () => {
    // The heading is nearer the bottom than one viewport: its ideal position does not exist.
    // Measured case — /changelog#space-invitations at 1280x727 wanted 709 of a possible 703.
    expect(desiredScrollY({ rectTop: 806, scrollMarginTop: 98, scrollY: 1, maxScroll: 703 })).toBe(703);
  });

  it('clamps at zero rather than asking for a negative scroll', () => {
    expect(desiredScrollY({ rectTop: 10, scrollMarginTop: 98, scrollY: 0, maxScroll: 2000 })).toBe(0);
  });
});

describe('nextFragmentScrollAction', () => {
  it('scrolls to the computed position when it is not there yet', () => {
    expect(at()).toEqual<FragmentScrollAction>({ kind: 'scroll', to: 402 });
  });

  it('waits once in position, so a landed link costs a rect read and nothing else', () => {
    expect(at({ rectTop: 98, scrollY: 402, appliedScrollY: 402 })).toEqual<FragmentScrollAction>({ kind: 'wait' });
  });

  it('tolerates a sub-pixel difference rather than treating it as drift', () => {
    expect(at({ rectTop: 98.4, scrollY: 402, appliedScrollY: 402 })).toEqual<FragmentScrollAction>({ kind: 'wait' });
  });

  // The first blocking defect. A target nearer the bottom of the page than one viewport can
  // never sit at its scroll-margin, so comparing against the ideal made `drift > 1` true
  // forever: 74 scrollIntoView calls across the window, and the reader snapped back within
  // ~100ms of any manual scroll. At the page's limit this must be `wait`, not `scroll`.
  it('STOPS scrolling at the bottom of the page, where the margin is unreachable', () => {
    const atLimit = { rectTop: 103, scrollMarginTop: 98, scrollY: 703, maxScroll: 703 };
    expect(nextFragmentScrollAction({ ...atLimit, elapsedMs: 0, deadlineMs: 1200, appliedScrollY: 703 })).toEqual<FragmentScrollAction>(
      { kind: 'wait' },
    );
    // …and it is still `wait` after many frames, i.e. it cannot become a storm.
    for (const elapsedMs of [16, 200, 600, 1199]) {
      expect({ elapsedMs, action: nextFragmentScrollAction({ ...atLimit, elapsedMs, deadlineMs: 1200, appliedScrollY: 703 }) }).toEqual({
        elapsedMs,
        action: { kind: 'wait' },
      });
    }
  });

  // The second. Never fight a reader.
  it('stops the moment the reader scrolls away from where we put them', () => {
    expect(at({ rectTop: 300, scrollY: 100, appliedScrollY: 402 })).toEqual<FragmentScrollAction>({
      kind: 'stop',
      reason: 'reader-scrolled',
    });
  });

  it('does not mistake CONTENT moving for the reader moving', () => {
    // Content above the heading settled: the page did not scroll (scrollY is still where we
    // put it) but the target is now higher. That is the drift the loop exists for, so it
    // corrects rather than stopping.
    expect(at({ rectTop: 300, scrollY: 402, appliedScrollY: 402 })).toEqual<FragmentScrollAction>({
      kind: 'scroll',
      to: 604,
    });
  });

  it('keeps watching to the deadline, not for a handful of frames', () => {
    // The drift it exists to catch was measured arriving up to ~330ms in; a short stability
    // window ends first and covers nothing.
    expect(at({ rectTop: 98, scrollY: 402, appliedScrollY: 402, elapsedMs: 900 })).toEqual<FragmentScrollAction>({
      kind: 'wait',
    });
    expect(at({ rectTop: 300, scrollY: 402, appliedScrollY: 402, elapsedMs: 900 })).toEqual<FragmentScrollAction>({
      kind: 'scroll',
      to: 604,
    });
  });

  it('gives up at the deadline rather than spinning', () => {
    expect(at({ elapsedMs: 1201 })).toEqual<FragmentScrollAction>({ kind: 'stop', reason: 'deadline' });
  });

  it('checks the reader BEFORE the deadline, so a takeover is never reported as a timeout', () => {
    expect(at({ scrollY: 100, appliedScrollY: 402, elapsedMs: 5000 })).toEqual<FragmentScrollAction>({
      kind: 'stop',
      reason: 'reader-scrolled',
    });
  });

  it('converges: driving the loop over a settling page reaches position and stays', () => {
    // The whole contract in one run — an unreachable ideal, then content settling, driven
    // until it stops. If any rule were wrong this either never terminates or never lands.
    let scrollY = 0;
    let appliedScrollY: number | null = null;
    let rectTop = 500;
    const maxScroll = 2000;
    const scrolls: number[] = [];
    for (let frame = 0; frame < 80; frame += 1) {
      const action = nextFragmentScrollAction({
        rectTop,
        scrollMarginTop: 98,
        scrollY,
        maxScroll,
        elapsedMs: frame * 16,
        deadlineMs: 1200,
        appliedScrollY,
      });
      if (action.kind === 'stop') break;
      if (action.kind === 'scroll') {
        rectTop -= action.to - scrollY; // the scroll moves the element up by the delta
        scrollY = action.to;
        appliedScrollY = action.to;
        scrolls.push(action.to);
      }
      if (frame === 20) rectTop -= 200; // content above settles, 320ms in
    }
    // Two corrections: the initial landing and the late settle. Not seventy-four.
    expect(scrolls.length).toBe(2);
    expect(rectTop).toBe(98);
  });
});

describe('shouldScrollToTopOnGiveUp', () => {
  it('goes to the top when the reader has not moved — a stale anchor is an ordinary arrival', () => {
    // Without this the reader keeps the PREVIOUS page's offset, because `useRoute` stands
    // down whenever a fragment is named.
    expect(shouldScrollToTopOnGiveUp({ scrollY: 900, startScrollY: 900 })).toBe(true);
    expect(shouldScrollToTopOnGiveUp({ scrollY: 0, startScrollY: 0 })).toBe(true);
  });

  it('leaves a reader who scrolled exactly where they are', () => {
    // The takeover rule in `nextFragmentScrollAction` cannot cover this path — it is armed by
    // a scroll that never happened when the target is never found — so a reader who scrolled
    // during the window was pulled to the top: a scroll they did not ask for, undoing one
    // they did. Measured at t=1223ms on a stale anchor before this existed.
    expect(shouldScrollToTopOnGiveUp({ scrollY: 500, startScrollY: 900 })).toBe(false);
    expect(shouldScrollToTopOnGiveUp({ scrollY: 1200, startScrollY: 900 })).toBe(false);
  });

  it('tolerates a sub-pixel difference rather than reading it as a reader', () => {
    expect(shouldScrollToTopOnGiveUp({ scrollY: 900.5, startScrollY: 900 })).toBe(true);
  });
});
