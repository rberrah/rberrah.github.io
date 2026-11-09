// @ts-nocheck
import { tdmDrugs, normalizeTdmSearch } from './tdmTargets.js';

// Independently curated index of named medicines found in PUBLIC CHU Limoges
// pharmacology documents. This is NOT an export of the complete laboratory
// manual, and inclusion does NOT imply an endorsed therapeutic interval.
// We link to original sources rather than republishing protected instructions.
// Review/date: 2026-11-09.
export const manualCatalogUpdated = '2026-11-09';
/** @type {Record<string, {title: string, url: string, date: string, type: string, noteFr: string, noteEn: string}>} */
export const manualCatalogSources = {
  antimicrobialProtocol: {
    title: 'CHU de Limoges · PTP PREA 0059 C, antibiotiques dosés et temps de prélèvement',
    url: 'https://chu-limoges.manuelprelevement.fr/DocumentNew.aspx?idDoc=41157',
    date: '2026-05-26', type: 'public_list',
    noteFr: 'Liste de molécules et modalités de prélèvement, sans cibles numériques de consensus.',
    noteEn: 'List of assayed drugs and sampling schedules, without consensus numerical targets.'
  },
  antidepressantExam: {
    title: 'CHU de Limoges · Dosage spécifique des antidépresseurs',
    url: 'https://chu-limoges.manuelprelevement.fr/DetailNew.aspx?id=A3618&redirect=home',
    date: '2026-10-07', type: 'exam_group',
    noteFr: 'Fiche groupée avec molécules et métabolites ; vérifier la substance et l’analyte effectivement demandé.',
    noteEn: 'Group assay listing drugs and metabolites; verify the actual ordered analyte.'
  },
  immunosuppressantForm: {
    title: 'CHU de Limoges · PBH PREA 0055 B, demande d’adaptation des immunosuppresseurs',
    url: 'https://chu-limoges.manuelprelevement.fr/DocumentNew.aspx?idDoc=33210',
    date: '2026-11-09', type: 'request_form',
    noteFr: 'Document de demande, non fiche analytique individuelle ni tableau de cibles thérapeutiques.',
    noteEn: 'Request form, not an individual assay detail or a therapeutic target table.'
  },
  lithiumExam: {
    title: 'CHU de Limoges · Lithium (dosage)',
    url: 'https://chu-limoges.manuelprelevement.fr/DetailNew.aspx?id=A3912&redirect=home',
    date: '2026-10-07', type: 'single_exam',
    noteFr: 'Fiche de prélèvement ; cible thérapeutique définie séparément par la littérature.',
    noteEn: 'Sampling information; exposure target derives separately from medical literature.'
  },
  valproateExam: {
    title: 'CHU de Limoges · Acide valproïque (dosage)',
    url: 'https://chu-limoges.manuelprelevement.fr/DetailNew.aspx?id=A3693&redirect=home',
    date: '2026-10-21', type: 'single_exam',
    noteFr: 'Fiche de prélèvement ; le dosage total ne remplace pas l’analyse de la fraction libre si nécessaire.',
    noteEn: 'Sampling information; total drug measurement is not a substitute for unbound levels when needed.'
  },
  localAnaestheticExam: {
    title: 'CHU de Limoges · Dosage des anesthésiques locaux',
    url: 'https://chu-limoges.manuelprelevement.fr/DetailNew.aspx?id=A3673&redirect=home',
    date: '2026-09-23', type: 'exam_group',
    noteFr: 'Dosage à visée notamment toxicologique ; une concentration toxique ne constitue pas une fenêtre thérapeutique.',
    noteEn: 'Assay may support toxicology; a toxic concentration is not a therapeutic target.'
  },
  ibrutinibExam: {
    title: 'CHU de Limoges · Ibrutinib, analyse transmise à Saint-Louis (AP-HP)',
    url: 'https://chu-limoges.manuelprelevement.fr/DetailNew.aspx?id=A4481&redirect=home',
    date: '2026-09-04', type: 'external_exam',
    noteFr: 'Analyse externalisée ; ne présume pas une cible clinique universellement validée.',
    noteEn: 'Outsourced assay; does not establish a universal target.'
  }
};

