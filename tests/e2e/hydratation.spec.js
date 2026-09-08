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

test("l'atelier Lego génère les quatre langages de modélisation", async ({ page }) => {
  const erreurs = collecteErreurs(page);

  await page.goto('/lego/');
  await page.waitForLoadState('networkidle');
  await page.locator('.toolbar button', { hasText: 'Oral 1-cpt' }).click();
    await expect(page.locator('input[type="range"]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Ajouter une covariable continue', exact: true }).click();
    await page.getByRole('button', { name: 'Ajouter une covariable catégorielle' }).click();
    await page.locator('.cov-row').first().locator('select').nth(1).selectOption('administration');
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
    expect(mrg).toContain('[administration]');
    expect(mrg).toContain('pow(WT/70');
    expect(mrg).toMatch(/exp\(BETA_SEX_.+ \* \(SEX == 1\)\)/);
  expect(mrg).toContain('$CMT @annotated');
  expect(mrg).toContain('$ODE');
  expect(mrg).toContain('$CAPTURE @annotated');
  expect(mrg).toContain('double DV = IPRED');
  expect(mrg).not.toContain('$PLUGIN evtools');
  expect(mrg).not.toContain('LEGO_INPUT');
  expect(mrg).toMatch(/depot\s+:.*\[ADM\]/);

  await page.getByRole('tab', { name: 'MLXTRAN' }).click();
  const mlxtran = await bloc.innerText();
  expect(mlxtran).toContain('[COVARIATE]');
  expect(mlxtran).toContain('[INDIVIDUAL]');
  expect(mlxtran).toContain('[LONGITUDINAL]');
  expect(mlxtran).toContain('logt_WT = log(WT/70)');
  expect(mlxtran).toContain('SEX = {type=categorical, categories={0, 1}}');
  expect(mlxtran).toContain('ddt_depot =');
  expect(mlxtran).toContain('errorModel=combined1(a, b)');
  expect(mlxtran).toContain('output = {DV}');

  await page.getByRole('tab', { name: 'NONMEM' }).click();
  const nonmem = await bloc.innerText();
  expect(nonmem).toContain('; PK_LEGO_SPEC_V1:');
  expect(nonmem).toContain('$PROBLEM Atelier Lego');
  expect(nonmem).toContain('$INPUT ID TIME DV AMT EVID MDV CMT WT SEX');
  expect(nonmem).toContain('$SUBROUTINES ADVAN13 TOL=9');
  expect(nonmem).toContain('$MODEL');
  expect(nonmem).toContain('$PK');
  expect(nonmem).toContain('IF (SEX.EQ.1) CAT1=1');
  expect(nonmem).toContain('$DES');
  expect(nonmem).toContain('DADT(1)=');
  expect(nonmem).toContain('$ERROR');
  expect(nonmem).toContain('Y=IPRED*(1+EPS(1))+EPS(2)');
  expect(nonmem).toContain('$ESTIMATION METHOD=1 INTERACTION');

  await page.locator('.toolbar button.add', { hasText: 'Effet' }).click();
  await page.locator('.toolbar button.add', { hasText: 'Réponse' }).click();
  await page.getByRole('tab', { name: 'MLXTRAN' }).click();
  const mlxtranPd = await bloc.innerText();
  expect(mlxtranPd).toContain('ddt_Ce = ke0_Ce*');
  expect(mlxtranPd).toContain('R_0 = kin_R/kout_R');
  expect(mlxtranPd).toContain('ddt_R = kin_R*');

  await page.getByRole('tab', { name: 'NONMEM' }).click();
  const nonmemPd = await bloc.innerText();
  expect(nonmemPd).toContain('IF (A_0FLG.EQ.1) THEN');
  expect(nonmemPd).toContain('A_0(4)=');
  expect(nonmemPd).toContain('DADT(3)=');
  expect(nonmemPd).toContain('DADT(4)=');
  expect(nonmemPd).toContain('ENDIF');

  expect(erreurs, `Erreurs relevées :\n${erreurs.join('\n')}`).toEqual([]);
});

