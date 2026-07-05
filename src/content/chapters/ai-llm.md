---
id: "ai-llm"
slug: "ai-llm"
title: "Grands modèles de langage (LLM)"
description: "Transformers, attention et prédiction du mot suivant : ce que sont — et ne sont pas — les LLM."
summary: "Comprendre les LLM : tokenisation, attention, prédiction auto-régressive, et usages prudents en pharmacométrie."
track: "ai"
order: 18
duration: "13 min"
level: "intermediate"
tags: ["ai", "llm", "transformer", "nlp"]
slides: []
quiz:
  - prompt: "Un LLM est, à la base, entraîné à..."
    options:
      - "prédire le prochain token à partir des précédents"
      - "résoudre des équations différentielles"
      - "trier des tableaux"
    correct: 0
  - prompt: "Le mécanisme d'attention permet à un token de..."
    options:
      - "pondérer les autres tokens selon leur pertinence"
      - "ignorer tout le contexte"
      - "supprimer des mots au hasard"
    correct: 0
  - prompt: "Un risque majeur d'un LLM en contexte clinique est..."
    options:
      - "l'hallucination (affirmations fausses mais plausibles)"
      - "l'impossibilité de produire du texte"
      - "une vitesse trop faible"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Les **LLM** (ChatGPT, Claude…) transforment l'accès à l'information et l'aide à la rédaction (protocoles, code, synthèses). En pharmacométrie, ils assistent le codage (NONMEM, nlmixr2, R) et la lecture de littérature.

Comprendre leur mécanique évite deux écueils symétriques : la magie et le rejet.
<!-- /step -->

<!-- step:title="Intuition" viz="20_NeuralBox" -->
Un LLM est un **prédicteur du mot suivant** entraîné sur d'immenses corpus. À partir d'un contexte, il estime la distribution du **token** suivant, en tire un, puis recommence — c'est **auto-régressif**.

De cette tâche simple, répétée à très grande échelle, émergent des capacités de raisonnement, de résumé et de code.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="20_NeuralBox" -->
Le cœur du **Transformer** est l'**attention** : chaque token pondère les autres selon leur pertinence.

$$ \text{Attention}(Q,K,V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V $$

:::math
**En clair.** Chaque token est projeté en trois vecteurs : une **requête** $Q$ (« ce que je cherche »), une **clé** $K$ (« ce que j'offre ») et une **valeur** $V$ (« l'information que je porte »). Le produit $QK^\top$ mesure la **pertinence** entre tokens, la **softmax** en fait des poids qui somment à 1, et l'on agrège les $V$ selon ces poids. Le $\sqrt{d_k}$ ne fait que **stabiliser** l'échelle.
:::

L'entraînement minimise la perte de prédiction du token suivant (entropie croisée) :

$$ \mathcal{L} = -\sum_t \log p_\theta(x_t \mid x_{<t}) $$

:::note
Réf. : Vaswani et al., *Attention Is All You Need*, NeurIPS 2017 (Transformer). Pour les fondations (réseaux de neurones), voir **MLU-Explain**, https://mlu-explain.github.io (« Neural Networks »).
:::
<!-- /step -->

<!-- step:title="Exemple concret" -->
Concrètement, un LLM peut **écrire un fichier de contrôle** NONMEM à partir d'une description, **expliquer** un message d'erreur, ou **résumer** un article de PK/PD.

Bien utilisé, il accélère le travail ; mais chaque sortie doit être **vérifiée** — le modèle ne « sait » pas, il complète du texte plausible.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Plausible n'est pas vrai.

:::pitfall
Un LLM peut **halluciner** : inventer une référence, une valeur ou une syntaxe fausse mais crédible. En contexte clinique ou réglementaire, toute information doit être **vérifiée à la source**, et les données patients protégées (confidentialité). Le LLM assiste, il ne décide pas.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Un LLM prédit le token suivant (auto-régressif) ; entraîné à très grande échelle.
- Le Transformer repose sur l'attention : pondérer le contexte selon sa pertinence.
- Usages : aide au code (NONMEM/R), synthèse, explication — toujours à vérifier.
- Risques : hallucinations, confidentialité ; le LLM assiste, il ne décide pas.
<!-- /step -->
