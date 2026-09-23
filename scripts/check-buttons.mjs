// R3-749 — the pill buttons have one home: `.btn-primary` / `.btn-secondary` in App.css.
//
// Why a script and not a unit test: vitest returns an empty string for `.css` imports, so a
// component test cannot see a stylesheet, and the copies this ends are stylesheet rules —
// eight gradient primaries and four hairline secondaries, each hand-typed in its own
// section, one of which (`.new-start`) forgot the radius and shipped a square gradient slab.
// Nothing in the build compares a section's rule against the shared class; this does, the
// way `check:nav-token` and `check:dead-css` already read CSS from `verify`.
//
// The decision is `checkButtons`, a pure function over `[name, text]` pairs; `main` supplies
// the real `src/` tree — see `check-buttons.test.mjs`.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** The stylesheet that owns the shared classes. */
export const HOME = 'App.css';

/** Rules that legitimately carry pill vocabulary without being pill CTAs. Each entry is a
 *  rule the two checks below would otherwise flag, with the reason it is not a copy:
 *  gradient-as-STATE fills (a pressed toggle, a badge, a gradient border) and pill-shaped
 *  chips/containers (a badge's anatomy, not a button's). An entry that stops matching a
 *  real rule is stale and fails the run — the list cannot outlive its reasons. */
export const ALLOWLIST = [
  { file: 'apps.css', selector: ".apps-pill[aria-pressed='true']", rule: 'gradient', reason: 'selected-state fill of the sort/view toggle — a state, not a primary CTA' },
  { file: 'apps.css', selector: ".apps-sheet-chip[aria-pressed='true']", rule: 'gradient', reason: 'selected-state fill of the mobile filter chips — a state, not a primary CTA' },
  { file: 'changelog.css', selector: '.cl-badge--feat', rule: 'gradient', reason: 'entry-kind badge fill — a badge, not a button' },
  { file: 'tutorials.css', selector: '.tut-deep-pill', rule: 'gradient', reason: 'gradient BORDER via the double background-image trick — a border, not a fill' },
  { file: 'apps.css', selector: '.apps-pillgroup', rule: 'hairline', reason: 'container frame of the segmented toggle group, not a button' },
  { file: 'apps.css', selector: '.apps-prov', rule: 'hairline', reason: 'provenance chip — a badge, not a button' },
  { file: 'apps.css', selector: '.apps-tag-chip', rule: 'hairline', reason: 'capability tag chip — a badge, not a button' },
  { file: 'apps.css', selector: '.apps-sheet-chip', rule: 'hairline', reason: 'mobile filter chip (toggle); its pressed state is the allowlisted gradient rule' },
  { file: 'apps.css', selector: '.apps-sheet-close', rule: 'hairline', reason: 'fixed 44px icon close control — a square target, not a label pill' },
  { file: 'docs.css', selector: '.docs-cap-chip', rule: 'hairline', reason: 'capability chip on the API block — a badge, not a button' },
  { file: 'tutorials.css', selector: '.tut-pill', rule: 'hairline', reason: 'difficulty/category chip — a badge, not a button' },
];

/** CSS comments are prose, not rules (the `check-nav-token` precedent). */
const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, ' ');

/** Flat `[selector, declarations]` rules. A block nested in `@media` matches as its own
 *  rule (the wrapper's braces do not nest in this repo's stylesheets, and the media context
 *  is irrelevant to these two rules — a copy is a copy at any width). */
export function cssRules(text) {
  return [...stripComments(text).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [
    m[1].trim().replace(/\s+/g, ' '),
    m[2],
  ]);
}

// `background-image` is included because the gradient fill can be spelled either way; a
// copy that switches properties is still a copy.
const setsGradientFill = (decls) => /background(?:-image)?\s*:[^;]*var\(--grad-btn\)/.test(decls);
const isHairlinePill = (decls) =>
  /border-radius\s*:[^;]*var\(--r-pill\)/.test(decls) && /border[^:;]*:[^;]*var\(--line-2\)/.test(decls);

const allowlisted = (file, selector, rule) =>
  ALLOWLIST.some((e) => e.file === file && e.selector === selector && e.rule === rule);

/**
 * The rules, over `[basename, text]` pairs. Returns every failure rather than the first.
 *
 * 1. No rule outside App.css sets `background: var(--grad-btn)` on a selector that is not
 *    `.btn-primary` — one gradient primary, one home (FRONT_DOOR_IA §1.1's per-view rule
 *    starts at the class level).
 * 2. No rule outside App.css sets `border-radius: var(--r-pill)` together with a `--line-2`
 *    border — that pair IS the hairline secondary's anatomy; a second spelling is a copy.
 */
export function checkButtons(files) {
  const errors = [];

  const home = files.find(([name]) => name === HOME);
  if (!home) {
    errors.push(`no ${HOME} in the tree — the shared pill classes have no home to be copies of.`);
  } else {
    const homeSelectors = cssRules(home[1]).map(([selector]) => selector);
    for (const cls of ['.btn-primary', '.btn-secondary']) {
      if (!homeSelectors.some((selector) => selector.includes(cls))) {
        errors.push(`${HOME} does not define ${cls} — the shared class the sections must use is missing.`);
      }
    }
  }

  for (const [name, text] of files) {
    if (name === HOME) continue;
    for (const [selector, decls] of cssRules(text)) {
      if (setsGradientFill(decls) && !selector.includes('.btn-primary') && !allowlisted(name, selector, 'gradient')) {
        errors.push(
          `${name}: ${selector} sets the gradient button fill — .btn-primary in ${HOME} is the one gradient primary; allowlist it with a reason only if it is a state/badge, not a CTA.`,
        );
      }
      if (isHairlinePill(decls) && !allowlisted(name, selector, 'hairline')) {
        errors.push(
          `${name}: ${selector} draws the hairline pill (r-pill + --line-2 border) — .btn-secondary in ${HOME} is the one hairline secondary; allowlist it with a reason only if it is a chip/container, not a button.`,
        );
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

/** Allowlist entries that no longer match a rule in `files` — a stale reason is a lie the
 *  next reader trusts, so the run fails on it (R7 for allowlists). */
export function staleAllowlistEntries(files) {
  const rules = new Map(files.map(([name, text]) => [name, cssRules(text).map(([selector]) => selector)]));
  return ALLOWLIST.filter((e) => !(rules.get(e.file) ?? []).includes(e.selector));
}

/** Every stylesheet under `dir`, as `[basename, text]` (the `check-nav-token` shape). */
export function cssFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) cssFiles(full, out);
    else if (entry.name.endsWith('.css')) out.push([entry.name, readFileSync(full, 'utf8')]);
  }
  return out;
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith('check-buttons.mjs');
if (invokedDirectly) {
  const files = cssFiles('src');
  const result = checkButtons(files);
  const stale = staleAllowlistEntries(files);
  for (const e of stale) {
    console.error(`✗ check:buttons — ALLOWLIST entry ${e.file} ${e.selector} (${e.rule}) matches no rule — remove it or fix the selector.`);
  }
  if (!result.ok || stale.length) {
    for (const e of result.errors) console.error(`✗ check:buttons — ${e}`);
    process.exit(1);
  }
  console.log(
    `OK: the pill buttons have one home (${HOME}: .btn-primary / .btn-secondary); no unallowlisted gradient-primary or hairline-secondary copies in ${files.length} stylesheet(s).`,
  );
}
