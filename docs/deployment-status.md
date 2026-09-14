# Local / publication - 2026-09-14

## Publication Des Ateliers Autorisee

La revue locale est terminee. L'utilisateur demande maintenant le commit et
la publication Pages des routes Translator, PK, PD, DDI et Advanced, de leurs
blocs specialises et de la memoire temporaire de navigation. La reference
publique avant cette publication est `02ad523` (quatre laboratoires publies).
Le resultat du workflow et le controle du site seront consignes apres le push.
Le deploiement Shiny n'est pas inclus dans cette publication.

Les anciens chemins `/lego/`, `/interactions/` et `/pharmacodynamie/` restent
utilisables. Les messages vers R restent `pk-lego-model` et `pk-workbench` :
aucune nouvelle ouverture de la compilation C++ arbitraire et aucun changement
des modeles de bibliotheque ou de l'entrainement ML. La revision Advanced ajoute
un contrat Lego v4 et sa validation/regeneration dans `R/model_library.R`.
Le moteur public ne recoit pas ces changements tant qu'il n'est pas redeploye.

Controles locaux : build, verifications de contenu et des importeurs, scenarios
numeriques des laboratoires, tests navigateur ordinateur/mobile, conservation
des covariables et absence de stockage navigateur des brouillons. Les essais
Shiny confirment les transferts PD/oncologie/DDI et l'import JSON ; un modele
genere dans PK a ete compile puis simule en PD avec le C++ arbitraire desactive.
Ces controles techniques ne constituent pas une validation clinique.

Resultats de la premiere reorganisation du 2026-09-14 : 0 erreur et 0 avertissement Svelte ; build reussi ;
50 tests navigateur du site et des ateliers passes, plus 5 tests d'integration
des ateliers avec Shiny local. Le serveur de revue `http://127.0.0.1:4175/pk/`
a egalement ete teste, avec le moteur local sur `http://127.0.0.1:3841/`.

Revision suivant la revue utilisateur : choix redondants retires de PD,
oncologie et DDI ; PK de base IV 1 compartiment ; Advanced devient un graphe
unique avec TGI et interaction. Le serveur de revue 4175 ouvre desormais le
moteur mis a jour sur `http://127.0.0.1:3842/`, C++ arbitraire desactive.
Verification numerique : neuf exports mrgsolve compares au generateur R
securise, avec controles des limites sans traitement et rejet des liens
invalides. MLXTRAN et NONMEM : generation et restauration du graphe controlees,
pas d'execution native Monolix/NONMEM. Les calendriers de deux medicaments
independants restent dans l'atelier DDI.

Controles de cette revision : build statique reussi, 18 tests navigateur du
site et des traductions passes, 6 parcours Shiny locaux passes (dont compilation
du graphe Advanced v4), regressions de compilation securisee KOKA/PP6M passees.
Les neuf modeles mrgsolve de test concordent entre export et regeneration R ;
le graphe compose concorde aussi avec les valeurs finales du navigateur.
Les avertissements de build sur gray-matter et la taille des anciens bundles
restent presents. Aucun test Monolix/NONMEM natif n'a ete execute.

Tests numeriques reproductibles :
`node scripts/test_advanced_blocks.mjs`, puis
`tdm-engine/tests/advanced_lego_test.R` apres generation des fixtures par
`tests/e2e/advanced-blocks.spec.js`. Les fixtures sont des exemples synthetiques
dans `test-results/`, hors suivi Git.

## Site public

Le lot precedent `d638246`, apres `f2a72e3`, a publie : navigation par objectif,
mode enseignant, continuite entre outils et deux laboratoires Distribution /
Accumulation, puis options regroupees, suivi/sonde decoches, animation cochee et
courbe semi-log sous la courbe lineaire. Le PNG contient les deux courbes.

[Deploiement reussi](https://github.com/rberrah/rberrah.github.io/actions/runs/34762733686).
Les neuf tests navigateur ont passe sur
[le site public](https://rberrah.github.io/pharmacometrie/laboratoires/?lang=fr).

## Moteur Shiny

[Le moteur public](https://tdmhub.shinyapps.io/MIPD_Engine/) repond HTTP 200 apres
son reveil. Son HTML contient encore l'acquittement client `pk-lego-model-ack`,
sans gestionnaire `teaching-lab-ack` ni entree `teaching_lab_import`.

Les differences R depuis la reference de deploiement `0bf97dc` sont :

- `R/teaching_lab.R` : validation et regeneration du modele pedagogique, calendrier
  complet des bolus et premiere dose majoree.
- `app.R` : import du calendrier dans une nouvelle session sans observations et
  acquittement serveur correle, au lieu de confirmer uniquement la reception JS.
- `R/model_library.R` : nombres exportes avec 15 chiffres significatifs pour
  ne pas arrondir les petits taux a zero.
- Tests de regression associes. Aucun changement du ML dans ce lot.

Ces sources R sont deja sur GitHub, mais cette publication Pages ne redeploie
pas Shiny. L'absence du nouveau bridge est verifiee sur le service ; le contenu
integral du bundle distant n'a pas ete compare octet par octet. Aucun deploiement
Shiny n'a ete lance pendant cette intervention.

## Publication suivante

Deux laboratoires supplementaires, Absorption orale / biodisponibilite et
Perfusion IV / arret, rejoignent le lot Pages a la demande de l'utilisateur.
Le bouton Particule suivante est retire de tous les laboratoires, sans supprimer
la selection directe ni son equivalent clavier. Les nouveaux laboratoires incluent les animations,
reference, deux courbes, bilans, reperes PK, partage enseignant et exports.

Leur transfert vers Lego est pris en charge. Le transfert direct vers TDM, DDI
et PD est explicitement desactive en attendant verification du contrat de voie
et de calendrier. Aucune donnee patient ni aucun PDF institutionnel n'intervient.

Verification finale locale : check Svelte sans erreur/avertissement, build et
tests de contenu reussis ; 14 tests navigateur ; 21 scenarios numeriques et
42 comparaisons de courbes mrgsolve (deux formulations par scenario). Captures
ordinateur/mobile et francais/sombre inspectees. Ces controles logiciels ne
constituent pas une validation clinique ou pedagogique externe.
