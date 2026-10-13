import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {File} from 'node:buffer';
import {createPortableProject} from '../src/lib/multiomics/portable-project.js';
import {buildResearchBundle,fullLayerCsv,methodsMarkdown,zipEntries} from '../src/lib/multiomics/research-export-package.js';

if(!globalThis.File)globalThis.File=File;
if(!globalThis.crypto)globalThis.crypto=crypto.webcrypto;
const subject='PRIVATE_SUBJECT_NEVER_LOG';
const rows=[
 {feature:'GENE,1',effect:-0.21,effectScale:'log2',pValue:0.02,qValue:0.07,n:8,nReference:4,nComparison:4,model:'Welch, robust'},
 {feature:'=HYPERLINK("http://malicious.test")',effect:1.25,pValue:null,qValue:null,n:8,model:'reference'},
 {feature:'G"ene\nLine',effect:0,qValue:1,pValue:0,model:'normal'},
 ...Array.from({length:53},(_,i)=>({feature:'GENE_'+i,effect:i-5,
   pValue:(i+1)/60,qValue:(i+2)/60,model:'test'}))
];
const csv=fullLayerCsv(rows);
assert.ok(csv.startsWith('\uFEFFfeature,effect,effect_scale'));
assert.equal(csv.split('\r\n').filter(Boolean).length,57); // header + 56 rows (quoted LF does not split CRLF)
assert.ok(csv.includes('"GENE,1"'));
assert.ok(csv.includes('G""ene\\nLine')); // doubled quote in feature
assert.ok(csv.includes("'=HYPERLINK"));
assert.ok(csv.includes(',-0.21,'));
assert.ok(csv.includes(',0,'));
assert.ok(!csv.includes('undefined'));
assert.throws(()=>fullLayerCsv([{feature:'G1',pValue:1.2}]),/Invalid pValue/);
assert.throws(()=>fullLayerCsv([{feature:'',pValue:0.1}]),/Missing measured feature/);

const result={
 generatedAt:'2026-10-13T14:02:00Z',
 engine:{name:'PMx deterministic browser',version:'2.1',analysisMode:'single_omic'},
 protocol:{objective:'groups',analysisIntent:'exploratory',designType:'independent'},
 metadataSummary:{subjects:8,conditions:['control','treated']},
 inputManifest:{sourceSha256:'a'.repeat(64)},
 layers:{transcriptomics:{rows,inferenceMethod:'Welch exploratory screening',
  qc:{featuresBefore:60,featuresAfter:56,medianMissingFraction:0,
    preprocessingAudit:{declaredValueType:'normalized'}}}},
 scientificAssurance:{status:'independent_review_required'},
 privateSubject:subject
};
const files={metadata:new File(['subject_id,sample_id,condition\n'+subject+',S01,control\n'],
 'private_metadata.csv',{type:'text/csv'}),
 transcriptomics:new File(['feature_id,S01\nGENE1,10\n'],'rna.csv',{type:'text/csv'})};
const portable=await createPortableProject({files,settings:{objective:'groups',analysisIntent:'exploratory'},result:null});
const md=methodsMarkdown(result,'fr');
assert.match(md,/Transcriptomique/);
assert.match(md,/56/);
assert.match(md,/non exécuté/);
assert.match(md,/toutes les variables/);
assert.throws(()=>methodsMarkdown(result,'invalid'),/Unknown language/);
const bundle=await buildResearchBundle({result,portableProject:portable,locale:'en'});
assert.equal(bundle.filename,'multiomics_dossier_recherche_v1.zip');
assert.ok(bundle.blob.size>1000);
assert.equal(bundle.manifest.browser_layer_rows.transcriptomics,56);
assert.equal(bundle.manifest.confirmatory_certification,false);
assert.equal(bundle.manifest.clinical_validation,false);
assert.equal(bundle.manifest.sensitive_research_data,true);
assert.equal(bundle.manifest.files['tableaux/transcriptomics.csv'].sha256.length,64);
// Check ZIP structures, byte-for-byte SHA-256, no external libraries.
const b=Buffer.from(await bundle.blob.arrayBuffer());
let offset=0,seen={},names=[];
while(offset<b.length && b.readUInt32LE(offset)===0x04034b50){
 const method=b.readUInt16LE(offset+8),crc=b.readUInt32LE(offset+14);
 const len=b.readUInt32LE(offset+18),nlen=b.readUInt16LE(offset+26);
 const extra=b.readUInt16LE(offset+28),name=b.subarray(offset+30,offset+30+nlen).toString();
 const file=b.subarray(offset+30+nlen+extra,offset+30+nlen+extra+len);
 assert.equal(method,0);
 assert.ok(crc>=0);
 seen[name]=file.toString('utf8');names.push(name);
 const hash=crypto.createHash('sha256').update(file).digest('hex');
 if(bundle.manifest.files[name])assert.equal(hash,bundle.manifest.files[name].sha256);
 offset+=30+nlen+extra+len;
}
assert.equal(b.readUInt32LE(offset),0x02014b50);
assert.ok(names.includes('methods/methods.md'));
assert.ok(names.includes('provenance/manifest.json'));
assert.equal(JSON.parse(seen['source/projet_reproductible.json']).archivedResult,null);
assert.ok(seen['source/projet_reproductible.json'].includes(subject)); // PRIVATE
assert.ok(seen['provenance/analysis_complete.json'].includes(subject)); // PRIVATE
assert.ok(!seen['methods/methods_audit.json'].includes(subject)); // PUBLIC-SAFE
assert.ok(!seen['methods/methods.md'].includes(subject)); // PUBLIC-SAFE
assert.ok(!seen['tableaux/transcriptomics.csv'].includes(subject));
assert.ok(seen['tableaux/transcriptomics.csv'].includes('GENE_52'));
assert.ok(seen['tableaux/transcriptomics.csv'].includes("'=HYPERLINK"));
assert.equal(JSON.parse(seen['provenance/analysis_complete.json']).layers.transcriptomics.rows[1].feature,
  '=HYPERLINK("http://malicious.test")');
assert.throws(()=>zipEntries([{name:'../bad.txt',data:'x'}]),/Unsafe or duplicate/);
assert.throws(()=>zipEntries([{name:'same.txt',data:'a'},{name:'same.txt',data:'b'}]),/Unsafe or duplicate/);
await assert.rejects(buildResearchBundle({result,portableProject:{format:'unknown'}}),/Original study files/);
const html=methodsMarkdown(result,'en');
assert.match(html,/Methods actually run/);
assert.match(html,/not executed/);
console.log('MULTIOMICS RESEARCH ZIP: PASS, full 56-feature CSV, genuine ZIP structure, SHA-256, privacy boundaries, roundtrippable sources');
