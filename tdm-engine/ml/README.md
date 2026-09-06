# Entrainement PopPK + XGBoost de l'AUC24

Ce dossier ne contient aucune donnee patient. Le pipeline entraine un predicteur XGBoost distinct pour chaque couple modele mrgsolve / mode d'administration a partir de profils entierement simules. Il adapte a l'ensemble de la bibliotheque le principe valide pour le tacrolimus par Woillard et al. (doi:10.1016/j.phrs.2021.105578), sans extrapoler cette validation clinique aux autres molecules.

## Principe

Pour chaque patient virtuel, le script :

1. tire les covariables et effets aleatoires dans le domaine defini pour le modele;
2. simule un schema a l'etat stationnaire avec mrgsolve et l'erreur residuelle du modele;
3. selectionne deux concentrations dans un meme intervalle posologique;
4. calcule l'AUC24 individuelle vraie et l'AUC24 populationnelle du meme schema;
5. entraine XGBoost sur `log(AUC24 vraie / AUC24 populationnelle)`;
6. reconstruit l'estimation par `AUC24 populationnelle * exp(prediction)`;
7. evalue le modele par validation croisee repetee, jeu de test interne non touche et, lorsqu'un autre modele compatible existe, transportabilite PopPK simulee;
8. produit un fond synthetique pour l'explication locale DALEX.

Les variables comprennent les covariables du modele, la dose, l'intervalle, la duree de perfusion, les horaires et concentrations, les predictions populationnelles correspondantes et les rapports observe/predit. Les domaines de dose et d'intervalle sont explicites dans `training-regimens.json`.

Dans l'application, l'AUC24 ML reste separee de l'estimation MAP-BE. Elle ne modifie ni les trajectoires, ni les simulations de doses, ni la recommandation MAP-BE.

## Model averaging

Il n'existe pas d'artefact supplementaire propre au model averaging. Chaque modele selectionne produit son AUC24 ML, puis l'application applique les memes poids d'averaging que pour l'analyse pharmacometrique. L'agregation est disponible uniquement si tous les modeles ajustes disposent d'un artefact compatible et partagent la meme molecule, la meme voie et le meme mode d'administration.

## Utilisation

Depuis `tdm-engine` :

```powershell
# Verification rapide sans publier
Rscript ml/train_models_xgboost.R --smoke --base=all

# Evaluation d'un modele ou d'une molecule
Rscript ml/train_models_xgboost.R --n=1000 --base=vanco_pkjust --mode=IV_INTERMITTENT
Rscript ml/train_models_xgboost.R --n=1000 --drug=Vancomycine

# Entrainement et publication de toute la bibliotheque
Rscript ml/train_models_xgboost.R --n=1000 --base=all --publish --report=ml/validation/all-models.csv
```

Options disponibles :

- `--base=all` ou une liste d'identifiants separes par des virgules;
- `--drug=all`, une cle de molecule ou son nom;
- `--mode=all`, `ORAL`, `IV_INTERMITTENT` ou `IV_CONTINUOUS`;
- `--n=1000` pour l'effectif par couple modele/mode;
- `--seed=20260906` pour reproduire un entrainement;
- `--publish` pour ecrire les RDS et mettre a jour `registry.json`;
- `--report=...csv` pour conserver les metriques synthetiques.

La publication est refusee en mode `--smoke` ou avec moins de 1 000 profils par couple modele/mode. Pour ajouter un modele, il faut d'abord l'ajouter au catalogue et definir chaque schema d'administration pris en charge dans `training-regimens.json`, puis relancer le script sur son identifiant. Aucun fichier patient n'est lu ou ecrit.

## Contrat et niveaux de preuve

Chaque artefact est lie a l'identifiant du modele, la molecule, la voie, le mode d'administration, le schema de variables et l'empreinte SHA-256 exacte du fichier mrgsolve. Le manifeste enregistre egalement la graine, l'effectif, les hyperparametres, les versions logicielles, le domaine d'entrainement et les metriques.

- `experimental` : artefact evalue en interne mais au moins un seuil de performance prespecifie n'est pas atteint;
- `research` : validation croisee repetee et jeu de test interne conformes aux seuils;
- validation clinique : toujours absente tant qu'une validation favorable sur des patients reels independants de la molecule concernee n'est pas documentee.

Une valeur hors du domaine empirique declenche un avertissement sans bloquer l'affichage. Une variable manquante, moins de deux concentrations dans un meme intervalle, l'absence d'etat stationnaire, un mode d'administration incompatible, une empreinte differente ou une AUC invalide restent bloquants. L'explication DALEX utilise exclusivement un echantillon synthetique stocke separement avec sa propre empreinte.

## Fichiers publies

Pour chaque couple modele/mode, `--publish` produit :

```text
artifacts/<modele>-<mode>-auc24-xgb-v3.rds
artifacts/<modele>-<mode>-auc24-xgb-v3-dalex-background.rds
```

Le premier RDS contient le booster XGBoost. Le second contient au maximum 200 profils synthetiques servant de reference DALEX. `registry.json` est le seul index charge par l'application.
