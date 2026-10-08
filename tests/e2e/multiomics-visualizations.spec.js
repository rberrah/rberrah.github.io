import { test, expect } from '@playwright/test';

test('multi-omics one-click demo exposes guided heatmap, pathway and map views', async ({ page }) => {
  await page.route('https://reactome.org/AnalysisService/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ summary: { token: 'FIG4_VISUAL_TEST' }, pathways: [], pathwaysFound: 0 })
    });
  });
  await page.goto('/multiomics/tool');

  await expect(page.getByTestId('multiomics-quick-start')).toBeVisible();
  await page.getByTestId('multiomics-quick-demo').click();
  await expect(page.getByTestId('multiomics-results')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('multiomics-visualizations')).toBeVisible();
  await expect(page.getByTestId('multiomics-heatmap')).toBeVisible();

  await page.locator('.figure-switcher button').nth(1).click();
  await expect(page.getByTestId('multiomics-metabologram')).toBeVisible();
  await page.getByTestId('multiomics-pathway-select').selectOption('glycolysis');
  await expect(page.getByTestId('multiomics-pathway-coverage')).toContainText(/Glycolyse|Glycolysis/);

  await page.locator('.figure-switcher button').nth(2).click();
  await expect(page.getByTestId('multiomics-central-carbon-map')).toBeVisible();
  await expect(page.getByTestId('multiomics-central-carbon-map')).toContainText(/13C/);
  await expect(page.getByTestId('multiomics-central-carbon-map')).toContainText('LDHA');
  await expect(page.getByTestId('multiomics-central-carbon-map')).toContainText('LDHB');

  await page.locator('.figure-switcher button').first().click();
  await expect(page.getByTestId('multiomics-heatmap')).toBeVisible();
});

test('expert raw-MS and external validation workflows are disclosed on request', async ({ page }) => {
  await page.goto('/multiomics/tool');
  const expert = page.getByTestId('advanced-workflows');
  await expect(expert).toBeVisible();
  await expect(expert).not.toHaveAttribute('open', '');
  await expert.locator('summary').click();
  await expect(expert).toHaveAttribute('open', '');
  await expect(expert).toContainText('mzML');
  await expect(page.getByTestId('raw-ms-manifest-template')).toHaveAttribute('href', /raw_ms_manifest[.]csv$/);
});
