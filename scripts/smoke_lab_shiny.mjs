import { chromium, expect } from '@playwright/test';
const site = process.env.LABS_E2E_URL;
const engine = process.env.TDM_ENGINE_E2E_URL;
if (!site || !engine) throw new Error('Set LABS_E2E_URL (Vite dev) and TDM_ENGINE_E2E_URL (Shiny) to local test URLs.');
for (const value of [site, engine]) if (!['127.0.0.1', 'localhost'].includes(new URL(value).hostname)) throw new Error('This test is local only.');
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(90000);
  await page.goto(`${site}/laboratoires/?lang=en`);
  await expect(page.getByTestId('laboratory')).toHaveAttribute('data-ready', 'true');
  const popup = page.waitForEvent('popup');
  await page.evaluate(async ({ engine }) => {
    const { openLaboratoryTdm } = await import('/src/lib/labs/tdm.js');
    const { defaults, laboratorySpec } = await import('/src/lib/labs/model.js');
    window.labStatus = '';
    openLaboratoryTdm(engine, 'en', laboratorySpec('accumulation', { ...defaults.accumulation, loading: 2, count: 8 }),
      (state, error) => { window.labStatus = state; window.labError = error; });
  }, { engine });
  const shiny = await popup; shiny.setDefaultTimeout(90000);
  await page.waitForFunction(() => ['done','error','timeout'].includes(window.labStatus), null, { timeout: 90000 });
  expect(await page.evaluate(() => ({status:window.labStatus, error:window.labError}))).toEqual({status:'done', error:undefined});
  await expect(shiny.locator('#custom_code')).toHaveValue(/TV_cl_L1_CENT/);
  await expect(shiny.locator('#dose_rows .dose-row')).toHaveCount(8);
  await expect(shiny.locator('#dose_amount_1')).toHaveValue('200');
  await expect(shiny.locator('#dose_amount_8')).toHaveValue('100');
  await expect(shiny.locator('#dose_time_8')).toHaveValue('56');
  await expect(shiny.locator('#observation_concentration_1')).toHaveValue('');
  await expect(shiny.locator('#administration_route')).toHaveValue('IV');
  await shiny.locator('#validate_model').click();
  await expect(shiny.locator('#engine_status')).toContainText('Valid model', { timeout: 90000 });
  await expect(shiny.locator('.shiny-output-error:visible')).toHaveCount(0);
  console.log('Lab -> Shiny: server ACK, regenerated PK, loading dose, eight scheduled doses, IV, blank observations and contract validation passed.');
} finally { await browser.close(); }
