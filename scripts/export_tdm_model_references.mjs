// Prototype-only versioned export of the TDM Guide, not a clinical target resolver.
// Produces an immutable content-addressed reference catalog. NO model or patient data.
// Side-effect-free import; CLI writes only when an explicit path is supplied.
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { tdmDrugs, tdmTargets, tdmTargetSources } from '../src/lib/content/tdmTargets.js';
import { antibioticPdTargets, antibioticPdSource } from '../src/lib/content/tdmAntibioticPd.js';
import { tdmPharmacologyForDrug } from '../src/lib/content/tdmPharmacologyProfiles.js';
import { societyMonitoringForDrug } from '../src/lib/content/tdmSocietyMonitoring2026.js';
import { TDM_COMPARABILITY_FIELDS, isMeaningfulTdmIdentityValue } from '../src/lib/content/tdmReferenceIdentity.js';

export const TDM_MODEL_EXPORT_SCHEMA = 'pmx.tdm.model-references.preview.v1';
const digestOf = (object) => createHash('sha256').update(JSON.stringify(object)).digest('hex');
const safePkDimension = (d) => ({
  key: d?.key ?? 'unknown',fr: d?.fr ?? 'Non établi',en: d?.en ?? 'Not established',
  sourceId: d?.sourceId ?? null,noteFr: d?.noteFr ?? '',noteEn: d?.noteEn ?? ''
});

export function exportTdmForModelDiscovery() {
  const ids = new Set();
  const drugs = tdmDrugs.map((drug) => {
    if (ids.has(drug.id)) throw new Error('Duplicate TDM drug: '+drug.id);
    ids.add(drug.id);
    const pk = tdmPharmacologyForDrug(drug.id);
    const society = societyMonitoringForDrug(drug.id);
    const targets = tdmTargets.filter((t) => t.drug === drug.id).map((target) => {
      const source = tdmTargetSources[target.source];
      if (!source?.url?.startsWith('https://')) throw new Error('Missing numeric source for '+target.id);
      const missingIdentity = TDM_COMPARABILITY_FIELDS.filter((field) =>
        !isMeaningfulTdmIdentityValue(target[field]));
      return {
        id: target.id, indication: target.indication,
        indicationFr: target.indicationFr,indicationEn: target.indicationEn,
        metric: target.metric,unit: target.unit,
        relation: target.relation,min: target.min,max: target.max,
        status: target.status,
        matrixFr: target.matrixFr,matrixEn: target.matrixEn,
        analyteId: target.analyteId ?? null,analyteBasis: target.analyteBasis ?? null,
        matrixId: target.matrixId ?? null,formulationId: target.formulationId ?? null,
        assayMethod: target.assayMethod ?? null,samplingTime: target.samplingTime ?? null,
        missingAnalyticalIdentity: missingIdentity,
        contextFr: target.contextFr,contextEn: target.contextEn,
        source: {id: target.source,citation: source.citation,url: source.url,
          year: source.year,section: source.evidenceSection},
        interpretationAllowed: false,automaticDoseAdjustmentAllowed: false,
        referenceType: target.status === 'study' ? 'local_or_study_context' : 'published_reference',
        humanSignoff: 'PENDING'
      };
    });
    const pkpd = antibioticPdTargets.filter((t) => t.drug === drug.id).map((t) => ({
      id: t.id,kind: t.kind,metric: t.metric,
      labelFr: t.labelFr,labelEn: t.labelEn,
      criterionFr: t.criterionFr,criterionEn: t.criterionEn,
      contextFr: t.contextFr,contextEn: t.contextEn,
      status: t.status,
      source: {citation: t.source?.citation ?? antibioticPdSource.citation,
        url: t.source?.url ?? antibioticPdSource.url,
        section: t.evidenceSection ?? antibioticPdSource.evidenceSection},
      isContextualOnly: true,interpretationAllowed: false
    }));
    return {
      id: drug.id,fr: drug.fr,en: drug.en,
      index: safePkDimension(pk?.index),
      practicalSampling: safePkDimension(pk?.practical),
      pkReview: pk?.review ?? 'unassessed',
      approvedRoutesInThisExport: [], // Licensed routes require product-specific SmPC matching.
      studiedRoutes: pk?.administration?.codes ?? [],
      targets,pkpd,
      society: society ? {
        recommendation: society.recommendation,
        exposureKind: society.exposureKind,
        noteFr: society.noteFr,noteEn: society.noteEn,
        source: {title: society.source.title,url: society.source.url}
      } : null
    };
  });
  if (tdmTargets.some((target) => !ids.has(target.drug))) throw new Error('Numeric orphan target');
  if (antibioticPdTargets.some((target) => !ids.has(target.drug))) throw new Error('PKPD orphan target');
  const body = {
    schema: TDM_MODEL_EXPORT_SCHEMA,
    producer: 'PMx Explain / TDM Guide',
    intendedUse: 'research_education_bibliographic_preview',
    notForClinicalInterpretation: true,
    patientDataIncluded: false,
    containsDosingAdvice: false,
    modelNamesIncluded: false, // MIPD remains the authoritative model inventory.
    referenceApproval: 'INDEPENDENT_PHARMACOLOGIST_SIGNOFF_PENDING',
    drugs
  };
  return {...body,sha256:digestOf(body)};
}

export function validateTdmModelExport(snapshot) {
  if (!snapshot || snapshot.schema !== TDM_MODEL_EXPORT_SCHEMA || snapshot.notForClinicalInterpretation !== true ||
    snapshot.patientDataIncluded !== false || snapshot.containsDosingAdvice !== false ||
    snapshot.modelNamesIncluded !== false || !Array.isArray(snapshot.drugs)) return false;
  const {sha256,...body}=snapshot;
  if (typeof sha256!=='string'||!/^[a-f0-9]{64}$/.test(sha256) || digestOf(body)!==sha256) return false;
  const seen = new Set();
  for (const drug of snapshot.drugs) {
    if (typeof drug.id!=='string'||seen.has(drug.id) || !Array.isArray(drug.targets) ||
      !Array.isArray(drug.pkpd) || !drug.index || !drug.practicalSampling) return false;
    seen.add(drug.id);
    if (drug.targets.some((t) => t.interpretationAllowed !== false ||
      t.automaticDoseAdjustmentAllowed !== false || t.humanSignoff!=='PENDING' ||
      !t.source?.url?.startsWith('https://'))) return false;
    if (drug.pkpd.some((t) => t.interpretationAllowed!==false || t.isContextualOnly!==true)) return false;
  }
  return true;
}

if (process.argv[1]?.endsWith('export_tdm_model_references.mjs')) {
  const snapshot=exportTdmForModelDiscovery();
  if (!validateTdmModelExport(snapshot)) throw new Error('TDM export failed fail-closed validation');
  const arg=process.argv.indexOf('--output');
  if (arg>=0) {
    const p=process.argv[arg+1];
    if (!p || !p.endsWith('.json')) throw new Error('Provide an explicit .json output path');
    await writeFile(p,JSON.stringify(snapshot,null,2)+'\n','utf8');
  } else {
    process.stdout.write(JSON.stringify(snapshot,null,2)+'\n');
  }
}
