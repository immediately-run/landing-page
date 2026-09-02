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
//
// The records are read from `src/data/templates.json`, the same file the site
// imports. This script used to split `templates.ts` on `slug:` and grep each
// block for `repo:`; a regex over a source file is not a parser, and the record
// it fails to see is the one that ships broken.
//
// The pure pieces are exported so they can be tested without a network: see
// scripts/check-templates.test.ts.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

/** The records file — the one the site imports, not a copy. */
export const RECORDS_PATH = join(HERE, '..', 'src', 'data', 'templates.json');

/** The env var carrying a GitHub token. Anonymous calls to api.github.com are
 *  rate-limited per IP, which on a shared CI runner is a coin flip. */
export const TOKEN_VAR = 'GITHUB_TOKEN';

const USER_AGENT = 'immediately-run-landing-check-templates';

/** Read the template records. */
export function readRecords(path = RECORDS_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** The repos whose records CLAIM a working GitHub generate flow — the only ones
 *  worth an API call. Throws on a record with no `repo`: a record this checker
 *  cannot read is the failure mode it exists to prevent, so it fails rather
 *  than passing by absence. */
export function generateRepos(records) {
  if (!Array.isArray(records)) {
    throw new Error('check-templates: the records file does not contain an array');
  }
  const repos = [];
  for (const record of records) {
    if (!record || typeof record.repo !== 'string' || record.repo === '') {
      throw new Error(
        `check-templates: a record (slug '${record?.slug ?? '?'}') is missing its 'repo' field`,
      );
    }
    if (record.start?.kind === 'generate') repos.push(record.repo);
  }
  return repos;
}

/** The API URL for a repo. */
export const repoApiUrl = (repo) => `https://api.github.com/repos/${repo}`;

/**
 * Ask GitHub whether one repo is flagged as a template.
 *
 * Returns `{ repo, ok, message }` — never throws and never resolves an
 * unreachable API into a pass. `fetchImpl` and `env` are parameters so the cases
 * can be exercised without a network or a token.
 */
export async function verifyTemplate(repo, fetchImpl = fetch, env = process.env) {
  const url = repoApiUrl(repo);
  const token = env[TOKEN_VAR];
  const headers = {
    Accept: 'application/vnd.github+json',
    // A UA is required by the GitHub API; identify honestly. It belongs in the
    // HEADERS — as a top-level fetch option it was silently never sent.
    'User-Agent': USER_AGENT,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const tokenNote = token
    ? ''
    : ` (no ${TOKEN_VAR} set — anonymous requests to the GitHub API are rate-limited)`;

  let answer;
  try {
    const res = await fetchImpl(url, { headers });
    if (!res.ok) {
      return { repo, ok: false, message: `GitHub answered ${res.status} for ${url}${tokenNote}` };
    }
    answer = await res.json();
  } catch (err) {
    return {
      repo,
      ok: false,
      message: `could not reach ${url}: ${err?.message ?? err}${tokenNote}`,
    };
  }
  if (answer?.is_template !== true) {
    return {
      repo,
      ok: false,
      message: `${repo} is not flagged is_template on GitHub, so its /generate link is dead. Set the record's start to 'unavailable' until the repo is a template.`,
    };
  }
  return { repo, ok: true, message: `${repo} is_template: true` };
}

async function main() {
  const repos = generateRepos(readRecords());
  if (repos.length === 0) {
    console.log('check-templates: no generate records — nothing to verify.');
    return;
  }
  let failed = false;
  for (const repo of repos) {
    const result = await verifyTemplate(repo);
    if (result.ok) console.log(`check-templates: ok — ${result.message}`);
    else {
      console.error(`check-templates: FAIL — ${result.message}`);
      failed = true;
    }
  }
  if (failed) process.exitCode = 1;
}

// Only when run as the script; importing it for the tests must not fetch.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
