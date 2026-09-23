// Shared CSS-source reading for the stylesheet checkers. Each checker owns its rule;
// this owns walking `src/**/*.css`, stripping comments, and flattening rules, so the
// second stylesheet checker imports the parser instead of retyping it.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** CSS comments are prose, not rules. */
export const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, ' ');

/** Flat `[selector, declarations]` rules. A block nested in `@media` matches as its own
 *  rule; the wrapper's braces do not nest in this repo's stylesheets. */
export function cssRules(text) {
  return [...stripComments(text).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [
    m[1].trim().replace(/\s+/g, ' '),
    m[2],
  ]);
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
