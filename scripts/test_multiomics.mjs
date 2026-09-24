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
  outcome: 'outcome',
  survival_time: 'survival_time',
  survival_event: 'survival_event'
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

assert.equal(result.metadataSummary.subjects, 8);
assert.equal(result.metadataSummary.samples, 16);
assert.equal(result.metadataSummary.assays, 49);
assert.equal(result.layers.transcriptomics.replicateGroups.length, 1);
assert.ok(result.layers.transcriptomics.rows.length >= 5);
assert.ok(result.layers.proteomics.rows.length >= 4);
assert.ok(result.layers.metabolomics.rows.length >= 4);
assert.equal(result.metadataSummary.batchAudit.transcriptomics.status, 'single_batch');
assert.equal(result.metadataSummary.batchAudit.proteomics.status, 'single_batch');
assert.equal(result.metadataSummary.batchAudit.metabolomics.status, 'single_batch');

for (const layer of ['transcriptomics','proteomics','metabolomics']) {
  assert.equal(result.layers[layer].mode, 'difference-in-differences');
  assert.deepEqual(result.layers[layer].groupSizes, [4,4]);
  assert.ok(result.layers[layer].selected.length > 0);
}

const ido = result.layers.transcriptomics.rows.find((row) => row.feature === 'IDO1');
assert.ok(ido);
assert.ok(Number.isFinite(ido.effect));
assert.ok(ido.foldRatio > 1);
assert.ok(result.crossOmics.testedPairs > 0);
assert.ok(result.crossOmics.pairs.some((pair) => ['sign_reversal','gained_in_comparison','strengthened_in_comparison'].includes(pair.pattern)));



// Outcome models with repeated omics must use an explicitly selected molecular time point.
await assert.rejects(
  () => runDeterministicAnalysis({
    files: { metadata, transcriptomics, proteomics, metabolomics },
    metadataRows: parsed.rows,
    columnMapping: mapping,
    protocol: {
      organism: 'human',
      objective: 'outcome',
      outcomeType: 'binary',
      longitudinal: false,
      designType: 'independent',
      studySetting: 'clinical_interventional',
      groupCount: '1',
      sampleOverlap: 'same_specimen',
      batchKnown: 'yes',
      covariateColumns: []
    },
    dataTypes: {
      transcriptomics: 'raw_counts',
      proteomics: 'log_intensity',
      metabolomics: 'peak_area'
    },
    useReactome: false,
    resolveIdentifiers: false
  }),
  /explicit outcomeTimepoint/
);

const demoOutcome = await runDeterministicAnalysis({
  files: { metadata, transcriptomics, proteomics, metabolomics },
  metadataRows: parsed.rows,
  columnMapping: mapping,
  protocol: {
    organism: 'human',
    objective: 'outcome',
    outcomeType: 'binary',
    outcomeTimepoint: 'T0',
    longitudinal: false,
    designType: 'independent',
    studySetting: 'clinical_interventional',
    groupCount: '1',
    sampleOverlap: 'same_specimen',
    batchKnown: 'yes',
    covariateColumns: []
  },
  dataTypes: {
    transcriptomics: 'raw_counts',
    proteomics: 'log_intensity',
    metabolomics: 'peak_area'
  },
  useReactome: false,
  resolveIdentifiers: false
});
assert.equal(demoOutcome.layers.transcriptomics.mode, 'outcome-binary');
assert.equal(demoOutcome.protocol.outcomeTimepoint, 'T0');

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

