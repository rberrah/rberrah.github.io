// @ts-nocheck
import { test, expect } from '@playwright/test';

test('multi-omics upload area explains the minimum file structure to beginners', async ({ page }) => {
  await page.goto('/multiomics/tool');

  const guide = page.getByTestId('multiomics-file-guide');
  await expect(guide).toBeVisible();
  await expect(guide).toContainText('Que faut-il charger ?');
  await expect(guide).toContainText('1 tableau des échantillons + au moins 2 matrices omiques');
  await expect(guide).toContainText('deux couches différentes constituent déjà une analyse multi-omique');
  await expect(guide).toContainText('subject_id · sample_id · assay_id · omic');
  await expect(guide).toContainText('feature_id | RNA001 | RNA002');
  await expect(guide).toContainText('Comment les fichiers se relient');

  await page.locator('.language-toggle').getByRole('button', { name: 'EN', exact: true }).click();
  await expect(guide).toContainText('What do I need to upload?');
  await expect(guide).toContainText('1 sample sheet + at least 2 omics matrices');
});
