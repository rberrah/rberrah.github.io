import { test, expect } from '@playwright/test';
// @ts-expect-error Node built-ins run in Playwright, outside the site's browser type environment.
import { readFile } from 'node:fs/promises';
// @ts-expect-error Node built-in for in-memory upload fixtures.
import { Buffer } from 'node:buffer';

const engineUrl = /** @type {any} */ (globalThis).process?.env?.TDM_ENGINE_E2E_URL;
const code = '$PARAM CL=5, V=30\n$CMT CENT\n$ODE dxdt_CENT = -CL/V*CENT;\n$TABLE double CP=CENT/V;\n$CAPTURE CP';

/** @param {import('@playwright/test').Page} page @param {string} id @param {string} value */
async function select(page, id, value) {
  await page.locator(`#${id}`).evaluate((element, selected) => /** @type {any} */ (element).selectize.setValue(selected), value);
}

/** @param {import('@playwright/test').Page} page @param {string} csv */
async function observationsCsv(page, csv) {
  await page.locator('#pd-file').setInputFiles({ name: 'observations.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await expect(page.locator('#pd-observations-table')).toContainText(csv.split('\n')[1].split(',')[1]);
}

/** @param {import('@playwright/test').Page} page @param {string} id */
async function plotReady(page, id) {
  const img = page.locator(`#${id} img`);
  await expect(img).toBeVisible({ timeout: 20000 });
  await expect.poll(() => img.evaluate((element) => /** @type {HTMLImageElement} */ (element).naturalWidth)).toBeGreaterThan(100);
  // Inspect actual raster pixels, not only a nonempty image URL.
  expect(await img.evaluate((element) => {
    const image = /** @type {HTMLImageElement} */ (element);
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    ctx.drawImage(image, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let colored = 0;
    for (let i = 0; i < data.length; i += 4) if (Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]) > 35) colored++;
    return colored;
  })).toBeGreaterThan(150);
}

test.describe('local DDI and PD workbenches', () => {
  test.skip(!engineUrl, 'Set TDM_ENGINE_E2E_URL to a local R engine.');
  test.describe.configure({ mode: 'default' });
  test.setTimeout(120000);
  test.beforeEach(async ({ context }) => {
    await context.route('https://tdmhub.shinyapps.io/**', (route) => route.abort());
  });

  test('PD simulates, fits, exports and invalidates stale results', async ({ page }) => {
    await page.goto(`${engineUrl}?view=pd&lang=en`);
    await page.locator('a[data-value="general"]').click();
    await page.waitForFunction(() => /** @type {any} */ (window).Shiny?.shinyapp?.$inputValues?.['pd-type'] === 'emax');
    await expect(page.locator('#pd-EMAX')).toBeVisible({ timeout: 20000 });
    await plotReady(page, 'pd-effect_plot');
    await page.screenshot({ path: '.playwright/pd-desktop.png', fullPage: true });
    await select(page, 'pd-type', 'linear');
    await expect(page.locator('#pd-SLOPE')).toBeVisible({ timeout: 20000 });
    await observationsCsv(page, 'time,effect\n0,50\n2,42.74923\n4,36.81280\n8,27.97316\n12,22.04777\n18,16.61196\n24,13.62872');
    await page.locator('#pd-E0').fill('12');
    await page.locator('#pd-SLOPE').fill('3');
    await page.locator('#pd-accept').check();
    await page.locator('#pd-fit').click();
    await expect(page.locator('#pd-fit_summary')).toContainText('RMSE', { timeout: 30000 });
    await expect(page.locator('#pd-fit_parameters')).toContainText('SLOPE');
    await plotReady(page, 'pd-fit_plot');
    const download = page.waitForEvent('download');
    await page.locator('#pd-download_report').click();
    const report = await download;
    expect(await readFile(await report.path(), 'utf8')).toContain('Pharmacodynamic report');
    await page.locator('#pd-SLOPE').fill('2.5');
    await expect(page.locator('#pd-fit_summary')).toContainText('No fit available');
    await page.locator('a[data-value="model"]').filter({ visible: true }).click();
    await expect(page.locator('#pd-code')).toContainText('$CAPTURE PRED CP');
    const cppDownload = page.waitForEvent('download');
    await page.locator('#pd-download_code').click();
    const cpp = await cppDownload;
    expect(await readFile(await cpp.path(), 'utf8')).toContain('SLOPE*CP');
    await page.locator('#pd-delay').check();
    await page.locator('input[name="pd-data_mode"][value="concentration"]').check();
    await observationsCsv(page, 'concentration,effect\n0,10\n1,12\n2,14\n3,16\n4,18\n5,20');
    await page.locator('#pd-fit').click();
    await expect(page.locator('.shiny-notification-error')).toContainText('require timed data');
    await expect(page.locator('.shiny-output-error:visible')).toHaveCount(0);
  });

  test('DDI compiles both pasted models and exports the coupled simulation', async ({ page }) => {
    await page.goto(`${engineUrl}?view=ddi&lang=en`);
    await expect(page.locator('#assemble_ddi')).toBeVisible({ timeout: 20000 });
    for (const side of [1, 2]) {
      if (side === 2) await page.getByRole('button', { name: '3 - Interacting drug' }).click();
      await page.locator(`input[name="ddi_source_${side}"][value="code"]`).check();
      await page.locator(`#ddi_code_${side}`).fill(code);
      await page.locator(`#ddi_load_code_${side}`).click();
      await expect(page.locator(`#ddi_custom_status_${side}`)).toContainText('Model compiled', { timeout: 45000 });
    }
    await select(page, 'ddi_target_parameter', 'CL');
    await page.locator('#assemble_ddi').click();
    await expect(page.locator('#ddi_generated_code')).toContainText('DDI_BASE_CL', { timeout: 45000 });
    await page.screenshot({ path: '.playwright/ddi-desktop.png', fullPage: true });
    const download = page.waitForEvent('download');
    await page.locator('#download_ddi_r').click();
    const script = await download;
    expect(await readFile(await script.path(), 'utf8')).toContain('result <- ddi_simulate(config, affected, driver)');
    await page.locator('#ddi_accept_disclaimer').check();
    await page.locator('#run_ddi').click();
    await expect(page.locator('#ddi_metrics')).toContainText('AUC24', { timeout: 30000 });
    await plotReady(page, 'ddi_concentration_plot');
    await page.screenshot({ path: '.playwright/ddi-simulation.png', fullPage: true });
    await page.locator('#ddi_factor').fill('0.7');
    await expect(page.locator('#ddi_empty')).toBeVisible();
    await page.locator('a[data-value="model"]').filter({ visible: true }).click();
    await expect(page.locator('#ddi_code_status')).toContainText('No model assembled');
    await expect(page.locator('#download_ddi_r')).not.toBeVisible();
    await expect(page.locator('.shiny-output-error:visible')).toHaveCount(0);
  });

  test('site workshops are independent of the engine and fit desktop/mobile', async ({ page }) => {
    for (const width of [1440, 390]) for (const route of ['pharmacodynamie', 'interactions']) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${route}?lang=en`);
      await expect(page.locator('iframe')).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Open in engine', exact: true })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'From diagram to simulation' })).toBeVisible();
      await expect(page.locator('[data-testid^="curve-"]')).toHaveCount(route === 'pharmacodynamie' ? 1 : 2);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      if (route === 'pharmacodynamie') {
        const curve = page.locator('[data-testid="curve-tumor_comparison"] [data-series="treated"]');
        await expect(page.getByRole('group', {name:'Initial conditions', exact:true})).toBeVisible();
        await expect(page.getByRole('group', {name:'PK model and parameters', exact:true})).toBeVisible();
        await expect(page.getByRole('group', {name:'PD parameters', exact:true})).toBeVisible();
        const previous = await curve.getAttribute('d');
        await page.getByLabel('Resistance (1/day)', { exact: true }).fill('0.03');
        await expect(curve).not.toHaveAttribute('d', previous ?? '');
        await page.getByRole('combobox', { name: 'Tumor growth', exact: true }).selectOption('gompertz');
        await expect(page.getByLabel('CAP (mm)', { exact: true })).toBeVisible();
        if (width === 390) {
          await expect(page.locator('.mobile-scheme')).toBeVisible();
          const bounds = await page.locator('.mobile-scheme').boundingBox();
          expect(bounds?.x).toBeGreaterThanOrEqual(0);
          expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(width);
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
          await page.screenshot({ path: '.playwright/pd-figures-mobile.png', fullPage: true });
        }
        await page.getByLabel('Myelosuppression with feedback').uncheck();
        await expect(page.getByLabel('ANC(0) (10^9/L)', { exact: true })).toHaveCount(0);
      } else {
        await page.getByRole('button', { name: 'Interaction', exact: true }).click();
        await page.getByRole('combobox', { name: 'Mechanism', exact: true }).selectOption('turnover_induction');
        await expect(page.getByLabel('kdeg (1/h)', { exact: true })).toBeVisible();
        const curve = page.locator('[data-testid="curve-ddi_time"] [data-series="interaction"]');
        const previous = await curve.getAttribute('d');
        await page.getByLabel('kdeg (1/h)', { exact: true }).fill('0.08');
        await expect(curve).not.toHaveAttribute('d', previous ?? '');
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await page.screenshot({ path: `.playwright/${route}-${width}.png`, fullPage: true });
    }
  });

  test('oncology handoff preserves parameters and compares future cycles', async ({ page }) => {
    await page.goto('/pharmacodynamie?lang=en');
    await page.getByRole('combobox', { name: 'Tumor growth', exact: true }).selectOption('gompertz');
    await page.getByLabel('CAP (mm)', { exact: true }).fill('280');
    await page.getByLabel('SLD(0) (mm)', { exact: true }).fill('75');
    const popup = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Open in engine', exact: true }).click();
    const engine = await popup;
    await expect(page.getByRole('status')).toContainText('Workshop transferred', { timeout: 40000 });
    expect(engine.url()).not.toContain('280');
    await engine.getByRole('button', { name: 'PK/PD parameters', exact: true }).click();
    await expect(engine.locator('#onco-T0')).toHaveValue('75');
    await expect(engine.locator('#onco-CAP')).toHaveValue('280');
    await engine.locator('#onco-compare').click();
    await plotReady(engine, 'onco-tumor_plot');
    await plotReady(engine, 'onco-anc_plot');
    await expect(engine.locator('#onco-metrics')).toContainText('Maintain');
    await expect(page.locator('.figures .scope')).toContainText('Comparison computed in R');
    await engine.screenshot({ path: '.playwright/onco-engine-desktop.png', fullPage: true });
    const download = engine.waitForEvent('download');
    await engine.locator('a[data-value="code"]').filter({ visible: true }).click();
    await engine.locator('#onco-download_report').click();
    const report = await download;
    expect(await readFile(await report.path(), 'utf8')).toContain('No clinical recommendation');
    await engine.close();
  });

  test('general PD handoff preserves Hill and effect-compartment parameters', async ({ page }) => {
    await page.goto('/pharmacodynamie?lang=en');
    await page.getByRole('button', { name: 'General PD', exact: true }).click();
    await expect(page.getByRole('link', { name: /Dayneka/ })).toBeVisible();
    await page.getByRole('combobox', { name: 'Response model', exact: true }).selectOption('hill');
    await page.getByLabel('Effect compartment', { exact: true }).check();
    await page.getByLabel('HILL', { exact: true }).fill('2.7');
    await page.getByLabel('KE0', { exact: true }).fill('0.35');
    const popup = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Open in engine', exact: true }).click();
    const engine = await popup;
    await expect(page.getByRole('status')).toContainText('Workshop transferred', { timeout: 40000 });
    await expect(engine.locator('#pd-HILL')).toHaveValue('2.7');
    await expect(engine.locator('#pd-KE0')).toHaveValue('0.35');
    await expect(engine.locator('#pd-delay')).toBeChecked();
    await engine.close();
  });

  test('oncology mobile simulation displays metrics and curves', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(`${engineUrl}?view=pd&lang=fr`);
    await page.locator('.onco-shell .mobile-configure-button').click();
    await expect(page.locator('#onco-compare')).toBeVisible();
    await page.locator('#onco-compare').click();
    await expect(page.locator('#onco-metrics')).toContainText('Maintenir', { timeout: 30000 });
    await page.locator('.onco-shell .collapse-toggle').click();
    await expect(page.locator('.onco-shell .sidebar')).toBeHidden();
    await plotReady(page, 'onco-tumor_plot');
    await plotReady(page, 'onco-anc_plot');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: '.playwright/onco-engine-mobile.png', fullPage: true });
  });

  test('DDI handoff transfers both PK models, route and dynamic mechanism', async ({ page }) => {
    await page.goto('/interactions?lang=fr');
    await page.locator('#model-1').selectOption('amox_mellon');
    await page.locator('#route-1').selectOption('IV');
    await page.getByRole('button', { name: 'Interaction', exact: true }).click();
    await page.getByRole('combobox', { name: 'Mecanisme', exact: true }).selectOption('tdi');
    await page.getByLabel('kinact (1/h)', { exact: true }).fill('0.07');
    const popup = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Ouvrir dans le moteur', exact: true }).click();
    const engine = await popup;
    await expect(page.getByRole('status')).toContainText('Atelier transmis', { timeout: 40000 });
    await expect(engine.locator('#ddi_kinact')).toHaveValue('0.07');
    await expect(engine.locator('#ddi_interaction_type')).toHaveValue('tdi');
    await expect(engine.locator('#ddi_model_1')).toHaveValue('amox_mellon');
    await expect(engine.locator('#ddi_route_1')).toHaveValue('IV');
    await expect(engine.locator('#ddi_model_2')).toHaveValue('voriconazole_vandenborn_ddi');
    await engine.close();
  });

  test('DDI workshop JSON exported by the site imports without compiling custom code', async ({ page }) => {
    await page.goto('/interactions?lang=en');
    await page.getByRole('button', { name: 'Interaction', exact: true }).click();
    await page.getByRole('combobox', { name: 'Mechanism', exact: true }).selectOption('reversible');
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export workshop (.json)', exact: true }).click();
    const file = await pending;
    await page.goto(`${engineUrl}?view=ddi&lang=en`);
    await page.locator('#ddi_workshop_file').setInputFiles(await file.path());
    await expect(page.locator('#ddi_interaction_type')).toHaveValue('reversible', {timeout:20000});
    await expect(page.locator('#ddi_model_1')).toHaveValue('tacrolimus_woillard_ddi');
    await expect(page.locator('.shiny-notification-error')).toHaveCount(0);
  });

  test('oncology uses pasted oral PK and returns the treated curve to the site', async ({ page }) => {
    await page.goto('/pharmacodynamie?lang=en');
    await page.getByLabel('Free PK model', {exact:true}).check();
    await page.locator('input[type="radio"][value="code"]').check();
    await page.locator('#cpp-onco').fill('$PARAM KA=1, CL=2, V=10\n$CMT DEPOT CENT\n$ODE dxdt_DEPOT=-KA*DEPOT; dxdt_CENT=KA*DEPOT-CL/V*CENT;\n$TABLE double CP=CENT/V;\n$CAPTURE CP');
    await page.locator('#route-onco').selectOption('Oral');
    await page.getByLabel('Next dose (day)', {exact:true}).fill('2');
    await page.getByLabel('Horizon (days)', {exact:true}).fill('6');
    await page.getByLabel('Interval (days)', {exact:true}).fill('2');
    await page.getByLabel('Infusion (h; 0 = oral / IV bolus)', {exact:true}).fill('0');
    await page.getByRole('button', {name:'Remove dose'}).nth(1).click();
    await page.getByLabel('Inf. h', {exact:true}).fill('0');
    await expect(page.locator('[data-series="treated"]')).toHaveCount(0);
    const popup = page.waitForEvent('popup');
    await page.getByRole('button', {name:'Open in engine', exact:true}).click();
    const engine = await popup;
    await expect(page.getByRole('status')).toContainText('Workshop transferred', {timeout:40000});
    await engine.getByRole('button', {name:'Free PK model', exact:true}).click();
    await expect(engine.locator('#onco-pk-custom_route')).toHaveValue('Oral');
    await expect(engine.locator('#onco-pk-status')).toContainText('not loaded');
    await engine.locator('#onco-pk-load').click();
    await expect(engine.locator('#onco-pk-status')).toContainText('mrgsolve / Lego', {timeout:45000});
    await engine.locator('#onco-compare').click();
    await expect(engine.locator('#onco-metrics')).toContainText('Maintain', {timeout:30000});
    await expect(page.locator('.figures .scope')).toContainText('Comparison computed in R');
    await expect(page.locator('[data-series="treated"]')).toHaveCount(1);
    await plotReady(engine, 'onco-tumor_plot');
    await engine.locator('#onco-pk-code').fill(code);
    await expect(engine.locator('#onco-pk-status')).toContainText('not loaded');
    await expect(engine.locator('#onco-empty')).toContainText('No comparison calculated');
    await engine.close();
  });

  test('general PD simulates an oral library PK model', async ({page}) => {
    await page.goto(`${engineUrl}?view=pd&lang=en`);
    await page.locator('a[data-value="general"]').click();
    await select(page, 'pd-exposure', 'pk');
    await select(page, 'pd-pk-model', 'amox_mellon');
    await expect.poll(() => page.locator('#pd-pk-route').evaluate((element) => Boolean(/** @type {any} */ (element).selectize?.options?.Oral))).toBe(true);
    await select(page, 'pd-pk-route', 'Oral');
    await page.locator('#pd-pk-load').click();
    await expect(page.locator('#pd-pk-status')).toContainText('Mellon', {timeout:45000});
    await page.locator('#pd-simulate').click();
    await plotReady(page, 'pd-effect_plot');
    await expect(page.locator('#pd-effect_plot.shiny-output-error')).toHaveCount(0);
    await expect(page.locator('.shiny-notification-error')).toHaveCount(0);
  });

  test('PD observation table supports editing, adding and deleting rows', async ({ page }) => {
    await page.goto(`${engineUrl}?view=pd&lang=en`);
    await page.locator('a[data-value="general"]').click();
    const rows = page.locator('#pd-observations-table tbody tr');
    await expect(rows).toHaveCount(7);
    await rows.first().locator('td').nth(1).dblclick();
    const editor = rows.first().locator('input, textarea');
    await editor.fill('145');
    await editor.press('Enter');
    await expect(rows.first()).toContainText('145');
    await page.locator('#pd-observations-add').click();
    await expect(rows).toHaveCount(8, {timeout:15000});
    await expect(rows.last().locator('td').nth(1)).toBeEmpty();
    await rows.first().click();
    await page.locator('#pd-observations-remove').click();
    await expect(rows).toHaveCount(7, {timeout:15000});
    await expect(page.locator('.shiny-notification-error')).toHaveCount(0);
    await page.screenshot({path:'.playwright/pd-observations-desktop.png', fullPage:true});
  });
});
