// Independently authored, beginner-friendly explanations for selected course checkpoint quizzes.
// Explanations are keyed by chapter slug and the original question index; questions may be shuffled for display.
export const quizRationales = {
  'ai-trees': [
    {
      fr: "Chaque feuille d'un arbre donne une valeur fixe : la prédiction change par paliers quand on change de groupe.",
      en: "Each tree leaf gives a fixed value: the prediction changes in steps as you move between groups."
    },
    {
      fr: "Plusieurs arbres apprennent sur des données légèrement différentes. Leur moyenne peut réduire certaines erreurs, contrairement à un arbre unique toujours plus profond.",
      en: "Different trees learn from slightly different data. Their average can reduce some errors, unlike making one single tree ever deeper."
    },
    {
      fr: "L'importance indique quelles variables aident le modèle à prédire. Elle ne prouve pas qu'une variable cause le résultat.",
      en: "Importance shows which variables help the model predict. It does not prove that a variable causes the outcome."
    }
  ],
  'ai-boosting': [
    {
      fr: "Le boosting ajoute de petits arbres l'un après l'autre : chaque étape essaie de réduire les erreurs du modèle déjà construit.",
      en: "Boosting adds small trees one after another: each step tries to reduce the errors made by the current model."
    },
    {
      fr: "XGBoost ajoute des limites à la complexité du modèle (régularisation) et utilise aussi la courbure de l'erreur pour choisir les corrections.",
      en: "XGBoost limits model complexity (regularization) and also uses the curvature of the error to choose corrections."
    },
    {
      fr: "CatBoost est conçu pour bien traiter des catégories, par exemple un centre ou une formulation, sans leur donner artificiellement un ordre numérique.",
      en: "CatBoost is designed to handle categories such as center or formulation without inventing a numerical order between them."
    }
  ],
  'ai-ml-tdm': [
    {
      fr: "Un modèle ML peut relier quelques concentrations prélevées à une estimation de l'AUC. Il ne remplace pas automatiquement les prélèvements ou la validation clinique.",
      en: "An ML model can link a few measured concentrations to an AUC estimate. It does not automatically replace sampling or clinical validation."
    },
    {
      fr: "Un modèle hybride garde les connaissances du modèle pharmacocinétique et utilise le ML pour compléter ce qu'il explique moins bien.",
      en: "A hybrid model keeps the pharmacokinetic model's knowledge and uses ML to complement what it explains less well."
    }
  ]
};
