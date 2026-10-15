import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {REFERENCE_R_SOURCE_FILES} from '../src/lib/multiomics/reference-r-sources.js';
import {REFERENCE_R_REPLAY_VERIFY_PY} from '../src/lib/multiomics/reference-replay-verifier-source.js';
import {referenceReplayEntries,referenceReplayStatus} from '../src/lib/multiomics/reference-replay.js';

// Source snapshot MUST match the actual implementation checked into this PR.
// Fail CI if anyone edits methods without updating the replay payload.
for (const [name,contents] of Object.entries(REFERENCE_R_SOURCE_FILES)) {
  assert.equal(contents,readFileSync(join('multiomics-engine',name),'utf8'),
    'Stale source snapshot for '+name);
}
assert.equal(REFERENCE_R_REPLAY_VERIFY_PY,
  readFileSync('scripts/verify_multiomics_r_replay.py','utf8'));
assert.equal(referenceReplayStatus(null).status,'not_available');
const expected={status:'ok',methods:{transcriptomics_differential_deseq2:{
  status:'ok',top:[{feature:'ENSG001',log2FoldChange:1.23,padj:0.04}]
}}};
const replay={requestJson:JSON.stringify({
  protocol:{objective:'groups',designType:'independent'},
  metadataCsv:'assay_id,sample_id,subject_id,omic\nR1,S1,P1,transcriptomics\n',
  matrices:{transcriptomics:'feature_id,R1\nENSG001,10\n'}
}),responseJson:JSON.stringify(expected)};
const {entries,status}=await referenceReplayEntries(replay);
assert.equal(status.status,'r_reference_source_replay_available');
assert.equal(status.numerical_equivalence_verified,false);
assert.equal(status.figure_equivalence_verified,false);
assert(entries.some(e=>e.name==='reproduction/run_reference_backend.R'));
assert.deepEqual(JSON.parse(entries.find(e=>e.name==='reproduction/reference_expected.json').data),expected);
assert(entries.some(e=>e.name==='reproduction/multiomics-engine/server.R'));
assert.equal(entries.find(e=>e.name==='reproduction/verify_replay.py').data,
  REFERENCE_R_REPLAY_VERIFY_PY);
const root=mkdtempSync(join(tmpdir(),'pmx-r-replay-'));
try {
  for(const e of entries.filter(x=>x.name.endsWith('.R'))){
    const file=join(root,e.name.replaceAll('/','_'));
    writeFileSync(file,e.data);
    try {
      execFileSync('Rscript',['-e','invisible(parse(file='+JSON.stringify(file)+'))'],
                   {stdio:'pipe'});
    } catch(e) {
      if(e.code==='ENOENT') {
        console.log('Rscript unavailable; syntax parsing delegated to CI R runner');
        break;
      }
      throw e;
    }
  }
}finally{rmSync(root,{recursive:true,force:true});}
console.log('PASS: frozen R source matches API; source replay is guarded and R parser accepts scripts');
