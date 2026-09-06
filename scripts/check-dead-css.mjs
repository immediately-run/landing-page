import { checkDeadCss } from '@immediately-run/verify-checks/dead-css';

await checkDeadCss({
  cssGlobs: ['src/**/*.css'],
  sourceGlobs: ['src/**/*.{ts,tsx,html,mdx}'],
  baselinePath: 'verify-baselines/dead-css.json',
});
