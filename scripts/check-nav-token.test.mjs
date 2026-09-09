import { describe, expect, it } from 'vitest';
import { checkNavToken, cssFiles, MUST_CONSUME, VAR } from './check-nav-token.mjs';

// R3-571. These rules exist because the token has two sides — a declaration in one
// stylesheet and `var()` references in four others — and nothing else in the build notices
// when they stop agreeing: an unknown custom property is invalid-at-computed-value-time, so
// `scroll-margin-top` silently falls back to `0px` and the deep-link bug returns with no
// error anywhere. Each case below is one way that agreement can break.

const declFile = (px = 98) => ['App.css', `:root{--section-gap:132px;${VAR}: ${px}px;}`];
const consumer = (name) => [name, `.x{scroll-margin-top:var(${VAR})}`];
const allConsumers = () => MUST_CONSUME.map(consumer);

describe('checkNavToken', () => {
  it('passes when one stylesheet declares it and every consumer reads it', () => {
    const r = checkNavToken([declFile(), ...allConsumers()]);
    expect({ ok: r.ok, errors: r.errors }).toEqual({ ok: true, errors: [] });
    expect({ declaredIn: r.declaredIn, px: r.px }).toEqual({ declaredIn: 'App.css', px: 98 });
  });

  it('fails when nothing declares it — the rename case, where every var() falls back to 0', () => {
    const r = checkNavToken(allConsumers());
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toContain('no stylesheet declares');
  });

  it('fails on a SECOND declaration, because two homes is the drift this token ends', () => {
    const r = checkNavToken([declFile(98), ['other.css', `:root{${VAR}: 84px}`], ...allConsumers()]);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toContain('One home');
  });

  it('fails on a zero declaration — that hides the heading rather than merely offsetting it', () => {
    const r = checkNavToken([declFile(0), ...allConsumers()]);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toContain('zero fallback');
  });

  it.each(MUST_CONSUME)('fails when %s stops reading the token', (dropped) => {
    // The class, not one favourite: each of these sections sticks something below the nav or
    // scrolls a heading out from under it, so each losing the token is its own regression.
    const files = [declFile(), ...allConsumers().filter(([n]) => n !== dropped)];
    const r = checkNavToken(files);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toContain(dropped);
  });

  it('fails when a stale 90px comes back, in either property', () => {
    for (const prop of ['top', 'scroll-margin-top']) {
      const r = checkNavToken([declFile(), ...allConsumers(), ['stale.css', `.y{${prop}: 90px}`]]);
      expect({ prop, ok: r.ok }).toEqual({ prop, ok: false });
      expect(r.errors.join(' ')).toContain('stale.css');
    }
  });

  it('catches the decimal and upper-case spellings of the same stale value', () => {
    for (const decl of ['scroll-margin-top: 90.0px', 'top: 90PX', 'top:90.00px']) {
      const r = checkNavToken([declFile(), ...allConsumers(), ['stale.css', `.y{${decl}}`]]);
      expect({ decl, ok: r.ok }).toEqual({ decl, ok: false });
    }
  });

  it('does not flag a CSS COMMENT that documents the old value', () => {
    // App.css explains why 90px was wrong. A check that failed on its own explanation would
    // be unusable, and the explanation is the thing most worth keeping.
    const r = checkNavToken([declFile(), ...allConsumers(), ['doc.css', '/* was top: 90px, 8px short */ .y{top:var(--nav-h)}']]);
    expect({ ok: r.ok, errors: r.errors }).toEqual({ ok: true, errors: [] });
  });

  it('does not mistake an unrelated 90px for a nav offset', () => {
    // `line-height: 90px` and a custom property that merely ends in `top` are not the bug.
    const r = checkNavToken([declFile(), ...allConsumers(), ['fine.css', '.z{line-height:90px;--card-top: 90px}']]);
    expect({ ok: r.ok, errors: r.errors }).toEqual({ ok: true, errors: [] });
  });

  it('holds over the REAL stylesheets — the producer, not a fixture', () => {
    // One input from the real producer (R2): the app's own `src/` tree, read the same way
    // the script reads it. This is the case that actually guards the shipped CSS; the
    // fixtures above only prove the rules can fail.
    const r = checkNavToken(cssFiles('src'));
    expect({ ok: r.ok, errors: r.errors }).toEqual({ ok: true, errors: [] });
    expect(r.consuming).toBeGreaterThanOrEqual(MUST_CONSUME.length);
  });
});
