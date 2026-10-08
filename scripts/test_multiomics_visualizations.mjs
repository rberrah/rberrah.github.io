import assert from 'node:assert/strict';
import { buildMultiomicsVisualizationData } from '../src/lib/multiomics/visualization-data.js';
import { focusMetabolicRegion } from '../src/lib/multiomics/metabolic-network.js';

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

// ChEBI identities are curated from EMBL-EBI rather than inferred from the ID
// text. Demo-like data must show lactate/succinate on the fixed map; tryptophan
// and kynurenine remain measured but outside this intentionally limited map.
const example = await buildMultiomicsVisualizationData({
  files: {}, metadataRows: [], columnMapping: {}, dataTypes: {},
  analysisResult: {
    layers: {
      transcriptomics: { rows: [
        row('GAPDH', -0.06, 0.4), row('STAT1', 1.01, 0.02),
        row('IDO1', 1.92, 0.01), row('KYNU', 1.09, 0.03),
        row('CYP3A5', -0.8, 0.01)
      ] },
      metabolomics: { rows: [
        row('CHEBI:16828', -1.2, 0.04), row('CHEBI:16946', 0.37, 0.04),
        row('CHEBI:24996', -0.37, 0.08), row('CHEBI:30031', -0.49, 0.03)
      ] }
    }
  }
});
assert.equal(example.centralCarbon.measuredMetabolites, 2,
  'ChEBI lactate and succinate must appear in central-carbon map');
assert.equal(example.centralCarbon.measuredTranscripts, 1,
  'Only GAPDH among these demo genes is part of fixed central-carbon schematic');
assert.equal(example.centralCarbon.metabolites.find((n) => n.id === 'lactate').measurement.feature, 'CHEBI:24996');
assert.equal(example.centralCarbon.metabolites.find((n) => n.id === 'succinate').measurement.feature, 'CHEBI:30031');
assert.deepEqual(new Set(example.centralCarbon.offMapMetabolites.map((n) => n.feature)),
  new Set(['CHEBI:16828', 'CHEBI:16946']));
assert.deepEqual(new Set(example.centralCarbon.offMapTranscripts.map((n) => n.feature)),
  new Set(['STAT1', 'IDO1', 'KYNU', 'CYP3A5']));
assert.equal(example.metabologram.metabolomics.find((n) => n.feature === 'CHEBI:16828').labelFr,
  'L-tryptophane');
assert.equal(example.metabologram.metabolomics.find((n) => n.feature === 'CHEBI:16946').labelFr,
  'L-kynurénine');
assert.deepEqual(example.metabologramPathways.find((n) => n.id === 'glycolysis').metabolomics.map((n) => n.feature),
  ['CHEBI:24996']);
assert.deepEqual(example.metabologramPathways.find((n) => n.id === 'tca').metabolomics.map((n) => n.feature),
  ['CHEBI:30031']);

const untouched = JSON.stringify(result);
const again = await buildMultiomicsVisualizationData({
  files: {}, metadataRows: [], columnMapping: {}, dataTypes: {}, analysisResult: result
});
assert.deepEqual(again, visuals, 'Visualization data must be deterministic');
assert.equal(JSON.stringify(result), untouched, 'Visualizations must not mutate analysis results');

// Expanded network: strict ID matching, region selection, informative non-links.
assert.ok(example.focusedMetabolicNetwork.coverage.metabolites >= 80);
assert.ok(example.focusedMetabolicNetwork.coverage.genes >= 90);
assert.ok(example.focusedMetabolicNetwork.coverage.regions >= 12);
assert.ok(example.focusedMetabolicNetwork.coverage.links >= 90);
const graph=example.focusedMetabolicNetwork;
const id=(i)=>graph.audit.find((r)=>r.input===i);
assert.equal(id('CHEBI:16828').status, 'verified_id');
assert.equal(id('CHEBI:16946').status, 'verified_id');
assert.equal(id('CHEBI:24996').status, 'verified_id');
assert.equal(id('CHEBI:30031').status, 'verified_id');
const auto=focusMetabolicRegion(graph,'auto',1);
assert.ok(auto.some((r)=>r.id==='kynurenine'));
assert.ok(auto.some((r)=>r.id==='glycolysis'));
assert.ok(auto.some((r)=>r.id==='tca'));
assert.ok(!auto.some((r)=>r.id==='serotonin'),
  'Do not show a second unrelated branch for the same measured precursor');
assert.ok(auto.find((r)=>r.id==='kynurenine').nodes.some((n)=>n.id==='formylkyn'));
assert.ok(!focusMetabolicRegion(graph,'kynurenine',0)[0].nodes.some((n)=>n.id==='formylkyn'));
assert.ok(focusMetabolicRegion(graph,'kynurenine',2)[0].nodes.length >
  focusMetabolicRegion(graph,'kynurenine',0)[0].nodes.length);

const strictResult=await buildMultiomicsVisualizationData({
  files:{},metadataRows:[],columnMapping:{},dataTypes:{},
  analysisResult:{layers:{metabolomics:{rows:[
    row('CHEBI:99999999',1,0.01), row('unrecognizable metabolite',2,0.01),
    row('CHEBI:16828',1,0.01,'logit'),row('L-kynurenine',1,0.01)
  ]},transcriptomics:{rows:[]}}}
});
const strict=strictResult.focusedMetabolicNetwork;
assert.equal(strict.audit.find((r)=>r.input==='CHEBI:99999999').status,'unmapped_identifier');
assert.equal(strict.audit.find((r)=>r.input==='unrecognizable metabolite').status,'unrecognized');
assert.equal(strict.audit.find((r)=>r.input==='L-kynurenine').status,'name_only');
assert.equal(strict.audit.find((r)=>r.input==='CHEBI:16828').usable,false,
  'Identity evidence must never replace a missing log2 effect scale');
assert.equal(strict.nodes.filter((n)=>n.id==='tryptophan')[0].measurement,null);
assert.deepEqual(focusMetabolicRegion(graph,'auto',1),focusMetabolicRegion(graph,'auto',1),
  'Same input must produce same focused subgraph');

console.log('multiomics Figure 4-inspired visualizations PASS');
