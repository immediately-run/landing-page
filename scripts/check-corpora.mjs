#!/usr/bin/env node
// The frontmatter checker, and the reason it shipped in the same change as the conversion.
//
// Moving `data.ts` to MDX trades the compiler for nothing unless something replaces it.
// `DocPage`/`Tutorial` were interfaces: a wrong field was a red build in two seconds. MDX
// frontmatter is open by design (PLATFORM_LAYERING §3 — the platform types the ENVELOPE and
// never the meaning of corpus keys), and `useMetadataQuery<T>` is a cast, not a check. So an
// agent that writes `catgory:` gets a silently missing card, not an error. That regression
// is not acceptable for a repo this many agents will edit, which is why this is in scope for
// the first move rather than a follow-up.
//
// Each corpus declares its own schema in its `immediately.run.json` marker — the file that
// already travels with the directory. Nothing here is Grove- or docs-specific: the checker
// reads whatever the marker declares, so a third corpus with a different vocabulary needs no
// change to this script.
//
// It also EMITS `src/data/corpusIndex.ts`. One source of truth (the MDX frontmatter), one
// generated artifact, and the generator is the validator — so the index cannot drift from
// what was checked. `npm run verify` runs it and then `git diff --exit-code`s the output, the
// same shape site-main uses for its generated config schema.

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
// The SAME id function `remarkHeadingAnchors` uses, from the same package. A TOC built with
// a second implementation is a TOC whose links 404 the moment the two drift, and they drift
// silently — nothing renders differently, the anchors just stop landing.
import { headingId } from '@immediately-run/mdx-plugins';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const MARKER = 'immediately.run.json';

/** The declared corpus table (`immediately.run.content`) — the same field the host reads. */
function declaredCorpora() {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const raw = pkg['immediately.run']?.content;
  if (raw === undefined) return [];
  return (Array.isArray(raw) ? raw : [raw]).map((d) => String(d).replace(/^\.\//, '').replace(/\/+$/, ''));
}

/** Minimal, dependency-free YAML frontmatter reader. Deliberately narrow: it handles the
 *  scalar/list forms this repo's corpora use and REFUSES anything else rather than guessing,
 *  because a checker that quietly mis-parses is worse than no checker. */
function parseFrontmatter(src, file) {
  if (!src.startsWith('---\n')) return { error: 'no frontmatter block' };
  const end = src.indexOf('\n---', 3);
  if (end === -1) return { error: 'unterminated frontmatter block' };
  const data = {};
  for (const line of src.slice(4, end).split('\n')) {
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue;
    const m = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!m) return { error: `cannot parse frontmatter line: ${line.trim()}` };
    const [, key, rawValue] = m;
    const value = rawValue.trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim();
      data[key] = inner === '' ? [] : inner.split(',').map((v) => unquote(v.trim()));
    } else if (value === 'true' || value === 'false') {
      data[key] = value === 'true';
    } else if (/^-?\d+(\.\d+)?$/.test(value)) {
      data[key] = Number(value);
    } else {
      data[key] = unquote(value);
    }
  }
  void file;
  return { data };
}

const unquote = (v) =>
  (v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))
    ? JSON.parse(v.startsWith("'") ? `"${v.slice(1, -1).replace(/"/g, '\\"')}"` : v)
    : v;

/** Check one value against a declared type string (`string`, `number`, `string[]`,
 *  `boolean`, `enum:a|b|c`). Returns an error string, or null when it conforms. */
function typeError(value, type) {
  if (type.startsWith('enum:')) {
    const allowed = type.slice(5).split('|');
    return allowed.includes(value) ? null : `expected one of ${allowed.join(' | ')}, got ${JSON.stringify(value)}`;
  }
  switch (type) {
    case 'string':
      return typeof value === 'string' && value !== '' ? null : `expected a non-empty string, got ${JSON.stringify(value)}`;
    case 'number':
      return typeof value === 'number' && Number.isFinite(value) ? null : `expected a number, got ${JSON.stringify(value)}`;
    case 'boolean':
      return typeof value === 'boolean' ? null : `expected a boolean, got ${JSON.stringify(value)}`;
    case 'string[]':
      return Array.isArray(value) && value.every((v) => typeof v === 'string')
        ? null
        : `expected a list of strings, got ${JSON.stringify(value)}`;
    default:
      return `the marker declares an unknown type "${type}" for this key`;
  }
}

