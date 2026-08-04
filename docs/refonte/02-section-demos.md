# Section `/demos` — conception complète

Vérifications faites dans le dépôt canonique `c:\Users\abdel\Documents\Site PK\Base\rberrah.github.io` avant rédaction : 63 composants dans `src/lib/components/visualizations/` (comptage confirmé), registre automatique par `import.meta.glob` dans `src/lib/content/vizRegistry.js`, solveur RK4 générique dans `src/lib/sim/ode.js`, simulateur de population avec IIV/IOV/RUV dans `src/lib/sim/population.js`, données Warfarine réelles dans `src/lib/content/warfarinData.js` (~250 observations) + CSV et notebooks nlmixr2/Monolix dans `static/downloads/warfarin/`, SvelteKit 2.50 / Svelte 5.49 / `adapter-static` / `trailingSlash: 'always'` / `prerender.entries: ['*']`, Playwright déjà installé, `scripts/smoke_test.mjs` déjà branché sur `npm test`. Tout ce qui suit s'appuie sur ces briques et n'en casse aucune.

---

## 1. Portefeuille de 7 démonstrations

### Classement impact / effort

| # | Démonstration | Régime | Effort | Impact | Ratio | Rôle |
|---|---|---|---|---|---|---|
| 1 | Le levier de l'erreur résiduelle | natif | 2–3 j | 5/5 | **très élevé** | adosse une démo à son propre DOI |
| 2 | Deux modèles, une seule courbe (identifiabilité) | natif | 3–4 j | 4,5/5 | **très élevé** | désamorce la critique Houk avant qu'elle arrive |
| 3 | Un jumeau pharmacologique numérique, prélèvement par prélèvement | natif | 6–8 j | 5/5 | élevé | **cœur de thèse** |
| 4 | Ce qu'un LLM propose, ce qu'un vérificateur mécaniste réfute | trace rejouée + vérif. native | 8–12 j | 5/5 | élevé | **cœur de thèse** |
| 5 | Où prélever ? (matrice d'information) | natif | 4–5 j | 4/5 | moyen-élevé | utilité clinique directe |
| 6 | Ce que le RAG retrouve, et ce qu'il rate | modèle chargé (live) | 5–7 j | 4/5 | moyen | seul calcul neuronal réellement live |
| 7 | Mécaniste / neural ODE / UDE : lequel extrapole ? | natif + poids pré-entraînés | 6–10 j | 4,5/5 | moyen | preuve de la taxonomie hybride |

**Ordre de construction recommandé** : 1 → 2 → 3 → 4 → 5 → 7 → 6. On ne publie pas une section `/demos` dont les deux démos de thèse (3 et 4) manquent : les deux premières servent à roder l'anatomie de carte, pas à tenir la section seules. Ouvrir la section avec 1+2+3 minimum.

---

### Démo 1 — « Le levier de l'erreur résiduelle »

- **Question (1 phrase)** : pourquoi le modèle d'erreur résiduelle *déclaré au moment de l'estimation* change-t-il la dose recommandée, alors qu'il ne décrit ni le patient ni le médicament ?
- **Ce que l'utilisateur manipule** : (a) le modèle d'erreur déclaré à l'estimateur — additif / proportionnel / combiné / volontairement mal spécifié ; (b) σ déclaré, indépendamment du σ qui a réellement généré les mesures ; (c) le nombre et la position des prélèvements ; (d) la taille de la population virtuelle (50 → 500).
- **À comprendre en 30 s** : σ n'est pas un paramètre de nuisance, c'est le poids relatif des données du patient face à l'a priori de population. Sous-déclarer σ fait surajuster le bruit ; le surdéclarer fait rendre un patient à sa population. Les deux se traduisent en milligrammes.
- **Sous le capot** : estimation MAP réelle par patient (minimisation de l'objectif individuel), 200–500 sujets tirés en direct via `src/lib/sim/population.js`, graine affichée et re-jouable ; biais et RMSE de l'AUC calculés sur la population, pas illustrés.
- **Niveau technique** : **natif navigateur**, 0 octet à télécharger. Extension de `MipdResidualLever.svelte` (118 lignes aujourd'hui, essentiellement analytique) vers une vraie boucle Monte-Carlo + MAP.
- **Pourquoi en premier** : c'est la version manipulable de *Berrah R, Minichmayr I, Woillard JB. Better Dosing Through Better Error. Ther Drug Monit* (DOI 10.1097/FTD.0000000000001413). Une démo qui pointe vers un DOI dont il est premier auteur est le meilleur rapport crédibilité/effort de tout le portefeuille.

---

### Démo 2 — « Deux modèles, une seule courbe »

- **Question** : deux jeux de paramètres différents peuvent-ils produire exactement la même courbe observée — et que devient alors un « jumeau » individualisé ?
- **Ce que l'utilisateur manipule** : deux curseurs couplés sur une crête de vraisemblance (p. ex. Q et V2 d'un bicompartimental, ou ka et ke en flip-flop) ; le protocole d'échantillonnage ; le niveau de bruit.
- **À comprendre en 30 s** : la courbe ne bouge pas alors que les paramètres bougent de 40 %. Ce n'est pas un problème d'estimateur ni de taille d'échantillon : c'est le modèle qui ne distingue pas ces deux mondes avec ce protocole. Ajouter un prélèvement au bon endroit casse la crête ; en ajouter dix au mauvais endroit ne la casse pas.
- **Sous le capot** : calcul réel de la surface d'objectif (−2 log L) sur une grille 80×80, courbes de niveau tracées en direct, plus un indicateur de conditionnement (rapport des valeurs propres de la hessienne approchée par différences finies).
- **Niveau technique** : **natif navigateur**, 0 octet.
- **Fonction stratégique** : c'est la démo qui traite frontalement la limite dure rappelée par Houk (*CPT* 2026, DOI 10.1002/cpt.70340) et par Feigelman (*CPT:PSP* 2026, DOI 10.1002/psp4.70229). **À ne rédiger qu'après lecture des textes intégraux** — les deux sont sous paywall et une paraphrase approximative d'un papier critique est exactement l'erreur qu'un pair repère.

---

### Démo 3 — « Un jumeau pharmacologique numérique, prélèvement par prélèvement » ⭐ cœur de thèse

- **Question** : qu'est-ce qu'un modèle individualisé sait d'un patient après un prélèvement, après deux, après quatre — et à partir de quand cesse-t-il d'apprendre ?
- **Ce que l'utilisateur manipule** : les temps de prélèvement (glissables sur l'axe, ajout/retrait) ; σ déclaré ; ω du modèle de population servant d'a priori ; le patient sous-jacent (ses vrais paramètres sont tirés puis **affichés** — ce qu'aucune situation clinique ne permet, et c'est tout l'intérêt) ; un bouton « prochaine dose » qui fait avancer le temps et recalcule la recommandation.
- **À comprendre en 30 s** : le jumeau ne « devient » pas le patient. Il se déplace de la population vers l'individu d'une distance qui dépend de σ/ω et de l'information apportée par chaque observation. Un prélèvement : c'est encore la population. Quatre bien placés : c'est presque l'individu. Vingt mal placés : il n'apprend plus rien.
- **Sous le capot** : modèle 2 compartiments + absorption d'ordre 1 intégré par `rk4()` (`src/lib/sim/ode.js`) ; estimation MAP séquentielle réelle (Nelder-Mead ou quasi-Newton sur l'objectif individuel `−2 log L(y|η) + η'Ω⁻¹η`) ré-exécutée à chaque ajout d'observation ; intervalle de crédibilité de l'AUC par échantillonnage de la postérieure approchée ; recommandation de dose obtenue par inversion sur cible. Aucune requête réseau après le chargement de la page.
- **Niveau technique** : **natif navigateur**, 0 octet.
- **Contrainte de rédaction** : la page doit **définir le terme** avant de l'employer, et employer « jumeau *pharmacologique* numérique » (terme du consortium, publié : Woillard JB *et al.*, *Therapie* 2026;81(2):147-158, DOI 10.1016/j.therap.2025.09.006), pas « jumeau numérique » tout court. Employer le mot sans le définir est précisément ce que la communauté QSP se reproche à elle-même.
- **Modèle de population à utiliser** : un modèle **publié et cité**, idéalement le modèle micafungine de son propre article *AAPS J* (DOI 10.1208/s12248-025-01173-z) ou un modèle tacrolimus publié. Jamais un modèle « pédagogique » non sourcé sur la démo phare.

