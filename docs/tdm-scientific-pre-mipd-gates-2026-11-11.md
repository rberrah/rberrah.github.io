# Verrous scientifiques du TDM Guide avant MIPD Engine
_Dossier de qualification – 11 novembre 2026 · données de recherche/enseignement, non recommandations patient_

## État du périmètre

Le catalogue **132 molécules** est un index bibliographique, non l’inventaire exhaustif des dosages actifs au CHU Limoges. Les **74 médicaments retrouvés dans 7 documents publics CHU** sont des apparitions documentaires ; ne pas confondre « listé dans un protocole », « mentionné sur un formulaire » et « effectivement dosé en interne aujourd’hui ». Le manuel institutionnel complet ne peut pas être remplacé par une extrapolation de ces listes.

La revue priorise, par condition clinique comparable : **sociétés savantes (SFT, SFPT, IATDMCT, consensus spécialisés) → RCP ANSM/EMA/FDA → travaux du laboratoire de Limoges → autres publications**. Cela ne signifie pas qu’un document plus ancien ou moins spécifique surclasse un consensus plus récent et contextuel. Chaque chiffre doit provenir de la section citée, jamais d’un simple article sur le STP.

## Corrections apportées par la PR #230

### P0 — Interdire les regroupements analytiques non sûrs
La fonction `groupTdmReferenceEntries()` utilise l’identité **médicament, indication, libellés, métrique, unité, matrice, analyte, base libre/totale, formulation, méthode et horaire**. Lorsqu’une dimension documentée diffère, les références restent deux cartes, pas une fausse « source alternative » d’une cible interchangeable.

**Limite restante** : les catalogues historiques contiennent encore principalement de l’information *libre* (phrase sur analyte/voie), pas systématiquement les champs sémantiques `analyteId`, `formulationId`, `assayMethod`, etc. La sécurité complète exige de les remplir/valider pour les **140 références** (131 historiques, 9 AGNP 2026) avant toute correspondance automatique. Une dimension absente n’est jamais une preuve d’équivalence.

