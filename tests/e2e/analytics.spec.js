// @ts-nocheck
import { test, expect } from '@playwright/test';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://rberrah.github.io';
const endpoint = 'https://rberrah.goatcounter.com/count';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };

// Serve the actual production build on a mocked production origin. All external
// requests are intercepted, so synthetic fixtures never reach GoatCounter.
async function site(page, { blocked = false } = {}) {
  const counts = [];
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.href.startsWith(endpoint)) {
      counts.push({ url: url.href, headers: await route.request().allHeaders() });
      return blocked ? route.abort() : route.fulfill({ status: 200, body: '' });
    }
    if (![origin, 'http://127.0.0.1:4180'].includes(url.origin)) return route.abort();
    const app = url.pathname.startsWith('/pharmacometrie/');
    const root = path.resolve(app ? 'build' : 'test-results/analytics-portal');
    let file = path.resolve(root, '.' + (app ? url.pathname.slice('/pharmacometrie'.length) : url.pathname));
    if (!file.startsWith(root + path.sep) && file !== root) return route.abort();
    try {
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      await route.fulfill({ body: await readFile(file), contentType: types[path.extname(file)] || 'application/octet-stream' });
    } catch { await route.fulfill({ status: 404, body: 'Not found' }); }
  });
  return counts;
}

function paths(counts) { return counts.map(c => new URL(c.url).searchParams.get('p')); }

test('SPA counts public routes once, excludes query/hash/input/title/referrer and preserves back navigation', async ({ page }) => {
  const counts = await site(page);
  await page.goto(`${origin}/pharmacometrie/pk/?lang=en&patient=synthetic-secret#private-code`);
  await expect.poll(() => paths(counts)).toEqual(['/pharmacometrie/pk/']);
  await page.evaluate(() => { document.title = 'synthetic-secret'; window.marker = 'same-document'; });
  await page.getByTestId('workshop-nav').getByRole('link', { name: 'Advanced', exact: true }).click();
  await expect.poll(() => paths(counts)).toEqual(['/pharmacometrie/pk/', '/pharmacometrie/advanced/']);
  expect(await page.evaluate(() => window.marker)).toBe('same-document');
  await page.goBack();
  await expect.poll(() => paths(counts)).toEqual(['/pharmacometrie/pk/', '/pharmacometrie/advanced/', '/pharmacometrie/pk/']);
  await page.evaluate(() => { location.hash = 'another-secret'; });
  await page.locator('.language-toggle').getByRole('button', { name: 'FR', exact: true }).click();
  await page.waitForTimeout(300);
  expect(counts).toHaveLength(3);
  for (const count of counts) {
    const query = new URL(count.url).searchParams;
    expect([...query.keys()].sort()).toEqual(['b', 'p', 'rnd']);
    expect(count.headers.referer).toBeUndefined();
    expect(count.headers.cookie).toBeUndefined();
    expect(JSON.stringify(count)).not.toContain('secret');
  }
  expect(await page.context().cookies()).toEqual([]);
});

test('portal pages use the same counter and opt-out control', async ({ page }) => {
  const counts = await site(page);
  await page.goto(`${origin}/?patient=synthetic-secret#private-code`);
  await expect.poll(() => paths(counts)).toEqual(['/']);
  await page.getByRole('link', { name: 'Confidentialité / Privacy', exact: true }).click();
  const checkbox = page.locator('.privacy-page input');
  await expect(checkbox).toBeEnabled();
  await checkbox.uncheck();
  expect(await page.evaluate(() => localStorage.getItem('skipgc'))).toBe('t');
  const previous = counts.length;
  await page.goto(`${origin}/a-propos/`);
  await page.waitForTimeout(200);
  expect(counts).toHaveLength(previous);
  await page.goto(`${origin}/pharmacometrie/confidentialite/?lang=en`);
  await expect(page.getByRole('heading', { name: 'Privacy', exact: true })).toBeVisible();
  await checkbox.check();
  await page.goto(`${origin}/contact/`);
  await expect.poll(() => paths(counts).at(-1)).toBe('/contact/');
});

