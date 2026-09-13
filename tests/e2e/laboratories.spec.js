// @ts-nocheck - browser runner types are separate from the application check.
import { test, expect } from '@playwright/test';
import { sceneLayout } from '../../src/lib/labs/particles.js';
const origin = process.env.LABS_E2E_URL || '';
const url = (path = '/laboratoires/?lang=en') => origin + path;
test.setTimeout(90000);
test.beforeEach(async ({ page }) => {
  page.errors = [];
  page.on('pageerror', error => page.errors.push(error.message));
});
test.afterEach(async ({ page }) => { expect(page.errors).toEqual([]); });

async function open(page, path) {
  await page.goto(url(path));
  await expect(page.getByTestId('laboratory')).toHaveAttribute('data-ready', 'true', { timeout: 45000 });
  await expect(page.getByTestId('lab-scene')).toBeVisible();
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-scene"]')?.width > 100);
}
async function pixels(canvas) {
  return canvas.evaluate(node => {
    const data = node.getContext('2d').getImageData(0, 0, node.width, node.height).data;
    let colored = 0, sum = 0;
    for (let i = 0; i < data.length; i += 4) { if (data[i] < 180 && data[i + 1] < 200) colored++; sum = (sum + data[i] * (i % 997 + 1)) % 1000000007; }
    return { colored, sum };
  });
}
test('distribution, reference, time animation and dose schedule', async ({ page }) => {
  await open(page);
  await expect(page.getByTestId('lab-concentration')).toHaveText('10.00');
  const scene = page.getByTestId('lab-scene'), plot = page.getByTestId('lab-plot');
  const start = await pixels(scene); expect(start.colored).toBeGreaterThan(500);
  expect((await pixels(plot)).colored).toBeGreaterThan(400);
  await page.getByTestId('lab-time').fill('2');
  await expect(page.getByTestId('lab-concentration')).not.toHaveText('10.00');
  expect((await pixels(scene)).sum).not.toBe(start.sum);
  const concentration = await page.getByTestId('lab-concentration').innerText();
  await expect(page.getByRole('button', { name: 'Simulated case' })).toHaveCount(0);
  await page.locator('#lab-cl').fill('9');
  await page.getByRole('button', { name: 'Use this model as the new reference' }).click();
  await page.locator('#lab-cl').fill('6');
  await page.getByText('Reference parameters', { exact: true }).click();
  await expect(page.locator('.parameters dl div').filter({ hasText: 'CL (L/h)' }).locator('dd')).toHaveText('9');
  await page.locator('#lab-end').fill('12');
  await expect(page.getByRole('slider', { name: 'Simulation time' })).toHaveAttribute('max', '12');
  await page.locator('#lab-q').fill('2'); await page.getByTestId('lab-time').fill('2');
  expect(await page.getByTestId('lab-concentration').innerText()).not.toBe(concentration);
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect.poll(async () => Number(await page.getByTestId('lab-time').inputValue())).toBeGreaterThan(2.2);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('button', { name: '02 / Accumulation' }).click();
  await page.locator('#lab-loading').fill('2');
  await expect(page.getByTestId('lab-concentration')).toHaveText('5.00');
  await page.getByTestId('lab-time').fill('8');
  await expect(page.getByTestId('lab-concentration')).toHaveText('4.75');
  await page.locator('.data summary').click();
  await expect(page.locator('.data table').first().locator('thead')).toContainText('Current model');
  await expect(page.locator('.data table').first().locator('thead')).toContainText('Reference');
  await expect(page.locator('.data table').nth(1).locator('tbody tr')).toHaveCount(8);
  await page.locator('#lab-cl').fill('0'); await expect(page.locator('.error')).toBeVisible();
  await expect(page.getByTestId('lab-plot')).toHaveCount(0);
});

test('French dark mode, keyboard menu and motion pause outside the scene', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await open(page, '/laboratoires/?lang=fr');
  await expect(page.getByRole('heading', { name: 'Distribution à deux compartiments' })).toBeVisible();
  await page.getByRole('button', { name: 'Lecture', exact: true }).click();
  await expect.poll(async () => Number(await page.getByTestId('lab-time').inputValue())).toBeGreaterThan(0.1);
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Lecture', exact: true })).toBeAttached();
  const paused = await page.getByTestId('lab-time').inputValue();
  await page.waitForTimeout(200);
  expect(await page.getByTestId('lab-time').inputValue()).toBe(paused);
  await page.getByTestId('lab-scene').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/lab-fr-dark.png' });
  await page.setViewportSize({ width: 390, height: 950 });
  await page.getByTestId('nav-toggle').click();
  await page.getByTestId('goal-explore').locator('summary').focus(); await page.keyboard.press('Enter');
  await expect(page.getByTestId('nav-laboratories')).toBeVisible();
  await page.getByTestId('nav-laboratories').click();
  await expect(page.getByTestId('nav-toggle')).toHaveAttribute('aria-expanded', 'false');
});

