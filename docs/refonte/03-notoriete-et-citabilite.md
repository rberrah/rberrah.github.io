# Stratégie de notoriété scientifique — Racym Berrah

**Principe directeur.** Le nom n'est pas mis en avant : il est rendu *récupérable*. Sur dix ans, ce qui associe durablement un nom à un contenu n'est pas la répétition du nom mais la présence, sur chaque objet, des métadonnées qui permettent à un tiers — lecteur, enseignant, moteur, outil bibliométrique — de le citer sans effort et sans ambiguïté. Tout ce qui suit découle de cette phrase : on outille la citation, on n'appelle pas à citer.

**Note préalable sur les chiffres.** Les volumes annoncés dans le brief ne correspondent pas exactement au disque. Comptage effectué ce jour dans les trois dépôts :

| Site | Chapitres FR (.md) | Chapitres EN | Visualisations (.svelte) | Dépôt |
|---|---|---|---|---|
| Pharmacométrie Pratique | 88 (+1 route dédiée `etat-equilibre`) | 88 | 63 | `rberrah/rberrah.github.io` |
| Internat Pharma | 186 | — | 30 | `rberrah/internat` |
| Stat & Biologie | 45 | — | 10 | `rberrah/stats` |
| **Total** | **319–320** | **88** | **103** | 3 dépôts |

Le brief dit 89 / 187 / 46 et 322. L'écart est de 1 par site (probablement les `_TEMPLATE.md` ou une route codée en dur). Puisque toute la stratégie repose sur « des chiffres plutôt que des adjectifs », **ces chiffres doivent être produits par un script de comptage exécuté au build**, jamais saisis à la main. Un chiffre faux sur une page de positionnement scientifique coûte plus cher que pas de chiffre du tout. Tant que le script n'existe pas, écrire « plus de 300 chapitres » et « une centaine de visualisations ».

---

## 1. Architecture d'attribution

### 1.1 La règle de partage : attribution vs auto-promotion

La distinction n'est pas une question de ton, c'est une question de fonction. Test opérationnel, à appliquer à chaque élément :

> **Si je supprime cet élément, une citation correcte devient-elle impossible ou ambiguë ?**
> — Oui → c'est de l'**attribution**. On la garde, on la standardise, on l'automatise.
> — Non, cela réduirait seulement la visibilité → c'est de la **promotion**. On la supprime.

Corollaires directement applicables :

| Élément | Statut | Motif |
|---|---|---|
| Nom d'auteur en tête de chapitre | Attribution | Sans lui, la citation est anonyme |
| `<meta name="author">`, JSON-LD `author` | Attribution | Lisible par machine, invisible pour le lecteur |
| Bloc « Comment citer cette page » | Attribution | Réduit le coût de citation à un clic |
| Date de publication + date de révision | Attribution | Champ obligatoire de toute référence |
| Lien ORCID | Attribution | Désambiguïse l'homonymie, à vie |
| Photo en page d'accueil | Promotion | N'entre dans aucune référence |
| Nom dans le `<title>` des chapitres | Promotion | Le titre doit décrire le contenu |
| Nom répété dans le corps du texte | Promotion | Aucune fonction bibliographique |
| Bandeau « partagez ce cours » | Promotion | Demande faite au lecteur |
| Compteur de vues, de lecteurs, d'abonnés | Promotion | Ne sert aucune citation |

**Règle de densité :** une seule occurrence visible du nom par écran. En tête de chapitre (ligne de signature), puis plus rien jusqu'au pied de page. Le nom du site reste celui du **contenu** (« Pharmacométrie Pratique », « Internat Pharma », « Stat & Biologie »), jamais celui de la personne — le portail conserve son titre actuel, mais on remplace `R. Berrah` par une formulation neutre de rôle, le nom complet étant porté par la page `/a-propos` et par les métadonnées.

### 1.2 Signature en tête de chapitre — micro-texte exact

Une seule ligne, sous le titre et le sous-titre, en corps réduit et en couleur secondaire. Le nom est un lien vers `/a-propos/`. L'iD ORCID est un lien externe portant l'icône ORCID en 14 px.

**FR :**

```
Racym Berrah  ⟨iD⟩  ·  Publié le 12 mars 2026  ·  Révisé le 9 juillet 2026  ·  CC BY-SA 4.0
```

**EN :**

```
Racym Berrah  ⟨iD⟩  ·  Published 12 March 2026  ·  Revised 9 July 2026  ·  CC BY-SA 4.0
```

Balisage recommandé (le `reviewed_on` du frontmatter existe déjà ; il faut lui adjoindre un `published_on`) :

```svelte
<p class="chapter-byline">
  <a href="{base}/a-propos/" rel="author">Racym Berrah</a>
  <a href="https://orcid.org/0009-0001-6432-2880" rel="me noopener"
     aria-label="ORCID de Racym Berrah"><svg class="orcid-icon" …/></a>
  <span aria-hidden="true">·</span>
  <span>Publié le <time datetime={chapter.published_on}>{fmt(chapter.published_on)}</time></span>
  <span aria-hidden="true">·</span>
  <span>Révisé le <time datetime={chapter.reviewed_on}>{fmt(chapter.reviewed_on)}</time></span>
  <span aria-hidden="true">·</span>
  <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr" rel="license">CC BY-SA 4.0</a>
</p>
```

Ce que cette ligne fait : elle rend disponibles, en une ligne, les quatre champs d'une référence (auteur, titre — déjà au-dessus —, date, source) et l'identifiant pérenne. Ce qu'elle ne fait pas : elle ne qualifie pas l'auteur (pas de « Dr », pas de « doctorant », pas de laboratoire). Le titre et l'affiliation appartiennent à `/a-propos/` et aux données structurées, pas à 320 en-têtes.

### 1.3 Bloc « Comment citer cette page » — micro-texte exact

Placement : pied de chapitre, **avant** les références bibliographiques, après le quiz et les exercices. Composant unique `<CiteThis />` alimenté par le frontmatter.

**Version FR affichée :**

> ### Comment citer cette page
>
> Berrah, R. (2026). *Bayes et estimations individuelles (EBE)*. Pharmacométrie Pratique. https://rberrah.github.io/pharmacometrie/chapitres/bayes-ebes/
>
> `[ Copier APA ]` `[ Copier BibTeX ]`
>
> Ce chapitre fait partie de : Berrah, R. (2026). *Pharmacométrie Pratique* (version 2026.1) [ressource pédagogique en ligne]. Zenodo. https://doi.org/10.5281/zenodo.XXXXXXX

**Version EN affichée :**

> ### How to cite this page
>
> Berrah, R. (2026). *Bayesian individual estimates (EBE)*. Practical Pharmacometrics. https://rberrah.github.io/pharmacometrie/en/chapters/bayes-ebes/
>
> This chapter is part of: Berrah, R. (2026). *Practical Pharmacometrics* (version 2026.1) [online educational resource]. Zenodo. https://doi.org/10.5281/zenodo.XXXXXXX

**BibTeX exact copié par le bouton** (entrée `@misc`, compatible BibTeX et biblatex ; clé `nom_motclé_année`) :

```bibtex
@misc{berrah_bayes_2026,
  author       = {Berrah, Racym},
  title        = {Bayes et estimations individuelles ({EBE})},
  howpublished = {Pharmacom\'etrie Pratique},
  year         = {2026},
  month        = {7},
  url          = {https://rberrah.github.io/pharmacometrie/chapitres/bayes-ebes/},
  urldate      = {2026-08-04},
  note         = {Version 2026.1. Corpus archiv\'e : \url{https://doi.org/10.5281/zenodo.XXXXXXX}},
  keywords     = {pharmacometrics, bayesian estimation, MAP, TDM}
}
```

