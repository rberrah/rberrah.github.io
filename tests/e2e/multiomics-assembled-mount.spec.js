import { test, expect } from '@playwright/test';

test('Existing portal, PMx and MultiOmics URLs remain 200 after independent build overlay', async ({ page }) => {
  for (const route of [
    '/', '/pharmacometrie/', '/pharmacometrie/multiomics/',
    '/pharmacometrie/multiomics/tool/',
    '/pharmacometrie/multiomics/learn/'
  ]) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), 'HTTP 200: ' + route).toBe(200);
    await expect(page.locator('body')).not.toBeEmpty();
  }
  await expect(page.getByRole('heading', { name: /Choisir une méthode|Choose a method/i })).toBeVisible();
});

test('A true integrated SvelteKit mount hydrates and computes from synthetic demo', async ({ page }) => {
  /** @type {string[]} */
  const jsErrors = [];
  page.on('pageerror', err => jsErrors.push(err.message));
  /** @type {string[]} */
  const failed = [];
  page.on('response', response => {
    if (response.url().startsWith('http://127.0.0.1:4183/') && response.status() >= 400)
      failed.push(response.url() + ': ' + response.status());
  });
  await page.goto('/pharmacometrie/multiomics/tool/');
  await page.waitForFunction(() => document.documentElement.dataset.pmxMultiomicsHydrated === 'true');
  const selectors = [
    'multiomics-quick-demo-rna',
    'multiomics-quick-demo-protein',
    'multiomics-quick-demo-metabolite'
  ];
  for (const selector of selectors) await expect(page.getByTestId(selector)).toBeVisible();
  await expect(page.getByTestId('multiomics-quick-demo')).toBeVisible();
  const positions = await Promise.all([...selectors.map(id => page.getByTestId(id)),
    page.getByTestId('multiomics-quick-demo')].map(x => x.boundingBox()));
  const [a, b, c, all] = positions;
  if (!a || !b || !c || !all) throw new Error('Missing one or more demo buttons');
  expect(Math.abs(a.y - b.y)).toBeLessThan(4);
  expect(Math.abs(b.y - c.y)).toBeLessThan(4);
  expect(all.y).toBeGreaterThan(a.y + a.height - 3);
  expect(all.width).toBeGreaterThan(a.width * 2.5);
  await page.getByTestId('multiomics-quick-demo-rna').click();
  await expect(page.getByTestId('multiomics-results')).toBeVisible({ timeout: 40_000 });
  expect(jsErrors).toEqual([]);
  expect(failed).toEqual([]);
});

test('Same historical MultiOmics URL is usable at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pharmacometrie/multiomics/tool/');
  await page.waitForFunction(() => document.documentElement.dataset.pmxMultiomicsHydrated === 'true');
  const mini = page.getByTestId('multiomics-quick-demo-rna');
  const full = page.getByTestId('multiomics-quick-demo');
  await expect(mini).toBeVisible();
  await expect(full).toBeVisible();
  const a = await mini.boundingBox();
  const b = await full.boundingBox();
  if (!a || !b) throw new Error('Missing mobile quick-start control');
  expect(b.y).toBeGreaterThan(a.y + a.height - 3);
  expect(b.width).toBeGreaterThan(a.width * 2.5);
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(12);
  await full.click();
  await expect(page.getByTestId('multiomics-results')).toBeVisible({ timeout: 40_000 });
});
