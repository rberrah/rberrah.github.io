import { test, expect } from '@playwright/test';
// @ts-expect-error Node built-ins run in Playwright, outside the browser type environment.
import { readFile } from 'node:fs/promises';

/** @param {import('@playwright/test').Page} page @param {string} name */
const nav = (page, name) => page.getByTestId('workshop-nav').getByRole('link', { name, exact: true }).click();
/** @param {import('@playwright/test').Page} page @param {string} name */
const next = (page, name) => page.getByTestId('model-continuity').getByRole('button', { name, exact: true }).click();
/** @param {import('@playwright/test').Page} page */
async function code(page) {
  await page.locator('.codehead').getByRole('tab', { name: 'mrgsolve', exact: true }).click();
  return page.locator('pre.codeblk code').innerText();
}
/** @param {import('@playwright/test').Page} page */
async function downloadSpec(page) {
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export workshop (.json)', exact: true }).click();
  const file = await downloaded;
  return JSON.parse(await readFile(await file.path(), 'utf8'));
}

test('Explorer exposes five workshops; PK and Advanced have distinct palettes', async ({ page }) => {
  await page.goto('/pk/?lang=en');
  await expect(page.locator('.canvas .node')).toHaveCount(2);
  await expect(page.locator('.mlxtran-import')).toHaveCount(0);
  await expect(page.locator('.toolbar .add')).toHaveCount(4);
  if (await page.getByTestId('nav-toggle').isVisible()) await page.getByTestId('nav-toggle').click();
  await page.getByTestId('goal-explore').locator('summary').click();
  await expect(page.getByTestId('goal-explore').locator('a')).toHaveText(['Translator', 'PK', 'PD', 'DDI', 'Advanced']);
  await page.keyboard.press('Escape');
  await next(page, 'Advanced');
  await expect(page.locator('.canvas .node')).toHaveCount(2);
  await expect(page.locator('.toolbar .add')).toHaveCount(9);
  await page.locator('.toolbar .add').filter({ hasText: 'Response' }).click();
  await expect(page.getByTestId('model-continuity').getByRole('button', { name: 'PK', exact: true })).toBeDisabled();
  await nav(page, 'PK');
  await expect(page.locator('.canvas .node')).toHaveCount(2);
  await nav(page, 'Advanced');
  await expect(page.locator('.canvas .node')).toHaveCount(3);
});

test('graph, covariates, layout and draft survive transfers without browser persistence', async ({ page }) => {
  await page.goto('/pk/?lang=en');
  await page.getByRole('button', { name: 'Add a continuous covariate', exact: true }).click();
  await page.locator('.cov-row .txt').fill('WEIGHT');
  const original = await code(page);
  await next(page, 'Advanced');
  expect(await code(page)).toBe(original);
  await nav(page, 'Translator');
  const importer = page.locator('.mlxtran-import');
  await importer.getByRole('tab', { name: 'mrgsolve', exact: true }).click();
  await importer.locator('textarea').fill(original);
  await importer.getByRole('button', { name: 'Build the diagram', exact: true }).click();
  expect(await code(page)).toBe(original);
  await importer.locator('textarea').fill('$PARAM TVCL=1\n$ODE\ndxdt_CENT = system("no");');
  await importer.getByRole('button', { name: 'Build the diagram', exact: true }).click();
  await expect(importer.getByRole('alert')).toBeVisible();
  expect(await code(page)).toBe(original);
  await nav(page, 'PK');
  expect(await code(page)).toBe(original);
  const storage = await page.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage)]));
  expect(storage).not.toContain('WEIGHT');
  expect(storage).not.toContain('PK_LEGO_SPEC');
  expect(page.url()).not.toContain('code=');
  await page.reload();
  await expect(page.locator('.cov-row')).toHaveCount(0);
});

