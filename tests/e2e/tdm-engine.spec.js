import { test, expect } from '@playwright/test';

const engineUrl = /** @type {any} */ (globalThis).process?.env?.TDM_ENGINE_E2E_URL;

test.describe('pont Atelier Lego vers le moteur TDM', () => {
  test.describe.configure({ mode: 'serial' });
  test.skip(!engineUrl, 'Définir TDM_ENGINE_E2E_URL pour tester un moteur Shiny local.');

  test('le serveur régénère et compile une spécification Lego contrôlée', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(engineUrl);
    await page.waitForFunction(() => /** @type {any} */ (window).Shiny?.shinyapp?.$socket?.readyState === 1);

    const abisLink = page.locator('.status-disclaimer a[href="https://abis.chu-limoges.fr/"]');
    await expect(abisLink).toHaveText('ABIS du CHU de Limoges.');
    await expect(abisLink).toHaveAttribute('target', '_blank');
    await expect(page.locator('#administration_route')).toHaveValue('IV');
    await expect(page.locator('label[for="dose_infusion_1"]')).toContainText('0 = bolus IV');

    const controlPositions = await page.evaluate(() => {
      const model = document.querySelector('#model_id')?.closest('.shiny-input-container');
      const route = document.querySelector('#administration_route')?.closest('.shiny-input-container');
      if (!model || !route) throw new Error('Les contrôles modèle et voie doivent être visibles.');
      return { modelTop: model.getBoundingClientRect().top, routeTop: route.getBoundingClientRect().top };
    });
    expect(controlPositions.routeTop).toBeGreaterThan(controlPositions.modelTop);

    const intervalInput = page.locator('#dose_interval_1');
    await expect(intervalInput).toBeVisible();
    expect((await intervalInput.boundingBox())?.width).toBeGreaterThan(100);
    await intervalInput.fill('8');
    await expect(intervalInput).toHaveValue('8');

    await expect(page.locator('#dose_time_uncertainty_1')).not.toBeVisible();
    await page.locator('#dose_status_1').evaluate((element) => {
      /** @type {any} */ (element).selectize.setValue('uncertain');
    });
    await expect(page.locator('#dose_time_uncertainty_1')).toBeVisible();
    await page.locator('#dose_time_uncertainty_1').fill('2');
    await page.locator('#dose_status_1').evaluate((element) => {
      /** @type {any} */ (element).selectize.setValue('administered');
    });
    await expect(page.locator('#dose_time_uncertainty_1')).not.toBeVisible();

    await expect(page.locator('#observation_lloq_1')).not.toBeVisible();
    await page.locator('#observation_blq_1').check();
    await expect(page.locator('#observation_lloq_1')).toBeVisible();
    expect((await page.locator('#observation_lloq_1').boundingBox())?.width).toBeGreaterThan(100);
    await page.locator('#observation_lloq_1').fill('1');
    await page.locator('#observation_blq_1').uncheck();
    await expect(page.locator('#observation_lloq_1')).not.toBeVisible();

    await page.waitForFunction(() => !document.documentElement.classList.contains('shiny-busy'));
    await page.locator('#model_id-selectized').click();
    await page.locator('.selectize-dropdown-content [data-value="tacrolimus_woillard_ddi"]').click();
    await expect(page.locator('.model-context-head')).toContainText('Woillard', { timeout: 15_000 });
    await expect(page.locator('#administration_route')).toHaveValue('Oral');
    await expect(page.locator('#dose_infusion_1')).not.toBeVisible();
    await expect(page.locator('.dose-row .route-readonly')).toContainText('perfusion est imposée à 0 h');

    await page.locator('#model_id-selectized').click();
    await page.locator('.selectize-dropdown-content [data-value="amox_mellon"]').click();
    await expect(page.locator('.model-context-head')).toContainText('Mellon', { timeout: 15_000 });
    await expect(page.locator('#administration_route')).toHaveValue('Oral');
    const mellonRoutes = await page.locator('#administration_route').evaluate((element) => {
      return Object.keys(/** @type {any} */ (element).selectize.options).sort();
    });
    expect(mellonRoutes).toEqual(['IV', 'Oral']);
    await page.locator('#administration_route').evaluate((element) => {
      /** @type {any} */ (element).selectize.setValue('IV');
    });
    await expect(page.locator('#dose_infusion_1')).toBeVisible();

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
    expect(exportedPatient.doses[0].time_uncertainty).toBe(0);
    expect(exportedPatient.observations[0].blq).toBe(false);
    expect(exportedPatient.observations[0].lloq).toBe(0);

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
    expect(html).toContain("Aucun prédicteur direct d'AUC24 validé et compatible");
  });

  test("Revilla expose une AUC24 ML expérimentale avec deux prélèvements", async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto(engineUrl);
    await page.waitForFunction(() => /** @type {any} */ (window).Shiny?.shinyapp?.$socket?.readyState === 1);

    await page.locator('#model_id-selectized').click();
    await page.locator('.selectize-dropdown-content [data-value="vanco_pkjust"]').click();
    await expect(page.locator('.model-context-head')).toContainText('Revilla', { timeout: 15_000 });
    await expect(page.locator('.ml-status.available')).toContainText("prédicteur(s) direct(s) d'AUC24");
    await expect(page.locator('#enable_experimental_ml')).toBeVisible();

    await page.locator('#add_observation').click();
    await expect(page.locator('#observation_time_2')).toBeVisible();
    await page.locator('#observation_time_2').fill('38');
    await page.locator('#observation_concentration_2').fill('30');
    await page.locator('#dose_time_1').fill('36');
    await page.locator('#dose_ss_1').check();
    await page.locator('#enable_experimental_ml').check();
    await page.locator('#accept_disclaimer').check();
    await page.locator('#run_analysis').click();

    const exposure = page.locator('.exposure-strip');
    await expect(exposure).toContainText('AUC24 ML expérimentale', { timeout: 120_000 });
    await expect(page.locator('.analysis-diagnostics')).toContainText('AUC24 ML expérimentale');
    await expect(page.locator('#model_table')).toContainText('vanco_pkjust-intermittent-auc24-xgb-v1');

    const reportPromise = page.waitForEvent('download');
    await page.locator('#download_report').click();
    const report = await reportPromise;
    const stream = await report.createReadStream();
    let html = '';
    for await (const chunk of stream) html += chunk.toString();
    expect(html).toContain('AUC24 ML expérimentale');
    expect(html).toContain('vanco_pkjust-intermittent-auc24-xgb-v1');
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
