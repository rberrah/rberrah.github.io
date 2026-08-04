# 05 — Checklist de citabilité : ORCID, HAL, Zenodo, Google Scholar

**Nature de ce document.** Tout ce qui suit relève d'actions que **seul l'auteur** peut
faire : création de comptes, saisie de métadonnées personnelles, dépôts signés. Aucune de
ces étapes n'est automatisable depuis le dépôt. Les fichiers `CITATION.cff`, `LICENSE`,
`LICENSE-CONTENT.md`, `sitemap.xml` et `robots.txt` sont déjà en place ; ils attendent les
identifiants que ces étapes produisent.

**Comment lire.** Chaque étape indique : *quoi faire* — *où* — *ce qu'il faut saisir
exactement* — *le piège*. Les blocs `à saisir exactement` sont à copier tels quels : ils
garantissent qu'une même chaîne de caractères apparaît partout, ce qui est précisément ce
qui permet aux outils de désambiguïsation de relier les enregistrements entre eux.

**Ordre.** Il n'est pas indifférent. ORCID conditionne HAL et Zenodo ; HAL conditionne la
visibilité dans Google Scholar ; Zenodo produit le DOI qui sera reporté partout ailleurs.
Fait dans le désordre, l'ensemble est à refaire.

| # | Étape | Durée | Prérequis |
|---|---|---|---|
| 1 | Compléter l'ORCID | 1 h 30 | — |
| 2 | Autoriser Crossref et DataCite dans l'ORCID | 15 min | 1 |
| 3 | HAL : IdHAL, CV HAL, affiliations | 2 h | 1 |
| 4 | HAL : déposer les trois cours dans le portail CEL | 4 h | 3 |
| 5 | HAL : déposer le code → Software Heritage / SWHID | 2 h | 3 |
| 6 | Zenodo : intégration GitHub et première release | 1 h 30 | 1, 2 |
| 7 | Google Scholar : profil et vérification | 1 h | 3 |
| 8 | Reporter les identifiants dans le site | 1 h 30 | 5, 6, 7 |
| 9 | Vérifier la boucle | 30 min | 8 (+ 4 à 8 semaines) |

---

## 1. ORCID — à faire en premier, avant toute autre chose

> **État au 4 août 2026 — relevé sur l'API publique `pub.orcid.org`.**
> Cette section est **en grande partie faite**. Ce qui a été constaté :
>
> | Point | État |
> |---|---|
> | 1.1 Article manquant | **fait** — 5 travaux, dont *Scientific Reports* 2026, DOI `10.1038/s41598-026-57614-y` (ce DOI a été reporté sur `/recherche/` et `/research/`, texte et JSON-LD) |
> | 1.3 Education | **fait** — PharmD, Université Paris Cité (reporté en `alumniOf` dans le JSON-LD de `/` et `/a-propos/`) |
> | 1.2 Affiliation « Limoges » | **partiel** — `department-name` porte bien « U1248 : Pharmacology & Transplantation », mais la ville affichée reste *Paris*. C'est le registre d'organisations d'ORCID qui rattache l'INSERM à son siège parisien : voir §1.2 pour la contourner (saisir l'organisation par son identifiant ROR de l'unité, ou préciser la ville dans le champ libre). Non bloquant, mais un pair du domaine le remarque. |
> | 1.4 Biographie | **à faire** — encore vide |
> | 1.5 Liens | **à faire** — aucun `researcher-url`. C'est le plus rentable des trois restants : c'est l'arête retour ORCID → site, celle qui ferme le graphe d'identité que le reste du travail construit. Ajouter `https://rberrah.github.io/`. |
> | Mots-clés | **à faire** — aucun. Ils alimentent la recherche interne d'ORCID. |
>
> Ordre conseillé pour finir : **1.5 (liens) → 1.4 (biographie) → mots-clés → 1.2 (ville)**.

**Pourquoi en premier.** Le site va afficher l'ORCID en pied de page, dans le JSON-LD,
dans les trois `CITATION.cff` et dans chaque notice de dépôt. Lier un ORCID lacunaire
depuis une vitrine soignée produit l'effet inverse de celui recherché : le visiteur qui
clique arrive sur une fiche incomplète et en conclut que le reste l'est aussi. Un ORCID
complet est bon marché ; un ORCID vide coûte cher.

**Où.** <https://orcid.org/0009-0001-6432-2880> → *Sign in* → chaque section a un bouton
`+ Add`.

