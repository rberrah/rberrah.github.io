import assert from 'node:assert/strict';
import {auditPairedRnaStudy,validPrimaryRnaContrast} from
  '../src/lib/multiomics/paired-study-client.js';
const mapping=Object.fromEntries(['subject_id','sample_id','assay_id','omic',
  'condition','sample_type'].map(k=>[k,k]));
const subjects=['PAT01','PAT02','PAT03','PAT04'];
const rows=subjects.flatMap((subject_id,i)=>['control','treated'].map((condition,j)=>({
  subject_id,sample_id:'S'+(i*2+j+1),assay_id:'A'+(i*2+j+1),
  omic:'transcriptomics',condition,sample_type:'biological'
})));
const matrixAssays=rows.map(row=>row.assay_id);
function run(data={}){return auditPairedRnaStudy({rows,mapping,matrixAssays,
  valueType:'raw_counts',...data})}
const v=run();
assert.equal(v.ok,true);
assert.equal(v.nPairs,4);
assert.equal(v.nBiologicalSamples,8);
assert.equal(v.nAssays,8);
assert.deepEqual(v.conditionNames,['control','treated']);
assert.equal(run({valueType:'tpm'}).code,'raw_counts_only');
assert.equal(run({rows:rows.slice(0,-1),
  matrixAssays:matrixAssays.slice(0,-1)}).code,'missing_pair');
const duplicate=structuredClone(rows);duplicate[1].sample_id=duplicate[0].sample_id;
assert.equal(run({rows:duplicate}).code,'shared_sample_between_conditions');
const cell=structuredClone(rows);cell[1].condition='control';
assert.equal(run({rows:cell}).code,'duplicate_pair_cell');
const unrelated=structuredClone(rows);unrelated[1].subject_id='OTHER';
assert.equal(run({rows:unrelated}).code,'min_four_pairs');
const unknown=structuredClone(rows);unknown[1].sample_type='pooled_qc';
assert.equal(run({rows:unknown}).code,'non_biological_sample');
const noId=structuredClone(rows);noId[1].subject_id='';
assert.equal(run({rows:noId}).code,'missing_pairing_value');
const wrong=structuredClone(rows);wrong[1].assay_id='NOT_IN_MATRIX';
assert.equal(run({rows:wrong}).code,'matrix_metadata_mismatch');
assert.equal(run({matrixAssays:[...matrixAssays,'A1']}).code,'missing_or_duplicate_assays');
assert.equal(validPrimaryRnaContrast(v.conditionNames,'treated','control'),true);
assert.equal(validPrimaryRnaContrast(v.conditionNames,'control','treated'),true);
assert.equal(validPrimaryRnaContrast(v.conditionNames,'control','control'),false);
assert.equal(validPrimaryRnaContrast(v.conditionNames,'','control'),false);
console.log('PAIRED RNA BEGINNER GUARD: PASS — four true biological pairs, IDs, missingness, QC, explicit contrast');