---

### Démo 4 — « Ce qu'un LLM propose, ce qu'un vérificateur mécaniste réfute » ⭐ cœur de thèse

C'est la démonstration la plus importante du portefeuille et la seule qui dise quelque chose que personne d'autre ne dit.

- **Question** : un modèle de langage peut-il assembler un modèle de population — et qu'est-ce qui, dans sa proposition, ne peut être tranché que par le modèle mécaniste lui-même ?
- **Ce que l'utilisateur manipule** : il choisit une **description d'étude** dans une liste courte (« PK orale, dose unique, 3 prélèvements/patient, 32 sujets » / « perfusion continue, 2 prélèvements à l'état d'équilibre » / « données riches, 12 points, suspicion de non-linéarité »). Puis il déroule la proposition pas à pas, et surtout il **active/désactive chaque vérification** pour voir ce que le contrôle attrape.
- **À comprendre en 30 s** : la proposition du LLM est syntaxiquement impeccable et **structurellement indéfendable** — et ce n'est pas le LLM qui le dit, c'est le simulateur. Le partage du travail est net : le LLM assemble et documente, la couche mécaniste réfute.
- **Sous le capot — le point crucial, la démonstration est en deux moitiés** :
  - **Moitié rejouée** : la sortie du LLM (control stream NONMEM ou script nlmixr2 + son commentaire) est une **trace enregistrée**, versionnée dans le dépôt avec identifiant de modèle, date, température, seed, hash SHA-256 du prompt et de la réponse brute.
  - **Moitié live, réellement exécutée dans la page** : un vérificateur écrit en JavaScript qui (a) *parse* le control stream proposé ; (b) contrôle la cohérence des blocs — nombre d'ETA déclarés vs taille du bloc `$OMEGA`, colonnes de `$INPUT` vs colonnes réellement présentes dans le jeu de données, `$ERROR` cohérent avec `$SIGMA` ; (c) confronte le nombre de paramètres estimables au **protocole d'échantillonnage** de l'étude choisie et signale la sous-détermination ; (d) **simule le modèle proposé avec `src/lib/sim/`** et affiche la courbe obtenue à côté des données — c'est là que la proposition se casse visiblement (paramètre non identifiable, absorption impossible, état d'équilibre jamais atteint).
- **Les traces doivent inclure les échecs.** Pas une trace parfaite plus une note de prudence : au moins un tiers des traces publiées doivent être des propositions fausses, avec la faute exacte annotée. C'est ce qui distingue une démonstration scientifique d'une démonstration produit.
- **Niveau technique** : **trace rejouée (0 octet) + calcul natif live**. Optionnellement une variante « modèle chargé » (voir §2), affichée comme *démonstration de la limite*, pas de la capacité.
- **Ancrage bibliographique de la page** : Tosca EM *et al.*, *Pharmaceutics* 2025;17(10):1274 (DOI 10.3390/pharmaceutics17101274) pour le cadre « assistif, RAG + fine-tuning + validation obligatoires » ; l'évaluation NONMEM *JPKPD* 2025 (DOI 10.1007/s10928-025-09982-7) et Zheng *et al.*, *CPT:PSP* 2025 (DOI 10.1002/psp4.70125) pour le constat empirique « bon squelette, revue experte indispensable ».

---

### Démo 5 — « Où prélever ? »

- **Question** : à nombre de prélèvements égal, combien d'information gagne-t-on en changeant seulement leurs horaires ?
- **Ce que l'utilisateur manipule** : les temps de prélèvement (glissables), leur nombre (1 → 6), et le paramètre d'intérêt (CL, V, AUC, C<sub>min</sub>).
- **À comprendre en 30 s** : le RSE% sur la clairance passe du simple au triple selon l'horaire, à budget de prélèvements constant. Un protocole « creux + pic » n'est pas une convention, c'est un optimum approché — et il n'est pas optimal pour tous les paramètres à la fois.
- **Sous le capot** : matrice d'information de Fisher (approximation du premier ordre) calculée en direct, dérivées de sensibilité par différences finies sur le solveur RK4, inversion de matrice 3×3–5×5 en JS, RSE% et critère D affichés en continu.
- **Niveau technique** : **natif navigateur**, 0 octet.
- **Note** : c'est la démo la plus directement utile aux pharmaciens hospitaliers et aux biologistes — donc celle qui circule. À doubler d'une légende EN.

---

### Démo 6 — « Ce que le RAG retrouve, et ce qu'il rate »

- **Question** : quand on branche un modèle de langage sur un corpus, qu'est-ce qui est réellement retrouvé — et pourquoi la bonne réponse est-elle parfois absente du contexte transmis ?
- **Ce que l'utilisateur manipule** : il écrit une question en français ; il fait varier `k` (nombre de passages retrouvés) ; il bascule entre similarité cosinus sur embeddings et recherche lexicale BM25 ; il voit les scores de tous les passages, pas seulement des `k` retenus.
- **À comprendre en 30 s** : le maillon faible d'un système RAG n'est pas le générateur, c'est le retrieveur. Une question posée avec un vocabulaire différent de celui du chapitre fait chuter le bon passage au rang 12 — et un générateur, même excellent, ne peut pas citer ce qu'on ne lui a pas donné.
- **Sous le capot** : **modèle d'embeddings réellement exécuté dans le navigateur** via `transformers.js` (ONNX Runtime Web, backend WASM, pas de WebGPU requis, pas d'isolation cross-origin requise). Modèle multilingue léger quantifié — ordre de grandeur 30–120 Mo selon le modèle et la quantification, **à mesurer à l'implémentation**, pas à annoncer de mémoire. Index des passages du corpus pré-calculé hors ligne et livré en binaire compact (Float32Array ou int8) ; seule la requête est encodée à la volée.
- **Niveau technique** : **modèle chargé**, téléchargement au clic, mis en cache par le navigateur.
- **Double dividende** : le même index sert de moteur de recherche sémantique pour les 322 chapitres. La démo n'est pas un jouet posé à côté du site, c'est l'exposition du mécanisme d'une fonctionnalité réelle.

