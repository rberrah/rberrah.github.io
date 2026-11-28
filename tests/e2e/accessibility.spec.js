import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

for (const route of [
  '/?lang=en',
  '/chapitres/clairance-volume-demi-vie/?lang=en',
  '/laboratoires/?lang=en',
  '/pk/?lang=en',
  '/playground/?lang=en'
]) {
  test(`automated accessibility checks ${route}`, async ({ page }) => {
    await page.goto(route);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const serious = result.violations
      .filter((violation) => ['critical', 'serious'].includes(violation.impact ?? ''))
      .map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join('; ')}`);
    expect(serious).toEqual([]);
  });
}

test('keyboard navigation and non-drag alternatives remain available', async ({ page }) => {
  await page.goto('/pk/?lang=en');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toBeVisible();
  await expect(page.locator('.canvas .node').first()).toHaveAttribute('tabindex', '0');
  await page.locator('.canvas .node').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('spinbutton', { name: 'Dose (mg)' })).toBeVisible();
  await expect(page.getByRole('spinbutton', { name: 'Dose (mg)' })).toBeEditable();
});

test('ML comparison bars have permitted accessible image names', async ({page})=>{
  await page.goto('/ml/?lang=en');
  const bars=page.locator('.bar-line .track');
  await expect(bars.first()).toBeVisible();
  expect(await bars.count()).toBeGreaterThan(0);
  for(const bar of await bars.all()){
    await expect(bar).toHaveAttribute('role','img');
    await expect(bar).toHaveAttribute('aria-label',/\S/);
  }
  const audit=await new AxeBuilder({page}).withRules(['aria-prohibited-attr']).analyze();
  expect(audit.violations).toEqual([]);
});

test('glossary related-resource targets are at least 24px high',async({page})=>{
  await page.goto('/glossaire/?lang=en');
  const links=page.locator('.links a,.relations a');
  await expect(links.first()).toBeVisible();
  const targets=await links.evaluateAll(nodes=>nodes.map(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}))); 
  expect(targets.every(({height})=>height>=24)).toBe(true);
  const related=await page.locator('.relations a').evaluateAll(nodes=>nodes.map(el=>el.getBoundingClientRect().width));
  expect(related.every(width=>width>=24)).toBe(true);
});

test('overflow code blocks gain keyboard access without changing the source text',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/chapitres/nonmem-modele-structural/?lang=en');
  const pre=page.locator('.prose pre').first();
  await expect(pre).toBeVisible();
  await pre.evaluate(el=>{el.style.maxWidth='100px';el.style.width='100px';el.style.overflowX='auto';});
  await expect.poll(()=>pre.evaluate(el=>el.scrollWidth>el.clientWidth+1)).toBe(true);
  await expect(pre).toHaveAttribute('tabindex','0');
  await pre.focus();
  await expect(pre).toBeFocused();
});

test('scroll access covers one-pixel and dynamic overflow without redundant stops', async ({page})=>{
  const source=await readFile(new URL('../../src/lib/utils/scrollKeyboardAccess.js',import.meta.url),'utf8');
  await page.setContent('<style>pre{width:100px;overflow:auto}span.wide{display:inline-block;width:101px}</style><main><pre id="one"><span class="wide">x</span></pre><pre id="short">short</pre><pre id="hidden"><span class="wide">x</span><button hidden>hidden</button></pre><pre id="authored" tabindex="0">short</pre></main>');
  await page.addScriptTag({content:source.replace('export function','function')+'\nwindow.__scrollAccess=scrollKeyboardAccess(document.querySelector("main"),true);'});
  await expect(page.locator('#one')).toHaveAttribute('tabindex','0');
  await expect(page.locator('#hidden')).toHaveAttribute('tabindex','0');
  await expect(page.locator('#short')).not.toHaveAttribute('tabindex','0');
  await page.locator('#short').evaluate(el=>{el.innerHTML='<span class="wide">x</span>';});
  await expect(page.locator('#short')).toHaveAttribute('tabindex','0');
  await page.locator('#short span').evaluate(el=>{el.style.width='10px';});
  await expect(page.locator('#short')).not.toHaveAttribute('tabindex','0');
  await page.locator('#hidden button').evaluate(el=>{el.hidden=false;});
  await expect(page.locator('#hidden')).not.toHaveAttribute('tabindex','0');
  await page.evaluate(()=>window.__scrollAccess.destroy());
  await expect(page.locator('#one')).not.toHaveAttribute('tabindex','0');
  await expect(page.locator('#authored')).toHaveAttribute('tabindex','0');
});
test('native range targets on PD and FIH have 24px minimum height',async({page})=>{
  for(const route of ['/chapitres/pd-direct/?lang=en','/chapitres/trials-fih/?lang=en']){
    await page.goto(route);
    const range=page.locator('input[type="range"]').first();
    await expect(range).toBeVisible();
    expect((await range.boundingBox())?.height).toBeGreaterThanOrEqual(24);
  }
});
