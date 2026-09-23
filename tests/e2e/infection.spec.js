// @ts-nocheck
import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const engine = process.env.TDM_ENGINE_E2E_URL;
const site = process.env.INFECTION_SITE_URL || '';

test.beforeEach(async ({context}) => {
  await context.route('https://rberrah.goatcounter.com/**', route => route.abort());
  await context.route('https://gc.zgo.at/**', route => route.abort());
});

for (const width of [390, 1440]) {
  test(`infectiology workshop, inputs and export at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto(`${site}/pd/?lang=en`);
    await expect(page.getByRole('button', { name: 'General PD', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Infectiology', exact: true }).click();
    const workshop = page.getByTestId('infection-workbench');
    await expect(workshop).toBeVisible();
    await expect(workshop.getByRole('combobox', {name:'PK structure', exact:true})).toHaveValue('iv1');
    await expect(workshop.getByText('PK code time unit', {exact: true})).toHaveCount(0);
    await expect(workshop.getByTestId('curve-infection_exposure').locator('path.curve')).toHaveCount(2);
    await expect(workshop.getByTestId('curve-infection_pta').locator('path.curve')).toHaveCount(2);
    await expect(workshop.getByLabel('C0 (mg/L)', {exact:true})).toHaveCount(0);
    const pta = workshop.getByTestId('curve-infection_pta').locator('[data-series="pta_current"]');
    const previous = await pta.getAttribute('d');
    await workshop.getByLabel('CL (L/h)', {exact:true}).fill('8');
    await expect(pta).not.toHaveAttribute('d', previous);
    await workshop.getByLabel('Other interval (h)', {exact:true}).fill('72');
    await workshop.getByRole('button', {name:'Add', exact:true}).click();
    await expect(workshop.getByLabel('Custom intervals')).toContainText('72 h');
    const ptaLegend = workshop.getByTestId('curve-infection_pta').locator('..').locator('.legend');
    await expect(ptaLegend).toContainText('Current · 1000 / 12 h');
    await expect(ptaLegend).toContainText('PTA threshold · 90%');
    const ptaTicks = workshop.getByTestId('curve-infection_pta').locator('.x-tick');
    await expect(ptaTicks).toHaveCount(width < 550 ? 4 : 7);
    expect(await ptaTicks.evaluateAll((ticks) => ticks.every((tick, index) => index === 0 || ticks[index - 1].getBoundingClientRect().right <= tick.getBoundingClientRect().left))).toBe(true);
    await workshop.getByRole('button', { name: /Target attainment/ }).click();
    await workshop.getByLabel('Unbound fraction fu').fill('0.6');
    await workshop.getByRole('button', { name: /^MIC/ }).click();
    await workshop.getByLabel('MIC (mg/L)', { exact: true }).fill('2');
    const pending = page.waitForEvent('download');
    await workshop.getByRole('button', { name: 'Export workshop (.json)', exact: true }).click();
    const download = await pending;
    const payload = JSON.parse(await readFile(await download.path(), 'utf8'));
    expect(payload.view).toBe('infection');
    expect(payload.config.mic).toBe(2);
    expect(payload.config.fu).toBe(.6);
    expect(payload.models[0].code).toContain('TV_CL = 8');
    expect(payload.config.exposure).toBe('iv1');
    expect(payload.config.grid.intervals).toEqual([8,12,72]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.evaluate(() => scrollTo(0,0));
    await page.screenshot({ path: `.playwright/infection-site-${width}.png`, fullPage: true });
    await page.getByRole('button', { name: 'General PD', exact: true }).click();
    await expect(workshop).toHaveCount(0);
    await page.getByRole('button', { name: 'Infectiology', exact: true }).click();
    await expect(page.getByLabel('MIC (mg/L)', { exact: true })).toHaveValue('2');
  });
}

test('Shiny bridge, population PTA, reports and stale-state invalidation', async ({ page, context }) => {
  test.skip(!engine, 'Requires the local updated R engine and matching PUBLIC_TDM_ENGINE_URL.');
  test.setTimeout(300000);
  if (['localhost', '127.0.0.1'].includes(new URL(engine).hostname)) {
    await context.route('https://tdmhub.shinyapps.io/**', route => route.abort());
  }
  await page.goto(`${site}/pd/?lang=en`);
  await page.getByRole('button', { name: 'Infectiology', exact: true }).click();
  await page.getByRole('combobox', {name:'PK structure', exact:true}).selectOption('pk');
  const popup = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Open in engine', exact: true }).click();
  const shiny = await popup;
  expect(new URL(shiny.url()).origin).toBe(new URL(engine).origin);
  await expect(page.getByRole('status').filter({ hasText: 'Workshop transferred to engine.' })).toBeVisible({ timeout: 120000 });
  await expect(shiny.locator('#infection-source')).toBeVisible();
  await expect(shiny.locator('#infection-pk-model')).toHaveValue('vanco_pkjust');
  await shiny.locator('#infection-pk-load').click();
  await expect(shiny.locator('#infection-pk-status')).toContainText('Revilla', { timeout: 60000 });
  await expect(shiny.locator('#infection-pk-units')).toContainText('mg/L');
  await shiny.locator('#infection-accept').check();
  await shiny.locator('#infection-simulate').click();
  await expect(shiny.locator('#infection-status')).toContainText('Population PTA', { timeout: 120000 });
  await expect(page.getByTestId('curve-infection_pta')).toBeVisible({timeout: 20000});
  await expect(shiny.locator('#infection-regimens tbody tr')).toHaveCount(7);
  await expect(shiny.locator('.infection-shell .shiny-output-error')).toHaveCount(0);
  const image = shiny.locator('#infection-pta img');
  await expect(image).toBeVisible();
  const colored = await image.evaluate(img => {
    const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) if (Math.max(data[i], data[i+1], data[i+2]) - Math.min(data[i], data[i+1], data[i+2]) > 35) count++;
    return count;
  });
  expect(colored).toBeGreaterThan(300);
  const reportEvent = shiny.waitForEvent('download');
  await shiny.locator('#infection-report').click();
  const report = await reportEvent;
  const html = await readFile(await report.path(), 'utf8');
  expect(html).toContain('data:image/png;base64');
  expect(html).toContain('replicates');
  await shiny.screenshot({ path: '.playwright/infection-shiny-desktop.png', fullPage: true });
  await shiny.setViewportSize({ width: 390, height: 950 });
  const collapse = shiny.locator('.infection-shell .collapse-toggle');
  if (await collapse.getAttribute('aria-expanded') === 'true') await collapse.click();
  await expect(shiny.locator('.infection-shell .sidebar')).toBeHidden();
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate(img => Math.abs(img.naturalWidth - img.parentElement.clientWidth * devicePixelRatio))).toBeLessThan(2);
  expect(await shiny.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await shiny.screenshot({ path: '.playwright/infection-shiny-mobile.png', fullPage: true });
  await shiny.setViewportSize({ width: 1440, height: 950 });
  if (await collapse.getAttribute('aria-expanded') !== 'true') await collapse.click();
  await expect(shiny.locator('.infection-shell .sidebar')).toBeVisible();
  await shiny.locator('#infection-mic').fill('2');
  await shiny.locator('#infection-mic').press('Tab');
  await expect(shiny.locator('#infection-status')).toContainText('No current PTA result.');
  await expect(shiny.locator('#infection-pta img')).toHaveCount(0);
  await expect(page.getByTestId('curve-infection_pta')).toHaveCount(0);
  const pkPanel = shiny.getByRole('button', {name: 'PK / TDM', exact: true});
  if (await pkPanel.getAttribute('aria-expanded') !== 'true') await pkPanel.click();
  await shiny.locator('#infection-pk-estimate').click();
  await expect(shiny.locator('#return_to_pd')).toBeVisible();
  await expect(shiny.locator('#model_id')).toHaveValue('vanco_pkjust');
  await shiny.locator('#return_to_pd').click();
  await expect(shiny.locator('#infection-source input[value="tdm"]')).toBeChecked();
  await expect(shiny.locator('#infection-estimate')).toBeVisible();
});

test('PD tab order and simplified oncology remain usable on mobile', async ({page}) => {
  test.skip(!engine, 'Requires the local R engine.');
  test.setTimeout(180000);
  await page.setViewportSize({width:390,height:950});
  await page.goto(`${engine}/?view=pd&lang=en`);
  const tabs = page.locator('#pd_workspace > li > a');
  await expect(tabs).toHaveText(['General PD','Oncology','Infectiology']);
  await expect(page.locator('#pd_workspace a[data-value="general"]')).toHaveClass(/active/);
  await page.locator('#pd_workspace a[data-value="oncology"]').click();
  await expect(page.locator('#onco-status')).toContainText('Entered parameters', {timeout:120000});
  await expect(page.locator('#onco-toxicity')).not.toBeChecked();
  await page.locator('.onco-shell .mobile-configure-button').click();
  await page.getByRole('button', {name:'PK/PD parameters',exact:true}).click();
  await expect(page.locator('#onco-T0')).toBeVisible({timeout:30000});
  await expect(page.locator('#onco-RES')).toBeHidden();
  await page.locator('#onco-compare').click();
  await expect(page.locator('#onco-metrics')).toContainText('Maintain', {timeout:120000});
  await expect(page.locator('#onco-grid_metrics tbody tr')).toHaveCount(6);
  await expect(page.locator('#onco-candidate')).toHaveValue('candidate_1');
  await page.locator('.onco-shell .collapse-toggle').click();
  await expect(page.locator('.onco-shell .sidebar')).toBeHidden();
  await expect(page.locator('#onco-tumor_plot img')).toBeVisible();
  await expect(page.locator('#onco-anc_plot')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({path:'.playwright/pd-oncology-simple-mobile.png',fullPage:true});
});

for (const width of [390, 1440]) test(`general PD uses PK-driven dual axes and E(C) at ${width}px`, async ({page}) => {
  await page.setViewportSize({width,height:950});
  await page.goto(`${site}/pd/?lang=en`);
  const charts = page.locator('.figures figure');
  await expect(charts).toHaveCount(2);
  const time = page.getByTestId('curve-pd_time');
  const relation = page.getByTestId('curve-pd_relation');
  await expect(time.locator('path.curve')).toHaveCount(2);
  await expect(time.getByTestId('right-axis')).toBeVisible();
  await expect(relation.locator('path.curve')).toHaveCount(1);
  await expect(page.getByLabel('Illustration concentration')).toHaveCount(0);
  const old = await time.locator('[data-series="concentration"]').getAttribute('d');
  await page.getByLabel('Interval (h)',{exact:true}).fill('8');
  await expect(time.locator('[data-series="concentration"]')).not.toHaveAttribute('d',old);
  await page.getByRole('button',{name:'PD',exact:true}).click();
  await page.getByLabel('Effect compartment',{exact:true}).check();
  const effect = await relation.locator('path.curve').getAttribute('d');
  await page.getByRole('combobox',{name:'Response model',exact:true}).selectOption('inhibit_in');
  await expect(relation.locator('path.curve')).not.toHaveAttribute('d',effect);
  const b1=await time.boundingBox(),b2=await relation.boundingBox();
  expect(b2.y).toBeGreaterThan(b1.y+b1.height);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.screenshot({path:`.playwright/pd-dual-${width}.png`,fullPage:true});
});

test('general PD returns the selected free PK simulation from R', async ({page}) => {
  test.skip(!engine, 'Requires updated local R.');
  test.setTimeout(180000);
  await page.goto(`${site}/pd/?lang=en`);
  await page.getByRole('combobox',{name:'PK source',exact:true}).selectOption('pk');
  await expect(page.getByTestId('curve-pd_time')).toHaveCount(0);
  const popup = page.waitForEvent('popup');
  await page.getByRole('button',{name:'Open in engine',exact:true}).click();
  const shiny=await popup;
  await expect(page.getByRole('status').filter({hasText:'Workshop transferred'})).toBeVisible({timeout:120000});
  await shiny.locator('#pd-pk-load').click();
  await expect(shiny.locator('#pd-pk-status')).toContainText('Revilla',{timeout:60000});
  await expect(page.getByTestId('curve-pd_time').locator('path.curve')).toHaveCount(2,{timeout:30000});
  await expect(page.getByTestId('curve-pd_relation').locator('path.curve')).toHaveCount(1);
  await expect(shiny.locator('#pd-effect_plot img')).toBeVisible();
  await shiny.screenshot({path:'.playwright/pd-dual-shiny.png',fullPage:true});
});

test('imported external PK keeps its concentration unit', async ({page}) => {
  test.skip(!engine, 'Requires the local R engine.');
  test.setTimeout(180000);
  await page.goto(`${engine}/?view=pd&lang=en`);
  await expect(page.locator('#pd-status')).toContainText(/./,{timeout:120000});
  const spec = {type:'pk-workbench',version:1,view:'pd',config:{exposure:'pk',type:'emax',regimen:{dose:100,interval:12,infusion:0}},models:[{
    source:'code',route:'IV',time_unit:'h',concentration_scale:.001,
    code:'$PARAM CL=1,V=10\n$CMT CENT\n$ODE dxdt_CENT=-CL/V*CENT;\n$TABLE double CP=CENT/V*1000;\n$CAPTURE CP'
  }]};
  await page.locator('#pd_workshop_file').setInputFiles({name:'synthetic-unit.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(spec))});
  await expect(page.locator('#pd-pk-scale')).toHaveValue('0.001',{timeout:10000});
  await page.locator('#pd-pk-load').click();
  await expect(page.locator('#pd-pk-status')).toContainText('mrgsolve / Lego',{timeout:30000});
  await expect(page.locator('#pd-pk-scale')).toHaveValue('0.001');
});

test('Shiny built-in IV infectiology model simulates without a library selection', async ({page}) => {
  test.skip(!engine, 'Requires the local R engine.');
  test.setTimeout(240000);
  await page.goto(`${engine}/?view=pd&lang=en`);
  await expect(page.locator('#pd-status')).toContainText(/./, {timeout:120000});
  await page.locator('#pd_workspace a[data-value="infection"]').click();
  await expect(page.locator('#infection-pk_mode')).toHaveValue('builtin');
  await expect(page.locator('.infection-shell .model-block')).toHaveCount(3);
  await page.getByText('Advanced simulation', {exact:true}).click();
  await page.locator('#infection-replicates').fill('50');
  await page.locator('#infection-replicates').press('Tab');
  await page.locator('#infection-accept').check();
  await page.locator('#infection-simulate').click();
  await expect(page.locator('#infection-status')).toContainText('Population PTA', {timeout:120000});
  await expect(page.locator('#infection-regimens tbody tr')).toHaveCount(7);
  await expect(page.locator('#infection-pta img')).toBeVisible();
  await expect(page.locator('.shiny-notification-error')).toHaveCount(0);
  await page.screenshot({path:'.playwright/infection-builtin-shiny.png',fullPage:true});
});

test('oncology endpoints use a closed dropdown, including after sorting and adding rows', async ({page}) => {
  test.skip(!engine, 'Requires the local R engine.');
  test.setTimeout(180000);
  await page.goto(`${engine}/?view=pd&lang=fr`);
  await expect(page.locator('#pd-status')).toContainText(/./, {timeout:120000});
  await page.locator('#pd_workspace a[data-value="oncology"]').click();
  await page.getByRole('button',{name:'Observations et ajustement',exact:true}).click();
  const table = page.locator('#onco-observations-table');
  const first = table.locator('tbody tr').first();
  const dropdown = first.getByRole('combobox',{name:'Mesure'});
  await expect(dropdown.locator('option')).toHaveText(['Tumeur','Neutrophiles (ANC)']);
  await expect(dropdown).toHaveValue('tumor');
  await dropdown.selectOption('anc');
  // A subsequent numeric edit forces a redraw from server state.
  const value = first.locator('td').nth(2);
  await value.dblclick();
  await value.locator('input').fill('55');
  await value.locator('input').press('Enter');
  await expect(value).toHaveText('55');
  await expect(dropdown).toHaveValue('anc');
  await table.getByRole('columnheader',{name:/Jour/}).first().click();
  await table.locator('tbody tr').first().getByRole('combobox').selectOption('anc');
  await page.locator('#onco-observations-add').click();
  await expect(table).toContainText('9');
  await table.locator('tbody tr').first().getByRole('combobox').selectOption('tumor');
  await expect(table.locator('tbody tr').first().getByRole('combobox')).toHaveValue('tumor');
  await expect(page.locator('.shiny-notification-error')).toHaveCount(0);
  await page.screenshot({path:'.playwright/onco-endpoint-dropdown.png',fullPage:true});
});
