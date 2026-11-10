// @ts-nocheck
// Closed-by-default taxonomy for the TDM search screen. The 74 names found in
// selected CHU documents are NOT a complete CHU laboratory export. Every
// entry remains searchable; lack of a numeric target is shown explicitly.
import { tdmDrugs } from './tdmTargets.js';
import { tdmManualCatalog } from './tdmManualCatalog.js';

const categoryDefinitions = Object.freeze([
  { id: 'immunosuppressants', fr: 'Immunosuppresseurs', en: 'Immunosuppressants' },
  { id: 'antibiotics', fr: 'Antibiotiques et antituberculeux', en: 'Antibiotics and antituberculosis' },
  { id: 'antifungals', fr: 'Antifongiques', en: 'Antifungals' },
  { id: 'antiseizure', fr: 'Antiépileptiques', en: 'Antiseizure medicines' },
  { id: 'antidepressants', fr: 'Antidépresseurs', en: 'Antidepressants' },
  { id: 'psychotropics', fr: 'Autres psychotropes', en: 'Other psychotropics' },
  { id: 'cardiology', fr: 'Cardiologie', en: 'Cardiology' },
  { id: 'toxicology', fr: 'Anesthésiques locaux / toxicologie', en: 'Local anesthetics / toxicology' },
  { id: 'oncology', fr: 'Oncologie', en: 'Oncology' },
  { id: 'other', fr: 'Autres molécules', en: 'Other medicines' }
]);

const antifungalIds = new Set(['voriconazole', 'posaconazole']);
const antiseizureIds = new Set(['valproate','carbamazepine','lamotrigine','oxcarbazepine',
  'levetiracetam','phenytoin','phenobarbital']);
const transplantationIds = new Set(['mpa','tac','everolimus','cyclosporine','sirolimus']);
const cardiologyIds = new Set(['digoxin']);
const psychotropicIds = new Set(['lithium']);
const manualFamilyCategories = {
  antibiotics: 'antibiotics',
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
const categoryFor = (drug, entry) => {
  if (transplantationIds.has(drug.id)) return 'immunosuppressants';
  if (antiseizureIds.has(drug.id)) return 'antiseizure';
  if (antifungalIds.has(drug.id)) return 'antifungals';
  if (cardiologyIds.has(drug.id)) return 'cardiology';
  if (psychotropicIds.has(drug.id)) return 'psychotropics';
  const fromManual = entry ? manualFamilyCategories[entry.family] : null;
  return fromManual || 'other';
};
for (const drug of tdmDrugs) {
  const exam = manualByDrug.get(drug.id) || null;
  const group = categoryFor(drug, exam);
  classified.get(group).set(drug.id, {
    id: drug.id, fr: drug.fr, en: drug.en, query: drug.fr,
    fromReviewedChuDocuments: Boolean(exam)
  });
}
for (const exam of tdmManualCatalog) {
  if (exam.drugKey && tdmDrugs.some((drug) => drug.id === exam.drugKey)) continue;
  const group = manualFamilyCategories[exam.family] || 'other';
  classified.get(group).set(exam.id, {
    id: exam.id, fr: exam.name, en: exam.name, query: exam.name,
    fromReviewedChuDocuments: true
  });
}

export const tdmBrowseCategories = categoryDefinitions.map((category) => ({
  ...category,
  medicines: [...classified.get(category.id).values()].sort((a,b) => a.fr.localeCompare(b.fr, 'fr'))
})).filter((category) => category.medicines.length);