---

### Démo 7 — « Mécaniste, neural ODE, UDE : lequel extrapole ? »

- **Question** : quand une partie de la dynamique est inconnue, faut-il remplacer le modèle par un réseau, ou remplacer seulement le terme incertain ?
- **Ce que l'utilisateur manipule** : la **fenêtre d'entraînement** (glissable sur l'axe des temps) ; la dose (dans et hors de la plage vue à l'entraînement) ; le niveau de bruit ; l'affichage simultané des trois ajustements.
- **À comprendre en 30 s** : dans la fenêtre d'entraînement, les trois courbes se superposent — le neural ODE est même le meilleur. Hors fenêtre, le mécaniste mal spécifié se trompe de façon *prévisible*, le neural ODE part n'importe où, l'UDE reste borné parce que sa conservation de masse est câblée et non apprise. La distinction n'est pas cosmétique : elle décide de ce qu'on a le droit d'extrapoler.
- **Sous le capot** : **entraînement hors ligne** (Julia/SciML ou PyTorch), poids exportés en JSON, **passe avant réellement exécutée en JS** — le réseau (petit MLP, 2 couches, quelques dizaines de neurones) est évalué à chaque pas du RK4 existant. Rien n'est pré-calculé côté courbes : changer la dose recalcule vraiment.
- **Niveau technique** : **natif navigateur + poids pré-entraînés** (quelques dizaines de ko de JSON).
- **Honnêteté à afficher** : « l'entraînement a eu lieu hors ligne, le script et le seed sont dans le dépôt ; l'inférence, elle, s'exécute ici ». Références de la page : Losada *et al.*, *CPT:PSP* 2024 (DOI 10.1002/psp4.13149) ; Bram D, Steffens B, Pfister M *et al.*, *J Pharmacokinet Pharmacodyn* 2024 (DOI 10.1007/s10928-023-09886-4).

**Huitième démo optionnelle, très bon marché (1–2 j)** : une grille interactive « contexte d'usage → niveau de crédibilité requis » alignée sur ICH M15 (Step 4, 29 janvier 2026) et ASME V&V 40. À construire à partir du **texte du PDF officiel**, jamais de mémoire. Effet : signale immédiatement un auteur de l'intérieur du champ réglementaire.

---

## 2. Démontrer un LLM sur un site 100 % statique — revue et arbitrage

### Contraintes dures, vérifiées

- **GitHub Pages ne permet pas de définir d'en-têtes HTTP.** Donc pas de `Cross-Origin-Opener-Policy` / `Cross-Origin-Embedder-Policy`, donc `crossOriginIsolated === false`, donc **pas de `SharedArrayBuffer`, donc pas de WASM multi-thread**. Le contournement par *service worker* (`coi-serviceworker`) existe mais ne s'applique pas au premier chargement et ajoute une fragilité permanente. Conséquence : tout chemin d'inférence qui repose sur les threads WASM est disqualifié. Le chemin **WebGPU**, lui, n'exige pas l'isolation cross-origin et reste ouvert.
- **Limites d'hébergement GitHub Pages** (limites souples documentées) : site publié ~1 Go, bande passante ~100 Go/mois. Héberger des poids de modèle sur Pages est donc exclu — un modèle de 700 Mo servi 150 fois consomme le quota mensuel.
- **Corollaire RGPD, souvent oublié** : si les poids viennent d'un CDN tiers (Hugging Face), l'adresse IP du visiteur part chez un tiers. Cela impose que le téléchargement soit **déclenché par un clic explicite**, jamais au chargement de la page, et annoncé dans le texte de la carte. Ce n'est pas une précaution juridique décorative : c'est aussi ce qui règle le problème de latence.

### Revue des options

