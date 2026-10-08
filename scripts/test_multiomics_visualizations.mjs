import assert from 'node:assert/strict';
import { buildMultiomicsVisualizationData } from '../src/lib/multiomics/visualization-data.js';

const row = (feature, effect, qValue, effectScale = 'log2') => ({ feature, effect, qValue, effectScale });
const result = {
  layers: {
    transcriptomics: {
      rows: [
        row('LDHA', -2.2, 0.001), row('LDHB', 1.4, 0.020),
        row('GAPDH', 0.7, 0.050), row('CS', 1.2, 0.030),
        row('HK1', 1.5, 0.020), row('HK2', -1.2, 0.030),
        row('ENSG_UNKNOWN', 3.5, 0.001),
        row('G6PD', 2, 0.005, 'logit')
      ]
    },
    metabolomics: {
      rows: [
        row('Lactate', -1.3, 0.03), row('Pyruvate', 0.5, 0.08),
        row('Citrate', 1.5, 0.01),
        row('Fructose-6-phosphate', 4, 0.001, 'untyped')
      ]
    }
  }
};

const visuals = await buildMultiomicsVisualizationData({
  files: {}, metadataRows: [], columnMapping: {}, dataTypes: {}, analysisResult: result
});
assert.equal(visuals.metabologramPathways.length, 4);
const glycolysis = visuals.metabologramPathways.find((x) => x.id === 'glycolysis');
const tca = visuals.metabologramPathways.find((x) => x.id === 'tca');
const ppp = visuals.metabologramPathways.find((x) => x.id === 'ppp');
assert.deepEqual(new Set(glycolysis.transcriptomics.map((x) => x.feature)),
  new Set(['LDHA', 'LDHB', 'GAPDH']));
assert.ok(glycolysis.metabolomics.some((x) => x.feature === 'Lactate'));
assert.ok(tca.metabolomics.some((x) => x.feature === 'Citrate'));
assert.ok(tca.transcriptomics.some((x) => x.feature === 'CS'));
assert.equal(ppp.transcriptomics.length, 0, 'A logit estimate must not be presented as a log2 fold change');
const hk = visuals.centralCarbon.enzymes.find((x) => x.id === 'hk');
assert.equal(hk.measurement.status, 'discordant_isoforms');
assert.equal(hk.measurement.effect, null, 'A gene-family summary cannot hide opposing effects');
assert.ok(!glycolysis.transcriptomics.some((x) => x.feature === 'HK1' || x.feature === 'HK2'));
assert.ok(!visuals.centralCarbon.metabolites.find((x) => x.id === '3pg').aliases.includes('2,3pg'), '3-PG is not 2,3-PG');
assert.ok(!glycolysis.metabolomics.some((x) => x.feature === 'Fructose-6-phosphate'));
assert.equal(glycolysis.coverageMetabolites, glycolysis.metabolomics.length);
assert.equal(glycolysis.meanTranscriptomicLog2Fc,
  glycolysis.transcriptomics.reduce((acc, x) => acc + x.effect, 0) / glycolysis.transcriptomics.length);
assert.ok(visuals.centralCarbon.edges.some(([a,b]) => a === 'pyruvate' && b === 'acetylcoa'));
assert.ok(visuals.centralCarbon.edges.some(([a,b]) => a === 'acetylcoa' && b === 'citrate'));
assert.ok(visuals.centralCarbon.edges.some(([a,b]) => a === 'glutamine' && b === 'glutamate'));
assert.ok(!visuals.centralCarbon.edges.some(([a,b]) => a === 'pyruvate' && b === 'citrate'));
assert.ok(!visuals.centralCarbon.edges.some(([a,b]) => a === 'g3p' && b === 'serine'));
assert.match(visuals.methodologicalBoundary.join(' '), /No metabolic flux/i);

const untouched = JSON.stringify(result);
const again = await buildMultiomicsVisualizationData({
  files: {}, metadataRows: [], columnMapping: {}, dataTypes: {}, analysisResult: result
});
assert.deepEqual(again, visuals, 'Visualization data must be deterministic');
assert.equal(JSON.stringify(result), untouched, 'Visualizations must not mutate analysis results');

console.log('multiomics Figure 4-inspired visualizations PASS');
