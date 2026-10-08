// @ts-nocheck
import { test, expect } from '@playwright/test';

test('multi-omics presentation page links to the dedicated analysis tool', async ({ page }) => {
  await page.goto('/multiomics');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/multi|omique|omics/i);
  const toolLink = page.getByRole('link', { name: /Ouvrir l’outil|Open the tool/i });
  await expect(toolLink).toBeVisible();
  await expect(toolLink).toHaveAttribute('href', /\/multiomics\/tool$/);
});

test('multi-omics tool states the raw-input support boundary', async ({ page }) => {
  await page.goto('/multiomics/tool');
  await page.getByTestId('multiomics-advanced-settings').locator('summary').first().click();
  const boundary = page.getByTestId('input-support-boundary');
  await expect(boundary).toBeVisible();
  await expect(boundary).toContainText(/FASTQ\/BAM/i);
  await expect(boundary).toContainText(/vendor/i);
  await expect(boundary).toContainText(/mzML\/mzXML/i);
});

test('multi-omics presentation and tool switch to English', async ({ page }) => {
  await page.goto('/multiomics?lang=en');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Analyze one or multiple omics');
  await expect(page.getByRole('link', { name: 'Open the tool' })).toBeVisible();

  await page.goto('/multiomics/tool?lang=en');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Analyze one or several omics layers');
  await expect(page.getByText('How should these results be interpreted?')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Add your data files' })).toBeVisible();
});

test('outcome workflow requires an explicit omics time point when multiple visits exist', async ({ page }) => {
  await page.goto('/multiomics/tool');
  await page.getByTestId('multiomics-load-demo').click();
  await expect(page.getByTestId('multiomics-results')).toBeVisible({ timeout: 20_000 });

  await page.getByLabel(/Objectif principal|Main objective/).selectOption('outcome');
  await page.getByTestId('multiomics-simple-outcome').selectOption('binary');

  const timepoint = page.getByTestId('multiomics-simple-study').getByLabel(/Temps des mesures moléculaires|Omics time point used/);
  await expect(timepoint).toBeVisible();
  await expect(timepoint).toHaveValue('');
  await timepoint.selectOption('T0');
  await expect(timepoint).toHaveValue('T0');
});

test('multi-omics results expose contextual help, QC and reproducible report', async ({ page }) => {
  await page.route('https://reactome.org/AnalysisService/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        summary: { token: 'QC_TEST', type: 'OVERREPRESENTATION' },
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
  });

  await page.goto('/multiomics/tool');
  await page.getByTestId('multiomics-load-demo').click();
  await expect(page.getByTestId('multiomics-results')).toBeVisible({ timeout: 20_000 });
  await page.getByTestId('multiomics-quality-details').locator('summary').first().click();
  await expect(page.getByTestId('multiomics-qc')).toBeVisible();
  await expect(page.getByTestId('multiomics-qc')).toContainText(/variables conservées|features retained/i);
  const preprocessing = page.getByTestId('preprocessing-audit').first();
  // The short preprocessing audit is visible; its detailed steps stay collapsible.
  await expect(preprocessing).toBeVisible();
  await expect(preprocessing).toContainText(/raw_counts|log2|compatible/i);

  await page.getByTestId('multiomics-detailed-results').locator('summary').first().click();
  const help = page.locator('.feature-head .help-tip').first();
  await expect(help).toHaveAttribute('data-tooltip', /rapport|ratio|direction|magnitude/i);
  await help.hover();
  const globalHelp = page.getByTestId('global-help-tooltip');
  await expect(globalHelp).toBeVisible();
  await expect(globalHelp).toContainText(/rapport|ratio|direction|magnitude/i);
  const box = await globalHelp.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  if (box && viewport) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
  }

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Télécharger le rapport complet|Download full report/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('multiomics_reproducible_report.html');
});