| Option | Fiabilité | Coût | Latence | Honnêteté scientifique |
|---|---|---|---|---|
| **A. Trace rejouée, versionnée** | Totale et déterministe. Fonctionne partout, hors ligne, sur mobile, sans GPU. | 0 € | ~0 ms | **La plus élevée** — voir ci-dessous |
| **B. WebLLM (WebGPU)** | ~60–70 % des postes de bureau, quasi nulle sur mobile ; échec silencieux fréquent | 0 € pour lui, ~0,4–1 Go pour le visiteur | 20 s–plusieurs min au 1<sup>er</sup> chargement | **Piégeuse** — voir ci-dessous |
| **C. `transformers.js` — embeddings** | Bonne : WASM, pas de WebGPU requis, pas de COI requis | 0 € | 3–15 s au 1<sup>er</sup> clic, puis cache | Élevée : tâche où les petits modèles sont réellement compétents |
| **D. Hugging Face Space en iframe** | Moyenne : c'est un backend, simplement chez quelqu'un d'autre. Un Space CPU gratuit s'endort après une longue inactivité | 0 € en CPU, payant en ZeroGPU/Pro | Démarrage à froid de plusieurs dizaines de secondes | Correcte si le démarrage à froid est annoncé |
| **E. Clé fournie par le visiteur** | Faible en pratique : quasi personne ne le fera ; contraintes CORS variables selon le fournisseur | 0 € pour lui | Faible | **Mauvaise** : enseigner par l'exemple à coller une clé payante dans une page tierce |
| **F. Vidéo / GIF annoté** | Totale | 0 € | Faible | Faible : non inspectable, registre publicitaire |

### Les deux raisonnements qui tranchent

**Sur la trace rejouée — l'intuition courante est inversée.** Un appel LLM en direct n'est *pas* reproductible : le modèle est mis à jour côté fournisseur, l'échantillonnage est stochastique, la réponse d'aujourd'hui n'est pas celle de la semaine prochaine, et le visiteur ne peut ni auditer ni rejouer ce qu'il vient de voir. Une trace enregistrée avec identifiant de modèle, date, température, seed, hash du prompt et hash de la réponse brute, versionnée dans le dépôt, est **un artefact scientifique** ; un appel live est une anecdote. Le problème d'honnêteté n'est donc pas le rejeu, c'est le rejeu *non déclaré* et *trié*. Deux règles suffisent à l'éliminer : (1) le régime d'exécution est écrit sur la carte avant le clic ; (2) le corpus de traces publié contient les échecs, annotés.

**Sur WebLLM — un modèle de 0,5 à 1 Md de paramètres démontrerait le contraire de la thèse.** La littérature du domaine est convergente : les données pharmacométriques sont sous-représentées dans les corpus d'entraînement, et même les modèles frontière produisent des control streams à erreurs subtiles nécessitant une revue experte. Un modèle exécutable dans un navigateur produira un `$PK` halluciné. Faire tourner un tel modèle en vitrine d'une thèse dont l'argument est « le LLM assemble, le mécaniste valide » revient à exhiber un assembleur inutilisable. **Sauf à inverser explicitement le cadrage** — et c'est la seule utilisation défendable : un encadré secondaire, intitulé quelque chose comme « le même prompt sur un modèle de 0,5 Md exécuté ici même », affiché *à côté* de la trace du modèle frontière, et présenté comme **démonstration de la limite**. Sous ce cadrage, le fait qu'il échoue est le résultat, pas le bug.

### Verdict — architecture à trois étages

**Étage 1 — défaut, sur la page, pour tout le monde : trace rejouée + vérification native live.**
La démo 4 est construite ainsi. Ce qui est rejoué : la sortie du LLM. Ce qui s'exécute réellement chez le visiteur : le parseur, les contrôles de cohérence, le calcul d'identifiabilité et **la simulation du modèle proposé par le solveur du site**. La partie qui porte l'argument scientifique — la réfutation par le modèle mécaniste — est donc, elle, entièrement live. Fiabilité totale, coût nul, latence nulle, reproductibilité supérieure à un appel API.

Format de trace, un fichier JSON par cas, dans `static/demos/traces/` :

```json
{
  "id": "nonmem-oral-3pts-v1",
  "recorded_at": "2026-08-04T09:12:31Z",
  "model_id": "<identifiant exact du modèle, tel que renvoyé par l'API>",
  "params": { "temperature": 0, "top_p": 1, "max_tokens": 1200, "seed": 7 },
  "prompt_file": "traces/nonmem-oral-3pts.prompt.md",
  "prompt_sha256": "…",
  "response_sha256": "…",
  "messages": [ { "role": "assistant", "content": "…" } ],
  "verdict": "partiellement correct",
  "known_failures": [
    "3 ETA déclarés, bloc $OMEGA de dimension 2",
    "modèle bicompartimental non identifiable avec 3 prélèvements sur ce protocole"
  ],
  "harness": "scripts/record_llm_trace.mjs"
}
```

Le script d'enregistrement (`scripts/record_llm_trace.mjs`) est versionné, ce qui rend la trace régénérable par un tiers.

**Étage 1 bis — calcul neuronal réellement live, honnête : embeddings.** Démo 6, `transformers.js`, backend WASM, chargement au clic. C'est le seul endroit où un modèle tourne vraiment dans la page sans que la taille du modèle contredise la démonstration, parce que la tâche (retrouver) est une tâche où un petit modèle est bon et où l'hallucination est structurellement impossible.

**Étage 2 — opt-in explicite, WebLLM, cadré comme démonstration de la limite.** Bouton séparé, jamais auto-déclenché, précédé d'une détection de capacité (`'gpu' in navigator` puis `requestAdapter()`), d'une annonce chiffrée du téléchargement, et d'un texte de cadrage. Repli automatique vers l'étage 1 si WebGPU est absent — jamais un cadre vide, jamais un message d'erreur technique.

**Étage 3 — externe, jamais chargé automatiquement.** Un lien vers un notebook exécutable (marimo WASM / JupyterLite via Pyodide — Python réel dans le navigateur, hébergeable en statique, quelques dizaines de Mo) ou, si vraiment nécessaire, un Space Hugging Face, avec le temps de démarrage à froid écrit à côté du lien. Ces deux chemins sont des *sorties*, pas des démos.

**Options écartées** : la clé fournie par le visiteur (registre douteux, adoption nulle, mauvais exemple d'hygiène de sécurité — le chemin « exécutez-le vous-même » passe par un notebook et un script versionné, pas par un champ mot de passe) ; la vidéo comme démonstration (elle ne survit que comme image d'affiche de la carte, première image significative, jamais en lecture automatique).

