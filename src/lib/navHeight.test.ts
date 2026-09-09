import { describe, expect, it } from 'vitest';
import { navHeightValue } from './navHeight';

describe('navHeightValue', () => {
  it('publishes a px length for a real measurement', () => {
    expect(navHeightValue(98)).toBe('98px');
    expect(navHeightValue(84)).toBe('84px');
  });

  it('rounds UP, so the last device pixel of the nav cannot overlap the heading', () => {
    // Truncating downwards leaves the same defect one pixel smaller, which is the kind of
    // bug that gets re-filed rather than fixed.
    expect(navHeightValue(97.2)).toBe('98px');
    expect(navHeightValue(83.5)).toBe('84px');
    expect(navHeightValue(84.000001)).toBe('85px');
  });

  it.each([
    ['zero — the element is display:none or measured during teardown', 0],
    ['negative', -1],
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', Number.NEGATIVE_INFINITY],
  ])('returns null for %s, so the caller keeps the last good value', (_label, input) => {
    expect(navHeightValue(input)).toBeNull();
  });

  it('never returns a zero-length value for any input', () => {
    // The class, not one member: `0px` published into `--nav-h` would set every corpus
    // heading's scroll margin back to nothing and reintroduce R3-571 at a moment no test
    // would be watching.
    for (const n of [0, -0, -5, 0.4, 0.0001, Number.NaN, Number.POSITIVE_INFINITY, 1e-9]) {
      const v = navHeightValue(n);
      expect(v === null || /^[1-9]\d*px$/.test(v)).toBe(true);
    }
  });

});