test('one covariate definition can contain several distinct parameter effects', async ({ page }) => {
  await page.goto('/pk/?lang=en');
  await page.getByRole('button', { name: 'Add a continuous covariate', exact: true }).click();
  const weight = page.locator('.cov-row').first();
  await weight.locator('.txt').fill('WEIGHT');
  await weight.getByRole('button', { name: 'Add effect' }).click();
  await expect(page.locator('.cov-row')).toHaveCount(1);
  await expect(weight.locator('.cov-effect')).toHaveCount(2);

  await page.getByRole('button', { name: 'Add a continuous covariate', exact: true }).click();
  const second = page.locator('.cov-row').nth(1).locator('.txt');
  const originalName = await second.inputValue();
  await second.fill('WEIGHT');
  await expect(second).toHaveValue(originalName);
});

test('a compatible PK workshop opens Simulation and exports CSV, R and Rmd', async ({ page }) => {
  await page.goto('/pk/?lang=en');
  await next(page, 'Simulation');
  await expect(page).toHaveURL(/\/playground\//);
  await expect(page.getByRole('status')).toContainText('PK workshop model applied');
  await expect(page.getByRole('spinbutton', { name: 'Dose', exact: true })).toHaveValue('100');
  await expect(page.getByRole('spinbutton', { name: 'CL (L/h)', exact: true })).toHaveValue('5.1');
  await page.getByText('R code used for reproduction').click();
  await expect(page.locator('.r-code code')).toContainText('library(mrgsolve)');
  await expect(page.locator('.r-code code')).toContainText('TVCL=5.1');

  for (const [button, filename, content] of [
    ['CSV results', 'poppk_simulation.csv', 'id,time,ipred,dv,CL,Vc,Q1,Vp1,Q2,Vp2,Ka'],
    ['Code R', 'poppk_simulation.R', 'library(mrgsolve)'],
    ['R Markdown', 'poppk_simulation.Rmd', '```{r simulation']
  ]) {
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: button, exact: true }).click();
    const download = await pending;
    expect(download.suggestedFilename()).toBe(filename);
    expect(await readFile(await download.path(), 'utf8')).toContain(content);
  }
});

test('both DDI models can independently receive PK without changing the mechanism or doses', async ({ page }) => {
  await page.goto('/pk/?lang=en');
  const first = await code(page);
  await next(page, 'DDI');
  await expect(page.locator('#cpp-1')).toHaveValue(first);
  await page.getByRole('button', { name: 'Interaction', exact: true }).click();
  await page.getByRole('combobox', { name: 'Mechanism', exact: true }).selectOption('reversible');
  const before = await downloadSpec(page);
  expect(before.config.target).toMatch(/^TV_k_.+_e$/);
  await nav(page, 'PK');
  await page.locator('.toolbar').getByRole('button', { name: 'IV 2-cpt', exact: true }).click();
  const second = await code(page);
  await page.getByRole('combobox', { name: 'DDI destination', exact: true }).selectOption('2');
  await next(page, 'DDI');
  const after = await downloadSpec(page);
  expect(after.models[0].code).toBe(first);
  expect(after.models[1].code).toBe(second);
  expect(after.models[0].route).toBe('Oral');
  expect(after.models[1].route).toBe('IV');
  expect(after.config.type).toBe(before.config.type);
  expect(after.config.affected).toEqual(before.config.affected);
  expect(after.config.driver).toEqual(before.config.driver);
});

