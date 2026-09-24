// @ts-nocheck
import { test, expect } from '@playwright/test';

test('multi-omics presentation page links to the dedicated analysis tool', async ({ page }) => {
  await page.goto('/multiomics');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/multi|omique|omics/i);
  const toolLink = page.getByRole('link', { name: /Ouvrir l’outil|Open the tool/i });
  await expect(toolLink).toBeVisible();
  await expect(toolLink).toHaveAttribute('href', /\/multiomics\/tool$/);
});

test('multi-omics presentation and tool switch to English', async ({ page }) => {
  await page.goto('/multiomics?lang=en');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Integrate multiple omics');
  await expect(page.getByRole('link', { name: 'Open the tool' })).toBeVisible();

  await page.goto('/multiomics/tool?lang=en');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('From multi-omics data');
  await expect(page.getByText('How should these results be interpreted?')).toHaveCount(0);
  await expect(page.getByText('Run the analysis from the uploaded matrices')).toBeVisible();
});

test('outcome workflow requires an explicit omics time point when multiple visits exist', async ({ page }) => {
  await page.goto('/multiomics/tool');
  await page.getByTestId('multiomics-load-demo').click();
  await expect(page.getByTestId('multiomics-results')).toBeVisible({ timeout: 20_000 });

  await page.getByLabel(/Objectif principal|Main objective/).selectOption('outcome');
  await page.getByLabel(/Type d.outcome principal|Primary outcome type/).selectOption('binary');

  const timepoint = page.getByLabel(/Temps omique utilisé|Omics time point used/);
  await expect(timepoint).toBeVisible();
  await expect(timepoint).toHaveValue('');
  await timepoint.selectOption('T0');
  await expect(timepoint).toHaveValue('T0');
});

test('multi-omics results expose contextual help, QC and reproducible report', async ({ page }) => {
  await page.route('https://reactome.org/AnalysisService/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        summary: { token: 'QC_TEST', type: 'OVERREPRESENTATION' },
        pathwaysFound: 1,
        identifiersNotFound: 0,
        pathways: [{
          stId: 'R-HSA-71291',
          name: 'Metabolism of amino acids and derivatives',
          species: 'Homo sapiens',
          entities: { found: 3, total: 100, pValue: 0.01, fdr: 0.05 },
          reactions: { found: 2, total: 30 }
        }]
      })
    });
  });

  await page.goto('/multiomics/tool');
  await page.getByTestId('multiomics-load-demo').click();
  await expect(page.getByTestId('multiomics-results')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('multiomics-qc')).toBeVisible();
  await expect(page.getByTestId('multiomics-qc')).toContainText(/variables conservées|features retained/i);

  const help = page.locator('.feature-head .help-tip').first();
  await expect(help).toHaveAttribute('data-tooltip', /rapport|ratio|direction|magnitude/i);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Rapport HTML reproductible|Reproducible HTML report/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('multiomics_reproducible_report.html');
});

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

  await page.goto('/multiomics/tool');
  await expect(page.getByTestId('multiomics-load-demo')).toBeVisible();
  await page.getByTestId('multiomics-load-demo').click();

  await expect(page.getByTestId('multiomics-results')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('multiomics-results')).toContainText(/Résultats multi-omiques calculés|Computed multi-omics results/);
  await expect(page.getByTestId('multiomics-results')).toContainText('random-intercept-longitudinal-model');
  await expect(page.getByTestId('multiomics-results')).toContainText('IDO1');
  await expect(page.getByTestId('multiomics-interpretation')).toBeVisible();
  await expect(page.getByTestId('multiomics-interpretation')).toContainText(/Comment interpréter ces résultats|How should these results be interpreted/);
  await expect(page.getByTestId('multiomics-pathways')).toContainText('Metabolism of amino acids and derivatives');
  expect(reactomeCalls).toBeGreaterThanOrEqual(3);
});