// Molecule names only; the official documents remain the source of truth.
// Keep category/entry type for user clarity and to prevent inventing targets.
const antibioticNames = [
  'Amikacine', 'Amoxicilline', 'Avibactam', 'Azithromycine', 'Aztréonam',
  'Céfazoline', 'Céfépime', 'Céfotaxime', 'Ceftaroline', 'Ceftazidime',
  'Ceftobiprole', 'Ceftolozane', 'Ceftriaxone', 'Ciprofloxacine', 'Clindamycine',
  'Cloxacilline', 'Dalbavancine', 'Daptomycine', 'Ertapénème', 'Gentamicine',
  'Isoniazide', 'Linézolide', 'Lévofloxacine', 'Méropénème', 'Moxifloxacine',
  'Ofloxacine', 'Oxacilline', 'Pipéracilline', 'Rifampicine', 'Sulfaméthoxazole',
  'Tazobactam', 'Ticarcilline', 'Tigécycline', 'Tobramycine', 'Triméthoprime',
  'Vancomycine'
];

const antidepressantNames = [
  'Agomélatine', 'Amitriptyline', 'Amoxapine', 'Citalopram', 'Clomipramine',
  'Désipramine', 'Dosulépine', 'Doxépine', 'Duloxétine', 'Escitalopram',
  'Fluoxétine', 'Fluvoxamine', 'Imipramine', 'Iproniazide', 'Maprotiline',
  'Miansérine', 'Milnacipran', 'Mirtazapine', 'Moclobémide', 'Nortriptyline',
  'Paroxétine', 'Sertraline', 'Tianeptine', 'Trimipramine',
  'Venlafaxine', 'Vortioxétine'
];

const knownKeys = {
  'Acide valproïque': 'valproate', 'Lithium': 'lithium',
  'Mycophénolate': 'mpa', 'Tacrolimus': 'tac', 'Évérolimus': 'everolimus',
  'Linézolide': 'linezolid', 'Vancomycine': 'vancomycin',
  "Ciclosporine": 'cyclosporine',
  "Sirolimus": 'sirolimus',
  "Amitriptyline": 'amitriptyline',
  "Citalopram": 'citalopram',
  "Clomipramine": 'clomipramine',
  "Désipramine": 'desipramine',
  "Dosulépine": 'dosulepine',
  "Doxépine": 'doxepine',
  "Duloxétine": 'duloxetine',
  "Escitalopram": 'escitalopram',
  "Fluoxétine": 'fluoxetine',
  "Fluvoxamine": 'fluvoxamine',
  "Imipramine": 'imipramine',
  "Maprotiline": 'maprotiline',
  "Miansérine": 'mianserine',
  "Milnacipran": 'milnacipran',
  "Mirtazapine": 'mirtazapine',
  "Moclobémide": 'moclobemide',
  "Nortriptyline": 'nortriptyline',
  "Paroxétine": 'paroxetine',
  "Sertraline": 'sertraline',
  "Tianeptine": 'tianeptine',
  "Trimipramine": 'trimipramine',
  "Venlafaxine": 'venlafaxine',
  "Vortioxétine": 'vortioxetine'
};

function makeEntry(name, sourceId, family, status = 'named_in_document') {
  return { id: `${sourceId}:${name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name, drugKey: knownKeys[name] ?? null, family, sourceId, status };
}

export const tdmManualCatalog = [
  ...antibioticNames.map((name) => makeEntry(name, 'antimicrobialProtocol', 'antibiotics')),
  ...antidepressantNames.map((name) => makeEntry(name, 'antidepressantExam', 'antidepressants')),
  ...['Mycophénolate', 'Ciclosporine', 'Tacrolimus', 'Sirolimus', 'Évérolimus'].map((name) =>
    makeEntry(name, 'immunosuppressantForm', 'immunosuppressants', 'request_form_only')),
  makeEntry('Lithium', 'lithiumExam', 'neurology_psychiatry', 'individual_exam'),
  makeEntry('Acide valproïque', 'valproateExam', 'neurology_psychiatry', 'individual_exam'),
  ...['Lidocaïne', 'Bupivacaïne', 'Ropivacaïne', 'Mépivacaïne'].map((name) =>
    makeEntry(name, 'localAnaestheticExam', 'toxicology', 'group_exam')),
  makeEntry('Ibrutinib', 'ibrutinibExam', 'oncology', 'outsourced_exam')
];

export function searchManualCatalog({query = '', family = 'all'} = {}) {
  const needle = normalizeTdmSearch(query);
  return tdmManualCatalog.filter((entry) => {
    if (family !== 'all' && family !== entry.family) return false;
    if (!needle) return true;
    if (normalizeTdmSearch(entry.name).includes(needle)) return true;
    const parent = entry.drugKey ? tdmDrugs.find((drug) => drug.id === entry.drugKey) : null;
    return Boolean(parent && [parent.fr, parent.en, ...parent.aliases]
      .some((alias) => normalizeTdmSearch(alias).includes(needle)));
  });
}
