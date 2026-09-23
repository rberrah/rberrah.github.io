import { test, expect } from '@playwright/test';
// @ts-expect-error Node test runtime.
import { mkdir, writeFile } from 'node:fs/promises';

/** @param {import('@playwright/test').Page} page @param {string} language */
async function exported(page, language) {
  await page.locator('.codehead').getByRole('tab', { name: language, exact: true }).click();
  return page.locator('pre.codeblk code').innerText();
}

test('Advanced exports real coupled PK, Ce, TGI and interaction equations in every language', async ({ page }) => {
  await page.goto('/advanced/?lang=en');
  await page.getByTestId('preset-autoinhibition').click();
  await expect(page.locator('.canvas .node')).toHaveCount(4);
  await expect(page.getByTestId('effect-link')).toHaveCount(3);
  await expect(page.getByTestId('modifier-link')).toHaveCount(1);
  await expect(page.locator('.tdm-launch')).toBeEnabled();
  await mkdir('test-results/advanced-native', { recursive: true });
  const code = await exported(page, 'mrgsolve');
  expect(code).toContain('dxdt_TGI');
  expect(code).toContain('SOLVERTIME');
  expect(code).toContain('fmax(0.01,DDI)');
  const original = JSON.parse(decodeURIComponent(code.match(/PK_LEGO_SPEC_V1:([^\r\n]+)/)?.[1] ?? ''));
  expect(original.version).toBe(4);
  await writeFile('test-results/advanced-native/composed.cpp', code);
  await writeFile('test-results/advanced-native/composed-preview.json', JSON.stringify(await page.locator('.chart-legend output').evaluateAll(outputs => outputs.map(o => ({id: Number(o.getAttribute('data-node')), value: Number(o.getAttribute('data-value'))})))));
  for (const language of ['mrgsolve', 'MLXTRAN', 'NONMEM']) {
    const source = await exported(page, language);
    expect(source).not.toContain('undefined');
    expect(source).not.toContain('NaN');
    if (language === 'NONMEM') {
      expect(source).toMatch(/DADT\(3\)=.+EXP\(-P\d+\*T\)/);
      expect(source).toMatch(/A_0\(3\)=P\d+/);
      expect(source.split('$DES')[1].split('$ERROR')[0]).not.toMatch(/\b(?:cl|kg|kill|res)_/);
    }
    await writeFile(`test-results/advanced-native/composed.${language === 'mrgsolve' ? 'cpp' : language === 'MLXTRAN' ? 'txt' : 'ctl'}`, source);
    await page.getByTestId('workshop-nav').getByRole('link', { name: 'Model Translator', exact: true }).click();
    await page.locator('.mlxtran-import').getByRole('tab', { name: language, exact: true }).click();
    await page.locator('.mlxtran-import textarea').fill(source);
    await page.getByRole('button', { name: 'Build the diagram', exact: true }).click();
    await expect(page.locator('.import-status.ok')).toBeVisible();
    const restored = await exported(page, 'mrgsolve');
    expect(JSON.parse(decodeURIComponent(restored.match(/PK_LEGO_SPEC_V1:([^\r\n]+)/)?.[1] ?? ''))).toEqual(original);
    await page.getByTestId('workshop-nav').getByRole('link', { name: 'Advanced Builder', exact: true }).click();
  }
  await page.locator('.canvas .node').filter({ hasText: 'TGI' }).click();
  const before = await page.locator('.chart .serie').nth(2).getAttribute('d');
  await page.getByLabel('KILL (1/h)', { exact: true }).fill('0');
  expect(await page.locator('.chart .serie').nth(2).getAttribute('d')).not.toBe(before);
  await page.getByLabel('KILL (1/h)', { exact: true }).fill('0.02');
  await page.screenshot({ path: 'test-results/advanced-coupled-desktop.png', fullPage: true });
  await page.locator('.canvas .node').filter({ hasText: 'DDI' }).click();
  await page.getByRole('combobox', { name: 'Source', exact: true }).selectOption({label: 'Ce'});
  for (const mechanism of ['factor','reversible','inhibition','hill_inhibition','induction','tdi','turnover_induction']) {
    await page.getByRole('combobox', { name: 'Mechanism', exact: true }).selectOption(mechanism);
    await expect(page.locator('.tdm-launch')).toBeEnabled();
    await writeFile(`test-results/advanced-native/${mechanism}.cpp`, await exported(page, 'mrgsolve'));
  }
  await page.getByTestId('preset-autoinhibition').click();
  await page.locator('.canvas').getByRole('button', { name: 'Ce Effect (ke0)', exact: true }).click();
  await page.locator('.editor').getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(page.locator('.graph-error')).toBeVisible();
  await expect(page.locator('.tdm-launch')).toBeDisabled();
});

