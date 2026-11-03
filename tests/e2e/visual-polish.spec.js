// @ts-nocheck
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

for (const lang of ['fr', 'en']) {
  test(`chapter visual polish and scientific clarity — ${lang}`, async ({ page }) => {
    test.setTimeout(70_000);
    await page.setViewportSize({ width: 390, height: 844 });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    // The ADME body has a continuous silhouette and four labelled,
    // keyboard-accessible regions, with a text explanation for each stage.
    await page.goto(`/chapitres/pourquoi-pharmacometrie/?lang=${lang}`);
    const adme = page.locator('.step[data-index="1"] .viz-inline');
    await expect(adme.locator('svg.body')).toBeVisible();
    await expect(adme.locator('.silhouette')).toHaveCount(3);
    await expect(adme.locator('circle.hot')).toHaveCount(4);
    const liver = adme.locator('.zone-list button').filter({ hasText: lang === 'en' ? 'Metabolism' : 'Métabolisme' });
    await liver.click();
    await expect(adme.getByRole('status')).toContainText(lang === 'en' ? 'liver' : 'foie');
    const firstHotspot = adme.locator('circle.hot').first();
    await firstHotspot.focus();
    await expect(firstHotspot).toHaveAttribute('aria-pressed', 'true');

    await page.goto(`/chapitres/clairance-volume-demi-vie/?lang=${lang}`);
    const intuition = page.locator('.step[data-index="1"] .viz-inline');
    await expect(intuition.locator('.tank-svg')).toBeVisible();
    const time = intuition.locator('label.slider').filter({ hasText: lang === 'en' ? 'Time (h)' : 'Temps (h)' });
    await expect(time.locator('strong')).toHaveText(/^0\.0$/);
    await intuition.getByRole('button', { name: lang === 'en' ? 'Play' : 'Lecture' }).click();
    await expect.poll(async () => Number(await time.locator('strong').innerText()), { timeout: 8000 }).toBeGreaterThan(0);
    await expect(time.locator('strong')).toHaveText(/^\d{1,2}\.\d$/);
    await intuition.getByRole('button', { name: /Pause/ }).click();

    const two = page.locator('.step[data-index="4"] .viz-inline');
    await two.scrollIntoViewIfNeeded();
    const chart = two.locator('svg.chart');
    await expect(chart).toBeVisible();
    const tickLabels = await chart.locator('.ytick').allTextContents();
    expect(tickLabels).toEqual(['0.01', '0.05', '0.1', '0.5', '1', '5', '10']);
    const tickYs = await chart.locator('.ytick').evaluateAll((ticks) => ticks.map((tick) => Number(tick.getAttribute('y'))));
    for (let i = 1; i < tickYs.length; i++) expect(Math.abs(tickYs[i] - tickYs[i - 1])).toBeGreaterThanOrEqual(22);
    // At different dose/central volume, ticks remain readable and inside the axis.
    await two.locator('.controls input[type="range"]').first().focus();
    await page.keyboard.press('End');
    await two.locator('.controls input[type="range"]').nth(3).focus();
    await page.keyboard.press('Home');
    const rescaled = await chart.locator('.ytick').allTextContents();
    expect(rescaled.length).toBeGreaterThan(2);
    expect(rescaled).not.toContain('0.00');

    expect(errors).toEqual([]);
  });
}

test('one-compartment course teaches the concentration ODE in both languages', () => {
  for (const folder of ['', 'en/']) {
    const raw = readFileSync(new URL(`../../src/content/chapters/${folder}03_modele-compartimental.md`, import.meta.url), 'utf8');
    expect(raw).toContain(String.raw`\frac{dC(t)}{dt} = -\frac{CL}{V}\,C(t)`);
    expect(raw).not.toContain(String.raw`\frac{dA}{dt} = -\frac{CL}{V}\,A`);
  }
});
