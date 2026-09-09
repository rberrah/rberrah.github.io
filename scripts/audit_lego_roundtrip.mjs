import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { parseModelCode } from '../src/lib/lego/mlxtran.js';

const presets = ['Oral 1-cpt', 'IV 2-cpt', 'Transit \u00d73', 'Double absorption', 'KOKA (Samtani)', "PP6M (T'jollyn)", 'Parent/m\u00e9tabolite', 'Effet (ke0)', 'Turnover'];
const formats = ['mrgsolve', 'mlxtran', 'nonmem'];
const marker = /^[ \t]*(?:;|\/\/)\s*PK_LEGO_SPEC_V1:([^\r\n]+)/m;
const snapshot = (code) => JSON.parse(decodeURIComponent(code.match(marker)[1].trim()));
const numeric = (value) => Number(Number(value).toPrecision(10));
function modelShape(spec) {
  const name = (id) => id === 'OUT' ? 'OUT' : spec.nodes.find((node) => node.id === id)?.name.toLowerCase();
  return {
    nodes: spec.nodes.map((node) => ({
      name: name(node.id), kind: node.kind, vol: node.vol, ke0: node.ke0, kin: node.kin, kout: node.kout, smax: node.smax, sc50: node.sc50,
      source: node.source ? name(node.source) : undefined,
      dosed: Number(node.dose ?? 0) > 0,
      ...(Number(node.dose ?? 0) > 0 ? {
        type: node.inputType ?? 'bolus', lag: numeric(node.tlag ?? 0),
        duration: node.inputType === 'zero_order' ? numeric(node.inputDuration ?? 1) : undefined,
        durationSource: node.inputDurationTlagOf ? name(node.inputDurationTlagOf) : undefined,
        fraction: numeric(node.doseFraction ?? 100),
        fractionSource: node.fractionComplementOf ? name(node.fractionComplementOf) : undefined
      } : {})
    })).sort((a, b) => a.name.localeCompare(b.name)),
    edges: spec.edges.map((edge) => ({
      from: name(edge.from), to: name(edge.to), kinetics: edge.kinetics ?? 'first_order',
      ...(edge.kinetics === 'hill' || edge.kinetics === 'michaelis_menten'
        ? { vmax: numeric(edge.vmax), km: numeric(edge.km), ...(edge.kinetics === 'hill' ? { gamma: numeric(edge.gamma) } : {}) }
        : edge.to === 'OUT' && edge.eliminationParameterization === 'clearance' ? { cl: numeric(edge.cl) } : { k: numeric(edge.k) })
    })).sort((a, b) => `${a.from}:${a.to}`.localeCompare(`${b.from}:${b.to}`)),
    covariates: spec.covariates.map((cov) => ({ name: cov.name, type: cov.type, target: cov.target.toLowerCase(), reference: numeric(cov.reference), beta: numeric(cov.beta), ...(cov.type === 'categorical' ? { comparison: cov.comparison } : {}) }))
      .sort((a, b) => `${a.name}:${a.target}`.localeCompare(`${b.name}:${b.target}`))
  };
}

