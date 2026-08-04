# Livrable — /recherche et /a-propos

Vérifications faites dans le dépôt avant rédaction (`Base/rberrah.github.io`) : `adapter-static`, `trailingSlash: 'always'`, `prerender.entries: ['*']` ; chapitres = fichiers `.md` dans `src/content/chapters/` → **89 FR** (racine) et **88 EN** (`/en`) — les chiffres du brief pour le site 1 sont confirmés localement. Le portail (`portal/index.html` + `404.html`) est du HTML statique brut. Il existe déjà un `/a-propos` **dans l'app pharmacométrie**, qui parle du *site*, pas de la personne.

**Conséquence d'architecture, à trancher en premier :**

| URL | Objet | Support |
|---|---|---|
| `rberrah.github.io/recherche/` | la recherche, la personne | portail (nouveau) |
| `rberrah.github.io/a-propos/` | la personne, le projet éditorial | portail (nouveau) |
| `rberrah.github.io/pharmacometrie/a-propos/` | ce cours-là | app existante — **à renommer « À propos de ce cours »** pour lever la collision |

Les deux nouvelles pages vivent au niveau **portail**, pas dans l'app pharmacométrie : elles couvrent les trois sites, pas un seul.

---

# 1. La règle d'or

## Énoncé

> **On ne place jamais en haut de page une mesure de soi qu'on ne peut pas remplir.**
> Une liste de publications n'est pas une information : c'est un *proxy*. Le lecteur ne veut pas savoir combien d'articles existent, il veut savoir si la personne sait de quoi elle parle. On ne cache donc pas la liste — on la remet à sa place de proxy, après la chose qu'elle est censée prouver.

## Pourquoi ce n'est ni un mensonge ni une dissimulation

Trois tests, à appliquer à chaque phrase des deux pages :

1. **Test du retrait** — est-ce qu'un fait a été supprimé ? Non : les 4 articles sont présents, avec DOI cliquables, atteignables sans clic supplémentaire depuis `/recherche`. Seul l'**ordre** change. L'ordre est une décision éditoriale, pas une omission.
2. **Test du pair** — un relecteur du domaine trouve-t-il une seule phrase contestable ? Chaque affirmation doit avoir une URL derrière elle.
3. **Test du miroir** — la page dirait-elle la même chose si l'auteur avait 40 articles ? Si oui, la structure est honnête. Si la structure n'existe que pour masquer un manque, elle se verra.

## Ce qu'on met à la place, dans cet ordre