test("l'atelier Lego importe un modèle MLXTRAN et conserve les exports TDM", async ({ page }) => {
  const erreurs = collecteErreurs(page);
  await page.goto('/lego/');
  await page.waitForLoadState('networkidle');
  await page.locator('.mlxtran-import summary').click();
  await page.locator('.mlxtran-import textarea').fill(`
; ka_pop = 1.2
; V_pop = 35
; Cl_pop = 4.5
; Q_pop = 3
; V2_pop = 50
; beta_WT_Cl = 0.6
; beta_SEX_Cl = -0.2
[COVARIATE]
input = {WT, SEX}
SEX = {type=categorical, categories={0, 1}}
EQUATION:
logt_WT = log(WT/70)
[INDIVIDUAL]
DEFINITION:
Cl = {distribution=logNormal, typical=Cl_pop, covariate={logt_WT, SEX}, coefficient={beta_WT_Cl, {0, beta_SEX_Cl}}, sd=omega_Cl}
V = {distribution=logNormal, typical=V_pop, sd=omega_V}
[LONGITUDINAL]
input = {ka, V, Cl, Q, V2, a, b}
PK:
Cc = pkmodel(ka, V, Cl, Q, V2)
DEFINITION:
DV = {distribution=normal, prediction=Cc, errorModel=combined1(a,b)}
OUTPUT:
output = {DV}
  `);
  await page.getByRole('button', { name: 'Construire le schéma' }).click();

  await expect(page.locator('.import-status')).toContainText('Structure reconnue');
  await expect(page.locator('.canvas .node')).toHaveCount(3);
  await expect(page.locator('.cov-row')).toHaveCount(2);
  await expect(page.locator('.tdm-launch')).toBeEnabled();
  await expect(page.locator('.codehead').getByRole('tab', { name: 'MLXTRAN' })).toHaveAttribute('aria-selected', 'true');

  await page.locator('.codehead').getByRole('tab', { name: 'mrgsolve' }).click();
  const mrgsolve = await page.locator('pre.codeblk code').innerText();
  expect(mrgsolve).toContain('// PK_LEGO_SPEC_V1:');
  expect(mrgsolve).toContain('$PARAM @covariates @annotated');
  expect(mrgsolve).toContain('BETA_WT_cl_central');
  expect(mrgsolve).toContain('BETA_SEX_cl_central');
  expect(mrgsolve).toContain('(SEX == 1)');

  for (let index = 0; index < 10; index++) {
    await page.getByRole('button', { name: 'Ajouter une covariable continue', exact: true }).click();
  }
  await expect(page.locator('.cov-row')).toHaveCount(12);

  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('.mlxtran-import summary')).toHaveText('Import a model');
  expect(erreurs, `Erreurs relevées :\n${erreurs.join('\n')}`).toEqual([]);
});

test("l'import MLXTRAN reconnaît un régresseur dans les équations structurelles", async ({ page }) => {
  const erreurs = collecteErreurs(page);
  await page.goto('/lego/');
  await page.waitForLoadState('networkidle');
  await page.locator('.mlxtran-import summary').click();
  await page.locator('.mlxtran-import textarea').fill(String.raw`
[LONGITUDINAL]
input = {Vstd, Clstd, POIDS, E0, slope}
POIDS = {use=regressor}
PK:
V = Vstd \* (POIDS / 1.1)
Cl = Clstd \* (POIDS / 1.1)\^0.75
Cc = pkmodel(V, Cl)
EQUATION:
E = E0 + slope \* log(1+max(Cc,0))
OUTPUT:
output = {Cc, E}
  `);
  await page.getByRole('button', { name: 'Construire le schéma' }).click();

  await expect(page.locator('.import-status')).toContainText('Structure reconnue');
  await expect(page.locator('.canvas .node')).toHaveCount(1);
  await expect(page.locator('.cov-row')).toHaveCount(2);

  await page.locator('.codehead').getByRole('tab', { name: 'mrgsolve' }).click();
  const mrgsolve = await page.locator('pre.codeblk code').innerText();
  expect(mrgsolve).toContain('pow(POIDS/1.1, BETA_POIDS_v_central)');
  expect(mrgsolve).toContain('pow(POIDS/1.1, BETA_POIDS_cl_central)');
  expect(mrgsolve).toContain('BETA_POIDS_v_central : 1');
  expect(mrgsolve).toContain('BETA_POIDS_cl_central : 0.75');
  expect(erreurs, `Erreurs relevées :\n${erreurs.join('\n')}`).toEqual([]);
});

