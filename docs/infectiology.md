# Infectiologie PK/PD

Implementation exploratoire. Le site et le moteur Shiny ont des deploiements
separes ; les controles navigateur incluent leur transfert aller-retour.

## Perimetre

- Atelier PD > Infectiologie : exemple IV 1 compartiment, modele de la bibliotheque, code mrgsolve/Lego,
  ou analyse TDM de la session Shiny ; transfert prive par postMessage et JSON
  exportable/importable par l'utilisateur.
- Posologie actuelle et grille de doses stationnaires (min, max, pas,
  intervalles, perfusion), avec probabilite d'atteinte souhaitee.
  Les temps saisis sont en heures ; les modeles libres peuvent etre en heures
  ou en jours. Les unites de la bibliotheque sont declarees dans le catalogue
  et appliquees automatiquement. Seuls les codes externes demandent une unite
  de temps et de concentration, sans facteur numerique a deviner.
- Ordre des ateliers : PD generale, oncologie, infectiologie. La PK des trois
  ateliers peut etre individualisee dans Analyse avec mapbayr. Le bouton de
  retour conserve la session et ne remplace pas les donnees patient.
  Les covariables populationnelles sont separees des coefficients avances.
  En PD generale/oncologie, la PK posterieure est ensuite fixe : l'ajustement
  PD reste par moindres carres, sans propagation de l'incertitude PK.
- Sur le site, l'exemple IV utilise CL, V et les doses saisies. Variances ETA
  independantes de 0,09 sur CL et V, comme le modele exporte (CV 30,7 %).
  Indices stationnaires analytiques et PTA Monte Carlo avec graine fixe,
  50-1000 tirages, sans bruit residuel. L'AUC est integree sur exactement 24 h,
  meme pour un intervalle ne divisant pas 24 h. Les parametres sont pedagogiques.
  Aucun profil simplifie ne remplace un modele de bibliotheque, libre ou TDM.
  Apres calcul R : courbes reelles de PTA et
  exposition mediane pour maintien (pointille) et posologie comparee (continu).
  Changer les hypotheses du moteur invalide aussi les courbes renvoyees au site.
- Indices : %T > k x CMI sur un intervalle, AUC0-24/CMI, Cmax/CMI sur un intervalle.
  Choix concentration totale/libre, fraction libre constante modifiable.
- Interpretation de l'historique TDM sur la fenetre disponible, au maximum 24 h.
  Une fenetre incomplete ne devient jamais une AUC24 par extrapolation lineaire.
- PTA populationnelle (OMEGA) ou probabilite posterieure apres TDM, avec model
  averaging selon les poids de l'analyse. Covariables courantes fixes. Pas de
  bruit de mesure ajoute aux profils physiologiques. Une covariance posterieure
  absente/non definie positive bloque les probabilites, pas l'interpretation
  ponctuelle de l'historique.
- Courbes PTA/CMI, sensibilite CMI/2 et 2 x CMI, exposition mediane/p5-p95,
  export CSV et rapport HTML autonome. Les modifications des hypotheses
  invalident les resultats anterieurs.

## EUCAST

Consultation explicite depuis Shiny : liste publique des antimicrobiens,
distribution par espece, effectifs, ECOFF/TECOFF, lien officiel et date d'acces.
Le connecteur `R/eucast.R` lit les tableaux HTML publics de
<https://mic.eucast.org/search/>. Aucune API JSON stable n'a ete identifiee.
Une recherche combinee antimicrobien + espece n'est pas prise en charge par
ce formulaire : le connecteur charge les pages du seul antimicrobien choisi,
puis permet de choisir une espece parmi les lignes recues.

Garde-fous : HTTPS et hote fixes, identifiant numerique issu du catalogue,
aucune URL fournie par l'utilisateur, aucun suivi de redirection, delai 12 s
par requete, taille maximale 5 Mo et pagination bornee a 10 pages. Le parseur
verifie les colonnes, effectifs entiers et concordance avec le total annonce.
En cas d'echec, aucune distribution partielle ou valeur de remplacement n'est
affichee. Pas de collecte planifiee ou de copie de la base dans Git.

