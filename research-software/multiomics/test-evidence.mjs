#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {HOME,readCSV,validateSummaries,build} from './build-evidence.mjs';

const provenance=JSON.parse(fs.readFileSync(path.join(HOME,'evidence','provenance.json'),'utf8'));
const rows=readCSV(fs.readFileSync(path.join(HOME,'evidence','verified-summaries.csv'),'utf8'));
assert.equal(rows.length,27);
assert.equal(validateSummaries(rows,provenance),true);
const original=rows[0];
assert.deepEqual(readCSV('alpha,beta\n"a,b","a""b"\n'),[{alpha:'a,b',beta:'a"b'}]);
assert.throws(()=>readCSV('a,a\n1,2'),/Duplicate/);
assert.throws(()=>readCSV('a,b\n1'),/Ragged/);
assert.throws(()=>readCSV('a,b\n"never ends'),/Unclosed/);
assert.throws(()=>validateSummaries(rows.slice(1),provenance),/Missing evidence/);
assert.throws(()=>validateSummaries([...rows,original],provenance),/Repeated evidence/);
const swapped=rows.map((r,i)=>i?{...r}:{...r,empirical_fdr:'0.70'});
assert.throws(()=>validateSummaries(swapped,provenance),/Invalid confidence interval/);
const falseCertificate=structuredClone(provenance);
falseCertificate.software_outcomes.clinical_validation=true;
assert.throws(()=>validateSummaries(rows,falseCertificate),/Unjustified scientific certification/);
const wrongStudy=rows.map((r,i)=>i?{...r}:{...r,study:'FAKE'});
assert.throws(()=>validateSummaries(wrongStudy,provenance),/Unknown study/);
const d=fs.mkdtempSync(path.join(os.tmpdir(),'pmx-evidence-test-'));
try{
 const report=build({out:d});
 assert.equal(report.total_cells,27);
 assert.equal(report.certification.universal_fdr_control,false);
 assert.equal(report.certification.clinical_validation,false);
 assert.equal(report.raw_workflow_files_integrity_checked.PR52.verified,false);
 assert.equal(report.raw_workflow_files_integrity_checked.PR75.verified,false);
 const md=fs.readFileSync(path.join(d,'evidence-report.md'),'utf8');
 assert.match(md,/NOT supplied/);
 assert.match(md,/not a clinical, biological, or 5% nominal-FDR certification/i);
 assert.match(md,/DESeq2/);
 assert.equal(report.observed_cells.filter(x=>x.empirical_fdr>0.05).length>0,true);
}finally{fs.rmSync(d,{recursive:true,force:true})}

const paper=fs.readFileSync(path.join(HOME,'paper.md'),'utf8');
const bib=fs.readFileSync(path.join(HOME,'paper.bib'),'utf8');
const citation=fs.readFileSync(path.join(HOME,'CITATION.cff'),'utf8');
for(const section of [
  'Summary','Statement of need','State of the field','Software design',
  'Research impact statement','AI usage disclosure','Acknowledgements',
  'Availability'
])assert.ok(paper.includes('# '+section),'Required JOSS section missing: '+section);
const words=paper.split(/\s+/).filter(Boolean).length;
assert.ok(words>=750&&words<=1750,'Paper length outside current JOSS 750–1750 word guidance: '+words);
for(const cited of paper.match(/@([A-Za-z0-9_]+)/g)||[])
  assert.ok(bib.includes('{'+cited.slice(1)+','),'Cited reference absent: '+cited);
assert.match(citation,/type:\s*software/);
assert.match(citation,/license:\s*MIT/);
assert.match(paper,/human authors[\s\S]*must inspect/);
assert.match(paper,/statistical limitations/);
console.log('JOSS PAPER STRUCTURE: PASS (draft remains unsubmitted; human authorship review pending)');

console.log('MULTIOMICS PAPER EVIDENCE: PASS (27 pinned cells, scientific claims remain restricted)');
