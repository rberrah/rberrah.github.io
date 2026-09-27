// @ts-nocheck
import { test, expect } from '@playwright/test';
import { getSiteOrigin } from '../../site.config.js';

const origin = process.env.PORTAL_E2E_URL || 'http://127.0.0.1:4181';
const publicOrigin = getSiteOrigin();

test.beforeEach(async ({ page }) => {
  // Browser tests must never send synthetic visits or data to external services.
  await page.route('**/*', route => new URL(route.request().url()).origin === origin
    ? route.continue() : route.abort());
});

test('Stats landing page is public, local-first and links to the analyser', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  const response = await page.goto(origin + '/stats/');
  expect(response.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('h1')).toContainText('Les statistiques sans boîte noire');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', publicOrigin + '/stats/');
  await expect(page.getByRole('link', { name: /Ouvrir l’outil/ })).toHaveAttribute('href', '/stats/tool/');
  await expect(page.locator('body')).toContainText('Aucun LLM ne choisit la méthode');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  expect(errors).toEqual([]);
});

test('Stats built-in demo runs Welch plus rank sensitivity analysis in the browser', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  const response = await page.goto(origin + '/stats/tool/');
  expect(response.status()).toBe(200);
  await expect(page.locator('#analysis-mode')).toHaveValue('compare2');

  await page.locator('#load-demo').click();
  await expect(page.locator('#mapping')).toBeVisible();
  await expect(page.locator('#parse-status')).toContainText('Données lues');
  await expect(page.locator('#col-group')).toHaveValue('group');
  await expect(page.locator('#col-value')).toHaveValue('value');

  await page.locator('#run-analysis').click();
  await expect(page.locator('#results .result-card')).toHaveCount(2);
  await expect(page.locator('#results')).toContainText('Welch t');
  await expect(page.locator('#results')).toContainText('Mann–Whitney');
  expect(await page.locator('#results .metric').count()).toBeGreaterThan(0);
  await expect(page.locator('#results .assumptions')).toBeVisible();
  await expect(page.locator('#results .privacy-note')).toContainText('Aucune donnée n’est envoyée à un serveur');
  expect(errors).toEqual([]);
});

test('Stats remains usable on mobile and the bilingual switch updates the interface', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin + '/stats/tool/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);

  await page.locator('[data-lang-toggle]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toContainText('Which test for your data?');
  await expect(page.locator('#load-demo')).toHaveText('Load demo');
});
