import assert from 'node:assert/strict';
import { exportTdmForModelDiscovery, validateTdmModelExport, TDM_MODEL_EXPORT_SCHEMA } from './export_tdm_model_references.mjs';
import { tdmDrugs,tdmTargets } from '../src/lib/content/tdmTargets.js';
import { antibioticPdTargets } from '../src/lib/content/tdmAntibioticPd.js';
const snapshot=exportTdmForModelDiscovery();
assert.equal(snapshot.schema,TDM_MODEL_EXPORT_SCHEMA);
assert.equal(validateTdmModelExport(snapshot),true);
assert.deepEqual(exportTdmForModelDiscovery(),snapshot,'Snapshot must be deterministic and content addressed');
assert.equal(snapshot.drugs.length,tdmDrugs.length);
assert.equal(snapshot.drugs.flatMap(d=>d.targets).length,tdmTargets.length);
assert.equal(snapshot.drugs.flatMap(d=>d.pkpd).length,antibioticPdTargets.length);
assert.ok(snapshot.drugs.every(d=>d.index?.key && d.practicalSampling?.key));
assert.ok(snapshot.drugs.flatMap(d=>d.targets).every(t=>t.humanSignoff==='PENDING'));
assert.ok(!snapshot.drugs.flatMap(d=>d.targets).some(t=>t.interpretationAllowed));
assert.ok(snapshot.drugs.find(d=>d.id==='tac')?.targets.length>0);
assert.ok(snapshot.drugs.find(d=>d.id==='cefepime')?.pkpd.length>0);
assert.ok(snapshot.drugs.find(d=>d.id==='fluconazole')?.society?.recommendation);
assert.equal(snapshot.drugs.find(d=>d.id==='abacavir')?.targets.length,0);
assert.equal(snapshot.drugs.find(d=>d.id==='theophylline')?.targets[0]?.metric,'Cmax à l’état stable');
assert.equal(validateTdmModelExport({...snapshot,sha256:'0'.repeat(64)}),false);
assert.equal(validateTdmModelExport({...snapshot,patientDataIncluded:true}),false);
assert.equal(validateTdmModelExport({...snapshot,containsDosingAdvice:true}),false);
assert.equal(validateTdmModelExport({...snapshot,drugs:[]}),false);
assert.equal(snapshot.drugs.filter(d=>d.targets.length>0).length>0,true);
console.log('TDM MIPD export PREVIEW: '+snapshot.drugs.length+' drugs, '+
  snapshot.drugs.reduce((n,d)=>n+d.targets.length,0)+' references, '+
  snapshot.drugs.reduce((n,d)=>n+d.pkpd.length,0)+' PKPD contexts. No clinical interpretation.');
