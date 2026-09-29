import { chromium, expect } from '@playwright/test';

const url = process.env.TDM_ENGINE_E2E_URL;
if (!url) throw new Error('Set TDM_ENGINE_E2E_URL to the engine being verified.');
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  page.setDefaultTimeout(120000);
  await page.goto(`${url.replace(/\/$/, '')}/?lang=en`, { timeout: 120000 });
  await page.waitForFunction(() => window.Shiny?.shinyapp?.config?.sessionId);
  await page.locator('input[name="model_source"][value="pmetrics"]').check({ force: true, timeout: 15000 });
  await expect(page.locator('#pmetrics_context_ui')).toContainText(/synthetic|demonstration/i, { timeout: 60000 });
  await page.evaluate(() => {
    const values = { time_entry_mode: 'relative_hours', dose_time_1: 0, dose_amount_1: 100,
      dose_interval_1: 12, dose_count_1: 1, dose_ss_1: false, dose_infusion_1: 0,
      observation_time_1: 1, observation_concentration_1: 100 * Math.exp(-0.15) / 30,
      target_metric: 'AUC24', target_low: 15, target_high: 35,
      dose_min: 80, dose_max: 120, dose_step: 20, candidate_intervals: ['12'], future_infusion: 0,
      mc_replicates: 50, residual_error_mode: 'model', accept_disclaimer: true };
    for (const [id, value] of Object.entries(values)) window.Shiny.setInputValue(id, value, { priority: 'event' });
  });
  await page.locator('#run_analysis').click({ force: true });
  await expect(page.locator('#pmetrics_support_table tbody tr')).toHaveCount(3, { timeout: 120000 });
  await expect(page.locator('#pmetrics_support_table')).toContainText('Posterior probability');
  const posterior = await page.locator('#pmetrics_support_table tbody tr').evaluateAll(rows => rows.map(row => [...row.querySelectorAll('td')].map(td => Number(td.textContent))));
  expect(posterior.find(row => Math.abs(row[0] - 0.15) < 1e-8)?.[2]).toBeGreaterThan(0.95);
  await page.waitForFunction(() => { const img = document.querySelector('#fit_plot img'); return img?.complete && img.naturalWidth > 0; });
  await expect(page.locator('.shiny-output-error:visible')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/pmetrics-native-fit.png', fullPage: true });
  console.log('Native Pmetrics fit, posterior support weights and concentration plot verified:', url);
} catch (error) {
  const page = browser.contexts()[0]?.pages()[0];
  if (page) {
    console.error(await page.locator('.shiny-notification, .shiny-output-error').allTextContents());
    await page.screenshot({ path: 'test-results/pmetrics-fit-failure.png', fullPage: true });
  }
  throw error;
} finally { await browser.close(); }
