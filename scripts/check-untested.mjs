// check:untested in coverage mode (docs/content/plans/untested-coverage).
//
// The name check asked whether a same-stem test file exists. This asks whether
// the lines this branch changed under the logic paths are executed by the test
// run, read from vitest's v8 coverage report.
//
// Both logic paths are instrumented: the vitest run loads src/lib/** through
// the component and lib tests, and scripts/** through the scripts' own sibling
// tests. `--coverage.include` is also what puts a file no test imports into
// the report, with zero hits, so its changed lines are findings rather than
// absent.
//
// The ratchet is verify-baselines/untested.json: one uncovered-executable-line
// count per logic file (verify-checks 0.10.0), seeded once with
// `--write-baseline` (which refuses to overwrite). A changed file whose count
// exceeds its entry is NEW; an entry whose count dropped is STALE, and the
// message names the number to write. It stores no line numbers, so an edit
// that only moves lines (an added import, a comment) changes nothing. The
// price is that lines inside one file can trade: a newly uncovered line passes
// when another line of the same file became covered in the same branch.
//
// A file coverage is the wrong instrument for is declared with an
// `Untested: <path> — <reason>` commit trailer.

import { execFileSync } from 'node:child_process';
import { checkUntestedCoverage } from '@immediately-run/verify-checks/untested';

const LOGIC_PATHS = ['src/lib/**', 'scripts/**'];

execFileSync(
  process.execPath,
  [
    'node_modules/.bin/vitest',
    'run',
    '--coverage',
    '--coverage.reporter=json',
    ...LOGIC_PATHS.map((glob) => `--coverage.include=${glob}`),
  ],
  { stdio: ['ignore', 'inherit', 'inherit'] },
);

checkUntestedCoverage({
  base: 'origin/main',
  logicPaths: { include: LOGIC_PATHS },
  coverageReportPath: 'coverage/coverage-final.json',
  baselinePath: 'verify-baselines/untested.json',
});
