import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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
  const heights=await links.evaluateAll(nodes=>nodes.map(el=>el.getBoundingClientRect().height));
  expect(heights.every(height=>height>=24)).toBe(true);
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