Variante `biblatex` (à proposer en second onglet si les utilisateurs le demandent — ne pas multiplier les formats d'emblée) :

```bibtex
@online{berrah_bayes_2026,
  author       = {Berrah, Racym},
  title        = {Bayes et estimations individuelles (EBE)},
  organization = {Pharmacométrie Pratique},
  date         = {2026-07-09},
  url          = {https://rberrah.github.io/pharmacometrie/chapitres/bayes-ebes/},
  urldate      = {2026-08-04},
  version      = {2026.1},
  doi          = {10.5281/zenodo.XXXXXXX}
}
```

**Citation du corpus entier** (page `/citer/`, une par site) :

```
APA    Berrah, R. (2026). Pharmacométrie Pratique (version 2026.1)
       [Ressource pédagogique en ligne]. Zenodo.
       https://doi.org/10.5281/zenodo.XXXXXXX

BibTeX @misc{berrah_pharmacometrie_2026,
         author    = {Berrah, Racym},
         title     = {Pharcom\'etrie Pratique},
         year      = {2026},
         version   = {2026.1},
         publisher = {Zenodo},
         doi       = {10.5281/zenodo.XXXXXXX},
         url       = {https://rberrah.github.io/pharmacometrie/}
       }
```

**Trois points techniques qui comptent :**

1. **APA 7 et la date de consultation.** APA n'exige `urldate` que pour un contenu « conçu pour changer » et non archivé. Puisque chaque chapitre porte une date de révision explicite et que le corpus est archivé sous DOI versionné, la date de consultation est facultative. On l'inclut néanmoins dans le BibTeX (champ `urldate`) parce que c'est le comportement attendu par les relecteurs francophones, et parce que son coût est nul.
2. **Quel DOI afficher.** Le bloc de chapitre affiche le **DOI de concept** (il résout toujours vers la dernière version). La page `/citer/` affiche les deux et explique la différence, avec la recommandation officielle de Zenodo : dans une citation, utiliser le **DOI de version**.
3. **Ne jamais générer d'entrée `@article`.** Un chapitre de cours n'est pas un article. Utiliser `@article` avec `journal = {rberrah.github.io}` (le motif Lil'Log) est répandu mais reste une imprécision bibliographique que des relecteurs francophones relèveront. `@misc`/`@online` est exact et suffit.

### 1.4 Révisions, relecture, réutilisation — micro-textes exacts

**Historique de révision** (bloc repliable, sous la signature ou en pied) :

> **Historique**
> 9 juillet 2026 — ajout de la section sur le rétrécissement (shrinkage) des EBE.
> 3 mai 2026 — correction de l'équation (4), signalée par [Prénom Nom].
> 12 mars 2026 — première publication.

Un chapitre vivant et daté est le contraire du principal risque des sites académiques personnels : l'obsolescence silencieuse. Trois lignes datées valent mieux qu'un badge « à jour ».

**Remerciements de relecture** (uniquement si une relecture a réellement eu lieu) :

> Relecture : [Prénom Nom], [Prénom Nom]. Les erreurs restantes sont les miennes.

**Réutilisation** (pied de chapitre, sous la citation) :

> ### Réutiliser ce chapitre
> Texte et figures sous licence CC BY-SA 4.0. Vous pouvez le reprendre, l'adapter et l'utiliser en cours, y compris en le modifiant, à condition de citer la source et de conserver la même licence.
> Attribution suggérée : « Racym Berrah, *Pharmacométrie Pratique*, CC BY-SA 4.0 » avec un lien vers cette page.
> Les traductions sont bienvenues. Merci de conserver en tête un lien vers la version originale.

**Signalement d'erreur** (pied de chapitre, dernière ligne) :

> Une erreur, une imprécision, une référence manquante ? [Signaler sur GitHub](https://github.com/rberrah/rberrah.github.io/issues/new?template=erreur-chapitre.yml&title=%5Bbayes-ebes%5D+) ou écrire à [adresse]. Les corrections sont créditées dans l'historique.

Le lien pré-remplit le slug du chapitre. Ajouter `.github/ISSUE_TEMPLATE/erreur-chapitre.yml` avec trois champs : chapitre, nature du problème, correction proposée. C'est un marqueur de rigueur scientifique, cela produit une trace publique de contributions, et cela transforme les lecteurs attentifs en collaborateurs identifiés.

### 1.5 Page `/a-propos/` — micro-texte exact

Structure : une phrase, puis des faits, puis des identifiants, puis un contact. Aucune narration.

> **Racym Berrah**
>
> Je construis des ressources ouvertes en pharmacométrie, en biostatistique et en intelligence artificielle appliquée à la pharmacologie.
>
> Docteur en pharmacie. Doctorant en pharmacologie à l'UMR 1248 *Pharmacologie & Transplantation* (Inserm — Université de Limoges — CHU de Limoges). Travaux sur la posologie individualisée guidée par les modèles (*model-informed precision dosing*), le suivi thérapeutique pharmacologique et l'estimation bayésienne, et sur l'articulation entre modèles mécanistiques et modèles de langage.
>
> **Identifiants** — ORCID 0009-0001-6432-2880 · CV HAL · GitHub · LinkedIn
>
> **Écrire** — [adresse]. Les corrections d'erreurs, les questions sur un chapitre et les demandes de traduction sont les bienvenues et reçoivent une réponse. Je ne peux pas relire de travaux personnels ni donner d'avis méthodologique sur un projet particulier.

Trois choses qui n'y figurent pas, volontairement : aucun adjectif sur soi ; aucune mention de disponibilité pour intervenir ; aucune mention de « fin de thèse » (l'ORCID public déclare un doctorat du 01/11/2025 au 31/10/2028 — un lecteur qui vérifie verrait la contradiction ; à trancher avec l'intéressé avant toute formulation temporelle).

**Affiliation : écrire Limoges.** L'ORCID affiche « Inserm, Paris, France » parce que l'organisation ORCID de l'Inserm pointe sur le siège parisien. C'est un artefact de métadonnées. Écrire « Paris » sur le site serait factuellement faux et immédiatement repéré par un pair du domaine. Corriger la fiche ORCID en ajoutant l'Université de Limoges comme organisation d'affiliation secondaire.

### 1.6 Page `/travaux/` (et non « Publications »)

Une page intitulée « Publications » comportant quatre entrées se lit comme une page vide. Une page « Travaux » groupée **par statut** affiche une activité réelle et laisse la liste s'allonger sans jamais changer de forme :

- **Articles** — 4 entrées, avec DOI cliquables, année, revue, et la mention « premier auteur » quand c'est le cas (2 sur 4). Format APA, ordre antichronologique, aucun commentaire.
- **Communications** — PAGE 2025, Thessalonique, abstract I-034, avec le titre exact et le lien vers la page de session ; PAGE 2026, Dubrovnik (annoncer la participation, **pas** un titre : il n'a pas pu être vérifié).
- **Thèse** — intitulé, unité, période. Sans acronyme mis en avant comme s'il s'agissait d'un programme labellisé, sans mention de financement, sans nom d'encadrant tant que l'intéressé ne l'a pas confirmé publiquement.
- **Ressources pédagogiques** — les trois corpus, avec DOI de concept, licence, nombre de chapitres et de visualisations, date de dernière révision.
- **Logiciels et données** — dépôts GitHub, identifiants HAL et SWHID quand ils existeront.

Aucun compteur de citations, aucun h-index, aucun badge. Aucun profil Google Scholar n'a pu être localisé : les métriques sont inconnues et ne doivent pas être approximées.

---

## 2. Citabilité — procédure complète, dans l'ordre

Onze étapes. Les trois premières conditionnent tout le reste ; les faire dans le désordre oblige à refaire.

### Étape 0 — Arbitrage de licence (préalable bloquant, 1 h de décision)

La licence actuelle est CC BY-NC-SA 4.0. La clause **NC** conditionne l'ensemble de la chaîne d'adoption en aval : la notion de « non commercial » n'est pas définie juridiquement de façon opérationnelle, et les services juridiques universitaires l'interprètent de manière conservatrice — en pratique, beaucoup de réutilisateurs institutionnels renoncent plutôt que d'arbitrer. Elle exclut également le corpus du périmètre de l'Open Definition, référence exigée par plusieurs circuits éditoriaux de l'éducation ouverte.

Or le mécanisme de notoriété visé est précisément la **reprise en cours par des tiers**. La clause SA (partage à l'identique) suffit à empêcher l'appropriation d'un dérivé fermé, ce que NC ne fait pas mieux.

Recommandation : **CC BY-SA 4.0** pour le texte et les figures, **MIT** ou **Apache-2.0** pour le code des visualisations. Ce n'est pas une décision technique : elle appartient à l'auteur, et elle doit être prise avant tout dépôt, parce qu'un DOI publié fige la licence dans les métadonnées.

Conséquences pratiques : ajouter à la racine de chaque dépôt un fichier `LICENSE` (texte intégral CC BY-SA 4.0) et un `LICENSE-CODE` (MIT), plus une section « Licence » dans le README précisant la frontière texte/code. GitHub lit ces fichiers et affiche automatiquement la licence dans l'en-tête du dépôt.

### Étape 1 — Compléter l'ORCID avant de le lier (1 h 30)

Lier un ORCID lacunaire depuis une vitrine soignée produit l'effet inverse de celui recherché. À faire dans cet ordre :

1. Ajouter l'article manquant : El Balkhi S, **Berrah R**, et al. *Human serum albumin profiling by top-down analysis enables multi-class liver fibrosis staging*, Scientific Reports, 2026. Il est indexé PubMed et Europe PMC mais absent de l'ORCID.
2. Vérifier que les 5 travaux (4 articles + la réponse aux auteurs) portent bien leur DOI et leur source.
3. Renseigner la section **Education** (diplôme de docteur en pharmacie, établissement, année).
4. Corriger/compléter **Employment** : ajouter l'Université de Limoges comme organisation, pour que la fiche ne se lise pas « Paris ».
5. Rédiger la **biographie** ORCID : reprendre mot pour mot la phrase de `/a-propos/` (une seule formulation, partout).
6. Renseigner **Websites & social links** : URL du portail, URL du CV HAL (dès qu'il existe), GitHub, LinkedIn. Cette réciprocité est ce qui permet aux outils de désambiguïsation de fermer la boucle.
7. Régler la visibilité de tous les champs sur **Everyone**.

**Piège :** ORCID a trois niveaux de visibilité et le défaut n'est pas public pour tous les champs. Un ORCID « public » dont les works sont en *Trusted parties* est invisible pour les moissonneurs.

### Étape 2 — Autoriser les mises à jour automatiques (15 min)

Dans la boîte de réception ORCID, autoriser **Crossref** et **DataCite** une fois pour toutes. À partir de là, tout DOI dont les métadonnées contiennent l'iD ORCID remonte automatiquement dans le profil.

**Piège :** l'autorisation ne rétroagit pas sur les DOI déjà publiés sans l'iD. D'où l'étape 5 : mettre l'ORCID dans les métadonnées Zenodo **avant** la première publication.

### Étape 3 — `CITATION.cff` à la racine de chaque dépôt (30 min pour les trois)

Un fichier de 25 lignes déclenche l'encadré natif « Cite this repository » dans la barre latérale de GitHub, avec export APA et BibTeX générés automatiquement. C'est le seul des trois niveaux de citation qui soit machine-lisible par défaut.

```yaml
cff-version: 1.2.0
title: "Pharmacométrie Pratique"
message: "Merci de citer cette ressource si vous l'utilisez ou la réutilisez."
type: dataset
authors:
  - family-names: Berrah
    given-names: Racym
    orcid: "https://orcid.org/0009-0001-6432-2880"
    affiliation: "UMR 1248 Pharmacologie & Transplantation, Inserm / Université de Limoges / CHU de Limoges"
abstract: >-
  Cours interactif de pharmacométrie en accès libre : 88 chapitres en français,
  88 chapitres en anglais et 63 visualisations interactives couvrant la
  pharmacocinétique de population, l'analyse non compartimentale, la PBPK,
  la modélisation PK/PD, le suivi thérapeutique pharmacologique, la posologie
  individualisée guidée par les modèles et les méthodes d'apprentissage
  automatique appliquées à la pharmacométrie.
keywords:
  - pharmacometrics
  - population pharmacokinetics
  - model-informed precision dosing
  - therapeutic drug monitoring
  - nonlinear mixed-effects models
  - open educational resources
license: CC-BY-SA-4.0
repository-code: "https://github.com/rberrah/rberrah.github.io"
url: "https://rberrah.github.io/pharmacometrie/"
version: "2026.1"
date-released: "2026-09-15"
identifiers:
  - type: doi
    value: 10.5281/zenodo.XXXXXXX
    description: "DOI de concept — résout toujours vers la dernière version"
```

**Pièges :** (a) `type` n'accepte que `software` ou `dataset` en CFF 1.2.0 ; `dataset` est le choix pragmatique pour un corpus pédagogique. (b) `license` doit être un identifiant **SPDX** exact (`CC-BY-SA-4.0`, pas `CC BY-SA 4.0`). (c) Le fichier doit être sur la **branche par défaut** et à la **racine**, sinon GitHub ne l'affiche pas. (d) Le champ `identifiers` avec le DOI ne peut être renseigné qu'après l'étape 6 — prévoir un second commit.

### Étape 4 — Nettoyer ce que Zenodo va archiver (1 h)

Zenodo archive l'archive ZIP générée par GitHub pour le tag. Les fichiers ignorés par `.gitignore` (`node_modules`, `/build`, `/dist`) en sont absents — c'est déjà correct dans le dépôt. En revanche sont **suivis** et donc archivés : `static/pharmacometrie-pratique.pptx`, `static/downloads/pharmacometrie-pratique.pptx` (doublon), et l'ensemble des `static/slides/*.png`.

À faire : supprimer le doublon de `.pptx`, et vérifier que les images de diapositives sont bien des productions originales redistribuables sous la licence retenue. Un `.gitattributes` avec `export-ignore` permet d'exclure sélectivement des chemins de l'archive de release sans les retirer du dépôt :

```
tests/           export-ignore
playwright.config.js export-ignore
course_source/   export-ignore
```

**Piège :** ce qui part chez Zenodo est publié sous DOI, définitivement. Un fichier tiers non redistribuable archivé sous DOI est un problème qui ne se répare pas en supprimant le fichier.

### Étape 5 — `.zenodo.json` (30 min par dépôt)

Sans ce fichier, Zenodo remplit la notice avec le nom du dépôt GitHub et le pseudonyme de l'auteur. La notice est modifiable après coup, mais autant produire une notice correcte du premier coup.

```json
{
  "title": "Pharmacométrie Pratique — cours interactif de pharmacométrie en accès libre",
  "description": "<p>Corpus pédagogique original en pharmacométrie : 88 chapitres en français, 88 chapitres en anglais et 63 visualisations interactives (D3 / LayerCake). Couverture : pharmacocinétique et pharmacodynamie, analyse non compartimentale, modélisation compartimentale, pharmacocinétique de population, PBPK, variabilité inter- et intra-individuelle, erreur résiduelle, estimation bayésienne et estimations individuelles, validation de modèle et VPC, suivi thérapeutique pharmacologique, posologie individualisée guidée par les modèles, applications en oncologie, en infectiologie et aux anticorps monoclonaux, méthodes d'apprentissage automatique en pharmacométrie. Outils abordés : NONMEM, Monolix, nlmixr2.</p><p>Le site est déployé à l'adresse https://rberrah.github.io/pharmacometrie/</p>",
  "upload_type": "lesson",
  "language": "fra",
  "license": "cc-by-sa-4.0",
  "version": "2026.1",
  "creators": [
    {
      "name": "Berrah, Racym",
      "orcid": "0009-0001-6432-2880",
      "affiliation": "UMR 1248 Pharmacologie & Transplantation, Inserm / Université de Limoges / CHU de Limoges"
    }
  ],
  "keywords": [
    "pharmacometrics",
    "population pharmacokinetics",
    "model-informed precision dosing",
    "therapeutic drug monitoring",
    "nonlinear mixed-effects models",
    "Bayesian estimation",
    "open educational resources",
    "pharmacométrie",
    "ressource éducative libre"
  ],
  "related_identifiers": [
    {
      "identifier": "https://rberrah.github.io/pharmacometrie/",
      "relation": "isDocumentedBy",
      "resource_type": "other"
    }
  ]
}
```

**Pièges :** (a) `upload_type: "lesson"` est le type qui décrit correctement un corpus de cours ; il conditionne la découvrabilité de la notice. (b) L'`orcid` s'écrit **sans** le préfixe `https://orcid.org/`. (c) L'identifiant de licence doit être vérifié dans l'interface Zenodo avant publication — les identifiants sont en minuscules et diffèrent parfois de SPDX. (d) Le champ `description` accepte du HTML : y mettre les mots-clés en clair, c'est ce texte qui sera moissonné.

### Étape 6 — Intégration GitHub → Zenodo et première release (45 min)

1. Se connecter à Zenodo **avec le compte GitHub** (l'intégration ne fonctionne pas autrement).
2. Zenodo → *Settings* → *GitHub* → autoriser l'accès aux dépôts.
3. Basculer l'interrupteur **ON** pour `rberrah.github.io`, `internat`, `stats`.
4. **Puis seulement** créer la release GitHub : tag `v2026.1`, titre `Pharmacométrie Pratique 2026.1`, corps = résumé du contenu et des changements.
5. Vérifier dans Zenodo que l'enregistrement est créé et que les métadonnées correspondent au `.zenodo.json`.
6. Reporter le DOI de concept dans `CITATION.cff`, dans le README et sur la page `/citer/`.

**Pièges, dans l'ordre de fréquence :**

- L'interrupteur doit être activé **avant** la release. Les releases antérieures ne sont pas rattrapées. Erreur la plus courante.
- Le dépôt doit être **public** au moment de la release.
- Zenodo émet **deux** DOI : un DOI de version et un DOI de concept. Le concept résout vers la dernière version ; c'est celui qu'on affiche sur le site. Le DOI de version est celui qu'on recommande dans une citation.
- Modifier des **métadonnées** ne crée pas de nouvelle version ni de nouveau DOI. Modifier des **fichiers** impose une nouvelle version. À retenir pour les corrections de coquilles dans la notice.
- Cadence : **une release par an** (`v2026.1`, `v2027.1`). Une release par correction produit vingt DOI par an et dilue le corpus. Réserver une release intermédiaire (`v2026.2`) aux ajouts substantiels.

### Étape 7 — HAL : le levier réel de visibilité Scholar (3 h la première fois)

Point structurant, souvent mal compris : **Zenodo n'est pas indexé par Google Scholar** — c'est une position officielle de Zenodo, motivée par le fait que Scholar déduit le type de ressource du motif d'URL et que Zenodo autorise le changement de type après publication. Zenodo sert le DOI, le versionnement, OpenAlex et Google Dataset Search. **HAL, elle, est indexée par Google et par Google Scholar.**

Séquence :

1. **Créer l'IdHAL.** Attention : l'IdHAL est **non modifiable après création** — il compose l'URL du CV. Choisir `racym-berrah`.
2. **Créer le CV HAL.** Page publique, URL stable, alimentée automatiquement par les dépôts. C'est la page d'identité institutionnelle française, et elle ne coûte aucun entretien.
3. **Déposer les 3 corpus dans le portail CEL** (Cours en ligne). HAL accepte explicitement les cours et supports de cours. Trois notices, une par site, chacune avec le lien vers le site, le DOI Zenodo en identifiant lié, et l'affiliation UMR 1248.
4. **Déposer le code** en type *Logiciel* : HAL archive automatiquement dans **Software Heritage** et délivre un **SWHID** persistant (identifiant intrinsèque, calculé depuis le contenu, normalisé ISO/IEC 18670).
5. **Le jour de la soutenance**, déposer la thèse dans **TEL** — indexé Google, Google Scholar et Isidore.
6. Vérifier que les 4 articles déjà publiés sont bien affiliés à l'UMR 1248 dans HAL (3 documents y sont actuellement indexés sous « Racym Berrah » : il en manque un).

**Piège :** le dépôt CEL demande de renseigner le domaine, le niveau et le public visé. Ces champs conditionnent la remontée dans les moteurs de recherche pédagogique ; les remplir sérieusement.

### Étape 8 — Google Scholar : attentes calibrées (30 min)

Créer le profil auteur Google Scholar : c'est le nœud manquant du graphe d'identité, et son absence est aujourd'hui une lacune plus visible qu'un faible nombre de citations.

Ce qui remontera : les 4 articles, la thèse via TEL, les notices HAL.
Ce qui ne remontera probablement pas : les chapitres de cours. Les *Inclusion Guidelines* de Scholar restreignent l'éligibilité aux articles de revue, actes de congrès, rapports techniques, thèses, preprints, postprints et résumés. Le matériel de cours n'entre dans aucune catégorie éligible.

**Piège majeur, à respecter absolument : ne pas poser de balises `citation_*` (Highwire Press) sur les pages de chapitres.** Baliser comme un article une page qui n'en est pas expose au rejet et, plus grave, à une réputation de manipulation auprès d'un service qui filtre manuellement. Les balises `citation_*` ne se justifient que sur une page hébergeant un vrai document : preprint PDF, tutoriel, résumé de communication.

### Étape 9 — Vérifier la boucle (30 min, 4 à 8 semaines après)

- Le DOI Zenodo apparaît-il dans l'ORCID (via l'auto-update DataCite) ?
- L'enregistrement Zenodo apparaît-il dans **OpenAlex** (qui a intégré plus de 92 millions de DOI DataCite et moissonne Crossref, DataCite, PubMed, HAL, ORCID, arXiv et Zenodo) ?
- Le CV HAL apparaît-il dans une recherche Google sur « Racym Berrah » ?
- L'encadré « Cite this repository » s'affiche-t-il sur les trois dépôts GitHub ?

### Étape 10 — Le seul raccourci vers une production indexée (effort élevé, effet élevé)

*CPT: Pharmacometrics & Systems Pharmacology* publie un type d'article **Tutorial**, dont la définition officielle est éducative : tutoriel pratique sur les outils, méthodologies et approches en pharmacométrie, destiné à introduire la méthodologie aux nouveaux venus et à fournir des guides spécialisés aux praticiens. Un tutoriel dérivé d'un parcours du site — par exemple la validation de modèle, ou le MIPD bayésien — avec renvoi au site comme matériel supplémentaire produit : un DOI Crossref, une indexation PubMed/Scholar/Scopus, et un lien pérenne vers le site depuis un article revu par les pairs.

**Ligne rouge déontologique.** Republier du matériel déjà en ligne sans le déclarer relève de l'auto-plagiat, explicitement listé parmi les pratiques de recherche questionnables. Tout dérivé publié doit **citer la version du site et son DOI** dans les références, et le mentionner dans la lettre à l'éditeur. À discuter avec l'encadrement avant soumission : la politique de la revue sur l'auteur unique et le niveau de séniorité pour ce type d'article n'a pas été vérifiée.

*Note : JOSE (Journal of Open Source Education) n'accepte pas de soumissions actuellement, son comité délibérant sur une révision des critères d'éligibilité, sans calendrier annoncé. Ne rien planifier dessus ; garder le corpus éligible (licence ouverte, module autonome et adoptable) est de toute façon un bon cahier des charges.*

---

## 3. Découvrabilité technique

État actuel, vérifié dans `Base/rberrah.github.io` : aucun `link rel="canonical"`, aucun `og:image`, aucune balise `author`, aucun JSON-LD, aucune route `sitemap.xml`, aucun lien ORCID. Le `robots.txt` autorise tout mais ne déclare aucun sitemap. Le site part de zéro — ce qui signifie que les gains sont mécaniques et rapides.

### 3.1 En-tête commun (`src/app.html` et `+layout.svelte`)

Dans `app.html`, ajouter les éléments constants :

```html
<meta name="author" content="Racym Berrah" />
<link rel="me" href="https://orcid.org/0009-0001-6432-2880" />
<link rel="author" href="https://orcid.org/0009-0001-6432-2880" />
<meta property="og:site_name" content="Pharmacométrie Pratique" />
<meta property="og:locale" content="fr_FR" />
<meta property="og:locale:alternate" content="en_GB" />
<meta name="twitter:card" content="summary_large_image" />
```

Dans `+layout.svelte`, poser le canonical à partir de `page.url` (qui inclut déjà le `base` en prerender) :

```svelte
<script>
  import { page } from '$app/state';
  const ORIGIN = 'https://rberrah.github.io';
  $: canonical = ORIGIN + page.url.pathname;
</script>

<svelte:head>
  <link rel="canonical" href={canonical} />
</svelte:head>
```

**Piège :** avec `trailingSlash: 'always'`, le canonical doit se terminer par `/`. Vérifier après build qu'aucune page ne déclare un canonical sans slash final — sinon on crée soi-même le duplicata qu'on voulait éviter.

### 3.2 `hreflang` sur les 88 chapitres bilingues

Dans la route de chapitre, quand la version alternée existe :

```svelte
<link rel="alternate" hreflang="fr" href={ORIGIN + frPath} />
<link rel="alternate" hreflang="en" href={ORIGIN + enPath} />
<link rel="alternate" hreflang="x-default" href={ORIGIN + frPath} />
```

Les trois balises doivent être présentes **sur les deux** versions et se pointer réciproquement, sinon Google ignore l'ensemble du groupe. Répliquer les mêmes paires dans le sitemap via `xhtml:link` (voir 3.4).

Rendre la traduction **visible au niveau du chapitre**, et non seulement dans une bascule de langue globale : une ligne sous le titre, `Also available in English` / `Aussi disponible en français`, avec lien direct. C'est le motif qui signale une autorité internationale ; une bascule globale ne le fait pas.

### 3.3 JSON-LD — bloc complet pour la page d'accueil du portail

À poser une fois, dans la page racine `https://rberrah.github.io/`. Utilise `@graph` pour que l'entité `Person` porte un `@id` stable, réutilisable par référence depuis toutes les autres pages.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://rberrah.github.io/#racym-berrah",
      "name": "Racym Berrah",
      "givenName": "Racym",
      "familyName": "Berrah",
      "url": "https://rberrah.github.io/a-propos/",
      "mainEntityOfPage": "https://rberrah.github.io/a-propos/",
      "jobTitle": "Doctorant en pharmacologie",
      "description": "Doctorant en pharmacologie et docteur en pharmacie. Construit des ressources ouvertes en pharmacométrie, biostatistique et intelligence artificielle appliquée à la pharmacologie.",
      "identifier": {
        "@type": "PropertyValue",
        "propertyID": "ORCID",
        "value": "0009-0001-6432-2880",
        "url": "https://orcid.org/0009-0001-6432-2880"
      },
      "sameAs": [
        "https://orcid.org/0009-0001-6432-2880",
        "https://www.linkedin.com/in/racym-berrah-114387175/",
        "https://github.com/rberrah"
      ],
      "affiliation": {
        "@type": "ResearchOrganization",
        "@id": "https://ror.org/00sd73037#umr1248",
        "name": "UMR 1248 Pharmacologie & Transplantation",
        "alternateName": "Inserm U1248 — Pharmacology & Transplantation",
        "url": "https://www.unilim.fr/p-and-t/",
        "parentOrganization": [
          { "@type": "ResearchOrganization", "name": "Institut national de la santé et de la recherche médicale (Inserm)" },
          { "@type": "CollegeOrUniversity", "name": "Université de Limoges" },
          { "@type": "Hospital", "name": "CHU de Limoges" }
        ],
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Limoges",
          "addressRegion": "Nouvelle-Aquitaine",
          "addressCountry": "FR"
        }
      },
      "alumniOf": {
        "@type": "CollegeOrUniversity",
        "name": "Faculté de pharmacie"
      },
      "hasCredential": {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "degree",
        "name": "Docteur en pharmacie (PharmD)"
      },
      "knowsLanguage": [
        { "@type": "Language", "name": "French", "alternateName": "fr" },
        { "@type": "Language", "name": "English", "alternateName": "en" }
      ],
      "knowsAbout": [
        "Pharmacometrics",
        "Population pharmacokinetics",
        "Nonlinear mixed-effects modelling",
        "Model-informed precision dosing",
        "Therapeutic drug monitoring",
        "Bayesian maximum a posteriori estimation",
        "Residual error models",
        "Physiologically based pharmacokinetic modelling",
        "Biostatistics",
        "Machine learning in pharmacology",
        "Large language models in pharmacometrics"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://rberrah.github.io/#website",
      "url": "https://rberrah.github.io/",
      "name": "Ressources pédagogiques en pharmacie et en pharmacométrie",
      "inLanguage": "fr",
      "author": { "@id": "https://rberrah.github.io/#racym-berrah" },
      "creator": { "@id": "https://rberrah.github.io/#racym-berrah" },
      "publisher": { "@id": "https://rberrah.github.io/#racym-berrah" },
      "license": "https://creativecommons.org/licenses/by-sa/4.0/",
      "isAccessibleForFree": true,
      "hasPart": [
        { "@type": "Course", "@id": "https://rberrah.github.io/pharmacometrie/#course" },
        { "@type": "Course", "@id": "https://rberrah.github.io/internat/#course" },
        { "@type": "Course", "@id": "https://rberrah.github.io/stats/#course" }
      ]
    },
    {
      "@type": "ProfilePage",
      "@id": "https://rberrah.github.io/a-propos/#profile",
      "url": "https://rberrah.github.io/a-propos/",
      "mainEntity": { "@id": "https://rberrah.github.io/#racym-berrah" },
      "isPartOf": { "@id": "https://rberrah.github.io/#website" }
    }
  ]
}
</script>
```

**Deux vérifications avant mise en ligne :** (a) le ROR de l'Université de Limoges cité en `@id` doit être vérifié sur ror.org — s'il ne l'est pas, retirer le `@id` de l'affiliation plutôt que d'écrire un identifiant faux ; (b) vérifier que le compte GitHub `rberrah` est bien celui de l'intéressé (déduit du dépôt `github.com/rberrah/rberrah.github.io`, cohérent mais à confirmer).

**Ce qui n'y figure pas, volontairement :** aucune mention de DIGPHAT (l'appartenance formelle au consortium n'est pas établie ; ce qui est établi, c'est l'appartenance à l'UMR 1248), aucun nom d'encadrant, aucune mention de financement, aucun `award`.

### 3.4 JSON-LD `Course` (accueil de chaque site)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Course",
  "@id": "https://rberrah.github.io/pharmacometrie/#course",
  "url": "https://rberrah.github.io/pharmacometrie/",
  "name": "Pharmacométrie Pratique",
  "description": "Cours interactif de pharmacométrie en accès libre : 88 chapitres en français, 88 en anglais, 63 visualisations interactives. PK/PD, pharmacocinétique de population, analyse non compartimentale, PBPK, validation de modèle, suivi thérapeutique pharmacologique et posologie individualisée guidée par les modèles.",
  "inLanguage": ["fr", "en"],
  "educationalLevel": "advanced",
  "learningResourceType": "course",
  "teaches": [
    "Interpréter un modèle de pharmacocinétique de population",
    "Construire et évaluer un modèle non linéaire à effets mixtes",
    "Réaliser une analyse non compartimentale",
    "Mettre en œuvre une estimation bayésienne pour l'adaptation de dose",
    "Diagnostiquer un modèle par VPC et par analyse des résidus"
  ],
  "author":    { "@id": "https://rberrah.github.io/#racym-berrah" },
  "provider":  { "@id": "https://rberrah.github.io/#racym-berrah" },
  "publisher": { "@id": "https://rberrah.github.io/#racym-berrah" },
  "license": "https://creativecommons.org/licenses/by-sa/4.0/",
  "isAccessibleForFree": true,
  "creativeWorkStatus": "Published",
  "datePublished": "2026-03-12",
  "dateModified": "2026-08-04",
  "version": "2026.1",
  "identifier": {
    "@type": "PropertyValue",
    "propertyID": "DOI",
    "value": "10.5281/zenodo.XXXXXXX"
  },
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "Online",
    "courseWorkload": "PT30H",
    "inLanguage": "fr"
  },
  "audience": {
    "@type": "EducationalAudience",
    "educationalRole": ["student", "researcher", "professional"]
  },
  "about": [
    { "@type": "Thing", "name": "Pharmacometrics" },
    { "@type": "Thing", "name": "Population pharmacokinetics" },
    { "@type": "Thing", "name": "Model-informed precision dosing" }
  ]
}
</script>
```

L'objectif de ce bloc n'est pas d'obtenir un *rich result* Google — les exigences du résultat enrichi « Course » sont contraignantes et ne servent pas la stratégie. L'objectif est la **désambiguïsation d'entité** : que les moteurs, les agrégateurs de ressources éducatives et les systèmes qui construisent des graphes de connaissances (y compris ceux qui alimentent les modèles de langage) relient sans ambiguïté ce corpus à une personne portant un ORCID.

### 3.5 JSON-LD `LearningResource` (chaque chapitre)

Généré depuis le frontmatter existant (`title`, `description`, `duration`, `level`, `tags`, `reviewed_on`, plus un `published_on` à ajouter) :

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LearningResource",
  "@id": "https://rberrah.github.io/pharmacometrie/chapitres/bayes-ebes/#chapter",
  "url": "https://rberrah.github.io/pharmacometrie/chapitres/bayes-ebes/",
  "name": "Bayes et estimations individuelles (EBE)",
  "headline": "Bayes et estimations individuelles (EBE)",
  "description": "Estimation a posteriori maximale, estimations individuelles empiriques, rétrécissement, et ce que cela change pour l'adaptation de dose.",
  "inLanguage": "fr",
  "learningResourceType": "lesson",
  "educationalLevel": "intermediate",
  "timeRequired": "PT12M",
  "teaches": [
    "Distinguer estimation de population et estimation individuelle",
    "Interpréter le rétrécissement des estimations individuelles"
  ],
  "keywords": "estimation bayésienne, MAP, EBE, shrinkage, adaptation de dose",
  "datePublished": "2026-03-12",
  "dateModified": "2026-07-09",
  "author":    { "@id": "https://rberrah.github.io/#racym-berrah" },
  "publisher": { "@id": "https://rberrah.github.io/#racym-berrah" },
  "license": "https://creativecommons.org/licenses/by-sa/4.0/",
  "isAccessibleForFree": true,
  "isPartOf": { "@id": "https://rberrah.github.io/pharmacometrie/#course" },
  "workTranslation": {
    "@type": "LearningResource",
    "@id": "https://rberrah.github.io/pharmacometrie/en/chapters/bayes-ebes/#chapter",
    "inLanguage": "en"
  },
  "citation": [
    "Sheiner LB, Beal SL. Bayesian individualization of pharmacokinetics. J Pharmacokinet Biopharm. 1982;10(6):635-651."
  ]
}
</script>
```

`timeRequired` se dérive de `duration: "12 min"` → `PT12M`. `educationalLevel` se dérive de `level`. La propriété `citation` alimentée depuis le pool fermé de références est le signal le plus fort qu'une page de cours puisse émettre : elle établit une filiation bibliographique lisible par machine.

**Piège :** `educationalLevel` n'est pas listé par Google dans les exigences de données structurées `Course`. Il ne déclenchera aucun affichage particulier. On le pose pour les moissonneurs de ressources éducatives, pas pour Google.

### 3.6 Sitemap

Créer `src/routes/sitemap.xml/+server.js` :

```js
import { chapters } from '$lib/content/index.js'; // adapter au module réel

export const prerender = true;

const ORIGIN = 'https://rberrah.github.io';
const BASE = process.env.BASE_PATH || '/pharmacometrie';

const xml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function GET() {
  const entries = [
    { path: '/', lastmod: '2026-08-04', priority: '1.0' },
    { path: '/chapitres/', lastmod: '2026-08-04', priority: '0.9' },
    { path: '/a-propos/', lastmod: '2026-08-04', priority: '0.5' },
    { path: '/citer/', lastmod: '2026-08-04', priority: '0.5' },
    ...chapters.map((c) => ({
      path: `/chapitres/${c.slug}/`,
      lastmod: c.reviewed_on,
      priority: '0.8',
      alt: c.hasEnglish ? `/en/chapters/${c.slug}/` : null
    }))
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map((e) => `  <url>
    <loc>${xml(ORIGIN + BASE + e.path)}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <priority>${e.priority}</priority>${e.alt ? `
    <xhtml:link rel="alternate" hreflang="fr" href="${xml(ORIGIN + BASE + e.path)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${xml(ORIGIN + BASE + e.alt)}"/>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
}
```

Puis dans `static/robots.txt` :

```
Sitemap: https://rberrah.github.io/pharmacometrie/sitemap.xml
Sitemap: https://rberrah.github.io/internat/sitemap.xml
Sitemap: https://rberrah.github.io/stats/sitemap.xml
```

Et un `sitemap_index.xml` à la racine du portail listant les trois.

**Contrainte Scholar/Google à respecter :** l'URL de chaque page doit être atteignable depuis la page d'accueil en dix liens HTML simples au maximum. Avec 186 chapitres dans Internat Pharma, vérifier que l'index des chapitres n'est pas paginé en profondeur derrière du JavaScript.

### 3.7 Images de partage (`og:image`)

Génération au build, script `scripts/generate_og.mjs` : un gabarit SVG (titre du chapitre sur deux lignes, nom du site en bandeau, `Racym Berrah` en pied, 1200×630), converti en PNG via `@resvg/resvg-js` ou `sharp`, écrit dans `static/og/<slug>.png`. Puis dans l'en-tête du chapitre :

```svelte
<meta property="og:image" content={`${ORIGIN}${base}/og/${chapter.slug}.png`} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content={`${chapter.title} — Pharmacométrie Pratique`} />
```

C'est le seul élément de la liste qui produise un effet visible en une semaine : un lien partagé dans une liste de diffusion ou sur LinkedIn passe d'un rectangle gris à une carte lisible portant le titre et le nom. 320 images pèsent quelques mégaoctets et se régénèrent en une commande.

### 3.8 Wikidata — ce que cela fait, et si cela vaut la peine

**Ce que cela fait.** Un item Wikidata portant la propriété **P496 (ORCID iD)** devient un nœud pivot : il est moissonné par le Knowledge Graph de Google, consommé par OpenAlex pour la désambiguïsation d'auteurs, et il génère automatiquement un profil **Scholia** (page de synthèse des publications, co-auteurs et thématiques). C'est le seul mécanisme qui produise une page tierce, indépendante, portant le nom et reliant les identifiants — exactement ce qui manque aujourd'hui, puisque le nom n'apparaît ni sur la page des membres de l'UMR 1248 ni sur theses.fr.

**Notabilité.** Les critères Wikidata sont larges : un item est admissible s'il renvoie à un concept clairement identifiable, ce que garantit un ORCID public. Un doctorant avec un ORCID public est donc admissible. L'outil **ORCIDator** permet de moissonner un profil ORCID public vers Wikidata.

**Verdict : oui, mais pas tout de suite, et pas par lui.**
- *Pas tout de suite* : l'item doit être créé **après** que l'ORCID est complet et que le CV HAL existe, sinon il naît vide et attire une demande de suppression.
- *Pas par lui* : créer soi-même son item Wikidata est traçable à vie dans l'historique et se lit comme de l'auto-promotion. La pratique défendable est de le faire créer par un tiers (un collègue, un bibliothécaire de l'université — les services de documentation français forment couramment à Wikidata), ou de le proposer via un projet WikiProject.
- Effort : 1 h une fois les prérequis remplis. Propriétés à renseigner : `instance of: human` (Q5), `occupation: researcher` (Q1650915), `employer`, `ORCID iD` (P496), `Google Scholar author ID` (P1960), `HAL author ID` (P4450), `GitHub username` (P2037), `field of work` (P101).

**La même prudence vaut pour Wikipédia, en plus strict.** Citer son propre travail y est autorisé « within reason », à la troisième personne, sans emphase indue — mais l'auto-citation excessive est explicitement découragée, et ajouter soi-même des liens vers ses propres ressources est traçable à vie et lu comme du spam si c'est répété. La seule pratique défendable : proposer en page de discussion et laisser un tiers décider. En pratique : ne pas y toucher pendant les douze premiers mois.

---

## 4. Diffusion sans se vendre

### 4.1 La règle unique

> **Tout ce qui ressemble à une demande faite au lecteur est à supprimer. Tout ce qui ressemble à une mise à disposition est à garder.**

« J'ai écrit un cours, dites-moi ce que vous en pensez » est une demande. « Ce cours existe, il est sous licence libre, voici l'adresse » est une mise à disposition. La différence tient en une reformulation, et elle est ce qui sépare une contribution d'une sollicitation.

Ce qui est mal vu, concrètement, dans le milieu académique français : parler de soi à la première personne sur une page d'accueil scientifique ; annoncer un travail non publié comme un résultat ; le vocabulaire d'impact (« révolutionnaire », « unique », « le seul cours qui… ») ; le compteur de vues affiché ; la sollicitation de citations ; la republication de la même annonce sur plusieurs canaux à quelques jours d'intervalle.

Ce qui est bien vu : une page recherche factuelle, un CV HAL, des DOI, une licence claire, un journal des modifications daté, une bibliographie, une adresse de courriel, et le silence sur le reste.

### 4.2 Ordre d'entrée dans les communautés, du plus proche au plus lointain

**(1) SFPT — Société française de pharmacologie et de thérapeutique.** Le canal le plus proche, francophone, thématiquement identique. Deux points d'ancrage : le groupe de travail **« STP & personnalisation des traitements »** (suivi thérapeutique pharmacologique — exactement le domaine de ses deux articles de premier auteur) et le **Réseau AVENIR**, structure dédiée aux chercheurs émergents. Le **congrès SFPT / IATDMCT 2026 à Rennes** est le point de rencontre à ne pas manquer : il réunit précisément la communauté francophone du TDM et la communauté internationale de l'IATDMCT, dont le *Pharmacometrics Group* co-signe son article de *Therapeutic Drug Monitoring*. Modalités d'adhésion et éligibilité des doctorants au Réseau AVENIR à vérifier auprès de `secretariat@sfpt-fr.org` — c'est le seul chemin fiable.

**(2) PAGE.** Deux participations consécutives sont déjà acquises (Thessalonique 2025, abstract I-034 ; Dubrovnik 2026). La règle procédurale à ne pas manquer : **il faut s'inscrire comme participant avant de pouvoir soumettre**, et **un seul résumé par participant** — ce qui oblige à arbitrer chaque année entre plusieurs travaux. Résumé structuré (Objectives / Methods / Results / Conclusions / References), 450 à 700 mots hors espaces. Ne pas soumettre séparément un oral et un poster : un oral refusé bascule automatiquement en poster. Poster A0 portrait.

**(3) ISoP — Special Interest Groups.** Le mandat statutaire des SIG inclut explicitement de « *develop training materials* ». C'est littéralement l'endroit où un corpus pédagogique existant est une **contribution attendue**, et non une auto-promotion. Trois cibles : le **Clinical Pharmacometrics SIG** (conjoint ISoP/ACCP), le **Statistics and Pharmacometrics (SxP) SIG** et son **AI/ML SubSIG** (lancé en décembre 2023, qui maintient un dépôt interne de littérature et de ressources de formation, organise des webinaires et des sessions en congrès), et la **Student/Trainee Community**, qui dispose d'une liaison au comité de pilotage. Le **workshop satellite AI/ML de PAGE 2026** est le point d'entrée le plus naturel : outils de codage assisté par IA, frameworks ML open source en R et Julia, panel réglementaire.

**(4) ACoP 2026** — 11 au 14 octobre 2026, Gaylord National Resort, Oxon Hill, Maryland, thème « Models to Medicines ». L'**ISoP/ACoP Trainee Award** est un point d'entrée légitime : candidater à un prix destiné aux étudiants n'est pas se mettre en avant, c'est utiliser un dispositif conçu pour cela.

### 4.3 Contribution open source plutôt que présence sur les forums

Répondre sur la liste NONMEM ou sur un forum d'utilisateurs donne une visibilité volatile et non citable. Une **pull request acceptée** dans `nlmixr2`, `rxode2`, `babelmixr2` ou `mrgsolve` — ou une vignette de documentation contribuée — laisse une trace permanente, attribuée nominativement, dans l'historique d'un outil que la communauté utilise et cite.

Séquence à faible risque : (a) ouvrir une issue documentant précisément un comportement inattendu, avec exemple reproductible minimal ; (b) proposer une correction de documentation ; (c) proposer une vignette dérivée d'un chapitre du site (par exemple la VPC, ou le diagnostic de shrinkage). Une vignette contribuée est le meilleur des deux mondes : elle sert l'outil et elle est signée.

Cible complémentaire : si les 103 visualisations D3/LayerCake sont extraites en un paquet réutilisable, cela ouvre une soumission à **JOSS** — sous réserve que le code porte une licence OSI, que le paquet soit *feature-complete* et conçu pour être maintenu et étendu (JOSS refuse explicitement les outils jetables), et en notant que JOSS n'est indexé ni dans Web of Science ni dans Scopus.

### 4.4 Relecture par les pairs

Section vide de l'ORCID aujourd'hui. Deux voies pour un doctorant :
- **Co-relecture déclarée** avec l'encadrement : la plupart des revues l'acceptent si le relecteur principal l'annonce, et ORCID permet d'enregistrer une activité de relecture co-signée. C'est la voie normale et la seule irréprochable.
- **S'inscrire aux viviers de relecteurs** des revues du domaine en renseignant précisément ses mots-clés (TDM, MIPD, erreur résiduelle, antifongiques, immunosuppresseurs).

Chaque relecture enregistrée est une ligne d'ORCID de plus, dans une section qui est aujourd'hui vide et qui se remplit sans rien publier.

### 4.5 Preprints

Deux dépôts complémentaires : **HAL** (indexé Scholar, rattaché à l'unité, comptabilisé dans les outils d'évaluation français) et **arXiv** ou **medRxiv** selon la nature du travail. Le dépôt HAL doit être systématique et concomitant de la soumission — c'est la pratique attendue dans une unité Inserm, et c'est aussi ce qui alimente automatiquement le CV HAL.

### 4.6 Séminaires

Par ordre de coût croissant et sans jamais solliciter : séminaire d'unité (UMR 1248), journal club de l'unité fonctionnelle de pharmacométrie du CHU, séminaire de l'école doctorale, journées de la SFPT, webinaire d'un SIG ISoP. La règle : on accepte une invitation, on ne la sollicite pas ; et on rend le matériel disponible ensuite (slides déposés, lien vers les visualisations) — ce qui transforme une intervention ponctuelle en objet durable.

Prévoir sur le site une page **`/interventions/`** en mode **archive pure** : date, titre, lieu, lien vers les diapositives et le dépôt. Aucune mention de disponibilité, aucune invitation à inviter. La page fonctionne comme preuve d'activité ; les invitations viennent de la preuve, jamais de la demande.

### 4.7 Où publier une annonce de cours

Par ordre décroissant de pertinence et d'acceptabilité sociale :

1. **Sa propre page LinkedIn** — canal personnel, aucun tiers dérangé, aucune étiquette requise.
2. **Le canal d'un SIG ISoP** (AI/ML SubSIG, Clinical Pharmacometrics), dont le mandat inclut le développement de matériel de formation. Écrire d'abord au *chair* du SIG en privé, proposer la ressource, laisser le SIG décider du relais.
3. **Le groupe de travail SFPT** concerné, par courriel au responsable du groupe.
4. **Une pull request vers une liste « awesome »** du domaine — la voie la plus discrète : la ressource est évaluée par un mainteneur tiers, et l'acceptation est un signal externe.
5. **Une liste de diffusion du domaine (NONMEM users, listes de sociétés)** — en dernier, et sous conditions strictes : écrire d'abord au propriétaire de la liste pour demander si l'annonce est bienvenue ; un seul message ; aucune relance ; aucune republication à chaque mise à jour.

**Règle de fréquence :** une annonce par corpus, une fois. Une seconde annonce n'est justifiée que par un événement objectif (parution du DOI, dépôt HAL, traduction complète en anglais) — et il faut alors annoncer l'événement, pas le corpus.

### 4.8 Texte d'annonce — version française

Cible : liste de diffusion, groupe SFPT, message à un responsable de SIG. Objet court, corps factuel, aucun appel à l'action.

> **Objet :** Ressource pédagogique libre en pharmacométrie (français et anglais)
>
> Bonjour,
>
> Je mets à disposition trois corpus pédagogiques en accès libre, que j'ai écrits et que je maintiens :
>
> — **Pharmacométrie Pratique** : 88 chapitres en français et 88 en anglais, 63 visualisations interactives. PK/PD, analyse non compartimentale, pharmacocinétique de population, PBPK, variabilité et erreur résiduelle, estimation bayésienne, validation de modèle et VPC, suivi thérapeutique pharmacologique, posologie individualisée guidée par les modèles, applications en oncologie et en infectiologie, méthodes d'apprentissage automatique. Exemples avec NONMEM, Monolix et nlmixr2.
> https://rberrah.github.io/pharmacometrie/
>
> — **Stat & Biologie** : 45 chapitres de biostatistique appliquée aux sciences de la vie, 10 visualisations interactives.
> https://rberrah.github.io/stats/
>
> — **Internat Pharma** : 186 chapitres couvrant le programme de l'internat en pharmacie, 30 visualisations.
> https://rberrah.github.io/internat/
>
> L'ensemble est sous licence CC BY-SA 4.0 : la réutilisation en cours, l'adaptation et la traduction sont explicitement autorisées, à condition de citer la source. Le corpus est archivé et citable (DOI : 10.5281/zenodo.XXXXXXX). Le code est public.
>
> Les chapitres sont datés et versionnés, et chaque page comporte un lien de signalement d'erreur. Les corrections et les remarques sont les bienvenues et sont créditées.
>
> Bien cordialement,
> Racym Berrah
> Doctorant en pharmacologie, UMR 1248 Pharmacologie & Transplantation (Inserm / Université de Limoges / CHU de Limoges)
> ORCID 0009-0001-6432-2880

### 4.9 Texte d'annonce — version anglaise

> **Subject:** Open-access teaching material in pharmacometrics (French and English)
>
> Dear all,
>
> I maintain three open-access teaching corpora that I have written, and I am making them available to anyone who may find them useful:
>
> — **Practical Pharmacometrics** — 88 chapters in French and 88 in English, with 63 interactive visualisations. Topics include PK/PD, non-compartmental analysis, population pharmacokinetics, PBPK, inter- and intra-individual variability, residual error models, Bayesian estimation and empirical Bayes estimates, model evaluation and VPC, therapeutic drug monitoring, model-informed precision dosing, applications in oncology and infectious diseases, and machine-learning methods in pharmacometrics. Worked examples use NONMEM, Monolix and nlmixr2.
> https://rberrah.github.io/pharmacometrie/
>
> — **Statistics & Biology** — 45 chapters on biostatistics for the life sciences, with 10 interactive visualisations (French).
> https://rberrah.github.io/stats/
>
> — **Internat Pharma** — 186 chapters covering the French pharmacy residency curriculum, with 30 visualisations (French).
> https://rberrah.github.io/internat/
>
> Everything is released under CC BY-SA 4.0, so reuse in teaching, adaptation and translation are explicitly permitted with attribution. The corpus is archived and citable (DOI: 10.5281/zenodo.XXXXXXX), and the source code is public.
>
> Chapters are dated and versioned, and every page carries an error-reporting link. Corrections and comments are welcome and are credited in the revision history.
>
> Kind regards,
> Racym Berrah
> PhD student, UMR 1248 Pharmacology & Transplantation (Inserm / University of Limoges / Limoges University Hospital)
> ORCID 0009-0001-6432-2880

Ce que ces deux textes ne contiennent pas : aucun adjectif évaluatif, aucun superlatif, aucune revendication d'unicité (« le seul corpus francophone » n'est pas vérifiable — l'absence de preuve n'est pas une preuve d'absence), aucune demande de partage, aucune demande de retour, aucun « n'hésitez pas ». Ils contiennent des nombres, des adresses, une licence, un DOI, une affiliation et un identifiant.

### 4.10 Levier institutionnel français à instruire : UNESS / UNSPF

L'**UNESS** (Université Numérique en Santé et Sport) mutualise et diffuse gratuitement des ressources pédagogiques numériques produites par plus de 40 universités françaises, et comporte une composante pharmacie, l'**UNSPF**. Faire référencer les trois corpus — au minimum *Internat Pharma*, qui couvre le programme officiel de l'internat — placerait son nom dans le circuit de recommandation des facultés. C'est le mécanisme d'adoption en syllabus par excellence, sans aucune démarche de sollicitation.

**Point à vérifier avant d'y consacrer du temps :** la procédure d'acceptation d'une ressource produite hors d'une composante universitaire partenaire n'est pas établie. Il est possible que le dépôt doive être porté par un enseignant-chercheur d'une UFR membre — auquel cas la démarche passe par l'université de rattachement. La compatibilité de la licence avec ce circuit est également à confirmer, ce qui renforce l'intérêt de l'arbitrage de licence en étape 0.

---

## 5. Mesure sans traquer

### 5.1 Ce qui est possible sur GitHub Pages

Contrainte structurante : GitHub Pages **ne donne aucun accès aux journaux serveur**. Il n'existe donc pas d'option « analytique côté serveur, invisible pour le visiteur ». Le choix est binaire : soit une mesure côté client, soit pas de mesure côté client — et dans ce second cas, on s'appuie exclusivement sur des signaux externes, ce qui est parfaitement viable.

### 5.2 Analytique sans bandeau de consentement : la règle réelle

Un bandeau de consentement n'est pas requis lorsque la mesure d'audience relève de l'exemption prévue par la CNIL. Les conditions sont cumulatives et strictes :

- finalité **strictement limitée** à la mesure d'audience du site ;
- **pas de recoupement** avec d'autres traitements, pas de suivi inter-sites, pas de profilage individuel ;
- **pas de transmission** des données à des tiers ;
- **adresse IP tronquée** ou non conservée ;
- **durée de conservation limitée** (13 mois pour les traceurs, 25 mois pour les données agrégées) ;
- information des personnes dans une politique de confidentialité accessible.

Configurations compatibles, par ordre de simplicité : **GoatCounter** ou **Umami** auto-hébergés (sans cookie, sans empreinte de navigateur), **Cloudflare Web Analytics** (sans cookie, sans état côté client), **Matomo auto-hébergé en configuration exemptée** (Matomo documente la configuration validée par la CNIL). Toute solution qui pose un cookie d'identification, qui calcule une empreinte de navigateur ou qui transmet les données hors du strict périmètre de mesure d'audience fait retomber dans l'obligation de consentement.

**Recommandation :** commencer sans aucune analytique côté client. Les signaux des sections 5.3 et 5.4 suffisent largement à répondre à la question « le contenu est-il lu ? », et ils sont plus informatifs.

### 5.3 Les trois sources qui remplacent l'analytique

**(a) Google Search Console — la plus utile, et de loin.** Propriété de type **préfixe d'URL** (`https://rberrah.github.io/pharmacometrie/`), validée par un fichier HTML déposé dans `static/`. La propriété de type domaine, qui exige une validation DNS, n'est pas possible sur `github.io`. Aucune donnée personnelle collectée sur le visiteur, aucun bandeau requis : la mesure est faite côté Google, pas côté site.

Ce que Search Console donne, gratuitement et rétrospectivement sur 16 mois :
- les **requêtes** exactes qui amènent des lecteurs — le signal le plus riche sur ce qui manque au corpus ;
- les **impressions et clics par page**, donc le classement réel des chapitres ;
- les **pays** d'origine — l'indicateur direct de portée internationale de la version anglaise ;
- les **liens entrants** (rapport « Liens ») — c'est-à-dire les reprises en syllabus, en billets et en pages de ressources ;
- l'**état d'indexation** page par page : combien des 320 chapitres sont réellement indexés.

Faire de même sur **Bing Webmaster Tools** (procédure équivalente, et permet de soumettre le sitemap via IndexNow).

**(b) GitHub Insights → Traffic.** Vues, visiteurs uniques, clones et **sites référents**, par dépôt. **Piège majeur : GitHub ne conserve que 14 jours d'historique.** Mettre en place une GitHub Action hebdomadaire qui appelle l'API `/repos/{owner}/{repo}/traffic/views` et `/traffic/referrers` et commite le JSON dans un dossier `metrics/` du dépôt. Trois lignes de YAML, et au bout d'un an on dispose d'une série continue que personne d'autre n'a.

**(c) Statistiques des dépôts pérennes.** Zenodo affiche vues et téléchargements par enregistrement. HAL affiche les consultations et téléchargements par notice. OpenAlex expose les citations du DOI. Ces trois chiffres sont ceux qui comptent sur une échelle de dix ans, parce qu'ils survivent aux changements de plateforme.

### 5.4 Les signaux non techniques — ceux qui comptent vraiment

Par ordre décroissant de valeur :

1. **Une reprise en cours.** Un enseignant qui met le lien dans un syllabus. Se détecte via le rapport « Liens » de Search Console, et via une recherche périodique `"rberrah.github.io" site:*.fr` et `site:*.edu`.
2. **Une citation dans un article revu par les pairs.** Se détecte via une alerte Google Scholar sur `"rberrah.github.io"` et sur `"Pharmacométrie Pratique"`, et via les citations du DOI Zenodo dans OpenAlex.
3. **Une demande de traduction.** Le signal le plus fort d'adoption réelle : quelqu'un investit son propre temps.
4. **Une issue de correction ouverte par un inconnu.** Cela signifie que quelqu'un a lu assez attentivement pour trouver une erreur. C'est l'indicateur d'engagement le plus difficile à obtenir et le plus significatif.
5. **Un courriel non sollicité d'un étudiant ou d'un praticien.** Tenir un fichier daté de ces messages (avec leur accord si l'on veut les citer) : ils constituent, au bout de trois ans, le seul dossier qualitatif exploitable dans un dossier de candidature.
6. **Une invitation.** Séminaire, webinaire de SIG, session en congrès. C'est l'indicateur terminal de la stratégie.
7. **Une mention dans une liste de ressources maintenue par un tiers.**

### 5.5 Tableau de bord trimestriel

Six indicateurs, relevés une fois par trimestre, consignés dans un fichier du dépôt :

| Indicateur | Source | Fréquence |
|---|---|---|
| Pages indexées / pages publiées | Search Console | Trimestre |
| Clics et requêtes principales | Search Console | Trimestre |
| Domaines référents distincts | Search Console + GitHub Traffic | Trimestre |
| Téléchargements Zenodo + consultations HAL | Zenodo, HAL | Trimestre |
| Issues et corrections externes | GitHub | Trimestre |
| Faits qualitatifs (courriels, traductions, invitations) | Fichier tenu à la main | Continu |

**À ignorer explicitement :** le nombre de visiteurs, le temps passé sur page, le taux de rebond, les étoiles GitHub, le nombre d'abonnés. Ces chiffres varient pour des raisons qui n'ont rien à voir avec la qualité du corpus, ils ne se citent pas, et les afficher publiquement est un anti-motif unanime sur tous les sites qui font autorité par le contenu.

---

## 6. Feuille de route sur 12 mois

Ordonnée par rapport effet/effort décroissant. Effort en heures de travail effectif.

### Trimestre 1 — Identité et attribution (≈ 30 h)

| # | Action | Effort | Effet | Bloquant pour |
|---|---|---|---|---|
| 1 | **Trancher la licence** (texte + code) | 1 h | Élevé | Tout le reste |
| 2 | Trancher la formulation temporelle du doctorat (contradiction ORCID / « fin de thèse ») | 30 min | Élevé | `/a-propos`, JSON-LD |
| 3 | **Compléter l'ORCID** (article manquant, Education, biographie, affiliation Limoges, visibilité publique) | 1 h 30 | Élevé | Étapes 3, 6, 9 |
| 4 | Autoriser les mises à jour Crossref et DataCite dans ORCID | 15 min | Élevé | Remontée automatique |
| 5 | **Script de comptage** chapitres/visualisations exécuté au build, chiffres injectés partout | 3 h | Élevé | Toute page affichant un chiffre |
| 6 | Ajouter `published_on` au frontmatter des 320 chapitres (script + reprise manuelle) | 4 h | Moyen | Signature, JSON-LD |
| 7 | **Composant de signature** en tête de chapitre (3 sites) | 3 h | Élevé | — |
| 8 | **Composant `<CiteThis />`** avec APA + BibTeX et boutons de copie (3 sites) | 5 h | Élevé | — |
| 9 | Bloc réutilisation + licence + signalement d'erreur en pied de chapitre | 2 h | Élevé | — |
| 10 | Gabarit d'issue `erreur-chapitre.yml` (3 dépôts) | 1 h | Moyen | — |
| 11 | Réécrire `/a-propos/` selon le micro-texte de 1.5 | 2 h | Élevé | — |
| 12 | Créer `/travaux/` groupée par statut | 3 h | Élevé | — |
| 13 | Créer `/citer/` (une par site) | 2 h | Moyen | — |
| 14 | `LICENSE` + `LICENSE-CODE` + section Licence du README (3 dépôts) | 1 h | Élevé | Zenodo, HAL |

### Trimestre 2 — Découvrabilité et citabilité (≈ 32 h)

| # | Action | Effort | Effet |
|---|---|---|---|
| 15 | `canonical` + `meta author` + `rel="me"` ORCID (3 sites) | 2 h | Élevé |
| 16 | **JSON-LD `Person` + `WebSite` + `ProfilePage`** sur le portail | 2 h | Élevé |
| 17 | JSON-LD `Course` sur les 3 accueils | 2 h | Élevé |
| 18 | JSON-LD `LearningResource` généré par chapitre | 4 h | Élevé |
| 19 | Routes `sitemap.xml` prerender + `sitemap_index.xml` + `robots.txt` | 3 h | Élevé |
| 20 | `hreflang` réciproques FR/EN + lien de traduction visible par chapitre | 3 h | Élevé |
| 21 | **Génération des `og:image`** au build (320 images) | 5 h | Moyen-élevé |
| 22 | **Google Search Console** + Bing Webmaster (3 propriétés chacune) | 2 h | Élevé |
| 23 | Nettoyage du dépôt avant archivage (doublon `.pptx`, `.gitattributes`) | 1 h | Moyen |
| 24 | **`CITATION.cff`** (3 dépôts) | 1 h | Élevé |
| 25 | **`.zenodo.json`** (3 dépôts) | 2 h | Élevé |
| 26 | **Intégration GitHub→Zenodo + première release `v2026.1`** (3 dépôts) | 2 h | Élevé |
| 27 | Report des DOI dans `CITATION.cff`, README, `/citer/`, JSON-LD | 1 h | Élevé |
| 28 | GitHub Action d'archivage hebdomadaire des données de trafic | 2 h | Moyen |

### Trimestre 3 — Ancrage institutionnel français (≈ 22 h)

| # | Action | Effort | Effet |
|---|---|---|---|
| 29 | **Créer l'IdHAL** (irréversible : choisir `racym-berrah`) | 30 min | Élevé |
| 30 | **Créer le CV HAL**, vérifier le rattachement des 4 articles à l'UMR 1248 | 2 h | Élevé |
| 31 | **Dépôts HAL / portail CEL** des 3 corpus | 4 h | Élevé |
| 32 | Dépôt logiciel HAL → **Software Heritage / SWHID** | 2 h | Moyen-élevé |
| 33 | **Profil Google Scholar** + alertes sur `"rberrah.github.io"` et sur son nom | 1 h | Élevé |
| 34 | Contacter `secretariat@sfpt-fr.org` : adhésion, groupe « STP & personnalisation », Réseau AVENIR | 1 h | Élevé |
| 35 | Congrès **SFPT / IATDMCT 2026, Rennes** — inscription et préparation | 6 h | Élevé |
| 36 | Vérifier la boucle : DOI → ORCID, Zenodo → OpenAlex, CV HAL indexé | 1 h | Moyen |
| 37 | Instruire la procédure **UNESS / UNSPF** (courriel + retour de l'université) | 2 h | Moyen-élevé, incertain |
| 38 | Page `/interventions/` en mode archive (PAGE 2025, PAGE 2026) | 2 h | Moyen |

### Trimestre 4 — Rayonnement international (≈ 45 h)

| # | Action | Effort | Effet |
|---|---|---|---|
| 39 | **Envoi de l'annonce** (LinkedIn, puis chair de SIG ISoP, puis groupe SFPT) — une fois chacun | 2 h | Moyen-élevé |
| 40 | Rejoindre un **SIG ISoP** (Clinical Pharmacometrics ou SxP / AI/ML SubSIG) + Student/Trainee Community | 2 h | Élevé |
| 41 | **Première contribution open source** : issue documentée puis PR de documentation sur `nlmixr2` / `rxode2` / `mrgsolve` | 8 h | Élevé |
| 42 | **Abstract PAGE** (s'inscrire d'abord, un seul abstract, 450–700 mots structurés) | 12 h | Élevé |
| 43 | Candidature **ISoP/ACoP Trainee Award** | 3 h | Moyen-élevé |
| 44 | Étendre le parcours « IA en pharmacométrie » avec les références réelles du champ (Losada CPT:PSP 2024 ; Bram JPKPD 2024 ; Tosca *Pharmaceutics* 2025 ; Houk CPT 2026 ; Feigelman CPT:PSP 2026 ; Woillard *Therapie* 2026 ; ICH M15) | 12 h | Élevé |
| 45 | **Index dédié des 103 visualisations** en artefacts autonomes (URL stable, titre, légende EN, licence, citation) | 8 h | Élevé |
| 46 | PR vers une liste « awesome » du domaine | 1 h | Moyen |
| 47 | Faire créer l'**item Wikidata** par un tiers (ORCID complet et CV HAL en place) | 1 h | Moyen |
| 48 | Premier relevé du tableau de bord trimestriel | 1 h | Moyen |

### Au-delà de 12 mois — à préparer, pas à planifier

- **Article Tutorial dans CPT:PSP** dérivé d'un parcours du site (30–60 h). À discuter avec l'encadrement, avec citation explicite de la version du site et de son DOI dans les références.
- **Dépôt TEL de la thèse** le jour de la soutenance (2 h) — indexé Google, Scholar et Isidore.
- **Release annuelle** `v2027.1` et notice HAL correspondante (3 h/an).
- **Extraction des visualisations en paquet réutilisable** et soumission JOSS (40 h+), sous réserve de licence OSI et de maintenabilité.
- **Un chapitre sur la critique du terme « jumeau numérique »** (Houk ; Feigelman) — mais lire les textes intégraux avant de les citer, ils sont sous accès restreint et une paraphrase approximative d'un article critique est le genre d'erreur qu'un pair repère immédiatement.

### Les cinq actions les plus rentables, si le temps manque

1. Compléter l'ORCID et autoriser les mises à jour automatiques — **1 h 45**.
2. Créer l'IdHAL, le CV HAL et déposer les 3 corpus dans le portail CEL — **6 h 30**. C'est ce qui met le nom dans Google Scholar.
3. Poser le JSON-LD `Person` + `LearningResource` et le sitemap — **8 h**.
4. Composant de signature + bloc de citation sur les 3 sites — **8 h**. C'est ce qui transforme 320 pages en 320 objets citables.
5. Ouvrir Google Search Console — **1 h**. C'est ce qui rend le reste mesurable.

Total : **25 heures** pour la quasi-totalité de l'effet structurel.

---

## Annexe — Garde-fous factuels (à ne jamais écrire sur le site)

- « Paris » comme lieu de l'unité. L'UMR 1248 est à **Limoges** ; l'ORCID affiche Paris par artefact de métadonnées Inserm.
- « En fin de thèse » — contradiction avec l'ORCID public (01/11/2025 – 31/10/2028), à trancher avant toute formulation temporelle.
- « JUMP PHARMA » présenté comme un projet financé, un programme labellisé, un projet ANR, une thèse CIFRE ou un consortium. Aucune existence publique vérifiable. Au mieux : intitulé de thèse, présenté comme tel.
- « Membre du consortium DIGPHAT ». Non établi. Formulation sûre si le sujet est abordé : « doctorant à l'UMR Inserm 1248, où est coordonné DIGPHAT ».
- Le nom d'un directeur de thèse, d'un encadrant ou d'un mentor sans confirmation directe de l'intéressé. Les co-auteurs vérifiés ne peuvent apparaître que dans les références bibliographiques.
- Toute mention d'un financement ou d'une bourse. Inconnu.
- Tout indicateur bibliométrique (citations, h-index). Inconnu, aucun profil Scholar localisé.
- Un titre pour la communication PAGE 2026 (Dubrovnik). Seule la présence dans la liste des présentateurs est confirmée.
- « Membre de l'IATDMCT Pharmacometrics Group ». Non établi ; ce qui l'est, c'est la signature collective sur l'article de *Therapeutic Drug Monitoring*.
- « Le seul corpus francophone » / « il n'existe pas d'équivalent ». Recherche non exhaustive. Formulation prudente si nécessaire : « je n'ai pas connaissance d'équivalent francophone en accès libre ».
- Toute revendication d'antériorité sur l'articulation modèles de langage × jumeau pharmacologique. Positionner sur la qualité de l'exposition du sujet, jamais sur une primeur.
- Des balises `citation_*` (Highwire Press) sur les pages de chapitres.
- Une adresse postale de l'unité : deux adresses circulent, aucune n'est confirmée. Omettre.