### 1.1 Ajouter l'article manquant

`Works` → `+ Add` → `Search & link` → source **Crossref Metadata Search** ou **Europe PMC**.

Article absent de la fiche à ce jour :

> El Balkhi S, **Berrah R**, Sauvage FL, Le Du L, Rahali MA, Lakis R, Marquet P,
> Saint-Marcoux F, Loustaud-Ratti V, Carrier P. *Human serum albumin profiling by top-down
> analysis enables multi-class liver fibrosis staging.* Scientific Reports, 2026.

Vérifier ensuite que **chacun** des travaux déjà présents porte bien son DOI et sa source :

- Berrah R, Minichmayr I, Woillard JB ; IATDMCT Pharmacometrics Group. *Better Dosing
  Through Better Error: Residual Error as a Hidden Lever in Model-Informed Precision
  Dosing.* Therapeutic Drug Monitoring, 2026. `10.1097/FTD.0000000000001413`
- Berrah R, Saint-Marcoux F, Monchaud C, Cointault O, Conseil M, Jaber S, Jung B,
  Woillard JB. *From AUC/MIC to AUCss and Cmin: Optimizing Micafungin Therapy in the
  Critically Ill through Model-Informed Precision Dosing.* The AAPS Journal, 2025.
  `10.1208/s12248-025-01173-z`
- Magreault S, Berrah R, Kerroumi Y, Mimram L, Salmon D, Goulenok T, de la Selle A,
  Lefort A, Marmor S, El Helali N, Zeller V, Jullien V. *Dosing and route of
  administration of clindamycin given in combination with rifampicin.* Clinical
  Microbiology and Infection, 2025. `10.1016/j.cmi.2025.01.005`

> **Piège.** Un travail ajouté à la main (source « Racym Berrah ») a moins de valeur
> probante qu'un travail lié depuis Crossref ou Europe PMC : les moissonneurs distinguent
> les deux. Toujours passer par `Search & link` ; la saisie manuelle est le dernier
> recours.

### 1.2 Corriger l'affiliation — écrire Limoges, pas Paris

`Employment` → `+ Add`.

La fiche affiche aujourd'hui « Inserm, Paris, France » parce que l'organisation ORCID de
l'Inserm pointe sur le siège parisien. C'est un artefact du registre d'organisations, pas
une erreur de saisie — et c'est une erreur qu'un pair du domaine repère immédiatement. La
correction consiste à ajouter une entrée dont l'organisation est **localisée à Limoges**,
et à porter le nom de l'unité dans le champ *Department*.

**À saisir exactement :**

```
Organization : Université de Limoges          (choisir l'entrée située à Limoges, FR)
Department   : UMR 1248 Pharmacologie et Transplantation (INSERM, CHU de Limoges)
Role / title : Doctorant en pharmacologie
Start date   : 2025-11
End date     : (laisser vide)
URL          : https://www.unilim.fr/p-and-t/
```

> **Piège 1.** Ne pas supprimer l'entrée Inserm existante : la supprimer casserait le lien
> déjà établi avec les notices qui la référencent. Ajouter l'entrée Limoges et, si
> l'interface le permet, la faire remonter en tête.
>
> **Piège 2.** Le champ *End date* doit rester **vide**. Une date de fin sur une entrée
> de doctorat se lit comme une date de soutenance annoncée. Aucune date de soutenance ne
> doit apparaître nulle part — ni ici, ni sur le site.

### 1.3 Renseigner Education

`Education and qualifications` → `+ Add`.

```
Diplôme de docteur en pharmacie (PharmD)
Organization : (établissement de délivrance)
Start / End  : (années réelles)
```

Puis une seconde entrée pour le doctorat en cours :

```
Doctorat en pharmacologie
Organization : Université de Limoges
Department   : UMR 1248 Pharmacologie et Transplantation
Start date   : 2025-11
End date     : (laisser vide)
```

> **Piège.** Même règle qu'en 1.2 : pas de date de fin.

### 1.4 Rédiger la biographie

`Biography` → `Edit`.

Une seule formulation, partout : la biographie ORCID doit être **identique** au paragraphe
de `/a-propos/`. Deux versions légèrement différentes du même paragraphe se remarquent et
donnent l'impression d'un texte réécrit pour l'occasion.

**À saisir exactement (version française) :**

