// @ts-nocheck
import { test, expect } from '@playwright/test';

test('multi-omics result summary uses plain-language study checks', async ({ page }) => {
  await page.route('https://reactome.org/AnalysisService/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        summary: { token: 'PLAIN_LANGUAGE_TEST', type: 'OVERREPRESENTATION' },
        pathwaysFound: 0,
        identifiersNotFound: 0,
        pathways: []
      })
    });
  });

  await page.goto('/multiomics/tool');
  await page.getByTestId('multiomics-load-demo').click();
  await expect(page.getByTestId('multiomics-results')).toBeVisible({ timeout: 20_000 });

  const readiness = page.getByTestId('multiomics-plain-readiness');
  await expect(readiness).toBeVisible({ timeout: 10_000 });
  await expect(readiness).toContainText('Vérification avant d’interpréter les résultats');
  await expect(readiness).toContainText('Chevauchement entre omiques');
  await expect(readiness).toContainText('Séries techniques');
  await expect(readiness).toContainText('Données manquantes et mesures à vérifier');
  await expect(readiness.getByText('À propos de la puissance statistique')).toBeVisible();

  await expect(page.getByText('Vérification des séries techniques')).toBeVisible();
  await expect(page.getByText('Audit des batches techniques')).toHaveCount(0);
});
