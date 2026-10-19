import { test, expect } from '@playwright/test';

test('PMx ecosystem presents the shared Learn Analyze Integrate journey', async ({ page }) => {
  await page.goto('/pharmacometrie/ecosystem/?lang=en');

  await expect(page.getByTestId('ecosystem-page')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Learn, analyze, then integrate');
  await expect(page.locator('img[src*="ecosystem-graphical-abstract.svg"]')).toBeVisible();

  const ecosystem = page.getByTestId('goal-connections');
  await expect(ecosystem.locator('summary')).toContainText('Ecosystem');
  await ecosystem.locator('summary').click();
  await expect(page.getByTestId('nav-ecosystem')).toBeVisible();
  await expect(page.getByTestId('nav-multiomics')).toHaveAttribute('href', 'https://rberrah.github.io/multiomics/');
  await expect(page.getByTestId('nav-omics2pk')).toHaveAttribute('href', 'https://rberrah.github.io/Omics2PK/');

  await page.locator('.language-toggle').getByRole('button', { name: 'FR', exact: true }).click();
  await expect(ecosystem.locator('summary')).toContainText('Écosystème');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Apprendre, analyser, puis intégrer');
});
