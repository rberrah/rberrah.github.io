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

import { mipdModelsForTdmDrug,mipdCatalogueHrefForTdmDrug,mipdDrugKeyForTdmDrug,mipdDrugFilterFromDeepLink } from '../src/lib/tdm/guideModelLinks.js';
import { tdmModels } from '../src/lib/content/tdmModels.js';
assert.equal(tdmModels.length,46);
assert.equal(new Set(tdmModels.map(m=>m.drugKey)).size,23);
assert.equal(mipdModelsForTdmDrug('tac').length,2);
assert.equal(mipdModelsForTdmDrug('vancomycin').length,3);
assert.equal(mipdModelsForTdmDrug('cefepime').length,3);
assert.equal(mipdModelsForTdmDrug('fluconazole').length,1);
assert.equal(mipdModelsForTdmDrug('lithium').length,0);
assert.equal(mipdDrugKeyForTdmDrug('tac'),'tacrolimus');
assert.equal(mipdDrugKeyForTdmDrug('vancomycin'),'vanco');
assert.equal(mipdCatalogueHrefForTdmDrug('/pharmacometrie','tac','fr'),
  '/pharmacometrie/tdm/?drug=tacrolimus&lang=fr#modeles');
assert.equal(mipdCatalogueHrefForTdmDrug('/pharmacometrie/','vancomycin','en'),
  '/pharmacometrie/tdm/?drug=vanco&lang=en#modeles');
assert.equal(mipdCatalogueHrefForTdmDrug('/pharmacometrie','lithium','fr'),null);
assert.deepEqual(mipdDrugFilterFromDeepLink('cefepime'),{drugKey:'cefepime',invalid:false});
assert.deepEqual(mipdDrugFilterFromDeepLink(''),{drugKey:'all',invalid:false});
assert.deepEqual(mipdDrugFilterFromDeepLink('invalid-unknown'),{drugKey:'all',invalid:true});
assert.deepEqual(mipdDrugFilterFromDeepLink('../model'),{drugKey:'all',invalid:true});
assert.equal(tdmModels.filter(m=>m.analysisEligible).length,13);
assert.equal(mipdModelsForTdmDrug('tac').some(m=>m.analysisEligible===false),true,
  'Deep links must also show simulation-only models');
console.log('PMx MIPD deep links: 46 models, 23 mapped drug keys, no automatic analysis.');

// --- Crosswalk evolution contract (adding MIPD models later must stay predictable) ---
import { mipdCrosswalkDrift,mipdCrosswalkIsExact,describeMipdCrosswalkDrift,
  computeMipdCrosswalkDrift,isMipdCrosswalkExact } from '../src/lib/tdm/guideModelLinks.js';
// The pinned catalogue must be exactly covered before any release.
assert.equal(mipdCrosswalkIsExact,true,
  'Reviewed crosswalk drifted from the pinned MIPD catalogue: '+describeMipdCrosswalkDrift());
assert.deepEqual(mipdCrosswalkDrift.unmappedModelDrugKeys,[]);
assert.deepEqual(mipdCrosswalkDrift.crosswalkKeysWithoutModel,[]);
assert.deepEqual(mipdCrosswalkDrift.ambiguousTdmIds,[]);
assert.equal(describeMipdCrosswalkDrift(),'');
// A new model for an ALREADY mapped molecule is supported automatically.
const reviewed={tacrolimus:'tac',vanco:'vancomycin'};
assert.equal(isMipdCrosswalkExact(
  computeMipdCrosswalkDrift(['tacrolimus','tacrolimus','vanco','vanco','vanco'],reviewed)),true,
  'Adding a model for an already reviewed molecule must need no crosswalk change');
// A new molecule must be reported explicitly and name the offending key.
const newMolecule=computeMipdCrosswalkDrift(['tacrolimus','vanco','ceftazidime_avibactam'],reviewed);
assert.equal(isMipdCrosswalkExact(newMolecule),false);
assert.deepEqual(newMolecule.unmappedModelDrugKeys,['ceftazidime_avibactam']);
assert.match(describeMipdCrosswalkDrift(newMolecule),/ceftazidime_avibactam/);
// A stale crosswalk entry and an ambiguous TDM id are both reported.
assert.deepEqual(
  computeMipdCrosswalkDrift(['tacrolimus'],reviewed).crosswalkKeysWithoutModel,['vanco']);
assert.deepEqual(
  computeMipdCrosswalkDrift(['a','b'],{a:'same',b:'same'}).ambiguousTdmIds,['same']);
// Fail-safe: an ambiguous mapping must never produce a deep link for that molecule.
assert.equal(mipdDrugKeyForTdmDrug('definitely-not-a-tdm-id'),null);
assert.equal(mipdCatalogueHrefForTdmDrug('/pharmacometrie','definitely-not-a-tdm-id','fr'),null);
console.log('PMx crosswalk evolution: exact today; new molecules reported with an actionable message.');

// --- Reverse navigation: a MIPD model card back to its TDM Guide entry ---
import { tdmGuideHrefForModelDrugKey,tdmGuideDrugFromDeepLink } from '../src/lib/tdm/guideModelLinks.js';
import { mipdDrugToTdmId as mipdDrugToTdmIdForTest } from '../src/lib/tdm/mipdDrugCrosswalk.preview.v1.js';
assert.equal(tdmGuideHrefForModelDrugKey('/pharmacometrie','tacrolimus','fr'),
  '/pharmacometrie/cibles-tdm/?drug=tac&lang=fr');
assert.equal(tdmGuideHrefForModelDrugKey('/pharmacometrie/','vanco','en'),
  '/pharmacometrie/cibles-tdm/?drug=vancomycin&lang=en');
// Every molecule in the pinned catalogue reaches the guide, and only those.
for (const key of new Set(tdmModels.map(model=>model.drugKey)))
  assert.ok(tdmGuideHrefForModelDrugKey('/pharmacometrie',key,'fr'),'no guide link for '+key);
assert.equal(tdmGuideHrefForModelDrugKey('/pharmacometrie','not-a-drug-key','fr'),null);
assert.equal(tdmGuideHrefForModelDrugKey('/pharmacometrie','constructor','fr'),null);
// The link carries a molecule and a language only: no model id, no patient value.
for (const key of new Set(tdmModels.map(model=>model.drugKey))) {
  const href=tdmGuideHrefForModelDrugKey('/pharmacometrie',key,'fr');
  assert.deepEqual([...new URL(href,'https://x').searchParams.keys()].sort(),['drug','lang']);
}
assert.deepEqual(tdmGuideDrugFromDeepLink('tac'),{drugId:'tac',invalid:false});
assert.deepEqual(tdmGuideDrugFromDeepLink(''),{drugId:null,invalid:false});
assert.deepEqual(tdmGuideDrugFromDeepLink(null),{drugId:null,invalid:false});
assert.deepEqual(tdmGuideDrugFromDeepLink('lithium'),{drugId:null,invalid:true});
assert.deepEqual(tdmGuideDrugFromDeepLink('../secret'),{drugId:null,invalid:true});
assert.deepEqual(tdmGuideDrugFromDeepLink('__proto__'),{drugId:null,invalid:true});
// Round trip: the guide link and the catalogue link agree on the same molecule.
for (const [drugKey,tdmId] of Object.entries(mipdDrugToTdmIdForTest)) {
  assert.equal(tdmGuideDrugFromDeepLink(tdmId).drugId,tdmId);
  assert.equal(mipdDrugKeyForTdmDrug(tdmId),drugKey);
}
console.log('PMx reverse links: every pinned molecule reaches its TDM Guide entry, molecule and language only.');
