// @ts-nocheck — nécessite `npm install -D @playwright/test` (hors typecheck de l'app).
//
// Test de NON-RÉGRESSION d'un bug réel : une collision de nom dans CiteBlock.svelte
// (`copy` déclaré à la fois comme variable réactive d'i18n et comme fonction) faisait
// échouer l'hydratation de TOUTE la page de chapitre. Le HTML rendu au serveur
// s'affichait une fraction de seconde, puis Svelte vidait l'arbre : écran blanc.
//
// Aucun test existant ne l'attrapait, parce qu'ils vérifient ce qui est PRÉSENT dans le
// DOM — or le HTML serveur est correct, c'est la reprise côté client qui casse. Le seul
// signal fiable est donc l'absence d'exception pendant l'hydratation.
import { test, expect } from '@playwright/test';

/** Attache les collecteurs d'erreurs AVANT toute navigation. */
function collecteErreurs(page) {
  /** @type {string[]} */
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(`[exception] ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') erreurs.push(`[console] ${m.text()}`);
  });
  return erreurs;
}

test("une page de chapitre s'hydrate sans exception (chargement direct)", async ({ page }) => {
  const erreurs = collecteErreurs(page);

  await page.goto('/chapitres/pourquoi-pharmacometrie/');
  // L'hydratation est asynchrone : on attend que le réseau se taise, puis un instant
  // de plus — l'erreur survenait après le premier rendu, pas pendant.
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Le titre du chapitre doit être là APRÈS hydratation, pas seulement dans le HTML.
  await expect(page.getByTestId('chapter-title')).toBeVisible();
  await expect(page.getByTestId('author-signature')).toBeVisible();
  await expect(page.getByTestId('cite-block')).toBeVisible();

  expect(erreurs, `Erreurs relevées :\n${erreurs.join('\n')}`).toEqual([]);
});

test('« Commencer le cours » ouvre réellement le chapitre', async ({ page }) => {
  const erreurs = collecteErreurs(page);

  await page.goto('/');
  await page.getByTestId('cta-start').click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // La navigation côté client doit AFFICHER le chapitre : l'URL seule ne prouve rien,
  // c'était précisément le symptôme (bonne adresse, page blanche).
  await expect(page.getByTestId('chapter-title')).toBeVisible();
  expect(page.url()).toContain('/chapitres/');

  expect(erreurs, `Erreurs relevées :\n${erreurs.join('\n')}`).toEqual([]);
});

test("« Ouvrir le parcours » ouvre réellement le premier chapitre", async ({ page }) => {
  const erreurs = collecteErreurs(page);

  await page.goto('/');
  await page.getByTestId('track-open-core').click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('chapter-title')).toBeVisible();
  expect(erreurs, `Erreurs relevées :\n${erreurs.join('\n')}`).toEqual([]);
});

test("l'atelier Lego génère du code R dans les deux cibles", async ({ page }) => {
  const erreurs = collecteErreurs(page);

  await page.goto('/lego/');
  await page.waitForLoadState('networkidle');
  await page.locator('.toolbar button', { hasText: 'Oral 1-cpt' }).click();

  const bloc = page.locator('pre.codeblk code');

  await page.getByRole('tab', { name: 'nlmixr2' }).click();
  const nlmixr = await bloc.innerText();
  // Le bloc `ini()` était l'oubli principal : sans lui, le code ne s'exécute pas.
  expect(nlmixr).toContain('ini({');
  expect(nlmixr).toContain('model({');
  expect(nlmixr).toContain('nlmixr2(lego_model');
  expect(nlmixr).toMatch(/~ add\(add_err\) \+ prop\(prop_err\)/);

  await page.getByRole('tab', { name: 'mrgsolve' }).click();
  const mrg = await bloc.innerText();
  expect(mrg).toContain('$PARAM @annotated');
  expect(mrg).toContain('$CMT @annotated');
  expect(mrg).toContain('$ODE');
  expect(mrg).toContain('mcode("lego", code)');
  // Chaîne BRUTE de R : les annotations contiennent des apostrophes, une chaîne
  // délimitée par des apostrophes se refermerait au milieu du modèle.
  expect(mrg).toContain('code <- r"(');
  const corps = mrg.slice(mrg.indexOf('r"('), mrg.indexOf(')"'));
  expect(corps.length).toBeGreaterThan(50);

  expect(erreurs, `Erreurs relevées :\n${erreurs.join('\n')}`).toEqual([]);
});
