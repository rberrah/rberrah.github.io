// @ts-nocheck
import { test, expect } from '@playwright/test';

const prefix = process.env.COVARIATES_E2E_PREFIX || '';
for (const width of [1280, 390]) {
  for (const lang of ['fr', 'en']) {
    test(`Covariate methods, exports and lessons ${lang} ${width}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 950 });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${prefix}/covariates/?lang=${lang}`);
      await expect(page.getByRole('heading', { name: lang === 'fr' ? 'Covariables' : 'Covariates', exact: true })).toBeVisible();
      await expect(page.getByTestId('covariate-plot')).toHaveCount(2);
      for (const method of ['transformed', 'groups', 'physiology', 'symbolic']) {
        await page.getByTestId('covariate-method').selectOption(method);
        await expect(page.getByTestId('covariate-clearance')).not.toHaveText(/NaN|Infinity/);
        if (method === 'groups') await expect(page.getByTestId('covariate-plot').first().locator('circle')).toHaveCount(3);
        else await expect(page.getByTestId('covariate-plot').first().locator('path')).not.toHaveAttribute('d', '');
        await expect(page.locator('.implementation code')).toContainText('$OMEGA 0.09');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      }
      await page.getByTestId('covariate-method').selectOption('transformed');
      const before = await page.getByTestId('covariate-clearance').innerText();
      await page.getByTestId('covariate-value').fill('100');
      await expect(page.getByTestId('covariate-clearance')).not.toHaveText(before);
      await page.getByTestId('covariate-value').fill('');
      await expect(page.getByRole('alert')).toBeVisible();
      await expect(page.getByRole('button', { name: /Télécharger le modèle|Download model/ })).toBeDisabled();
      await page.getByTestId('covariate-value').fill('70');
      await page.locator('.implementation select').selectOption('mlxtran');
      await expect(page.locator('.implementation code')).toContainText('Cl = Cl0 * factor');
      const download = page.waitForEvent('download');
      await page.getByRole('button', { name: /Télécharger le modèle|Download model/ }).click();
      expect((await download).suggestedFilename()).toBe('covariates-transformed.txt');
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: testInfo.outputPath(`covariates-${lang}-${width}.png`), fullPage: true });
      await expect(page.locator('#courses li a')).toHaveCount(5);
      await page.locator('#courses li a').first().click();
      await expect(page.getByRole('heading', { level: 1 })).toContainText(/ETA/);
      await page.goto(`${prefix}/chapitres/?lang=${lang}`);
      await expect(page.getByTestId('track-section-covariates').getByTestId('chapter-card')).toHaveCount(5);
      await page.goto(`${prefix}/covariates/?lang=${lang}`);
      const code = await page.locator('.implementation code').innerText();
      await page.getByRole('button', { name: /Utiliser ce mod.*le en PD|Use this model in PD/ }).click();
      await expect(page.getByTestId('pd-workbench')).toBeVisible();
      await expect(page.locator('textarea').first()).toHaveValue(code);
      expect(errors).toEqual([]);
    });
  }
}
