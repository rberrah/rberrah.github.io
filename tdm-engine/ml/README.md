# Entrainement PopPK + XGBoost de l'AUC24

Ce dossier ne contient aucune donnee patient. Le pipeline entraine un predicteur XGBoost distinct pour chaque couple modele mrgsolve / mode d'administration a partir de profils entierement simules. Il adapte a l'ensemble de la bibliotheque le principe valide pour le tacrolimus par Woillard et al. (doi:10.1016/j.phrs.2021.105578), sans extrapoler cette validation clinique aux autres molecules.

## Principe

Pour chaque patient virtuel, le script :

1. tire les covariables et effets aleatoires dans le domaine defini pour le modele;
2. simule un schema a l'etat stationnaire avec mrgsolve et l'erreur residuelle du modele;
3. simule un C0 pre-dose et une concentration une heure apres la fin de perfusion; pour une administration orale ou un bolus, la fin de perfusion est fixee a 0;
4. calcule l'AUC24 individuelle vraie et l'AUC24 populationnelle du meme schema;
5. entraine XGBoost sur `log(AUC24 vraie / AUC24 populationnelle)`;
6. reconstruit l'estimation par `AUC24 populationnelle * exp(prediction)`;
7. evalue le modele par validation croisee repetee, jeu de test interne non touche et, lorsqu'un autre modele compatible existe, transportabilite PopPK simulee;
8. produit un fond synthetique pour l'explication locale DALEX.

Chaque evaluation rapporte separement le biais et la RMSE relative de l'AUC populationnelle sans ML (`POP_AUC24`) et de l'AUC corrigee par XGBoost. Un artefact ne peut atteindre le niveau interne `research` que si le ML franchit les seuils prespecifies et reduit la RMSE du jeu de test par rapport a cette reference sans ML. Cette comparaison n'est pas une comparaison au MAP-BE, qui necessiterait un ajustement bayesien distinct pour chaque profil simule.

Les variables comprennent les covariables du modele, la dose, l'intervalle, la duree de perfusion, les horaires et concentrations, les predictions populationnelles correspondantes et les rapports observe/predit. Les domaines de dose et d'intervalle sont explicites dans `training-regimens.json`.

Le benchmark compare, sur les memes patients virtuels et le meme jeu de test, deux plans : `C0 seul` et `C0 + C(fin de perfusion + 1 h)`. Pour l'oral et le bolus, le second temps vaut donc 1 h apres la dose. Pour une perfusion intermittente de duree `Tinf`, il vaut `Tinf + 1 h`. Le C0 est simule juste avant la dose suivante. `zero_re(omega)` annule uniquement l'OMEGA interne de mrgsolve; les ETA sont fournis par `idata` et la SIGMA du modele reste appliquee aux concentrations.

La perfusion continue est exclue de cette comparaison : pendant une perfusion en cours, il n'existe ni fin de perfusion dans l'intervalle ni C0 pre-dose. Les artefacts continus restent documentes separement et ne doivent pas etre compares comme s'ils suivaient ce plan.

Ce benchmark ne reproduit pas le protocole de Woillard et al. L'article tacrolimus simulait 9 000 profils riches a l'etat stationnaire, avec neuf doses administrees toutes les 12 h, une concentration toutes les 30 minutes et une AUC0-12 cible. Le modele a deux prelevements utilisait C0 et C3; le modele a trois prelevements utilisait C0, C1 et C3. Dans le jeu de test simule, les RMSE relatives publiees etaient respectivement de 4.60 % et 2.61 %. Le benchmark PMx utilise une AUC24, 1 000 profils par artefact et C0+C1 pour l'oral; ses resultats ne sont donc pas une reproduction de l'article.

Les covariables ne sont jamais tirees dans une plage generique commune a toute la bibliotheque. `training-populations.json` contient les informations propres aux populations sources : bornes, moyenne/ecart-type ou proportions publiees. Une variable positive documentee uniquement par sa moyenne et son ecart-type peut utiliser une loi log-normale ajustee sur ces deux moments; cette hypothese est inscrite dans le fichier. Quand l'article ne documente pas suffisamment la population, la valeur de reference du modele est conservee; le pipeline n'invente pas une plage. Les covariables liees peuvent etre reconstruites conjointement (par exemple la creatinine a partir d'une clairance Cockcroft-Gault cible).

Les covariables dependantes du temps sont maintenues constantes pendant chaque profil simule. Leur trajectoire longitudinale n'est donc pas encore validee par ce benchmark.

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

La publication est refusee en mode `--smoke` ou avec moins de 1 000 profils par couple modele/mode. Pour ajouter un modele, il faut d'abord l'ajouter au catalogue, definir chaque schema d'administration pris en charge dans `training-regimens.json` et documenter sa population dans `training-populations.json`, puis relancer le script sur son identifiant. Aucun fichier patient n'est lu ou ecrit.

## Contrat et niveaux de preuve

Chaque artefact est lie a l'identifiant du modele, la molecule, la voie, le mode d'administration, le schema de variables et l'empreinte SHA-256 exacte du fichier mrgsolve. Le manifeste enregistre egalement la graine, l'effectif, les hyperparametres, les versions logicielles, le domaine d'entrainement et les metriques.

- `experimental` : artefact evalue en interne mais au moins un seuil de performance prespecifie n'est pas atteint;
- `research` : validation croisee repetee et jeu de test interne conformes aux seuils;
- validation clinique : toujours absente tant qu'une validation favorable sur des patients reels independants de la molecule concernee n'est pas documentee.

Une valeur hors du domaine empirique declenche un avertissement sans bloquer l'affichage. Pour l'artefact principal, un C0 pre-dose et une concentration post-dose dans l'intervalle suivant sont requis. L'absence d'etat stationnaire, un mode d'administration incompatible, une empreinte differente ou une AUC invalide restent bloquants. L'explication DALEX utilise exclusivement un echantillon synthetique stocke separement avec sa propre empreinte.

## Fichiers publies

Pour chaque couple modele/mode, `--publish` produit :

```text
artifacts/<modele>-<mode>-c0-post-auc24-xgb-v4.rds
artifacts/<modele>-<mode>-c0-post-auc24-xgb-v4-dalex-background.rds
```

Le premier RDS contient le booster XGBoost. Le second contient au maximum 200 profils synthetiques servant de reference DALEX. `registry.json` est le seul index charge par l'application.
