// @ts-nocheck
import { test, expect } from '@playwright/test';

const code = `library(Pmetrics)
mod2 <- PM_model$new(
  pri = list(
    Ka = ab(0.1, 0.9), Ke = ab(0.001, 0.1), K23 = ab(0, 5),
    K32 = ab(0, 5), V0 = ab(30, 120), lag1 = ab(0, 4)
  ),
  cov = list(
    wt = interp(), africa = interp("none"), age = interp(),
    gender = interp("none"), height = interp()
  ),
  eqn = function(){ two_comp_bolus },
  lag = function(){ lag[1] = lag1 },
  out = function(){
    V = V0 * (wt/70)
    Y[1] = X[2]/V
  },
  err = list(proportional(5, c(0.02, 0.05, -0.0002, 0)))
)`;

for (const width of [1280, 390]) {
  test(`Pmetrics import, native export and guard at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/translator/?lang=en');
    await page.waitForLoadState('networkidle');
    const importer = page.locator('.mlxtran-import');
    await importer.getByRole('tab', { name: 'Pmetrics', exact: true }).click({ force: true });
    await importer.locator('textarea').fill(code);
    await importer.locator('.import-button').click();
    await expect(importer.locator('.import-status')).toContainText(/Structure reconnue|Structure recognized/);
    await expect(importer.locator('.import-status')).toContainText(/Import structurel uniquement|Structural import only/);
    await expect(page.locator('.canvas .node')).toHaveCount(3);
    await expect(page.locator('.chart .serie').first()).not.toHaveAttribute('d', '');
    await expect(page.locator('.tdm-launch')).toBeEnabled();
    await expect(page.locator('.codehead').getByRole('tab', { name: 'Pmetrics', exact: true })).toHaveAttribute('aria-selected', 'true');
    const exported = await page.locator('pre.codeblk code').innerText();
    expect(exported).toContain('pmetrics_definition <- list(');
    expect(exported).toContain('interp("none")');
    expect(exported).toContain('err = NULL');
    const withoutMetadata = exported.replace(/^# PK_LEGO_(?:SPEC|BODY)_V1:[^\n]*\n/gm, '');
    await importer.locator('input[type=file]').setInputFiles({ name: 'model.R', mimeType: 'text/plain', buffer: Buffer.from(withoutMetadata) });
    await importer.locator('.import-button').click();
    await expect(importer.locator('.import-status')).toContainText(/Structure reconnue|Structure recognized/);
    await expect(page.locator('.canvas .node')).toHaveCount(3);
    await page.locator('.canvas').scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`pmetrics-${width}.png`) });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await importer.locator('textarea').fill(code.replace('two_comp_bolus', 'unsupported_library_model'));
    await importer.locator('.import-button').click();
    await expect(importer.locator('.import-status.error')).toBeVisible();
    await expect(page.locator('.canvas .node')).toHaveCount(3);
    expect(errors).toEqual([]);
  });
}
