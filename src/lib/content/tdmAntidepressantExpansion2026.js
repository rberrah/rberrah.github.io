// New antidepressant references from Schoretsanitis & Paulzen 2025, Table 1.
// Values are from the 2025 review, NOT ascribed to the AGNP 2026 update.
// Agomelatine uses Cmax at 1–2h (50 mg), NOT a trough. Bupropion/hydroxy are distinct.
export const extraAntidepressantDrugs = [
  { id: 'agomelatine', fr: "Agomélatine", en: "Agomelatine", aliases: ["agomelatine", "Agomélatine", "Agomelatine"] },
  { id: 'trazodone', fr: "Trazodone", en: "Trazodone", aliases: ["trazodone", "Trazodone", "Trazodone"] },
  { id: 'desvenlafaxine', fr: "Desvenlafaxine", en: "Desvenlafaxine", aliases: ["desvenlafaxine", "Desvenlafaxine", "Desvenlafaxine"] },
  { id: 'levomilnacipran', fr: "Lévomilnacipran", en: "Levomilnacipran", aliases: ["levomilnacipran", "Lévomilnacipran", "Levomilnacipran"] },
  { id: 'reboxetine', fr: "Réboxétine", en: "Reboxetine", aliases: ["reboxetine", "Réboxétine", "Reboxetine"] },
  { id: 'vilazodone', fr: "Vilazodone", en: "Vilazodone", aliases: ["vilazodone", "Vilazodone", "Vilazodone"] },
  { id: 'bupropion', fr: "Bupropion", en: "Bupropion", aliases: ["bupropion", "Bupropion", "Bupropion"] },
  { id: 'tranylcypromine', fr: "Tranylcypromine", en: "Tranylcypromine", aliases: ["tranylcypromine", "Tranylcypromine", "Tranylcypromine"] }
];
export const extraAntidepressantTargets = [
  {
    id: 'ad-agomelatine-mdd-extension-2025', drug: 'agomelatine', indication: 'mdd',
    indicationFr: 'Épisode dépressif majeur · référence 2025',
    indicationEn: 'Major depressive episode · 2025 review',
    metric: "Cmax à 1–2 h après prise", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · agomélatine", matrixEn: "Plasma / serum · agomelatine",
    relation: 'range', min: 7, max: 300,
    status: 'review', source: 'antidepressant2025',
    contextFr: "Schoretsanitis & Paulzen, revue 2025, tableau 1. Cmax à 1–2 h (50 mg) : TDM de niveau 4, uniquement en cas de question clinique ciblée ; ne jamais interpréter comme une C₀. Valeurs du consensus AGNP 2026 non recoupées individuellement.",
    contextEn: "Schoretsanitis & Paulzen, 2025 review, Table 1. Peak at 1–2 h (50 mg): level-4 TDM, only potentially useful for focused questions; NOT a trough target. Individual AGNP 2026 values remain to be verified.",
    evidenceFr: 'Revue 2025, tableau 1 ; vérifier la recommandation AGNP 2026.',
    evidenceEn: '2025 review, Table 1; confirm against AGNP 2026.'
  },
  {
    id: 'ad-trazodone-mdd-extension-2025', drug: 'trazodone', indication: 'mdd',
    indicationFr: 'Épisode dépressif majeur · référence 2025',
    indicationEn: 'Major depressive episode · 2025 review',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · trazodone", matrixEn: "Plasma / serum · trazodone",
    relation: 'range', min: 700, max: 1000,
    status: 'review', source: 'antidepressant2025',
    contextFr: "Schoretsanitis & Paulzen, revue 2025, tableau 1. Intervalle populationnel (prélèvement résiduel à l’équilibre), non prédictif à lui seul de la réponse individuelle. Valeurs du consensus AGNP 2026 non recoupées individuellement.",
    contextEn: "Schoretsanitis & Paulzen, 2025 review, Table 1. Population reference (steady-state trough), not a standalone predictor of individual response. Individual AGNP 2026 values remain to be verified.",
    evidenceFr: 'Revue 2025, tableau 1 ; vérifier la recommandation AGNP 2026.',
    evidenceEn: '2025 review, Table 1; confirm against AGNP 2026.'
  },
  {
    id: 'ad-desvenlafaxine-mdd-extension-2025', drug: 'desvenlafaxine', indication: 'mdd',
    indicationFr: 'Épisode dépressif majeur · référence 2025',
    indicationEn: 'Major depressive episode · 2025 review',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · desvenlafaxine", matrixEn: "Plasma / serum · desvenlafaxine",
    relation: 'range', min: 85, max: 380,
    status: 'review', source: 'antidepressant2025',
    contextFr: "Schoretsanitis & Paulzen, revue 2025, tableau 1. Intervalle populationnel (prélèvement résiduel à l’équilibre), non prédictif à lui seul de la réponse individuelle. Valeurs du consensus AGNP 2026 non recoupées individuellement.",
    contextEn: "Schoretsanitis & Paulzen, 2025 review, Table 1. Population reference (steady-state trough), not a standalone predictor of individual response. Individual AGNP 2026 values remain to be verified.",
    evidenceFr: 'Revue 2025, tableau 1 ; vérifier la recommandation AGNP 2026.',
    evidenceEn: '2025 review, Table 1; confirm against AGNP 2026.'
  },
  {
    id: 'ad-levomilnacipran-mdd-extension-2025', drug: 'levomilnacipran', indication: 'mdd',
    indicationFr: 'Épisode dépressif majeur · référence 2025',
    indicationEn: 'Major depressive episode · 2025 review',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · lévomilnacipran", matrixEn: "Plasma / serum · levomilnacipran",
    relation: 'range', min: 80, max: 120,
    status: 'review', source: 'antidepressant2025',
    contextFr: "Schoretsanitis & Paulzen, revue 2025, tableau 1. Intervalle populationnel (prélèvement résiduel à l’équilibre), non prédictif à lui seul de la réponse individuelle. Valeurs du consensus AGNP 2026 non recoupées individuellement.",
    contextEn: "Schoretsanitis & Paulzen, 2025 review, Table 1. Population reference (steady-state trough), not a standalone predictor of individual response. Individual AGNP 2026 values remain to be verified.",
    evidenceFr: 'Revue 2025, tableau 1 ; vérifier la recommandation AGNP 2026.',
    evidenceEn: '2025 review, Table 1; confirm against AGNP 2026.'
  },
  {
    id: 'ad-reboxetine-mdd-extension-2025', drug: 'reboxetine', indication: 'mdd',
    indicationFr: 'Épisode dépressif majeur · référence 2025',
    indicationEn: 'Major depressive episode · 2025 review',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · réboxétine", matrixEn: "Plasma / serum · reboxetine",
    relation: 'range', min: 60, max: 350,
    status: 'review', source: 'antidepressant2025',
    contextFr: "Schoretsanitis & Paulzen, revue 2025, tableau 1. Intervalle populationnel (prélèvement résiduel à l’équilibre), non prédictif à lui seul de la réponse individuelle. Valeurs du consensus AGNP 2026 non recoupées individuellement.",
    contextEn: "Schoretsanitis & Paulzen, 2025 review, Table 1. Population reference (steady-state trough), not a standalone predictor of individual response. Individual AGNP 2026 values remain to be verified.",
    evidenceFr: 'Revue 2025, tableau 1 ; vérifier la recommandation AGNP 2026.',
    evidenceEn: '2025 review, Table 1; confirm against AGNP 2026.'
  },
  {
    id: 'ad-vilazodone-mdd-extension-2025', drug: 'vilazodone', indication: 'mdd',
    indicationFr: 'Épisode dépressif majeur · référence 2025',
    indicationEn: 'Major depressive episode · 2025 review',
    metric: "C₀", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · vilazodone", matrixEn: "Plasma / serum · vilazodone",
    relation: 'range', min: 15, max: 45,
    status: 'review', source: 'antidepressant2025',
    contextFr: "Schoretsanitis & Paulzen, revue 2025, tableau 1. Intervalle populationnel (prélèvement résiduel à l’équilibre), non prédictif à lui seul de la réponse individuelle. Valeurs du consensus AGNP 2026 non recoupées individuellement.",
    contextEn: "Schoretsanitis & Paulzen, 2025 review, Table 1. Population reference (steady-state trough), not a standalone predictor of individual response. Individual AGNP 2026 values remain to be verified.",
    evidenceFr: 'Revue 2025, tableau 1 ; vérifier la recommandation AGNP 2026.',
    evidenceEn: '2025 review, Table 1; confirm against AGNP 2026.'
  },
  {
    id: 'ad-bupropion-mdd-extension-2025', drug: 'bupropion', indication: 'mdd',
    indicationFr: 'Épisode dépressif majeur · référence 2025',
    indicationEn: 'Major depressive episode · 2025 review',
    metric: "C₀ (bupropion seul)", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · bupropion seul", matrixEn: "Plasma / serum · parent bupropion",
    relation: 'range', min: 10, max: 100,
    status: 'review', source: 'antidepressant2025',
    contextFr: "Schoretsanitis & Paulzen, revue 2025, tableau 1. La molécule mère peut être instable en préanalytique : conservation rapide/froid à vérifier. Ne pas confondre avec hydroxybupropion. Valeurs du consensus AGNP 2026 non recoupées individuellement.",
    contextEn: "Schoretsanitis & Paulzen, 2025 review, Table 1. Parent compound may be unstable preanalytically; immediate freezing may be required. Do not confuse with hydroxybupropion. Individual AGNP 2026 values remain to be verified.",
    evidenceFr: 'Revue 2025, tableau 1 ; vérifier la recommandation AGNP 2026.',
    evidenceEn: '2025 review, Table 1; confirm against AGNP 2026.'
  },
  {
    id: 'ad-tranylcypromine-mdd-extension-2025', drug: 'tranylcypromine', indication: 'mdd',
    indicationFr: 'Épisode dépressif majeur · référence 2025',
    indicationEn: 'Major depressive episode · 2025 review',
    metric: "C₀ (borne supérieure)", unit: 'ng/mL',
    matrixFr: "Plasma / sérum · tranylcypromine", matrixEn: "Plasma / serum · tranylcypromine",
    relation: 'at_most', min: 50, max: null,
    status: 'review', source: 'antidepressant2025',
    contextFr: "Schoretsanitis & Paulzen, revue 2025, tableau 1. Seule borne supérieure ≤50 ng/mL dans la revue 2025, niveau 4. Pas de valeur minimale d'efficacité démontrée. Valeurs du consensus AGNP 2026 non recoupées individuellement.",
    contextEn: "Schoretsanitis & Paulzen, 2025 review, Table 1. Upper reference limit ≤50 ng/mL only in the 2025 review, level 4. No established minimum efficacy threshold. Individual AGNP 2026 values remain to be verified.",
    evidenceFr: 'Revue 2025, tableau 1 ; vérifier la recommandation AGNP 2026.',
    evidenceEn: '2025 review, Table 1; confirm against AGNP 2026.'
  },
  {
    id: 'ad-bupropion-hydroxy-mdd-extension-2025', drug: 'bupropion', indication: 'mdd',
    indicationFr: 'Épisode dépressif majeur · hydroxybupropion', indicationEn: 'Major depressive episode · hydroxybupropion',
    metric: 'C₀ (hydroxybupropion seul)', unit: 'ng/mL',
    matrixFr: 'Plasma / sérum · hydroxybupropion', matrixEn: 'Plasma / serum · hydroxybupropion',
    relation: 'range', min: 850, max: 1500, status: 'review', source: 'antidepressant2025',
    contextFr: 'Métabolite actif séparé de la molécule mère ; la référence ne correspond PAS à une somme bupropion + métabolite. Revue 2025, tableau 1 ; ne pas substituer aux concentrations de bupropion parent. Actualisation AGNP 2026 à vérifier.',
    contextEn: 'Active metabolite, separate from parent; not a parent-plus-metabolite sum. 2025 review, Table 1; not interchangeable with parent bupropion concentrations. Recheck AGNP 2026.',
    evidenceFr: 'Revue 2025, tableau 1, cible du métabolite actif.',
    evidenceEn: '2025 review, Table 1, active metabolite range.'
  }
];
