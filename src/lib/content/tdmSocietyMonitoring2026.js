// Drug discovery beyond the CHU manual, with exact institutional/society provenance.
// Mentioned in a paper != routine TDM recommendation != a validated numeric target.
// This is a deliberately non-executable educational review queue.
/** @type {Readonly<Record<string, {title:string, url:string, organization:string}>>} */
export const societyMonitoringSources = Object.freeze({
  "chu_theophylline": {
    "title": "FDA/DailyMed · théophylline (exposition) + fiche CHU Limoges (disponibilité analytique)",
    "url": "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=32b9780f-c46f-4e0f-9641-2cab60600e6e",
    "organization": "FDA / CHU Limoges"
  },
  "chu_abacavir": {
    "title": "CHU Limoges · Abacavir (dosage sérum/plasma)",
    "url": "https://chu-limoges.manuelprelevement.fr/DetailNew.aspx?id=A3838",
    "organization": "CHU Limoges"
  },
  "thiopurines": {
    "title": "ECCO-ESPGHAN 2026 · metabolites des thiopurines",
    "url": "https://academic.oup.com/ecco-jcc/article/20/8/jjag084/8766823",
    "organization": "ECCO / ESPGHAN"
  },
  "iatdmct_icu": {
    "title": "ESICM/ESCMID/IATDMCT/ISAC 2020 · position paper",
    "url": "https://pubmed.ncbi.nlm.nih.gov/32383061/",
    "organization": "IATDMCT"
  },
  "ats_tb": {
    "title": "ATS/CDC/IDSA 2016 · tuberculosis therapy, section Therapeutic Drug Monitoring",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/pmid/27516382/",
    "organization": "ATS / CDC / IDSA"
  },
  "ats_ntm": {
    "title": "ATS/ERS/ESCMID/IDSA 2020 · NTM pulmonary disease, TDM",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/7768748/",
    "organization": "ATS / ERS / ESCMID / IDSA"
  }
});
export const societyTdmDrugRows = Object.freeze([
  {
    "id": "theophylline",
    "fr": "Théophylline",
    "en": "Theophylline",
    "aliases": [
      "théophylline",
      "theophylline",
      "euphylline"
    ],
    "sourceId": "chu_theophylline",
    "recommendation": "assay_and_product_label",
    "exposureKind": "peak_serum",
    "noteFr": "Le pic sérique total à l’état stable (solution orale à libération immédiate) a un repère chiffré propre au libellé FDA. Ne pas transposer à une C0 ni à toute formulation LP.",
    "noteEn": "A formulation-specific steady-state serum peak interval is documented for immediate-release oral solution. It must not be applied to trough or other formulations."
  },
  {
    "id": "abacavir",
    "fr": "Abacavir",
    "en": "Abacavir",
    "aliases": [
      "ziagen",
      "kivexa",
      "triumeq"
    ],
    "sourceId": "chu_abacavir",
    "recommendation": "assay_only",
    "exposureKind": "no_validated_target",
    "noteFr": "La fiche CHU documente le dosage sérique/plasmatique ; elle ne démontre pas une plage thérapeutique validée. L'exposition au métabolite intracellulaire ne doit pas être confondue avec le parent plasmatique.",
    "noteEn": "CHU documents serum/plasma assay availability, not a validated plasma therapeutic window. Intracellular active exposure differs from the measured parent."
  },
  {
    "id": "azathioprine",
    "fr": "Azathioprine",
    "en": "Azathioprine",
    "aliases": [
      "imurel",
      "azathioprine"
    ],
    "sourceId": "thiopurines",
    "recommendation": "selective_metabolite_tdm",
    "exposureKind": "metabolites_6tgn_6mmp",
    "noteFr": "Le suivi concerne les métabolites érythrocytaires 6-TGN et 6-MMP, pas la concentration plasmatique du promédicament. Examen CHU externalisé à l'AP-HP. Contexte MICI, réponse ou toxicité.",
    "noteEn": "Monitoring concerns red-cell 6-TGN/6-MMP metabolites, not parent-drug plasma levels. CHU refers this assay to AP-HP. IBD response/toxicity context."
  },
  {
    "id": "mercaptopurine",
    "fr": "Mercaptopurine",
    "en": "Mercaptopurine",
    "aliases": [
      "6-mercaptopurine",
      "6-mp",
      "purinethol"
    ],
    "sourceId": "thiopurines",
    "recommendation": "selective_metabolite_tdm",
    "exposureKind": "metabolites_6tgn_6mmp",
    "noteFr": "Le suivi concerne les métabolites érythrocytaires 6-TGN et 6-MMP. Les cibles et les méthodes ne peuvent être transférées entre matrices.",
    "noteEn": "Monitoring concerns red-cell 6-TGN/6-MMP. Ranges and methods are not interchangeable across matrices."
  },
  {
    "id": "fluconazole",
    "fr": "Fluconazole",
    "en": "Fluconazole",
    "aliases": [
      "triflucan",
      "fluconazole"
    ],
    "sourceId": "iatdmct_icu",
    "recommendation": "neither_recommend_nor_discourage",
    "exposureKind": "auc_mic_contextual",
    "noteFr": "IATDMCT 2020 : étude d'exposition et AUC/CMI en réanimation, sans recommandation de STP systématique. Aucune cible chiffrée universelle importée.",
    "noteEn": "IATDMCT 2020 discusses ICU exposure and AUC/MIC but neither recommends nor discourages routine TDM. No universal numeric range imported."
  },
  {
    "id": "isavuconazole",
    "fr": "Isavuconazole",
    "en": "Isavuconazole",
    "aliases": [
      "cresemba",
      "isavuconazonium"
    ],
    "sourceId": "iatdmct_icu",
    "recommendation": "neither_recommend_nor_discourage",
    "exposureKind": "exposure_case_specific",
    "noteFr": "IATDMCT 2020 : STP non recommandé ni déconseillé systématiquement ; interpréter en tenant compte de la formulation, des interactions et de l'indication.",
    "noteEn": "IATDMCT 2020 neither recommends nor discourages routine TDM; consider formulation, interactions and indication."
  },
  {
    "id": "anidulafungin",
    "fr": "Anidulafungine",
    "en": "Anidulafungin",
    "aliases": [
      "eraxis",
      "ecalta"
    ],
    "sourceId": "iatdmct_icu",
    "recommendation": "neither_recommend_nor_discourage",
    "exposureKind": "auc_mic_exploratory",
    "noteFr": "Échinocandine IV : pas de fenêtre thérapeutique clinique validée dans le consensus 2020 ; pas de STP systématique recommandé.",
    "noteEn": "Intravenous echinocandin: no validated clinical therapeutic range in the 2020 consensus; routine TDM not recommended by the panel."
  },
  {
    "id": "caspofungin",
    "fr": "Caspofungine",
    "en": "Caspofungin",
    "aliases": [
      "cancidas"
    ],
    "sourceId": "iatdmct_icu",
    "recommendation": "neither_recommend_nor_discourage",
    "exposureKind": "auc_mic_exploratory",
    "noteFr": "Échinocandine IV : aucun objectif d'exposition clinique universel validé ; STP systématique ni recommandé ni déconseillé.",
    "noteEn": "Intravenous echinocandin: no validated universal clinical exposure target; routine TDM neither recommended nor discouraged."
  },
  {
    "id": "micafungin",
    "fr": "Micafungine",
    "en": "Micafungin",
    "aliases": [
      "mycamine"
    ],
    "sourceId": "iatdmct_icu",
    "recommendation": "neither_recommend_nor_discourage",
    "exposureKind": "auc_mic_exploratory",
    "noteFr": "Échinocandine IV : des rapports AUC/CMI exploratoires existent, sans cible clinique universelle validée.",
    "noteEn": "Intravenous echinocandin: exploratory AUC/MIC data exist, without a validated universal clinical target."
  },
  {
    "id": "aciclovir",
    "fr": "Aciclovir",
    "en": "Acyclovir",
    "aliases": [
      "zovirax",
      "acyclovir"
    ],
    "sourceId": "iatdmct_icu",
    "recommendation": "neither_recommend_nor_discourage",
    "exposureKind": "exposure_uncertain",
    "noteFr": "Antiviral discuté en réanimation ; absence de recommandation de STP systématique et de seuil universel. Ne pas confondre avec le promédicament valaciclovir.",
    "noteEn": "Antiviral reviewed in ICU; no routine TDM recommendation or universal range. Not interchangeable with valaciclovir prodrug."
  },
  {
    "id": "valaciclovir",
    "fr": "Valaciclovir",
    "en": "Valacyclovir",
    "aliases": [
      "valtrex",
      "valacyclovir"
    ],
    "sourceId": "iatdmct_icu",
    "recommendation": "neither_recommend_nor_discourage",
    "exposureKind": "exposure_uncertain",
    "noteFr": "Promédicament de l'aciclovir : distinguer substance administrée et analyte dosé. STP systématique non établi.",
    "noteEn": "Acyclovir prodrug: administered compound and measured analyte must be distinguished. Routine TDM not established."
  },
  {
    "id": "foscarnet",
    "fr": "Foscarnet",
    "en": "Foscarnet",
    "aliases": [
      "foscavir"
    ],
    "sourceId": "iatdmct_icu",
    "recommendation": "neither_recommend_nor_discourage",
    "exposureKind": "exposure_uncertain",
    "noteFr": "IATDMCT 2020 ne recommande ni ne déconseille son STP systématique. Les marqueurs de toxicité et la fonction rénale ne sont pas une cible sanguine validée.",
    "noteEn": "The 2020 panel neither recommends nor discourages routine TDM. Kidney function and toxicity monitoring are not validated blood exposure targets."
  },
  {
    "id": "ganciclovir",
    "fr": "Ganciclovir",
    "en": "Ganciclovir",
    "aliases": [
      "cymevan"
    ],
    "sourceId": "iatdmct_icu",
    "recommendation": "neither_recommend_nor_discourage",
    "exposureKind": "exposure_uncertain",
    "noteFr": "STP exploré selon le contexte, notamment l'immunodépression ; aucune plage chiffrée générale introduite.",
    "noteEn": "TDM has been explored in selected situations, including immunosuppression; no universal numeric range introduced."
  },
  {
    "id": "valganciclovir",
    "fr": "Valganciclovir",
    "en": "Valganciclovir",
    "aliases": [
      "valcyte"
    ],
    "sourceId": "iatdmct_icu",
    "recommendation": "neither_recommend_nor_discourage",
    "exposureKind": "exposure_uncertain",
    "noteFr": "Promédicament du ganciclovir : les dosages parent/métabolite actif ne sont pas interchangeables.",
    "noteEn": "Ganciclovir prodrug: parent and active-metabolite measurements must not be interchanged."
  },
  {
    "id": "oseltamivir",
    "fr": "Oseltamivir",
    "en": "Oseltamivir",
    "aliases": [
      "tamiflu"
    ],
    "sourceId": "iatdmct_icu",
    "recommendation": "neither_recommend_nor_discourage",
    "exposureKind": "exposure_uncertain",
    "noteFr": "Antiviral discuté ; ne pas assimiler oseltamivir et oseltamivir-carboxylate actif. Absence de cible clinique universelle.",
    "noteEn": "Antiviral discussed; parent oseltamivir and active oseltamivir carboxylate are distinct. No universal clinical target."
  },
  {
    "id": "ribavirin",
    "fr": "Ribavirine",
    "en": "Ribavirin",
    "aliases": [
      "copegus",
      "rebetol"
    ],
    "sourceId": "iatdmct_icu",
    "recommendation": "neither_recommend_nor_discourage",
    "exposureKind": "exposure_contextual",
    "noteFr": "Des études de STP existent, mais le consensus réanimation ne recommande ni ne déconseille le STP systématique pour l'ensemble des indications.",
    "noteEn": "TDM studies exist, but the ICU panel neither recommends nor discourages routine TDM for all indications."
  },
  {
    "id": "pyrazinamide",
    "fr": "Pyrazinamide",
    "en": "Pyrazinamide",
    "aliases": [
      "pza"
    ],
    "sourceId": "ats_tb",
    "recommendation": "selective_tb_tdm",
    "exposureKind": "c2_c6_expert",
    "noteFr": "Tuberculose : dosages ciblés par des experts en cas de malabsorption, échec, toxicité ou interaction ; pas de suivi systématique prouvé.",
    "noteEn": "Tuberculosis: expert-selected measurements for suspected malabsorption, treatment failure, toxicity or interactions; routine use not proven."
  },
  {
    "id": "ethambutol",
    "fr": "Éthambutol",
    "en": "Ethambutol",
    "aliases": [
      "myambutol",
      "emb"
    ],
    "sourceId": "ats_tb",
    "recommendation": "selective_tb_tdm",
    "exposureKind": "c2_c6_expert",
    "noteFr": "Tuberculose : approche STP spécialisée (prélèvements 2 h et 6 h selon contexte) ; ne remplace pas la surveillance clinique/toxicologique.",
    "noteEn": "Specialized tuberculosis TDM (contextual 2 h/6 h sampling); not a substitute for clinical/toxicity monitoring."
  },
  {
    "id": "cycloserine",
    "fr": "Cyclosérine",
    "en": "Cycloserine",
    "aliases": [
      "seromycin"
    ],
    "sourceId": "ats_tb",
    "recommendation": "selective_tb_tdm",
    "exposureKind": "c2_c6_expert",
    "noteFr": "Tuberculose résistante : STP possible dans des circonstances sélectionnées ; cible clinique à vérifier indépendamment.",
    "noteEn": "Drug-resistant tuberculosis: TDM can be considered for selected circumstances; any numeric target requires separate review."
  },
  {
    "id": "rifabutin",
    "fr": "Rifabutine",
    "en": "Rifabutin",
    "aliases": [
      "mycobutin"
    ],
    "sourceId": "ats_tb",
    "recommendation": "selective_tb_tdm",
    "exposureKind": "c2_c6_expert",
    "noteFr": "Rifamycine : STP spécialisé notamment en cas d'interactions ou de malabsorption ; ne pas extrapoler les cibles de rifampicine.",
    "noteEn": "Rifamycin: specialized TDM particularly for interactions or malabsorption; rifampicin targets must not be extrapolated."
  },
  {
    "id": "clarithromycin",
    "fr": "Clarithromycine",
    "en": "Clarithromycin",
    "aliases": [
      "zeclar",
      "klacid"
    ],
    "sourceId": "ats_ntm",
    "recommendation": "selective_ntm_tdm",
    "exposureKind": "peak_selected",
    "noteFr": "Mycobactéries non tuberculeuses : STP parfois envisagé si malabsorption, sous-dosage ou interaction, sans objectif universel.",
    "noteEn": "Nontuberculous mycobacteria: TDM considered for malabsorption, underdosing or interactions, without a universal numeric target."
  },
  {
    "id": "streptomycin",
    "fr": "Streptomycine",
    "en": "Streptomycin",
    "aliases": [
      "streptomycin"
    ],
    "sourceId": "ats_ntm",
    "recommendation": "selective_ntm_tdm",
    "exposureKind": "peak_and_safety",
    "noteFr": "Aminoside : STP à envisager dans les contextes sélectionnés, notamment risque néphro-/ototoxique ; dépend du schéma.",
    "noteEn": "Aminoglycoside: selected TDM especially when nephro-/ototoxicity risk matters; regimen-dependent."
  }
]);
export const additionalSocietyTdmDrugs = Object.freeze(societyTdmDrugRows.map(({id,fr,en,aliases})=>({id,fr,en,aliases})));
/** @param {string} id */
export function societyMonitoringForDrug(id) {
  const item=societyTdmDrugRows.find((drug)=>drug.id===id);
  if(!item) return null;
  return {...item,source:societyMonitoringSources[item.sourceId]};
}
export const societyMonitoringCount = societyTdmDrugRows.length;
export const societyNumericSources = Object.freeze({
  theophyllineDailymed: {
    title:'THEOPHYLLINE ORAL SOLUTION USP · US FDA label, Serum Concentration-Effect Relationship',
    citation:'FDA DailyMed · théophylline (solution orale)',
    url:'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=32b9780f-c46f-4e0f-9641-2cab60600e6e',
    year:2024,organization:'FDA regulatory product label',access: /** @type {'open_full_text'} */ ('open_full_text'),
    evidenceSection:'Serum Concentration-Effect Relationship: general steady-state peak 10–15 mcg/mL; >20 increases adverse event risk; oral solution only',
    verifiedOn:'2026-11-11'
  }
});
export const societyNumericTargets = Object.freeze([{
  id:'theophylline-oral-solution-peak-fda',
  drug:'theophylline', indication:'bronchodilation',
  indicationFr:'Bronchodilatation · solution orale à libération immédiate, adulte',
  indicationEn:'Bronchodilation · immediate-release oral solution, adult',
  metric:'Cmax à l’état stable',unit:'mg/L',
  matrixFr:'Sérum · théophylline totale',matrixEn:'Serum · total theophylline',
  relation:'range',min:10,max:15,status:'regulatory',source:'theophyllineDailymed',
  contextFr:'FDA/DailyMed : intervalle de pic sérique proposé pour la solution orale immédiate. 1 mcg/mL = 1 mg/L. Pas une cible C0, pas une cible pour toutes les spécialités LP. Le dépassement de 20 mg/L est associé à une augmentation des effets indésirables.',
  contextEn:'FDA/DailyMed: suggested peak serum concentration for immediate-release oral solution. 1 mcg/mL = 1 mg/L. Not a trough target or a target for every extended-release product. Adverse effects increase above 20 mg/L.',
  evidenceFr:'Libellé réglementaire FDA : section Serum Concentration-Effect Relationship; approbation pharmacologique humaine indépendante en attente.',
  evidenceEn:'FDA product label: Serum Concentration-Effect Relationship section; independent pharmacologist sign-off pending.',
  analyteId:'theophylline',analyteBasis:'total',matrixId:'serum',
  formulationId:'oral_solution_immediate_release',
  samplingTime:'peak_steady_state_formulation_specific'
}]);
