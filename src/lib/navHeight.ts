// The sticky nav's height, published as a CSS variable so anything that has to clear it can
// say so declaratively.
//
// Why measured rather than typed. Before R3-571 the number `90px` was spelled in five files,
// and it was wrong in both directions: the desktop nav measures 98px and the mobile one 84px,
// so every rule using it either overlapped the nav or left a gap. A heading's
// `scroll-margin-top` is the case that made it visible — a deep link landed with its heading
// hidden behind the nav — but the same constant also positions three sticky columns.
//
// The nav has no explicit height: it is padding plus whatever the logo and links come to, and
// it reflows at the mobile breakpoint. So there is no number to reference, only a number to
// re-type and get wrong. [[R3-569]] is about to change the mobile bar again, which would
// silently invalidate any value committed here today.
//
// Hence: measure the real element, publish `--nav-h`, and let CSS consume it. The call sites
// stay declarative (`scroll-margin-top: var(--nav-h)`), which is what keeps this a token
// rather than the magic offset at the call site that R3-571 rules out.
//
// The pre-measurement fallback lives in the stylesheet's own `--nav-h` declaration and
// NOWHERE else. A second copy here would be the same defect one layer up: two homes for the
// nav's height, drifting the first time one is updated.

/** The custom property the nav publishes and the stylesheets consume. */
export const NAV_HEIGHT_VAR = '--nav-h';

/**
 * The value to publish for a measured height, or `null` to publish nothing.
 *
 * `null` for a height that cannot be a real sticky bar — zero (the element is display:none,
 * or measured during teardown), negative, or non-finite. Publishing 0 there would set every
 * heading's scroll margin to nothing and reintroduce exactly the bug this fixes, at a moment
 * no test would be looking; keeping the previous value is strictly better.
 *
 * Rounded up: a fractional height truncated downwards leaves the last device pixel of the
 * nav overlapping the heading, which is the same defect one pixel smaller.
 */
export function navHeightValue(height: number): string | null {
  if (!Number.isFinite(height) || height <= 0) return null;
  return `${Math.ceil(height)}px`;
}
