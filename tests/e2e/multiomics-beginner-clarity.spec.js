// @ts-nocheck
import { test, expect } from '@playwright/test';

test('FDR explanation counts real feature-grid q-values, not unrelated table q-values', async ({ page }) => {
  await page.goto('/multiomics/tool?lang=fr');
  await page.getByTestId('multiomics-load-demo').click();
  await expect(page.getByTestId('multiomics-results')).toBeVisible({ timeout: 30_000 });

  const baseline = await page.evaluate(() => {
    const nodes = document.querySelectorAll('#analysis-results .feature-table [data-scientific-q]');
    const qs = [...nodes].map(node => Number(node.getAttribute('data-scientific-q')))
      .filter(q => Number.isFinite(q) && q >= 0 && q <= 1);
    return {
      primary: qs.filter(q => q <= 0.05).length,
      exploratory: qs.filter(q => q > 0.05 && q <= 0.10).length
    };
  });
  await page.evaluate(() => {
    const results = document.querySelector('[data-testid="multiomics-results"]');
    const fixture = document.createElement('div');
    fixture.className = 'feature-table';
    fixture.dataset.testid = 'fdr-grid-fixture';
    fixture.innerHTML = '<span data-scientific-q="0.02">0,020</span>' +
      '<span data-scientific-q="0.08">0,080</span>' +
      '<span data-scientific-q="">—</span>' +
      '<span data-scientific-q="NaN">invalid</span>' +
      '<span data-scientific-q="1.5">invalid</span>';
    results.append(fixture);

    const unrelatedTable = document.createElement('table');
    unrelatedTable.dataset.testid = 'unrelated-fdr-table';
    unrelatedTable.innerHTML = '<thead><tr><th>Pathway</th><th>q BH</th></tr></thead>' +
      '<tbody><tr><td>Not a feature</td><td>0.001</td></tr></tbody>';
    results.append(unrelatedTable);
    window.dispatchEvent(new Event('pmx-multiomics-analysis'));
  });

  const policy = page.getByTestId('multiomics-fdr-policy');
  await expect(policy).toBeVisible();
  const counts = policy.locator('.fdr-policy-count');
  await expect(counts).toContainText(
    `${baseline.primary + 1} ligne(s) affichée(s) satisfont q ≤ 0,05`
  );
  await expect(counts).toContainText(
    `${baseline.exploratory + 1} ligne(s) supplémentaire(s)`
  );
  await expect(policy).toContainText('dix premières lignes visibles par omique');

  await page.locator('.language-toggle').getByRole('button', { name: 'EN', exact: true }).click();
  await expect(counts).toContainText(
    `${baseline.primary + 1} displayed row(s) meet q ≤ 0.05`
  );
  await expect(policy).toContainText('first ten rows shown per omic');
});

test('Readiness text derived from visible metadata is escaped, never injected as HTML', async ({ page }) => {
  await page.goto('/multiomics/tool?lang=fr');
  const readiness = page.getByTestId('multiomics-run-readiness');
  await expect(readiness).toBeVisible();
  await page.evaluate(() => {
    document.querySelector('.status strong').textContent = '<img src=x onerror=alert(1)>';
  });
  await expect(readiness).toContainText('<img src=x onerror=alert(1)>');
  await expect(readiness.locator('img')).toHaveCount(0);
});
