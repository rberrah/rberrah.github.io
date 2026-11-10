// @ts-nocheck
// Evidence priority is a REVIEW workflow, not a rule to replace a validated
// indication-specific target. Product labels are product/formulation-specific.
// A published PK range is never attributed to an SmPC that does not contain it.
import { tdmTargetSources, tdmTargets } from './tdmTargets.js';

export const tdmEvidencePriority = Object.freeze([
  { id: 'society', fr: 'Sociétés savantes (SFT, SFPT, IATDMCT ; consensus spécifiques)',
    en: 'Scientific societies (SFT, SFPT, IATDMCT and specialty consensus)' },
  { id: 'regulatory', fr: 'RCP / SmPC : ANSM, EMA, FDA (formulation et indication)',
    en: 'Product labels / SmPC: ANSM, EMA, FDA (formulation and indication)' },
  { id: 'limoges', fr: 'Travaux du laboratoire de pharmacologie du CHU de Limoges',
    en: 'Limoges University Hospital pharmacology publications' },
  { id: 'other', fr: 'Autres études, revues et protocoles de centres',
    en: 'Other studies, reviews and institutional protocols' }
]);

// Only labels confirmed to exist at these exact URLs, with their scope.
export const regulatoryLabelsByDrug = Object.freeze({
  teicoplanin: [{ authority: 'ANSM', label: 'Téicoplanine · RCP, concentrations résiduelles selon HPLC/FPIA',
    url: 'https://base-donnees-publique.medicaments.gouv.fr/medicament/64196782/extrait',
    scopeFr: 'RCP rubrique 4.2 : méthodes HPLC/FPIA et infections sévères ; ne pas interchanger les valeurs.',
    scopeEn: 'SmPC section 4.2: assay-dependent HPLC/FPIA ranges in severe infections, not interchangeable.' }],
  tac: [
    { authority: 'ANSM', label: 'Prograf 1 mg · RCP français, tacrolimus immédiat',
      url: 'https://base-donnees-publique.medicaments.gouv.fr/medicament/61217812/extrait',
      scopeFr: 'Libération immédiate, schémas de transplantation ; surveillance du taux résiduel.',
      scopeEn: 'Immediate release, transplant regimens; trough-monitoring advice.' },
    { authority: 'EMA', label: 'Envarsus · SmPC européen, tacrolimus LP 1 prise/jour',
      url: 'https://www.ema.europa.eu/en/documents/product-information/envarsus-epar-product-information_en.pdf',
      scopeFr: 'Libération prolongée 24 h : C₂₄ et relation à AUC₀–₂₄ ; non interchangeable dose pour dose.',
      scopeEn: 'Once-daily extended-release: C24 and AUC0–24 relationship; formulations not dose-for-dose interchangeable.' },
    { authority: 'FDA', label: 'Tacrolimus capsules · US label (DailyMed)',
      url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=213f6047-f897-48a7-b78a-45d7124f2f16',
      scopeFr: 'Gélules immédiates, suivi résiduel et différences entre formulations.',
      scopeEn: 'Immediate-release capsules, trough monitoring and formulation differences.' }
  ],
  mpa: [
    { authority: 'ANSM', label: 'CellCept 500 mg · RCP français, mycophénolate mofétil',
      url: 'https://base-donnees-publique.medicaments.gouv.fr/medicament/62173094/extrait',
      scopeFr: 'Formulation MMF ; contexte réglementaire distinct des cibles AUC de consensus.',
      scopeEn: 'MMF formulation; labeling is not the source of the consensus AUC target.' },
    { authority: 'EMA', label: 'CellCept · SmPC européen (MMF)',
      url: 'https://www.ema.europa.eu/en/documents/product-information/cellcept-epar-product-information_en.pdf',
      scopeFr: 'Formulation MMF, indications et pharmacocinétique ; les cibles AUC proviennent de consensus indépendants.',
      scopeEn: 'MMF labeling and pharmacokinetics; AUC targets originate from separate consensus sources.' },
    { authority: 'FDA', label: 'Mycophenolate mofetil · US label (DailyMed)',
      url: 'https://www.dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=fbbe6521-0e21-5372-e053-6394a90ae5e4',
      scopeFr: 'Formulation MMF et mise en garde ; pas de fenêtre AUC attribuée artificiellement.',
      scopeEn: 'MMF formulation and warnings; no AUC range inferred from the label.' }
  ],
  everolimus: [
    { authority: 'FDA', label: 'Zortress · US label (everolimus transplantation)',
      url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=e082a024-7850-400b-a5c2-2a140612562a',
      scopeFr: 'Transplantation rénale avec ciclosporine réduite / hépatique avec tacrolimus réduit ; C₀ 3–8 ng/mL en sang total (LC-MS/MS).',
      scopeEn: 'Kidney with reduced cyclosporine / liver with reduced tacrolimus; whole blood C0 3–8 ng/mL (LC-MS/MS).' }
  ],
  valproate: [
    { authority: 'ANSM', label: 'Valproate de sodium · RCP français',
      url: 'https://base-donnees-publique.medicaments.gouv.fr/medicament/67025516/extrait',
      scopeFr: 'Intervalle de référence propre au produit ; fraction libre à interpréter si nécessaire.',
      scopeEn: 'Product-specific reference range; free fraction may require separate interpretation.' }
  ],
  phenytoin: [
    { authority: 'FDA', label: 'Dilantin · FDA prescribing information',
      url: 'https://dailymed-beta.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=f339f9e4-b289-4efe-82b9-46c57d1dc277&type=display',
      scopeFr: 'Phénytoïne totale versus libre ; prudence en hypoalbuminémie.',
      scopeEn: 'Total versus free phenytoin; low albumin matters.' }
  ]
});

