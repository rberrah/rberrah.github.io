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

  const thesis = page.getByTestId('thesis-research-program');
  await expect(thesis.getByRole('heading', { level: 2 })).toContainText('From biological knowledge');
  await expect(thesis.locator('.thesis-card')).toHaveCount(6);
  await expect(thesis.locator('[data-project="netpk"] a')).toHaveAttribute('href', 'https://rberrah.github.io/communications/netpk-peprsn-2026/');
  await expect(thesis.locator('[data-project="pillar-b"] a')).toHaveAttribute('href', 'https://rberrah.github.io/communications/autonomous-pharmacometrics-page-2026/');
  await expect(thesis.locator('[data-project="phenopass"] a')).toHaveCount(0);
  await expect(thesis.locator('[data-project="phenopass"]')).toContainText('unpublished results');
  await expect(thesis.locator('[data-project="pillar-c"] a, [data-project="pillar-d"] a')).toHaveCount(0);

  await page.locator('.language-toggle').getByRole('button', { name: 'FR', exact: true }).click();
  await expect(ecosystem.locator('summary')).toContainText('Écosystème');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Apprendre, analyser, puis intégrer');
  await expect(page.getByTestId('thesis-research-program').getByRole('heading', { level: 2 })).toContainText('De la connaissance');
  await expect(page.getByTestId('thesis-research-program').locator('[data-project="phenopass"]')).toContainText('résultats non publiés');
});
