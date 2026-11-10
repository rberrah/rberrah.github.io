// @ts-nocheck
// Research/teaching reference only. No patient-specific dose calculation.
// Exposure index (PK/PD target), practical assay timing, administration context,
// and AUC-versus-dose proportionality are four different dimensions.
// Conservative fallback for all indexed drugs not manually reviewed:
// UNASSESSED -- never inherit dose linearity or licensed routes from a class.
import { tdmDrugs } from './tdmTargets.js';
import { betaLactamIds, aminoglycosideIds, fluoroquinoloneIds } from './tdmAntibioticPd.js';

export const TDM_PK_REVIEW_DATE = '2026-11-10';
/** @type {Readonly<Record<string, {citation:string, url:string, section:string, tier:'society'|'regulatory'|'other'}>>} */
export const tdmPkReferences = Object.freeze({
  beta2026: {citation:'ACCP / ESCMID / IDSA / IATDMCT · 2026', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC13392062/', section:'§3.2 et §5.3, cible 100 % fT>CMI et place de la CMI/ECOFF', tier:'society'},
  antibacterial2020: {citation:'ESICM / ESCMID / IATDMCT / ISAC · 2020', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC7223855/', section:'Tableaux 1 et 4 ; classes PK/PD et prélèvements', tier:'society'},
  vancomycin2020: {citation:'ASHP / IDSA / PIDS / SIDP · 2020', url:'https://www.idsociety.org/practice-guideline/vancomycin', section:'Recommandations 1, 3 et 8 : AUC/MIC, pas de résiduelle seule 15–20', tier:'society'},
  mycophenolate2025: {citation:'Recommandations MPA · 2025', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC12456993/', section:'Question 3 / recommandation 2 : AUC préférable à C0', tier:'society'},
  tacrolimus2019: {citation:'IATDMCT tacrolimus · 2019', url:'https://pubmed.ncbi.nlm.nih.gov/31045868/', section:'Consensus STP tacrolimus, relation C0 et AUC, contextes de greffe', tier:'society'},
  tacrolimusSmPC: {citation:'RCP Prograf IV · SmPC', url:'https://www.medicines.org.uk/emc/product/205/smpc', section:'§4.2, voie IV perfusion et relais oral', tier:'regulatory'},
  everolimus2016: {citation:'IATDMCT évérolimus · 2016', url:'https://pubmed.ncbi.nlm.nih.gov/26982492/', section:'C0 sang total, relation AUC et PK approximativement linéaire', tier:'society'},
  sirolimusEMA: {citation:'EMA · Rapamune', url:'https://www.ema.europa.eu/en/medicines/human/EPAR/rapamune', section:'Présentation orale, comprimé et solution buvable', tier:'regulatory'},
  cellceptEMA: {citation:'EMA · CellCept', url:'https://www.ema.europa.eu/en/medicines/human/EPAR/cellcept', section:'Gélule, comprimé, solution orale ; perfusion IV adulte', tier:'regulatory'},
  voriconazoleRcp: {citation:'ANSM · RCP voriconazole', url:'https://base-donnees-publique.medicaments.gouv.fr/medicament/69816080/extrait', section:'§5.2, saturation métabolique et augmentation plus que proportionnelle de l’AUC', tier:'regulatory'},
  voriconazoleEMA: {citation:'EMA · VFEND', url:'https://www.ema.europa.eu/fr/medicines/human/EPAR/vfend', section:'Formes orales et IV', tier:'regulatory'},
  phenytoinFDA: {citation:'FDA / DailyMed · Dilantin', url:'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f1d41925-3be0-42a8-86f8-181569399c5b', section:'Metabolism, saturation du CYP2C9/2C19 ; dose +10 % peut beaucoup augmenter le taux', tier:'regulatory'},
  valproateFDA: {citation:'FDA / DailyMed · Depakote', url:'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=08a65cf4-7749-4ceb-6895-8f4805e2b01f', section:'§12, liaison protéique saturable : concentrations totales non proportionnelles, PK libre linéaire', tier:'regulatory'},
  carbamazepineFDA: {citation:'FDA · Tegretol label', url:'https://www.accessdata.fda.gov/drugsatfda_docs/label/2001/20234S17LBL.PDF', section:'Pharmacokinetics, auto-induction de clairance pendant plusieurs semaines', tier:'regulatory'},
  rifampicinPK2016: {citation:'Denti et al. · rifampicine PK · 2016', url:'https://pubmed.ncbi.nlm.nih.gov/26552972/', section:'Modèle PK semi-mécaniste, auto-induction et extraction hépatique saturable', tier:'other'},
  rifampicinTDM2021: {citation:'Anti-TB TDM review · 2021', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC7935699/', section:'Exposition rifampicine, AUC et concentration, effet de dose et temps', tier:'other'},
  amoxicillinANSM: {citation:'ANSM · RCP Clamoxyl', url:'https://base-donnees-publique.medicaments.gouv.fr/medicament/62607530/extrait', section:'§4.2 oral et relais IV ; §5.2 proportionnalité AUC 250–3000 mg PO', tier:'regulatory'},
  busulfan2026: {citation:'EBMT / ESID · 2026', url:'https://doi.org/10.1038/s41409-026-02906-0', section:'AUC cumulée de conditionnement selon protocole', tier:'society'},
  psychiatry2020: {citation:'ASCP / AGNP · 2020', url:'https://doi.org/10.4088/JCP.19cs13169', section:'Tableau 2 : résiduelles historiques antipsychotiques, à réviser AGNP 2026', tier:'society'},
  depression2025: {citation:'Schoretsanitis & Paulzen · 2025', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC12672037/', section:'Tableau 1, concentrations antidépresseurs (agomélatine : pic)', tier:'other'},
  epilepsy2018: {citation:'Reimers et al. · 2018', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC5811172/', section:'Tableau 1, valeurs résiduelles sériques historiques', tier:'other'},
  lithium2019: {citation:'ISBD / IGSLI · 2019', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC6688930/', section:'Lithémie d’entretien, prélèvement à 12 ± 1 h', tier:'society'},
  teicoplaninRcp: {citation:'ANSM · RCP téicoplanine', url:'https://base-donnees-publique.medicaments.gouv.fr/medicament/64196782/extrait', section:'§4.2, résiduelle et différence HPLC/FPIA', tier:'regulatory'},
  hdMtx2024: {citation:'Consensus européen méthotrexate haute dose · 2024', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC11446969/', section:'Concentrations horodatées après début de perfusion et critères de retard', tier:'society'}
});

const indexed = (key, fr, en, noteFr, noteEn, sourceId) =>
  ({key, fr, en, noteFr, noteEn, sourceId});
const routine = (key, fr, en, noteFr, noteEn, sourceId) =>
  ({key, fr, en, noteFr, noteEn, sourceId});
const dose = (kind, fr, en, noteFr, noteEn, sourceId = null) =>
  ({kind, fr, en, noteFr, noteEn, sourceId, directRatioPermitted: false});
// Only studied/administered routes, NOT an exhaustive national marketing-authorisation list.
// routeScope explicitly distinguishes route in an ICU PK/PD paper from an authorised SmPC.
const routes = (codes, sourceId, scope = 'documented_context', modeFr = null, modeEn = null) =>
  ({codes, sourceId, scope, modeFr, modeEn});
const unknownIndex = indexed('unknown','Non établi','Not established',
  'Aucun indice dominant n’a été évalué pour cette entrée : la présence dans le répertoire ne vaut pas validation PK/PD.',
  'No dominant index has been assessed for this entry; listing is not PK/PD validation.',null);
const unknownRoutine = routine('unknown','À vérifier','Not reviewed',
  'Le temps de prélèvement, l’analyte et la méthode doivent être vérifiés dans la source spécifique.',
  'Assay timing, analyte and method need drug-specific review.',null);
const unknownDose = dose('unassessed','À documenter','Not assessed',
  'La linéarité dose–AUC n’est pas démontrée pour cette entrée. Ne pas calculer une nouvelle dose par règle de trois.',
  'Dose–AUC proportionality has not been established here. Do not calculate a new dose by simple ratio.');
const defaultProfile = (id) => ({
  drug: id, index: unknownIndex, practical: unknownRoutine,
  administration: {codes:[], sourceId:null, scope:'unreviewed'},
  proportionality: unknownDose,
  review: 'unassessed'
});
const allProfiles = Object.fromEntries(tdmDrugs.map(({id}) => [id, defaultProfile(id)]));
function assign(ids, update, review = 'class_reviewed') {
  for (const id of ids) {
    if (!allProfiles[id]) throw new Error('Unknown TDM drug id in PK/PD profile: '+id);
    allProfiles[id] = { ...allProfiles[id], ...update, review };
  }
}
const conditionallyLinear = dose('conditional_linear','Conditionnellement proportionnelle','Conditionally proportional',
  'En PK linéaire à l’état stable, AUCτ = F × dose / CL. Une exposition ×2 suppose F, CL, voie, intervalle et état clinique stables ; la réponse fT>CMI ne double pas mécaniquement.',
  'At steady state with linear PK, AUCτ = F × dose / CL. Twofold exposure requires unchanged F, CL, route, regimen and clinical state; fT>MIC does not scale as AUC.', 'beta2026');

// Antibacterials: PK/PD driver is not synonymous with a measurable trough.
assign(betaLactamIds,{
  index: indexed('fT_MIC','fT>CMI (temps dépendant)','fT>MIC (time dependent)',
    'Temps pendant lequel la concentration libre dépasse la CMI ; 100 % fT>CMI est un objectif conditionnel en situation aiguë. Une C0 seule reste un marqueur indirect et contextuel.',
    'Unbound time above MIC; conditional minimum of 100% fT>MIC in acutely ill patients. Trough is a contextual surrogate, not the PD definition.','beta2026'),
  practical: routine('Cmin_or_Css','Cmin (intermittent) ou Css (continu)','Trough (intermittent) or Css (continuous)',
    'La résiduelle libre peut étayer 100 % fT>CMI lorsque le schéma est intermittent ; en perfusion continue, une Css libre au plateau est plus directement interprétable. Dose de charge, stabilité chimique et site doivent être vérifiés.',
    'Free trough supports 100% fT>MIC with intermittent dosing; unbound steady-state Css is more direct for continuous infusion. Check loading, stability and site.','beta2026'),
  administration: routes(['IV'],'beta2026','studied_systemic_infusion','Intermittente, prolongée ou continue selon stabilité et protocole','Intermittent, extended or continuous infusion subject to product stability and protocol'),
  proportionality: conditionallyLinear
});
assign(aminoglycosideIds,{
  index: indexed('AUC_MIC_and_Cmax_MIC','AUC₀–₂₄/CMI et Cmax/CMI','AUC24/MIC and Cmax/MIC',
    'Effet concentration-dépendant : le rapport Cmax/CMI est un repère pratique ; l’AUC/CMI est souvent préférable avec adaptation bayésienne et tient compte de la toxicité. La Cmin sert surtout à limiter l’accumulation.',
    'Concentration-dependent activity: Cmax/MIC is practical; AUC/MIC with Bayesian adaptation can better capture exposure and toxicity. Cmin mainly monitors accumulation.','antibacterial2020'),
  practical: routine('peak_and_late','Pic post-perfusion + prélèvement tardif','Post-infusion peak + later sample',
    'Pic prélevé selon la durée d’infusion, deuxième prélèvement informatif pour estimer l’AUC ; la résiduelle sert à la sécurité.',
    'Post-infusion peak plus an informative late sample for AUC; trough for safety.','antibacterial2020'),
  administration: routes(['IV'],'antibacterial2020','studied_systemic_infusion','Perfusion IV et intervalle espacé dans les schémas étudiés','IV infusion with extended dosing intervals in studied regimens'),
  proportionality: dose('conditional_linear','Conditionnellement proportionnelle','Conditionally proportional',
    'Élimination principalement rénale : AUC proportionnelle à la dose seulement si clairance, volume et fonction rénale restent stables ; en soins intensifs cela doit être réévalué.',
    'Predominantly renal clearance: AUC scaling assumes stable clearance and renal function; reassess during critical illness.','antibacterial2020')
});
assign(fluoroquinoloneIds,{
  index: indexed('fAUC_MIC','AUC₀–₂₄/CMI (souvent libre)','AUC24/MIC (often unbound)',
    'Le rapport exposition/CMI est le déterminant majeur ; le Cmax/CMI est complémentaire. La C0 seule n’est pas la cible d’efficacité privilégiée.',
    'Exposure/MIC is the dominant driver; Cmax/MIC is additional. Trough alone is not the preferred efficacy metric.','antibacterial2020'),
  practical: routine('auc_model','AUC estimée avec prélèvements adaptés','Model-estimated AUC with timed sampling',
    'Prélèvements adaptés à la voie orale ou IV et au modèle utilisé ; interpréter avec CMI et fraction libre.',
    'Route- and model-specific timing; interpret with MIC and unbound fraction.','antibacterial2020'),
  administration: routes(['IV'],'antibacterial2020','studied_icu_iv'),
  proportionality: dose('unassessed','À vérifier pour la spécialité','Check product/formulation',
    'Le référentiel de groupe ne documente pas une plage de dose-proportionnalité pour chacune des quatre molécules et voies ; aucune règle de trois validée ici.',
    'Class-level evidence does not certify dose proportionality for every molecule, dose range and route.','antibacterial2020')
});
assign(['daptomycin'],{
  index:indexed('AUC_MIC','AUC₀–₂₄/CMI','AUC24/MIC',
    'Indice d’efficacité majeur ; Cmin élevée est davantage un signal de toxicité qu’un objectif de bénéfice.',
    'Key efficacy index; high trough is more relevant to toxicity than efficacy.','antibacterial2020'),
  practical:routine('auc_model','AUC à partir de prélèvements horodatés','AUC from timed concentrations',
    'Une estimation d’AUC peut combiner un prélèvement post-dose et une résiduelle ; conserver la CMI et le contexte infectieux.',
    'Timed postdose and trough observations can estimate AUC; retain MIC and infection context.','antibacterial2020'),
  administration:routes(['IV'],'antibacterial2020','studied_icu_iv'),
  proportionality:unknownDose
},'drug_reviewed');
assign(['linezolid'],{
  index:indexed('AUC_MIC','AUC₀–₂₄/CMI','AUC24/MIC',
    'Indice PK/PD d’efficacité (avec temps >CMI) ; C0 est un substitut pratique validé dans certains contextes, et renseigne aussi sur la toxicité hématologique.',
    'Efficacy index (alongside time above MIC); trough is a practical surrogate in specific settings and also informs haematologic toxicity.','antibacterial2020'),
  practical:routine('Cmin','C0 pratique ; AUC si disponible','Practical trough; AUC if available',
    'C0 2–7 mg/L souvent utilisée en réanimation ; ne pas confondre fenêtre résiduelle et cible AUC/CMI.',
    'Trough 2–7 mg/L often used in ICU; do not conflate trough window with AUC/MIC target.','antibacterial2020'),
  administration:routes(['IV','PO'],'antibacterial2020','clinical_systemic'),
  proportionality:unknownDose
},'drug_reviewed');
assign(['vancomycin'],{
  index:indexed('AUC24_MIC','AUC₀–₂₄ (avec CMI)','AUC24 (with MIC)',
    'Pour une infection grave à SARM, cibler l’AUC24 (400–600 mg·h/L si CMI BMD présumée 1 mg/L), plutôt qu’une seule C0.',
    'For serious MRSA, use AUC24 (400–600 mg·h/L assuming BMD MIC=1 mg/L) rather than trough alone.','vancomycin2020'),
  practical:routine('auc_bayesian','AUC bayésienne (1–2 prélèvements)','Bayesian AUC (1–2 samples)',
    'Prélèvements horodatés avec modèle, idéalement post-distribution et résiduel ; cible 15–20 mg/L en résiduel seul déconseillée pour SARM invasif.',
    'Timed samples, preferably postdistribution and trough; trough-only 15–20 mg/L not recommended in invasive MRSA.','vancomycin2020'),
  administration:routes(['IV'],'vancomycin2020','serious_systemic_mrsa','Perfusion IV intermittente ou continue ; suivi d’AUC adapté','Intermittent or continuous IV infusion with corresponding AUC monitoring'),
  proportionality:dose('conditional_linear','Conditionnellement proportionnelle','Conditionally proportional',
    'L’AUC dépend surtout de la clairance rénale : un rapport de dose n’est envisageable que si fonction rénale et régime sont stables ; ne pas appliquer avec insuffisance rénale aiguë.',
    'Exposure depends strongly on renal clearance; a simple ratio assumes stable renal function and regimen, never acute kidney injury.','vancomycin2020')
},'drug_reviewed');
assign(['teicoplanin'],{
  index:indexed('AUC_MIC','AUC/CMI (PK/PD)','AUC/MIC (PK/PD)',
    'Indice d’efficacité intégratif ; une résiduelle est plus facilement utilisée en routine faute de modèle d’AUC validé dans tous les contextes.',
    'Integrative efficacy index; trough is practical where validated AUC estimation is unavailable.','antibacterial2020'),
  practical:routine('Cmin','C0 résiduelle (méthode de dosage)','Trough (assay-dependent)',
    'Intervalles RCP HPLC et FPIA différents : vérifier la méthode avant toute interprétation.',
    'SmPC HPLC and FPIA intervals differ; verify assay before interpretation.','teicoplaninRcp'),
  administration:routes(['IV'],'teicoplaninRcp','studied_iv'),
  proportionality:unknownDose
},'drug_reviewed');

// Immunosuppressants: exposure versus feasible clinical proxy are deliberately distinct.
assign(['mpa'],{
  index:indexed('AUC_interval','AUC₀–₁₂ (exposition MPA)','AUC0-12 (MPA exposure)',
    'AUC mieux associée à l’exposition que C0 ; intervalle et borne selon greffe, formulation et co-immunosuppression.',
    'AUC captures exposure better than trough; thresholds depend on graft, formulation and co-immunosuppression.','mycophenolate2025'),
  practical:routine('limited_sampling_auc','AUC par stratégie de prélèvements limités','Limited-sampling estimated AUC',
    'C0 de MPA corrèle médiocrement avec AUC ; ne pas substituer directement. Fraction libre en hypoalbuminémie à apprécier.',
    'MPA trough poorly predicts AUC; do not substitute. Consider unbound drug in hypoalbuminaemia.','mycophenolate2025'),
  administration:routes(['PO','IV'],'cellceptEMA','mmf_product_specific','MMF oral ; MMF IV chez l’adulte. L’EC-MPS oral n’est pas une forme IV.','Oral MMF; IV MMF in adults. Oral enteric-coated MPA is not an IV formulation.'),
  proportionality:dose('complex','Non garantie','Not reliably proportional',
    'MPA : cycle entérohépatique, variations de biodisponibilité, albumine/MPAG et co-traitements. La relation AUC/dose doit être évaluée pour formulation et patient.',
    'MPA: enterohepatic recirculation, bioavailability, albumin/MPAG and interacting immunosuppressants; verify patient- and formulation-specific exposure.','mycophenolate2025')
},'drug_reviewed');
assign(['tac'],{
  index:indexed('AUC_interval','AUCτ (exposition complète)','AUCτ (total exposure)',
    'L’AUC caractérise plus complètement l’exposition ; la C0 reste la surveillance standard validée et pratique en routine. L’AUC n’est pas imposée pour toutes les greffes.',
    'AUC better characterises exposure; trough remains the established, practical routine monitoring approach. AUC is not universally mandated.','tacrolimus2019'),
  practical:routine('Cmin','C0 en routine ; AUC si pertinente','Routine trough; AUC when indicated',
    'C0 sang total à l’horaire adapté (LI versus LP) ; AUC/LSS en cas de discordance, interaction ou question pharmacométrique.',
    'Whole-blood trough at formulation-appropriate timing (IR vs prolonged release); AUC/LSS for discordance, interactions or selected questions.','tacrolimus2019'),
  administration:routes(['PO','IV'],'tacrolimusSmPC','tacrolimus_formulation_specific','Voie orale à libération immédiate ou prolongée selon spécialité ; IV en perfusion encadrée','Immediate- or prolonged-release oral forms by product; controlled IV infusion'),
  proportionality:dose('complex','Non garantie sans réévaluation','Not guaranteed without reassessment',
    'CYP3A4/5, hématocrite, interactions, aliments et formulation influencent la dose–exposition ; un doublement arithmétique de dose n’est pas une règle validée.',
    'CYP3A4/5, haematocrit, interactions, food and formulation affect exposure; do not presume dose doubling doubles AUC.','tacrolimus2019')
},'drug_reviewed');
assign(['cyclosporine'],{
  index:indexed('AUC_interval','AUC (ou C2 validée selon greffe)','AUC (or validated C2 by transplant)',
    'L’AUC décrit l’exposition ; C2 peut mieux refléter l’absorption que C0 dans certains protocoles, sans être interchangeable universellement.',
    'AUC captures exposure; C2 may reflect absorption in some protocols but is not universally interchangeable with trough.','tacrolimus2019'),
  practical:routine('Cmin_or_C2','C0 ou C2 selon protocole','Trough or C2 per protocol',
    'Préciser horaire C2 exactement 2 h après prise si utilisé ; modèle et spécialité conditionnent l’interprétation.',
    'C2 requires accurately documented 2 h postdose time; formulation and model affect interpretation.','tacrolimus2019'),
  administration:{codes:[],sourceId:null,scope:'unreviewed'},
  proportionality:unknownDose
},'drug_reviewed');
assign(['everolimus'],{
  index:indexed('Cmin','C0 (bon reflet de l’AUC)','Trough (good AUC proxy)',
    'Le consensus IATDMCT indique que la C0 sang total corrèle bien à l’AUC : elle est la surveillance recommandée, sans nécessité systématique d’une AUC.',
    'IATDMCT states whole-blood trough tracks AUC well and is appropriate for routine TDM.','everolimus2016'),
  practical:routine('Cmin','C0 juste avant la prise','Trough before next dose',
    'Prélèvement standardisé avant dose à l’état stable, avec conditions alimentaires constantes.',
    'Steady-state predose sample with consistent food conditions.','everolimus2016'),
  administration:routes(['PO'],'everolimus2016','reviewed_oral_transplant'),
  proportionality:dose('conditional_linear','PK globalement linéaire, conditionnelle','Generally linear, conditional',
    'La PK est décrite comme linéaire dans le consensus, mais CYP3A/P-gp, nourriture et co-traitements modifient CL/F. Pas de garantie individuelle de règle de trois.',
    'Consensus describes linear PK, but CYP3A/P-gp, food and interacting drugs affect CL/F. No unconditional individual dose ratio.','everolimus2016')
},'drug_reviewed');
assign(['sirolimus'],{
  index:indexed('Cmin','C0 (exposition de routine)','Trough (routine exposure)',
    'C0 sang total suivie en transplantation ; AUC plus exhaustive mais pas systématiquement nécessaire à la routine.',
    'Whole-blood trough used in transplant TDM; AUC more comprehensive but not routinely required.','sirolimusEMA'),
  practical:routine('Cmin','C0 à l’équilibre','Steady-state trough',
    'Demi-vie longue ; attendre l’équilibre et distinguer changement de formulation/comprimé/solution.',
    'Long half-life; allow steady state and distinguish formulation changes.','sirolimusEMA'),
  administration:routes(['PO'],'sirolimusEMA','product_authorised','Solution orale et comprimés : exposition pas toujours équivalente sans STP','Oral solution and tablets: exposure may differ after formulation switch'),
  proportionality:dose('complex','Non garantie selon formulation','Not guaranteed across formulations',
    'La biodisponibilité diffère entre solution et comprimés, et dépend des interactions CYP3A/P-gp. Même dose ne garantit pas même AUC après changement de formulation.',
    'Bioavailability differs between oral solution and tablets; CYP3A/P-gp interactions. Same dose across formulations does not guarantee the same AUC.','sirolimusEMA')
},'drug_reviewed');

// Antifungals: do not infer linearity from a trough-based monitoring strategy.
assign(['voriconazole'],{
  index:indexed('Cmin','C0 (exposition et toxicité)','Trough (exposure and safety)',
    'Le suivi thérapeutique utilise une résiduelle à l’état stable ; l’AUC peut décrire l’exposition mais n’est pas la mesure de routine universelle.',
    'Clinical TDM generally uses trough; AUC is informative but not the universal routine metric.','antibacterial2020'),
  practical:routine('Cmin','C0 avant prise suivante','Predose trough',
    'Horodatage et interaction CYP2C19/CYP3A ; réévaluation après changement de dose ou de traitement.',
    'Time-stamped sample, CYP2C19/CYP3A interactions; reassess after dose or medication changes.','antibacterial2020'),
  administration:routes(['PO','IV'],'voriconazoleEMA','product_authorised','Formes orale et IV avec dose de charge selon schéma, sans règle de conversion automatique','Oral and IV formulations with regimen-specific loading; no automatic conversion'),
  proportionality:dose('nonlinear','Non : PK non linéaire','No: nonlinear PK',
    'Saturation du métabolisme (RCP ANSM) : passer de 200 à 300 mg PO deux fois/jour augmente en moyenne l’AUCτ d’environ 2,5 fois, pas 1,5 fois.',
    'Metabolic saturation (French SmPC): 200 to 300 mg PO twice daily raises mean AUCτ about 2.5-fold, not 1.5-fold.','voriconazoleRcp')
},'drug_reviewed');
assign(['posaconazole'],{
  index:indexed('Cmin','C0 (prophylaxie/traitement)','Trough (prevention/treatment)',
    'C0 à l’état stable : objectifs distincts prophylaxie et traitement ; biodisponibilité dépend fortement de la formulation.',
    'Steady-state trough; prophylaxis and treatment thresholds differ and formulations affect bioavailability.','antibacterial2020'),
  practical:routine('Cmin','C0 avant dose','Predose trough',
    'Préciser suspension, comprimé gastro-résistant ou perfusion avant comparaison.',
    'Distinguish suspension, delayed-release tablets and IV form before interpretation.','antibacterial2020'),
  administration:{codes:[],sourceId:null,scope:'unreviewed'},
  proportionality:dose('complex','Non garantie selon formulation','Not assured across formulations',
    'Ne pas transposer une proportion dose–AUC entre suspension, comprimé gastro-résistant et IV ; documents de spécialité nécessaires.',
    'Do not assume identical dose proportionality across oral suspension, delayed-release tablets and IV.','antibacterial2020')
},'drug_reviewed');
assign(['itraconazole'],{
  index:indexed('Cmin','C0 avec analyte spécifié','Trough with specified analyte',
    'Les seuils parent seul et somme itraconazole + hydroxyitraconazole sont différents : ne pas les mélanger.',
    'Parent-only and itraconazole+hydroxyitraconazole reference values differ.','antibacterial2020'),
  practical:routine('Cmin','C0 et laboratoire/analyte','Trough; assay and analyte',
    'Médicament et métabolite séparés ; formulation et absorption déterminantes.',
    'Parent and metabolite distinct; formulation and absorption matter.','antibacterial2020'),
  administration:{codes:[],sourceId:null,scope:'unreviewed'},
  proportionality:unknownDose
},'drug_reviewed');
assign(['flucytosine'],{
  index:indexed('Cmax_and_Cmin','Pic (toxicité) + résiduel','Peak (toxicity) + trough',
    'Le pic renseigne surtout sur la sécurité ; résiduelle et exposition globale peuvent renseigner l’efficacité. Il n’existe pas une seule métrique universelle.',
    'Peak is mainly a safety metric; trough and exposure can inform effectiveness. No universally dominant single metric.','antibacterial2020'),
  practical:routine('peak_and_trough','Cmax post-dose et C0','Postdose peak and trough',
    'L’horaire du pic dépend de la voie orale ou IV ; vérifier le schéma et la fonction rénale.',
    'Peak timing depends on oral vs IV administration; verify schedule and kidney function.','antibacterial2020'),
  administration:routes(['PO','IV'],'antibacterial2020','studied_systemic'),
  proportionality:unknownDose
},'drug_reviewed');
assign(['phenytoin'],{
  index:indexed('Cmin','C0 totale ou libre','Total or free trough',
    'STP résiduel, en privilégiant la fraction libre si hypoalbuminémie, insuffisance rénale ou liaison protéique modifiée.',
    'Trough TDM; unbound concentration is valuable in hypoalbuminaemia, renal dysfunction or altered binding.','phenytoinFDA'),
  practical:routine('Cmin','Résiduelle à l’équilibre','Steady-state trough',
    'Après modification de dose, délai de rééquilibration variable du fait de l’élimination saturable.',
    'Time to steady state after changes varies with saturable elimination.','phenytoinFDA'),
  administration:routes(['PO'],'phenytoinFDA','oral_label_reviewed'),
  proportionality:dose('nonlinear','Non : métabolisme saturable','No: saturable metabolism',
    'De petites augmentations de dose peuvent provoquer de fortes hausses des concentrations ; RCP FDA : même +10 % de dose peut être disproportionné.',
    'Small dose increases can markedly raise exposure; FDA label warns that +10% may produce disproportionate concentrations.','phenytoinFDA')
},'drug_reviewed');
assign(['lithium'],{
  index:indexed('C12','Concentration à 12 h','12-h concentration',
    'Lithémie standardisée à 12 ± 1 h, davantage qu’un pic ou une AUC de routine ; tenir compte du sel et de la forme LP/LI.',
    'Standardised 12 ± 1 h lithium concentration; peak or AUC not usual routine index.','lithium2019'),
  practical:routine('C12','12 ± 1 h après dernière prise','12 ± 1 h after last dose',
    'Un prélèvement à 12 h n’est pas nécessairement une vraie Cmin selon le schéma et la formulation.',
    'A 12-h value need not be the true trough for every formulation/regimen.','lithium2019'),
  administration:{codes:[],sourceId:null,scope:'unreviewed'},
  proportionality:dose('conditional_linear','Conditionnellement proportionnelle','Conditionally proportional',
    'Élimination rénale ; l’AUC dépend de la clairance, des apports sodés et de l’hydratation. Même si PK souvent linéaire, pas de règle de trois avec variation rénale.',
    'Renal clearance, salt and hydration affect exposure; no simple ratio with changing kidney function.','lithium2019')
},'drug_reviewed');
assign(['busulfan'],{
  index:indexed('AUC_cumulative','AUC cumulée de conditionnement','Cumulative conditioning AUC',
    'AUC totale du schéma, pas C0 ou Cmax ; objectifs différents selon indication et protocole.',
    'Total conditioning AUC, not C0 or Cmax; targets differ by protocol and indication.','busulfan2026'),
  practical:routine('limited_sampling_auc','AUC par prélèvements horodatés','AUC from timed PK sampling',
    'Les concentrations et temps exacts après perfusion sont nécessaires à l’estimation et au cumul du schéma.',
    'Timed concentrations around infusions are required to estimate and sum regimen exposure.','busulfan2026'),
  administration:routes(['IV'],'busulfan2026','conditioning_iv_protocol','Conditionnement IV étudié ; calcul d’AUC cumulée sur toutes les doses du schéma','Studied IV conditioning regimen; cumulative AUC across all scheduled doses'),
  proportionality:unknownDose
},'drug_reviewed');
assign(['methotrexate'],{
  index:indexed('time_indexed','Concentration à H24/H36/H42/H48','Time-indexed concentration at 24/36/42/48h',
    'En MTX haute dose, l’indicateur retenu pour l’élimination retardée est une concentration horodatée depuis le début de la perfusion ; ce n’est pas une cible AUC/C0.',
    'For high-dose MTX, timed concentrations from infusion START identify delayed elimination; they are not routine AUC or trough targets.','hdMtx2024'),
  practical:routine('timed_concentration','Série de prélèvements horodatés','Series of time-stamped levels',
    'Interpréter avec fonction rénale, leucovorine, protocole et éventuelle interférence analytique après glucarpidase.',
    'Interpret with renal function, rescue regimen, protocol and possible post-glucarpidase assay interference.','hdMtx2024'),
  administration:routes(['IV'],'hdMtx2024','hdmtx_infusion_only','Perfusion IV haute dose : temps calculés depuis le début de la perfusion','High-dose IV infusion: sample times measured from infusion start'),
  proportionality:unknownDose
},'drug_reviewed');

// Neuropsychiatry: the existence of an older trough REFERENCE is not evidence
// that trough is the most predictive clinical efficacy metric.
const olderNeuro = ['valproate','carbamazepine','lamotrigine','oxcarbazepine','levetiracetam',
  'phenobarbital','brivaracetam','clobazam','clonazepam','eslicarbazepine',
  'ethosuximide','felbamate','gabapentin','lacosamide','perampanel','pregabalin',
  'rufinamide','stiripentol','sulthiame','topiramate','zonisamide'];
assign(olderNeuro,{
  index:indexed('Cmin_reference','C0 de référence (pas d’indice universel)','Reference trough (not universal efficacy index)',
    'Intervalle résiduel publié pour certains contextes épileptiques ; ne signifie pas qu’une C0 seule prédit idéalement l’efficacité. Métabolites et fraction libre à préciser.',
    'A published predose range does not imply trough alone best predicts efficacy. Identify active metabolites and unbound levels.','epilepsy2018'),
  practical:routine('Cmin','Résiduelle à l’équilibre','Steady-state predose',
    'Horaire exact dépend de la forme, du dosage des métabolites, et de l’indication ; référentiels historiques à réviser.',
    'Exact timing depends on formulation, active metabolites and indication; historical ranges require review.','epilepsy2018'),
  administration:{codes:[],sourceId:null,scope:'unreviewed'},
  proportionality:unknownDose
},'class_reviewed');
assign(['agomelatine'],{
  index:indexed('Cmax_reference','Cmax 1–2 h (repère historique)','1–2 h Cmax (historical reference)',
    'La valeur publiée en 2025 porte sur le pic après 50 mg, pas une concentration résiduelle. Utilité clinique du STP non systématiquement démontrée.',
    'The published 2025 range is a 50 mg postdose peak, not a trough; routine TDM benefit is not established.','depression2025'),
  practical:routine('Cmax','Pic à 1–2 h après prise','Peak at 1–2 h postdose',
    'Ne pas interpréter un prélèvement résiduel avec cet intervalle.',
    'Do not use peak reference range for trough samples.','depression2025'),
  administration:{codes:[],sourceId:null,scope:'unreviewed'},
  proportionality:unknownDose
},'drug_reviewed');

// Positive knowledge from existing source-locked antidepressant and
// antipsychotic numeric targets, not a claim of clinically optimal C0.
const existingHistoricalAntidepressants = ['amitriptyline','citalopram','clomipramine','imipramine',
  'nortriptyline','desipramine','dosulepine','doxepine','duloxetine','escitalopram',
  'fluoxetine','fluvoxamine','maprotiline','mianserine','milnacipran','mirtazapine',
  'moclobemide','paroxetine','sertraline','tianeptine','trimipramine','venlafaxine',
  'vortioxetine','trazodone','desvenlafaxine','levomilnacipran','reboxetine',
  'vilazodone','bupropion','tranylcypromine'];
assign(existingHistoricalAntidepressants,{
  index:indexed('Cmin_reference','C0 de référence historique','Historical trough reference',
    'Repère de STP du consensus/revue, et non démonstration que la C0 surpasse l’AUC pour tout patient. Prendre garde aux sommes parent + métabolite et à l’AGNP 2026.',
    'A TDM reference, not proof trough outperforms AUC for everyone. Parent/metabolite definitions and AGNP 2026 require review.','depression2025'),
  practical:routine('Cmin','C0 à l’équilibre (analyte exact)','Steady-state trough (exact analyte)',
    'Préciser molécule mère, métabolites actifs et forme LP ; horaires et intervalles à revérifier.',
    'Identify parent, active metabolite and formulation; verify sampling timing and published range.','depression2025'),
  administration:{codes:[],sourceId:null,scope:'unreviewed'},
  proportionality:unknownDose
},'class_reviewed');
const olderAntipsychotics = ['fluphenazine','haloperidol','olanzapine','perazine','perphenazine',
  'aripiprazole','chlorpromazine','flupentixol','paliperidone','quetiapine','risperidone',
  'sertindole','ziprasidone','brexpiprazole','chlorprothixene','iloperidone','loxapine',
  'lurasidone','melperone','pimozide','asenapine','clozapine'];
assign(olderAntipsychotics,{
  index:indexed('Cmin_reference','C0 de référence historique','Historical trough reference',
    'Fenêtre résiduelle pour STP en psychiatrie ; l’analyte et la forme injectable prolongée nécessitent une vérification spécifique.',
    'Psychiatric TDM trough reference; analyte and long-acting injection timing require specific review.','psychiatry2020'),
  practical:routine('Cmin','Prélèvement résiduel adapté à la forme','Formulation-specific predose',
    'Les formes injectables LP ne suivent pas nécessairement le rythme de prélèvement des prises orales. Réviser le consensus AGNP 2026.',
    'Long-acting injections need different timing than oral tablets. Verify AGNP 2026 update.','psychiatry2020'),
  administration:{codes:[],sourceId:null,scope:'unreviewed'},
  proportionality:unknownDose
},'class_reviewed');

// Nonlinearity is analyte-, regimen- and time-specific: never mark all
// antiepileptics or all antibiotics as linear from a class assumption.
assign(['valproate'],{
  index:indexed('Cmin_total_or_free','C0 totale ou libre selon liaison protéique','Total or unbound trough by protein binding',
    'La concentration totale est un marqueur imparfait quand albumine et liaison sont modifiées ; la concentration libre correspond davantage à la fraction active.',
    'Total drug is an imperfect proxy when albumin and binding change; unbound drug better reflects active exposure.','valproateFDA'),
  practical:routine('Cmin','C0 totale, fraction libre si besoin','Total trough, unbound if needed',
    'Documenter l’albumine, le prélèvement et les co-médications ; une concentration totale dans la fenêtre n’exclut pas une exposition libre excessive.',
    'Document albumin, timing and co-medications; a total concentration in range may conceal excessive free exposure.','valproateFDA'),
  administration:routes(['PO'],'valproateFDA','depakote_oral_specific'),
  proportionality:dose('complex','Totale non linéaire ; libre plus linéaire','Total nonlinear; unbound more linear',
    'FDA : liaison protéique saturable ; la concentration totale augmente moins que proportionnellement à la dose, alors que la cinétique du valproate libre est décrite comme linéaire. Ne pas appliquer un ratio de dose à la concentration totale.',
    'FDA: saturable protein binding yields a less-than-proportional total level, while unbound valproate kinetics are described as linear. Do not scale total levels using a simple ratio.','valproateFDA')
},'drug_reviewed');
assign(['carbamazepine'],{
  index:indexed('Cmin_parent','C0 carbamazépine (métabolite à considérer)','Carbamazepine trough (consider metabolite)',
    'Carbamazépine parent surveillée, mais le 10,11-époxyde contribue à l’effet et peut être modifié indépendamment.',
    'Parent trough monitored, but active 10,11-epoxide may vary independently.','carbamazepineFDA'),
  practical:routine('Cmin','C0 à l’équilibre après auto-induction','Steady-state trough after autoinduction',
    'La clairance augmente sous traitement : ne pas interpréter de la même manière une concentration aux premiers jours et après stabilisation.',
    'Clearance increases during therapy; early and post-induction troughs are not directly comparable.','carbamazepineFDA'),
  administration:routes(['PO'],'carbamazepineFDA','tegretol_oral_specific'),
  proportionality:dose('complex','Non stable : auto-induction','Time-dependent: autoinduction',
    'La carbamazépine induit son propre métabolisme en plusieurs semaines : la relation dose–AUC dépend du temps après initiation/modification de dose.',
    'Carbamazepine induces its own metabolism over weeks: dose–AUC depends on time since start or adjustment.','carbamazepineFDA')
},'drug_reviewed');
assign(['rifampicin'],{
  index:indexed('AUC_MIC','AUC₀–₂₄/CMI (antituberculeux)','AUC24/MIC (tuberculosis)',
    'L’exposition AUC contribue à l’activité antituberculeuse et peut nécessiter des prélèvements individuels ; Cmax est complémentaire.',
    'AUC exposure contributes to TB activity; Cmax is complementary and sampling may need individualisation.','rifampicinTDM2021'),
  practical:routine('auc_timed','AUC par prélèvements horodatés','AUC from time-stamped samples',
    'L’auto-induction rend essentielle la date de traitement et les temps réels des prélèvements.',
    'Autoinduction means treatment day and actual sample times are essential.','rifampicinTDM2021'),
  administration:routes(['PO'],'rifampicinTDM2021','studied_oral_tb'),
  proportionality:dose('nonlinear','Non : auto-induction et saturation','No: autoinduction and saturation',
    'Une hausse de dose peut augmenter l’AUC de façon plus que proportionnelle ; la clairance augmente aussi au fil des jours par auto-induction. Résultats dépendants de la dose et du temps.',
    'Dose escalation can increase AUC more than proportionally while clearance also rises over days through autoinduction. Response is dose- and time-dependent.','rifampicinPK2016')
},'drug_reviewed');

// Regulatory-strength product examples: do not infer route interchangeability.
assign(['amoxicillin'],{
  administration:routes(['PO','IV'],'amoxicillinANSM','product_authorised'),
  proportionality:dose('conditional_linear','PK orale proportionnelle dans la plage étudiée','Oral proportionality in studied dose range',
    'RCP Clamoxyl : AUC/Cmax dose-proportionnelles après 250–3000 mg per os, chez volontaires ; cela ne démontre pas l’équivalence dose PO/IV ni la stabilité du CL en réanimation.',
    'Clamoxyl SmPC: oral AUC/Cmax dose proportional within 250–3000 mg in the studied setting; does not prove PO/IV interchangeability or stable CL in ICU.','amoxicillinANSM')
},'drug_reviewed');
assign(['sirolimus'],{administration:routes(['PO'],'sirolimusEMA','product_authorised','Solution orale et comprimés : exposition pas toujours équivalente sans STP','Oral solution and tablets: exposure may differ after formulation switch')},'drug_reviewed');

export const tdmPharmacologyProfiles = Object.freeze(allProfiles);
export function tdmPharmacologyForDrug(id) {
  return tdmPharmacologyProfiles[id] ?? null;
}
export function tdmPharmacologyCoverage() {
  const records = Object.values(tdmPharmacologyProfiles);
  const count = (fn) => records.filter(fn).length;
  return {
    drugs: records.length,
    with_index: count((p) => p.index.key !== 'unknown'),
    with_practical_sample: count((p) => p.practical.key !== 'unknown'),
    with_documented_routes: count((p) => p.administration.codes.length > 0),
    with_reviewed_dose_behavior: count((p) => p.proportionality.kind !== 'unassessed'),
    nonlinear_or_complex: count((p) => ['nonlinear','complex'].includes(p.proportionality.kind)),
    safe_automatic_scaling_count: count((p) => p.proportionality.directRatioPermitted === true)
  };
}