export const societyReferencesByDrug = Object.freeze({
  busulfan: [{ label: 'EBMT/ESID · 2026 — busulfan et conditionnement des IEI',
    url: 'https://doi.org/10.1038/s41409-026-02906-0',
    scopeFr: 'AUC cumulées des seuls protocoles A/C d’allogreffe pour IEI, non transposables à toutes les greffes.',
    scopeEn: 'Cumulative AUC for IEI-specific HSCT protocols A/C, not all transplant regimens.' }],
  tac: [
    { label: 'IATDMCT · Brunet et al. 2019 — 2e consensus tacrolimus',
      url: 'https://pubmed.ncbi.nlm.nih.gov/31045868/',
      scopeFr: 'Consensus international (Marquet, Woillard et Monchaud co-auteurs) : cibles C₀ selon organe/risque et place de l’AUC dans des situations ciblées. Ne remplace pas les valeurs d’un protocole 2025.',
      scopeEn: 'International consensus (Marquet, Woillard and Monchaud among authors): indication/risk-specific trough targets and selective AUC-based monitoring; not the same as a 2025 centre protocol.' }
  ]
});

export const limogesResearchByDrug = Object.freeze({
  tac: [
    { label: 'Marquet · 2025 — Getting Tacrolimus Dosing Right',
      url: 'https://pubmed.ncbi.nlm.nih.gov/39357034/',
      scopeFr: 'Propose alternance AUC estimée et C₀ personnalisée ; pas d’essai randomisé démontrant la supériorité clinique de l’AUC.',
      scopeEn: 'Suggests intermittent estimated AUC with individualized C0; no randomized clinical superiority trial.' },
    { label: 'Woillard, Monchaud, Saint-Marcoux, Labriffe, Marquet · 2023',
      url: 'https://pubmed.ncbi.nlm.nih.gov/36508648/',
      scopeFr: 'Personnalisation du rapport AUC/C₀ pour ajuster les objectifs individuels.',
      scopeEn: 'Individualized AUC/C0 ratios to adapt patient-specific trough targets.' }
  ],
  mpa: [
    { label: 'Woillard et al. · 2015 — Greffe cardiaque, MPA AUC',
      url: 'https://pubmed.ncbi.nlm.nih.gov/26192348/',
      scopeFr: 'Seuil ROC exploratoire ; ne pas le confondre avec une recommandation de société savante.',
      scopeEn: 'Exploratory ROC cutoff, not a society-endorsed clinical target.' }
  ],
  levetiracetam: [
    { label: 'Couderc, Chouchane, Saint-Marcoux · 2022',
      url: 'https://pubmed.ncbi.nlm.nih.gov/35239286/',
      scopeFr: 'Révision critique de la fourchette AGNP, pas une nouvelle cible universelle.',
      scopeEn: 'Discussion of corrected AGNP ranges, not a new universal target.' }
  ]
});