Ces distributions sont agregees, non locales : elles ne mesurent pas un taux
de resistance. ECOFF/TECOFF ne sont pas les seuils cliniques S/I/R. Les classes
extremes peuvent inclure des observations censurees : pas de CFR/couverture
empirique derivee de ces effectifs dans cette version. La CMI patient reste
une saisie distincte. Son ancien selecteur d'origine a ete retire, sans deduire
automatiquement une CMI patient depuis un ECOFF.

## Methodes Et Limites

Le moteur reutilise `simulate_model_distribution` de l'app TDM. L'option
`return_profiles` permet d'evaluer toutes les CMI sur les memes trajectoires,
sans relancer les simulations pour chaque CMI. Les anciens appels gardent
leurs valeurs par defaut. La PK deterministe du selecteur PD ne fournit pas
l'incertitude : le modele original avec OMEGA est recharge pour les PTA.

Toutes les posologies utilisent les memes allocations de modeles et graines
aleatoires. Les intervalles de Wilson a 95 % autour des PTA quantifient
seulement l'erreur Monte Carlo. Ils ne quantifient ni l'incertitude de fu/CMI,
ni l'erreur structurelle du modele, ni sa validite externe. Le modele doit
avoir une variabilite interindividuelle non nulle. Les ETA experimentaux
modifies par ML ne remplacent pas un posterior MAP dans ce module.

Integration trapezoidale et franchissements de seuil par interpolation
lineaire ; les deux cotes des evenements instantanes sont conserves dans
les indices. Cmax et %T restent sensibles au pas temporel. Les courbes
descriptives d'exposition prennent le cote post-dose aux temps dupliques.
Budget maximal de 3 millions de points par posologie, 12 millions par grille,
24 candidats et 50-1000 tirages. La table est ordonnee par atteinte du seuil
PTA puis dose quotidienne croissante : ce tri exploratoire ne compare ni
toxicite ni benefice clinique et ne constitue pas une recommandation.

Aucun modele de toxicite, d'inoculum, de site infectieux, d'emergence de
resistance, de destruction bacterienne ou d'effet post-antibiotique. Aucune
recommandation automatique. Les valeurs par defaut sont des exemples,
sans selection automatique d'une cible clinique ou d'une fraction libre.
PTA n'est pas probabilite de guerison. Les scenarios futurs sont stationnaires,
sans transition d'une ancienne posologie ou dose de charge.

## Sources

- Mouton et al., 2005. Definitions PK/PD, PTA et CFR.
  <https://doi.org/10.1093/jac/dki079>.
- Drusano et al., 2002. Exemple primaire de selection de dose par PK
  populationnelle et Monte Carlo pour un antiviral, pas une cible antibiotique.
  <https://doi.org/10.1128/AAC.46.3.913-916.2002>.
- Drusano et al., 2004. Relation AUC/CMI et eradication microbiologique
  dans la pneumonie nosocomiale. Pas une cible universelle.
  <https://doi.org/10.1086/383320>.
- EUCAST : <https://mic.eucast.org/> (donnees et avertissements consultes
  le 16 septembre 2026). La date effective est affichee a chaque consultation.

Aucun PDF prive, poster, patient ou code personnel ajoute au depot. Les
donnees sont en memoire de session, hors export volontaire. Les requetes
EUCAST ne contiennent jamais les doses, observations, covariables ou modeles.

## Verification

```powershell
Rscript tdm-engine/tests/infection_test.R
Rscript tdm-engine/tests/pd_bayesian_test.R
Rscript tdm-engine/tests/pd_pk_test.R
Rscript tdm-engine/tests/workshop_pk_test.R
node scripts/test_workshop_pk.mjs
node scripts/test_workshop_curves.mjs
# Verification reseau explicite, aucune distribution sauvegardee :
Rscript tdm-engine/tests/infection_test.R --eucast-live
npm run check
```

Tests navigateur : `tests/e2e/infection.spec.js`, avec `LABS_E2E_URL`,
`INFECTION_SITE_URL` (origine et base sans slash final), et
`TDM_ENGINE_E2E_URL` pour le moteur local. Le site doit etre demarre avec
`PUBLIC_TDM_ENGINE_URL` pointant sur ce meme moteur.

Avant tout usage clinique : revue des unites et sorties de chaque modele,
validation numerique/externe, bibliographie des cibles par population et
site infectieux, revue reglementaire. Publier le site ne publie pas Shiny.
