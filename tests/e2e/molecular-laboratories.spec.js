// @ts-nocheck - browser runner types are separate from the application check.
import { test, expect } from '@playwright/test';

const origin = process.env.LABS_E2E_URL || '';
const url = path => origin + path;
const labs = ['covariate-volume', 'covariate-clearance', 'parent-metabolite', 'long-acting', 'saturable', 'enterohepatic', 'effect-site', 'pd-general', 'pd-infectiology', 'pd-oncology', 'tmdd'];

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
  await page.getByTestId('molecular-learning-free').click();
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

async function dragDirectControl(page, xFraction, yFraction) {
  const canvas = page.getByTestId('molecular-scene'), box = await canvas.boundingBox();
  const logicalWidth = Number(await canvas.getAttribute('data-scene-width')), logicalHeight = Number(await canvas.getAttribute('data-scene-height'));
  const startX = Number(await canvas.getAttribute('data-control-x')) * box.width / logicalWidth, startY = Number(await canvas.getAttribute('data-control-y')) * box.height / logicalHeight, axis = await canvas.getAttribute('data-control-axis');
  expect(box).not.toBeNull(); expect(startX).toBeGreaterThan(0); expect(startY).toBeGreaterThan(0);
  await page.mouse.move(box.x + startX, box.y + startY);
  await page.mouse.down();
  await page.mouse.move(box.x + (axis === 'vertical' ? startX : box.width * xFraction), box.y + (axis === 'horizontal' ? startY : box.height * yFraction), { steps: 8 });
  await page.mouse.up();
}

test('molecular discovery mode exposes one mechanism before free exploration', async ({ page }) => {
  await page.goto(url('/laboratoires/?lang=en&lab=pd-general'));
  await expect(page.getByTestId('molecular-laboratory')).toBeVisible({ timeout: 45000 });
  await expect(page.getByTestId('molecular-learning-guided')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.numbers input:visible, .numbers select:visible')).toHaveCount(1);
  await expect(page.locator('#molecular-model')).toBeVisible();
  await page.getByTestId('molecular-learning-free').click();
  expect(await page.locator('.numbers input:visible, .numbers select:visible').count()).toBeGreaterThan(1);
  await page.getByRole('button', { name: 'Show the scientific debrief' }).click();
  await expect(page.locator('.debrief')).toBeVisible();
});

test('all eleven animated journeys render a nonblank model', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const lab of labs) {
    await open(page, lab);
    await expect(page.getByRole('heading', { level: 1 })).not.toBeEmpty();
    expect((await coloredPixels(page.getByTestId('molecular-scene'))).colored).toBeGreaterThan(1000);
    expect((await coloredPixels(page.getByTestId('molecular-plot'))).colored).toBeGreaterThan(500);
    await expect(page.getByTestId('molecular-scene')).toHaveAttribute('data-direct-key', /.+/);
    await expect(page.getByLabel('Animate particles')).toBeChecked();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    if (lab === 'tmdd') await page.screenshot({ path: 'test-results/molecular-laboratory-desktop.png', fullPage: true });
  }
});

test('objects in the scene directly update synchronized model parameters', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 850 });

  await open(page, 'pd-infectiology');
  await expect(page.getByTestId('molecular-scene')).toHaveAttribute('data-direct-key', 'mic');
  await page.getByTestId('molecular-time').fill('4');
  const trajectoryBefore = await coloredPixels(page.getByTestId('molecular-plot'));
  await dragDirectControl(page, .24, .24);
  expect(Number(await page.locator('#molecular-mic').inputValue())).toBeGreaterThan(2);
  await expect(page.getByTestId('molecular-time')).toHaveValue('4.0');
  expect((await coloredPixels(page.getByTestId('molecular-plot'))).sum).not.toBe(trajectoryBefore.sum);

  await open(page, 'covariate-volume');
  await dragDirectControl(page, .26, .4);
  expect(Number(await page.locator('#molecular-weight').inputValue())).toBeGreaterThan(100);

  await open(page, 'covariate-clearance');
  await dragDirectControl(page, .88, .4);
  expect(Number(await page.locator('#molecular-gfr').inputValue())).toBeGreaterThan(100);

  await open(page, 'pd-oncology');
  await dragDirectControl(page, .7, .68);
  expect(Number(await page.locator('#molecular-resistance').inputValue())).toBeGreaterThan(.06);

  await open(page, 'pd-general');
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect.poll(async () => Number(await page.getByTestId('molecular-time').inputValue())).toBeGreaterThan(.1);
  await page.locator('#molecular-dose').fill('700');
  expect(Number(await page.locator('#molecular-dose').inputValue())).toBeGreaterThan(500);
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
});

