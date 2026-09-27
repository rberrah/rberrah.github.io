// @ts-nocheck
import { test, expect } from '@playwright/test';

test('multi-omics pre-run gate explains readiness in licence-level language', async ({ page }) => {
  await page.goto('/multiomics/tool');

  const readiness = page.getByTestId('multiomics-run-readiness');
  await expect(readiness).toBeVisible();
  await expect(readiness).toContainText('L’analyse est-elle prête ?');
  await expect(readiness).toContainText('À compléter');
  await expect(readiness).toContainText('deux couches suffisent pour une analyse multi-omique');
  await expect(readiness).toContainText('tableau des échantillons');

  await page.getByTestId('multiomics-load-demo').click();
  await expect(page.getByTestId('multiomics-results')).toBeVisible({ timeout: 20_000 });
  await expect(readiness).toContainText('Prêt à analyser');
  await expect(readiness).toContainText('Tous les contrôles structurels obligatoires sont passés');
});
