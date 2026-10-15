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