```
Docteur en pharmacie et doctorant en pharmacologie à l'unité INSERM UMR 1248
« Pharmacologie et Transplantation », portée par l'Université de Limoges, l'INSERM et le
CHU de Limoges. Membre du consortium DIGPHAT, qui travaille sur les jumeaux
pharmacologiques numériques. Mes travaux publiés portent sur l'adaptation de dose guidée
par les modèles : le traitement de l'erreur résiduelle dans le calcul des expositions
individuelles, et l'optimisation posologique des antifongiques chez le patient de
réanimation. Ma thèse s'intitule « JUMP PHARMA : création de JUMeaux numériques
Pharmacologiques par approche hybride : exploitation des modèles mécanistiques et des
large language models en PHARMAcologie » ; elle repose sur une idée simple : le modèle de
langage est une couche d'assemblage, de paramétrage et de documentation, pas un substitut
à la structure. J'écris par ailleurs trois cours ouverts en français — pharmacométrie,
internat en pharmacie, biostatistique — soit 319 chapitres, dont 88 traduits en anglais,
et 103 visualisations interactives : https://rberrah.github.io/
```

Si une version anglaise est souhaitée, utiliser **cette traduction et elle seule**, à
l'identique, partout où l'anglais est nécessaire :

```
the language model is an assembly, parameterisation and documentation layer, not a
substitute for structure.
```

> **Piège.** Ne jamais écrire l'intitulé de la thèse comme un acronyme de programme ni
> comme un nom de section : il se cite entre guillemets, en entier, ou pas du tout.

### 1.5 Renseigner les liens

`Websites & social links` → `+ Add`, dans cet ordre :

```
Site           https://rberrah.github.io/
Recherche      https://rberrah.github.io/recherche/
CV HAL         https://cv.hal.science/racym-berrah      (à ajouter après l'étape 3)
GitHub         https://github.com/rberrah
LinkedIn       https://www.linkedin.com/in/racym-berrah-114387175/
Google Scholar (à ajouter après l'étape 7)
```

Cette réciprocité — le site pointe vers l'ORCID, l'ORCID pointe vers le site — est
exactement ce qui permet aux outils de désambiguïsation de fermer la boucle. Un lien dans
un seul sens ne suffit pas.

### 1.6 Régler la visibilité

Pour **chaque** section (Works, Employment, Education, Biography, Websites) : icône de
visibilité → **Everyone**.

> **Piège majeur.** ORCID a trois niveaux de visibilité et le défaut n'est pas public pour
> tous les champs. Un ORCID « public » dont les *works* sont réglés sur *Trusted parties*
> est invisible pour les moissonneurs : la fiche paraît complète à son propriétaire et
> vide à tout le monde. Vérifier en ouvrant la page en navigation privée, déconnecté.

---

## 2. Autoriser les mises à jour automatiques

**Où.** ORCID → `Inbox` / `Account settings` → *Trusted organizations*.

Autoriser **Crossref** et **DataCite**, une fois pour toutes. À partir de là, tout DOI dont
les métadonnées contiennent l'iD ORCID remonte automatiquement dans le profil, sans
intervention.

> **Piège.** L'autorisation ne rétroagit pas sur les DOI déjà publiés sans l'iD. C'est la
> raison pour laquelle l'ORCID doit figurer dans les métadonnées Zenodo **avant** la
> première publication (étape 6), et non après.

---

## 3. HAL — l'IdHAL et le CV

**Pourquoi HAL avant Zenodo.** C'est le point le plus souvent mal compris de toute cette
chaîne. **Zenodo n'est pas indexée par Google Scholar** — position officielle de Zenodo,
motivée par le fait que Scholar déduit le type de ressource du motif d'URL alors que
Zenodo autorise le changement de type après publication. Zenodo apporte le DOI, le
versionnement, l'archivage pérenne, OpenAlex et Google Dataset Search : c'est beaucoup,
mais pas Scholar. **HAL, elle, est indexée par Google et par Google Scholar.** Si
l'objectif est qu'une recherche sur le nom renvoie une page institutionnelle stable, c'est
HAL qui le produit, et Zenodo qui produit l'identifiant. Faire HAL d'abord, c'est obtenir
le résultat visible en premier.

Cet ordre a une contrepartie qu'il faut connaître pour ne pas la subir : au moment des
dépôts HAL, le DOI Zenodo n'existe pas encore. Les notices HAL sont **modifiables** — il
suffira de revenir y ajouter le DOI en identifiant lié après l'étape 6. C'est prévu à
l'étape 8.

