// @ts-nocheck
import { test, expect } from '@playwright/test';

test('Scientific summary displays imported diagnostics literally, never as executable HTML', async ({ page }) => {
  await page.goto('/multiomics/tool?lang=fr');
  await page.getByTestId('multiomics-quick-demo-rna').click();
  const panel = page.getByTestId('multiomics-scientific-summary');
  await expect(panel).toBeVisible({ timeout: 30000 });

  await page.evaluate(() => {
    window.__PMX_SCIENCE_INJECTED__ = 0;
    const marker = '<img src=x onerror="window.__PMX_SCIENCE_INJECTED__=1">';
    const diagnostics = {
      status: 'review_required',
      warnings: ['Un en-tête importé contient ' + marker],
      notes: ['Résultats à lire littéralement : < 5 observations'],
      blockers: [],
      methodEligibility: {
        mofa2: { status: 'not_recommended', sharedSubjects: 4, reasons: ['Missing ID ' + marker] },
        diablo: { status: 'not_applicable', smallestClass: 1, reasons: [] }
      }
    };
    window.__PMX_MULTIOMICS_DIAGNOSTICS__ = diagnostics;
    window.dispatchEvent(new CustomEvent('pmx-multiomics-diagnostics', { detail: diagnostics }));
  });

  const details = panel.locator('details.scientific-extra');
  await expect(details).toContainText('Un en-tête importé contient');
  await details.locator('summary').first().click();
  await expect(details).toContainText('<img src=x onerror=');
  await expect(details).toContainText('< 5 observations');
  expect(await page.evaluate(() => ({
    injected: window.__PMX_SCIENCE_INJECTED__,
    injectedHtml: document.querySelectorAll('[data-testid="multiomics-scientific-summary"] img').length
  }))).toEqual({ injected: 0, injectedHtml: 0 });
  await expect(panel).toContainText('Reproduire et rapporter');
});