export const exposureMarkerByDrug = Object.freeze({
  busulfan: {
    tagFr: 'AUC cumulée prioritaire', tagEn: 'Cumulative AUC preferred',
    titleFr: 'Busulfan : suivi de l’exposition cumulative pendant le conditionnement',
    titleEn: 'Busulfan: cumulative exposure monitoring during conditioning',
    detailFr: 'Le suivi du busulfan s’appuie sur l’AUC cumulée du conditionnement et des objectifs spécifiques au protocole et à la population ; la C₀ ne la remplace pas. Les chiffres présentés concernent les déficits immunitaires innés (IEI).',
    detailEn: 'Busulfan is monitored using total conditioning AUC with regimen- and population-specific targets, not trough as an AUC surrogate. These numbers concern inborn errors of immunity.',
    sourceUrl: 'https://doi.org/10.1038/s41409-026-02906-0', sourceLabel: 'EBMT/ESID · 2026'
  },
  mpa: {
    tagFr: 'AUC privilégiée', tagEn: 'AUC preferred',
    titleFr: 'Exposition au MPA : AUC₀–₁₂ prioritaire',
    titleEn: 'MPA exposure: prefer AUC0–12',
    detailFr: 'Pour le mycophénolate, la C₀ reflète mal l’exposition globale. Le guide 2025 recommande l’AUC mesurée/estimée avec une stratégie d’échantillonnage validée et adaptée à la formulation et à l’organe.',
    detailEn: 'For mycophenolic acid, trough poorly represents overall exposure. The 2025 guideline recommends AUC measured/estimated using an indication- and formulation-validated sampling strategy.',
    sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12456993/',
    sourceLabel: 'Liu et al. 2025 · recommandations 2 et 4'
  },
  tac: {
    tagFr: 'AUC informative, C₀ en routine', tagEn: 'AUC informative; C0 routine',
    titleFr: 'Tacrolimus : AUC pour l’exposition, C₀ usuelle en pratique',
    titleEn: 'Tacrolimus: AUC for exposure; C0 for routine monitoring',
    detailFr: 'L’AUC décrit mieux l’exposition cumulée, surtout si C₀ et cinétique d’absorption divergent. C₀ reste le paramètre utilisé et recommandé en routine dans la majorité des protocoles. L’alternance AUC intermittente et C₀ individualisée est proposée à Limoges, sans preuve randomisée définitive de bénéfice clinique supérieur.',
    detailEn: 'AUC describes total exposure more fully, especially when trough and absorption differ. C0 remains routine and guideline-supported. Limoges proposes intermittent AUC with individualized C0, without definitive randomized clinical superiority evidence.',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/39357034/',
    sourceLabel: 'Marquet 2025 · Therapeutic Drug Monitoring'
  },
  cyclosporine: {
    tagFr: 'AUC informative, C₂/C₀ en pratique', tagEn: 'AUC informative; C2/C0 routine',
    titleFr: 'Ciclosporine : AUC d’absorption et C₂',
    titleEn: 'Cyclosporine: absorption AUC and C2',
    detailFr: 'AUC₀–₄ renseigne l’absorption. La concentration à 2 heures (C₂) peut mieux refléter cette AUC que C₀, sans bénéfice clinique supérieur démontré de manière uniforme. C₀ ou C₂ restent utilisés selon le protocole et l’organe.',
    detailEn: 'AUC0–4 characterizes absorption; C2 may approximate it better than C0, but clinical benefit of C2-based monitoring is not uniformly established. C0 or C2 is used according to regimen and organ.',
    sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12122127/',
    sourceLabel: 'van Gelder et al. 2025 · discussion CsA'
  },
  everolimus: {
    tagFr: 'C₀ recommandée en routine', tagEn: 'C0 recommended routinely',
    titleFr: 'Évérolimus : cibles C₀ validées par schéma',
    titleEn: 'Everolimus: regimen-specific C0 monitoring',
    detailFr: 'Même si l’AUC décrit l’exposition totale, les recommandations et le label FDA Zortress utilisent la concentration résiduelle en sang total, avec cible et méthode dépendantes du schéma d’immunosuppression.',
    detailEn: 'AUC measures total exposure, but consensus and the Zortress FDA label use whole-blood trough monitoring with regimen- and assay-specific targets.',
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=e082a024-7850-400b-a5c2-2a140612562a',
    sourceLabel: 'FDA Zortress · §2.4'
  },
  sirolimus: {
    tagFr: 'C₀ en routine', tagEn: 'C0 in routine care',
    titleFr: 'Sirolimus : suivi C₀ selon les associations',
    titleEn: 'Sirolimus: regimen-specific C0 monitoring',
    detailFr: 'L’AUC représente l’exposition totale, mais ne remplace pas systématiquement la C₀ en pratique. Les fenêtres publiées de sirolimus dépendent notamment de l’association à la ciclosporine.',
    detailEn: 'AUC represents total exposure but does not routinely replace C0. Published sirolimus windows depend on coadministered cyclosporine.',
    sourceUrl: 'https://onlinelibrary.wiley.com/doi/full/10.1111/jcpt.13753',
    sourceLabel: 'Hartinger et al. 2022 · §3.5'
  }
});

