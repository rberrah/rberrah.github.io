import { test, expect } from '@playwright/test';

const engineUrl = process.env.TDM_ENGINE_E2E_URL;

test.describe('pont Atelier Lego vers le moteur TDM', () => {
  test.skip(!engineUrl, 'Définir TDM_ENGINE_E2E_URL pour tester un moteur Shiny local.');

  test('le serveur régénère et compile une spécification Lego contrôlée', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(engineUrl);
    await page.waitForFunction(() => window.Shiny?.setInputValue);

    const specification = {
      version: 1,
      nodes: [
        { id: 1, kind: 'depot', name: 'depot', dose: 100 },
        { id: 2, kind: 'central', name: 'centr', dose: 0, vol: 30 }
      ],
      edges: [
        { from: 1, to: 2, k: 1 },
        { from: 2, to: 'OUT', k: 0.2 }
      ]
    };

    await page.evaluate((spec) => {
      const marker = `// PK_LEGO_SPEC_V1:${encodeURIComponent(JSON.stringify(spec))}`;
      window.Shiny.setInputValue('lego_model_import', {
        code: `${marker}\n$GLOBAL\n// ce texte client ne doit jamais être compilé`,
        spec: null,
        name: 'lego_model',
        nonce: Date.now()
      }, { priority: 'event' });
    }, specification);

    const code = page.locator('#custom_code');
    await expect(code).toHaveValue(/PK_LEGO_SPEC_V1/);
    await expect(code).not.toHaveValue(/texte client/);
    await page.locator('#validate_model').click();
    await expect(page.locator('.status-pill.ok')).toHaveText('Modèle valide', { timeout: 60_000 });
    await expect(page.locator('.contract-ok')).toContainText('Contrat mapbayr valide');
  });
});
