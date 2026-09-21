import { defineConfig, devices } from '@playwright/test';

// Build first with BASE_PATH=/pharmacometrie; the root portal and application
// have different mounts from the standalone application's browser tests.
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'portal.spec.js',
  timeout: 30_000,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: { ...devices['Desktop Chrome'], trace: 'on-first-retry' },
  webServer: process.env.PORTAL_E2E_URL ? undefined : {
    command: 'node scripts/preview_portal.mjs 4181',
    url: 'http://127.0.0.1:4181',
    reuseExistingServer: !process.env.CI
  }
});