### P0 — AGNP 2026 : audit plutôt que remplacement aveugle
[Hart et al., AGNP 2026](https://pubmed.ncbi.nlm.nih.gov/42392224/), publié le **2 juillet 2026**, rapporte **160 références**, dont **30 médicaments ajoutés** et **88 plages révisées** ; il propose également une formule pour les concentrations attendues sous dose recommandée. Ce total est celui de la publication, **pas** un nombre de molécules dont nous aurions vérifié les nouvelles plages.

L’article ne peut être utilisé pour attribuer numériquement une cible avant d’avoir vérifié **le tableau individuel, l’analyte, l’état stable, l’horaire, l’indication, la matrice et le niveau de recommandation**. La commande :

`node scripts/report_tdm_agnp_2026.mjs --json`

produit la liste structurée des anciennes références 2018/2020/2025 présentes dans le guide pour **réconciliation primaire**. Chaque fiche concernée présente un avertissement avec source PubMed. Aucune valeur AGNP 2026 n’a été ajoutée automatiquement. **Complément PR #231 :** neuf valeurs ont été transcrites après lecture manuelle du tableau 5, avec indication, analyte et temps, tout en conservant les données historiques. Elles restent **non approuvées pour une interprétation clinique**. Voir [la réconciliation primaire](tdm-agnp-2026-primary-reconciliation-2026-11-11.md).

### P1 — Proportionnalité dose–AUC
La relation `AUCτ = F × dose / CL` ne suffit pas à autoriser un calcul posologique individuel. Une preuve d’exposition proportionnelle doit spécifier **la dose/plage, la voie, la formulation, la population, l’état stable ou la dose unique, CL/F et la fraction libre/totale**. Les cas de voriconazole, phénytoïne, valproate et gabapentine démontrent les pièges d’extrapolation.

### P1 — Antibiotiques / CMI
Les références numériques pour l’infection doivent être explicitement associées à `fT>CMI`, `fAUC/CMI`, `Cmax/CMI`, à la fraction libre, et à la définition/l’incertitude de la **CMI**. Vancomycine AUC24 400–600 mg·h/L dans le SARM invasif **suppose CMI = 1 mg/L en microdilution** ; hors de cette hypothèse, le moteur doit retourner **`not_interpretable`** en l’absence d’une autre référence qualifiée, pas appliquer la même fenêtre.

## Pilote « lecture seule » MIPD : trois références, aucun résultat patient

`node scripts/export_tdm_pilot_snapshot.mjs --json`

produit un JSON **déterministe avec SHA-256** en **lecture seule**, incluant :
1. **Tacrolimus** `tac-kidney-mid` : C0 5–7 ng/mL issue d’une **étude/protocole de centre**, exclusivement greffe rénale 6 semaines–6 mois, formulation immédiate. **Ce n’est pas une recommandation nationale.**
2. **MPA total** `mpa-kidney-auc` : AUC0–12 30–60 mg·h/L, greffe rénale ; ne pas assimiler MPA total/plasma à MPA libre ni à une C0.
3. **Vancomycine** `vancomycin-mrsa` : AUC24 400–600 mg·h/L en infection grave invasive à SARM ; **CMI=1 mg/L par microdilution supposée**, pas une cible pour toute infection.

Les chiffres proviennent **directement des objets de référence existants**, non d’une base copiée et modifiable indépendamment. Le JSON porte `clinicalInterpretationAllowed:false`, `automaticDoseAdjustmentAllowed:false`, `modelMapping:UNMAPPED`, `status:not_interpretable`, version, URLs originales et conditions de prélèvement à vérifier. Aucun patient ni dose simulée n’est inclus.

Cette commande **n’exporte pas de modèle ni de patient**. Elle ne publie aucun endpoint clinique et n’introduit aucune modification dans le dépôt autonome `rberrah/MIPD-Engine`. Elle n’implémente pas de correspondance entre modèles MIPD et références TDM.

## Critères d’acceptation avant couplage

- **Cibles** : chaque référence du sous-ensemble validé a un statut `human_approved`, un reviewer, une date, une section primaire contrôlée, une indication, un analyte, une matrice, une unité, une méthode de dosage et un prélèvement.
- **Sources** : confrontation AGNP 2026 des psychotropes/antiépileptiques au cas par cas, sans cacher les anciennes valeurs ; export CHU institutionnel autorisé pour déclarer un dosage *actuel*.
- **MIPD** : identifiant stable du médicament **et** du modèle PopPK validé, formulation, voie, analyte et unités de sortie testés. Le moteur, le site et le catalogue demeurent autonomes et épinglent des versions immuables.
- **Échec sûr** : mauvais analyte, fraction libre/totale, unité, phase de distribution, CMI, voie, RCP ou modèle : **`not_interpretable`** avec justification ; jamais un intervalle par simple similitude de nom.
- **Intégration initiale** : comparaison documentaire de l’exposition calculée **uniquement** après validation humaine du sous-ensemble, sans adaptation de dose automatique.

Aucune de ces étapes ne constitue une qualification clinique ou réglementaire du dispositif ; l’usage envisagé reste scientifique, pédagogique et de recherche.


## Verrou de comparabilité sans métadonnées analytiques complètes (11/11/2026)

Le correctif `groupTdmReferenceEntries()` distingue désormais `alternatives` (six dimensions structurées et identiques) et `relatedReferences` (sources affichées dans le même contexte de recherche **sans preuve d'équivalence**). Une dimension inconnue, même inconnue dans les deux documents, ne rend **jamais** ces sources automatiquement interchangeables. Chaque référence non qualifiée affiche une alerte bilingue explicite à l'ouverture des détails ; toutes les cartes chiffrées sans approbation signée portent également un avis de validation pharmacologique en attente.

Les six dimensions exigées sont `analyteId`, `analyteBasis`, `matrixId`, `formulationId`, `assayMethod`, `samplingTime`. Les tests synthétiques vérifient chacune de ces dimensions, y compris deux valeurs manquantes identiques et le cas « une valeur connue / une inconnue ». Cela corrige le risque antérieur `null === null` sans perdre l'accès aux sources bibliographiques secondaires.

**Important** : ce correctif technique ne fournit aucune validation humaine pharmacologique ; les chiffres historiques et AGNP restent non approuvés pour une interprétation clinique. Un lecteur MIPD ne doit jamais consommer les entrées de `relatedReferences` comme des alternatives thérapeutiques.
