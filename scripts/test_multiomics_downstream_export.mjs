import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
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
const incompatible={...project,inputs:{...inputs,transcriptomics:{content:'gene,RNA1,RNA2\nENSG001,1,2\n'}}};
await assert.rejects(buildDownstreamExchange(incompatible),/feature_id/);
const fallback=await buildResearchBundle({result:makeResult(),portableProject:incompatible});
assert.equal(fallback.manifest.downstream_exchange.status,'not_available');
assert(!fallback.manifest.files['exchange/manifest.json']);
console.log('PASS: mono-omic exchange, preserved NA and incompatible-source fallback');
