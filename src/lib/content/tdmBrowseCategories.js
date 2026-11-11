// @ts-nocheck
// Closed-by-default taxonomy for the TDM search screen. The 74 names found in
// selected CHU documents are NOT a complete CHU laboratory export. Every
// entry remains searchable; lack of a numeric target is shown explicitly.
import { tdmDrugs } from './tdmTargets.js';
import { psychiatryTdmDrugs } from './tdmPsychiatryExpansion2026.js';
import { extraAntidepressantDrugs } from './tdmAntidepressantExpansion2026.js';
import { additionalAntiseizureDrugs } from './tdmAntiseizureExpansion2018.js';
import { historicalChuAssayForDrug } from './tdmChuAssayProvenance.js';
import { tdmManualCatalog } from './tdmManualCatalog.js';

const categoryDefinitions = Object.freeze([
  { id: 'immunosuppressants', fr: 'Immunosuppresseurs', en: 'Immunosuppressants' },
  { id: 'antibiotics', fr: 'Antibiotiques et antituberculeux', en: 'Antibiotics and antituberculosis' },
  { id: 'antifungals', fr: 'Antifongiques', en: 'Antifungals' },
  { id: 'antivirals', fr: 'Antiviraux', en: 'Antivirals' },
  { id: 'respiratory', fr: 'Pneumologie', en: 'Respiratory medicine' },
  { id: 'gastroenterology', fr: 'Gastroentérologie / thiopurines', en: 'Gastroenterology / thiopurines' },
  { id: 'antiseizure', fr: 'Antiépileptiques', en: 'Antiseizure medicines' },
  { id: 'antidepressants', fr: 'Antidépresseurs', en: 'Antidepressants' },
  { id: 'psychotropics', fr: 'Autres psychotropes', en: 'Other psychotropics' },
  { id: 'cardiology', fr: 'Cardiologie', en: 'Cardiology' },
  { id: 'toxicology', fr: 'Anesthésiques locaux / toxicologie', en: 'Local anesthetics / toxicology' },
  { id: 'oncology', fr: 'Oncologie', en: 'Oncology' },
  { id: 'other', fr: 'Autres molécules', en: 'Other medicines' }
]);

const antifungalIds = new Set(['voriconazole', 'posaconazole', 'flucytosine', 'itraconazole','fluconazole','isavuconazole','anidulafungin','caspofungin','micafungin']);
const antiviralIds = new Set(['abacavir','aciclovir','valaciclovir','foscarnet','ganciclovir','valganciclovir','oseltamivir','ribavirin']);
const respiratoryIds = new Set(['theophylline']);
const gastroenterologyIds = new Set(['azathioprine','mercaptopurine']);
const tuberculosisIds = new Set(['pyrazinamide','ethambutol','cycloserine','rifabutin','clarithromycin','streptomycin']);
const antiseizureIds = new Set([...additionalAntiseizureDrugs.map((drug) => drug.id), 'valproate','carbamazepine','lamotrigine','oxcarbazepine',
  'levetiracetam','phenytoin','phenobarbital']);
const transplantationIds = new Set(['mpa','tac','everolimus','cyclosporine','sirolimus']);
const cardiologyIds = new Set(['digoxin']);
const extraAntidepressantIds = new Set(extraAntidepressantDrugs.map((drug) => drug.id));
const psychotropicIds = new Set(['lithium', 'clozapine', ...psychiatryTdmDrugs.map((drug) => drug.id)]);
const additionalAntibioticIds = new Set(['teicoplanin']);
const oncologyIds = new Set(['busulfan', 'methotrexate']);
const manualFamilyCategories = {
  antibiotics: 'antibiotics',
  antivirals: 'antivirals',
  respiratory: 'respiratory',
  gastroenterology: 'gastroenterology',
  antidepressants: 'antidepressants',
  immunosuppressants: 'immunosuppressants',
  neurology_psychiatry: null,
  toxicology: 'toxicology',
  oncology: 'oncology'
};

const manualByDrug = new Map();
for (const exam of tdmManualCatalog) {
  if (exam.drugKey && !manualByDrug.has(exam.drugKey)) manualByDrug.set(exam.drugKey, exam);
}

const classified = new Map(categoryDefinitions.map((category) => [category.id, new Map()]));
// Being named in a CHU document does not always mean a local assay is performed.
const chuEvidenceStatus = (entry) => {
  if (!entry) return 'not_documented';
  if (entry.status === 'request_form_only') return 'request_form_only';
  if (entry.status === 'outsourced_exam') return 'external_referral';
  if (entry.sourceId === 'antimicrobialProtocol') return 'listed_as_dosed';
  if (['single_exam', 'group_exam', 'named_in_document'].includes(entry.status)) return 'exam_document';
  return 'not_documented';
};
const categoryFor = (drug, entry) => {
  if (transplantationIds.has(drug.id)) return 'immunosuppressants';
  if (antiseizureIds.has(drug.id)) return 'antiseizure';
  if (antifungalIds.has(drug.id)) return 'antifungals';
  if (antiviralIds.has(drug.id)) return 'antivirals';
  if (respiratoryIds.has(drug.id)) return 'respiratory';
  if (gastroenterologyIds.has(drug.id)) return 'gastroenterology';
  if (tuberculosisIds.has(drug.id)) return 'antibiotics';
  if (extraAntidepressantIds.has(drug.id)) return 'antidepressants';
  if (cardiologyIds.has(drug.id)) return 'cardiology';
  if (psychotropicIds.has(drug.id)) return 'psychotropics';
  if (additionalAntibioticIds.has(drug.id)) return 'antibiotics';
  if (oncologyIds.has(drug.id)) return 'oncology';
  const fromManual = entry ? manualFamilyCategories[entry.family] : null;
  return fromManual || 'other';
};
for (const drug of tdmDrugs) {
  const exam = manualByDrug.get(drug.id) || null;
  const group = categoryFor(drug, exam);
  classified.get(group).set(drug.id, {
    id: drug.id, fr: drug.fr, en: drug.en, query: drug.fr,
    fromReviewedChuDocuments: Boolean(exam), chuEvidenceStatus: chuEvidenceStatus(exam),
    historicallyAssayedAtChu: Boolean(historicalChuAssayForDrug(drug.id))
  });
}
for (const exam of tdmManualCatalog) {
  if (exam.drugKey && tdmDrugs.some((drug) => drug.id === exam.drugKey)) continue;
  const group = manualFamilyCategories[exam.family] || 'other';
  classified.get(group).set(exam.id, {
    id: exam.id, fr: exam.name, en: exam.name, query: exam.name,
    fromReviewedChuDocuments: true, chuEvidenceStatus: chuEvidenceStatus(exam)
  });
}

export const tdmBrowseCategories = categoryDefinitions.map((category) => ({
  ...category,
  medicines: [...classified.get(category.id).values()].sort((a,b) => a.fr.localeCompare(b.fr, 'fr'))
})).filter((category) => category.medicines.length);
