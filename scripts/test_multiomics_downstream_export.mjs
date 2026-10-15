import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {buildDownstreamExchange} from '../src/lib/multiomics/downstream-exchange.js';
import {buildResearchBundle} from '../src/lib/multiomics/research-export-package.js';
if(!globalThis.crypto)globalThis.crypto=webcrypto;

const inputs={
  metadata:{content:'assay_id,sample_id,subject_id,omic,tissue,collection_time\nRNA1,S1,P1,transcriptomics,blood,0\nRNA2,S2,P2,transcriptomics,blood,1\n',sha256:'a'.repeat(64)},
  transcriptomics:{content:'feature_id,RNA1,RNA2\nENSG001,12,NA\nENSG002,13,5\n'}
};
const project={format:'pmx-multiomics-portable-project',schemaVersion:1,inputs,
  settings:{organism:'human',unitType:'participant',transcriptomicsValues:'raw_counts',transcriptomicsIdType:'ensembl_gene'}};
const exchange=await buildDownstreamExchange(project);
assert.equal(exchange.manifest.matrices.length,1);
assert.equal(exchange.manifest.matrices[0].omic,'transcriptomics');
assert(exchange.entries.find(x=>x.name==='exchange/matrices/transcriptomics.csv').data.includes('ENSG001,12,NA'));
const makeResult=()=>({engine:{name:'deterministic',version:'test'},protocol:{},layers:{transcriptomics:{rows:[{feature:'ENSG001'}]}}});
const dossier=await buildResearchBundle({result:makeResult(),portableProject:project});
assert.equal(dossier.manifest.downstream_exchange.status,'included');
assert(dossier.manifest.files['exchange/manifest.json']?.sha256);
const temporary=mkdtempSync(join(tmpdir(),'pmx-exchange-'));
try{
  const zipPath=join(temporary,'research.zip');
  writeFileSync(zipPath,Buffer.from(await dossier.blob.arrayBuffer()));
  execFileSync('python',['-c',
    'import pathlib,sys,zipfile; p=pathlib.Path(sys.argv[1]); zipfile.ZipFile(p).extractall(p.parent / "unpacked")',zipPath]);
  const output=execFileSync('python',['scripts/validate_multiomics_exchange.py',
    join(temporary,'unpacked','exchange')],{encoding:'utf8'});
  assert.match(output,/PASS: MultiOmics exchange/);
}finally{rmSync(temporary,{recursive:true,force:true});}
const incompatible={...project,inputs:{...inputs,transcriptomics:{content:'gene,RNA1,RNA2\nENSG001,1,2\n'}}};
await assert.rejects(buildDownstreamExchange(incompatible),/feature_id/);
const fallback=await buildResearchBundle({result:makeResult(),portableProject:incompatible});
assert.equal(fallback.manifest.downstream_exchange.status,'not_available');
assert(!fallback.manifest.files['exchange/manifest.json']);
// A genuine two-layer package: shared specimen, distinct assays, same subject.
const pairedInputs={
  metadata:{content:'assay_id,sample_id,subject_id,omic,tissue,collection_time\nR1,S1,P1,transcriptomics,blood,0\nR2,S2,P2,transcriptomics,blood,1\nM1,S1,P1,metabolomics,blood,0\nM2,S2,P2,metabolomics,blood,1\n',sha256:'b'.repeat(64)},
  transcriptomics:{content:'feature_id,R1,R2\nENSG001,4,5\n'},
  metabolomics:{content:'feature_id,M1,M2\nCHEBI:1,0.3,NA\n'}
};
const pairedProject={...project,inputs:pairedInputs};
const multi=await buildDownstreamExchange(pairedProject);
assert.deepEqual(multi.manifest.matrices.map(x=>x.omic),['transcriptomics','metabolomics']);
assert(multi.entries.find(x=>x.name==='exchange/samples.csv').data.includes('M1,S1,P1,metabolomics'));
const mismatch={
  ...pairedProject,
  inputs:{...pairedInputs,metadata:{...pairedInputs.metadata,
    content:pairedInputs.metadata.content.replace('M1,S1,P1','M1,S1,P9')}}
};
await assert.rejects(buildDownstreamExchange(mismatch),/multiple biological subjects/);
const tissueMismatch={
  ...pairedProject,
  inputs:{...pairedInputs,metadata:{...pairedInputs.metadata,
    content:pairedInputs.metadata.content.replace('M1,S1,P1,metabolomics,blood','M1,S1,P1,metabolomics,liver')}}
};
await assert.rejects(buildDownstreamExchange(tissueMismatch),/Conflicting tissue/);
const timeMismatch={
  ...pairedProject,
  inputs:{...pairedInputs,metadata:{...pairedInputs.metadata,
    content:pairedInputs.metadata.content.replace('M1,S1,P1,metabolomics,blood,0','M1,S1,P1,metabolomics,blood,9')}}
};
await assert.rejects(buildDownstreamExchange(timeMismatch),/Conflicting collection_time/);
const missingLayer={...pairedProject,inputs:{...pairedInputs,metabolomics:undefined}};
await assert.rejects(buildDownstreamExchange(missingLayer),/without its original matrix/);
const threeInputs={
  ...pairedInputs,
  metadata:{...pairedInputs.metadata,content:pairedInputs.metadata.content+
    'P1,S1,P1,proteomics,blood,0\nP2,S2,P2,proteomics,blood,1\n'},
  proteomics:{content:'feature_id,P1,P2\nP12345,1.2,2.4\n'}
};
const three=await buildDownstreamExchange({...project,inputs:threeInputs});
assert.deepEqual(three.manifest.matrices.map(x=>x.omic),
  ['transcriptomics','proteomics','metabolomics']);
console.log('PASS: mono-omic and two-omic exchanges, shared specimen ownership and safe fallback');