---

## 3. Anatomie d'une carte démo

### Champs, dans l'ordre — et pourquoi cet ordre

Le visiteur décide en trois secondes s'il clique. Tout ce qui précède le clic doit répondre à : *de quoi ça parle, est-ce que ça va me coûter quelque chose, est-ce que ça marche chez moi.*

**Avant activation (rendu statique, présent dans le HTML prérendu) :**

1. `slug` → URL stable `/demos/<slug>/`, jamais modifiée après publication.
2. **Titre** — 5 à 8 mots, affirmatif ou interrogatif, aucun adjectif évaluatif.
3. **Question** — une phrase, se termine par un point d'interrogation.
4. **Badge de régime d'exécution** — `Calcul natif` · `Calcul natif + poids` · `Modèle chargé` · `Trace rejouée` · `Externe` · `Notebook`. Vocabulaire fermé, identique sur toute la section.
5. **Coût d'entrée** — chiffré, pas qualitatif : `0 Mo · immédiat` / `≈ 45 Mo au premier clic, puis en cache` / `≈ 0,7 Go · WebGPU requis`.
6. **Image d'affiche** — première image significative, dimensions explicites pour éviter tout décalage de mise en page, `alt` descriptif du contenu scientifique (pas « capture de la démo »).
7. **Ce que vous manipulez** — 2 à 4 puces, les contrôles réels.
8. **Ce que ça montre** — 1 à 2 phrases, le point à saisir en 30 secondes.

**Après activation :**

9. **Sous le capot** — la méthode nommée avec ses paramètres numériques : « estimation MAP par Nelder-Mead sur l'objectif individuel ; bicompartimental intégré par RK4, pas 0,05 h ; 300 sujets, graine 4242 ». Un lecteur du domaine doit pouvoir juger la démo sur cette ligne seule.
10. **Ce que cette démonstration ne montre pas** — **champ obligatoire, non supprimable, minimum trois entrées.** C'est le champ qui distingue la section du reste du web. Une démo sans ce bloc ne passe pas le test de fumée (voir §4).
11. **Modèle et données** — référence du modèle de population avec DOI ; origine des données (publiques / simulées, et la graine si simulées).
12. **Où la méthode est expliquée** — liens vers le ou les chapitres. Générés automatiquement (§4).
13. **Code** — permalien GitHub **au SHA de commit**, jamais à une branche.
14. **Citer cette démonstration** — citation courte + BibTeX repliable + DOI de concept du dépôt le cas échéant.
15. **Version, date de publication, date de révision, licence.**
16. **Signaler une erreur** — lien vers une issue GitHub pré-remplie avec le slug et la version.

### Gestion du démarrage à froid — cinq états, aucun état vide

| État | Ce qui est affiché | Règle |
|---|---|---|
| `idle` | affiche + bouton + coût chiffré | **aucun travail JS n'a lieu**, pas de préchargement des poids |
| `loading` | squelette **aux dimensions finales exactes**, barre de progression déterminée si le nombre d'octets est connu, texte d'étape, bouton *Annuler* | jamais de spinner nu et sans texte |
| `ready` | la démo, plus un bouton *Réinitialiser* qui restaure l'état initial **avec la même graine** | |
| `unsupported` | message en langage clair + **repli automatique vers la trace rejouée ou l'affiche annotée** | jamais un message d'erreur technique, jamais un cadre vide |
| `failed` | affiche + cause + lien vers la version externe / le notebook | délai de 20–25 s sur les iframes, au-delà → `failed` |

Deux règles supplémentaires : `prefers-reduced-motion` désactive toute animation d'entrée ; le module JS de la démo peut être **préchargé** à l'approche du viewport (`IntersectionObserver`), mais **jamais les poids** — précharger 700 Mo parce qu'un visiteur a fait défiler la page est une faute.

### Squelette de composant

