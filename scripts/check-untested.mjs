// check:untested — coverage mode for src/lib/**, name mode for scripts/**
// (R3-580; docs/content/plans/untested-coverage).
//
// Coverage mode asks "are this diff's changed lines EXECUTED by the test
// run?" — the #59 discrimination — against vitest's v8 coverage report. The
// run instruments exactly the coverage-gated paths (--coverage.include), with
// all:true so a never-imported logic file still appears (with zero hits)
// rather than falling to the report-absent whole-file rule.
//
// scripts/** keeps the NAME check: vitest cannot instrument repo scripts
// (they are not part of the app test run), and most are self-testing via
// their own --self-test legs (plan Q5's legitimate trailer shape). Recorded
// here as this repo's per-path exemption, per the plan's hand-off.
//
// The ratchet lives in verify-baselines/untested.json (seeded once with
// --write-baseline, shrunk by hand as gaps close — never regenerated). The
// `Untested: <path> — <reason>` trailer remains the escape, its reason saying
// why COVERAGE is the wrong instrument for the file.

import { execFileSync } from 'node:child_process';
import { checkUntested, checkUntestedCoverage } from '@immediately-run/verify-checks/untested';

execFileSync(
  process.execPath,
  [
    'node_modules/.bin/vitest',
    'run',
    '--coverage',
    '--coverage.reporter=json',
    '--coverage.all=true',
    '--coverage.include=src/lib/**',
  ],
  { stdio: ['ignore', 'inherit', 'inherit'] },
);

await checkUntestedCoverage({
  base: 'origin/main',
  logicPaths: { include: ['src/lib/**'] },
  coverageReportPath: 'coverage/coverage-final.json',
  baselinePath: 'verify-baselines/untested.json',
});

await checkUntested({
  base: 'origin/main',
  logicPaths: { include: ['scripts/**'] },
});
