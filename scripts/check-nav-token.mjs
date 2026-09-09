// R3-571 — the `--nav-h` token is declared once and actually consumed.
//
// Why a script and not a unit test of the constant: vitest returns an empty string for `.css`
// imports, so a test cannot read a stylesheet, and asserting `NAV_HEIGHT_VAR === '--nav-h'` in
// isolation is a string equalling itself — rename the property in the CSS and the suite stays
// green while every `var(--nav-h)` becomes invalid-at-computed-value-time and
// `scroll-margin-top` falls back to the initial `0px`, which is R3-571 exactly as filed. The
// two sides are only bound by something that reads both, and this repo already reads CSS from
// `verify` (`check:dead-css`).
//
// The decision is `checkNavToken`, a pure function over `[name, text]` pairs; `main` supplies
// the real `src/` tree. That split is what makes the rules testable without a fixture
// directory — see `check-nav-token.test.mjs`.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const VAR = '--nav-h';

/** Sections that stick something below the nav or scroll a heading out from under it. Each
 *  spelled a hardcoded `90px` before R3-571 — 8px short of the real bar, so they sat behind
 *  it. Named rather than derived: the point is that this set stays covered. */
export const MUST_CONSUME = ['docs.css', 'tutorials.css', 'apps.css', 'changelog.css'];

const declarationRe = () => new RegExp(`${VAR}\\s*:\\s*(\\d+)px`);
const stalePxRe = /(?:^|[^-\w])(?:top|scroll-margin-top)\s*:\s*90(?:\.0+)?px/i;

/** CSS comments are prose, not rules: `App.css` documents the old `90px` by name, and a
 *  check that flagged its own explanation would be unusable. */
const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, ' ');

/**
 * The rules, over `[basename, text]` pairs. Returns every failure rather than the first, so
 * one run tells you everything that is wrong.
 */
export function checkNavToken(files, { mustConsume = MUST_CONSUME } = {}) {
  const errors = [];
  const declaring = files.filter(([, text]) => declarationRe().test(text));

  if (declaring.length === 0) {
    errors.push(`no stylesheet declares ${VAR}. Every var(${VAR}) would fall back to 0.`);
  } else if (declaring.length > 1) {
    errors.push(
      `${VAR} is declared in ${declaring.length} files (${declaring.map(([n]) => n).join(', ')}). One home, or they drift.`,
    );
  }

  let px = null;
  if (declaring.length === 1) {
    px = Number(declarationRe().exec(declaring[0][1])[1]);
    if (!(px > 0)) {
      errors.push(
        `${VAR} is declared 0 in ${declaring[0][0]}; a zero fallback hides the heading rather than merely offsetting it.`,
      );
    }
  }

  const missing = mustConsume.filter((name) => {
    const found = files.find(([n]) => n === name);
    return !found || !found[1].includes(`var(${VAR})`);
  });
  if (missing.length) errors.push(`these clear the nav but do not read ${VAR}: ${missing.join(', ')}`);

  const stale = files.filter(([, text]) => stalePxRe.test(stripComments(text))).map(([n]) => n);
  if (stale.length) {
    errors.push(`still hardcoding 90px (the pre-R3-571 value, 8px short of the nav): ${stale.join(', ')}`);
  }

  return {
    ok: errors.length === 0,
    errors,
    declaredIn: declaring.length === 1 ? declaring[0][0] : null,
    px,
    consuming: files.filter(([, text]) => text.includes(`var(${VAR})`)).length,
  };
}

/** Every stylesheet under `dir`, as `[basename, text]`. */
export function cssFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) cssFiles(full, out);
    else if (entry.name.endsWith('.css')) out.push([entry.name, readFileSync(full, 'utf8')]);
  }
  return out;
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith('check-nav-token.mjs');
if (invokedDirectly) {
  const result = checkNavToken(cssFiles('src'));
  if (!result.ok) {
    for (const e of result.errors) console.error(`✗ check:nav-token — ${e}`);
    process.exit(1);
  }
  console.log(
    `OK: ${VAR} declared once (${result.declaredIn}, ${result.px}px) and read by ${result.consuming} stylesheet(s); no stale top / scroll-margin-top: 90px.`,
  );
}
