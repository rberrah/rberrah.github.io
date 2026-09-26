// @ts-nocheck
import { test, expect } from '@playwright/test';

test('multi-omics French import screen avoids unexplained metadata jargon', async ({ page }) => {
  await page.goto('/multiomics/tool');

  await expect(page.getByTestId('multiomics-sample-sheet-guide')).toContainText('tableau des échantillons');
  const glossary = page.getByTestId('multiomics-quick-glossary');
  await expect(glossary).toBeVisible();
  await expect(glossary.getByText('Lexique express · six mots utilisés dans tout l’outil')).toBeVisible();
  await glossary.locator('summary').click();
  await expect(glossary).toContainText('Série technique');
  await expect(glossary).toContainText('Facteur d’ajustement');
  await expect(glossary).toContainText('Résultat corrigé (q/FDR)');
  await expect(glossary).toContainText('Validation croisée');

  await page.locator('.language-toggle').getByRole('button', { name: 'EN', exact: true }).click();
  await expect(glossary).toContainText('Quick glossary · six terms used throughout the tool');
  await expect(glossary).toContainText('Technical series');
  await expect(glossary).toContainText('Adjustment factor');
  await page.locator('.language-toggle').getByRole('button', { name: 'FR', exact: true }).click();
  await expect(glossary).toContainText('Lexique express · six mots utilisés dans tout l’outil');

  await expect(page.getByText('Aucun fichier sélectionné').first()).toBeVisible();
  await expect(page.getByText('Détail des colonnes du tableau des échantillons')).toBeVisible();
  await expect(page.getByText('Tableau des échantillons').first()).toBeVisible();
  await expect(page.getByText('Métadonnées échantillons')).toHaveCount(0);
});

test('multi-omics result summary uses plain-language study checks', async ({ page }) => {
  await page.route('https://reactome.org/AnalysisService/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        summary: { token: 'PLAIN_LANGUAGE_TEST', type: 'OVERREPRESENTATION' },
        pathwaysFound: 0,
        identifiersNotFound: 0,
        pathways: []
      })
    });
  });

  await page.goto('/multiomics/tool');
  await page.getByTestId('multiomics-load-demo').click();
  await expect(page.getByTestId('multiomics-results')).toBeVisible({ timeout: 20_000 });

  const readiness = page.getByTestId('multiomics-plain-readiness');
  await expect(readiness).toBeVisible({ timeout: 10_000 });
  await expect(readiness).toContainText('Vérification avant d’interpréter les résultats');
  await expect(readiness).toContainText('Chevauchement entre omiques');
  await expect(readiness).toContainText('Séries techniques');
  await expect(readiness).toContainText('Données manquantes et mesures à vérifier');
  await expect(readiness.getByText('À propos de la puissance statistique')).toBeVisible();

  await expect(page.getByText('Vérification des séries techniques')).toBeVisible();
  await expect(page.getByText('Audit des batches techniques')).toHaveCount(0);

  const interpretation = page.getByTestId('multiomics-interpretation');
  await expect(interpretation).toContainText('Différence observée');
  await expect(interpretation).toContainText('Résultat après correction statistique');
  await expect(interpretation).not.toContainText('Effet biologique');
  await expect(interpretation).not.toContainText('Significativité');
});
