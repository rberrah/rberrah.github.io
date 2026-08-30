import { test, expect } from '@playwright/test';

const engineUrl = /** @type {any} */ (globalThis).process?.env?.TDM_ENGINE_E2E_URL;

test.describe('pont Atelier Lego vers le moteur TDM', () => {
  test.describe.configure({ mode: 'serial' });
  test.skip(!engineUrl, 'Définir TDM_ENGINE_E2E_URL pour tester un moteur Shiny local.');

  test('le serveur régénère et compile une spécification Lego contrôlée', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(engineUrl);
    await page.waitForFunction(() => /** @type {any} */ (window).Shiny?.setInputValue);

    const abisLink = page.locator('.status-disclaimer a[href="https://abis.chu-limoges.fr/"]');
    await expect(abisLink).toHaveText('ABIS du CHU de Limoges.');
    await expect(abisLink).toHaveAttribute('target', '_blank');
    await expect(page.locator('#administration_route')).toHaveValue('IV');
    await expect(page.locator('label[for="dose_infusion_1"]')).toContainText('0 = bolus IV');
    await page.locator('#time_entry_mode').evaluate((element) => {
      /** @type {any} */ (element).selectize.setValue('relative_days');
    });
    await expect(page.locator('#dose_days_ago_1')).toBeAttached();
    await page.locator('#time_entry_mode').evaluate((element) => {
      /** @type {any} */ (element).selectize.setValue('relative_hours');
    });
    await expect(page.locator('#dose_count_1')).toBeVisible();
    await page.locator('#dose_ss_1').check();
    await expect(page.locator('#dose_count_1')).not.toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#download_patient').click();
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    let downloadedJson = '';
    for await (const chunk of stream) downloadedJson += chunk.toString();
    const exportedPatient = JSON.parse(downloadedJson);
    expect(exportedPatient.version).toBe(3);
    expect(exportedPatient.model.route).toBe('IV');
    expect(exportedPatient.doses[0].ss).toBe(1);
    expect(exportedPatient.doses[0].count).toBe(1);
    expect(exportedPatient.doses[0].status).toBe('administered');

    const specification = {
      version: 1,
      nodes: [
        { id: 1, kind: 'depot', name: 'depot', dose: 100 },
        { id: 2, kind: 'central', name: 'centr', dose: 0, vol: 30 }
      ],
      edges: [
        { from: 1, to: 2, k: 1 },
        { from: 2, to: 'OUT', k: 0.2 }
      ],
      covariates: [
        { name: 'WT', type: 'continuous', target: 'v_centr', reference: 70, comparison: 90, beta: 0.75 },
        { name: 'SEX', type: 'categorical', target: 'v_centr', reference: 0, comparison: 1, beta: 0.2 }
      ]
    };

    await page.evaluate((spec) => {
      const marker = `// PK_LEGO_SPEC_V1:${encodeURIComponent(JSON.stringify(spec))}`;
      /** @type {any} */ (window).Shiny.setInputValue('lego_model_import', {
        code: `${marker}\n$GLOBAL\n// ce texte client ne doit jamais être compilé`,
        spec: null,
        name: 'lego_model',
        nonce: Date.now()
      }, { priority: 'event' });
    }, specification);

    const code = page.locator('#custom_code');
    await expect(code).toHaveValue(/PK_LEGO_SPEC_V1/);
    await expect(code).not.toHaveValue(/texte client/);
    await expect(page.locator('#observation_cov_WT_1')).toHaveValue('70');
    await expect(page.locator('#observation_cov_SEX_1')).toHaveValue('0');
    await page.locator('#validate_model').click();
    await expect(page.locator('.status-pill.ok')).toHaveText('Modèle valide', { timeout: 60_000 });
    await expect(page.locator('.contract-ok')).toContainText('Contrat mapbayr valide');
  });

  test('une analyse expose historique, état stationnaire, PTA et traçabilité', async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto(engineUrl);
    await page.waitForFunction(() => /** @type {any} */ (window).Shiny?.setInputValue);

    await page.locator('#accept_disclaimer').check();
    await page.locator('#run_analysis').click();

    const exposure = page.locator('.exposure-strip');
    await expect(exposure).toContainText('AUC actuelle', { timeout: 120_000 });
    await expect(exposure).toContainText("AUC0-24 à l'état stationnaire");
    await expect(exposure).toContainText('C0 actuelle');
    await expect(page.locator('#future_comparison_plot img')).toBeVisible();
    await expect(page.locator('#averaging_sensitivity_table')).toBeVisible();
    await page.locator('#analysis_tabs a[data-value="dosing"]').click();
    await expect(page.locator('.recommendation-strip')).toContainText("Probabilité d'atteindre la cible");
    await page.locator('#analysis_tabs a[data-value="fit"]').click();

    const reportPromise = page.waitForEvent('download');
    await page.locator('#download_report').click();
    const report = await reportPromise;
    const stream = await report.createReadStream();
    let html = '';
    for await (const chunk of stream) html += chunk.toString();
    expect(html).toContain('AUC actuelle glissante');
    expect(html).toContain('Empreintes SHA-256 des modèles');
    expect(html).toContain('mapbayr');
    expect(html).toContain('Aucun artefact ML validé et compatible');
  });

  test('la configuration mobile est accessible sans débordement de la zone de travail', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(engineUrl);
    await page.waitForFunction(() => /** @type {any} */ (window).Shiny?.setInputValue);

    await expect(page.locator('.mobile-configure-button')).toBeVisible();
    await expect(page.locator('#dose_status_1')).toContainText('Administrée');
    const widths = await page.evaluate(() => {
      const main = document.querySelector('.bslib-sidebar-layout > .main');
      const workspace = document.querySelector('.workspace');
      return {
        bodyClient: document.body.clientWidth,
        bodyScroll: document.body.scrollWidth,
        mainClient: main?.clientWidth || 0,
        mainScroll: main?.scrollWidth || 0,
        workspaceClient: workspace?.clientWidth || 0,
        workspaceScroll: workspace?.scrollWidth || 0
      };
    });
    expect(widths.bodyScroll).toBeLessThanOrEqual(widths.bodyClient + 1);
    expect(widths.mainScroll).toBeLessThanOrEqual(widths.mainClient + 1);
    expect(widths.workspaceScroll).toBeLessThanOrEqual(widths.workspaceClient + 1);

    await page.locator('.mobile-configure-button').click();
    await expect(page.locator('.collapse-toggle')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.collapse-toggle')).toHaveAttribute('aria-label', 'Fermer la configuration');
    await expect(page.locator('.sidebar-heading')).toBeVisible();
  });
});