test('desktop keeps the trajectory beside the interactive scene', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await open(page, 'tmdd');
  const scene = await page.getByTestId('molecular-scene').boundingBox(), plot = await page.getByTestId('molecular-plot').boundingBox();
  expect(scene).not.toBeNull(); expect(plot).not.toBeNull();
  expect(plot.x).toBeGreaterThan(scene.x + scene.width * .8);
  expect(Math.abs(plot.y - scene.y)).toBeLessThan(12);
  const options = page.getByLabel('Interactive laboratory').locator('option');
  await expect(options).toHaveCount(15);
  expect(await options.evaluateAll(nodes => nodes.map(node => `${node.value}:${node.textContent.trim().slice(0, 2)}`))).toEqual([
    'distribution:01', 'accumulation:02', 'absorption:03', 'infusion:04', 'covariate-volume:05', 'covariate-clearance:06', 'parent-metabolite:07', 'long-acting:08', 'saturable:09', 'enterohepatic:10', 'effect-site:11', 'pd-general:12', 'pd-infectiology:13', 'pd-oncology:14', 'tmdd:15'
  ]);
});

test('covariate journeys use one concentration curve', async ({ page }) => {
  for (const lab of ['covariate-volume', 'covariate-clearance']) {
    await open(page, lab);
    await expect(page.getByTestId('molecular-plot')).toHaveAttribute('data-plot-mode', 'primary');
    await expect(page.locator('.metrics > div')).toHaveCount(2);
  }
});

test('PD journeys expose their mechanism-specific comparison and metric', async ({ page }) => {
  await open(page, 'pd-oncology');
  await expect(page.locator('.plot-legend')).toContainText('With treatment: solid');
  await expect(page.locator('.plot-legend')).toContainText('Without treatment: dashed');
  await expect(page.getByRole('button', { name: 'Use this model as reference' })).toHaveCount(0);
  await page.getByTestId('molecular-time').fill('84');
  await expect(page.locator('.metrics')).toContainText('Resistant cell fraction');
  await page.screenshot({ path: 'test-results/pd-oncology-laboratory-desktop.png', fullPage: true });
  await page.getByTestId('molecular-time').fill('42');
  const cellsBefore = await coloredPixels(page.getByTestId('molecular-scene'));
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect.poll(async () => Number(await page.getByTestId('molecular-time').inputValue())).toBeGreaterThan(42.1);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  expect((await coloredPixels(page.getByTestId('molecular-scene'))).sum).not.toBe(cellsBefore.sum);

  await open(page, 'pd-infectiology');
  await page.getByTestId('molecular-time').fill('12');
  await expect(page.locator('.metrics')).toContainText('Time above MIC');
  const burden = Number(await page.locator('.metrics strong').nth(1).innerText());
  await page.locator('#molecular-growth').fill('0.4');
  await expect.poll(async () => Number(await page.locator('.metrics strong').nth(1).innerText())).toBeGreaterThan(burden);
  await expect(page.locator('.equations')).toHaveCount(0);

  await open(page, 'pd-general');
  await page.locator('#molecular-model').selectOption('1');
  await expect(page.locator('#molecular-model')).toHaveValue('1');
});

test('specialized mechanism scenes remain visually distinct', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 800 });
  const scenes = {
    'parent-metabolite': 4,
    'long-acting': 21,
    saturable: 2,
    enterohepatic: 16,
    tmdd: 12,
    'effect-site': 4,
    'pd-general': 4,
    'pd-oncology': 42,
    'pd-infectiology': 4,
    'covariate-volume': 3,
    'covariate-clearance': 4
  };

  for (const [lab, time] of Object.entries(scenes)) {
    await open(page, lab);
    await page.getByTestId('molecular-time').fill(String(time));
    await page.getByTestId('molecular-scene').screenshot({ path: `test-results/scene-${lab}.png` });
  }
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
  for (const lab of ['enterohepatic', 'saturable', 'tmdd', 'effect-site', 'pd-general', 'pd-oncology', 'pd-infectiology', 'covariate-volume', 'covariate-clearance']) {
    await open(page, lab, 'fr');
    await page.getByTestId('molecular-time').fill(lab === 'tmdd' ? '24' : '4');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect((await coloredPixels(page.getByTestId('molecular-scene'))).colored).toBeGreaterThan(500);
    if (['saturable', 'tmdd', 'pd-general', 'pd-oncology', 'pd-infectiology', 'covariate-volume', 'covariate-clearance'].includes(lab)) await page.getByTestId('molecular-scene').screenshot({ path: `test-results/scene-${lab}-mobile.png` });
  }
  await page.screenshot({ path: 'test-results/molecular-laboratory-mobile.png', fullPage: true });
});
