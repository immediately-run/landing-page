import { checkClones } from '@immediately-run/verify-checks/clones';

await checkClones({
  patterns: ['src/**/*.{ts,tsx,css}', 'scripts/**/*.{mjs,ts}'],
  ignore: ['**/*.test.*', '**/*.spec.*'],
  baselinePath: 'verify-baselines/clones.json',
});
