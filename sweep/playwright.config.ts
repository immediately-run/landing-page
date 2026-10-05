// Playwright config for the landing-page mobile route sweep (R3-747).
// Runs against `vite preview` on 127.0.0.1:4174.

import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
if (require.extensions) {
  require.extensions['.mdx'] = (module) => {
    module.exports = () => null;
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const defaultPort = Number(process.env.SWEEP_PORT || 4174);

export default defineConfig({
  testDir: __dirname,
  testMatch: /.*\.spec\.ts$/,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  timeout: 5 * 60_000,
  webServer: process.env.SWEEP_BASE_URL
    ? undefined
    : {
        command: `npx vite preview --host 127.0.0.1 --port ${defaultPort} --strictPort`,
        cwd: rootDir,
        url: `http://127.0.0.1:${defaultPort}/`,
        reuseExistingServer: !process.env.CI,
      },
  use: {
    baseURL: process.env.SWEEP_BASE_URL || `http://127.0.0.1:${defaultPort}`,
  },
});