test('specialized workshops have one selector per mechanism and an actual IV PK default', async ({ page, context }) => {
  await context.route(url => url.searchParams.get('bridge') === 'workbench', route => route.fulfill({
    contentType: 'text/html', body: '<script>window.addEventListener("message", e => {window.payload=e.data; e.source.postMessage({type:"pk-workbench-ack",id:e.data.id,ok:true},e.origin)})</script>'
  }));
  await page.goto('/pd/?lang=en');
  await expect(page.locator('.palette')).toHaveCount(0);
  await page.getByRole('button', { name: 'Oncology', exact: true }).click();
  await page.getByRole('navigation', { name: 'PD settings' }).getByRole('button', { name: 'PD', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Tumor growth', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Gompertz', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'General PD', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'PK source', exact: true })).toHaveValue('iv1');
  await page.getByLabel('V (L)', { exact: true }).fill('20');
  await page.getByLabel('CL (L/h)', { exact: true }).fill('2');
  await page.getByLabel('Dose (mg)', { exact: true }).fill('200');
  const pending = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Open in engine', exact: true }).click();
  const popup = await pending;
  await expect.poll(() => popup.evaluate(() => /** @type {any} */(window).payload?.config?.exposure)).toBe('pk');
  const payload = await popup.evaluate(() => /** @type {any} */(window).payload);
  expect(payload.models[0].route).toBe('IV');
  expect(payload.models[0].code).toContain('TV_V = 20, TV_CL = 2');
  expect(payload.config.regimen.dose).toBe(200);
  await mkdir('test-results/advanced-native', { recursive: true });
  await writeFile('test-results/advanced-native/basic-iv.cpp', payload.models[0].code);
  await popup.close();
  await page.goto('/ddi/?lang=en');
  await expect(page.locator('.palette')).toHaveCount(0);
  await page.getByRole('button', { name: 'Interaction', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Mechanism', exact: true }).locator('option')).toHaveCount(7);
});

test('Advanced diagram and inspector fit on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/advanced/?lang=fr');
  await page.getByTestId('preset-autoinhibition').click();
  await page.locator('.canvas .node').filter({ hasText: 'DDI' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const paths = await page.locator('.chart .serie').evaluateAll(paths => paths.map(p => p.getAttribute('d')));
  expect(paths.length).toBe(5);
  for (const path of paths) expect(path).not.toMatch(/NaN|Infinity/);
  await page.screenshot({ path: 'test-results/advanced-coupled-mobile.png', fullPage: true });
});

test('Advanced v4 is regenerated and compiled by the local TDM engine', async ({ page, context }) => {
  test.skip(!/** @type {any} */ (globalThis).process?.env?.TDM_ENGINE_E2E_URL, 'Requires the local Shiny engine.');
  test.setTimeout(120000);
  await context.route('https://tdmhub.shinyapps.io/**', route => route.abort());
  await page.goto('/advanced/?lang=en');
  await page.getByTestId('preset-autoinhibition').click();
  const pending = page.waitForEvent('popup');
  await page.locator('.tdm-launch').click();
  const engine = await pending;
  await expect(engine.locator('#custom_code')).toHaveValue(/dxdt_L3_TGI/, {timeout:45000});
  await expect(engine.locator('#custom_code')).toHaveValue(/MOD_L\d+_DDI/);
  await engine.locator('#validate_model').click();
  await expect(engine.locator('#model_contract')).toContainText('Valid mapbayr contract', {timeout:45000});
  await expect(engine.locator('.shiny-notification-error')).toHaveCount(0);
  await engine.close();
});