for (const mode of ['DNT', 'GPC', 'both']) {
  test(`${mode} does not disable counting; manual opt-out still applies`, async ({ page }) => {
    const counts = await site(page);
    await page.addInitScript(mode => {
      if (mode !== 'GPC') Object.defineProperty(navigator, 'doNotTrack', { value: '1' });
      if (mode !== 'DNT') Object.defineProperty(navigator, 'globalPrivacyControl', { value: true });
    }, mode);
    await page.goto(`${origin}/`);
    await expect.poll(() => paths(counts)).toEqual(['/']);
    await page.goto(`${origin}/pharmacometrie/confidentialite/?lang=en`);
    await expect.poll(() => paths(counts)).toEqual(['/', '/pharmacometrie/confidentialite/']);
    const checkbox = page.locator('.privacy-page input');
    await expect(checkbox).toBeEnabled();
    await expect(checkbox).toBeChecked();
    await expect(page.locator('.privacy-page')).toContainText('do not automatically disable');
    await checkbox.uncheck();
    await page.goto(`${origin}/pharmacometrie/pk/?lang=en`);
    await expect(page.locator('.canvas .node')).toHaveCount(2);
    await page.goto(`${origin}/contact/`);
    await page.waitForTimeout(250);
    expect(counts).toHaveLength(2);
  });
}

for (const mode of ['local', 'storage-disabled']) {
  test(`no analytics with ${mode}`, async ({ page }) => {
    const counts = await site(page);
    await page.addInitScript(mode => {
      if (mode === 'storage-disabled') Storage.prototype.getItem = () => { throw new Error('blocked'); };
    }, mode);
    await page.goto(`${mode === 'local' ? 'http://127.0.0.1:4180' : origin}/pharmacometrie/pk/?lang=en`);
    await expect(page.locator('.canvas .node')).toHaveCount(2);
    await page.waitForTimeout(250);
    expect(counts).toEqual([]);
  });
}

test('a blocked counter does not break workshops', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const counts = await site(page, { blocked: true });
  await page.goto(`${origin}/pharmacometrie/pk/?lang=en`);
  await page.getByTestId('workshop-nav').getByRole('link', { name: 'Advanced', exact: true }).click();
  await expect(page.locator('.toolbar .add')).toHaveCount(9);
  await expect.poll(() => counts.length).toBe(2);
  expect(errors).toEqual([]);
});

test('frames and model edits are not counted', async ({ page }) => {
  const counts = await site(page);
  await page.goto(`${origin}/`);
  await expect.poll(() => counts.length).toBe(1);
  await page.evaluate(() => {
    const frame = document.createElement('iframe');
    frame.src = '/pharmacometrie/pk/';
    document.body.append(frame);
  });
  await expect(page.frameLocator('iframe').locator('.canvas .node')).toHaveCount(2);
  expect(paths(counts)).toEqual(['/']);
  await page.goto(`${origin}/pharmacometrie/translator/?lang=en`);
  await expect.poll(() => counts.length).toBe(2);
  await page.locator('.mlxtran-import textarea').fill('SYNTHETIC_PRIVATE_MODEL');
  await page.waitForTimeout(200);
  expect(counts).toHaveLength(2);
  expect(JSON.stringify(counts)).not.toContain('SYNTHETIC_PRIVATE_MODEL');
});

test('chapter visits use catalogue slugs, not arbitrary URL segments', async ({ page }) => {
  const counts = await site(page);
  await page.goto(`${origin}/pharmacometrie/chapitres/mab-pk/?lang=en&patient=secret`);
  await expect.poll(() => paths(counts)).toEqual(['/pharmacometrie/chapitres/mab-pk/']);
  await page.evaluate(() => {
    const link = document.createElement('a');
    link.href = '/pharmacometrie/chapitres/synthetic-private-slug/';
    link.textContent = 'Unknown chapter test';
    document.body.append(link);
  });
  await page.getByRole('link', { name: 'Unknown chapter test' }).click();
  await expect(page).toHaveURL(/synthetic-private-slug/);
  await page.waitForTimeout(250);
  expect(paths(counts)).toEqual(['/pharmacometrie/chapitres/mab-pk/']);
});

test('privacy page fits desktop and mobile', async ({ page }) => {
  await site(page);
  for (const [width, lang] of [[1280, 'en'], [390, 'fr']]) {
    await page.setViewportSize({ width, height: 850 });
    await page.goto(`${origin}/pharmacometrie/confidentialite/?lang=${lang}`);
    await expect(page.locator('.privacy-page input')).toBeEnabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/privacy-${width}.png`, fullPage: true });
  }
});
