import { test, expect } from '@playwright/test';

const engineUrl = /** @type {any} */ (globalThis).process?.env?.TDM_ENGINE_E2E_URL;

test.describe('pont Atelier Lego vers le moteur TDM', () => {
  test.skip(!engineUrl, 'Définir TDM_ENGINE_E2E_URL pour tester un moteur Shiny local.');

  test('le serveur régénère et compile une spécification Lego contrôlée', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(engineUrl);
    await page.waitForFunction(() => /** @type {any} */ (window).Shiny?.setInputValue);

    await expect(page.locator('label[for="dose_infusion_1"]')).toContainText('0 = bolus ou oral');
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
    expect(exportedPatient.doses[0].ss).toBe(1);
    expect(exportedPatient.doses[0].count).toBe(1);

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
        { name: 'WT', target: 'v_centr', reference: 70, beta: 0.75 }
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
    await page.locator('#validate_model').click();
    await expect(page.locator('.status-pill.ok')).toHaveText('Modèle valide', { timeout: 60_000 });
    await expect(page.locator('.contract-ok')).toContainText('Contrat mapbayr valide');
  });
});
