#!/usr/bin/env node
/**
 * Check the integrity and scientific scope of an existing publication bundle.
 * No data or computation is silently inferred to have been validated.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';

const location=process.argv[2]||'tmp/multiomics/publication-artifact';
const dir=path.resolve(location);
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
assert.equal(manifest.schema,'pmx-multiomics-publication-artifact/v1');
assert.match(manifest.source.commit,/^[a-f0-9]{40}$/);
assert.equal(manifest.source.tree_clean,true);
assert.equal(manifest.source.source_archive_sha256,
  digest(path.join(dir,manifest.source.source_archive)));
assert.equal(manifest.source.file_sha256['package-lock.json'],
  manifest.environment.package_lock_sha256);
assert.ok(manifest.source.source_file_count>=35);
assert.equal(Object.keys(manifest.source.file_sha256).length,
  manifest.source.source_file_count);
for(const [file,sha] of Object.entries(manifest.source.file_sha256)) {
  assert.match(file,/^[A-Za-z0-9_.\/+-]+$/);
  assert.ok(!file.includes('..')&&!file.startsWith('/'),'Unsafe archived path');
  assert.match(sha,/^[a-f0-9]{64}$/);
  assert.ok(!/\.(csv|tsv|mzml|mzxml|bam|fastq)$/i.test(file),
    'Measured datasets do not belong in the public source-only artifact');
}
const statuses=new Map(manifest.checks.map(c=>[c.name,c.status]));
for(const check of manifest.checks) {
  assert.ok(['pass','fail','not_run_missing_Rscript'].includes(check.status));
  if(check.log){
    assert.match(check.log,/^logs\/[a-z0-9-]+\.log$/);
    assert.equal(digest(path.join(dir,check.log)),check.output_sha256);
  }else {
    assert.equal(check.status,'not_run_missing_Rscript');
    assert.equal(check.output_sha256,null);
  }
}
for(const test of ['js-omics-engine','js-research-methods-privacy','js-public-evidence-scope'])
  assert.equal(statuses.get(test),'pass',test+' failed or was not executed');
const requiredR=['r-reference-backend','r-browser-reference','r-ms-assurance','r-proteomics-assurance'];
for(const test of requiredR)assert.ok(statuses.has(test),'Missing reference R status: '+test);
assert.equal(manifest.assurance.software_smoke_all_executed_and_passed,
  manifest.checks.every(c=>c.status==='pass'));
assert.equal(manifest.assurance.universal_statistical_validation,false);
assert.equal(manifest.assurance.clinical_validation,false);
assert.equal(manifest.assurance.publication_acceptance_or_certificate,false);
assert.equal(manifest.assurance.external_biological_reproducibility,
  'not_assessed_by_this_artifact');
assert.ok(manifest.limitations.some(s=>s.includes('version')));
if(process.argv.includes('--require-r')) {
  for(const test of requiredR) assert.equal(statuses.get(test),'pass');
  assert.equal(manifest.environment.r.status,'observed');
}
console.log('OMICS PUBLICATION BUNDLE INTEGRITY: PASS (source and tests only; not a scientific certificate)');
