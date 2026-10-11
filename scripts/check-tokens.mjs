import { checkTokens } from '@immediately-run/verify-checks/tokens';

// Every var() resolves to a declared token; raw colours live in the baseline
// (shrink-only). `allow` stays empty.
await checkTokens({
  cssGlobs: ['src/**/*.css'],
  sourceGlobs: ['src/**/*.{ts,tsx}'],
  allow: {},
  baselinePath: 'verify-baselines/tokens.json',
});
