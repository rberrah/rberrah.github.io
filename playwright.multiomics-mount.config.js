import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['multiomics-assembled-mount.spec.js'],
  timeout: 60_000,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:4183',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'node scripts/preview_assembled_multiomics.mjs 4183',
    url: 'http://127.0.0.1:4183/',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
