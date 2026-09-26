import { test, expect } from '@playwright/test';

test('paired MAP/ML benchmark switches sampling design and remains readable', async ({ page }) => {
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const failedRequests = [];
  page.on('pageerror', (error) => errors.push(error.stack || error.message));
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}`));
  await page.goto('/ml/');
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
  expect(failedRequests).toEqual([]);
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Library results' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'C0 + C1', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('table caption')).toHaveText('AUC24 estimation on the untouched test set');
  await expect(page.getByRole('columnheader', { name: 'AUC ±20 %', exact: true })).toBeVisible();
  await page.getByLabel('Model', { exact: true }).fill('Woillard');
  const twoPoint = await page.locator('tbody').innerText();
  await page.getByRole('button', { name: 'C0 alone', exact: true }).click();
  await expect(page.getByRole('button', { name: 'C0 alone', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('tbody')).not.toHaveText(twoPoint);
  await expect(page.locator('tbody')).toContainText('MAP-BE');
  await expect(page.locator('tbody')).toContainText('XGBoost');
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.getByRole('heading', { name: 'Library results' }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/ml-benchmark-${viewport.width}.png` });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('button', { name: 'FR', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Résultats de la bibliothèque' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'C0 seul', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
