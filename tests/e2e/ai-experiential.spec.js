// @ts-nocheck
import { test, expect } from '@playwright/test';

test('token attention is localized, interactive and causally masked', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/chapitres/ai-llm/?lang=fr');

  const lab = page.getByTestId('token-attention-lab');
  await expect(lab).toBeVisible();
  await expect(lab.getByRole('combobox').locator('option').first()).toHaveText('Relation simulée');
  await expect(lab.getByRole('button', { name: 'ajustée' })).toBeVisible();
  await lab.getByRole('button', { name: 'selon' }).click();
  for (const index of [3, 4, 5]) await expect(lab.locator('.row').nth(index).locator('strong')).toHaveText('0%');
  await lab.getByRole('combobox').selectOption('local');
  await expect(lab).toContainText('masque causal');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('neural illustration exposes its training domain and extrapolation warning', async ({ page }) => {
  await page.goto('/chapitres/neural-ode/?lang=en');
  const lab = page.getByTestId('neural-box-lab').first();
  await expect(lab).toBeVisible();
  await lab.getByRole('button', { name: /Black box/ }).click();
  await lab.locator('input[type="range"]').fill('20');
  await expect(lab).toContainText('Outside the illustrated training domain');
  await expect(lab).toContainText('arbitrary drift');
});

test('AI method laboratories respond without claiming fitted clinical results', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/chapitres/ai-svm/?lang=en');
  const svm = page.getByTestId('svm-margin-lab').first();
  await expect(svm).toBeVisible();
  await svm.locator('input[type="range"]').last().fill('1.6');

  await page.goto('/chapitres/ai-featselect/?lang=en');
  const importance = page.getByTestId('variable-importance-lab').first();
  await importance.getByRole('checkbox').check();
  await importance.getByRole('button', { name: 'Repeat synthetic fit' }).click();
  await expect(importance).toContainText('constructed importances');

  await page.goto('/chapitres/ai-clustering/?lang=en');
  await expect(page.locator('.prose').first()).toContainText('Once a population model is estimated');
  const cluster = page.getByTestId('cluster-pca-lab').first();
  await cluster.getByRole('button', { name: /k-means/ }).click();
  await cluster.getByRole('checkbox').uncheck();
  await expect(cluster).toContainText('dominates Euclidean distance');
  await page.getByTestId('scrollytelling-step').filter({ hasText: 'Signal or noise? (RMT)' }).scrollIntoViewIfNeeded();
  const rmt = page.getByTestId('rmt-lab');
  await expect(rmt).toBeVisible();
  await rmt.getByRole('button', { name: 'Draw another sample' }).click();
  await expect(rmt).toContainText('does not prove causality');
});
