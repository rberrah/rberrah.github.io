import { test, expect } from '@playwright/test';

test('TDM target guide searches aliases and preserves distinct source statuses', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  await expect(page.getByTestId('tdm-targets-guide')).toBeVisible();
  const search = page.getByTestId('tdm-target-search');
  const cards = page.getByTestId('tdm-target-card');

  await search.fill('mycophenolate');
  await expect(cards).toHaveCount(5);
  await search.fill('MPA');
  await expect(cards).toHaveCount(5);
  await search.fill('cardiaque');
  await expect(cards).toHaveCount(4);
  await page.getByTestId('tdm-target-drug').selectOption('mpa');
  await expect(cards).toHaveCount(2);
  await expect(page.getByText('≈50', { exact: true })).toBeVisible();
  await expect(page.getByText('>36', { exact: true })).toBeVisible();
  await expect(page.getByText('Étude / protocole')).toBeVisible();

  await search.fill('');
  await page.getByTestId('tdm-target-drug').selectOption('mpa');
  await page.getByTestId('tdm-target-indication').selectOption('kidney');
  await expect(cards).toHaveCount(1);
  await expect(page.getByText('30–60', { exact: true })).toBeVisible();
});

test('TDM target guide supports English and mobile search', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/pharmacometrie/cibles-tdm/?lang=en');
  await expect(page.getByTestId('tdm-targets-guide')).toBeVisible();
  await page.getByTestId('tdm-target-search').fill('everolimus');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(4);
  await expect(page.getByText('3–8', { exact: true })).toHaveCount(2);
  await expect(page.getByText('6–10', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Explore the separate MIPD model library/ })).toBeVisible();
});
