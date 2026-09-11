import { chromium, expect } from '@playwright/test';

const base = process.env.TDM_ENGINE_E2E_URL;
if (!base) throw new Error('Set TDM_ENGINE_E2E_URL to the deployed engine URL.');
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(120000);
  await page.goto(`${base}?view=pd&lang=en`, { timeout: 120000 });
  await page.waitForFunction(() => window.Shiny?.shinyapp?.config?.sessionId && window.Shiny.shinyapp.$socket?.readyState === 1);
  await expect(page.locator('#onco-compare')).toBeVisible();
  const history = page.locator('#onco-history-table');
  await expect(history.locator('tbody tr')).toHaveCount(2);
  await expect(page.locator('textarea#onco-history')).toHaveCount(0);
  const amount = history.locator('tbody tr').nth(1).locator('td').nth(1);
  await amount.dblclick();
  await amount.locator('input').fill('125');
  await amount.locator('input').press('Enter');
  await expect(amount).toHaveText('125');
  await page.locator('#onco-history-add').click();
  await expect(history.locator('tbody tr')).toHaveCount(3);
  await history.locator('tbody tr').nth(2).locator('td').first().click();
  await page.locator('#onco-history-remove').click();
  await expect(history.locator('tbody tr')).toHaveCount(2);
  await page.setViewportSize({ width: 390, height: 900 });
  const configure = page.locator('.onco-shell .mobile-configure-button');
  if (await configure.isVisible()) await configure.click();
  await history.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/shiny-dose-table-mobile.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('#onco-compare').click();
  await page.waitForFunction(() => {
    const output = document.querySelector('#onco-tumor_plot img');
    return output?.complete && output.naturalWidth > 0;
  });
  await expect(page.locator('.shiny-output-error:visible')).toHaveCount(0);
  await page.locator('a[data-value="general"]').click();
  await expect(page.locator('#pd-observations-table tbody tr')).toHaveCount(7);
  await page.locator('#pd-simulate').click();
  await page.waitForFunction(() => !document.documentElement.classList.contains('shiny-busy'));
  await expect(page.locator('.shiny-output-error:visible')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/shiny-deployment-pd.png', fullPage: true });
  await page.goto(`${base}?view=ddi&lang=en`, { timeout: 120000 });
  await page.waitForFunction(() => window.Shiny?.shinyapp?.config?.sessionId);
  await expect(page.locator('#run_ddi')).toBeVisible();
  expect(await page.locator('.ddi-actions').evaluate(el => getComputedStyle(el).position)).toBe('static');
  await page.setViewportSize({ width: 390, height: 900 });
  const configureDdi = page.locator('.ddi-mobile-configure-button');
  if (await configureDdi.isVisible()) await configureDdi.click();
  await page.locator('#run_ddi').scrollIntoViewIfNeeded();
  expect(await page.locator('.ddi-actions').evaluate(el => getComputedStyle(el).position)).toBe('static');
  await page.screenshot({ path: 'test-results/shiny-ddi-actions-mobile.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await expect(page.locator('.shiny-output-error:visible')).toHaveCount(0);
  console.log('Shiny session, editable dose history, oncology curve, PD simulation and non-sticky DDI actions passed on desktop/mobile.');
} catch (error) {
  const page = browser.contexts()[0]?.pages()[0];
  if (page) await page.screenshot({ path: 'test-results/shiny-deployment-failure.png', fullPage: true });
  throw error;
} finally {
  await browser.close();
}
