# Parcours IA — apprentissage par l'expérience (pilote)

## Inspiration, sans reproduction

- [Nablab](https://nablab.tanguy-pauwels.fr/) : commencer par une manipulation concrète et relier l'observation aux équations.
- [MLU-Explain](https://mlu-explain.github.io/) : essais visuels interactifs, retour immédiat et progression conceptuelle.
- Les exemples et le code de PMx Explain restent originaux, locaux, statiques, bilingues et centrés sur la pharmacométrie.

## PR pilote — déjà implémenté

Réutilisation du composant 40_TreeEnsemble dans les chapitres **arbres**, **boosting** et **ML pour le TDM**, avec une seule occurrence par chapitre. Le profil à prédire peut être déplacé hors de la plage apprise pour rendre l'extrapolation visible. Aucun changement d'architecture, de navigation ou de backend.

Le composant 46_ValidationSplit complète le chapitre **ML pour le TDM** : le même modèle est évalué après séparation par lignes, patients ou centre externe, sur des données synthétiques avec mesures répétées.

| Geste | Ce que voit l'étudiant | Ce qu'il doit comprendre |
| --- | --- | --- |
| 1. Expérimenter | Changer arbre/bagging/boosting, profondeur/nombre d'arbres, animation de l'ajustement | L'algorithme et sa complexité déterminent la forme des prédictions |
| 2. Observer | RMSE apprentissage puis révélation volontaire de points test internes | Un meilleur score d'apprentissage ne suffit pas à démontrer la généralisation |
| 3. Comprendre | Explication contextuelle avec hypothèses et limites par méthode | CART = partition, bagging 1D = moyenne bootstrap, boosting quadratique = correction séquentielle des résidus |

Garde-fous : données synthétiques déterministes (44 train + 16 test), séparation stricte du test, aucun résultat clinique ou validation externe revendiqués, avertissement sur le biais dû à l'usage répété du test pour régler le modèle, réglages accessibles au clavier, animation désactivable par prefers-reduced-motion.

**Point méthodologique :** dans cette démonstration à une seule covariable, le mode bagging n'effectue pas de sous-échantillonnage de variables. Il n'implémente donc pas la forêt aléatoire multidimensionnelle complète. Le mode boosting illustre la perte quadratique et des arbres CART peu profonds, pas les optimisations spécifiques de XGBoost ou CatBoost.

**Relecture** : marquer 40_TreeEnsemble en pending jusqu'à revue scientifique et pédagogique par l'auteur, puis exécuter npm run review:seal -- 40_TreeEnsemble et npm run viz:inventory.

## Suite éventuelle — PR séparées et conditionnées à l'évaluation du pilote

1. **Régression + fonction de perte** : ajuster manuellement pente/interception, comparer MSE et lancer une optimisation. Relier ensuite aux erreurs de prédiction d'AUC, sans assimiler régression simple et PK non linéaire.
2. **Validation et fuite de données — première étape implémentée** : la séparation par lignes, patients et centre est interactive. Une suite éventuelle pourra distinguer validation d'hyperparamètres, test final verrouillé et validation externe multicentrique.
3. **ACP et phénotypes** : déplacer les axes de projection et quantifier la variance conservée ; discuter standardisation et risques d'interprétation de groupes sur EBE.
4. **Modèle hybride PopPK–ML** : comparaison pédagogique sur un jeu synthétique commun, avec métriques séparées, incertitude et prudence vis-à-vis de l'extrapolation. Ne pas prétendre comparer la performance clinique à partir de simulations ad hoc.

## Critères avant fusion

- [ ] npm run validate, npm run check, npm run build, npm run test:science
- [ ] Revue manuelle FR/EN, clavier, mobile, contraste clair/sombre, réduction du mouvement
- [ ] Vérifier l'absence de dépendance distante et de données patient
- [ ] Revue de l'hypothèse pédagogique : l'étudiant peut expliquer pourquoi une diminution de RMSE sur train n'implique pas une amélioration sur test
