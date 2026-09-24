// @ts-nocheck
import { test, expect } from '@playwright/test';

test('multi-omics demo runs end-to-end with deterministic Reactome integration', async ({ page }) => {
  let reactomeCalls = 0;
  await page.route('https://reactome.org/AnalysisService/**', async (route) => {
    reactomeCalls += 1;
    const body = {
      summary: { token: 'TEST_TOKEN', type: 'OVERREPRESENTATION' },
      pathwaysFound: 2,
      identifiersNotFound: 0,
      pathways: [
        {
          stId: 'R-HSA-71291',
          name: 'Metabolism of amino acids and derivatives',
          species: 'Homo sapiens',
          entities: { found: 4, total: 120, pValue: 0.001, fdr: 0.01 },
          reactions: { found: 2, total: 40 }
        },
        {
          stId: 'R-HSA-168256',
          name: 'Immune System',
          species: 'Homo sapiens',
          entities: { found: 3, total: 900, pValue: 0.02, fdr: 0.08 },
          reactions: { found: 1, total: 300 }
        }
      ]
    };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body)
    });
  });

  await page.goto('/multiomics');
  await expect(page.getByTestId('multiomics-load-demo')).toBeVisible();
  await page.getByTestId('multiomics-load-demo').click();

  await expect(page.getByTestId('multiomics-results')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('multiomics-results')).toContainText('Computed multi-omics results');
  await expect(page.getByTestId('multiomics-results')).toContainText('difference-in-differences');
  await expect(page.getByTestId('multiomics-results')).toContainText('IDO1');
  await expect(page.getByTestId('multiomics-results')).toContainText('matched cross-omic pairs tested');
  await expect(page.getByTestId('multiomics-pathways')).toContainText('Metabolism of amino acids and derivatives');
  expect(reactomeCalls).toBeGreaterThanOrEqual(3);
});
