// @ts-nocheck
import { test, expect } from '@playwright/test';
import { cp, readFile, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { getSiteOrigin } from '../../site.config.js';

const origin = getSiteOrigin();
const endpoint = 'https://rberrah.goatcounter.com/count';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
let portalRoot;

test.beforeAll(async ({}, workerInfo) => {
  // Playwright clears outputDir before starting workers. Build fixtures afterwards,
  // independently per worker, so no manually prepared directory can disappear.
  portalRoot = path.resolve(workerInfo.project.outputDir, 'analytics-portal-' + workerInfo.workerIndex);
  await cp('portal', portalRoot, { recursive: true });
  await promisify(execFile)(process.execPath, ['scripts/add_portal_analytics.mjs', portalRoot]);
});

// Serve the actual production build on a mocked production origin. All external
// requests are intercepted, so synthetic fixtures never reach GoatCounter.
async function site(page, { blocked = false, aliases = [] } = {}) {
  const counts = [];
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.href.startsWith(endpoint)) {
      counts.push({ url: url.href, headers: await route.request().allHeaders() });
      return blocked ? route.abort() : route.fulfill({ status: 200, body: '' });
    }
    if (![origin, 'http://127.0.0.1:4180', ...aliases].includes(url.origin)) return route.abort();
    const app = url.pathname.startsWith('/pharmacometrie/');
    const root = app ? path.resolve('build') : portalRoot;
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

for (const component of ['host', 'protocol', 'port']) {
  test('analytics rejects a different origin ' + component, async ({ page }) => {
    const other = new URL(origin);
    if (component === 'host') other.hostname = 'not-configured.example';
    if (component === 'protocol') other.protocol = other.protocol === 'https:' ? 'http:' : 'https:';
    if (component === 'port') other.port = other.port === '9443' ? '9444' : '9443';
    const counts = await site(page, { aliases: [other.origin] });
    for (const route of ['/', '/pharmacometrie/pk/?lang=en']) {
      await page.goto(other.origin + route);
      await expect(page.locator('h1')).toBeVisible();
      await page.waitForTimeout(200);
    }
    expect(counts).toEqual([]);
  });
}

test('configured origin is shared by portal and application metadata', async ({ page }) => {
  await site(page);
  for (const route of ['/', '/publications/', '/pharmacometrie/pk/',
    '/pharmacometrie/chapitres/bayes-ebes/']) {
    await page.goto(origin + route);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', origin + route);
    if (!route.startsWith('/pharmacometrie/'))
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', origin + route);
    expect(await page.content()).not.toContain('__SITE_ORIGIN__');
    const metadata = await page.locator('script[type="application/ld+json"]').evaluateAll(
      scripts => scripts.map(script => JSON.parse(script.textContent)));
    if (route === '/') expect(metadata.find(item => item['@type'] === 'Person').url).toBe(origin + '/');
    if (route.includes('/chapitres/')) {
      const chapter = metadata.find(item => item['@type'] === 'LearningResource');
      expect(chapter.url).toBe(origin + route);
      expect(chapter.author.url).toBe(origin + '/a-propos/');
      expect(chapter.isPartOf.url).toBe(origin + '/pharmacometrie/');
    }
  }
  await page.goto(origin + '/pharmacometrie/confidentialite/?lang=en');
  await expect(page.locator('.privacy-page a').filter({ hasText: 'Contact' }))
    .toHaveAttribute('href', origin + '/contact/');
  for (const prefix of ['', '/pharmacometrie']) {
    const robots = await page.evaluate(url => fetch(url).then(response => response.text()), prefix + '/robots.txt');
    expect(robots).toContain(origin + prefix + (prefix ? '/sitemap.xml' : '/sitemap-index.xml'));
    const locations = await page.evaluate(async url => {
      const xml = new DOMParser().parseFromString(await (await fetch(url)).text(), 'application/xml');
      return [...xml.querySelectorAll('loc')].map(node => node.textContent);
    }, prefix + '/sitemap.xml');
    expect(locations.length).toBeGreaterThan(0);
    expect(locations.every(url => new URL(url).origin === origin)).toBe(true);
  }
});

test('new portal routes are counted once with one privacy link; aliases are not instrumented', async ({ page }) => {
  const counts = await site(page);
  for (const route of ['/tools/', '/publications/', '/other-projects/']) {
    await page.goto(origin + route + '?private=synthetic-secret');
    await expect.poll(() => paths(counts).at(-1)).toBe(route);
    await expect(page.locator('footer a[href="/pharmacometrie/confidentialite/"]')).toHaveCount(1);
  }
  expect(paths(counts)).toEqual(['/tools/', '/publications/', '/other-projects/']);
  expect(JSON.stringify(counts)).not.toContain('synthetic-secret');
  for (const route of ['research', 'recherche', 'demos'])
    expect(await readFile(path.join(portalRoot, route, 'index.html'), 'utf8')).not.toContain('data-portal-analytics');
});

test('SPA counts public routes once, excludes query/hash/input/title/referrer and preserves back navigation', async ({ page }) => {
  const counts = await site(page);
  await page.goto(`${origin}/pharmacometrie/pk/?lang=en&patient=synthetic-secret#private-code`);
  await expect.poll(() => paths(counts)).toEqual(['/pharmacometrie/pk/']);
  await page.evaluate(() => { document.title = 'synthetic-secret'; window.marker = 'same-document'; });
  await page.getByTestId('workshop-nav').getByRole('link', { name: 'Advanced Builder', exact: true }).click();
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
  await page.locator('footer a[href="/pharmacometrie/confidentialite/"]').click();
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
  await page.getByTestId('workshop-nav').getByRole('link', { name: 'Advanced Builder', exact: true }).click();
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