**Où.** <https://hal.science/> → créer un compte avec l'adresse institutionnelle.

### 3.1 Créer l'IdHAL

`Mon espace` → `Mon profil` → `Mon IdHAL`.

**À saisir exactement :**

```
racym-berrah
```

> **Piège, irréversible.** L'IdHAL n'est **pas modifiable après création** et compose
> l'URL publique du CV. Le saisir en minuscules, sans accent, sans initiale, sans année.
> Une coquille ici est définitive.

> **Second piège.** La création de l'IdHAL demande de **regrouper toutes les formes
> auteur** : « Berrah R. », « R. Berrah », « Racym Berrah » et toute variante créée par un
> coauteur déposant. Une forme oubliée, et les publications qui y sont rattachées
> n'apparaîtront jamais sur le CV. Chercher chaque variante avant de valider.

### 3.2 Créer le CV HAL

`Mon espace` → `Mon CV`.

Page publique, URL stable, alimentée automatiquement par les dépôts, sans aucun entretien
ensuite. URL résultante :

```
https://cv.hal.science/racym-berrah
```

Renseigner : la photo (facultative), la biographie (**la même qu'en 1.4**), l'ORCID,
l'affiliation, le lien vers <https://rberrah.github.io/>.

### 3.3 Vérifier les affiliations des publications

Pour chaque publication indexée sous son nom, vérifier que l'affiliation pointe sur la
structure **UMR 1248 Pharmacologie et Transplantation** valide. Certaines notices déposées
par des coauteurs portent une affiliation absente, obsolète ou dupliquée.

> **Piège.** HAL contient des structures « obsolètes » et des doublons visuellement
> identiques. Choisir systématiquement celle marquée **valide** ; en cas de doute,
> demander l'arbitrage au référent HAL de l'unité plutôt que de créer une nouvelle
> structure.

### 3.4 Déposer les trois cours dans le portail CEL

**Où.** <https://cel.hal.science/> → `Déposer` → type de document : **Cours**.

Trois notices, une par corpus :

| Titre | URL | Volume |
|---|---|---|
| Pharmacométrie Pratique | https://rberrah.github.io/pharmacometrie/ | 88 chapitres FR, 88 EN, 63 visualisations |
| Internat Pharma | https://rberrah.github.io/internat/ | 186 chapitres, 30 visualisations |
| Stat & Biologie | https://rberrah.github.io/stats/ | 45 chapitres, 10 visualisations |

Pour chacune : affiliation UMR 1248, licence **CC BY-SA 4.0**, lien vers le site en
document associé, résumé repris du `CITATION.cff` correspondant (champ `abstract`), et —
après l'étape 6 — le DOI Zenodo en identifiant lié.

> **Piège.** Le formulaire CEL demande le **domaine**, le **niveau** et le **public visé**.
> Ces trois champs conditionnent la remontée dans les moteurs de recherche pédagogique et
> sont trop souvent bâclés. Les remplir sérieusement : niveau « Master / 3e cycle » pour
> la pharmacométrie et l'internat, « Licence / Master » pour la biostatistique.

### 3.5 Déposer le code — Software Heritage et SWHID

**Où.** HAL → `Déposer` → type de document : **Logiciel**.

HAL archive automatiquement le dépôt dans **Software Heritage** et délivre un **SWHID**,
identifiant intrinsèque calculé depuis le contenu lui-même (normalisé ISO/IEC 18670). Un
SWHID ne dépend d'aucun registre : il reste vérifiable même si la plateforme d'origine
disparaît. C'est l'identifiant le plus durable de toute cette chaîne.

Trois dépôts à référencer :

```
https://github.com/rberrah/rberrah.github.io
https://github.com/rberrah/internat
https://github.com/rberrah/stats
```

> **Piège.** Le dépôt logiciel exige que le dépôt GitHub soit **public** et pointe une
> **version précise** (tag ou commit). Le faire après avoir créé le tag `v2026.1` de
> l'étape 6, sinon l'archive porte sur un état intermédiaire du code.

### 3.6 TEL — plus tard

Le dépôt de la thèse dans **TEL** se fait après la soutenance. TEL est indexé par Google,
Google Scholar et Isidore ; c'est le dépôt qui apportera le plus de visibilité, le moment
venu.

> **Piège rédactionnel, permanent.** Aucune date de soutenance, aucune échéance, aucune
> formulation suggérant une échéance ne doit apparaître sur le site, dans une notice, dans
> une biographie ou dans un profil. Le doctorat est en cours ; c'est tout ce qui s'écrit.

---

## 4. Zenodo — le DOI

**Où.** <https://zenodo.org/>

### 4.1 Se connecter avec le compte GitHub

L'intégration GitHub → Zenodo ne fonctionne **que** si la connexion à Zenodo se fait via
GitHub. Une connexion par courriel crée un compte distinct qui ne verra jamais les dépôts.

### 4.2 Activer les dépôts, puis créer la release

`Zenodo` → `Settings` → `GitHub` → autoriser l'accès, puis basculer l'interrupteur sur
**ON** pour les trois dépôts :

```
rberrah/rberrah.github.io
rberrah/internat
rberrah/stats
```

**Puis seulement**, créer la release GitHub de chaque dépôt :

```
Tag     : v2026.1
Titre   : Pharmacométrie Pratique 2026.1     (resp. Internat Pharma 2026.1, Stat & Biologie 2026.1)
Corps   : résumé du contenu et des changements de l'année
```

> **Piège le plus fréquent de toute cette liste.** L'interrupteur doit être activé
> **avant** la release. Zenodo ne rattrape aucune release antérieure à l'activation. Une
> release créée trop tôt est perdue : il faut en créer une autre.
>
> **Piège 2.** Le dépôt doit être **public** au moment de la release.
>
> **Piège 3.** Ce que Zenodo archive est publié sous DOI, définitivement. Vérifier avant
> la release qu'aucun fichier tiers non redistribuable ne se trouve dans le dépôt suivi
> par git (voir l'étape 4 du document `03-notoriete-et-citabilite.md` : diaporamas,
> images de diapositives, doublons de `.pptx`).

### 4.3 Renseigner les métadonnées

Le fichier `.zenodo.json` (modèle complet dans `03-notoriete-et-citabilite.md`, étape 5)
préremplit la notice. Points non négociables :

```
upload_type : lesson
license     : cc-by-sa-4.0
orcid       : 0009-0001-6432-2880          ← sans le préfixe https://orcid.org/
creators    : Berrah, Racym
affiliation : UMR 1248 Pharmacologie et Transplantation, INSERM, Université de Limoges, CHU de Limoges
```

> **Piège.** `upload_type: lesson` est le type qui décrit correctement un corpus de cours
> et conditionne la découvrabilité de la notice. L'`orcid` s'écrit **sans** préfixe. Les
> identifiants de licence Zenodo sont en minuscules et diffèrent parfois de SPDX : les
> vérifier dans l'interface avant publication.

### 4.4 Distinguer les deux DOI

Zenodo émet **deux** DOI par dépôt :

- le **DOI de concept** — résout toujours vers la dernière version. C'est celui qu'on
  **affiche sur le site** et dans les blocs de citation des chapitres ;
- le **DOI de version** — pointe une release figée. C'est celui qu'on **recommande dans
  une citation précise**, parce qu'il garantit que le lecteur verra le texte que l'auteur
  citait.

La page `/citer/` doit afficher les deux et expliquer la différence en une phrase.

> **Piège.** Modifier des **métadonnées** ne crée ni version ni DOI nouveau. Modifier des
> **fichiers** impose une nouvelle version. À retenir pour les corrections de coquilles :
> une coquille dans la notice se corrige sans conséquence.
>
> **Cadence : une release par an** (`v2026.1`, `v2027.1`). Une release par correction
> produirait vingt DOI par an et diluerait le corpus. Réserver une release intermédiaire
> (`v2026.2`) aux ajouts substantiels.

---

## 5. Google Scholar — attentes calibrées

**Où.** <https://scholar.google.com/citations> → *My profile*.

### 5.1 Créer le profil

Renseigner : nom `Racym Berrah`, affiliation `UMR 1248 Pharmacologie et Transplantation,
INSERM, Université de Limoges, CHU de Limoges`, domaines d'intérêt (`pharmacometrics`,
`model-informed precision dosing`, `population pharmacokinetics`, `therapeutic drug
monitoring`), page personnelle `https://rberrah.github.io/`.

