import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { File } from 'node:buffer';
import { parseDelimited, runDeterministicAnalysis } from '../src/lib/multiomics/deterministic.js';

const root = new URL('../static/multiomics/', import.meta.url);

async function load(name) {
  const text = await fs.readFile(new URL(name, root), 'utf8');
  return new File([text], name, { type: 'text/csv' });
}

const metadata = await load('demo_metadata.csv');
const transcriptomics = await load('demo_transcriptomics.csv');
const proteomics = await load('demo_proteomics.csv');
const metabolomics = await load('demo_metabolomics.csv');

const parsed = parseDelimited(await metadata.text());
const mapping = {
  subject_id: 'subject_id',
  sample_id: 'sample_id',
  assay_id: 'assay_id',
  omic: 'omic',
  condition: 'condition',
  timepoint: 'timepoint',
  batch: 'batch',
  technical_replicate: 'technical_replicate',
  outcome: 'outcome'
};

const result = await runDeterministicAnalysis({
  files: { metadata, transcriptomics, proteomics, metabolomics },
  metadataRows: parsed.rows,
  columnMapping: mapping,
  protocol: {
    organism: 'human',
    objective: 'time',
    longitudinal: true,
    designType: 'repeated',
    studySetting: 'clinical_interventional',
    groupCount: '2',
    sampleOverlap: 'same_specimen'
  },
  dataTypes: {
    transcriptomics: 'raw_counts',
    proteomics: 'log_intensity',
    metabolomics: 'peak_area'
  },
  useReactome: false
});

assert.equal(result.metadataSummary.subjects, 4);
assert.equal(result.metadataSummary.samples, 8);
assert.equal(result.metadataSummary.assays, 25);
assert.equal(result.layers.transcriptomics.replicateGroups.length, 1);
assert.ok(result.layers.transcriptomics.rows.length >= 5);
assert.ok(result.layers.proteomics.rows.length >= 4);
assert.ok(result.layers.metabolomics.rows.length >= 4);

for (const layer of ['transcriptomics','proteomics','metabolomics']) {
  assert.equal(result.layers[layer].mode, 'difference-in-differences');
  assert.deepEqual(result.layers[layer].groupSizes, [2,2]);
  assert.ok(result.layers[layer].selected.length > 0);
}

const ido = result.layers.transcriptomics.rows.find((row) => row.feature === 'IDO1');
assert.ok(ido);
assert.ok(Number.isFinite(ido.effect));
assert.ok(ido.foldRatio > 1);

console.log('multiomics deterministic engine: PASS');
console.log(JSON.stringify({
  subjects: result.metadataSummary.subjects,
  assays: result.metadataSummary.assays,
  rnaTop: result.layers.transcriptomics.rows.slice(0,3).map((x) => [x.feature, x.foldRatio]),
  proteinTop: result.layers.proteomics.rows.slice(0,3).map((x) => [x.feature, x.foldRatio]),
  metaboliteTop: result.layers.metabolomics.rows.slice(0,3).map((x) => [x.feature, x.foldRatio])
}, null, 2));
