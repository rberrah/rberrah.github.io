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
  await expect(page.locator('.shiny-output-error:visible')).toHaveCount(0);
  console.log('Live Shiny session, oncology curve, PD table/simulation and DDI view passed.');
} finally {
  await browser.close();
}