test('multi-omics tool auto-runs the reference R backend when available', async ({ page }) => {
  await page.route('https://reactome.org/AnalysisService/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        summary: { token: 'BACKEND_TEST', type: 'OVERREPRESENTATION' },
        pathwaysFound: 0,
        identifiersNotFound: 0,
        pathways: []
      })
    });
  });
  await page.route('http://127.0.0.1:8787/health', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'ok',
        engine: 'PMx Explain reference R backend',
        version: '1.1.0',
        packages: { DESeq2:true, edgeR:true, limma:true, lmerTest:true, fgsea:true, MOFA2:true, mixOmics:true }
      })
    });
  });
  await page.route('http://127.0.0.1:8787/run', async (route) => {
    const payload = JSON.parse(route.request().postData() || '{}');
    expect(payload.metadataCsv).toContain('subject_id');
    expect(payload.matrices.transcriptomics).toContain('feature_id');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'ok',
        engine: { name:'PMx Explain reference R backend', version:'1.1.0' },
        applicableMethods: ['transcriptomics_longitudinal','proteomics_longitudinal'],
        packages: { DESeq2:true, edgeR:true, limma:true, lmerTest:true, fgsea:true, MOFA2:true, mixOmics:true },
        methods: {
          transcriptomics_longitudinal: { method:'lmerTest', status:'ok' },
          proteomics_longitudinal: { method:'lmerTest', status:'ok' }
        }
      })
    });
  });

  await page.goto('/multiomics/tool');
  await page.getByTestId('multiomics-load-demo').click();
  await expect(page.getByTestId('multiomics-results')).toBeVisible({ timeout: 20_000 });

  await page.getByTestId('multiomics-run-options').locator('summary').first().click();
  await page.getByLabel(/Mode backend R|R backend mode/i).selectOption('auto');
  await page.getByTestId('multiomics-run').click();

  const backend = page.getByTestId('reference-backend-results');
  await expect(backend).toContainText('lmerTest', { timeout: 20_000 });
  await page.getByTestId('multiomics-quality-details').locator('summary').first().click();
  await expect(backend).toBeVisible({ timeout: 20_000 });
  await expect(backend).toContainText('lmerTest');
  await expect(backend).toContainText(/Méthodes R exécutées|R methods executed/i);
});

test('multi-omics demo runs end-to-end with deterministic Reactome integration', async ({ page }) => {
  let reactomeCalls = 0;
  await page.route('https://reactome.org/AnalysisService/**', async (route) => {
    reactomeCalls += 1;
    const body = {
      summary: { token: 'TEST_TOKEN', type: 'OVERREPRESENTATION' },
      pathwaysFound: 2,
      identifiersNotFound: 0,
      pathways: [
        {
          stId: 'R-HSA-71291',
          name: 'Metabolism of amino acids and derivatives',
          species: 'Homo sapiens',
          entities: { found: 4, total: 120, pValue: 0.001, fdr: 0.01 },
          reactions: { found: 2, total: 40 }
        },
        {
          stId: 'R-HSA-168256',
          name: 'Immune System',
          species: 'Homo sapiens',
          entities: { found: 3, total: 900, pValue: 0.02, fdr: 0.08 },
          reactions: { found: 1, total: 300 }
        }
      ]
    };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body)
    });
  });

  await page.goto('/multiomics/tool');
  await expect(page.getByTestId('multiomics-load-demo')).toBeVisible();
  await page.getByTestId('multiomics-load-demo').click();

  await expect(page.getByTestId('multiomics-results')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('multiomics-results')).toContainText(/Résultats de la démonstration|Demonstration results/);
  await expect(page.getByTestId('multiomics-results')).toContainText('random-intercept-longitudinal-model');
  await expect(page.getByTestId('multiomics-results')).toContainText('IDO1');
  await expect(page.getByTestId('multiomics-interpretation')).toBeVisible();
  await expect(page.getByTestId('multiomics-interpretation')).toContainText(/Comment interpréter ces résultats|How should these results be interpreted/);
  await expect(page.getByTestId('multiomics-pathways')).toContainText('Metabolism of amino acids and derivatives');
  expect(reactomeCalls).toBeGreaterThanOrEqual(3);
});