test("l'atelier Lego importe aussi mrgsolve et NONMEM", async ({ page }) => {
  const erreurs = collecteErreurs(page);
  await page.goto('/lego/');
  await page.waitForLoadState('networkidle');
  await page.locator('.mlxtran-import summary').click();
  const importer = page.locator('.mlxtran-import');

  await importer.getByRole('tab', { name: 'mrgsolve' }).click();
  await importer.locator('textarea').fill(`
$PARAM TVCL=5, TVV=30, TVKA=1.2, WT=70, BETA_WT_CL=0.75
$PARAM @covariates @annotated
WT : 70 : weight
$CMT @annotated
GUT : depot [ADM]
CENT : central [OBS]
$MAIN
double CL=TVCL*pow(WT/70,BETA_WT_CL);
double V=TVV;
double KA=TVKA;
$ODE
dxdt_GUT=-KA*GUT;
dxdt_CENT=KA*GUT-CL*CENT/V;
  `);
  await importer.getByRole('button', { name: 'Construire le schéma' }).click();
  await expect(importer.locator('.import-status')).toContainText('Structure reconnue');
  await expect(page.locator('.canvas .node')).toHaveCount(2);
  await expect(page.locator('.cov-row')).toHaveCount(1);
  await expect(page.locator('.codehead').getByRole('tab', { name: 'mrgsolve' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('pre.codeblk code')).toContainText('pow(WT/70');

  await importer.getByRole('tab', { name: 'NONMEM' }).click();
  await importer.locator('textarea').fill(`
$PROBLEM Oral model
$INPUT ID TIME DV AMT EVID MDV CMT WT
$SUBROUTINES ADVAN2 TRANS2
$PK
TVCL=THETA(1)*(WT/70)**THETA(4)
CL=TVCL*EXP(ETA(1))
V=THETA(2)
KA=THETA(3)
$THETA
(0,5) ; CL
(0,30) ; V
(0,1.2) ; KA
(-2,0.75,2) ; weight effect
  `);
  await importer.getByRole('button', { name: 'Construire le schéma' }).click();
  await expect(importer.locator('.import-status')).toContainText('Structure reconnue');
  await expect(page.locator('.canvas .node')).toHaveCount(2);
  await expect(page.locator('.cov-row')).toHaveCount(1);
  await expect(page.locator('.codehead').getByRole('tab', { name: 'NONMEM' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('pre.codeblk code')).toContainText('(WT/70)**');
  await expect(page.locator('.tdm-launch')).toBeEnabled();
  expect(erreurs, `Erreurs relevées :\n${erreurs.join('\n')}`).toEqual([]);
});

test("l'atelier Lego construit une double absorption retardée, d'ordre zéro et saturable", async ({ page }) => {
  const erreurs = collecteErreurs(page);
  await page.goto('/lego/');
  await page.waitForLoadState('networkidle');
  await page.locator('.toolbar button', { hasText: 'Double absorption' }).click();

  await expect(page.locator('.canvas .node')).toHaveCount(3);
  await expect(page.locator('.chart .serie')).toHaveCount(1);
  await page.locator('.canvas .node').first().click();
  await expect(page.locator('.input-settings')).toContainText("Entrée d'ordre zéro");
  await expect(page.locator('.input-settings')).toContainText('Fraction de dose (%)');
  await expect(page.locator('.input-settings input[type="number"]')).toHaveCount(4);

  const firstTransfer = page.locator('.rate').first();
  await firstTransfer.locator('select').first().selectOption('michaelis_menten');
  await expect(firstTransfer).toContainText('Vmax');
  await expect(firstTransfer).toContainText('Km');

  const bloc = page.locator('pre.codeblk code');
  await page.getByRole('tab', { name: 'mrgsolve' }).click();
  const mrg = await bloc.innerText();
  expect(mrg).toContain('$PLUGIN evtools');
  expect(mrg).toContain('evt::infuse(AMT*f_rapid');
  expect(mrg).toContain('evt::retime(route_2, TIME + tlag_slow)');
  expect(mrg).toContain('vmax_rapid_centr');
  expect(mrg).toContain('cl_centr*centr/v_centr');

  await page.getByRole('tab', { name: 'nlmixr2' }).click();
  const nlmixr = await bloc.innerText();
  expect(nlmixr).toContain('f(rapid) <- f_rapid');
  expect(nlmixr).toContain('dur(rapid) <- tk0_rapid');
  expect(nlmixr).toContain('alag(slow) <- tlag_slow');

  await page.getByRole('tab', { name: 'MLXTRAN' }).click();
  const mlxtran = await bloc.innerText();
  expect(mlxtran).toContain('depot(target=rapid, adm=1, p=f_rapid, Tk0=tk0_rapid)');
  expect(mlxtran).toContain('depot(target=slow, adm=1, p=f_slow, Tlag=tlag_slow)');

  await page.getByRole('tab', { name: 'NONMEM' }).click();
  const nonmem = await bloc.innerText();
  expect(nonmem).toContain('F1=');
  expect(nonmem).toContain('D1=');
  expect(nonmem).toContain('ALAG2=');
  expect(nonmem).toContain('RATE=-2');

  await page.locator('.toolbar button', { hasText: 'KOKA (Samtani)' }).click();
  await expect(page.locator('.rate').nth(0).locator('input[type="number"]')).toHaveValue('0.000488');
  await expect(page.locator('.rate').nth(1).locator('input[type="number"]')).toHaveValue('4.95');
  await page.locator('.canvas .node', { hasText: 'central' }).click();
  await expect(page.locator('.input-settings')).toContainText('Durée égale au Tlag de');
  await expect(page.locator('.input-settings select').nth(1)).toHaveValue(/\d+/);
  await page.getByRole('tab', { name: 'mrgsolve' }).click();
  const koka = await bloc.innerText();
  expect(koka).toContain('evt::infuse(AMT*f_central');
  expect(koka).toContain('AMT*f_central/tlag_slow');
  expect(koka).toContain('evt::bolus(AMT*(1-f_central)');
  expect(koka).not.toContain('TV_f_slow');
  expect(koka).not.toContain('TV_tk0_central');

  await page.locator('.toolbar button', { hasText: "PP6M (T'jollyn)" }).click();
  await expect(page.locator('.rate').first()).toContainText('Saturable de Hill');
  await expect(page.locator('.rate').first()).toContainText('A50');
  await expect(page.locator('.rate').first()).toContainText('γ');
  await page.getByRole('tab', { name: 'mrgsolve' }).click();
  const pp6m = await bloc.innerText();
  expect(pp6m).toContain('pow(slow, gamma_slow_central)');
  expect(pp6m).toContain('AMT*(1-f_slow)');

  await page.screenshot({ path: 'test-results/lego-dual-absorption.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.locator('.toolbar button', { hasText: 'Double absorption' }).click();
  await page.locator('.canvas .node').first().click();
  const mobileWidth = await page.evaluate(() => ({ viewport: window.innerWidth, content: document.documentElement.scrollWidth }));
  expect(mobileWidth.content).toBeLessThanOrEqual(mobileWidth.viewport + 1);
  await expect(page.locator('.input-settings')).toBeVisible();
  await page.screenshot({ path: 'test-results/lego-dual-absorption-mobile.png', fullPage: true });
  expect(erreurs, `Erreurs relevées :\n${erreurs.join('\n')}`).toEqual([]);
});

test("la bibliothèque TDM attribue les modèles aux articles", async ({ page }) => {
  await page.goto('/tdm/');
  await page.getByRole('searchbox', { name: 'Recherche' }).fill('Woillard');

  const card = page.locator('.model-card');
  await expect(card).toHaveCount(1);
  await expect(card.getByRole('heading', { level: 3 })).toHaveText('Woillard');
  await expect(card).toContainText('Article source');
  await expect(card).toContainText('Orale');
  await expect(card).toContainText('Adaptation documentée');
  await expect(card).toContainText('Woillard JB et al.');
  await expect(card.getByRole('link', { name: /DOI 10\.1111\/j\.1365-2125\.2010\.03837\.x/ })).toBeVisible();
  await expect(page.locator('body')).not.toContainText('Woillard DDI');
  await expect(page.locator('body')).not.toContainText('DDI Manager+');
  await expect(page.locator('body')).not.toContainText('PopPK Model');

  await page.getByRole('searchbox', { name: 'Recherche' }).fill('');
  await page.getByRole('combobox', { name: "Voie d'administration" }).selectOption('IV_CONTINUOUS');
  await expect(page.locator('.model-card')).toHaveCount(3);
  await expect(page.locator('.model-card')).toContainText(['Rambaud', 'Revilla', 'Roberts']);
  await expect(page.locator('.model-card').first()).toContainText('IV continue');
});
