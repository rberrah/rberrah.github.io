// @ts-nocheck
import { test, expect } from '@playwright/test';

const prefix = process.env.COVARIATES_E2E_PREFIX || '';
const lessons = ['basics', 'groups', 'physiology', 'symbolic', 'implementation'];
for (const width of [1280, 390]) for (const lang of ['fr', 'en']) for (const lesson of lessons) {
  test(`Covariate lesson ${lesson} ${lang} ${width}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 950 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${prefix}/chapitres/covariates-${lesson}/?lang=${lang}`);
    const panel = page.getByTestId('covariate-lesson').first();
    await expect(panel).toHaveAttribute('data-lesson', lesson);
    await panel.scrollIntoViewIfNeeded();
    const play = panel.getByTestId('covariate-play');
    await expect(play).toBeEnabled();
    await expect(panel.getByTestId('covariate-plot')).toHaveAccessibleName(lang === 'en' ? 'Covariate → parameter' : 'Covariable → paramètre');
    const cursor = panel.getByTestId('covariate-cursor');
    const initial = await cursor.getAttribute('cx');
    await play.click();
    await expect(play).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => cursor.getAttribute('cx')).not.toBe(initial);
    await play.click();
    await expect(play).toHaveAttribute('aria-pressed', 'false');
    const paused = await cursor.getAttribute('cx');
    await page.waitForTimeout(150);
    expect(await cursor.getAttribute('cx')).toBe(paused);
    await panel.getByRole('button', { name: /Réinitialiser|Reset/ }).click();

    if (lesson === 'basics') {
      const path = panel.locator('svg path').first();
      const before = await path.getAttribute('d');
      await panel.getByTestId('lesson-beta').fill('0');
      await expect(path).not.toHaveAttribute('d', before);
      await panel.getByTestId('lesson-omega').fill('0');
      const values = await panel.locator('svg circle').evaluateAll(nodes => nodes.slice(0, -1).map(n => n.getAttribute('cy')));
      expect(new Set(values).size).toBe(1);
      await panel.getByTestId('lesson-beta').fill('');
      await expect(panel.getByRole('alert')).toBeVisible();
      await expect(play).toBeDisabled();
      await panel.getByTestId('lesson-beta').fill('0.75');
    } else if (lesson === 'groups') {
      await panel.getByTestId('covariate-grouping').selectOption('threshold');
      await panel.getByTestId('lesson-covariate-value').fill('59.9');
      await expect(panel.getByTestId('covariate-reading')).toContainText('2.80 L/h');
      await panel.getByTestId('lesson-covariate-value').fill('60');
      await expect(panel.getByTestId('covariate-reading')).toContainText('4.00 L/h');
    } else if (lesson === 'physiology') {
      await panel.getByTestId('lesson-half').fill('60');
      await panel.getByTestId('lesson-covariate-value').fill('60');
      await expect(panel.getByTestId('covariate-reading')).toContainText('2.00 L/h');
    } else if (lesson === 'symbolic') {
      await expect(panel.locator('svg circle')).toHaveCount(43);
      await expect(panel.getByTestId('covariate-domain-status')).toContainText('40–90 kg');
      await panel.getByTestId('lesson-show-patients').uncheck();
      await expect(panel.locator('svg circle')).toHaveCount(1);
      await panel.getByTestId('lesson-show-patients').check();
      await expect(panel.locator('svg circle')).toHaveCount(43);
      for (const weight of ['20', '200']) {
        await panel.getByTestId('lesson-covariate-value').fill(weight);
        await expect(panel.getByTestId('covariate-domain-status')).toContainText(/extrapolation/i);
      }
      for (const weight of ['40', '90']) {
        await panel.getByTestId('lesson-covariate-value').fill(weight);
        await expect(panel.getByTestId('covariate-domain-status')).not.toContainText(/extrapolation/i);
      }
      await panel.getByTestId('lesson-covariate-value').fill('60');
      await panel.getByTestId('lesson-approximation').selectOption('full');
      await expect(panel.getByTestId('symbolic-error')).toContainText('0.00 %');
      await panel.getByTestId('lesson-approximation').selectOption('linear');
      await expect(panel.getByTestId('symbolic-error')).not.toContainText('0.00 %');
    } else {
      await panel.getByTestId('lesson-genotype').selectOption('1');
      await expect(panel.getByTestId('covariate-reading')).toContainText('5.20 L/h');
      await panel.getByTestId('lesson-parameter').selectOption('V');
      await expect(panel.getByTestId('covariate-reading')).toContainText('30.00 L');
      await panel.getByTestId('lesson-genotype').selectOption('0');
      await expect(panel.getByTestId('covariate-reading')).toContainText('30.00 L');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await panel.screenshot({ path: testInfo.outputPath(`${lesson}-${lang}-${width}.png`) });
    expect(errors).toEqual([]);
  });
}

test('Covariate lessons respect reduced motion and remain adjustable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto(`${prefix}/chapitres/covariates-basics/?lang=en`);
  const panel = page.getByTestId('covariate-lesson').first();
  await expect(panel.getByTestId('covariate-play')).toBeDisabled();
  await panel.getByTestId('lesson-covariate-value').fill('70');
  await expect(panel.getByTestId('covariate-reading')).toContainText('4.00 L/h');
});
