# Contrat préparatoire : Cibles TDM → MIPD Engine (projet futur)

Statut : **proposition d'interface, non implémentée dans MIPD Engine**. Le guide PMx Explain demeure un référentiel bibliographique pédagogique ; aucun avis clinique ni calcul de dose n'est déclenché.

## Séparation des responsabilités
- **PMx Explain / Cibles TDM** : catalogue versionné, molécules, identifiants d'analytes, cibles documentées, sources, contexte, hiérarchie de preuves et historique d'audit. Aucune donnée patient.
- **MIPD Engine (repo autonome)** : modèles PK, estimation bayésienne, concentrations/AUC prédites, incertitude, préanalytique de l'échantillon. Il doit rester indépendant de PMx et ne jamais importer le code UI.
- **Adaptateur futur** : importer un **snapshot JSON immutable** du catalogue avec SHA/dated version et produire une interprétation **conditionnelle**. Interdit d'utiliser directement la première valeur d'une recherche textuelle.

## Schéma minimal de sélection d'une cible
```json
{
  "schema": "pmx.tdm.interpretation.v1",
  "reference_version": "SHA immuable du référentiel",
  "drug_id": "tac",
  "formulation": "IR | once_daily | other | unknown",
  "indication": "kidney",
  "time_after_transplant": {"value": 3, "unit": "month"},
  "regimen": {"co_medications": ["mpa"], "dose_schedule": "q12h"},
  "analyte": "tacrolimus",
  "analyte_basis": "parent | active_moiety | free | total",
  "matrix": "whole_blood",
  "assay_method": "LC-MS/MS",
  "metric": "AUC0-12",
  "sample_time_from_dose_h": null,
  "observed_value": null,
  "observed_unit": "ng*h/mL",
  "patient_context_available": false,
  "evidence_id": "tac-kidney-mid-auc",
  "output_mode": "educational_only"
}
```

**Ce JSON est uniquement un exemple contractuel ; aucun résultat patient réel ne doit être déposé ici.**

## Contraintes bloquantes du futur moteur
1. Associer par **identifiant stable** et non par texte libre ou nom commercial.
2. Exiger correspondance indication, population, formulation, co-traitements, analyte, fraction libre/totale, matrice, méthode, unité, métrique et fenêtre temporelle ; si une donnée critique manque : **`not_interpretable`**, avec justification.
3. Séparer `therapeutic_target`, `regimen_specific_study_target`, `microbiology_pkpd_target`, `toxicity_alert`, `delayed_elimination_signal`. Ne jamais employer un signal toxicologique comme borne supérieure d'une fenêtre thérapeutique.
4. Distinguer valeur mesurée C₀, valeur AUC estimée et AUC cible. **Une mesure C₀ n'est jamais une AUC** ; transformation uniquement par un modèle PK qualifié, avec incertitude et conditions documentées.
5. Calculer automatiquement selon CMI uniquement si l'indice est correct (fT>CMI, fAUC/CMI, etc.), la CMI de référence et la fraction libre sont connues. Ne pas attribuer un ratio de clairance ou une dose à partir de la seule CMI.
6. Journaliser le SHA du catalogue, cible, citation précise, statut et date de revue ; signaler les consensus plus récents non encore recoupés (AGNP 2026).
7. **Pas d'ajustement posologique ni d'avis patient** sans validation réglementaire, analytique et clinique correspondant à l'usage voulu.

## Flux suggéré (sans couplage monolithique)
`PMx targets curated` → `audit/value-source locks` → `versioned JSON snapshot` → `independent MIPD adapter` → `model-derived exposure + provenance` → `contextual comparison or not_interpretable`.

Régime de licence du référentiel : liens et métadonnées bibliographiques uniquement ; pas de reproduction intégrale des RCP ou des tables sous droit d'auteur. Les entrées historiques doivent rester datées.

## Préconditions à l'implémentation
- Export CHU autorisé et réconcilié, preuves de dosage distinguées de formulaires.
- Contrôle humain de toutes les valeurs des recommandations récentes.
- Un identifiant de dose/formulation/voie par modèle MIPD Engine et une cartographie explicite des molécules.
- Décision ultérieure sur l'usage : **enseignement/recherche** seulement vs dispositif d'aide clinique. Cette dernière option impose une évaluation séparée ; le présent chantier n'implique pas un marquage CE.


## Extension PK/PD pour l'interface future (PR #228)

La nouvelle matrice `src/lib/content/tdmPharmacologyProfiles.js` contient un enregistrement pour chacun des **132 identifiants canoniques**. Elle distingue :
- `index.key` : critère PK/PD ou type d'exposition pertinent (`fT_MIC`, `AUC24_MIC`, `AUC_interval`, `Cmin`, `Cmax_reference`, `time_indexed`, `unknown`).
- `practical.key` : prélèvement effectivement utilisable (`Cmin`, `auc_bayesian`, `Cmin_or_Css`, `peak_and_late`, etc.).
- `administration.codes` : voies du contexte documenté, à confronter au RCP de la **spécialité/formulation** ; `scope` distingue schéma d'étude vs autorisation réglementaire. `modeFr/modeEn` explique perfusion continue/intermittente, libération immédiate/prolongée, dose de charge et autres modalités.
- `proportionality.kind` : `conditional_linear`, `nonlinear`, `complex`, `unassessed` ; `directRatioPermitted = false` **pour toutes les molécules**.
- Sources bibliographiques **distinctes par dimension** (indices, prélèvements, voie, dose–AUC).

La future intégration doit lire un **snapshot figé et versionné** de ces valeurs, mais **ne jamais traduire `conditional_linear` en multiplicateur automatique de dose**. Un modèle MIPD qualifié doit estimer la clairance/biodisponibilité et respecter le contexte, les interactions, la voie, les horaires réels et l'incertitude. En présence de données insuffisantes, retourner `not_interpretable`.

Le changement de forme ou de voie (ex. tacrolimus LI → LP, MPA gastro-résistant versus MMF IV, antipsychotique injectable LP versus oral) exige une vérification de l'interchangeabilité pharmacocinétique indépendante du référentiel de cibles.

**Statut** : contrat préparatoire uniquement, sans ajout de calcul, d'API ni de fonctionnalité d'interprétation patient dans MIPD Engine.