const browser = await chromium.launch();
const cases = [];
const failures = [];
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);
  await page.goto(`${process.env.LEGO_AUDIT_URL ?? 'http://127.0.0.1:5174'}/lego/`);
  await page.waitForLoadState('networkidle');
  const importer = page.locator('.mlxtran-import');
  await importer.locator('summary').click();
  const importSpec = async (spec) => {
    await importer.getByRole('tab', { name: 'MLXTRAN', exact: true }).click();
    await importer.locator('textarea').fill(`; PK_LEGO_SPEC_V1:${encodeURIComponent(JSON.stringify(spec))}\n[LONGITUDINAL]`);
    await importer.getByRole('button', { name: 'Construire le sch\u00e9ma', exact: true }).click();
  };
  for (const [index, preset] of presets.entries()) {
    await page.locator('.toolbar').getByRole('button', { name: preset === 'Turnover' ? 'Effet (ke0)' : preset, exact: true }).click();
    await page.locator('.codehead').getByRole('tab', { name: 'mrgsolve', exact: true }).click();
    const original = snapshot(await page.locator('pre.codeblk code').innerText());
    if (preset === 'Turnover') {
      const effect = original.nodes.find((node) => node.kind === 'effect');
      effect.kind = 'response';
      effect.name = 'response';
      delete effect.ke0;
      Object.assign(effect, { kin: 10, kout: 0.15, smax: 3, sc50: 3 });
    }
    const withCovariates = structuredClone(original);
    const first = original.edges[0];
    const from = original.nodes.find((node) => node.id === first.from).name;
    const to = first.to === 'OUT' ? 'e' : original.nodes.find((node) => node.id === first.to).name;
    const target = first.kinetics === 'hill' || first.kinetics === 'michaelis_menten' ? `vmax_${from}_${to}` : `k_${from}_${to}`;
    const central = original.nodes.find((node) => node.kind === 'central');
    withCovariates.covariates = [
      { name: 'WT', type: 'continuous', target, reference: 70, comparison: 100, beta: 0.75, scope: 'patient' },
      { name: 'SEX', type: 'categorical', target: `v_${central.name}`, reference: 0, comparison: 1, beta: -0.2, scope: 'patient' },
      ...Array.from({ length: 10 }, (_, i) => ({ name: `COV${i}`, type: 'continuous', target: `v_${central.name}`, reference: 1, comparison: 1.5, beta: -0.1, scope: 'patient' }))
    ];
    const lagged = original.nodes.find((node) => node.tlag > 0);
    if (lagged) withCovariates.covariates.push({ name: 'AGE', type: 'continuous', target: `tlag_${lagged.name}`, reference: 40, comparison: 60, beta: 0.2, scope: 'patient' });
    if (first.kinetics === 'hill') {
      for (const parameter of ['km', 'gamma']) withCovariates.covariates.push({ name: parameter.toUpperCase(), type: 'continuous', target: `${parameter}_${from}_${to}`, reference: 1, comparison: 1.25, beta: 0.1, scope: 'patient' });
    }
    for (const [scenario, sourceSpec] of [['base', original], ['covariates', withCovariates]]) {
      await importSpec(sourceSpec);
      for (const format of formats) {
        await page.locator('.codehead').getByRole('tab', { name: format === 'mrgsolve' ? format : format.toUpperCase(), exact: true }).click();
        const code = await page.locator('pre.codeblk code').innerText();
        const spec = snapshot(code);
        const testCase = { id: `preset${index}_${scenario}_${format}`, preset: `${preset} ${scenario}`, format, code, spec };
        cases.push(testCase);
        for (const [variant, input] of [['marked', code], ['indented', code.replace(marker, (line) => `  ${line}`)], ['plain', code.replace(marker, '')]]) {
          try {
            const parsed = parseModelCode(input, format);
            assert.deepEqual(modelShape(parsed.spec), modelShape(spec));
            if (variant === 'plain') {
              await importer.getByRole('tab', { name: format === 'mrgsolve' ? format : format.toUpperCase(), exact: true }).click();
              await importer.locator('textarea').fill(input);
              await importer.getByRole('button', { name: 'Construire le sch\u00e9ma', exact: true }).click();
              const regenerated = await page.locator('pre.codeblk code').innerText();
              assert.deepEqual(modelShape(snapshot(regenerated)), modelShape(spec));
              assert(!await page.locator('.canvas').textContent().then((text) => text.includes('LEGO_INPUT')));
              await page.locator('.codehead').getByRole('tab', { name: 'mrgsolve', exact: true }).click();
              testCase.reimportedMrgsolve = await page.locator('pre.codeblk code').innerText();
              testCase.reimportedSpec = snapshot(testCase.reimportedMrgsolve);
              await importSpec(spec);
            }
            console.log(`PASS ${preset} ${scenario} ${format} ${variant}`);
          } catch (error) {
            failures.push({ preset, scenario, format, variant, error: error.message });
            console.log(`FAIL ${preset} ${scenario} ${format} ${variant}: ${error.code ?? error.message.slice(0, 150)}`);
          }
        }
      }
    }
  }
} finally {
  await browser.close();
}
await mkdir('test-results', { recursive: true });
await writeFile('test-results/lego-export-audit.json', JSON.stringify(cases, null, 2));
await writeFile('test-results/lego-import-failures.json', JSON.stringify(failures, null, 2));
console.log(`${cases.length * 3 - failures.length}/${cases.length * 3} round trips passed`);
if (failures.length) process.exitCode = 1;
