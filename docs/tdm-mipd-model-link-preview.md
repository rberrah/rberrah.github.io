# Prototype non fusionné : export TDM Guide pour l'inventaire MIPD Engine

**Statut : DRAFT / à ne pas fusionner ni déployer.** Cette branche doit rester distincte de la pile #225–#234. Elle ne déclenche aucune liaison UI ou patient.

## Rôle

Le guide demeure la **source de vérité des recommandations STP** (154 médicaments, 141 références chiffrées et objectifs PK/PD selon la CMI sur la branche de travail). La bibliothèque MIPD demeure la **source de vérité des 46 modèles PK**.

`node scripts/export_tdm_model_references.mjs --output /tmp/pmx-tdm-preview.json`
produit une copie JSON déterministe, datable par son SHA256, contenant une entrée pour **chaque molécule du guide**, ses recommandations d'indices/expositions, ses cibles et objectifs contextuels et ses sources. Tous les enregistrements numériques gardent `interpretationAllowed:false`, `automaticDoseAdjustmentAllowed:false` et `humanSignoff:PENDING`.

L'export **n'attribue jamais une seule cible universelle** à une molécule. Les cibles restent des candidats contexte-spécifiques : indication, période de greffe, formulation, voie, matrice, fraction libre/totale, prélèvement, CMI et autres contraintes devront être validés plus tard.

L'absence de référence chiffrée donne un tableau `targets:[]` mais conserve la recommandation bibliographique (indice PK/PD, prélèvement, études citées) si disponible. Aucun nom de modèle MIPD n'est présent dans cet export. L'intégration bilatérale devra associer les identifiants *hors de PMx*, côté adaptateur MIPD, et vérifier le SHA et la qualification.

## Refus de fusion avant décision ultérieure

- Aucune injection dans `/cibles-tdm/`, `/tdm/`, ni dans Shiny.
- Aucune sélection auto d'une plage thérapeutique pour un patient.
- Aucune API réseau, ni patient, ni calcul de dose.
- Une PR ultérieure de MIPD Engine peut charger ce **snapshot préfabriqué** depuis un chemin local explicite et afficher 46 cartes de recommandations en mode bibliographique seulement.
- Mise à jour après validation des modèles supplémentaires Limoges : c'est le `models/catalog.json` de MIPD qui doit piloter le nombre de fiches, et la mise en correspondance des identifiants canoniques devra être explicitement revue.

Contrôles : `node scripts/test_tdm_model_export_preview.mjs`.
