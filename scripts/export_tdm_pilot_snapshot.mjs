// Author-reviewed source references are imported, not copied into a second
// clinical database. This is a *candidate* read-only handoff contract, not a
// validated target resolver or a dose-adaptation service.
// Every entry below intentionally remains NOT_INTERPRETABLE until a human
// scientific reviewer has signed off on analyte/assay/formulation/model scope.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { tdmTargets, tdmTargetSources } from '../src/lib/content/tdmTargets.js';
import { tdmPharmacologyForDrug } from '../src/lib/content/tdmPharmacologyProfiles.js';

const tdmPilotDefinitions = Object.freeze([
  {
    drugId:'tac', targetId:'tac-kidney-mid',
    exposureMeasure:'C0', analyte:'tacrolimus_parent_total',
    matrix:'whole_blood', formulation:'immediate_release_oral',
    indication:'kidney_transplant',
    context:'6 weeks to 6 months after transplant; MMF-based co-immunosuppression; centre-specific study range',
    assayMethod:null, // Cannot infer mass spectrometry/immunoassay interchangeability.
    intervalHours:12, // Context of IR twice-daily regimen; not universal to any tacrolimus product.
    requires:['transplant_age','co_immunosuppression','product_formulation','assay_method','sample_time_from_dose']
  },
  {
    drugId:'mpa', targetId:'mpa-kidney-auc',
    exposureMeasure:'AUC0_12', analyte:'mpa_parent_total',
    matrix:'plasma', formulation:null,
    indication:'kidney_transplant',
    context:'AUC0–12 of total MPA, not MPA trough or unbound MPA; formulation and co-immunosuppression need independent verification',
    assayMethod:null, intervalHours:12,
    requires:['product_formulation','co_immunosuppression','assay_method','population','auc_estimation_method']
  },
  {
    drugId:'vancomycin', targetId:'vancomycin-mrsa',
    exposureMeasure:'AUC24', analyte:'vancomycin_total',
    matrix:'plasma_or_serum', formulation:'intravenous_systemic',
    indication:'serious_invasive_mrsa_infection',
    context:'AUC 400–600 mg·h/L when MIC by broth microdilution is assumed to be 1 mg/L; not a universal trough target',
    assayMethod:null, intervalHours:24,
    mic:{value:1,unit:'mg/L',method:'broth_microdilution',assumption:true},
    requires:['confirmed_mrsa_severity','mic_method','renal_function_stability','auc_model','sampling_times']
  }
]);

export function generateTdmPilotSnapshot() {
  const references = tdmPilotDefinitions.map((context) => {
    const target=tdmTargets.find((row)=>row.id===context.targetId);
    assert.ok(target,'Missing reviewed source reference '+context.targetId);
    assert.equal(target.drug,context.drugId);
    assert.ok(target.matrixFr && target.matrixEn,'Analytical matrix missing: '+target.id);
    const src=tdmTargetSources[target.source];
    assert.ok(src?.url.startsWith('https://'),'Missing source URL '+target.source);
    assert.ok(src.evidenceSection,'Missing precise source location '+target.source);
    const pk=tdmPharmacologyForDrug(target.drug);
    assert.ok(pk?.index && pk?.practical,'Missing source-scoped PK attributes '+target.drug);
    assert.ok(Number.isFinite(target.min));
    assert.ok(target.max===null || Number.isFinite(target.max));
    assert.ok(['range','above','at_most','approx','target'].includes(target.relation));
    return {
      ...context,
      target:{
        id:target.id,drugId:target.drug,indicationId:target.indication,
        indicationFr:target.indicationFr, indicationEn:target.indicationEn,
        metricAsPublished:target.metric,unitAsPublished:target.unit,
        value:{relation:target.relation,min:target.min,max:target.max},
        matrixAsPublishedFr:target.matrixFr,
        matrixAsPublishedEn:target.matrixEn,
        evidenceStatus:target.status,
        sourceId:target.source,
        source:{citation:src.citation,title:src.title,url:src.url,year:src.year,section:src.evidenceSection}
      },
      pharmacology:{
        index:pk.index.key,practicalMeasure:pk.practical.key,
        documentedRoutes:pk.administration.codes,proportionality:pk.proportionality.kind
      },
      eligibility:{
        validation:'PENDING_SCIENTIFIC_HUMAN_APPROVAL',
        clinicalInterpretationAllowed:false,automaticDoseAdjustmentAllowed:false,
        missingAssayVerification:true,modelMapping:'UNMAPPED',
        status:'not_interpretable'
      }
    };
  });
  const body = {
    schema:'pmx.tdm.pilot-reference.v1',
    version:'2026-11-11-pending-review',
    producer:'PMx Explain / TDM Guide',
    destination:'future-independent-MIPD-consumer',
    permittedPurpose:'research_and_education_only',
    patientDataIncluded:false,
    dosesOrPatientEstimatesIncluded:false,
    automaticInterpretationEnabled:false,
    references
  };
  const digest=createHash('sha256').update(JSON.stringify(body)).digest('hex');
  return Object.freeze({...body,sha256:digest});
}

export function validateTdmPilotSnapshot(snapshot) {
  if (!snapshot || snapshot.schema!=='pmx.tdm.pilot-reference.v1' ||
    snapshot.permittedPurpose!=='research_and_education_only' ||
    snapshot.patientDataIncluded!==false ||
    snapshot.automaticInterpretationEnabled!==false ||
    snapshot.dosesOrPatientEstimatesIncluded!==false ||
    snapshot.references?.length!==3) return false;
  if (snapshot.references.some((row)=>row.eligibility?.status!=='not_interpretable' ||
      row.eligibility?.clinicalInterpretationAllowed!==false ||
      row.eligibility?.automaticDoseAdjustmentAllowed!==false ||
      row.eligibility?.modelMapping!=='UNMAPPED' ||
      !row.target?.source?.url || !row.target?.source?.section)) return false;
  const {sha256,...body}=snapshot;
  return typeof sha256==='string'&&sha256.length===64 &&
    createHash('sha256').update(JSON.stringify(body)).digest('hex')===sha256;
}

if (process.argv[1]?.endsWith('export_tdm_pilot_snapshot.mjs')) {
  const snapshot=generateTdmPilotSnapshot();
  if (!validateTdmPilotSnapshot(snapshot)) throw new Error('Unsafe TDM pilot export');
  if (process.argv.includes('--json')) console.log(JSON.stringify(snapshot,null,2));
  else console.log('TDM pilot handoff: '+snapshot.references.length+
    ' source-locked research-only candidates; 0 interpretable, 0 automatic doses; SHA256 '+snapshot.sha256);
}