test('teacher scenario reload, reveal and explicit exports', async ({ page }) => {
  await open(page);
  await page.getByLabel('Teacher mode', { exact: true }).check();
  await page.locator('#lab-cl').fill('9');
  await page.getByLabel('Hide results at opening').check();
  await expect(page.getByTestId('lab-scene')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'CSV', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Share scenario', exact: true }).click();
  const shared = await page.getByLabel('Synthetic scenario link').inputValue();
  expect(shared).toContain('hide=1'); expect(shared).not.toContain('code=');
  await page.goto(shared);
  await expect(page.locator('#lab-cl')).toHaveValue('9');
  await expect(page.getByTestId('lab-plot')).toHaveCount(0);
  await page.getByRole('button', { name: 'Reveal results', exact: true }).click();
  await expect(page.getByTestId('lab-plot')).toBeVisible();
  for (const label of ['CSV', 'Figure']) {
    const download = page.waitForEvent('download'); await page.getByRole('button', { name: label, exact: true }).click();
    expect(await (await download).failure()).toBeNull();
  }
  await page.goto(url('/laboratoires/?lang=en#lab=distribution&cl=-1'));
  await expect(page.getByRole('alert')).toContainText('Invalid shared scenario');
});

test('objective navigation, confirmation and transfer into four tools', async ({ page }) => {
  for (const [label, path] of [['Build in Lego','lego'],['Add an interaction','interactions'],['Add a PD response','pharmacodynamie'],['Open in TDM','tdm']]) {
    await open(page); await page.locator('#lab-cl').fill('9');
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${path}/`), { timeout: 20000 });
    await expect(page.getByTestId('lab-transfer')).toContainText('CL = 9');
    await page.getByRole('button', { name: 'Apply experiment', exact: true }).click();
    await expect(page.getByTestId('lab-transfer')).toHaveCount(0);
    await expect(page.getByRole('status').first()).toContainText('Laboratory parameters applied');
    if (path === 'lego') await expect(page.locator('body')).toContainText('PERI');
    if (path === 'interactions' || path === 'pharmacodynamie') await expect(page.locator('textarea').first()).toHaveValue(/TV_cl_L1_CENT : 9/);
    if (path === 'tdm') await expect(page.getByRole('button', { name: 'Open this experiment in the R engine' })).toBeVisible();
  }
  if (await page.getByTestId('nav-toggle').isVisible()) await page.getByTestId('nav-toggle').click();
  await page.getByTestId('goal-explore').locator('summary').focus(); await page.keyboard.press('Enter');
  await expect(page.getByTestId('nav-laboratories')).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page.getByTestId('goal-explore')).not.toHaveAttribute('open');
});

test('responsive scenes, reduced motion and no overflow', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 950 });
    await open(page);
    await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeEnabled();
    await expect(page.getByLabel('Animate particles')).not.toBeChecked();
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await expect.poll(async () => Number(await page.getByTestId('lab-time').inputValue())).toBeGreaterThan(.2);
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await page.getByRole('button', { name: 'Restart time', exact: true }).click();
    await page.getByRole('button', { name: 'Step forward one hour' }).click();
    await expect(page.getByTestId('lab-time')).toHaveValue('1.0');
    for (const lab of ['01 / Distribution', '02 / Accumulation']) {
      await page.getByRole('button', { name: lab }).click();
      await page.getByLabel('Animate particles').check();
      await page.getByTestId('lab-time').fill('6');
      await page.getByTestId('lab-scene').evaluate(node => node.scrollIntoView({ block: 'start' }));
      expect((await pixels(page.getByTestId('lab-scene'))).colored).toBeGreaterThan(300);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await page.screenshot({ path: `test-results/lab-${width}-${lab.startsWith('01') ? 'distribution' : 'accumulation'}.png` });
    }
  }
});

test('particles travel on both transfer lanes and through the elimination outlet, then freeze on pause', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await open(page);
  const scene = page.getByTestId('lab-scene');
  const geometry = sceneLayout(await scene.evaluate(node => node.clientWidth), 'distribution');
  // Inspect actual passageways, excluding labels and reservoir contents.
  const pipes = () => scene.evaluate((node, g) => {
    const w = node.clientWidth, scale = node.width / w;
    const c = g.rooms.central, r = g.rooms.peripheral, e = g.rooms.eliminated;
    const regions = [[c.x+c.w+8,g.forwardY-8,r.x-c.x-c.w-16,16],[c.x+c.w+8,g.backwardY-8,r.x-c.x-c.w-16,16],[g.drainX-8,c.y+c.h+12,16,e.y-c.y-c.h-24]];
    return regions.map(([x,y,width,height]) => {
      const data = node.getContext('2d').getImageData(x * scale, y * scale, width * scale, height * scale).data;
      return Array.from(data).reduce((sum, value, i) => (sum + value * (i % 997 + 1)) % 1000000007, 0);
    });
  }, geometry);
  await page.getByTestId('lab-time').fill('1');
  const first = await pipes();
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect.poll(async () => Number(await page.getByTestId('lab-time').inputValue())).toBeGreaterThan(1.7);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const moved = await pipes();
  moved.forEach((value, i) => expect(value).not.toBe(first[i]));
  await page.waitForTimeout(250);
  expect(await pipes()).toEqual(moved);
  await page.getByTestId('lab-time').fill('1');
  expect(await pipes()).toEqual(first);
  await page.getByTestId('lab-scene').screenshot({ path: 'test-results/lab-particle-flows.png' });
  await page.locator('#lab-q').fill('0');
  await page.getByTestId('lab-time').fill('1');
  const noExchange = await pipes();
  await page.getByTestId('lab-time').fill('2');
  const later = await pipes();
  expect(later.slice(0, 2)).toEqual(noExchange.slice(0, 2));
  expect(later[2]).not.toBe(noExchange[2]);
});

test('particle selection, draggable exact-concentration probe, slow motion and dose cohorts', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await open(page);
  const tracked = await page.getByTestId('particle-readout').innerText();
  await page.getByRole('button', { name: 'Next particle', exact: true }).click();
  await expect(page.getByTestId('particle-readout')).not.toHaveText(tracked);
  await page.getByTestId('lab-scene').focus(); await page.keyboard.press('Enter');
  await expect(page.getByTestId('probe-readout')).toContainText('10.00');
  await page.getByTestId('lab-time').fill('2');
  await expect(page.getByTestId('probe-readout')).toContainText(await page.getByTestId('lab-concentration').innerText());
  await page.getByLabel('Probe location').selectOption('peripheral');
  const peripheral = await page.getByTestId('probe-readout').innerText();
  expect(peripheral).not.toContain(await page.getByTestId('lab-concentration').innerText());
  const scene = page.getByTestId('lab-scene');
  await scene.evaluate(node => node.scrollIntoView({ block: 'start' }));
  const rect = await scene.boundingBox(), g = sceneLayout(rect.width, 'distribution');
  const probe = await page.getByRole('button', { name: 'Move concentration probe' }).boundingBox();
  await page.mouse.move(probe.x+probe.width/2,probe.y+probe.height/2); await page.mouse.down();
  await page.mouse.move(rect.x+g.rooms.central.x+g.rooms.central.w*.5,rect.y+g.rooms.central.y+g.rooms.central.h*.5,{ steps:12 });
  await page.mouse.up();
  await expect(page.getByLabel('Probe location')).toHaveValue('central');
  await expect(page.getByTestId('probe-readout')).toContainText(await page.getByTestId('lab-concentration').innerText());
  await page.getByRole('button', { name: 'Move concentration probe' }).focus(); await page.keyboard.press('ArrowLeft');
  await page.getByLabel('Speed', { exact:true }).selectOption('0.25');
  await page.getByRole('button', { name: 'Start animation', exact:true }).click();
  await expect.poll(async()=>Number(await page.getByTestId('lab-time').inputValue())).toBeGreaterThan(2.1);
  await page.getByRole('button', { name: 'Pause animation', exact:true }).click();
  await page.getByRole('button', { name:'02 / Accumulation' }).click();
  await page.getByRole('button', { name:'Next dose', exact:true }).click();
  await expect(page.getByTestId('lab-time')).toHaveValue('8.0');
  await expect(page.getByLabel('Color by dose')).toBeChecked();
  await page.getByTestId('lab-time').fill('8.3');
  const colored = await pixels(scene);
  await page.getByLabel('Color by dose').uncheck();
  expect((await pixels(scene)).sum).not.toBe(colored.sum);
  await page.getByTestId('lab-time').fill('72');
  await expect(page.getByRole('button',{name:'Next dose',exact:true})).toBeDisabled();
});

test('play works when its toolbar is visible but the canvas is above the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 650 });
  await open(page);
  const play = page.getByRole('button', { name: 'Play', exact: true });
  await play.focus();
  await page.locator('.timebar').evaluate(node => node.scrollIntoView({ block: 'start' }));
  expect(await page.getByTestId('lab-scene').evaluate(node => node.getBoundingClientRect().bottom)).toBeLessThan(0);
  await page.keyboard.press('Space');
  await expect.poll(async () => Number(await page.getByTestId('lab-time').inputValue())).toBeGreaterThan(.3);
  await page.keyboard.press('Space');
  const time = await page.getByTestId('lab-time').inputValue();
  await page.waitForTimeout(200);
  await expect(page.getByTestId('lab-time')).toHaveValue(time);
});