```svelte
<!-- src/lib/components/demos/DemoCard.svelte  — Svelte 5, runes -->
<script>
  import { base } from '$app/paths';

  /** @type {{ demo: any, autoActivate?: boolean }} */
  let { demo, autoActivate = false } = $props();

  let state    = $state('idle');   // idle | loading | ready | unsupported | failed
  let Comp     = $state(null);
  let progress = $state(0);        // 0..1, -1 = indéterminé
  let note     = $state('');
  let iframeTimer = null;

  const isExternal = demo.runtime === 'externe';

  async function capabilityBlocker() {
    if (!demo.requires?.includes('webgpu')) return null;
    if (!('gpu' in navigator)) return "WebGPU n'est pas disponible dans ce navigateur.";
    const adapter = await navigator.gpu.requestAdapter().catch(() => null);
    return adapter ? null : "Aucun adaptateur GPU accessible sur cette machine.";
  }

  async function activate() {
    if (state === 'loading' || state === 'ready') return;
    state = 'loading';
    progress = -1;
    note = demo.coldStart?.message ?? 'Initialisation…';

    const blocker = await capabilityBlocker();
    if (blocker) {
      note = `${blocker} La version rejouée est affichée à la place.`;
      state = 'unsupported';
      if (demo.fallback) { Comp = (await demo.fallback()).default; state = 'ready'; }
      return;
    }

    try {
      if (isExternal) {
        // l'iframe n'est insérée QU'ICI : première requête vers le tiers = après clic
        iframeTimer = setTimeout(() => {
          if (state !== 'ready') {
            note = "Le service externe n'a pas répondu (démarrage à froid).";
            state = 'failed';
          }
        }, 25000);
        state = 'ready';
        return;
      }
      const mod = await demo.load();                     // () => import('…')
      Comp = mod.default;
      state = 'ready';
    } catch (err) {
      note = String(err?.message ?? err);
      state = 'failed';
    }
  }

  function reset() { state = 'idle'; Comp = null; progress = 0; note = ''; }

  $effect(() => { if (autoActivate && state === 'idle' && demo.runtime === 'natif') activate(); });
</script>

<figure class="demo-card" data-state={state}>
  <header>
    <h2><a href="{base}/demos/{demo.slug}/">{demo.title}</a></h2>
    <p class="question">{demo.question}</p>
    <p class="meta">
      <span class="badge badge--{demo.runtime}">{demo.runtimeLabel}</span>
      <span class="cost">{demo.cost.label}</span>
    </p>
  </header>

  <div class="stage" style="aspect-ratio: {demo.aspect};">
    {#if state === 'idle'}
      <button class="activate" onclick={activate} aria-describedby="cost-{demo.slug}">
        <img src="{base}/{demo.poster}" alt={demo.posterAlt}
             width={demo.posterW} height={demo.posterH} loading="lazy" decoding="async" />
        <span class="overlay">Lancer la démonstration<small id="cost-{demo.slug}">{demo.cost.label}</small></span>
      </button>

    {:else if state === 'loading'}
      <div class="skeleton" role="status" aria-live="polite">
        <p>{note}</p>
        {#if progress >= 0}<progress value={progress} max="1"></progress>{:else}<progress></progress>{/if}
        <button onclick={reset}>Annuler</button>
      </div>

    {:else if state === 'ready' && isExternal}
      <iframe title={demo.title} src={demo.embedUrl} loading="lazy"
              referrerpolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onload={() => clearTimeout(iframeTimer)}></iframe>

    {:else if state === 'ready' && Comp}
      <Comp {...(demo.props ?? {})} />

    {:else}
      <div class="degraded">
        <img src="{base}/{demo.poster}" alt={demo.posterAlt}
             width={demo.posterW} height={demo.posterH} />
        <p>{note}</p>
        {#if demo.externalUrl}<p><a href={demo.externalUrl} rel="noopener">Version exécutable ({demo.externalLatency})</a></p>{/if}
      </div>
    {/if}
  </div>

  <noscript>
    <img src="{base}/{demo.poster}" alt={demo.posterAlt}
         width={demo.posterW} height={demo.posterH} />
    <p>Cette démonstration nécessite JavaScript. L'image ci-dessus en montre l'état initial.
       La méthode est expliquée au chapitre
       <a href="{base}/chapitres/{demo.chapters[0]}/">{demo.chapterTitles[0]}</a>.</p>
  </noscript>

  <figcaption>
    <h3>Ce que vous manipulez</h3>
    <ul>{#each demo.controls as c}<li>{c}</li>{/each}</ul>

    <h3>Ce que ça montre</h3>
    <p>{demo.takeaway}</p>

    <details><summary>Sous le capot</summary><p>{demo.engine}</p></details>

    <section class="limits">
      <h3>Ce que cette démonstration ne montre pas</h3>
      <ul>{#each demo.limits as l}<li>{l}</li>{/each}</ul>
    </section>
  </figcaption>
</figure>
```

Note sur `sandbox` pour l'étage 3 : `allow-same-origin` est nécessaire au fonctionnement d'un Space Gradio, et reste sans danger ici parce que le contenu est **cross-origin** — le « same-origin » rendu s'applique à l'origine du tiers, pas à celle du site.

Descripteur, dans `src/lib/content/demoRegistry.js` :

```js
export const demos = [
  {
    slug: 'levier-erreur-residuelle',
    title: "Le levier de l'erreur résiduelle",
    question: "Pourquoi le modèle d'erreur déclaré à l'estimateur change-t-il la dose recommandée ?",
    runtime: 'natif', runtimeLabel: 'Calcul natif',
    cost: { bytes: 0, label: '0 Mo · immédiat' },
    requires: [],
    poster: 'demos/posters/levier-erreur-residuelle.webp',
    posterAlt: "Deux courbes de concentration, prior de population et postérieure, avec trois prélèvements",
    posterW: 1200, posterH: 750, aspect: '16 / 10',
    viz: 'MipdResidualLever',
    load: () => import('$lib/components/visualizations/MipdResidualLever.svelte'),
    controls: [...], takeaway: '…', engine: '…', limits: ['…','…','…'],
    provenance: { model: { ref: 'berrah-residual' }, data: { kind: 'simulé', seed: 4242 } },
    sources: ['berrah-residual', 'sheiner-forecasting'],
    code: 'src/lib/components/visualizations/MipdResidualLever.svelte',
    version: '1.0.0', published: '2026-09-01', revised: '2026-09-01'
  }
];
```

---

## 4. Articulation avec les chapitres, sans duplication ni lien cassé

### La règle de partage, en une ligne

**Une visualisation illustre une étape d'un raisonnement à l'intérieur d'un chapitre. Une démonstration est un artefact autonome : URL propre, provenance propre, limites propres, citation propre.** Sur 63 visualisations, 5 à 8 méritent la promotion. Les autres restent exactement où elles sont.

### Mécanique — ne rien déplacer, ne rien renommer

