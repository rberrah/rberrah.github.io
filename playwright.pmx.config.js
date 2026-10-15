import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const BASE_URL = process.env.LABS_E2E_URL || `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: [
    '**/portal.spec.js',
    '**/stats-*.spec.js',
    '**/multiomics*.spec.js',
    '**/cross-domain-omics-pkpd.spec.js'
  ],
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  // PMx tests can exercise model or patient-shaped inputs; never persist them in traces.
  use: { baseURL: BASE_URL, trace: 'off' },
  projects: [{
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], channel: process.env.PW_CHANNEL || undefined }
  }],
  webServer: process.env.LABS_E2E_URL ? undefined : {
    command: process.env.LABS_E2E_PREBUILT
      ? `node scripts/preview_portal.mjs ${PORT} --app-only`
      : `npm run build && node scripts/preview_portal.mjs ${PORT} --app-only`,
    url: BASE_URL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI
  }
});