Rendre le profil **public**.

> **Piège.** Un profil Scholar n'apparaît dans les résultats de recherche qu'après
> **vérification d'une adresse de courriel institutionnelle** (domaine universitaire ou
> hospitalier). Avec une adresse personnelle, le profil existe mais reste introuvable —
> c'est-à-dire inutile.

### 5.2 Relier le profil à l'ORCID

Scholar n'a pas de champ ORCID natif. La liaison se fait par réciprocité :

- dans **Scholar**, le champ *Homepage* pointe sur `https://rberrah.github.io/` — page qui
  déclare l'ORCID en `rel="me"` et dans le JSON-LD ;
- dans **ORCID**, ajouter l'URL du profil Scholar dans `Websites & social links` (étape
  1.5) ;
- sur la page `/recherche/`, la ligne « Identifiants » liste ORCID, CV HAL, Scholar,
  GitHub.

### 5.3 Vérifier l'attribution

Scholar attribue automatiquement, et se trompe régulièrement sur les noms peu fréquents.
Vérifier une par une la présence et l'exactitude des entrées correspondant aux articles
listés en 1.1, retirer les homonymes attribués à tort, et fusionner les doublons
(version acceptée / version éditeur d'un même article apparaissent souvent séparément).

Passer les alertes en mode manuel : `Settings` → décocher l'ajout automatique d'articles,
pour éviter qu'un homonyme ne réapparaisse.

### 5.4 Ce qui remontera, ce qui ne remontera pas

Remonteront : les articles, les notices HAL, et la thèse via TEL le moment venu.

Ne remonteront probablement pas : les chapitres de cours. Les *Inclusion Guidelines* de
Scholar restreignent l'éligibilité aux articles de revue, actes de congrès, rapports
techniques, thèses, preprints, postprints et résumés. Le matériel pédagogique n'entre dans
aucune de ces catégories. Ce n'est pas un échec : c'est le périmètre du service.

> **Piège majeur, à respecter absolument.** **Ne pas poser de balises `citation_*`
> (Highwire Press) sur les pages de chapitres.** Baliser comme un article une page qui
> n'en est pas expose au rejet et, plus grave encore, à une réputation de manipulation
> auprès d'un service qui filtre manuellement. Les balises `citation_*` ne se justifient
> que sur une page hébergeant un vrai document — un PDF de preprint, un tutoriel, un
> résumé de communication. Le balisage correct pour un chapitre est le JSON-LD
> `LearningResource`, déjà prévu.

---

## 6. Reporter les identifiants dans le site

À faire une fois les étapes 3 à 5 terminées, en une seule passe. Les identifiants
concernés :

```
DOI de concept   10.5281/zenodo.XXXXXXX          (un par cours)
DOI de version   10.5281/zenodo.YYYYYYY          (un par release)
IdHAL            racym-berrah
CV HAL           https://cv.hal.science/racym-berrah
SWHID            swh:1:dir:...                    (un par dépôt)
Google Scholar   https://scholar.google.com/citations?user=...
```

Où les reporter, exhaustivement :

| Emplacement | Fichier / page | Quoi |
|---|---|---|
| Page « Comment citer » | `portal/citer/index.html` | DOI de concept **et** de version des trois cours, avec la phrase qui explique lequel utiliser ; SWHID pour le code |
| Bloc de citation en pied de chapitre | gabarit de chapitre des trois sites | DOI de **concept** uniquement |
| Fichier de citation | `CITATION.cff` × 3 | décommenter le bloc `identifiers`, y placer le DOI de concept |
| Fichier `README` | `README.md` × 3 | ligne « Citer ce cours » avec le DOI de concept |
| Données structurées | `portal/index.html` (JSON-LD `Person`) | ajouter le CV HAL et le profil Scholar dans `sameAs` |
| Page Recherche | `portal/recherche/index.html` et `portal/research/index.html` | ligne « Identifiants » : ORCID · CV HAL · Scholar · GitHub |
| Notices HAL | portail CEL | le DOI Zenodo en **identifiant lié** (revenir sur les trois notices de l'étape 3.4) |
| ORCID | `Websites & social links` | CV HAL et profil Scholar (complète l'étape 1.5) |

> **Piège.** Ne jamais écrire un DOI provisoire ou inventé « en attendant ». Un
> identifiant faux est strictement pire qu'un identifiant absent : il est copié par le
> premier lecteur qui cite, et il ne se rattrape plus. Les blocs `identifiers` des trois
> `CITATION.cff` sont pour cette raison livrés **commentés**, avec la valeur en
> `XXXXXXX` : ils ne peuvent pas être publiés par inadvertance.

---

## 7. Vérifier la boucle — 4 à 8 semaines plus tard

Cinq contrôles, trente minutes :

1. Le DOI Zenodo apparaît-il **dans l'ORCID** ? (via l'auto-update DataCite autorisé à
   l'étape 2)
2. L'enregistrement Zenodo apparaît-il dans **OpenAlex** ? (OpenAlex moissonne Crossref,
   DataCite, PubMed, HAL, ORCID et Zenodo)
3. Le **CV HAL** apparaît-il dans une recherche Google sur « Racym Berrah » ?
4. L'encadré **« Cite this repository »** s'affiche-t-il sur les trois dépôts GitHub ?
   Sinon, le `CITATION.cff` est invalide ou n'est pas sur la branche par défaut.
5. Le **sitemap index** est-il accepté dans la Search Console
   (`https://rberrah.github.io/sitemap-index.xml`) et les quatre sitemaps enfants lus sans
   erreur ?

Poser deux alertes Google Scholar : une sur `"rberrah.github.io"`, une sur
`"Pharmacométrie Pratique"`. Ce sont elles qui signaleront la première reprise du corpus
par un tiers.

---

## Annexe — valeurs canoniques

Une seule chaîne de caractères par notion, réutilisée partout sans variation. C'est ce qui
permet aux outils de désambiguïsation de relier les enregistrements ; c'est aussi ce qui
évite les incohérences visibles entre le site, l'ORCID et les notices.

```
Nom                Racym Berrah
Qualité            Docteur en pharmacie (PharmD) · doctorant en pharmacologie
ORCID              0009-0001-6432-2880
ORCID (URL)        https://orcid.org/0009-0001-6432-2880
Unité              UMR 1248 Pharmacologie et Transplantation
Affiliation longue UMR 1248 Pharmacologie et Transplantation, INSERM, Université de Limoges, CHU de Limoges
Ville              Limoges
Consortium         DIGPHAT
IdHAL              racym-berrah
CV HAL             https://cv.hal.science/racym-berrah
GitHub             https://github.com/rberrah
LinkedIn           https://www.linkedin.com/in/racym-berrah-114387175/
Portail            https://rberrah.github.io/
Licence du texte   CC BY-SA 4.0 — https://creativecommons.org/licenses/by-sa/4.0/
SPDX               CC-BY-SA-4.0
Licence du code    MIT
Version courante   2026.1
```

**Volumes** — les seuls chiffres autorisés :

```
Pharmacométrie Pratique   88 chapitres FR · 88 EN · 63 visualisations
Internat Pharma          186 chapitres      · 30 visualisations
Stat & Biologie           45 chapitres      · 10 visualisations
Total                    319 chapitres FR · 88 traduits en anglais · 103 visualisations
```

**Intitulé de la thèse** — se cite entre guillemets, en entier, jamais comme un acronyme
de programme ni comme un titre de section :

```
« JUMP PHARMA : création de JUMeaux numériques Pharmacologiques par approche hybride :
exploitation des modèles mécanistiques et des large language models en PHARMAcologie »
```

**Phrase canonique** — à reproduire à l'identique partout où la thèse est résumée :

```
le modèle de langage est une couche d'assemblage, de paramétrage et de documentation,
pas un substitut à la structure.
```

**Communications** :

```
PAGE 2025, Thessalonique (Grèce), 4-6 juin 2025 — abstract I-034, poster :
  « Impact of Residual Error Handling on Model Informed Precision Dosing and AUC
    Calculation: A Case Study with Tacrolimus »
PAGE 2026, Dubrovnik (Croatie), 2-5 juin 2026 — participation annoncée.
```

---

## Ce que ce document ne couvre pas

- **Wikidata.** À créer par un tiers, et seulement une fois l'ORCID complet et le CV HAL
  en place. Un item créé trop tôt naît vide et attire une demande de suppression.
- **Le dépôt TEL de la thèse.** Après la soutenance.
- **La publication d'un tutoriel dérivé.** Piste discutée dans
  `03-notoriete-et-citabilite.md` (étape 10) ; elle suppose un arbitrage avec
  l'encadrement, et la règle déontologique y est explicite : tout dérivé publié doit citer
  la version du site et son DOI dans les références, et le mentionner dans la lettre à
  l'éditeur.