/** The `##`/`###` headings of an entry, with the ids `remarkHeadingAnchors` will give them.
 *  Fenced code is skipped so a `# comment` inside a snippet never becomes a TOC entry. */
function headingsOf(src) {
  const out = [];
  let inFence = false;
  for (const line of src.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = line.match(/^(#{2,3})\s+(.*?)\s*$/);
    if (m) out.push({ depth: m[1].length, text: m[2], id: headingId(m[2]) });
  }
  return out;
}

/** The lines of an entry that are PROSE: outside fenced code, not part of a JSX block, and
 *  not inside an inline-code span. Everything else is allowed to contain braces. */
function proseLines(src) {
  const out = [];
  let inFence = false;
  let jsxDepth = 0;
  const lines = src.split('\n');
  const fmEnd = src.startsWith('---\n') ? lines.indexOf('---', 1) : -1;
  for (let i = fmEnd + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    // A JSX block opens on a line starting with `<` and closes when its tags balance.
    if (jsxDepth === 0 && /^\s*<[A-Za-z/]/.test(line)) jsxDepth = 1;
    if (jsxDepth > 0) {
      if (/\/>\s*$/.test(line) || /^\s*<\/[A-Za-z]/.test(line) || /^\s*\/>/.test(line)) jsxDepth = 0;
      continue;
    }
    // Strip inline-code spans: a brace inside backticks is already safe.
    const stripped = line.replace(/`[^`]*`/g, '');
    if (stripped.trim() === '') continue;
    out.push({ line: stripped, n: i + 1 });
  }
  return out;
}

const errors = [];
const index = [];

for (const dir of declaredCorpora()) {
  const abs = join(root, dir);
  const markerPath = join(abs, MARKER);
  if (!existsSync(markerPath)) {
    errors.push(`${dir}/ — declared in immediately.run.content but has no ${MARKER}. A declared dir that carries no marker is not a corpus; the host will not open it.`);
    continue;
  }
  const marker = JSON.parse(readFileSync(markerPath, 'utf8'));
  const schema = marker.frontmatter ?? { required: {}, optional: {}, passThrough: true };
  const required = schema.required ?? {};
  const optional = schema.optional ?? {};

  const entries = readdirSync(abs).filter((f) => f.endsWith('.mdx')).sort();
  if (entries.length === 0) errors.push(`${dir}/ — a corpus with no entries.`);

  for (const file of entries) {
    const rel = `${dir}/${file}`;
    const src = readFileSync(join(abs, file), 'utf8');
    const parsed = parseFrontmatter(src, rel);
    if (parsed.error) {
      errors.push(`${rel} — ${parsed.error}`);
      continue;
    }
    const { data } = parsed;
    for (const [key, type] of Object.entries(required)) {
      if (!(key in data)) {
        errors.push(`${rel} — missing required frontmatter key "${key}" (${type}).`);
        continue;
      }
      const err = typeError(data[key], type);
      if (err) errors.push(`${rel} — "${key}": ${err}`);
    }
    for (const [key, type] of Object.entries(optional)) {
      if (key in data) {
        const err = typeError(data[key], type);
        if (err) errors.push(`${rel} — "${key}": ${err}`);
      }
    }
    if (schema.passThrough === false) {
      for (const key of Object.keys(data)) {
        if (!(key in required) && !(key in optional)) {
          // The typo case this whole script exists for. A closed vocabulary is what turns
          // `catgory:` from a blank card into a build failure.
          errors.push(`${rel} — unknown frontmatter key "${key}". This corpus declares a CLOSED vocabulary (passThrough: false); add it to the marker's schema or fix the spelling.`);
        }
      }
    }
    // The MDX gotcha this conversion hit: a bare `{` in PROSE is read as a JSX expression,
    // and the failure is a micromark stack trace naming no line. Catching it here turns
    // "Unexpected content after expression" into a file, a line, and the fix.
    for (const { line, n } of proseLines(src)) {
      if (/[{}]/.test(line)) {
        errors.push(
          `${rel}:${n} — a literal brace in prose: ${line.trim().slice(0, 80)}\n` +
            `      MDX reads \`{\` as a JSX expression. Wrap the span in backticks (usually right — ` +
            `braces in prose are almost always code), or escape it as \\{.`,
        );
      }
    }
    index.push({
      path: rel,
      slug: file.replace(/\.mdx$/, ''),
      frontmatter: data,
      headings: headingsOf(src),
    });
  }
}

