# Extension TDM : psychiatrie, méthotrexate haute dose et traçabilité CHU
_Revue bibliographique du 10 novembre 2026 · validation scientifique humaine requise_

## Portée de cette branche
Base **empilée** sur la PR #225 (80 molécules, 84 cibles bibliographiques, 31 sources).
Cette extension ajoute :
- **21 antipsychotiques** avec **22 intervalles historiques** provenant du consensus conjoint ASCP/AGNP 2020, table 2 (plus aripiprazole parent vs somme active).
- **Méthotrexate haute dose** : 1 nom recherché, **0 fenêtre thérapeutique ordinaire**, **4 seuils de sécurité contextuels** à H24/H36/H42/H48.
- **Preuve historique de clozapinémies au CHU Limoges**, période 2010–2022, **sans affirmer l'activité actuelle**.

**Total attendu si les PR #225 et suivante sont fusionnées : 102 molécules recherchables, 106 cibles bibliographiques fixes, 32 sources numériques et 41 objectifs antibiotiques conditionnels à la CMI, plus 4 seuils de sécurité HD-MTX à temps fixe.** Le fait qu'une molécule soit recherchable ne veut pas dire qu'elle est actuellement dosée au CHU.

## Antipsychotiques — classification et risque d'obsolescence
- Source primaire : [Schoretsanitis et al. 2020, consensus conjoint ASCP/AGNP](https://doi.org/10.4088/JCP.19cs13169), **tableau 2**, accessible via la [publication PDF](https://www.psychiatrist.com/pdf/blood-levels-to-optimize-antipsychotic-treatment-in-clinical-practice-a-joint-consensus-statement-of-the-american-society-of-clinical-psychopharmacology-and-the-therapeutic-drug-monitoring-task-force/).
- 21 noms : fluphénazine, halopéridol, olanzapine, pérazine, perphénazine, aripiprazole, chlorpromazine, flupentixol, palipéridone, quétiapine, rispéridone, sertindole, ziprasidone, brexpiprazole, chlorprothixène, ilopéridone, loxapine, lurasidone, melpérone, pimozide, asénapine.
- Les intervalles historiques sont **explicitement identifiés 2020** (niveaux AGNP 1 à 4 de l'époque) et un avertissement est visible avant d'ouvrir les détails de chaque carte.
- [Hart et al., AGNP 2026](https://pubmed.ncbi.nlm.nih.gov/42392224/) : 160 molécules, 88 intervalles révisés ; **il serait trompeur de présenter les nombres 2020 comme ceux du consensus 2026** sans recouper son tableau intégral.
- Risperidone **20–60 ng/mL = somme rispéridone + 9-OH-rispéridone** (pas parent seul).
- Aripiprazole **100–350 ng/mL parent** ≠ **150–500 ng/mL somme aripiprazole + déhydroaripiprazole**, note e du tableau 2.
- Flupentixol : intervalle 2020 limité à **l'isomère cis**.
- Toute forme injectable à libération prolongée nécessite de vérifier le calendrier de prélèvement propre au produit. Les risques CYP, tabagisme, inflammation, observance et co-prescriptions modifient l'interprétation.

**Important :** l'extension est éducative. Pour une utilisation clinique, les valeurs 2026 devront remplacer (ou requalifier) ces intervalles après extraction contrôlée. Ce sont des repères bibliographiques, pas une aide automatique à la prescription.

## HD-MTX : sécurité `≠` cible thérapeutique
Source : [consensus européen 2024, tableau 1 §5.2](https://pmc.ncbi.nlm.nih.gov/articles/PMC11446969/), en accord sur les seuils avec [consensus glucarpidase 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC5759822/).

Les quatre seuils de **discussion possible de glucarpidase**, surtout avec dysfonction rénale et contexte compatible, sont **>50 µmol/L H24, >30 H36, >10 H42, >5 H48**, comptés depuis le **début** de la perfusion. Ils ne sont pas des « fenêtres thérapeutiques ». Le protocole (durée et dose), la fonction rénale, la créatinine, la toxicité, l'hydratation, l'acide folinique et l'interférence immunologique après glucarpidase sont essentiels. Les décisions médicales ne sont pas automatisées.

**À ne pas faire** : convertir ces seuils en mg/L sans conserver les unités originales, appliquer aveuglément un chiffre de H36 à H48, utiliser les seuils comme déclencheur isolé de traitement, ni extrapoler au MTX faible dose.

## Couverture documentaire du CHU : état démontré, pas exhaustif
- **36 antibiotiques** explicitement « dosés » dans [PTP PREA 0059 C, 26/05/2026](https://chu-limoges.manuelprelevement.fr/DocumentNew.aspx?idDoc=41157) ; délais et temps de prélèvement documentés. La PR #224 les conserve.
- Le registre [`tdmManualCatalog.js`](../src/lib/content/tdmManualCatalog.js) contient **74 noms** issus de sept documents, dont formulaire d'adaptation de 5 immunosuppresseurs, fiches spécifiques de lithium/valproate, groupe d'antidépresseurs, etc. Tous ne sont **pas** des preuves de réalisation effective au CHU.
- **Clozapine** : [Health Data Hub / CH Esquirol](https://www.health-data-hub.fr/projets/evaluation-du-respect-des-bonnes-pratiques-des-dosages-plasmatiques-de-clozapine-sur-le-ch) signale des dosages réalisés au laboratoire du CHU **entre 2010 et 2022**. Mention d'historique seulement ; vérifier fiche actuelle avant de conclure que le dosage est encore réalisé.
- Le site public du manuel n'offre pas dans notre revue un **export global autorisé et vérifié** de toutes les analyses de pharmacologie. On ne peut donc pas garantir « toutes les molécules dosées au CHU » avec les seuls sept documents précédemment consultés.
- Préparer une extraction **autorisée** (déjà supportée par `scripts/import_tdm_manual_catalog.mjs`) des métadonnées `exam_id;exam_name;source_url;source_updated;discipline;stp_relevant`, puis contrôler manuellement les catégories avant ajout. Pas de scraping automatique.
- Séparer `listed_as_dosed`, `exam_document`, `request_form_only`, `external_referral`, `historically_assayed`, `not_documented`. Ne pas fusionner ces statuts en une certification artificielle « CHU dosé ».

## Contrôles à préserver
1. 106 assertions numériques figées ID/source/relation/bornes et 32 URL/DOI de références ; 4 seuils de sécurité hors de `tdmTargets`.
2. Tous les noms du registre CHU audité restent trouvables, sans créer de cibles fictives.
3. Une différence de matrice, d'analyte ou de metric (C₀ / somme active / AUC / Cmax / H24…) interdit la fusion de deux cibles.
4. Navigation FR/EN, sommaire discret, avertissement 2020, séparation visuelle du HD-MTX.
5. Pas de modification de MIPD Engine ni de prédiction patient.