| Rang | Contenu | Pourquoi ça marche | Coût en publications |
|---|---|---|---|
| 1 | **La question de recherche**, formulée précisément | Savoir formuler sa question place déjà devant beaucoup de gens qui ont plus d'articles | 0 |
| 2 | **La carte du champ**, avec ses vraies références (ICH M15, DIGPHAT/*Therapie* 2026, Tosca 2025, Houk 2026) | Savoir situer son travail est le signal de maturité le plus lisible par un pair | 0 |
| 3 | **Ce que le sujet n'est pas** (désamorçage des critiques connues) | Citer la critique de son propre champ avant qu'on vous l'oppose est le geste le plus crédibilisant qui existe | 0 |
| 4 | **Le corpus pédagogique**, chiffré, daté, sourcé | 322 chapitres, c'est plus long à produire que 4 articles, et c'est vérifiable en un clic | 0 |
| 5 | **Les travaux**, groupés par statut | Les 4 articles apparaissent au milieu de productions réelles, sans être la mesure de tout | — |
| 6 | **Les questions ouvertes** | Un doctorant qui sait ce qu'il ne sait pas encore lit comme un chercheur ; un doctorant qui n'expose que des résultats lit comme un étudiant | 0 |

## La contre-règle (à ne pas oublier)

Ne pas surcorriger en dissimulation. **Les publications doivent être atteignables en un défilement depuis le haut de `/recherche`.** Et on n'invente jamais de rubrique de remplissage (« Compétences », « Centres d'intérêt », « Outils maîtrisés ») : le vide se remplit avec du travail réel ou ne se remplit pas.

**Le mot « Sélection » plutôt que « Publications ».** Titrer *« Articles — sélection »* transforme une contrainte en choix éditorial. C'est exactement ce que fait Gregory Gundersen avec 3 entrées. Personne ne peut vous reprocher une sélection courte.

---

# 2. `/recherche` — structure exacte, texte prêt à coller

Convention : `[…]` = fente à remplir ou à vérifier par Racym. Aucune ne doit rester en ligne.

---

## Section 0 — En-tête

**H1 :** `Recherche`
**Kicker (petite ligne au-dessus du H1, capitales espacées) :** `Racym Berrah — UMR Inserm 1248, Limoges`

> Pas de photo ici. Pas de nom en gros. Le H1 est le mot le plus neutre possible ; c'est la section 1 qui fait le travail.

---

## Section 1 — La question

**H2 :** `La question`

> Un modèle mathématique qui décrit le devenir d'un médicament dans l'organisme peut être ajusté aux données d'un patient précis pour proposer une dose. Ce qui limite l'usage de ces modèles n'est pas le calcul : c'est le travail humain, lent et peu reproductible, de les construire, de les régler et d'en documenter les hypothèses.
>
> **Ma thèse porte sur une seule question : que peut-on confier à un modèle de langage dans cette boucle de construction, et où passe exactement la frontière de ce qu'on ne doit pas lui confier ?**

*(Bloc mis en exergue typographiquement : filet à gauche, pas de fond coloré criard, taille de corps supérieure de 15 %.)*

---

## Section 2 — Le sujet, à trois niveaux de lecture

**H2 :** `Le sujet, à trois niveaux de lecture`

Sous-titre discret : *Le même travail expliqué trois fois. Choisissez celui qui vous convient.*

### `En une phrase`

> Ma thèse examine si une intelligence artificielle capable de lire et d'écrire du texte peut aider à construire les modèles mathématiques qui servent à choisir la dose d'un médicament chez un patient donné — et jusqu'où on peut lui faire confiance.

### `Pour un scientifique d'un autre domaine`

> Deux personnes qui reçoivent la même dose du même médicament n'ont pas la même concentration dans le sang. Selon la molécule, l'écart va d'un facteur deux à un facteur dix. La pharmacométrie modélise cette variabilité : un système d'équations différentielles décrit le devenir du médicament dans l'organisme, un modèle statistique décrit comment ses paramètres varient d'un individu à l'autre, et l'on ajuste ce modèle aux quelques concentrations mesurées chez un patient pour lui proposer une dose. C'est une pratique clinique réelle, notamment en transplantation, en réanimation et en oncologie.
>
> Ces modèles fonctionnent. Ce qui ne passe pas à l'échelle, c'est leur **fabrication** : choisir la structure, poser les hypothèses, sélectionner les covariables, écrire le code, puis documenter et justifier chaque décision. Ce travail est textuel, artisanal, réalisé à la main par un petit nombre de spécialistes, et rarement reproductible à l'identique. Or c'est précisément la classe de tâches sur laquelle les modèles de langage sont compétents — et c'est aussi la classe de tâches sur laquelle ils échouent de façon subtile et difficile à détecter. Ma thèse porte sur cette intersection : non pas remplacer le modèle mécanistique par une IA, mais déterminer ce qu'une IA peut faire *autour* de lui sans dégrader la fiabilité de la décision de dose.

### `Pour un pair`

> La brique de base reste un modèle non linéaire à effets mixtes : un système d'EDO pour la cinétique, un modèle de variabilité inter-individuelle, un modèle d'erreur résiduelle, et une estimation bayésienne *maximum a posteriori* pour l'individualisation. Ce qui limite le passage à l'échelle n'est pas le solveur, c'est la **boucle de construction** : élicitation des a priori depuis la littérature, génération et test d'hypothèses de covariables, choix du modèle d'erreur, écriture du flux de contrôle, puis rédaction de l'argument de crédibilité au sens de l'ICH M15 — question d'intérêt, *context of use*, niveau de risque associé. Cette boucle est textuelle, lente et faiblement reproductible.
>
> L'hybridation aujourd'hui documentée en pharmacométrie porte sur le champ de vecteurs lui-même : *neural ODE* lorsque le champ entier est appris, *universal differential equation* lorsque les termes mécanistiques connus sont préservés et que le réseau ne prend en charge que les termes incertains, *grey-box* dans la terminologie issue de l'identification de systèmes. Ma thèse porte sur une autre couche : le modèle de langage n'entre pas dans le champ de vecteurs — il intervient dans la boucle de construction et de documentation, où sa nature textuelle est un atout et non un défaut.
>
> Deux difficultés structurent le travail. **(i) Le critère d'évaluation.** L'objectif ne peut pas être « le modèle écrit un flux de contrôle correct » — c'est une métrique de complaisance. L'objectif est : *la décision de dose change-t-elle, et l'argument reste-t-il auditable ?* **(ii) La frontière.** L'identifiabilité, structurelle et pratique, ne se délègue pas ; rien dans un modèle de langage ne la garantit, et un modèle de langage est particulièrement bon pour produire un artefact plausible sur un problème non identifiable. Mon premier point d'entrée expérimental est le modèle d'erreur résiduelle, dont j'ai montré ailleurs qu'il constitue un levier sous-estimé du dosage guidé par modèle.

**Mots-clés (en anglais, en fin de section, en petit) :**
`model-informed precision dosing · population pharmacokinetics · digital pharmacological twin · hybrid modelling · universal differential equations · neural ODE · large language models · residual error models · ICH M15 · credibility assessment`

> Pourquoi en anglais : c'est la surface indexable pour un lecteur international, sans traduire la page.

---

## Section 3 — Ce que ce travail n'est pas

**H2 :** `Ce que ce travail n'est pas`

> Le terme « jumeau numérique » est employé dans des sens très différents. Quatre précisions, parce qu'elles délimitent le sujet plus efficacement qu'une définition.
>
> **Ce n'est pas un jumeau numérique d'organe.** Les travaux européens sur le *Virtual Human Twin* portent sur des représentations anatomiques et physiologiques multi-échelles. Le terme employé ici est le terme restreint du champ, **jumeau pharmacologique numérique**, tel que défini par le consortium DIGPHAT (Woillard *et al.*, *Therapie*, 2026).
>
> **Ce n'est pas de la prédiction de trajectoire à partir de dossiers patients.** Des travaux comme DT-GPT prédisent l'évolution de variables cliniques directement à partir de données de dossiers électroniques, sans modèle mécanistique. C'est de la prévision statistique, pas de la pharmacologie : la relation dose–exposition–effet n'y figure pas, et l'on ne peut donc pas interroger le modèle sur une dose qui n'a pas été administrée.
>
> **Ce n'est pas un modèle de langage qui propose une dose.** Le modèle de langage n'est jamais dans la chaîne de calcul de la dose. Il intervient sur le modèle, en amont, sous supervision, et ce qu'il produit doit rester lisible et contestable par un pharmacologue.
>
> **Ce n'est pas un changement de paradigme.** La littérature du domaine rappelle elle-même que la plupart des propriétés attribuées aux jumeaux numériques — simulation individuelle, mise à jour séquentielle, quantification de l'incertitude orientée décision — relèvent de la pharmacométrie établie, et que l'identifiabilité continue d'imposer des limites dures. Cette critique est fondée. Elle définit le seuil que ce travail doit franchir pour valoir quelque chose.

> **⚠ À faire avant publication :** lire en texte intégral Houk (*CPT* 2026, 10.1002/cpt.70340) et Feigelman (*CPT:PSP* 2026, 10.1002/psp4.70229) avant de les citer nommément. Le paragraphe ci-dessus est rédigé pour tenir *sans* les nommer ; ajoutez les noms uniquement après lecture.

---

## Section 4 — Où se situe ce travail

**H2 :** `Où se situe ce travail`

> Ce travail est mené à l'**UMR Inserm 1248 « Pharmacologie & Transplantation »**, unité mixte Université de Limoges / Inserm / CHU de Limoges, à Limoges. L'unité affiche parmi ses axes la modélisation pharmacocinétique et la médecine personnalisée, la pharmacologie augmentée par l'intelligence artificielle, et développe le système expert d'adaptation bayésienne de posologie des immunosuppresseurs utilisé par une centaine de centres de transplantation.
>
> C'est également dans cette unité qu'est coordonné le consortium **DIGPHAT** (*Multi-scale and longitudinal data modeling in pharmacology: toward digital pharmacological twins*), financé par France 2030 / PEPR Santé numérique (ANR-22-PESN-0017, 2023–2027), qui associe une dizaine d'institutions françaises autour de trois cas d'usage : transplantation, infectiologie, oncologie.
>
> Le cadre réglementaire de référence est la ligne directrice **ICH M15** *General Principles for Model-Informed Drug Development*, parvenue au Step 4 le 29 janvier 2026, publiée par la FDA en juin 2026 et en phase d'implémentation à l'EMA. Elle fixe une terminologie commune et une évaluation de la crédibilité fondée sur le risque et sur le *context of use* — c'est le vocabulaire dans lequel tout travail de modélisation destiné à une décision doit désormais se formuler.

> **⚠ Formulation verrouillée.** Écrire « où est coordonné DIGPHAT ». Ne **jamais** écrire « membre du consortium DIGPHAT » ni « projet DIGPHAT » tant que ce n'est pas confirmé. Ne **jamais** écrire « Paris » (l'affiliation Inserm/Paris sur l'ORCID est un artefact de métadonnées ; un pair du domaine le verrait immédiatement).

---

## Section 5 — Vocabulaire et méthodes

**H2 :** `Vocabulaire et méthodes`

Sous-titre : *Quatre termes que la littérature emploie souvent l'un pour l'autre, et qui ne désignent pas la même chose.*

> **Neural ODE.** Le champ de vecteurs de l'équation différentielle est entièrement paramétré par un réseau de neurones. Aucune structure pharmacologique n'est imposée. Le modèle peut capturer des dynamiques qu'aucun modèle compartimental n'exprime, au prix de l'interprétabilité des paramètres.
>
> **Universal Differential Equation (UDE).** Les termes mécanistiques connus sont **conservés** dans l'équation, et le réseau ne prend en charge que les termes dont la forme est incertaine. C'est le cas qui intéresse la pharmacologie : on garde la clairance et le volume, on apprend ce qu'on ne sait pas écrire.
>
> **Grey-box.** Terme issu de l'identification de systèmes, qui désigne la même famille d'approches sous un angle « quelle part du système est connue ». Utile pour dialoguer avec l'automatique et le traitement du signal.
>
> **SciML.** Nom de l'écosystème logiciel (principalement Julia) dans lequel ces méthodes sont implémentées. Ce n'est pas une méthode.
>
> La distinction la plus utile en pratique est celle entre *neural ODE* et *UDE* : elle décide de ce qui reste interprétable dans le modèle, et donc de ce qu'on peut défendre dans un argument de crédibilité.

Lien de bas de section (sobre, texte) :
`→ Traité en détail dans le parcours « IA en pharmacométrie » de Pharmacométrie Pratique`

> C'est ici que le site devient sa propre preuve : la page recherche renvoie vers le cours, le cours renvoie vers la page recherche. Aucun des deux n'est une brochure de l'autre.

---

## Section 6 — Travaux

**H2 :** `Travaux`

Chapeau, une phrase :

> Regroupés par statut. Chaque entrée porte une date et un lien vérifiable ; ce qui n'a pas de trace publique n'est pas listé.

### `Articles évalués par les pairs — sélection`

*(Colonne d'année en gouttière à gauche, police monospace. Pas de numérotation. Nom de l'auteur en gras.)*

> **2026** — **Berrah R**, Minichmayr I, Woillard JB ; IATDMCT Pharmacometrics Group. *Better Dosing Through Better Error: Residual Error as a Hidden Lever in Model-Informed Precision Dosing.* Therapeutic Drug Monitoring. En ligne le 8 décembre 2025. → doi.org/10.1097/FTD.0000000000001413
>
> **2026** — El Balkhi S, **Berrah R**, Sauvage FL, Le Du L, Rahali MA, Lakis R, Marquet P, Saint-Marcoux F, Loustaud-Ratti V, Carrier P. *Human serum albumin profiling by top-down analysis enables multi-class liver fibrosis staging.* Scientific Reports. → doi.org/[…]
>
> **2025** — **Berrah R**, Saint-Marcoux F, Monchaud C, Cointault O, Conseil M, Jaber S, Jung B, Woillard JB. *From AUC/MIC to AUCss and Cmin: Optimizing Micafungin Therapy in the Critically Ill through Model-Informed Precision Dosing.* The AAPS Journal. → doi.org/10.1208/s12248-025-01173-z
>
> **2025** — Magreault S, **Berrah R**, Kerroumi Y, Mimram L, Salmon D, Goulenok T, de la Selle A, Lefort A, Marmor S, El Helali N, Zeller V, Jullien V. *Dosing and route of administration of clindamycin given in combination with rifampicin.* Clinical Microbiology and Infection. → doi.org/10.1016/j.cmi.2025.01.005 · *réponse aux auteurs* → doi.org/10.1016/j.cmi.2025.06.030

### `Communications`

> **2026** — 34ᵉ PAGE Meeting, Dubrovnik, Croatie, 2–5 juin 2026. *[Titre — à compléter]*. Communication affichée.
>
> **2025** — 33ᵉ PAGE Meeting, Thessalonique, Grèce, 4–6 juin 2025. *Impact of Residual Error Handling on Model Informed Precision Dosing and AUC Calculation: A Case Study with Tacrolimus.* Communication affichée, abstract I-034. → page-meeting.org

### `Thèse`

> **Depuis novembre 2025** — *JUMP PHARMA : création de jumeaux numériques pharmacologiques par approche hybride — exploitation des modèles mécanistiques et des grands modèles de langage en pharmacologie.* Thèse de doctorat en pharmacologie, Université de Limoges, UMR Inserm 1248. En cours.

> **⚠ Trois verrous.** (a) Écrire **« depuis novembre 2025 »**, pas « en fin de thèse » : l'ORCID public déclare 01/11/2025 – 31/10/2028, et un lecteur qui le consulte verrait la contradiction. (b) Ne pas mettre en avant l'acronyme « JUMP PHARMA » comme s'il s'agissait d'un programme labellisé — il n'a aucune existence publique vérifiable ; il figure comme **intitulé de thèse**, rien de plus. (c) Ne nommer aucun encadrant sans son accord explicite. (d) Pas de lien theses.fr tant que l'inscription n'y est pas visible.

### `Ressources pédagogiques ouvertes`

> **Depuis [année]** — *Pharmacométrie Pratique.* Cours de pharmacométrie en accès libre. 89 chapitres en français, 88 en anglais, 63 visualisations interactives. → rberrah.github.io/pharmacometrie
>
> **Depuis [année]** — *Internat Pharma.* Couverture du programme officiel de l'internat en pharmacie. 187 chapitres, 2 690 items d'annales (1990–2025), 24 arbres de décision, lexique de 202 pathologies, 30 visualisations. → rberrah.github.io/internat
>
> **Depuis [année]** — *Stat & Biologie.* Cours de biostatistique. 46 chapitres, 10 visualisations. → rberrah.github.io/stats
>
> Contenu original, licence [licence]. Décompte automatique au [date], voir le journal des modifications.

> **⚠ Recomptez avant publication.** J'ai vérifié 89 FR / 88 EN pour Pharmacométrie Pratique dans `src/content/chapters/`. Les deux autres sites ne l'ont pas été. Toute la stratégie repose sur « des chiffres plutôt que des adjectifs » : un chiffre faux coûte plus cher que pas de chiffre. Voir le script au § 4.

### `Logiciels et données`

> *[À n'ouvrir que lorsqu'un dépôt aura un README, une licence, un tag de version et un fichier de citation. Une section vide vaut mieux qu'une entrée creuse — donc : ne pas afficher cette rubrique tant qu'elle n'a rien.]*

---

## Section 7 — Questions ouvertes

**H2 :** `Questions ouvertes`

Chapeau : *Ce que je ne sais pas encore, et qui structure le travail en cours.*

> **Comment évalue-t-on une aide qui ne produit pas un chiffre ?** Mesurer la justesse du code généré est une métrique de complaisance : elle est facile à obtenir et elle ne dit rien de l'usage. Le critère pertinent porte sur la décision — la dose proposée change-t-elle, le temps de construction change-t-il, l'argument reste-t-il reconstituable par un tiers ? Je n'ai pas encore de protocole satisfaisant pour le troisième point.
>
> **Qu'est-ce qui ne doit jamais être délégué ?** L'identifiabilité structurelle et pratique est le meilleur candidat : c'est exactement le point où un modèle de langage produit un artefact plausible et faux, sans signal d'alerte. Reste à savoir si cette frontière peut être rendue opérationnelle — c'est-à-dire vérifiable automatiquement — ou si elle relève irréductiblement de l'expertise humaine.
>
> **Un argument de crédibilité peut-il rester auditable si une partie du modèle a été assemblée par une machine ?** L'ICH M15 demande de documenter le *context of use* et le niveau de risque. Une chaîne partiellement automatisée doit produire cette documentation, pas la contourner. C'est peut-être l'apport le plus solide d'un modèle de langage — et c'est le moins spectaculaire.
>
> **Que fait-on de la sous-représentation de la pharmacométrie dans les corpus d'entraînement ?** Les modèles généralistes ont vu très peu de code NONMEM, de rapports de modélisation et de littérature du domaine. C'est une contrainte de fond, pas un défaut passager, et elle conditionne ce qu'on peut espérer d'un ancrage documentaire ou d'un ajustement fin.
>
> **Le modèle d'erreur résiduelle est-il un point d'entrée généralisable ?** C'est mon entrée expérimentale. Reste à savoir si ce qui vaut pour l'erreur résiduelle vaut pour les autres décisions de construction, ou si c'est un cas particulier commode.

> Cette section est le meilleur substitut à une liste de publications longue : elle démontre exactement ce qu'une liste est censée démontrer, et personne ne peut la produire par accumulation.

---

## Section 8 — Repères bibliographiques

**H2 :** `Repères bibliographiques`

Chapeau : *Les textes auxquels ce travail se réfère. Ce ne sont pas mes travaux.*

> **Cadre réglementaire**
> ICH M15 — *General Principles for Model-Informed Drug Development*, Step 4, 29 janvier 2026.
> EMA — *Reflection paper on the use of Artificial Intelligence in the medicinal product lifecycle*, CHMP/CVMP, 30 septembre 2024.
> FDA — *Considerations for the Use of Artificial Intelligence to Support Regulatory Decision-Making for Drug and Biological Products*, projet, 7 janvier 2025.
>
> **Jumeaux pharmacologiques numériques**
> Woillard JB, Benzekry S, Josse J *et al.* et le consortium DIGPHAT. *Digital pharmacological twins: bridging multi-scale modelling and artificial intelligence for precision medicine.* Therapie 2026;81(2):147-158. doi:10.1016/j.therap.2025.09.006
> Wang H *et al.* *From virtual patients to digital twins in immuno-oncology.* npj Digital Medicine 2024. doi:10.1038/s41746-024-01188-4
>
> **Hybridation mécanistique / apprentissage**
> Losada *et al.* *Bridging pharmacology and neural networks: a deep dive into neural ordinary differential equations.* CPT:PSP 2024. doi:10.1002/psp4.13149
> Bram D, Steffens B, Pfister M *et al.* *Low-dimensional neural ODEs and their application in pharmacokinetics.* J Pharmacokinet Pharmacodyn 2024. doi:10.1007/s10928-023-09886-4
>
> **Modèles de langage en pharmacométrie**
> Tosca EM, Aiello L, De Carlo A, Magni P. *Pharmacometrics in the age of large language models: a vision of the future.* Pharmaceutics 2025;17(10):1274. doi:10.3390/pharmaceutics17101274
> Zheng *et al.* *AI for NONMEM coding in pharmacometrics research and education: shortcut or pitfall?* CPT:PSP 2025. doi:10.1002/psp4.70125
> *Leveraging large language models in pharmacometrics: evaluation of NONMEM output interpretation and simulation capabilities.* J Pharmacokinet Pharmacodyn 2025. doi:10.1007/s10928-025-09982-7

> Une bibliographie sur une page personnelle est un signal de sérieux inhabituel et coûte zéro publication. Elle dit : « je lis le champ », ce qu'aucune liste de titres personnels ne dit.

---

## Section 9 — Identifiants

**H2 :** `Identifiants`

> ORCID 0009-0001-6432-2880 · HAL [idHAL] · GitHub rberrah · LinkedIn
> Contact : [adresse]

*(Texte simple, pas d'icônes colorées, pas de grappe de boutons. Voir § 4 pour le balisage.)*

---

## Version anglaise — `/research`

Créer une page jumelle, pas une traduction complète : **le niveau « pour un pair » + les mots-clés + les travaux + les identifiants**. C'est la surface qui compte à l'international.

**H1 :** `Research`

> I work on model-informed precision dosing: mechanistic pharmacokinetic models fitted to an individual patient's data to support a dosing decision. What limits these models in practice is not computation but the model-building loop — prior elicitation from the literature, covariate hypotheses, residual error structure, control-stream authoring, and the written credibility argument required under ICH M15. That loop is textual, slow and poorly reproducible.
>
> My PhD asks where a large language model belongs in that loop, and where it must not go. It does not enter the vector field — that is the territory of neural ODEs and universal differential equations. It operates on the construction and documentation of the model, where being textual is an advantage. Two problems follow: the evaluation endpoint is not "correct code" but "does the dosing decision change, and does the argument remain auditable"; and structural and practical identifiability cannot be delegated, since nothing in a language model guarantees it.
>
> PhD student at UMR Inserm 1248 *Pharmacology & Transplantation* (University of Limoges / Inserm / Limoges University Hospital), Limoges, France — the unit where the DIGPHAT consortium on digital pharmacological twins is coordinated.
>
> `model-informed precision dosing · population pharmacokinetics · digital pharmacological twin · hybrid modelling · universal differential equations · neural ODE · large language models · residual error · ICH M15`

Poser `hreflang` croisé entre `/recherche/` et `/research/`.

---

# 3. Présenter honnêtement une production en cours

## Le vocabulaire fermé des étiquettes de statut

**Sept étiquettes, pas une de plus.** Les définir sur la page elle-même, en note de bas de section — c'est ce geste qui rend le système honnête plutôt que décoratif.

| Étiquette | Quand l'utiliser | Ce qui doit accompagner |
|---|---|---|
| `Publié` | DOI actif | Année + DOI |
| `En ligne avant impression` | En ligne, volume non attribué | Date de mise en ligne + DOI |
| `Accepté` | Lettre d'acceptation en main | Mois + année **+ nom de la revue** (l'acceptation est un fait) |
| `Soumis` | Manuscrit déposé | Mois + année, **sans nom de revue** |
| `Préprint` | Déposé sur un serveur public | Serveur + DOI + date |
| `Communication affichée` / `Communication orale` | Abstract accepté | Congrès, ville, dates, n° d'abstract |
| `En cours` | Thèse, corpus vivant | Date de début, jamais de date de fin promise |

### Les trois règles typographiques qui font tout le travail

**1. Jamais le nom de la revue pour un manuscrit soumis.**
`Soumis (juin 2026)` ✓ — `Soumis à The AAPS Journal` ✗
Un manuscrit soumis n'est pas un fait sur la revue, c'est un fait sur l'auteur. Nommer la revue emprunte son prestige sans son aval. Un pair le lit immédiatement comme une tentative.

**2. « En préparation » n'existe pas.**
Tout le monde a des choses en préparation. Une entrée « en préparation » n'ajoute pas d'information et sature l'espace visuel avec du vide. **Si ça n'a pas de trace externe, ça n'est pas sur la page.** Idem pour « à paraître », « bientôt disponible », « en construction ». Ce sont les marqueurs les plus sûrs d'une page qui compense.

**3. Aucun compteur, aucune numérotation.**
`Publications (4)` ✗ · une liste numérotée 1→4 ✗
Numéroter rend la brièveté saillante. Utilisez une gouttière d'années en monospace à gauche, des entrées non numérotées. L'œil lit la densité, pas le cardinal.

### Cas particuliers

**Relectures.** Ne jamais écrire une liste auto-déclarée (« relecteur pour *Journal X*, *Journal Y* »). C'est invérifiable et souvent couvert par la confidentialité. La seule forme défendable : **activer la section *Peer review* de l'ORCID** (les revues y déposent des enregistrements vérifiés) et laisser le lien ORCID parler. Actuellement vide → ne rien afficher.

**Congrès sans communication.** Assister n'est pas produire. On ne liste pas une participation sans présentation. Exception unique : une **école d'été sur sélection**, à placer dans une ligne « Formation », pas dans « Travaux ».

**Séminaires internes.** Un séminaire de laboratoire n'a pas de trace publique. Deux options : ne pas le lister, ou le lister avec la mention `séminaire interne` et déposer les diapositives (HAL/Zenodo) pour lui donner une trace. La seconde option est meilleure : elle transforme un événement invisible en objet citable.

**Logiciels et jeux de données.** Une entrée seulement si l'objet a : README, licence, tag de version, `CITATION.cff`, et de préférence un DOI. Un lien vers un dépôt brut lit comme du remplissage.

**Ordre des groupes.** Articles → Communications → Thèse → Ressources pédagogiques → Logiciels. Antichronologique **à l'intérieur** de chaque groupe. Ne jamais mélanger les groupes pour « lisser » la chronologie : le regroupement par statut est précisément ce qui rend la page lisible avec peu d'articles.

**Ce qu'on ne compense jamais.** Pas d'astérisque « † co-premier auteur » ni de légende de symboles sur 4 entrées : un appareil de notes plus long que la liste signale l'inverse de ce qu'il cherche.

---

# 4. ORCID, LinkedIn, et mise à jour automatique

## 4.1 Présentation sobre

**Une seule ligne, en fin de page, texte pur :**

```
Identifiants — ORCID 0009-0001-6432-2880 · HAL [idHAL] · GitHub rberrah · LinkedIn
```

Trois règles :
- **ORCID en premier, LinkedIn en dernier.** L'ordre encode la hiérarchie de crédibilité. Gardez LinkedIn : c'est le canal réel par lequel les organisateurs de congrès écrivent.
- **Pas d'icônes de marque colorées.** Une grappe de logos sociaux est le marqueur visuel du site de freelance. Du texte, souligné au survol.
- **Aucune métrique.** Pas de h-index, pas de compteur de citations, pas de badge. Lier l'identifiant est un signal de sérieux ; afficher un compteur bas est un anti-signal.

**Balisage à poser** (dans `src/app.html` pour les apps, dans le `<head>` du portail) :

```html
<link rel="me" href="https://orcid.org/0009-0001-6432-2880" />
<link rel="me" href="https://www.linkedin.com/in/racym-berrah-114387175/" />
<meta name="author" content="Racym Berrah" />
```

Et **une seule fois**, sur `/a-propos` :

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Racym Berrah",
  "url": "https://rberrah.github.io/a-propos/",
  "identifier": "https://orcid.org/0009-0001-6432-2880",
  "jobTitle": "Doctorant en pharmacologie",
  "affiliation": {
    "@type": "Organization",
    "name": "UMR Inserm 1248 Pharmacologie & Transplantation",
    "address": { "@type": "PostalAddress", "addressLocality": "Limoges", "addressCountry": "FR" }
  },
  "knowsAbout": ["Pharmacometrics", "Model-informed precision dosing", "Population pharmacokinetics", "Biostatistics"],
  "sameAs": [
    "https://orcid.org/0009-0001-6432-2880",
    "https://www.linkedin.com/in/racym-berrah-114387175/",
    "https://github.com/rberrah"
  ]
}
</script>
```

> **Prérequis absolu : compléter l'ORCID d'abord.** Il manque au moins l'article *Scientific Reports* 2026, il n'y a ni biographie, ni Education, ni Funding. Lier un ORCID lacunaire depuis une vitrine soignée produit l'effet inverse de celui recherché — et ici l'ORCID devient la source de la page, donc ses trous deviennent visibles deux fois.

## 4.2 L'API publique ORCID est-elle utilisable au build ?

**Oui, techniquement. Mais il ne faut pas l'appeler au moment du build.**

**Ce qui marche :** `https://pub.orcid.org/v3.0/0009-0001-6432-2880/works` avec `Accept: application/json`, en GET, sans jeton, sur les seules données marquées *public*.

**Les cinq limites réelles :**

1. **L'ORCID est une déclaration, pas un index.** Ce qui n'y est pas ne remontera jamais. Le mécanisme ne corrige pas un ORCID incomplet, il en reflète les trous. → Compléter l'ORCID, puis **activer l'auto-update Crossref et DataCite** depuis la boîte de réception ORCID (à condition que l'ORCID iD figure dans les métadonnées du DOI).
2. **Le résumé des travaux ne contient pas la liste d'auteurs.** Il faut enrichir via **Crossref** (`api.crossref.org/works/{doi}`, gratuit, sans clé, avec `mailto=` pour le *polite pool*) pour obtenir auteurs, revue, volume, pages.
3. **Quotas.** Un jeton public (*client credentials*) est recommandé pour un usage régulier ; une requête par semaine est très en dessous des seuils, mais un build déclenché 30 fois par jour ne l'est pas.
4. **Un appel réseau dans le build est un point de panne.** Si `pub.orcid.org` répond 503 le jour du déploiement, la CI échoue et le site ne part pas. Inacceptable pour un site qui doit rester en ligne.
5. **Jamais côté client.** Un `fetch` dans le navigateur envoie l'IP de chaque visiteur à ORCID (RGPD), rend la liste invisible aux moteurs, et affiche une page vide en cas de panne.

## 4.3 Le mécanisme recommandé : instantané commité + robot hebdomadaire

**Principe : le réseau est interrogé par un robot, pas par le build. Le build lit un fichier JSON versionné.** Le bénéfice décisif n'est pas technique, il est éditorial : **la différence est relue avant d'être en ligne.** Sur une page dont l'enjeu est l'exactitude, un pipeline qui publie sans relecture humaine est une mauvaise idée.

### `scripts/sync-works.mjs`

```js
// Interroge l'ORCID public + Crossref et écrit un instantané versionné.
// N'est JAMAIS appelé pendant le build : le build lit src/lib/data/works.json.
// Usage : node scripts/sync-works.mjs
import { readFile, writeFile } from 'node:fs/promises';

const ORCID  = '0009-0001-6432-2880';
const MAILTO = '[adresse@exemple.fr]';              // Crossref polite pool
const OUT    = new URL('../src/lib/data/works.json',        import.meta.url);
const MANUAL = new URL('../src/lib/data/works.manual.json', import.meta.url);

const getJSON = async (url) => {
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} — ${url}`);
  return r.json();
};

// 1. Les DOI déclarés publics sur l'ORCID
const record = await getJSON(`https://pub.orcid.org/v3.0/${ORCID}/works`);
const dois = (record.group ?? [])
  .map((g) => (g['work-summary']?.[0]?.['external-ids']?.['external-id'] ?? [])
    .find((x) => x['external-id-type'] === 'doi')?.['external-id-value'])
  .filter(Boolean)
  .map((d) => d.toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, ''));

// 2. Métadonnées complètes via Crossref (l'ORCID ne donne pas les auteurs)
const initials = (given = '') =>
  given.split(/[\s.-]+/).filter(Boolean).map((s) => s[0]).join('');

const works = [];
for (const doi of dois) {
  try {
    const { message: m } = await getJSON(
      `https://api.crossref.org/works/${encodeURIComponent(doi)}?mailto=${MAILTO}`
    );
    works.push({
      kind: 'article',
      status: 'publie',
      doi,
      url: `https://doi.org/${doi}`,
      title: (m.title?.[0] ?? '').trim(),
      venue: m['container-title']?.[0] ?? '',
      year: m.issued?.['date-parts']?.[0]?.[0] ?? null,
      online: (m.created?.['date-time'] ?? '').slice(0, 10),
      authors: (m.author ?? []).map((a) => ({
        name: `${a.family ?? a.name ?? ''} ${initials(a.given)}`.trim(),
        me: /^berrah$/i.test(a.family ?? '')
      }))
    });
  } catch (e) {
    console.error(`[crossref] ${doi} : ${e.message}`);   // on n'interrompt pas
  }
  await new Promise((r) => setTimeout(r, 300));          // courtoisie
}

// 3. Entrées sans DOI, tenues à la main (abstracts PAGE, thèse, dépôts)
const manual = JSON.parse(await readFile(MANUAL, 'utf8'));

const payload = {
  generated: new Date().toISOString().slice(0, 10),
  source: `https://orcid.org/${ORCID}`,
  works: [...works, ...manual].sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
};
await writeFile(OUT, JSON.stringify(payload, null, 2) + '\n');
console.log(`${payload.works.length} entrées écrites (${works.length} depuis l'ORCID).`);
```

### `src/lib/data/works.manual.json`

```json
[
  {
    "kind": "communication",
    "status": "poster",
    "year": 2025,
    "title": "Impact of Residual Error Handling on Model Informed Precision Dosing and AUC Calculation: A Case Study with Tacrolimus",
    "venue": "33rd PAGE Meeting, Thessalonique, Grèce, 4–6 juin 2025",
    "ref": "abstract I-034",
    "url": "https://www.page-meeting.org/2025-thessaloniki-greece/abstracts/"
  }
]
```

### `.github/workflows/sync-works.yml`

```yaml
name: Synchroniser les travaux depuis l'ORCID
on:
  schedule:
    - cron: '0 6 * * 1'      # tous les lundis, 06:00 UTC
  workflow_dispatch:
permissions:
  contents: write
  pull-requests: write
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: node scripts/sync-works.mjs
      - uses: peter-evans/create-pull-request@v6
        with:
          branch: chore/orcid-sync
          commit-message: "chore(travaux) : synchronisation ORCID"
          title: "Travaux : mise à jour détectée depuis l'ORCID"
          body: |
            Différence entre l'ORCID public et `src/lib/data/works.json`.
            Vérifier la liste d'auteurs, l'année et le titre avant de fusionner.
```

**Résultat :** une nouvelle publication apparaît sur l'ORCID → le lundi suivant, une pull request s'ouvre avec la différence → un coup d'œil, fusion, GitHub Pages redéploie. La page se met à jour « toute seule », avec exactement un point de contrôle humain de dix secondes. La CI de déploiement, elle, ne touche jamais le réseau.

### Côté page

Le portail étant du HTML statique, deux options :

- **Minimale (recommandée) :** un script `scripts/render-recherche.mjs` de ~40 lignes qui lit `works.json` et injecte le bloc `<ol>` des travaux entre deux marqueurs `<!-- TRAVAUX:START -->` / `<!-- TRAVAUX:END -->` dans `portal/recherche/index.html`, appelé dans le même workflow. Aucun framework à ajouter.
- **Si le portail passe un jour sous SvelteKit :** `import works from '$lib/data/works.json'` dans `+page.svelte`, avec `export const prerender = true`. Aucun appel réseau, tout est figé au build.

### Bonus à coût nul

Ajouter un `CITATION.cff` à la racine du dépôt : GitHub affiche automatiquement un encadré « Cite this repository » avec export APA et BibTeX. Vingt lignes de YAML, et c'est le seul des dispositifs de citation qui soit lisible par machine par défaut.

---

# 5. `/a-propos` — structure et texte

## Règle d'intimité, à poser d'emblée

> **Trois faits personnels maximum, et chacun doit expliquer une décision professionnelle.** Pas de famille, pas de loisirs, pas de récit d'échec, pas de « ma passion depuis l'enfance ». Une photo, sobre, en petit format, sur cette page uniquement — jamais sur une page d'accueil.

Le « je » est légitime **ici et seulement ici**. Sur `/recherche`, on reste sur les faits et les objets.

---

**H1 :** `À propos`

### Section 1 — Une phrase

> Je construis des ressources ouvertes en pharmacométrie, en biostatistique et en intelligence artificielle appliquée à la pharmacologie.

*(Une phrase. Verbe d'action. Aucun adjectif sur soi. C'est le patron de tous les sites qui font autorité par le contenu.)*

### Section 2 — Trois lignes de statut

> Docteur en pharmacie.
> Doctorant en pharmacologie, UMR Inserm 1248 « Pharmacologie & Transplantation » — Université de Limoges / Inserm / CHU de Limoges.
> Thèse commencée en novembre 2025 : jumeaux pharmacologiques numériques, hybridation entre modèles mécanistiques et modèles de langage. → Recherche

*(Le lien « Recherche » évacue tout le contenu scientifique vers l'autre page. `/a-propos` ne redit rien.)*

### Section 3 — Le parcours (l'atout narratif)

**H2 :** `Du médicament au modèle`

> **⚠ Ce bloc est un canevas rédigé dans sa voix. Chaque fait doit être vérifié ou remplacé par lui : je n'ai eu accès à aucun élément biographique. Les fentes `[…]` sont obligatoires à traiter.**

> On apprend la pharmacie autour d'une question : quel médicament, pour quelle situation. La dose, elle, arrive comme une donnée du problème — le résumé des caractéristiques du produit dit 500 mg trois fois par jour, et l'on apprend ce chiffre.
>
> Ce qui m'a déplacé, c'est [le moment où j'ai vu des concentrations plasmatiques mesurées chez de vrais patients — *à remplacer par le déclencheur réel : un stage, un service, un dosage précis*]. Deux personnes, la même dose, la même indication, des expositions qui ne se ressemblent pas. À ce moment-là, la question change de nature. Elle cesse d'être « faut-il augmenter ou diminuer ? » et devient « de combien, pour ce patient, et avec quelle incertitude ? ». C'est une question quantitative, et le raisonnement clinique seul n'y répond pas.
>
> La pharmacométrie est la discipline qui y répond. Passer de la pharmacie à la modélisation n'a donc pas été pour moi un changement de métier, mais le prolongement de la même question avec un outil capable d'y répondre.
>
> La formation de pharmacien apporte quelque chose au modélisateur, et je crois que c'est ce qui rend le trajet intéressant dans ce sens-là : elle apprend ce qui se passe réellement entre l'ordonnance et le patient. Un horaire de prélèvement noté à la minute près sur le dossier et administré vingt minutes plus tard. Une perfusion reconstituée autrement que dans le protocole. Une observance qui n'est pas un paramètre binaire. Un modèle ajusté sur des données propres est une belle chose ; les données ne sont jamais propres, et savoir *pourquoi* elles ne le sont pas change les hypothèses qu'on ose poser.
>
> Dans l'autre sens, la modélisation apporte au pharmacien la seule manière de dire « combien » plutôt que « plutôt plus » ou « plutôt moins ». C'est ce qui a orienté toute la suite, jusqu'à la thèse en cours.

*(Longueur cible : cinq paragraphes courts, ~250 mots. Un « je », zéro adjectif auto-attribué, une seule idée par paragraphe. L'atout narratif fonctionne parce qu'il explique une **compétence**, pas parce qu'il raconte une **vie**.)*

### Section 4 — Pourquoi ces sites existent

**H2 :** `Pourquoi ces sites existent`

> Deux raisons, dans cet ordre.
>
> **La première est égoïste.** Écrire un chapitre est la manière la plus fiable que je connaisse de découvrir qu'on n'a pas compris. Un raisonnement qu'on croit tenir résiste tant qu'on ne le rédige pas ; il cède dès qu'il faut le mettre en ordre, poser les notations et tracer la figure. Une bonne partie de ce que je sais en pharmacométrie, je l'ai appris en essayant de l'expliquer.
>
> **La seconde ne l'est pas.** En français, je n'ai pas connaissance d'un cours de pharmacométrie complet et librement accessible. Ce qui existe est soit diplômant et payant, soit épars, soit derrière un abonnement. Un étudiant en pharmacie ou en médecine qui veut comprendre pourquoi la même dose ne donne pas la même chose chez deux patients n'a pas d'endroit évident où aller. Ces trois sites sont ma réponse à ce constat, et ils resteront gratuits.
>
> Une remarque de méthode, enfin. Beaucoup de travaux ne rentrent pas dans un PDF : une visualisation interactive, un modèle qu'on manipule, une démonstration qui se déroule au fil du défilement. Le milieu académique n'accorde de crédit à ces objets que lorsqu'on les emballe dans un article-prétexte, ce qui multiplie l'effort et divise l'attention. Ce site est aussi un pari sur le fait qu'un objet pédagogique bien fait vaut par lui-même.

### Section 5 — Comment c'est fait

**H2 :** `Comment c'est fait`

> Contenu original, rédigé par moi, avec sources citées chapitre par chapitre.
> Sites statiques en SvelteKit, hébergés sur GitHub Pages. Visualisations en D3, mathématiques en KaTeX. Code source public.
> Licence [licence] — chaque chapitre porte en bas de page une formule d'attribution prête à copier.
> Chaque chapitre porte sa date de première publication et l'historique de ses révisions.
> Une erreur, une imprécision, une source manquante : le lien « Signaler une erreur » en bas de chaque chapitre ouvre un ticket public. Les corrections sont créditées.

*(Cette section est un marqueur de rigueur scientifique déguisé en note technique. Le lien de signalement d'erreur en est la pièce maîtresse : il dit « ce texte est faillible et je le sais » mieux qu'aucune profession de foi.)*

### Section 6 — Ce que ce site n'est pas

**H2 :** `Ce que ce site n'est pas`

> Il n'y a rien à vendre ici : pas de formation payante, pas de conseil, pas d'ebook, pas de version premium, et il n'y en aura pas.
> Pas de publicité, pas de traceur, pas de compte à créer, pas de lettre d'information.
> Ce n'est pas un avis médical ni pharmaceutique individuel. Le contenu est destiné à la formation ; il ne remplace ni une prescription, ni un avis de pharmacien ou de médecin, ni les référentiels en vigueur.
> Ce n'est pas un site institutionnel : il n'engage ni l'Université de Limoges, ni l'Inserm, ni le CHU de Limoges.

*(Section décisive. C'est la façon élégante de tenir la contrainte « je ne vends rien » : on l'énonce comme une caractéristique du site, jamais comme une justification de soi. Et le disclaimer médical est indispensable sur un site de pharmacie.)*

### Section 7 — Contact

**H2 :** `Contact`

> [adresse@exemple.fr]
>
> **Ce qui est bienvenu.** Les corrections et signalements d'erreur — c'est le message le plus utile qu'on puisse m'envoyer. Les questions sur un chapitre. Les demandes de réutilisation en cours ou en enseignement : c'est prévu par la licence, vous n'avez pas besoin de ma permission, mais ça me fait plaisir de le savoir. Les propositions de traduction : oui, avec plaisir — écrivez-moi avant et gardez un lien vers l'original.
>
> **Ce à quoi je ne peux pas répondre.** Les questions médicales ou pharmaceutiques portant sur un patient : je ne peux pas y répondre, et vous ne devriez pas les poser par courriel. Les demandes d'aide sur un projet de modélisation personnel : je n'ai pas la disponibilité pour un accompagnement individuel.
>
> Je réponds quand je peux, pas toujours vite.

*(Pas de formulaire. Une adresse. Le modèle FAQ permet de décliner à l'avance sans jamais paraître fermé, et il canalise vers ce qui sert le contenu : les corrections.)*

### Section 8 — Remerciements

**H2 :** `Remerciements`

> [Noms des relecteurs, des personnes qui ont signalé des erreurs, des contributeurs de traductions.]

*(Créditer nommément est un des gestes les plus rentables qui existent : il coûte une ligne, il signale un travail collectif et vivant, et il donne envie de contribuer.)*

### Section 9 — Pied

> ORCID 0009-0001-6432-2880 · HAL [idHAL] · GitHub · LinkedIn
> Dernière mise à jour : [date] · Journal des modifications

---

# 6. Anti-patterns — à bannir, et quoi faire à la place

### Structure et cadrage

| ✗ À bannir | ✓ À la place |
|---|---|
| Section « Publications » maigre en haut de page | « Travaux » groupés par statut, placés **après** la question de recherche et la carte du champ |
| « Publications (4) » ou liste numérotée 1→4 | Aucun compteur, entrées non numérotées, gouttière d'années en monospace |
| « À paraître », « bientôt », « en construction », « page en cours » | Ne rien afficher. On publie une section quand elle est complète |
| Rubriques de remplissage (« Compétences », « Outils », « Centres d'intérêt ») | Rien. Le vide se remplit avec du travail réel ou ne se remplit pas |
| Titre « Publications » sur une liste courte | Titre « Articles — sélection » : le mot transforme une contrainte en choix |
| Navigation à 8 entrées | 3 à 5 entrées. Ici : Pharmacométrie · Internat · Stats · Recherche · À propos |
| Page d'accueil biographique (photo + nom en grand) | Contenu d'abord. La personne vit sur `/a-propos`, en second rideau |

### Formulations sur soi

| ✗ À bannir | ✓ À la place |
|---|---|
| « expert », « passionné », « innovant », « révolutionnaire », « unique » | Verbes d'action + chiffres datés : « 89 chapitres, décompte au 4 août 2026 » |
| « en fin de thèse » | « Thèse commencée en novembre 2025 » — l'ORCID public dit 2025–2028 ; l'écart se verrait |
| « le seul cours francophone de… » | « Je n'ai pas connaissance d'équivalent francophone en accès libre » |
| « Inserm, Paris » (recopié de l'ORCID) | « UMR Inserm 1248, Limoges ». L'ORCID affiche Paris parce que l'organisation Inserm y pointe : c'est un artefact, et un pair le repère |
| « Membre du consortium DIGPHAT » | « Doctorant à l'UMR Inserm 1248, où est coordonné DIGPHAT » |
| « Membre de l'IATDMCT Pharmacometrics Group » | Rien — la signature collective sur un article n'établit pas l'appartenance |
| Nommer un directeur de thèse ou un « mentor » | Ne nommer personne. Les co-auteurs n'apparaissent que dans les références d'articles |
| Présenter « JUMP PHARMA » comme un programme, un projet financé, un consortium | Intitulé de thèse, présenté comme tel, sans mise en avant de l'acronyme |
| « Travaillons ensemble », « disponible pour interventions », « me contacter pour une conférence » | Une archive d'interventions passées (date, titre, lieu, diapositives). Les invitations naissent de la preuve d'activité, pas d'une demande |

### Travaux et statuts

| ✗ À bannir | ✓ À la place |
|---|---|
| « Soumis à *Nature Medicine* » | « Soumis (juin 2026) », sans nom de revue |
| « En préparation », « en cours de rédaction » | Rien. Sans trace externe, pas d'entrée |
| Liste auto-déclarée de revues relues | Activer la section *Peer review* de l'ORCID et laisser le lien parler |
| Lister des congrès auxquels on a seulement assisté | Ne lister que ce qui a été présenté, avec le numéro d'abstract |
| Lien vers un dépôt GitHub brut dans « Logiciels » | Rien tant qu'il n'y a pas README + licence + tag + `CITATION.cff` |
| Citer sa thèse comme référence citable avant le dépôt TEL | « Thèse en cours (depuis novembre 2025) », sans DOI ni format de citation |
| Astérisques et légendes de symboles sur 4 entrées | Rien. Un appareil de notes plus long que la liste dit l'inverse de ce qu'il cherche |

### Signaux visuels et techniques

| ✗ À bannir | ✓ À la place |
|---|---|
| Barres de compétences, notes sur 5 étoiles, mur de logos (NONMEM, Monolix, R, Python) | La section « Vocabulaire et méthodes » : on démontre au lieu de déclarer |
| h-index, compteur de citations, badges bibliométriques | Les identifiants seuls (ORCID, HAL) |
| Compteur de vues, « X lecteurs », badge d'abonnés | Rien |
| Grappe d'icônes sociales colorées | Deux ou trois liens en texte, `rel="me"`, ORCID en premier, LinkedIn en dernier |
| CV en image ou en PDF seul | Page HTML + éventuel PDF daté dans le nom de fichier |
| Formulaire de contact | Une adresse e-mail, plus un périmètre en style FAQ |
| `citation_title` / balises Highwire sur des chapitres de cours | JSON-LD `LearningResource`. Les guidelines Google Scholar ne rangent le matériel pédagogique dans aucune catégorie éligible ; poser des balises d'article sur ce qui n'en est pas expose à un rejet et à une réputation de gaming |
| Page qui n'a pas bougé depuis dix-huit mois | Date de dernière mise à jour en pied de page + journal des modifications |
| Chiffres du corpus recopiés du brief | Recomptés par script au build, avec la date du décompte affichée |

### Vocabulaire scientifique

| ✗ À bannir | ✓ À la place |
|---|---|
| « jumeau numérique » employé sans définition | « jumeau pharmacologique numérique », défini en une phrase, référence *Therapie* 2026 |
| « IA en santé », « IA générative appliquée au médicament » | Le vocabulaire du champ : MIPD, neural ODE, UDE, ICH M15, *context of use*, identifiabilité |
| Présenter l'hybridation modèle × données comme une originalité | La définition consensuelle du jumeau numérique **contient déjà** l'hybridation. L'originalité est ailleurs : la couche LLM dans la boucle de construction |
| Confondre son sujet avec DT-GPT ou avec le *Virtual Human Twin* | La section « Ce que ce travail n'est pas », qui trace les trois frontières |
| Page enthousiaste sur les jumeaux numériques | Page qui cite la critique du terme par sa propre communauté. C'est le geste le plus crédibilisant, et un excellent sujet de communication |

---

## Ordre d'exécution recommandé

1. **Trancher les faits d'abord.** Statut de la thèse (contradiction « fin de thèse » vs ORCID 2025–2028), encadrant (nommer ou non), rattachement DIGPHAT, licence. Aucune ligne des deux pages ne se pose avant.
2. **Compléter l'ORCID.** Article *Scientific Reports* manquant, Education, biographie, auto-update Crossref/DataCite. L'ORCID devient la source de la page : ses trous deviendront visibles deux fois.
3. **Recompter les chiffres par script**, afficher la date du décompte.
4. **Écrire `/recherche`**, puis `/research`, puis `/a-propos`. Dans cet ordre : `/recherche` fixe les formulations, `/a-propos` n'en redit aucune.
5. **Poser le pipeline ORCID** (`sync-works.mjs` + workflow hebdomadaire) une fois la page en ligne, pas avant.
6. **Renommer** `/pharmacometrie/a-propos/` en « À propos de ce cours » pour lever la collision avec le `/a-propos` du portail.