const societyId = new Set(['itraconazoleIDSA2025','itraconazoleIDSA2016','busulfanEBMT2026','everolimus2025','mpa2021','valproateSfpt2010',
  'icuTdm2020','thaiKT2026','vancomycin2020']);
const regulatoryId = new Set(['teicoplaninANSM2026','valproateRcp','phenytoinFDA','fdaZortress2026']);
const limogesId = new Set(['mpa2015heart','levetiLimoges2022']);

export function classifyTdmSource(sourceId) {
  if (societyId.has(sourceId)) return 'society';
  if (regulatoryId.has(sourceId)) return 'regulatory';
  if (limogesId.has(sourceId)) return 'limoges';
  return 'other';
}

export function tdmEvidenceForDrug(drugId) {
  const referencedIds = [...new Set(tdmTargets.filter((row) => row.drug === drugId)
    .map((row) => row.source))];
  const publications = referencedIds.map((id) => ({
    id, ...tdmTargetSources[id], tier: classifyTdmSource(id), noteFr: null, noteEn: null
  }));
  const seen = new Set();
  const byTier = tdmEvidencePriority.map(({ id, fr, en }) => {
    const papers = publications.filter((item) => item.tier === id);
    if (id === 'society') {
      for (const paper of societyReferencesByDrug[drugId] || []) {
        if (seen.has(paper.url)) continue;
        papers.push({ id: paper.url, citation: paper.label, url: paper.url,
          tier: id, noteFr: paper.scopeFr, noteEn: paper.scopeEn });
        seen.add(paper.url);
      }
    }
    if (id === 'regulatory') {
      for (const label of regulatoryLabelsByDrug[drugId] || []) {
        if (seen.has(label.url)) continue;
        papers.push({ id: label.url, citation: label.authority + ' · ' + label.label,
          url: label.url, tier: id, noteFr: label.scopeFr, noteEn: label.scopeEn });
        seen.add(label.url);
      }
    }
    if (id === 'limoges') {
      for (const paper of limogesResearchByDrug[drugId] || []) {
        if (seen.has(paper.url)) continue;
        papers.push({ id: paper.url, citation: paper.label, url: paper.url,
          tier: id, noteFr: paper.scopeFr, noteEn: paper.scopeEn });
        seen.add(paper.url);
      }
    }
    // Suppress duplicate original publications if also linked above.
    const uniquePapers = papers.filter((paper) => {
      if (seen.has(paper.url) && !String(paper.id).startsWith('http')) return false;
      seen.add(paper.url);
      return true;
    });
    if (id === 'regulatory') {
      const rankAuthority = (paper) => {
        const name = (paper.citation || '') + ' ' + (paper.organization || '');
        return /ANSM/i.test(name) ? 0 : /EMA/i.test(name) ? 1 : /FDA/i.test(name) ? 2 : 3;
      };
      uniquePapers.sort((a, b) => rankAuthority(a) - rankAuthority(b));
    }
    return { id, fr, en, papers: uniquePapers };
  }).filter((entry) => entry.papers.length);
  return { exposure: exposureMarkerByDrug[drugId] || null, byTier };
}
