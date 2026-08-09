// Config e2e Playwright (smoke tests navigateur).
// Prérequis : `npm install -D @playwright/test && npx playwright install chromium`
// Lancement : `npm run test:e2e`. Construit puis sert le site statique, puis teste.
import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
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
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI
  }
});
