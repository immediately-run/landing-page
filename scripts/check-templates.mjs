// R3-515 — the template-record check, wired into `npm run verify` and CI.
//
// A `generate` record claims `https://github.com/<repo>/generate` works — but
// GitHub's generate flow exists ONLY for repos flagged `is_template: true`. A
// record pointing at a non-template repo ships a dead call to action (the
// release plan's A3 class): the page renders, the button 404s. `grove`, for
// one, is NOT a template — which is exactly why its record is `unavailable`.
//
// For every record with `start.kind === 'generate'`, fetch
// `https://api.github.com/repos/<repo>` and fail unless `is_template` is true.
// An unreachable API fails LOUDLY with the reason — never a silent skip, which
// would let a dead generate link through on a flaky network.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function main() {
  const src = readFileSync(join(root, 'src', 'data', 'templates.ts'), 'utf8');
  // The records are data-only TS; extract them without a TS runtime: take the
  // TEMPLATES array body and split it into per-record blocks on `slug: '…'`.
  // Deliberately narrow: a record whose shape drifts stops yielding entries
  // here, and a generate record this checker cannot SEE is the failure mode —
  // so an unparsable array fails rather than passing by absence.
  const arrayStart = src.indexOf('export const TEMPLATES');
  if (arrayStart === -1) {
    console.error('check-templates: FAIL — src/data/templates.ts declares no TEMPLATES array');
    process.exit(1);
  }
  const arrayBody = src.slice(arrayStart);
  const recordBlocks = arrayBody.split(/(?=\bslug:\s*')/).slice(1);
  if (recordBlocks.length === 0) {
    console.error('check-templates: FAIL — no records found in the TEMPLATES array (parser drift?)');
    process.exit(1);
  }
  const repos = [];
  for (const block of recordBlocks) {
    const repo = /\brepo:\s*'([^']+)'/.exec(block)?.[1];
    if (!repo) {
      console.error('check-templates: FAIL — a record is missing its `repo` field');
      process.exit(1);
    }
    if (block.includes("kind: 'generate'")) repos.push(repo);
  }
  if (repos.length === 0) {
    console.log('check-templates: no generate records — nothing to verify.');
    return;
  }

  let failed = false;
  for (const repo of repos) {
    const url = `https://api.github.com/repos/${repo}`;
    let answer;
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/vnd.github+json' },
        // A UA is required by the GitHub API; identify honestly.
        'user-agent': 'immediately-run-landing-check-templates',
      });
      if (!res.ok) {
        console.error(`check-templates: FAIL — GitHub answered ${res.status} for ${url}`);
        failed = true;
        continue;
      }
      answer = await res.json();
    } catch (err) {
      console.error(`check-templates: FAIL — could not reach ${url}: ${err?.message ?? err}`);
      failed = true;
      continue;
    }
    if (answer.is_template !== true) {
      console.error(
        `check-templates: FAIL — ${repo} is not flagged is_template on GitHub, so its /generate link is dead. Set the record's start to 'unavailable' until the repo is a template.`,
      );
      failed = true;
      continue;
    }
    console.log(`check-templates: ok — ${repo} is_template: true`);
  }
  if (failed) process.exit(1);
}

main();
