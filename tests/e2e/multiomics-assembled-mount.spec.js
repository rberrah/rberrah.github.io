import { test, expect } from '@playwright/test';

test('Canonical MultiOmics root mount coexists with portal and PMx', async ({ page }) => {
  for (const route of [
    '/', '/pharmacometrie/', '/multiomics/',
    '/multiomics/tool/', '/multiomics/learn/', '/multiomics/demo/', '/multiomics/ecosystem/',
    '/multiomics/disciplines/', '/multiomics/resources/'
  ]) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), 'HTTP 200: ' + route).toBe(200);
    await expect(page.locator('body')).not.toBeEmpty();
  }
  await page.goto('/multiomics/tool/');
  await expect(page.getByTestId('multiomics-quick-demo')).toBeVisible();
  await page.goto('/multiomics/resources/');
  await expect(page.getByRole('heading', { name: /Retrouver les méthodes|Find methods/i })).toBeVisible();
  await page.goto('/multiomics/demo/');
  await expect(page.getByRole('heading', { name: /MultiOmics.*questionnaire.*sorties exactes|MultiOmics.*questionnaire.*exact outputs/i })).toBeVisible();
  await expect(page.getByTestId('guided-demo-exact-results')).toContainText('STAT1',{timeout:30000});
  await expect(page.getByTestId('guided-demo-methods')).toContainText('random-intercept-longitudinal-model');
  await expect(page.getByTestId('guided-demo-methods')).toContainText('lmerTest');
  await expect(page.getByTestId('guided-demo-live-visualizations')).toBeVisible();
  await page.goto('/multiomics/ecosystem/');
  await expect(page.getByRole('heading', { name: /Analyser les omiques sans perdre le lien|Analyze omics without losing/i })).toBeVisible();
});

test('Canonical /multiomics/ SvelteKit mount hydrates and computes from synthetic demo', async ({ page }) => {
  /** @type {string[]} */
  const jsErrors = [];
  page.on('pageerror', err => jsErrors.push(err.message));
  /** @type {string[]} */
  const failed = [];
  page.on('response', response => {
    if (response.url().startsWith('http://127.0.0.1:4183/') && response.status() >= 400)
      failed.push(response.url() + ': ' + response.status());
  });
  await page.goto('/multiomics/tool/');
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

test('Canonical MultiOmics URL is usable at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/multiomics/tool/');
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


test('Historical PMx MultiOmics URLs redirect to canonical routes and preserve query/hash', async ({ page }) => {
  for (const [from, to] of [
    ['/pharmacometrie/multiomics/', '/multiomics/'],
    ['/pharmacometrie/multiomics/tool/?lang=en#demo', '/multiomics/tool/?lang=en#demo'],
    ['/pharmacometrie/multiomics/learn/?lang=fr#methods', '/multiomics/learn/?lang=fr#methods']
  ]) {
    await page.goto(from);
    await expect(page).toHaveURL('http://127.0.0.1:4183' + to);
  }
});


test('Canonical MultiOmics navbar is ACTUALLY PMx dropdown UI with mO logo', async ({ page }) => {
  await page.goto('/multiomics/');
  const header=page.getByTestId('site-header');
  await expect(header.locator('.mark')).toHaveText('mO');
  await expect(header.getByTestId('logo-link')).toHaveAttribute('href', '/multiomics/');
  for(const [id,en,fr] of [
    ['learn','Learn','Apprendre'],
    ['analyze','Analyze','Analyser'],
    ['disciplines','Ecosystem','Écosystème'],
    ['resources','Resources','Ressources']
  ]) {
    const menu=header.getByTestId('goal-'+id);
    await expect(menu.locator('summary')).toHaveCount(1);
    await expect(menu.locator('summary')).toContainText(new RegExp(en+'|'+fr,'i'));
    await expect(menu).not.toHaveAttribute('open','');
  }
  await header.getByTestId('goal-learn').locator('summary').click();
  await expect(header.getByTestId('nav-demo')).toHaveAttribute('href','/multiomics/demo/');
  await expect(header.getByTestId('nav-learn')).toHaveAttribute('href','/multiomics/learn/');
  await header.getByTestId('goal-analyze').locator('summary').click();
  await expect(header.getByTestId('nav-tool')).toHaveAttribute('href','/multiomics/tool/');
  await expect(header.getByTestId('goal-analyze').locator('.goal-links a')).toHaveCount(1);
  await header.getByTestId('goal-disciplines').locator('summary').click();
  await expect(header.getByTestId('nav-pmx')).toHaveAttribute('href','https://rberrah.github.io/pharmacometrie/');
  await expect(header.getByTestId('nav-omics2pk')).toHaveAttribute('href','https://rberrah.github.io/Omics2PK/');
  await header.getByTestId('goal-resources').locator('summary').click();
  await expect(header.getByTestId('goal-disciplines')).not.toHaveAttribute('open','');
  await expect(header.getByTestId('nav-glossary')).toHaveAttribute('href','/multiomics/glossary/');
  await expect(header.getByTestId('nav-references')).toHaveAttribute('href','/multiomics/references/');
  await expect(header.getByTestId('nav-main-site')).toHaveAttribute('href','https://rberrah.github.io/');
  await page.keyboard.press('Escape');
  await expect(header.getByTestId('goal-resources')).not.toHaveAttribute('open','');
  await expect(header.getByTestId('goal-resources').locator('summary')).toBeFocused();

  await page.goto('/multiomics/ecosystem/');
  await expect(page.getByRole('link', { name: /Voir l’écosystème|Open ecosystem/ })).toHaveAttribute('href','https://rberrah.github.io/pharmacometrie/ecosystem/');
  await expect(page.getByRole('link', { name: /Ouvrir Omics2PK|Open Omics2PK/ })).toHaveAttribute('href','https://rberrah.github.io/Omics2PK/');
  await page.goto('/multiomics/resources/');
  const mainSiteLink = page.getByTestId('resource-main-site');
  await expect(mainSiteLink).toHaveAttribute('href','https://rberrah.github.io/');
  await expect(mainSiteLink).toHaveAttribute('data-sveltekit-reload','');
  await mainSiteLink.click();
  await expect(page).toHaveURL('https://rberrah.github.io/');
  await expect(page.getByRole('heading',{name:/Racym Berrah/})).toBeVisible();
  await page.goto('/multiomics/glossary/');
  await expect(page.getByRole('heading',{name:/Glossaire des omiques|Omics glossary/})).toBeVisible();
  await page.goto('/multiomics/references/');
  await expect(page.getByRole('heading',{name:/Références scientifiques|Scientific references/})).toBeVisible();
  await expect(header.getByTestId('language-toggle')).toBeVisible();
  await expect(header.getByTestId('theme-toggle')).toBeVisible();
});

test('Assembled 320px navbar dropdowns preserve theme/locale and clean navigation',async({page})=>{
  await page.setViewportSize({width:320,height:720});
  await page.addInitScript(()=>{
    localStorage.setItem('pk-theme','dark');
    localStorage.setItem('pharmacometrie-language','en');
  });
  await page.goto('/multiomics/');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  const toggle=page.getByTestId('nav-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded','true');
  await page.getByTestId('goal-resources').locator('summary').click();
  await expect(page.getByTestId('nav-references')).toBeVisible();
  await page.getByTestId('nav-glossary').click();
  await expect(page).toHaveURL(/\/multiomics\/glossary\/$/);
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  await toggle.click();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(12);
});