test('multi-omics tool exposes raw-MS and external-validation advanced workflows', async ({ page }) => {
  await page.goto('/multiomics/tool');

  const advanced = page.getByTestId('advanced-workflows');
  await expect(advanced).toBeVisible();
  await expect(advanced).toContainText(/mzML|mzXML/);
  await expect(advanced).toContainText(/validation externe|external validation/i);

  await expect(page.getByTestId('raw-ms-manifest-template')).toHaveAttribute('href', /\/multiomics\/templates\/raw_ms_manifest\.csv$/);
  await expect(page.getByTestId('external-validation-template')).toHaveAttribute('href', /\/multiomics\/templates\/external_validation_predictions_binary\.csv$/);

  await expect(advanced).toContainText('run_raw_ms.R raw_ms_manifest.csv raw_ms_output raw_ms_parameters.json');
  await expect(advanced).toContainText('run_external_validation.R external_validation_predictions_binary.csv external_validation_binary.json external_validation_output');
});


test('browser external validation sends only frozen predictions to the R evaluator', async ({ page }) => {
  await page.route('http://127.0.0.1:8787/external-validation', async (route) => {
    const payload = JSON.parse(route.request().postData() || '{}');
    expect(payload.predictionsCsv).toContain('subject_id,outcome,prediction');
    expect(payload.config.independent_cohort).toBe(true);
    expect(payload.config.outcome_type).toBe('binary');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'ok',
        validation_status: 'external_validation',
        cohort_label: 'Independent cohort',
        metrics: { auc: 0.91, brier: 0.12, log_loss: 0.31 }
      })
    });
  });

  await page.goto('/multiomics/tool');
  // Expert workflows remain accessible after opening their dedicated section.
  await page.getByTestId('advanced-workflows').locator('summary').first().click();
  const panel = page.getByTestId('external-validation-panel');
  await expect(panel).toBeVisible();

  await page.getByTestId('external-validation-predictions').setInputFiles({
    name: 'predictions.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('subject_id,outcome,prediction\nV001,0,0.12\nV002,1,0.81\n')
  });
  await page.getByTestId('external-validation-config').setInputFiles({
    name: 'config.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({
      outcome_type: 'binary',
      prediction_column: 'prediction',
      outcome_column: 'outcome',
      prediction_kind: 'probability',
      independent_cohort: true,
      cohort_label: 'Independent cohort',
      bootstrap_repetitions: 1000,
      seed: 20260928
    }))
  });

  await expect(page.getByTestId('external-validation-config-summary')).toContainText(/Independent cohort/);
  await page.getByTestId('external-validation-run').click();
  const result = page.getByTestId('external-validation-result');
  await expect(result).toBeVisible();
  await expect(result).toContainText('external_validation');
  await expect(result).toContainText('0.91');
});

test('browser refuses to label a non-independent cohort as external validation', async ({ page }) => {
  await page.goto('/multiomics/tool');
  // Expert workflows remain accessible after opening their dedicated section.
  await page.getByTestId('advanced-workflows').locator('summary').first().click();
  await page.getByTestId('external-validation-predictions').setInputFiles({
    name: 'predictions.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('subject_id,outcome,prediction\nV001,0,0.12\nV002,1,0.81\n')
  });
  await page.getByTestId('external-validation-config').setInputFiles({
    name: 'config.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({
      outcome_type: 'binary',
      prediction_column: 'prediction',
      outcome_column: 'outcome',
      independent_cohort: false,
      cohort_label: 'Development cohort'
    }))
  });
  await page.getByTestId('external-validation-run').click();
  await expect(page.getByTestId('external-validation-error')).toContainText(/indépendante|independent/i);
  await expect(page.getByTestId('external-validation-result')).toHaveCount(0);
});
