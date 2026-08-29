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
    await expect(page.locator('input[type="range"]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Ajouter une covariable continue', exact: true }).click();
    await page.getByRole('button', { name: 'Ajouter une covariable catégorielle' }).click();
    await expect(page.locator('.chart .serie')).toHaveCount(3);
    await expect(page.locator('.chart-legend')).toContainText('WT = 87.5');
    await expect(page.locator('.chart-legend')).toContainText('SEX = 1');
    await page.locator('.cov-toggle input').first().uncheck();
    await expect(page.locator('.chart .serie')).toHaveCount(2);
    await page.locator('.cov-toggle input').first().check();
    await expect(page.locator('.chart .serie')).toHaveCount(3);

  const bloc = page.locator('pre.codeblk code');

  await page.getByRole('tab', { name: 'nlmixr2' }).click();
  const nlmixr = await bloc.innerText();
  // Le bloc `ini()` était l'oubli principal : sans lui, le code ne s'exécute pas.
  expect(nlmixr).toContain('ini({');
  expect(nlmixr).toContain('model({');
  expect(nlmixr).toContain('nlmixr2(lego_model');
  expect(nlmixr).toMatch(/~ add\(add_err\) \+ prop\(prop_err\)/);
    expect(nlmixr).toContain('beta_WT_');
    expect(nlmixr).toContain('log(WT/70)');
    expect(nlmixr).toContain('beta_SEX_');
    expect(nlmixr).toContain('(SEX == 1)');

  await page.getByRole('tab', { name: 'mrgsolve' }).click();
  const mrg = await bloc.innerText();
  expect(mrg).toContain('// PK_LEGO_SPEC_V1:');
  expect(mrg).toContain('$PARAM @annotated');
  expect(mrg).toContain('$OMEGA @annotated');
  expect(mrg).toContain('$SIGMA @annotated');
    expect(mrg).toContain('$PARAM @covariates @annotated');
    expect(mrg).toContain('pow(WT/70');
    expect(mrg).toMatch(/exp\(BETA_SEX_.+ \* \(SEX == 1\)\)/);
  expect(mrg).toContain('$CMT @annotated');
  expect(mrg).toContain('$ODE');
  expect(mrg).toContain('$CAPTURE @annotated');
  expect(mrg).toContain('double DV = IPRED');

  expect(erreurs, `Erreurs relevées :\n${erreurs.join('\n')}`).toEqual([]);
});

test("la bibliothèque TDM attribue les modèles aux articles", async ({ page }) => {
  await page.goto('/tdm/');
  await page.getByRole('searchbox', { name: 'Recherche' }).fill('Woillard');

  const card = page.locator('.model-card');
  await expect(card).toHaveCount(1);
  await expect(card.getByRole('heading', { level: 3 })).toHaveText('Woillard');
  await expect(card).toContainText('Article source');
  await expect(card).toContainText('Woillard JB et al.');
  await expect(card.getByRole('link', { name: /DOI 10\.1111\/j\.1365-2125\.2010\.03837\.x/ })).toBeVisible();
  await expect(page.locator('body')).not.toContainText('Woillard DDI');
  await expect(page.locator('body')).not.toContainText('DDI Manager+');
  await expect(page.locator('body')).not.toContainText('PopPK Model');
});
