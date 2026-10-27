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

## Extension auditée avant fusion

La même logique expérimentale est maintenant appliquée aux autres notions IA sans transformer une illustration en résultat ajusté :

- `20_NeuralBox` distingue domaine illustré d'apprentissage et extrapolation, avec une sonde temporelle et une dérive volontairement construite hors domaine ;
- `41_SVMMargin` permet de modifier la séparation des classes ;
- `42_VarImportance` montre l'instabilité de l'importance entre deux variables corrélées au fil d'ajustements synthétiques ;
- `63_ClusterPCA` compare groupes simulés, k-means et projection PCA, avec ou sans standardisation ;
- `64_RMT` permet de retirer un échantillon et montre que le nombre de valeurs propres au-dessus du seuil nul n'est pas nécessairement le nombre de facteurs injectés ;
- `47_TokenAttention` fait varier le token requête et la tête illustrative, en rendant visible le masque causal. Les poids sont explicitement construits et ne sont ni extraits d'un LLM ni présentés comme une explication causale.

Les chapitres IA et le parcours pharmacométrique fondamental ont été relus en français et en anglais. Les corrections portent notamment sur les limites de l'extrapolation, l'importance non causale, les EBE et le shrinkage, la différence entre microconstantes et paramétrisation clairances-volumes, l'interprétation des VPC et l'incertitude d'une estimation MAP. Toute version textuelle ou visuelle modifiée reste marquée `review_pending` jusqu'à une nouvelle validation humaine.

## Suites éventuelles, après évaluation utilisateur

1. **Régression + fonction de perte** : ajuster manuellement pente/interception, comparer MSE et lancer une optimisation. Relier ensuite aux erreurs de prédiction d'AUC, sans assimiler régression simple et PK non linéaire.
2. **Validation et fuite de données** : distinguer validation d'hyperparamètres, test final verrouillé et validation externe multicentrique au-delà de la comparaison actuelle lignes/patients/centre.
3. **Modèle hybride PopPK–ML** : comparaison pédagogique sur un jeu synthétique commun, avec métriques séparées, incertitude et prudence vis-à-vis de l'extrapolation. Ne pas prétendre comparer la performance clinique à partir de simulations ad hoc.

## Critères avant fusion

- [x] `npm run validate`, `npm run check`, `npm run build`, `npm run test:pmx`
- [x] Tests Playwright desktop/mobile, clavier, thème sombre et absence de débordement ; tests ciblés des nouvelles interactions IA
- [x] Absence de dépendance distante et de données patient, contrôlée par la suite PMx
- [x] Les expériences distinguent explicitement score d'apprentissage, test interne et domaine externe, et ne revendiquent pas une amélioration clinique
- [ ] Revue scientifique et pédagogique humaine des contenus marqués `review_pending`