1. **`vizRegistry.js` reste la source unique de vérité des composants.** Aucun fichier n'est déplacé ni renommé — c'est précisément ce qui casserait les `viz="…"` de 89 chapitres et les alias historiques que le registre gère déjà.
2. **`demoRegistry.js` est une couche de métadonnées qui *pointe* vers une clé du `vizRegistry`** (ou vers un composant dédié `src/lib/components/demos/` pour les démos 3, 4, 6, 7 qui n'existent pas encore). Une démo n'est jamais une copie d'un composant.
3. **Route `/demos/[slug]/` prérendue** sur le modèle de `chapitres/[slug]/+page.js`, qui expose déjà une fonction `entries()` :

```js
// src/routes/demos/[slug]/+page.js
import { demos } from '$lib/content/demoRegistry';
export const prerender = true;
export function entries() { return demos.map((d) => ({ slug: d.slug })); }
```

4. **Les liens chapitre → démo sont dérivés, pas écrits à la main.** Au build, on croise `demoRegistry[].viz` avec les blocs `step` déjà parsés par `loadChapters.js`. Quand un `step` utilise une clé promue, le rendu ajoute automatiquement, sous la figure, un lien discret « Démonstration autonome, avec ses limites et ses sources → ». **Zéro modification dans les 322 fichiers Markdown, donc zéro risque de régression et zéro lien mort à maintenir.**
5. **Les liens démo → chapitre sont dérivés de la même table, dans l'autre sens.** Le champ `chapters` de la carte est calculé au build en balayant les chapitres qui contiennent `viz="<clé>"`. Un chapitre renommé, supprimé ou réécrit met automatiquement la carte à jour. Aucune liste manuelle ne peut se périmer.
6. **Le contenu ne se duplique pas parce qu'il n'a pas la même nature.** La *méthode* est canonique dans le chapitre. La page de démo ne porte que le delta : la manipulation, la mécanique d'exécution, les limites, la provenance, la citation. Elle renvoie à la théorie par une ligne — « la méthode est expliquée au chapitre X » — et ne la réécrit pas. Effet secondaire utile : il n'y a rien à cannibaliser côté indexation, puisqu'il n'y a pas deux fois le même texte.
7. **Règle de poids, non négociable** : *rien dont le démarrage à froid est non nul ne s'instancie en ligne dans un chapitre.* Un chapitre qui touche à un modèle chargé (démo 6) ou à des poids (démo 7) reçoit une **carte cliquable**, pas le widget. Les chapitres doivent rester lisibles hors ligne et sur mobile.
8. **Ancres stables** : chaque démo reçoit un `id="demo-<slug>"` dans le chapitre hôte, pour que les liens profonds cités en congrès ou dans un article ne pointent pas vers le haut de page.
9. **Bilingue** : les cartes de démo sont le meilleur candidat à une traduction EN complète — elles sont pauvres en prose et riches en interaction. Traduire 7 cartes coûte une journée et ouvre une porte d'entrée internationale sans toucher aux 322 chapitres.

### Garde-fous automatisés

Étendre `scripts/smoke_test.mjs` (déjà dans `npm test`) pour faire **échouer le build** si :
- une entrée de `demoRegistry` référence une clé absente de `vizRegistry` ;
- une démo n'a pas d'affiche dans `static/demos/posters/` ;
- une démo a moins de 3 entrées dans `limits` ;
- une démo n'a pas de `provenance.model.ref` résolvable dans le pool fermé de `references.js` ;
- un slug de démo publié disparaît du registre (URL cassée) ;
- une trace LLM référencée n'a pas de `model_id`, de `recorded_at` ou de `prompt_sha256`.

Les affiches se génèrent avec Playwright, déjà installé : un script qui monte chaque composant à graine fixe, sur un viewport fixe, et exporte `static/demos/posters/<slug>.webp`. Les affiches sont ainsi toujours à jour et jamais fabriquées à la main.

---

## 5. Copy française

### 5.1 — Page d'index `/demos/`

---

# Démonstrations

Chaque page de cette section contient un modèle qui tourne. Les paramètres sont manipulables, le calcul s'exécute dans votre navigateur, et aucune donnée que vous saisissez ne quitte votre machine.

## Trois régimes d'exécution

Chaque démonstration indique le sien, avant que vous cliquiez.

**Calcul natif.** Le modèle est intégré et estimé en direct dans la page. Rien à télécharger, aucune requête réseau après le chargement.

**Modèle chargé.** Un modèle neuronal est téléchargé au premier clic, puis conservé par le cache du navigateur. La taille et le temps d'attente sont annoncés avant le clic ; le téléchargement ne démarre jamais tout seul.

**Trace rejouée.** La sortie d'un modèle de langage a été produite une fois, enregistrée avec sa date, l'identifiant du modèle, ses paramètres d'échantillonnage et l'empreinte du prompt, puis versionnée dans le dépôt. La page rejoue cette trace. Les vérifications qui l'entourent, elles, s'exécutent en direct chez vous.

## Pourquoi des traces enregistrées plutôt que des appels en direct

Un appel à un modèle de langage en direct n'est pas reproductible : le modèle évolue côté fournisseur, l'échantillonnage est stochastique, et vous ne pouvez ni auditer ni rejouer ce que vous venez de voir. Une trace enregistrée, horodatée et versionnée peut être relue, comparée et contredite.

Le corpus de traces publié ici contient des propositions fausses, annotées comme telles. Une démonstration qui ne montrerait que des réussites ne démontrerait rien.

## Ce que ces démonstrations ne sont pas

Aucune n'est un outil clinique. Aucune ne doit servir à adapter une dose chez un patient réel.

Les modèles de population utilisés sont cités avec leur référence. Les jeux de données sont soit publics, soit simulés — c'est indiqué sur chaque page, avec la graine du générateur quand ils sont simulés.

## Comment lire une démonstration

Chaque page comporte quatre blocs fixes.

**Sous le capot** décrit le calcul réellement effectué, avec ses paramètres numériques : méthode d'estimation, schéma d'intégration, pas de temps, taille de la population simulée, graine.

**Ce que cette démonstration ne montre pas** énumère les limites. C'est le bloc à lire en premier si vous connaissez le domaine.

**Modèle et données** donne l'origine du modèle de population, avec son DOI, et celle des données.

**Code** pointe vers le fichier source, au commit exact qui produit ce que vous voyez.

## Signaler une erreur

Les erreurs de méthode, de calcul, de référence ou de traduction sont les bienvenues, y compris sur des détails. Le lien de signalement se trouve au bas de chaque page et ouvre une issue pré-remplie.

---

### 5.2 — Page de démonstration exemple

---

# Un jumeau pharmacologique numérique, prélèvement par prélèvement

`Calcul natif` · `0 Mo · immédiat`

**Que sait un modèle individualisé d'un patient après un prélèvement, après deux, après quatre — et à partir de quand cesse-t-il d'apprendre ?**

## Sur le mot

« Jumeau numérique » est employé pour désigner des objets très différents, du modèle d'organe à la prévision de trajectoire à partir de dossiers électroniques. Le terme utilisé ici est plus étroit : *jumeau pharmacologique numérique*, c'est-à-dire un modèle mécaniste calibré sur les observations d'**un** patient, dans un contexte de décision donné, et servant à simuler ce que ce patient ferait sous une autre dose.

Cette restriction n'est pas cosmétique. Un jumeau se distingue d'un patient virtuel par le fait qu'il est ancré sur des données individuelles réelles ; il se distingue d'un modèle de population par le fait qu'il ne décrit qu'un individu. La démonstration ci-dessous porte exactement sur ce qui sépare les deux : la quantité d'information qu'il faut pour passer de l'un à l'autre.

## Ce que vous manipulez

- **Les temps de prélèvement.** Déplaçables sur l'axe, ajoutables, retirables.
- **L'erreur résiduelle σ déclarée au modèle**, indépendamment de celle qui a réellement généré les mesures — les deux sont réglables séparément.
- **La variabilité inter-individuelle ω** du modèle de population utilisé comme a priori.
- **Le patient sous-jacent.** Ses vrais paramètres sont tirés puis affichés, ce qu'aucune situation clinique ne permet. C'est ce qui rend l'erreur d'estimation lisible au lieu d'être supposée.

## Ce que ça montre

Le jumeau ne « devient » pas le patient. Il se déplace de la population vers l'individu d'une distance qui dépend du rapport σ/ω et de l'information apportée par chaque observation.

Avec un prélèvement, il est encore presque la population. Avec quatre bien placés, il en est presque affranchi. Avec vingt mal placés, il n'apprend plus rien de nouveau : ce n'est pas le nombre de mesures qui informe, c'est leur position par rapport à la dynamique du modèle.

## Sous le capot

Modèle à deux compartiments avec absorption d'ordre 1, intégré par Runge-Kutta d'ordre 4, pas de 0,05 h (`src/lib/sim/ode.js`).

Estimation MAP réelle, recalculée à chaque ajout d'observation : minimisation de l'objectif individuel `−2 log L(y | η) + η′ Ω⁻¹ η` par simplexe de Nelder-Mead, tolérance 10⁻⁶, 200 itérations maximum. L'intervalle de crédibilité de l'AUC est obtenu par échantillonnage de la postérieure approchée autour de l'optimum.

La recommandation de dose est obtenue par inversion sur la cible d'exposition affichée.

Population virtuelle tirée d'une log-normale, graine affichée sous le graphique et rejouable.

Tout s'exécute dans cette page. Aucune requête réseau n'a lieu après le chargement.

## Ce que cette démonstration ne montre pas

- **Elle ne démontre pas qu'un jumeau fait mieux qu'un modèle de population.** Elle montre la mécanique de l'individualisation, sur un modèle dont la structure est supposée exacte. La comparaison des performances cliniques est une question empirique, qui se tranche sur données réelles et pas sur cette page.
- **Le modèle structural est ici correct par construction.** En pratique c'est l'hypothèse la plus fragile : les données sont simulées par le modèle même qui les ajuste. Aucune mauvaise spécification structurale n'est en jeu ici.
- **L'identifiabilité limite ce que l'individualisation peut atteindre.** Au-delà d'un certain nombre de paramètres individualisés, des combinaisons différentes produisent la même courbe et l'ajout d'observations ne les sépare pas. Ce point fait l'objet d'une démonstration distincte : *Deux modèles, une seule courbe*.
- **Aucune dimension pharmacodynamique, aucun événement clinique, aucune covariable dépendante du temps.** Un patient réel de réanimation change de clairance en cours de séjour ; ce modèle ne le prévoit pas.
- **Ce n'est pas un outil d'adaptation de dose** et ne doit pas être utilisé comme tel.

## Modèle et données

Modèle de population : *[référence complète + DOI]*.
Données : simulées à partir de ce modèle, graine `[…]`. Les paramètres individuels affichés sont ceux du tirage, pas des estimations.

## Où la méthode est expliquée

- Raisonnement bayésien, EBE et shrinkage → `/chapitres/bayes-ebes/`
- Suivi thérapeutique et adaptation de dose → `/chapitres/tdm/`
- Erreur résiduelle → `/chapitres/erreur-residuelle/`

## Code

Composant : `src/lib/components/demos/JumeauSequentiel.svelte` — permalien au commit `[SHA]`.
Bibliothèque de simulation : `src/lib/sim/` (solveur RK4, modèles compartimentaux, population).

## Citer cette démonstration

Berrah R. « Un jumeau pharmacologique numérique, prélèvement par prélèvement ». *Pharmacométrie Pratique*, version 1.0, 2026. `https://rberrah.github.io/pharmacometrie/demos/jumeau-sequentiel/` (consulté le JJ/MM/AAAA).

```bibtex
@misc{berrah2026jumeau,
  author = {Berrah, Racym},
  title  = {Un jumeau pharmacologique numérique, prélèvement par prélèvement},
  year   = {2026},
  version = {1.0},
  howpublished = {Pharmacométrie Pratique},
  url    = {https://rberrah.github.io/pharmacometrie/demos/jumeau-sequentiel/}
}
```

Version 1.0 — publiée le JJ/MM/AAAA — révisée le JJ/MM/AAAA
Licence : *[à trancher — voir la note ci-dessous]*

**Signaler une erreur →**

---

## Points d'attention avant mise en œuvre

1. **Ne pas rédiger les pages 2, 3 et 4 en citant Houk (*CPT* 2026) ou Feigelman (*CPT:PSP* 2026) avant d'avoir lu les textes intégraux.** Les deux sont sous paywall ; la nuance exacte de leur critique porte l'argument, et une paraphrase approximative sur une page de positionnement est le type d'erreur qu'un pair du domaine repère immédiatement.
2. **Les chiffres de taille de modèle donnés ici (0,4–1 Go pour WebLLM, 30–120 Mo pour un modèle d'embeddings) sont des ordres de grandeur.** Ils doivent être mesurés à l'implémentation et écrits sur la carte à partir de la mesure, pas de l'estimation. La section entière repose sur le principe « des chiffres plutôt que des adjectifs » : un coût d'entrée faux la discrédite plus qu'un coût absent.
3. **La licence est un arbitrage qui ne peut pas être fait sans lui.** Le code des visualisations et des démos sous licence OSI (MIT ou Apache-2.0) est probablement le bon choix pour ouvrir les portes de réutilisation ; le texte est un choix distinct. À traiter comme une décision, pas comme un détail de pied de page.
4. **Le vocabulaire du régime d'exécution doit être fermé et identique partout** (`Calcul natif`, `Calcul natif + poids`, `Modèle chargé`, `Trace rejouée`, `Externe`, `Notebook`). L'inconsistance sur ce point est ce qui ferait basculer la section du registre scientifique au registre commercial.