// @ts-nocheck
import { test, expect } from '@playwright/test';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { getSiteOrigin } from '../../site.config.js';

const origin = process.env.PORTAL_E2E_URL || 'http://127.0.0.1:4181';
const pages = ['/', '/tools/', '/publications/', '/a-propos/', '/contact/', '/citer/', '/other-projects/'];
const publicOrigin = getSiteOrigin();

test.beforeEach(async ({ page }) => {
  // Browser tests must never send synthetic visits or data to external services.
  await page.route('**/*', route => new URL(route.request().url()).origin === origin
    ? route.continue() : route.abort());
});

test('portal metadata, navigation, internal links and images', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of pages) {
    const response = await page.goto(origin + route);
    expect(response.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', publicOrigin + route);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', publicOrigin + route);
    await expect(page.locator('.nav-links a')).toHaveText(['Pharmacometrics', 'Tools & Projects', 'Publications & Talks', 'About']);
    await expect(page.locator('footer a[href="/other-projects/"]')).toHaveCount(1);
    if (route === '/') {
      await expect(page.locator('.project-grid h3')).toHaveText(['TacDDI', 'MissedDose', 'MIPD Engine']);
      await expect(page.locator('.project-grid').getByRole('link', { name: 'Open MIPD Engine' }))
        .toHaveAttribute('href', '/pharmacometrie/tdm/?lang=en');
    }
    await expect(page.locator('footer a[href="/pharmacometrie/confidentialite/"]')).toHaveCount(1);
    if (route === '/tools/') {
      await expect(page.locator('#tacddi').getByRole('link', { name: 'Open TacDDI' }))
        .toHaveAttribute('href', 'https://tdmhub.shinyapps.io/TacDDI/');
      await expect(page.locator('#grad a')).toHaveCount(0);
    }
    if (route === '/other-projects/') {
      await expect(page.getByRole('link', { name: 'Open Internat Pharma' })).toHaveAttribute('href', '/internat/');
      await expect(page.getByRole('link', { name: 'Open Stat & Biologie' })).toHaveAttribute('href', '/stats/');
    }
    const refs = await page.locator('a[href],img[src],script[src],link[rel="stylesheet"]').evaluateAll(nodes =>
      nodes.map(n => n.getAttribute('href') || n.getAttribute('src')));
    for (const href of refs) {
      const url = new URL(href, publicOrigin + route);
      if (url.origin !== publicOrigin || /^\/(internat|stats)(\/|$)/.test(url.pathname)) continue;
      const app = url.pathname.startsWith('/pharmacometrie/');
      const file = path.resolve(app ? 'build' : 'portal',
        '.' + (app ? url.pathname.slice('/pharmacometrie'.length) : url.pathname),
        url.pathname.endsWith('/') ? 'index.html' : '');
      await access(file);
      if (url.hash) {
        const html = await readFile(file, 'utf8');
        const exists = await page.evaluate(({ html, hash }) =>
          !!new DOMParser().parseFromString(html, 'text/html').getElementById(decodeURIComponent(hash.slice(1))),
          { html, hash: url.hash });
        expect(exists, href).toBe(true);
      }
    }
    for (const block of await page.locator('script[type="application/ld+json"]').allTextContents())
      expect(JSON.parse(block)['@context']).toBe('https://schema.org');
  }
  expect(errors).toEqual([]);
});

for (const [name, width, height] of [['mobile', 390, 844], ['narrow', 320, 640], ['desktop', 1440, 1000], ['wide', 1920, 1080]]) {
  for (const theme of ['light', 'dark']) {
    test(name + ' / ' + theme + ': readable layout and screenshot', async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.emulateMedia({ colorScheme: theme });
      for (const route of pages) {
        await page.goto(origin + route);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), route).toBe(true);
        const nav = await page.locator('.nav-links a').evaluateAll(nodes => nodes.map(n => {
          const r = n.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom };
        }));
        for (let i = 0; i < nav.length; i++) for (let j = i + 1; j < nav.length; j++)
          expect(nav[i].l < nav[j].r && nav[i].r > nav[j].l && nav[i].t < nav[j].b && nav[i].b > nav[j].t).toBe(false);
      }
      await page.goto(origin + '/');
      expect(await page.locator('#explain-title').evaluate(e => e.getBoundingClientRect().top)).toBeLessThan(height);
      const image = page.locator('.product-figure img');
      await image.scrollIntoViewIfNeeded();
      expect(await image.evaluate(i => i.complete && i.naturalWidth > 500)).toBe(true);
      await page.screenshot({ path: 'test-results/portal-' + name + '-' + theme + '.png', fullPage: true });
    });
  }
}

