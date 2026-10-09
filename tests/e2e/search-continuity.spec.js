// @ts-nocheck
import { test, expect } from '@playwright/test';

const prefix = process.env.COVARIATES_E2E_PREFIX || '';
const url = path => `${prefix}${path}`;

test('search supports aliases and independent type, level and track filters', async ({ page }) => {
  await page.goto(url('/recherche/?lang=en'));

  await page.getByTestId('global-search').fill('mipd');
  await expect(page.getByRole('status')).not.toContainText(/^0 results$/);
  await expect(page.locator('.group a').first()).toBeVisible();

  await page.getByTestId('global-search').fill('');
  await page.getByTestId('search-type').selectOption('glossary');
  await expect(page.locator('.group h2')).toHaveCount(1);
  await expect(page.locator('.group h2')).toContainText(['Glossary']);
  await expect(page.locator('.group a').first()).toBeVisible();

  await page.getByTestId('search-type').selectOption('');
  await page.getByTestId('search-level').selectOption('beginner');
  await expect(page.locator('.group a').first()).toBeVisible();
  await expect(page.locator('.group a small').first()).toContainText('beginner');

  await page.getByTestId('search-level').selectOption('');
  await expect(page.getByTestId('search-track').locator('option[value="mab"]')).toHaveText('Monoclonal antibodies');
  await page.getByTestId('search-track').selectOption('mab');
  await expect(page.locator('.group a').first()).toBeVisible();
  await expect(page.locator('.group a small').first()).toContainText('Monoclonal antibodies');
});

test('glossary connects a concept to its course, exercise and laboratory', async ({ page }) => {
  await page.goto(url('/glossaire/?lang=en&q=GFR'));
  const links = page.getByRole('navigation', { name: 'Related resources' });
  await expect(links.getByRole('link', { name: 'Course and sources' })).toHaveAttribute('href', /covariates-physiology/);
  await expect(links.getByRole('link', { name: 'Related exercise' })).toHaveAttribute('href', /covariates-implementation.*chapter-exercises/);
  await expect(links.getByRole('link', { name: 'Interactive laboratory' })).toHaveAttribute('href', /lab=covariate-clearance/);

  await links.getByRole('link', { name: 'Interactive laboratory' }).click();
  await expect(page.getByTestId('molecular-laboratory')).toBeVisible();
});

test('a chapter with several laboratories returns to the same originating chapter', async ({ page }) => {
  await page.goto(url('/chapitres/parent-metabolite/?lang=en'));
  const journey = page.getByTestId('concept-journey');
  await expect(journey.getByRole('link')).toHaveCount(2);

  await journey.getByRole('link').first().click();
  await expect(page).toHaveURL(/lab=parent-metabolite.*from=parent-metabolite/);
  await expect(page.getByTestId('lab-return-course')).toContainText('originating course');
  await expect(page.getByTestId('lab-related-exercises')).toHaveAttribute('href', /chapitres\/parent-metabolite\/.*chapter-exercises/);
  await page.getByTestId('lab-return-course').click();
  await expect(page).toHaveURL(/chapitres\/parent-metabolite\//);

  await page.goto(url('/laboratoires/?lang=en&lab=parent-metabolite&from=not-a-chapter'));
  await expect(page.getByTestId('lab-return-course')).toHaveAttribute('href', /chapitres\/parent-metabolite\//);
  await expect(page.getByTestId('lab-return-course')).not.toContainText('originating');
});