test('PD assembly retains its workshop while Advanced remains a free graph', async ({ page }) => {
  await page.goto('/pk/?lang=en');
  const pk = await code(page);
  await next(page, 'PD');
  await page.getByRole('button', { name: 'General PD', exact: true }).click();
  await expect(page.locator('#cpp-pd')).toHaveValue(pk);
  await page.getByRole('navigation', { name: 'PD settings' }).getByRole('button', { name: 'PD', exact: true }).click();
  await page.getByRole('combobox', { name: 'Response model', exact: true }).selectOption('hill');
  await page.getByLabel('HILL', { exact: true }).fill('2.1');
  await page.getByRole('navigation', { name: 'PD settings' }).getByRole('button', { name: 'PD', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Effect compartment', exact: true }).setChecked(true);
  await page.getByRole('navigation', { name: 'PD settings' }).getByRole('button', { name: 'Ce', exact: true }).click();
  await expect(page.locator('.assembly .block')).toHaveCount(3);
  await page.getByLabel('KE0', { exact: true }).fill('0.7');
  const pd = await downloadSpec(page);
  expect(pd.config.type).toBe('hill');
  expect(pd.config.delay).toBe(true);
  expect(pd.config.parameters.KE0).toBe(0.7);
  expect(pd.models[0].code).toBe(pk);
  await nav(page, 'Advanced');
  await expect(page.locator('.composition')).toHaveCount(0);
  await expect(page.locator('.canvas')).toBeVisible();
  await nav(page, 'PD');
  expect(await downloadSpec(page)).toEqual(pd);
  await page.getByRole('navigation', { name: 'PD settings' }).getByRole('button', { name: 'PD', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Effect compartment', exact: true }).uncheck();
  await expect(page.locator('.assembly .block')).toHaveCount(2);
  await page.getByRole('button', { name: 'Oncology', exact: true }).click();
  await page.getByRole('navigation', { name: 'PD settings' }).getByRole('button', { name: 'PD', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Myelosuppression with feedback', exact: true }).uncheck();
  await expect(page.locator('.assembly .block')).toHaveCount(2);
  expect((await downloadSpec(page)).config.toxicity).toBe(false);
  await page.getByRole('checkbox', { name: 'Myelosuppression with feedback', exact: true }).check();
  await expect(page.locator('.assembly .block')).toHaveCount(3);
  await page.getByRole('navigation', { name: 'PD settings' }).getByRole('button', { name: 'ANC', exact: true }).click();
  await expect(page.getByLabel('MTT (day)', { exact: true })).toBeVisible();
  await nav(page, 'PK');
  await next(page, 'Advanced');
  await expect(page.locator('.canvas .node')).toHaveCount(2);
  expect(await code(page)).toBe(pk);
});

test('a DDI source opens in Translator without altering either model', async ({ page }) => {
  await page.goto('/pk/?lang=en');
  const original = await code(page);
  await next(page, 'DDI');
  await page.locator('.pk-model:visible .workshop-links').getByRole('link', { name: 'Translator', exact: true }).click();
  await expect(page.locator('.mlxtran-import textarea')).toHaveValue(original);
  await page.locator('.mlxtran-import').getByRole('button', { name: 'Build the diagram', exact: true }).click();
  expect(await code(page)).toBe(original);
  await nav(page, 'DDI');
  await expect(page.locator('#cpp-1')).toHaveValue(original);
});

test('an invalid parameter reopens its PD inspector before any engine launch', async ({ page }) => {
  await page.goto('/pd/?lang=en');
  await page.getByRole('button', { name: 'General PD', exact: true }).click();
  await page.getByRole('navigation', { name: 'PD settings' }).getByRole('button', { name: 'PD', exact: true }).click();
  await page.getByLabel('EMAX', { exact: true }).fill('');
  await page.getByRole('navigation', { name: 'PD settings' }).getByRole('button', { name: 'PD', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Effect compartment', exact: true }).setChecked(true);
  await page.getByRole('navigation', { name: 'PD settings' }).getByRole('button', { name: 'Ce', exact: true }).click();
  await expect(page.getByLabel('EMAX', { exact: true })).toBeHidden();
  await page.getByRole('button', { name: 'Open in engine', exact: true }).click();
  await expect(page.getByLabel('EMAX', { exact: true })).toBeVisible();
  await expect(page.getByLabel('EMAX', { exact: true })).toBeFocused();
});

for (const width of [1440, 390]) {
  test(`workshop views are rendered and fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    /** @type {string[]} */ const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const workshop of ['pk', 'translator', 'advanced', 'pd', 'ddi']) {
      await page.goto(`/${workshop}/?lang=en`);
      await expect(page.getByTestId('workshop-nav')).toBeVisible();
      if (workshop === 'advanced' || workshop === 'translator') await page.locator('.toolbar').getByRole('button', { name: 'IV 2-cpt', exact: true }).click();
      const graphic = ['pd','ddi'].includes(workshop) ? page.locator('.assembly') : page.locator('.canvas');
      await expect(graphic).toBeVisible();
      if (['pk', 'advanced', 'translator'].includes(workshop)) await expect(page.locator('.chart .serie').first()).not.toHaveAttribute('d', '');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await graphic.scrollIntoViewIfNeeded();
      await page.screenshot({ path: `test-results/workshop-${workshop}-${width}.png` });
    }
    expect(errors).toEqual([]);
  });
}

test('Translator and composed workshops still send their existing R engine contracts', async ({ page, context }) => {
  await context.route(url => ['lego', 'workbench'].includes(url.searchParams.get('bridge') ?? ''), route => route.fulfill({
    contentType: 'text/html', body: `<script>window.addEventListener('message', e => {
      window.received = e.data;
      e.source.postMessage({type: e.data.type === 'pk-lego-model' ? 'pk-lego-model-ack' : 'pk-workbench-ack', id: e.data.id, ok: true}, e.origin);
    });</script>`
  }));
  await page.goto('/translator/?lang=en');
  await page.locator('.toolbar').getByRole('button', { name: 'IV 2-cpt', exact: true }).click();
  const original = await code(page);
  const popupPromise = page.waitForEvent('popup');
  await page.locator('.tdm-launch').click();
  const popup = await popupPromise;
  await expect.poll(() => popup.evaluate(() => /** @type {any} */ (window).received?.code)).toBe(original);
  await popup.close();
  await nav(page, 'DDI');
  const ddiPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Open in engine', exact: true }).click();
  const ddiPopup = await ddiPromise;
  await expect.poll(() => ddiPopup.evaluate(() => /** @type {any} */ (window).received?.view)).toBe('ddi');
  const payload = await ddiPopup.evaluate(() => /** @type {any} */ (window).received);
  expect(payload.models).toHaveLength(2);
  expect(payload.version).toBe(1);
  await ddiPopup.close();
});

test('a generated PK model compiles and simulates in the local PD engine', async ({ page, context }) => {
  test.skip(!/** @type {any} */ (globalThis).process?.env?.TDM_ENGINE_E2E_URL, 'Requires the local Shiny engine.');
  test.setTimeout(120000);
  await context.route('https://tdmhub.shinyapps.io/**', route => route.abort());
  await page.goto('/pk/?lang=en');
  await next(page, 'PD');
  await page.getByRole('button', { name: 'General PD', exact: true }).click();
  const pending = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Open in engine', exact: true }).click();
  const engine = await pending;
  await expect(page.locator('.actions').getByRole('status')).toContainText('Workshop transferred', { timeout: 45000 });
  await expect(engine.locator('#pd-pk-code')).toHaveValue(/PK_LEGO_SPEC/);
  await expect(engine.locator('#pd-pk-status')).toContainText('mrgsolve / Lego', { timeout: 45000 });
  const plot = engine.locator('#pd-effect_plot img');
  await expect(plot).toBeVisible({ timeout: 20000 });
  await expect.poll(() => plot.evaluate(img => /** @type {HTMLImageElement} */ (img).naturalWidth)).toBeGreaterThan(100);
  await expect(page.locator('[data-testid="curve-pd_time"]')).toBeVisible({ timeout: 20000 });
  await expect(page.locator('[data-testid="curve-pd_relation"]')).toBeVisible();
  await expect(engine.locator('.shiny-notification-error')).toHaveCount(0);
  await engine.screenshot({ path: 'test-results/workshop-pk-local-pd.png', fullPage: true });
  await engine.close();
});
