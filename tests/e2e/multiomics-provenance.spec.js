// @ts-nocheck
import { test, expect } from '@playwright/test';

const MOCK_REACTOME_RELEASE = 'TEST_RELEASE_999';

function mockReactome(page) {
  return Promise.all([
    page.route('https://reactome.org/ContentService/data/database/version', async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/plain', body: MOCK_REACTOME_RELEASE });
    }),
    page.route('https://reactome.org/AnalysisService/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: { token: 'PROVENANCE_TEST_TOKEN', type: 'OVERREPRESENTATION' },
          pathwaysFound: 1,
          identifiersNotFound: 0,
          pathways: [{
            stId: 'R-HSA-71291',
            name: 'Metabolism of amino acids and derivatives',
            species: 'Homo sapiens',
            entities: { found: 3, total: 100, pValue: 0.01, fdr: 0.05 },
            reactions: { found: 2, total: 30 }
          }]
        })
      });
    })
  ]);
}

async function streamText(stream) {
  let text = '';
  for await (const chunk of stream) text += chunk.toString('utf8');
  return text;
}

test('Reactome release and analysis token are retained in the final analysis object and JSON export', async ({ page }) => {
  await mockReactome(page);
  await page.goto('/multiomics/tool');
  await page.getByTestId('multiomics-load-demo').click();
  await expect(page.getByTestId('multiomics-results')).toBeVisible({ timeout: 20_000 });

  const provenance = await page.evaluate(() => {
    const result = window.__PMX_MULTIOMICS_ANALYSIS__;
    return {
      external: result?.externalDatabaseProvenance?.reactome,
      pathway: result?.reactome?.provenance,
      reproducibility: result?.reproducibility?.externalDatabases?.reactome
    };
  });

  for (const copy of [provenance.external, provenance.pathway, provenance.reproducibility]) {
    expect(copy?.database).toBe('Reactome');
    expect(copy?.status).toBe('recorded');
    expect(copy?.release).toBe(MOCK_REACTOME_RELEASE);
    expect(copy?.analysisTokens).toContain('PROVENANCE_TEST_TOKEN');
    expect(copy?.versionEndpoint).toBe('https://reactome.org/ContentService/data/database/version');
  }

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Télécharger JSON|Download JSON/i }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  expect(stream).not.toBeNull();
  const exported = JSON.parse(await streamText(stream));
  expect(exported.externalDatabaseProvenance.reactome.release).toBe(MOCK_REACTOME_RELEASE);
  expect(exported.reactome.provenance.release).toBe(MOCK_REACTOME_RELEASE);
  expect(exported.reproducibility.externalDatabases.reactome.release).toBe(MOCK_REACTOME_RELEASE);
});

test('Reactome version lookup failure never blocks the scientific analysis', async ({ page }) => {
  await page.route('https://reactome.org/ContentService/data/database/version', async (route) => {
    await route.fulfill({ status: 503, contentType: 'text/plain', body: 'unavailable' });
  });
  await page.route('https://reactome.org/AnalysisService/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        summary: { token: 'NO_VERSION_TOKEN', type: 'OVERREPRESENTATION' },
        pathwaysFound: 0,
        identifiersNotFound: 0,
        pathways: []
      })
    });
  });

  await page.goto('/multiomics/tool');
  await page.getByTestId('multiomics-load-demo').click();
  await expect(page.getByTestId('multiomics-results')).toBeVisible({ timeout: 20_000 });

  const provenance = await page.evaluate(() => window.__PMX_MULTIOMICS_ANALYSIS__?.externalDatabaseProvenance?.reactome);
  expect(provenance?.status).toBe('unavailable');
  expect(provenance?.release).toBeNull();
  expect(provenance?.analysisTokens).toContain('NO_VERSION_TOKEN');
  expect(provenance?.error).toContain('HTTP 503');
});
