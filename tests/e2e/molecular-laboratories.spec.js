// @ts-nocheck - browser runner types are separate from the application check.
import { test, expect } from '@playwright/test';

const origin = process.env.LABS_E2E_URL || '';
const url = path => origin + path;
const labs = ['parent-metabolite', 'long-acting', 'saturable', 'enterohepatic', 'tmdd', 'effect-site', 'pd-general', 'pd-oncology', 'pd-infectiology'];

test.setTimeout(90000);
test.beforeEach(async ({ page }) => {
  page.errors = [];
  page.on('pageerror', error => page.errors.push(error.message));
});
test.afterEach(async ({ page }) => expect(page.errors).toEqual([]));

async function open(page, lab, language = 'en') {
  await page.goto(url(`/laboratoires/?lang=${language}&lab=${lab}`));
  await expect(page.getByTestId('molecular-laboratory')).toBeVisible({ timeout: 45000 });
  await expect(page.getByTestId('molecular-scene')).toBeVisible();
  await expect(page.getByTestId('molecular-plot')).toBeVisible();
  await page.waitForFunction(() => document.querySelector('[data-testid="molecular-scene"]')?.width > 100);
}

async function coloredPixels(canvas) {
  return canvas.evaluate(node => {
    const data = node.getContext('2d').getImageData(0, 0, node.width, node.height).data;
    let colored = 0, sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 210 || data[i + 1] < 210 || data[i + 2] < 210) colored++;
      sum = (sum + data[i] * (i % 997 + 1)) % 1000000007;
    }
    return { colored, sum };
  });
}

test('all nine animated journeys render a nonblank model', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const lab of labs) {
    await open(page, lab);
    await expect(page.getByRole('heading', { level: 1 })).not.toBeEmpty();
    expect((await coloredPixels(page.getByTestId('molecular-scene'))).colored).toBeGreaterThan(1000);
    expect((await coloredPixels(page.getByTestId('molecular-plot'))).colored).toBeGreaterThan(500);
    await expect(page.getByLabel('Animate particles')).toBeChecked();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    if (lab === 'tmdd') await page.screenshot({ path: 'test-results/molecular-laboratory-desktop.png', fullPage: true });
  }
});

test('PD journeys expose their mechanism-specific comparison and metric', async ({ page }) => {
  await open(page, 'pd-oncology');
  await expect(page.locator('.plot-legend')).toContainText('With treatment: solid');
  await expect(page.locator('.plot-legend')).toContainText('Without treatment: dashed');
  await expect(page.getByRole('button', { name: 'Use this model as reference' })).toHaveCount(0);
  await page.getByTestId('molecular-time').fill('84');
  await expect(page.locator('.metrics')).toContainText('Tumor change from baseline');
  await page.screenshot({ path: 'test-results/pd-oncology-laboratory-desktop.png', fullPage: true });

  await open(page, 'pd-infectiology');
  await page.getByTestId('molecular-time').fill('12');
  await expect(page.locator('.metrics')).toContainText('Time above MIC');
  await expect(page.locator('.equations')).toHaveCount(0);
});

test('play, parameters, reference, model view and scenario sharing work', async ({ page }) => {
  await open(page, 'saturable');
  const initial = await page.getByTestId('molecular-concentration').innerText();
  await page.locator('#molecular-dose').fill('900');
  await expect(page.getByTestId('molecular-concentration')).not.toHaveText(initial);
  await page.getByRole('button', { name: 'Use this model as reference' }).click();
  await page.getByRole('button', { name: 'Equations' }).click();
  await expect(page.locator('.equations')).toContainText('Vmax');
  const beforePlay = await coloredPixels(page.getByTestId('molecular-scene'));
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect.poll(async () => Number(await page.getByTestId('molecular-time').inputValue())).toBeGreaterThan(.2);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  expect((await coloredPixels(page.getByTestId('molecular-scene'))).sum).not.toBe(beforePlay.sum);
  await page.getByRole('button', { name: 'Share scenario' }).click();
  const shared = await page.getByLabel('Synthetic scenario link').inputValue();
  expect(shared).toContain('lab=saturable');
  expect(shared).toContain('dose=900');
  await page.goto(shared);
  await expect(page.locator('#molecular-dose')).toHaveValue('900');
});

test('French mobile layouts remain readable for dense mechanisms', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  for (const lab of ['enterohepatic', 'tmdd', 'effect-site', 'pd-general', 'pd-oncology', 'pd-infectiology']) {
    await open(page, lab, 'fr');
    await page.getByTestId('molecular-time').fill(lab === 'tmdd' ? '24' : '4');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect((await coloredPixels(page.getByTestId('molecular-scene'))).colored).toBeGreaterThan(500);
  }
  await page.screenshot({ path: 'test-results/molecular-laboratory-mobile.png', fullPage: true });
});
