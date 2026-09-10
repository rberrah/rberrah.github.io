// @ts-nocheck — nécessite `npm install -D @playwright/test` (hors typecheck de l'app).
// Smoke e2e : le site charge, navigue, recherche, ouvre un chapitre avec sa viz et
// ses exercices, la page « Pour aller plus loin » liste des liens externes.
import { test, expect } from '@playwright/test';

test('la page d\'accueil charge', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('site-header')).toBeVisible();
  await expect(page.getByTestId('logo-link')).toBeVisible();
});

test('la liste des chapitres et la recherche fonctionnent', async ({ page }) => {
  await page.goto('/chapitres');
  const cards = page.getByTestId('chapter-card');
  await expect(cards.first()).toBeVisible();
  const total = await cards.count();
  expect(total).toBeGreaterThan(30);

  // la recherche filtre
  await page.getByTestId('chapter-search').fill('vancomycine');
  await expect(page.getByTestId('search-results')).toBeVisible();
  const found = await page.getByTestId('chapter-card').count();
  expect(found).toBeGreaterThan(0);
  expect(found).toBeLessThan(total);
});

test('un chapitre affiche titre, visualisation et exercices', async ({ page }) => {
  await page.goto('/chapitres/clairance-volume-demi-vie');
  await expect(page.getByTestId('chapter-title')).toBeVisible();
  await expect(page.getByTestId('viz-panel')).toBeVisible();
  await expect(page.getByTestId('chapter-exercises')).toBeVisible();
});

test('la page exercices permet de répondre', async ({ page }) => {
  await page.goto('/exercices');
  await page.waitForLoadState('networkidle');
  const firstOption = page.locator('.opt').first();
  await expect(firstOption).toBeVisible();
  await firstOption.click();
  await expect(page.locator('.feedback').first()).toBeVisible();
});

test('la page Pour aller plus loin liste des liens externes', async ({ page }) => {
  await page.goto('/references');
  const links = page.locator('a[target="_blank"]');
  await expect(links.first()).toBeVisible();
  expect(await links.count()).toBeGreaterThan(10);
});

test('le sélecteur de langue bascule en anglais', async ({ page }) => {
  await page.goto('/chapitres');
  await page.waitForLoadState('networkidle');
  if (await page.getByTestId('nav-toggle').isVisible()) await page.getByTestId('nav-toggle').click();
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  // le titre de section « Chapters » (EN) ou un libellé de parcours anglais apparaît
  await expect(page.locator('body')).toContainText(/Chapters|Track|Course/i);
});

test('la page interactions présente le module DDI', async ({ page }) => {
  await page.goto('/interactions');
  await expect(page.getByRole('heading', { name: 'Interactions médicamenteuses' })).toBeVisible();
  await expect(page.getByTestId('ddi-workbench')).toContainText('Recherche / en cours');
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.getByTestId('curve-ddi_time')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ouvrir dans le moteur' })).toBeVisible();
});

test('la page pharmacodynamie ouvre son atelier', async ({ page }) => {
  await page.goto('/pharmacodynamie');
  await expect(page.getByRole('heading', { name: 'Pharmacodynamie' })).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.getByTestId('curve-tumor_comparison')).toBeVisible();
});

test('les libellés scientifiques des visualisations passent en anglais', async ({ page }) => {
  await page.goto('/chapitres/infectio-pkpd?lang=en');
  await expect(page.getByTestId('viz-panel')).toContainText('MIC (mg/L)');
  await expect(page.getByTestId('viz-panel')).not.toContainText('CMI (mg/L)');
  await expect(page.getByTestId('viz-panel').locator('svg')).toContainText('Time (h)');
});
