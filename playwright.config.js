// Config e2e Playwright (smoke tests navigateur).
// Prérequis : `npm install -D @playwright/test && npx playwright install chromium`
// Lancement : `npm run test:e2e`. Construit puis sert le site statique, puis teste.
import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const BASE_URL = process.env.LABS_E2E_URL || `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: '**/portal.spec.js', // Separate root/app mounts: playwright.portal.config.js.
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry'
  },
  // `PW_CHANNEL=msedge` réutilise le navigateur déjà installé sur la machine et évite
  // le téléchargement de ~150 Mo (`npx playwright install`). Sans cette variable, on
  // retombe sur le Chromium géré par Playwright — c'est ce que fait le CI.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: process.env.PW_CHANNEL || undefined }
    }
  ],
  webServer: process.env.LABS_E2E_URL ? undefined : {
    command: process.env.LABS_E2E_PREBUILT
      ? `node scripts/preview_portal.mjs ${PORT} --app-only`
      : `npm run build && node scripts/preview_portal.mjs ${PORT} --app-only`,
    url: BASE_URL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI
  }
});