if (errors.length) {
  console.error(`FAIL corpus frontmatter (${errors.length}):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

// The generated index + the entry component map.
//
// The corpora live in the app's OWN repo, so their MDX is compiled as app source in every
// mode: by `@mdx-js/rollup` under `vite dev`/`build`, and by the sandbox's app-root MDX
// pipeline on immediately.run (where R3-150 pre-transpiles `.mdx` into the cache zip, so it
// costs nothing at boot). That is why the entries are STATIC imports here rather than
// runtime `<Include>` lookups: static imports work identically in both, need no host, and
// need no `import.meta.glob` — which is forbidden outright, since Vite would inline it but
// immediately.run transpiles to CommonJS where `import.meta` is a PARSE-time SyntaxError.
const importLines = index
  .map((e, i) => `import Entry${i} from '../../${e.path}';`)
  .join('\n');
const mapLines = index.map((e, i) => `  ${JSON.stringify(e.path)}: Entry${i},`).join('\n');

const generated = `// GENERATED by scripts/check-corpora.mjs — do not edit.
//
// The frontmatter of every entry in every declared corpus, validated against the schema its
// corpus marker declares, plus the compiled MDX component for each. One authored source (the
// MDX file), one generated artifact, and the generator IS the validator — so the index can
// never describe an entry the checker did not pass.

import type { ComponentType } from 'react';
${importLines}

export interface CorpusHeading {
  /** 2 or 3 — the markdown level. */
  depth: number;
  text: string;
  /** The id remarkHeadingAnchors renders, computed by the SAME headingId(). */
  id: string;
}

export interface CorpusEntry {
  /** Repo-relative path of the entry. */
  path: string;
  /** Filename without the extension — the URL segment. */
  slug: string;
  frontmatter: Record<string, string | number | boolean | string[]>;
  /** The entry's headings, for a table of contents and step navigation. */
  headings: CorpusHeading[];
}

export const CORPUS_INDEX: CorpusEntry[] = ${JSON.stringify(index, null, 2)};

/** Path → the compiled MDX component. Rendered inside an <MDXProvider>-style component map
 *  so the corpus's custom components (<Callout/>, <ApiSignature/>, …) resolve. */
export const CORPUS_ENTRIES: Record<string, ComponentType<Record<string, unknown>>> = {
${mapLines}
};

/** The entries of one corpus, in declared \`order\`. */
export function corpusEntries(dir: string): CorpusEntry[] {
  return CORPUS_INDEX.filter((e) => e.path.startsWith(\`\${dir}/\`)).sort(
    (a, b) => Number(a.frontmatter.order ?? 0) - Number(b.frontmatter.order ?? 0),
  );
}
`;
writeFileSync(join(root, 'src/data/corpusIndex.ts'), generated);

const byCorpus = {};
for (const e of index) {
  const dir = e.path.slice(0, e.path.indexOf('/'));
  byCorpus[dir] = (byCorpus[dir] ?? 0) + 1;
}
console.log(
  `OK corpora: ${Object.entries(byCorpus).map(([d, n]) => `${d}/ (${n} entries)`).join(', ')} — ` +
    `frontmatter conformant; wrote ${relative(root, join(root, 'src/data/corpusIndex.ts'))}`,
);
