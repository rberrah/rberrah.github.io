import assert from 'node:assert/strict';
import { File } from 'node:buffer';
import { runDeterministicAnalysis } from '../src/lib/multiomics/deterministic.js';

function matrixFile(name, assayIds, shift = 0) {
  const header = ['feature_id', ...assayIds].join(',');
  const rows = [];
  for (let g = 1; g <= 24; g += 1) {
    const values = assayIds.map((_, index) => {
      const groupEffect = index >= assayIds.length / 2 && g <= 6 ? 1.5 : 0;
      return (3 + g * 0.07 + index * 0.03 + groupEffect + shift).toFixed(3);
    });
    rows.push([`F${g}`, ...values].join(','));
  }
  return new File([[header, ...rows].join('\n')], name, { type: 'text/csv' });
}

const subjects = ['P1','P2','P3','P4','P5','P6'];
const conditions = ['A','A','A','B','B','B'];
const rnaAssays = subjects.map((id) => `R_${id}`);
const protAssays = subjects.map((id) => `P_${id}`);
const metadataRows = [];
for (let i = 0; i < subjects.length; i += 1) {
  metadataRows.push({
    subject_id: subjects[i], sample_id: `${subjects[i]}_T0`, assay_id: rnaAssays[i],
    omic: 'transcriptomics', condition: conditions[i], timepoint: 'T0', batch: ''
  });
  metadataRows.push({
    subject_id: subjects[i], sample_id: `${subjects[i]}_T0`, assay_id: protAssays[i],
    omic: 'proteomics', condition: conditions[i], timepoint: 'T0', batch: ''
  });
}

const files = {
  metadata: new File(['placeholder'], 'samples.csv', { type: 'text/csv' }),
  transcriptomics: matrixFile('rna.csv', rnaAssays),
  proteomics: matrixFile('protein.csv', protAssays, 0.4),
  metabolomics: null
};

const columnMapping = {
  subject_id: 'subject_id', sample_id: 'sample_id', assay_id: 'assay_id', omic: 'omic',
  condition: 'condition', timepoint: 'timepoint', batch: 'batch', technical_replicate: '',
  outcome: '', survival_time: '', survival_event: '', sample_type: '', injection_order: ''
};

const result = await runDeterministicAnalysis({
  files,
  metadataRows,
  columnMapping,
  protocol: {
    objective: 'groups',
    designType: 'independent',
    longitudinal: false,
    batchKnown: 'no',
    partialOmicsExpected: 'no',
    covariateColumns: [],
    organism: 'human'
  },
  dataTypes: { transcriptomics: 'log_expression', proteomics: 'log_intensity' },
  identifierTypes: { transcriptomics: 'unknown', proteomics: 'unknown' },
  resolveIdentifiers: false,
  useReactome: false
});

assert.ok(result.preAnalysisDiagnostics);
assert.equal(result.engine.version, '1.6.0');
assert.equal(result.preAnalysisDiagnostics.groupBalance.subjectsPerGroup.A, 3);
assert.equal(result.preAnalysisDiagnostics.groupBalance.subjectsPerGroup.B, 3);
assert.equal(result.preAnalysisDiagnostics.groupBalance.smallestToLargestRatio, 1);
assert.equal(result.preAnalysisDiagnostics.groupBalance.status, 'good');
assert.equal(result.preAnalysisDiagnostics.omicsOverlap.subjectsInEveryLoadedLayer, 6);
assert.equal(result.preAnalysisDiagnostics.omicsOverlap.fractionInEveryLoadedLayer, 1);
assert.equal(result.preAnalysisDiagnostics.power.status, 'not_calculated');
assert.match(result.preAnalysisDiagnostics.power.note, /effect size/i);

// Small independent groups remain analysable but cannot be presented as a
// high-confidence confirmatory experiment simply because a p/q value exists.
assert.equal(result.preAnalysisDiagnostics.blockers.length, 0);
assert.ok(result.preAnalysisDiagnostics.warnings.some((item) => /fewer than five independent subjects/i.test(item)));
assert.equal(result.preAnalysisDiagnostics.status, 'review_required');

// Advanced methods are eligibility-gated independently of whether their R
// package happens to be installed on the machine.
assert.equal(result.preAnalysisDiagnostics.methodEligibility.mofa2.status, 'not_recommended');
assert.match(result.preAnalysisDiagnostics.methodEligibility.mofa2.reasons.join(' '), /more than 15 shared samples/i);
assert.equal(result.preAnalysisDiagnostics.methodEligibility.diablo.status, 'eligible_with_internal_cv');
assert.equal(result.preAnalysisDiagnostics.methodEligibility.diablo.smallestClass, 3);
assert.match(result.preAnalysisDiagnostics.methodEligibility.diablo.interpretation, /external validation/i);
assert.equal(result.metadataSummary.preAnalysisDiagnostics.status, result.preAnalysisDiagnostics.status);

console.log('multiomics pre-analysis diagnostics: PASS');
