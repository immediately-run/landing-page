import { describe, expect, it } from 'vitest';
import { ALLOWLIST, checkButtons, HOME, isOnlySharedClass, staleAllowlistEntries } from './check-buttons.mjs';
import { cssFiles, cssRules } from './css-source.mjs';

// R3-749. These rules exist because the pill button had eight gradient-primary copies and
// four hairline-secondary ones, each hand-typed in its own section — and `.new-start`, the
// copy on /new, forgot the radius and padding entirely, shipping the page's one primary
// action as a square gradient slab. Nothing in the build compared a section's rule against
// the shared class; each case below is one way that comparison can fail.

const home = () => [
  HOME,
  `.btn-primary,.btn-secondary{display:inline-flex;border-radius:var(--r-pill);padding:10px 20px}
   .btn-primary{background:var(--grad-btn);color:var(--on-grad)}
   .btn-secondary{border-color:var(--line-2);background:var(--panel);color:var(--ink)}`,
];
const clean = ['clean.css', '.card{border:1px solid var(--line);border-radius:var(--r-lg)}'];

describe('checkButtons', () => {
  it('passes when the home defines both classes and no section carries a copy', () => {
    const r = checkButtons([home(), clean]);
    expect({ ok: r.ok, errors: r.errors }).toEqual({ ok: true, errors: [] });
  });

  it('fails when App.css is missing — the copies would have no home to be copies of', () => {
    const r = checkButtons([clean]);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toContain('no App.css');
  });

  it('fails when the home stops defining one of the two classes', () => {
    const r = checkButtons([[HOME, '.btn-primary{background:var(--grad-btn)}'], clean]);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toContain('.btn-secondary');
  });

  it('fails on a planted gradient-primary copy — the .new-start bug, minus the radius', () => {
    const r = checkButtons([home(), clean, ['new.css', '.new-start{background:var(--grad-btn);color:#fff}']]);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toContain('new.css');
  });

  it('fails on the background-image spelling of the same copy', () => {
    const r = checkButtons([home(), clean, ['sneaky.css', '.x{background-image:var(--grad-btn)}']]);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toContain('sneaky.css');
  });

  it('fails on a modifier-named gradient copy — .btn-primary--xl is not .btn-primary', () => {
    const r = checkButtons([home(), clean, ['sneaky.css', '.btn-primary--xl{background:var(--grad-btn);padding:2px 4px}']]);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toContain('sneaky.css');
  });

  it('fails on a descendant gradient copy — .btn-primary .child is not .btn-primary', () => {
    const r = checkButtons([home(), clean, ['sneaky.css', '.btn-primary .child{background:var(--grad-btn)}']]);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toContain('sneaky.css');
  });

  it('fails on a pseudo-qualified gradient copy — a section may not restyle the primary pill', () => {
    const r = checkButtons([home(), clean, ['sneaky.css', '.btn-primary:hover{background:var(--grad-btn)}']]);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toContain('sneaky.css');
  });

  it('fails on a mixed selector — .btn-primary does not launder another selector part', () => {
    const r = checkButtons([home(), clean, ['sneaky.css', '.btn-primary,.sneaky{background:var(--grad-btn)}']]);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toContain('sneaky.css');
  });

  it('fails on copies planted inside @media — the parser sees through the wrapper', () => {
    const r = checkButtons([
      home(),
      clean,
      ['media.css', '@media (max-width:720px){.g{background:var(--grad-btn)}.h{border:1px solid var(--line-2);border-radius:var(--r-pill)}}'],
    ]);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toContain('.g');
    expect(r.errors.join(' ')).toContain('.h');
  });

  it('fails on a planted hairline-secondary copy', () => {
    const r = checkButtons([home(), clean, ['docs.css', '.docs-btn--fork{border:1px solid var(--line-2);border-radius:var(--r-pill)}']]);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toContain('docs.css');
  });

  it('does not flag a pill radius or a hairline border alone — the copy is the pair', () => {
    const r = checkButtons([
      home(),
      ['half.css', '.a{border-radius:var(--r-pill)}.b{border:1px solid var(--line-2)}.c{background:var(--grad)}'],
    ]);
    expect({ ok: r.ok, errors: r.errors }).toEqual({ ok: true, errors: [] });
  });

  it.each(ALLOWLIST.filter((e) => e.rule === 'gradient'))(
    'passes the allowlisted state rule $file $selector',
    (entry) => {
      const planted = [entry.file, `${entry.selector}{background:var(--grad-btn)}`];
      const r = checkButtons([home(), planted]);
      expect({ ok: r.ok, errors: r.errors }).toEqual({ ok: true, errors: [] });
    },
  );

  it.each(ALLOWLIST.filter((e) => e.rule === 'hairline'))(
    'passes the allowlisted chip/container $file $selector',
    (entry) => {
      const planted = [entry.file, `${entry.selector}{border:1px solid var(--line-2);border-radius:var(--r-pill)}`];
      const r = checkButtons([home(), planted]);
      expect({ ok: r.ok, errors: r.errors }).toEqual({ ok: true, errors: [] });
    },
  );

  it('holds over the REAL stylesheets — the producer, not a fixture', () => {
    // One input from the real producer (R2): the app's own `src/` tree, read the same way
    // the script reads it. This is the case that guards the shipped CSS; the fixtures above
    // only prove the rules can fail.
    const r = checkButtons(cssFiles('src'));
    expect({ ok: r.ok, errors: r.errors }).toEqual({ ok: true, errors: [] });
  });

  it('every ALLOWLIST entry still matches a real rule — a stale reason is a lie', () => {
    expect(staleAllowlistEntries(cssFiles('src'))).toEqual([]);
  });

  it('inside the home, the gradient fill belongs to .btn-primary alone', () => {
    // The script's rule 1 governs the sections (per the item's wording); the home's own
    // invariant — exit criterion 1's App.css half — is pinned here over the real tree, so
    // a second gradient setter cannot appear beside the shared class.
    const [, appCss] = cssFiles('src').find(([name]) => name === HOME);
    const setters = cssRules(appCss)
      .filter(([, decls]) => /background(?:-image)?\s*:[^;]*var\(--grad-btn\)/.test(decls))
      .map(([selector]) => selector);
    expect(setters.length).toBeGreaterThan(0);
    for (const selector of setters) expect(isOnlySharedClass(selector, '.btn-primary')).toBe(true);
  });
});
