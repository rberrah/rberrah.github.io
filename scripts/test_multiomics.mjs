import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { File } from 'node:buffer';
import { parseDelimited, runDeterministicAnalysis, resolveMetaboliteIdentifier } from '../src/lib/multiomics/deterministic.js';

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
  useReactome: false,
  resolveIdentifiers: false
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


function csvFile(name, text) {
  return new File([text], name, { type: 'text/csv' });
}

// Paired design: the same subjects are measured in both biological conditions.
{
  const subjects = ['S1','S2','S3','S4'];
  const rows = ['subject_id,sample_id,assay_id,omic,condition,timepoint'];
  const rnaHeader = ['feature_id'];
  const protHeader = ['feature_id'];
  const rnaValues = ['PAIR_GENE'];
  const protValues = ['PAIR_PROTEIN'];
  let assay = 1;
  for (const subject of subjects) {
    for (const condition of ['A','B']) {
      for (const layer of ['transcriptomics','proteomics']) {
        const sample = `${subject}_${condition}`;
        const id = `${layer === 'transcriptomics' ? 'R' : 'P'}${assay++}`;
        rows.push([subject,sample,id,layer,condition,''].join(','));
        if (layer === 'transcriptomics') {
          rnaHeader.push(id);
          rnaValues.push(String(condition === 'A' ? Number(subject.slice(1)) : Number(subject.slice(1)) + 4));
        } else {
          protHeader.push(id);
          protValues.push(String(condition === 'A' ? Number(subject.slice(1))*2 : Number(subject.slice(1))*2 + 3));
        }
      }
    }
  }
  const meta = csvFile('paired_metadata.csv', rows.join('\n'));
  const rna = csvFile('paired_rna.csv', [rnaHeader.join(','), rnaValues.join(',')].join('\n'));
  const protein = csvFile('paired_protein.csv', [protHeader.join(','), protValues.join(',')].join('\n'));
  const metaParsed = parseDelimited(await meta.text());
  const paired = await runDeterministicAnalysis({
    files: { metadata: meta, transcriptomics: rna, proteomics: protein, metabolomics: null },
    metadataRows: metaParsed.rows,
    columnMapping: mapping,
    protocol: { organism:'human', objective:'groups', longitudinal:false, designType:'paired', studySetting:'clinical_interventional', groupCount:'2', sampleOverlap:'same_specimen' },
    dataTypes: { transcriptomics:'log_expression', proteomics:'log_intensity', metabolomics:'concentration' },
    useReactome:false,
    resolveIdentifiers:false
  });
  assert.equal(paired.layers.transcriptomics.mode, 'paired-permutation');
  assert.deepEqual(paired.layers.transcriptomics.groupSizes, [4,4]);
  assert.ok(paired.layers.transcriptomics.rows[0].effect > 0);
  assert.equal(paired.crossOmics.testedPairs, 0);
}

// Longitudinal design with 3 time points: all times contribute through an individual slope.
{
  const rows = ['subject_id,sample_id,assay_id,omic,condition,timepoint'];
  const headers = { transcriptomics:['feature_id'], proteomics:['feature_id'] };
  const values = { transcriptomics:['SLOPE_GENE'], proteomics:['SLOPE_PROTEIN'] };
  let assay = 1;
  for (const condition of ['control','treatment']) {
    for (let s = 1; s <= 4; s += 1) {
      const subject = `${condition[0].toUpperCase()}${s}`;
      for (const time of [0,6,12]) {
        for (const layer of ['transcriptomics','proteomics']) {
          const sample = `${subject}_T${time}`;
          const id = `${layer === 'transcriptomics' ? 'R' : 'P'}${assay++}`;
          rows.push([subject,sample,id,layer,condition,`T${time}`].join(','));
          headers[layer].push(id);
          const base = s + (layer === 'proteomics' ? 2 : 0);
          const slope = condition === 'treatment' ? 0.20 : 0.02;
          values[layer].push(String(base + slope*time));
        }
      }
    }
  }
  const meta = csvFile('slope_metadata.csv', rows.join('\n'));
  const rna = csvFile('slope_rna.csv', [headers.transcriptomics.join(','), values.transcriptomics.join(',')].join('\n'));
  const protein = csvFile('slope_protein.csv', [headers.proteomics.join(','), values.proteomics.join(',')].join('\n'));
  const metaParsed = parseDelimited(await meta.text());
  const longitudinalResult = await runDeterministicAnalysis({
    files: { metadata: meta, transcriptomics: rna, proteomics: protein, metabolomics: null },
    metadataRows: metaParsed.rows,
    columnMapping: mapping,
    protocol: { organism:'human', objective:'time', longitudinal:true, designType:'repeated', studySetting:'clinical_interventional', groupCount:'2', sampleOverlap:'same_specimen' },
    dataTypes: { transcriptomics:'log_expression', proteomics:'log_intensity', metabolomics:'concentration' },
    useReactome:false,
    resolveIdentifiers:false
  });
  assert.equal(longitudinalResult.layers.transcriptomics.mode, 'longitudinal-slope');
  assert.deepEqual(longitudinalResult.layers.transcriptomics.groupSizes, [4,4]);
  assert.ok(longitudinalResult.layers.transcriptomics.rows[0].effect > 0.15);
}

// ChEBI mapping is conservative: explicit lipid alias is queried, but only exact returned names are accepted.
{
  const mockFetch = async () => new Response(JSON.stringify({
    results: [{ _source: { chebi_accession:'CHEBI:17351', name:'linoleic acid', ascii_name:'linoleic acid', stars:3 } }],
    total:1,
    number_pages:1
  }), { status:200, headers:{'Content-Type':'application/json'} });
  const mappingResult = await resolveMetaboliteIdentifier('C18.2n.6', { fetchFn: mockFetch });
  assert.equal(mappingResult.resolved, 'CHEBI:17351');
  assert.equal(mappingResult.method, 'chebi_exact_after_alias');

  const wrongFetch = async () => new Response(JSON.stringify({
    results: [{ _source: { chebi_accession:'CHEBI:99999', name:'malic enzyme substrate', ascii_name:'malic enzyme substrate' } }],
    total:1,
    number_pages:1
  }), { status:200, headers:{'Content-Type':'application/json'} });
  const unresolved = await resolveMetaboliteIdentifier('definitely-not-an-exact-metabolite', { fetchFn: wrongFetch });
  assert.equal(unresolved.resolved, null);
  assert.equal(unresolved.status, 'unresolved');
}

console.log('multiomics paired / longitudinal / identifier-resolution branches: PASS');