test('keyboard navigation, persisted theme and system fallback', async ({ page }) => {
  await page.goto(origin + '/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await page.locator('#theme').selectOption('dark');
  await page.goto(origin + '/tools/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('#theme').selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('#theme').selectOption('system');
  expect(await page.evaluate(() => localStorage.getItem('pk-theme'))).toBeNull();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme');
});

test('semantic publication metadata agrees with visible DOI citations', async ({ page }) => {
  await page.goto(origin + '/publications/');
  await expect(page.locator('#publications .publication')).toHaveCount(4);
  await expect(page.locator('#correspondence .publication')).toHaveCount(1);
  const graph = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())['@graph'];
  for (const article of graph.filter(x => x['@type'] === 'ScholarlyArticle'))
    await expect(page.locator('.publication h3 a[href="' + article.url + '"]')).toHaveText(article.headline);
  await expect(page.locator('#albumin')).toContainText('contributed equally');
  await expect(page.locator('.publication .authors strong')).toHaveText(Array(5).fill('Berrah R'));
  await expect(page.locator('body')).not.toContainText('Manuscript under review');
});

test('legacy routes, aliases, 404 and sitemap', async ({ page, request }) => {
  for (const [from, to] of [['/research/', '/publications/'], ['/recherche/', '/publications/'], ['/demos/', '/tools/'],
    ['/pk/?lang=en#example', '/pharmacometrie/pk/?lang=en#example'],
    ['/playground/?lang=en', '/pharmacometrie/playground/?lang=en']]) {
    await page.goto(origin + from);
    await expect(page).toHaveURL(origin + to);
  }
  expect((await page.goto(origin + '/does-not-exist/')).status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Page not found');
  const xml = await (await request.get(origin + '/sitemap.xml')).text();
  const urls = await page.evaluate(xml => [...new DOMParser().parseFromString(xml, 'application/xml').querySelectorAll('loc')].map(n => n.textContent), xml);
  expect(urls.sort()).toEqual(pages.map(p => publicOrigin + p).sort());
  for (const route of ['/pharmacometrie/', '/pharmacometrie/tdm/', '/pharmacometrie/pk/'])
    expect((await request.get(origin + route)).status()).toBe(200);
  for (const route of ['/internat/', '/stats/']) {
    const response = await request.get(origin + route, { maxRedirects: 0 });
    expect(response.status()).toBe(302);
    expect(response.headers().location).toBe(publicOrigin + route);
  }
});

test('research details open with keyboard, retain sources and support direct links', async ({ page }) => {
  await page.goto(origin + '/publications/');
  const details = page.locator('details.research-detail');
  await expect(details).toHaveCount(9);
  await expect(page.locator('details.research-detail[open]')).toHaveCount(0);
  for (const detail of await details.all()) {
    const summary = detail.locator('summary');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(detail).toHaveAttribute('open', '');
    await expect(detail.locator('.detail-body')).toBeVisible();
    await expect(detail.locator('.detail-source')).toBeVisible();
    await page.keyboard.press('Space');
    await expect(detail).not.toHaveAttribute('open');
  }
  await page.goto(origin + '/publications/#tacddi-details');
  await expect(page.locator('#tacddi-details')).toHaveAttribute('open', '');
  await expect(page.locator('#tacddi-details')).toContainText('394 trough');
  await expect(page.locator('#tacddi-details h4').filter({ hasText: /^Abstract$/ })).toHaveCount(1);
  await expect(page.locator('.research-status')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('Manuscript abstract');
  await page.goto(origin + '/publications/#missed-dose-details');
  await expect(page.locator('#missed-dose-details')).toHaveAttribute('open', '');
  await expect(page.locator('#missed-dose-details')).toContainText('97.7%');
  await expect(page.locator('#missed-dose-details h4').filter({ hasText: /^Abstract$/ })).toHaveCount(1);
  await expect(page.locator('#missed-dose-details')).toContainText('not 11 distinct active substances');
  await page.goto(origin + '/publications/#page-2025-details');
  await page.locator('#page-2025-details').getByRole('link', { name: 'Better Dosing Through Better Error' }).click();
  await expect(page.locator('#residual-error-details')).toHaveAttribute('open', '');
  const abstract = 'https://www.page-meeting.org/Abstracts/impact-of-residual-error-handling-on-model-informed-precision-dosing-and-auc-calculation-a-case-study-with-tacrolimus/';
  await expect(page.locator('a[href="' + abstract + '"]').filter({ hasText: 'Conference abstract' })).toHaveCount(1);
  await expect(page.getByText('Conference record', { exact: false })).toHaveCount(0);
  await expect(page.locator('a[href$=".pptx"],a[href$=".docx"],a[href$=".zip"],iframe,video')).toHaveCount(0);
});

for (const width of [320, 1440]) {
  test('expanded abstracts fit at ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(origin + '/publications/');
    for (const theme of ['light', 'dark']) {
      await page.locator('#theme').selectOption(theme);
      for (const summary of await page.locator('.research-detail > summary').all()) {
        const detail = summary.locator('..');
        if (!await detail.evaluate(node => node.open)) await summary.click();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      for (const body of await page.locator('.detail-body').all()) {
        await expect(body).toBeVisible();
        const bounds = await body.boundingBox();
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1);
      }
      await page.locator('#tacddi-details > summary').evaluate(node => node.scrollIntoView({ block: 'start' }));
      await page.screenshot({ path: 'test-results/publication-detail-' + width + '-' + theme + '.png' });
    }
  });
}

test('research abstracts remain readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(origin + '/publications/');
    for (const detail of await page.locator('.research-detail').all()) {
      await detail.locator('summary').click();
      await expect(detail.locator('.detail-body')).toBeVisible();
    }
  } finally { await context.close(); }
});

test('essential navigation works without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(origin + '/');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Tools & Projects' }).click();
  await expect(page.locator('h1')).toHaveText('Tools & Projects');
  await expect(page.locator('.theme-control')).toBeHidden();
  await context.close();
});