// High-dimensional branch: >500 features must switch from permutations to analytic inference.
{
  const rows = ['subject_id,sample_id,assay_id,omic,condition,timepoint'];
  const rnaHeader = ['feature_id'];
  const protHeader = ['feature_id'];
  const rnaRows = [];
  const protRows = [];
  const rnaAssays = [];
  const protAssays = [];
  let assay = 1;
  for (const condition of ['control','treatment']) {
    for (let s = 1; s <= 8; s += 1) {
      const subject = `${condition[0].toUpperCase()}${s}`;
      for (const layer of ['transcriptomics','proteomics']) {
        const id = `${layer === 'transcriptomics' ? 'HR' : 'HP'}${assay++}`;
        rows.push([subject,subject,id,layer,condition,''].join(','));
        if (layer === 'transcriptomics') rnaAssays.push({id,condition,s});
        else protAssays.push({id,condition,s});
      }
    }
  }
  rnaHeader.push(...rnaAssays.map(x=>x.id));
  protHeader.push(...protAssays.map(x=>x.id));
  for (let feature = 0; feature < 501; feature += 1) {
    const name = feature === 0 ? 'HIGH_DIM_SIGNAL' : `GENE_${feature}`;
    const values = rnaAssays.map(({condition,s}) => {
      const baseline = 5 + s*0.03 + (feature % 7)*0.01;
      return String(baseline + (feature === 0 && condition === 'treatment' ? 2.5 : 0));
    });
    rnaRows.push([name,...values].join(','));
  }
  for (let feature = 0; feature < 10; feature += 1) {
    const name = feature === 0 ? 'PROT_SIGNAL' : `PROT_${feature}`;
    const values = protAssays.map(({condition,s}) => {
      const baseline = 3 + s*0.02 + feature*0.01;
      return String(baseline + (feature === 0 && condition === 'treatment' ? 1.2 : 0));
    });
    protRows.push([name,...values].join(','));
  }

  const meta = csvFile('highdim_metadata.csv', rows.join('\n'));
  const rna = csvFile('highdim_rna.csv', [rnaHeader.join(','),...rnaRows].join('\n'));
  const protein = csvFile('highdim_protein.csv', [protHeader.join(','),...protRows].join('\n'));
  const metaParsed = parseDelimited(await meta.text());
  const highdim = await runDeterministicAnalysis({
    files:{metadata:meta,transcriptomics:rna,proteomics:protein,metabolomics:null},
    metadataRows:metaParsed.rows,
    columnMapping:mapping,
    protocol:{organism:'human',objective:'groups',longitudinal:false,designType:'independent',studySetting:'synthetic_test',groupCount:'2',sampleOverlap:'same_specimen'},
    dataTypes:{transcriptomics:'log_expression',proteomics:'log_intensity',metabolomics:'concentration'},
    useReactome:false,
    resolveIdentifiers:false
  });
  assert.equal(highdim.layers.transcriptomics.inferenceMethod, 'Welch t-test');
  assert.equal(highdim.layers.proteomics.inferenceMethod, 'deterministic permutation');
  const signal = highdim.layers.transcriptomics.rows.find(x=>x.feature === 'HIGH_DIM_SIGNAL');
  assert.ok(signal && signal.effect > 2 && signal.pValue < 1e-6);
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

// Batch safety: a biological condition completely nested inside technical batch must be refused.
{
  const metadataText = [
    'subject_id,sample_id,assay_id,omic,condition,timepoint,batch',
    'C1,C1,RC1,transcriptomics,control,,BATCH_CONTROL',
    'C1,C1,PC1,proteomics,control,,BATCH_CONTROL',
    'C2,C2,RC2,transcriptomics,control,,BATCH_CONTROL',
    'C2,C2,PC2,proteomics,control,,BATCH_CONTROL',
    'T1,T1,RT1,transcriptomics,treatment,,BATCH_TREATMENT',
    'T1,T1,PT1,proteomics,treatment,,BATCH_TREATMENT',
    'T2,T2,RT2,transcriptomics,treatment,,BATCH_TREATMENT',
    'T2,T2,PT2,proteomics,treatment,,BATCH_TREATMENT'
  ].join('\n');
  const meta = csvFile('batch_confounded_metadata.csv', metadataText);
  const rna = csvFile('batch_confounded_rna.csv', [
    'feature_id,RC1,RC2,RT1,RT2',
    'GENE_A,1,1.1,5,5.1'
  ].join('\n'));
  const protein = csvFile('batch_confounded_protein.csv', [
    'feature_id,PC1,PC2,PT1,PT2',
    'PROT_A,2,2.1,6,6.1'
  ].join('\n'));
  const metaParsed = parseDelimited(await meta.text());

  await assert.rejects(
    () => runDeterministicAnalysis({
      files:{metadata:meta,transcriptomics:rna,proteomics:protein,metabolomics:null},
      metadataRows:metaParsed.rows,
      columnMapping:mapping,
      protocol:{organism:'human',objective:'groups',longitudinal:false,designType:'independent',studySetting:'synthetic_test',groupCount:'2',sampleOverlap:'same_specimen'},
      dataTypes:{transcriptomics:'log_expression',proteomics:'log_intensity',metabolomics:'concentration'},
      useReactome:false,
      resolveIdentifiers:false
    }),
    /Technical batch confounding prevents identifiable biological inference/
  );
}


// Balanced batch adjustment: batch effect must be removed while preserving the biological contrast.
{
  const rows = ['subject_id,sample_id,assay_id,omic,condition,timepoint,batch,technical_replicate,outcome,age'];
  const rnaHeader = ['feature_id'];
  const protHeader = ['feature_id'];
  const rnaValues = ['BATCH_GENE'];
  const protValues = ['BATCH_PROTEIN'];
  let assay = 1;
  for (const condition of ['control','treatment']) {
    for (const batch of ['B1','B2']) {
      for (let s = 1; s <= 4; s += 1) {
        const subject = condition[0].toUpperCase() + batch + s;
        const age = 30 + s;
        for (const layer of ['transcriptomics','proteomics']) {
          const id = (layer === 'transcriptomics' ? 'BR' : 'BP') + assay++;
          rows.push([subject,subject,id,layer,condition,'',batch,'1','',age].join(','));
          const biological = condition === 'treatment' ? 2 : 0;
          const batchEffect = batch === 'B2' ? 8 : 0;
          const value = 5 + biological + batchEffect + s * 0.01;
          if (layer === 'transcriptomics') {
            rnaHeader.push(id);
            rnaValues.push(String(value));
          } else {
            protHeader.push(id);
            protValues.push(String(value + 1));
          }
        }
      }
    }
  }
  const meta = csvFile('balanced_batch_metadata.csv', rows.join('\n'));
  const rna = csvFile('balanced_batch_rna.csv', [rnaHeader.join(','),rnaValues.join(',')].join('\n'));
  const protein = csvFile('balanced_batch_protein.csv', [protHeader.join(','),protValues.join(',')].join('\n'));
  const metaParsed = parseDelimited(await meta.text());
  const adjusted = await runDeterministicAnalysis({
    files:{metadata:meta,transcriptomics:rna,proteomics:protein,metabolomics:null},
    metadataRows:metaParsed.rows,
    columnMapping:mapping,
    protocol:{organism:'human',objective:'groups',longitudinal:false,designType:'independent',studySetting:'synthetic_test',groupCount:'2',sampleOverlap:'same_specimen',batchKnown:'yes',covariateColumns:['age']},
    dataTypes:{transcriptomics:'log_expression',proteomics:'log_intensity',metabolomics:'concentration'},
    useReactome:false,
    resolveIdentifiers:false
  });
  assert.equal(adjusted.metadataSummary.batchAudit.transcriptomics.status, 'multiple_batches_adjusted');
  assert.equal(adjusted.layers.transcriptomics.adjustment.applied, true);
  assert.ok(Math.abs(adjusted.layers.transcriptomics.rows[0].effect - 2) < 0.1);
}

// True unsupervised multi-block branch: shared latent structure across two omics.
{
  const rows = ['subject_id,sample_id,assay_id,omic,condition,timepoint,batch'];
  const rnaHeader = ['feature_id'];
  const protHeader = ['feature_id'];
  const rnaSignal = ['RNA_SHARED'];
  const rnaNoise = ['RNA_NOISE'];
  const protSignal = ['PROT_SHARED'];
  const protNoise = ['PROT_NOISE'];
  let assay = 1;
  for (let s = 1; s <= 8; s += 1) {
    const subject = 'E' + s;
    const latent = s - 4.5;
    for (const layer of ['transcriptomics','proteomics']) {
      const id = (layer === 'transcriptomics' ? 'ER' : 'EP') + assay++;
      rows.push([subject,subject,id,layer,'','',''].join(','));
      if (layer === 'transcriptomics') {
        rnaHeader.push(id);
        rnaSignal.push(String(latent * 2));
        rnaNoise.push(String((s % 3) * 0.1));
      } else {
        protHeader.push(id);
        protSignal.push(String(latent * 1.5));
        protNoise.push(String(((s + 1) % 4) * 0.1));
      }
    }
  }
  const meta = csvFile('explore_metadata.csv', rows.join('\n'));
  const rna = csvFile('explore_rna.csv', [rnaHeader.join(','),rnaSignal.join(','),rnaNoise.join(',')].join('\n'));
  const protein = csvFile('explore_protein.csv', [protHeader.join(','),protSignal.join(','),protNoise.join(',')].join('\n'));
  const metaParsed = parseDelimited(await meta.text());
  const explored = await runDeterministicAnalysis({
    files:{metadata:meta,transcriptomics:rna,proteomics:protein,metabolomics:null},
    metadataRows:metaParsed.rows,
    columnMapping:mapping,
    protocol:{organism:'human',objective:'explore',longitudinal:false,designType:'independent',studySetting:'synthetic_test',groupCount:'1',sampleOverlap:'same_specimen',batchKnown:'no',covariateColumns:[]},
    dataTypes:{transcriptomics:'log_expression',proteomics:'log_intensity',metabolomics:'concentration'},
    useReactome:false,
    resolveIdentifiers:false
  });
  assert.equal(explored.exploration.subjects, 8);
  assert.ok(explored.exploration.components.length >= 1);
  const loadingNames = explored.exploration.components[0].topLoadings.map(x=>x.feature);
  assert.ok(loadingNames.includes('RNA_SHARED'));
  assert.ok(loadingNames.includes('PROT_SHARED'));
  assert.equal(explored.layers.transcriptomics.mode, 'exploratory-multiblock-pca');
}

// Outcome branch: continuous, binary, count and survival models with explicit covariate adjustment.
{
  const makeOutcomeDataset = (type) => {
    const rows = ['subject_id,sample_id,assay_id,omic,condition,timepoint,batch,technical_replicate,outcome,age,survival_time,survival_event'];
    const rnaHeader = ['feature_id'];
    const protHeader = ['feature_id'];
    const rnaSignal = ['OUTCOME_GENE'];
    const rnaNoise = ['OUTCOME_NOISE'];
    const protSignal = ['OUTCOME_PROTEIN'];
    const protNoise = ['PROT_NOISE'];
    let assay = 1;
    for (let s = 1; s <= 24; s += 1) {
      const subject = 'O' + s;
      const age = 40 + (s % 8);
      const latent = (s - 12.5) / 4;
      let outcome = '';
      let survivalTime = '';
      let survivalEvent = '';
      if (type === 'continuous') outcome = String(2 * latent + 0.05 * age);
      if (type === 'binary') outcome = latent > 0 ? 'responder' : 'nonresponder';
      if (type === 'multiclass') outcome = s <= 8 ? 'class_A' : s <= 16 ? 'class_B' : 'class_C';
      if (type === 'count') outcome = String(Math.max(0, Math.round(4 + latent * 1.5)));
      if (type === 'survival') {
        survivalTime = String(Math.max(1, 30 - latent * 4 + (s % 3)));
        survivalEvent = s % 5 === 0 ? '0' : '1';
      }
      for (const layer of ['transcriptomics','proteomics']) {
        const id = (layer === 'transcriptomics' ? 'OR' : 'OP') + assay++;
        rows.push([subject,subject,id,layer,'','','','1',outcome,age,survivalTime,survivalEvent].join(','));
        const signalValue = latent + 0.02 * age;
        if (layer === 'transcriptomics') {
          rnaHeader.push(id);
          rnaSignal.push(String(signalValue));
          rnaNoise.push(String((s % 5) * 0.03));
        } else {
          protHeader.push(id);
          protSignal.push(String(signalValue * 0.8));
          protNoise.push(String(((s + 2) % 6) * 0.02));
        }
      }
    }
    return {
      meta: csvFile('outcome_' + type + '_metadata.csv', rows.join('\n')),
      rna: csvFile('outcome_' + type + '_rna.csv', [rnaHeader.join(','),rnaSignal.join(','),rnaNoise.join(',')].join('\n')),
      protein: csvFile('outcome_' + type + '_protein.csv', [protHeader.join(','),protSignal.join(','),protNoise.join(',')].join('\n'))
    };
  };

  for (const type of ['continuous','binary','multiclass','count','survival']) {
    const ds = makeOutcomeDataset(type);
    const parsedMeta = parseDelimited(await ds.meta.text());
    const outcomeResult = await runDeterministicAnalysis({
      files:{metadata:ds.meta,transcriptomics:ds.rna,proteomics:ds.protein,metabolomics:null},
      metadataRows:parsedMeta.rows,
      columnMapping:mapping,
      protocol:{organism:'human',objective:'outcome',outcomeType:type,longitudinal:false,designType:'independent',studySetting:'synthetic_test',groupCount:'1',sampleOverlap:'same_specimen',batchKnown:'no',covariateColumns:['age']},
      dataTypes:{transcriptomics:'log_expression',proteomics:'log_intensity',metabolomics:'concentration'},
      useReactome:false,
      resolveIdentifiers:false
    });
    assert.equal(outcomeResult.layers.transcriptomics.mode, 'outcome-' + type);
    const signal = outcomeResult.layers.transcriptomics.rows.find(x=>x.feature === 'OUTCOME_GENE');
    assert.ok(signal && Number.isFinite(signal.effect));
    assert.ok(Number.isFinite(signal.pValue));
  }
}

console.log('multiomics paired / longitudinal / identifier-resolution branches: PASS');
